/**
 * A LEITURA INDIVIDUAL DO TARÔ RECEBE A FICHA DA FONTE.
 *
 * POR QUE EXISTE. A camada `tarot-referencia.ts` foi construída para tapar um
 * buraco medido — 40 leituras em que o tarô entregava referência para 3,0 das
 * 10 cartas e ZERO invertidas tinham suporte textual sobre inversão — e foi
 * ligada em dois dos três consumidores: a síntese (`references.ts`) e a tiragem
 * do dia (`prompt-tiragem-dia.ts`). A leitura individual da consulta ficou de
 * fora, e nenhum dos 29 verificadores do prebuild olhava para ela. Medido em
 * 25/10, nas 14 tiragens congeladas: 70 de 70 invertidas chegavam ao modelo sem
 * uma linha sobre o que inversão significa, e em 18 delas a fonte dizia
 * "Similar." — a inversão não muda nada — com o rótulo "invertida" na tela.
 *
 * Este verificador cobra que a ligação não caia de novo. Duas metades:
 *
 *  A–C  o DADO: a ficha existe, cobre as 10 cartas sorteadas, traz a reversão
 *       daquela carta e sabe dizer de qual carta é. Exercita produção.
 *  D–E  a LIGAÇÃO em `app/consultas/route.ts`: a ficha entra na evidência, com
 *       `about` (sem o rótulo as 10 fichas chegam anônimas e o modelo adivinha
 *       o pareamento), o método carrega a regra de reversão da fonte, e o guia
 *       do sistema manda dizer o que a inversão desloca NESTA carta.
 *
 * O que ele NÃO cobre: a qualidade do texto que o modelo escreve. Isso é
 * bateria paga, não verificador.
 *
 * Nenhuma chamada paga: a ficha é um módulo e a ligação é lida do código.
 */
import fs from "fs"
import path from "path"
import { drawAll, TAROT_DECK } from "../lib/oracles/draw"
import { renderDraw } from "../lib/oracles/localize"
import { fichaDaCarta, referenciaDoTarot, trechoDaCarta, REVERSAO_METODO } from "../lib/oracles/tarot-referencia"
import { BENDOV_CARTAS } from "../lib/oracles/bendov-cartas"
import { COBERTURA_MAXIMA, MINIMO_DE_PALAVRAS_SEGUIDAS, MINIMO_PARA_JULGAR, eTranscricao, fonteDaCarta, medeCopia } from "../lib/oracles/transcricao"
import { LOCALES, type Locale } from "../lib/i18n/config"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

// Os 14 seeds da bateria de 25/10, que juntos trazem 70 invertidas, as 18
// "Similar." e o Arcano VI nas duas orientações.
const SEEDS = [
  "fase10:216", "fase10:26", "fase10:31", "fase10:11", "fase10:65", "fase10:10", "fase10:20",
  "fase10:256", "fase10:594", "fase10:37", "fase10:2", "fase10:52", "fase10:306", "fase10:15",
]

const ROTA = path.join(process.cwd(), "app", "consultas", "route.ts")
const fonte = fs.readFileSync(ROTA, "utf8")

/** Como `oraclePrompt` monta o cabeçalho de cada trecho. Se mudar lá, muda aqui. */
const FORMATO_DO_CABECALHO = '`Fonte ${i + 1}${e.about ? ` — sobre "${e.about}"` : ""} (${e.source}): ${e.excerpt}`'

// ── A · a ficha cobre as 10 cartas de cada tiragem ────────────────────────
function parteA() {
  for (const seed of SEEDS) {
    const itens = drawAll(seed).tarot.items
    const ev = referenciaDoTarot(itens, "pt")
    confere(`A · ${seed}: uma ficha por carta sorteada`, ev.length === 10, `${ev.length} de 10`)
    const indices = ev.map((e) => e.itemIndex).sort((a, b) => (a as number) - (b as number))
    confere(`A · ${seed}: itemIndex de 0 a 9, sem repetir`, JSON.stringify(indices) === JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), JSON.stringify(indices))
    confere(`A · ${seed}: nenhum trecho vazio`, ev.every((e) => e.excerpt.trim().length > 20))
  }
}

// ── B · a invertida chega com a reversão, e a "Similar." é dita como tal ──
function parteB() {
  const RÓTULO: Record<Locale, { inv: string; sem: string }> = {
    pt: { inv: "invertida:", sem: "permanece semelhante" },
    en: { inv: "reversed:", sem: "stays similar" },
    es: { inv: "invertida:", sem: "permanece similar" },
  }
  let invertidas = 0, similares = 0
  for (const locale of LOCALES) {
    for (const seed of SEEDS) {
      const itens = drawAll(seed).tarot.items
      const ev = referenciaDoTarot(itens, locale)
      for (const e of ev) {
        const sym = itens[e.itemIndex as number].sym as { card: number; reversed: boolean }
        const ficha = fichaDaCarta(TAROT_DECK[sym.card].name)!
        if (!sym.reversed) {
          confere(`B · ${locale} ${seed}: carta de pé não recebe rótulo de inversão`, !e.excerpt.includes(RÓTULO[locale].inv), e.excerpt.slice(0, 60))
          continue
        }
        if (locale === "pt") invertidas += 1
        confere(`B · ${locale} ${seed}: invertida traz a reversão`, e.excerpt.includes(RÓTULO[locale].inv), `${TAROT_DECK[sym.card].name}: ${e.excerpt.slice(0, 70)}`)
        if (ficha.invertida_similar) {
          if (locale === "pt") similares += 1
          confere(
            `B · ${locale} ${seed}: "Similar." é dita como semelhança, não como sentido novo`,
            e.excerpt.includes(RÓTULO[locale].sem),
            `${TAROT_DECK[sym.card].name}: ${e.excerpt.slice(-80)}`
          )
        }
      }
    }
  }
  // o número é o próprio diagnóstico de 25/10; cai aqui se o sorteio mudar
  confere("B · os 14 seeds continuam trazendo 70 invertidas", invertidas === 70, String(invertidas))
  confere('B · delas, 18 são cartas em que a fonte diz "Similar."', similares === 18, String(similares))
}

// ── C · a ficha sabe de que carta é ───────────────────────────────────────
function parteC() {
  for (const locale of LOCALES) {
    for (const seed of SEEDS.slice(0, 4)) {
      const d = drawAll(seed).tarot
      const r = renderDraw(d, locale)
      const ev = referenciaDoTarot(d.items, locale)
      const rotulos = ev.map((e) => r.items[e.itemIndex as number]?.name)
      confere(`C · ${locale} ${seed}: todo trecho tem nome de carta para o about`, rotulos.every((n) => typeof n === "string" && n.length > 2), JSON.stringify(rotulos))
      confere(`C · ${locale} ${seed}: o about é o nome que a pessoa vê, na ordem das posições`, JSON.stringify(rotulos) === JSON.stringify(r.items.map((it) => it.name)))
    }
  }
}

// ── D · a ligação existe em app/consultas/route.ts ────────────────────────
function parteD() {
  confere("D · a rota importa a ficha do tarô", /import\s*\{[^}]*referenciaDoTarot[^}]*\}\s*from\s*["']@\/lib\/oracles\/tarot-referencia["']/.test(fonte))
  confere("D · a rota importa a regra de reversão", /import\s*\{[^}]*REVERSAO_METODO[^}]*\}\s*from\s*["']@\/lib\/oracles\/tarot-referencia["']/.test(fonte))
  confere("D · a ficha entra na evidência do tarô", /k === "tarot"[\s\S]{0,400}referenciaDoTarot\(/.test(fonte))
  confere(
    "D · cada ficha recebe about (sem ele as 10 chegam anônimas)",
    /referenciaDoTarot\([\s\S]{0,200}about:\s*r\.items\[/.test(fonte),
    "esperado `.map((e) => ({ ...e, about: r.items[e.itemIndex as number]?.name }))`"
  )
  confere("D · a ficha vem ANTES do trecho lexical", /evidence\s*=\s*\[\s*\.\.\.fichas\s*,\s*\.\.\.evidence\s*\]/.test(fonte))
  confere(
    "D · o método passado ao prompt carrega a regra de reversão",
    /k === "tarot"\s*\?\s*`\$\{meta\.method\}\.\s*\$\{REVERSAO_METODO\[locale\]\}`/.test(fonte)
  )
  confere("D · o prompt é montado com esse método, não com meta.method", /oraclePrompt\(k,\s*labels\[k\],\s*method,/.test(fonte))
  // se o formato do cabeçalho mudar, `about` pode deixar de ser lido sem que nada quebre
  confere(
    "D · oraclePrompt continua rotulando o trecho com about",
    fonte.includes(FORMATO_DO_CABECALHO),
    "o cabeçalho de `Fonte N` mudou em oraclePrompt: confira se o rótulo da carta ainda chega ao modelo"
  )
}

// ── E · o guia do sistema manda tratar a inversão como a fonte trata ──────
function parteE() {
  const guia = fonte.slice(fonte.indexOf("const SYSTEM_GUIDES"), fonte.indexOf("iching: `I CHING"))
  confere("E · o guia do tarô foi encontrado", guia.length > 100 && guia.includes("Cruz Celta"))
  confere('E · o guia manda dizer o que a inversão desloca NESTA carta', /invers[ãa]o desloca NESTA carta/i.test(guia))
  confere('E · o guia manda repassar a semelhança quando a fonte diz "Similar."', /permanece semelhante/i.test(guia))
  confere('E · o guia nega explicitamente "versão negativa"', /n[ãa]o é "vers[ãa]o negativa"/i.test(guia))
  confere(
    'E · o guia não traz mais o parentético solto "(invertida quando indicado)" no tarô',
    !/significado tradicional da carta i na posi[çc][ãa]o i \(invertida quando indicado\)/.test(guia),
    "o parentético voltou: era ele que deixava a inversão sem instrução"
  )
  for (const locale of LOCALES) {
    confere(`E · a regra de reversão existe em ${locale}`, REVERSAO_METODO[locale].length > 150)
    confere(`E · a regra de reversão em ${locale} diz que inversão não é negativo automático`, /autom[áa]tic/i.test(REVERSAO_METODO[locale]))
  }
}

/**
 * ── F · A TABELA DE DIVERGÊNCIA ───────────────────────────────────────────
 *
 * O problema que esta parte guarda não é de dado nem de ligação: é de leitura.
 * Medido na bateria de 25/10, o modelo escreve o significado do Rider-Waite
 * mesmo com a ficha do Marselha na frente. Cinco de Copas, DE PÉ, virou
 * "tristeza e arrependimento" quando o Ben-Dov diz "Conexões. Popularidade".
 * Oito de Ouros, invertida, virou "falta de dedicação" quando a ficha diz
 * "Trabalho de rotina. Um avanço lento e paciente" e a reversão é "Similar.".
 *
 * Nenhum verificador consegue julgar o texto que o modelo escreve — isso é
 * bateria paga. O que esta parte garante é a condição necessária: nas cartas em
 * que os dois baralhos divergem de verdade, o sentido do MARSELHA chega ao
 * modelo inteiro, nas duas orientações, e não é comido pelo orçamento do
 * trecho. Se este sentido desaparecer do material, a substituição deixa de ser
 * erro de leitura do modelo e passa a ser culpa nossa.
 *
 * `marselha` são palavras da PRÓPRIA ficha, não uma paráfrase. `riderWaite` é
 * só documentação da divergência: nada é testado contra essa coluna, e nenhuma
 * lista de palavras negativas entra aqui. A fidelidade é afirmada pelo que tem
 * de estar presente, nunca pelo que não pode aparecer.
 */
const DIVERGENCIA: Array<{ carta: string; marselha: string[]; riderWaite: string }> = [
  // as seis que a bateria mediu errando
  { carta: "Cinco de Copas", marselha: ["Conexões", "Popularidade"], riderWaite: "luto, arrependimento, as três taças derramadas" },
  { carta: "Oito de Ouros", marselha: ["Trabalho de rotina", "avanço lento e paciente"], riderWaite: "aprendizado, aplicação diligente ao ofício" },
  { carta: "Dez de Ouros", marselha: ["Abundância", "Sucesso material"], riderWaite: "legado e patrimônio familiar" },
  { carta: "Seis de Ouros", marselha: ["Expansão", "bom equilíbrio"], riderWaite: "caridade, desequilíbrio entre dar e receber" },
  { carta: "Nove de Ouros", marselha: ["Motivação", "nicho"], riderWaite: "conforto material solitário" },
  { carta: "Dois de Espadas", marselha: ["Limites que protegem", "visão clara"], riderWaite: "impasse, decisão às cegas" },
  // outras em que a divergência é igualmente forte
  { carta: "Dez de Paus", marselha: ["Lealdade", "perseverança levam ao sucesso"], riderWaite: "fardo, carga pesada demais" },
  { carta: "Três de Espadas", marselha: ["Vitória", "Superando uma oposição fraca"], riderWaite: "coração partido" },
  { carta: "Nove de Espadas", marselha: ["Coragem", "Vencer uma luta contra uma força superior"], riderWaite: "angústia, pesadelo" },
  { carta: "Cinco de Ouros", marselha: ["Ruptura", "Algo novo aparece"], riderWaite: "miséria, exclusão" },
  { carta: "Oito de Espadas", marselha: ["Defesas", "tesouro bem guardado"], riderWaite: "aprisionamento, impotência" },
  { carta: "Cinco de Espadas", marselha: ["Ruptura", "impulso para a frente"], riderWaite: "vitória vazia, humilhação" },
  { carta: "A Torre", marselha: ["Livrar-se de um confinamento", "Progresso repentino"], riderWaite: "catástrofe, o raio sobre a torre" },
  { carta: "O Diabo", marselha: ["explosão de criatividade", "Ironia"], riderWaite: "vício, servidão" },
  { carta: "A Morte", marselha: ["abre espaço para o novo", "manter apenas o essencial"], riderWaite: "fim como perda" },
]

function parteF() {
  for (const d of DIVERGENCIA) {
    const f = fichaDaCarta(d.carta)
    confere(`F · ${d.carta}: a ficha existe`, !!f)
    if (!f) continue
    for (const m of d.marselha) {
      confere(`F · ${d.carta}: a ficha diz "${m}"`, f.base.includes(m), `base: ${f.base.slice(0, 110)}`)
    }
    // o sentido do Marselha tem de SOBREVIVER ao orçamento do trecho, nas duas
    // orientações: é o texto que o modelo recebe, não o campo bruto
    for (const invertida of [false, true]) {
      const t = trechoDaCarta(f, invertida, "pt")
      const sobrevive = d.marselha.filter((m) => t.includes(m))
      confere(
        `F · ${d.carta} ${invertida ? "invertida" : "de pé"}: o sentido do Marselha chega ao modelo`,
        sobrevive.length > 0,
        `nenhuma de [${d.marselha.join(" | ")}] no trecho: ${t.slice(0, 130)}`
      )
      // a reversão não pode empurrar a base inteira para fora do orçamento
      confere(
        `F · ${d.carta} ${invertida ? "invertida" : "de pé"}: a base não é engolida pelo trecho de reversão`,
        t.startsWith(f.base.slice(0, 24)),
        t.slice(0, 80)
      )
    }
    // nas "Similar." o modelo precisa das duas coisas na mesma linha: o sentido
    // da base E a frase dizendo que a inversão não o desloca
    if (f.invertida_similar) {
      const t = trechoDaCarta(f, true, "pt")
      confere(`F · ${d.carta}: "Similar." traz base e semelhança juntas`, t.includes("permanece semelhante") && d.marselha.some((m) => t.includes(m)), t.slice(0, 150))
    }
  }
  const similares = DIVERGENCIA.filter((d) => fichaDaCarta(d.carta)?.invertida_similar).length
  confere("F · a tabela cobre as 15 cartas de divergência forte", DIVERGENCIA.length === 15, String(DIVERGENCIA.length))
  confere('F · entre elas, 8 são "Similar."', similares === 8, String(similares))
}

/**
 * ── G · AS TRÊS REGRAS DE LEITURA ─────────────────────────────────────────
 *
 * T1 (a ficha manda sobre a associação de outro baralho), T2 (invertida não é
 * pedido de contraste) e T3 (tendência, não ordem) nasceram dos três defeitos
 * medidos na bateria. Esta parte cobra que continuem no prompt — e que os
 * exemplos que T1 cita continuem VERDADEIROS: se alguém editar uma ficha, o
 * exemplo do prompt passa a mentir para o modelo, e isso cai aqui.
 */
function parteG() {
  const guia = fonte.slice(fonte.indexOf("tarot: `TARÔ"), fonte.indexOf("iching: `I CHING"))
  confere("G · o guia do tarô foi encontrado", guia.includes("Cruz Celta"))

  confere("G · T1 existe", /T1\. A FICHA DESTA CARTA MANDA/.test(guia))
  confere("G · T1 nomeia o Rider-Waite, que é de onde vêm as associações medidas", /Rider-Waite/.test(guia))
  confere("G · T1 diz que sentido fora da ficha não está na carta", /se o sentido não está na ficha, não está na carta/.test(guia))
  confere("G · T1 proíbe atribuir bloqueio, escassez, perda ou fracasso por associação externa", /bloqueio, escassez, perda nem fracasso/.test(guia))
  confere("G · T1 preserva o relacionamento entre cartas e proíbe transcrever", /Relacionar as cartas entre si/.test(guia) && /transcrever a ficha, não/.test(guia))

  // os exemplos de T1 têm de casar com as fichas de verdade
  for (const [carta, trecho] of [
    ["Cinco de Copas", "conexões e popularidade"],
    ["A Torre", "romper um confinamento"],
    ["Oito de Ouros", "trabalho de rotina e avanço paciente"],
  ] as Array<[string, string]>) {
    confere(`G · T1 cita ${carta}`, guia.includes(trecho), `esperado "${trecho}" no guia`)
    const f = fichaDaCarta(carta)!
    const chave = trecho.split(" e ")[0].split(" ").slice(-2).join(" ")
    confere(
      `G · o exemplo de ${carta} em T1 continua verdadeiro na ficha`,
      new RegExp(chave.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(f.base),
      `"${chave}" não está em: ${f.base.slice(0, 110)}`
    )
  }

  confere("G · T2 existe", /T2\. INVERTIDA NÃO É PEDIDO DE CONTRASTE/.test(guia))
  confere("G · T2 manda ler o sentido-base quando a fonte diz que permanece semelhante", /permanece semelhante[\s\S]{0,120}sentido-base/.test(guia))
  confere("G · T2 preserva a dificuldade que a base ou o contexto sustentam", /continua podendo pesar/.test(guia))
  confere("G · T2 nega que a inversão sozinha justifique acrescentar dificuldade", /inversão, sozinha, nunca é a razão/.test(guia))

  // C1 — a regra de não transcrever, em frase própria (era subordinada em T1 e
  // não resistiu: 10 de 10 significados copiados na tiragem com 9 invertidas)
  confere("G · T1b existe, como regra própria", /T1b\. CADA "meanings\[i\]" É SEU TEXTO, NÃO A FICHA/.test(guia))
  confere("G · T1b manda escrever a interpretação daquela carta naquela posição", /interpretação daquela carta NAQUELA posição/.test(guia))
  confere("G · T1b proíbe copiar trechos extensos e enfileirar as frases da ficha", /não copie trechos extensos/.test(guia) && /não enfileire as frases da ficha/.test(guia))
  confere("G · T1b preserva o uso do termo próprio da tradição", /Um termo próprio da tradição pode e deve ser usado/.test(guia))
  confere("G · T1b avisa que a cópia é descartada", /será descartada antes de chegar à pessoa/.test(guia))

  confere("G · T3 existe", /T3\. TENDÊNCIA SUSTENTADA, NÃO ORDEM/.test(guia))
  // C2 — a regra não prescritiva vale nos dois campos, e a armadilha é nomeada
  confere('G · T3 vale em "meanings" E em "reading"', /Isto vale em "meanings" E em "reading"/.test(guia))
  confere("G · T3 nomeia a pergunta formulada como pedido de conselho", /o que preciso considerar/.test(guia))
  confere("G · T3 diz como responder essa pergunta: nomeando os fatores", /responda NOMEANDO os fatores que pesam/.test(guia))
  confere("G · T3 manda responder sem evasão (não torna o tarô evasivo)", /sem evasão/.test(guia) && /sem empatar de propósito/.test(guia))
  confere("G · T3 distingue tendência de instrução", /tendência da situação, não como instrução/.test(guia))
  // "você deve" foi a forma exata que vazou nos casos 1, 6 e 10 da bateria
  for (const forma of ["você deve", "procure", "evite", "espere", "mantenha", "avalie", "busque", "reflita"]) {
    confere(`G · T3 proíbe a forma "${forma}"`, guia.includes(`"${forma}"`), "a lista de formas de ordem perdeu um item")
  }
  confere("G · T3 separa possibilidade condicional sustentada de condição acrescentada", /Possibilidade condicional vale quando o símbolo a sustenta/.test(guia))

  // a regra 10 do prompt comum continua de pé: T3 reforça, não substitui
  confere("G · a regra 10 (descrever, não prescrever) continua no prompt", /10\) DESCREVER, NÃO PRESCREVER/.test(fonte))
}

/**
 * ── H · O DETECTOR DE TRANSCRIÇÃO ─────────────────────────────────────────
 *
 * Esta é a única parte que olha TEXTO PRODUZIDO, e é por isso que existe: as
 * partes D a G cobram que a regra esteja no prompt, e regra de prompt é pedido.
 * `eTranscricao` roda em produção sobre o que o modelo devolveu, e aqui ela é
 * exercitada contra as 78 fichas e contra texto real das baterias de 24 e 25/10.
 *
 * As amostras negativas são as de MAIOR cobertura entre as legítimas (20–40%),
 * porque são as que correm risco de serem acusadas por engano. As positivas são
 * cópias reais que a bateria devolveu — e o texto delas é a própria ficha, que
 * já está versionada em `bendov-cartas.ts`.
 */
function parteH() {
  confere("H · o mínimo de palavras seguidas é 5, como medido", MINIMO_DE_PALAVRAS_SEGUIDAS === 5, String(MINIMO_DE_PALAVRAS_SEGUIDAS))
  confere("H · a cobertura máxima é 40%, como medido", COBERTURA_MAXIMA === 0.4, String(COBERTURA_MAXIMA))

  // 1. A FICHA INTEIRA, USADA COMO SAÍDA, TEM DE SER PEGA — nas 78 cartas.
  const baseEscapou = BENDOV_CARTAS.filter((f) => !eTranscricao(f.base, fonteDaCarta(f.base, null)))
  confere(
    "H · a base de cada uma das 78 fichas, copiada inteira, é detectada",
    baseEscapou.length === 0,
    baseEscapou.map((f) => `${f.carta} (${medeCopia(f.base, f.base).palavras}p)`).join(", ")
  )
  // A reversão também — exceto a única curta demais para ser julgada. Esta é
  // uma ISENÇÃO DELIBERADA, não uma falha tolerada: "Conservadorismo. Seguir
  // padrões antigos e ultrapassados." tem 6 palavras, abaixo do piso de 8, e
  // baixar o piso para pegá-la passaria a acusar interpretação curta legítima.
  // Fica nomeada para que mudar o piso ou a ficha caia aqui.
  const comReversao = BENDOV_CARTAS.filter((f) => !f.invertida_similar)
  const longaBastante = comReversao.filter((f) => medeCopia(f.invertida, f.invertida).palavras >= MINIMO_PARA_JULGAR)
  const revEscapou = longaBastante.filter((f) => !eTranscricao(f.invertida, fonteDaCarta(f.base, f.invertida)))
  confere(
    `H · a reversão de cada uma das ${longaBastante.length} fichas julgáveis, copiada inteira, é detectada`,
    revEscapou.length === 0,
    revEscapou.map((f) => f.carta).join(", ")
  )
  const curtas = comReversao.filter((f) => medeCopia(f.invertida, f.invertida).palavras < MINIMO_PARA_JULGAR)
  confere(
    "H · só uma reversão das 62 fica abaixo do piso, e é Quatro de Ouros",
    curtas.length === 1 && curtas[0].carta === "Quatro de Ouros",
    curtas.map((f) => `${f.carta} (${medeCopia(f.invertida, f.invertida).palavras}p)`).join(", ")
  )
  confere("H · nenhuma BASE das 78 fica abaixo do piso", BENDOV_CARTAS.every((f) => medeCopia(f.base, f.base).palavras >= MINIMO_PARA_JULGAR))
  // e a ficha com o nome da carta na frente, que é a forma que a bateria devolveu
  const comPrefixo = BENDOV_CARTAS.filter((f) => !eTranscricao(`${f.carta}: ${f.base}`, fonteDaCarta(f.base, null)))
  confere("H · a cópia com o nome da carta na frente também é detectada", comPrefixo.length === 0, comPrefixo.map((f) => f.carta).join(", "))

  // 2. INTERPRETAÇÃO FIEL NÃO PODE SER ACUSADA. Texto real das baterias, as
  //    amostras de maior cobertura entre as legítimas.
  // COPIADAS LITERALMENTE das baterias, sem uma palavra alterada. Reescrever a
  // amostra para ela passar seria fraudar o teste: na primeira versão deste
  // arquivo eu reconstruí a de O Louco de memória, ela mediu 41% em vez dos 36%
  // reais e o verificador reprovou — corretamente.
  const LEGITIMAS: Array<[string, string, string]> = [
    // [carta, o que o modelo escreveu, de onde a amostra veio]
    ["A Torre", "A Torre representa a ruptura de estruturas sólidas e um progresso repentino após longas preparações.", "D caso 6"],
    ["Dez de Espadas", "O Dez de Espadas representa exaustão e uma situação complexa, refletindo uma longa batalha sem um resultado claro, o que pode estar relacionado ao que você evita encarar.", "C2 caso 12"],
    ["O Louco", "O Louco invertido sugere dificuldade em escolher e se comprometer com algo estável, refletindo inquietação e falta de propósito que pode estar bloqueando sua confiança.", "C2 caso 9"],
    ["Cinco de Espadas", "Cinco de Espadas invertida: Um impulso para frente que supera limites. A inversão pode indicar uma iniciativa que não leva a lugar nenhum.", "D caso 3"],
    ["Oito de Ouros", "Oito de Ouros sugere que o consulente se vê trabalhando de forma metódica e paciente para melhorar a situação, focando em aspectos práticos.", "C2 caso 5"],
    ["Cinco de Copas", "Cinco de Copas: Conexões e popularidade. A carta indica a importância das relações e como elas influenciam a situação atual.", "D caso 3"],
  ]
  for (const [carta, texto, origem] of LEGITIMAS) {
    const f = fichaDaCarta(carta)!
    const invertida = /invertid/i.test(texto) && !f.invertida_similar
    const m = medeCopia(texto, fonteDaCarta(f.base, invertida ? f.invertida : null))
    confere(
      `H · não acusa interpretação fiel · ${carta} (${origem})`,
      !eTranscricao(texto, fonteDaCarta(f.base, invertida ? f.invertida : null)),
      `cobertura ${(m.cobertura * 100).toFixed(0)}%, maior sequência ${m.maiorSequencia}`
    )
  }

  // 3. AS CÓPIAS REAIS DA BATERIA. O texto é a própria ficha.
  for (const [carta, invertida] of [["Três de Paus", true], ["Seis de Ouros", true], ["Dois de Ouros", true], ["Rei de Espadas", false]] as Array<[string, boolean]>) {
    const f = fichaDaCarta(carta)!
    // o que a bateria devolveu nestas posições foi a base, com ou sem prefixo
    const texto = invertida ? f.base : `${carta}: ${f.base}`
    const m = medeCopia(texto, fonteDaCarta(f.base, invertida && !f.invertida_similar ? f.invertida : null))
    confere(
      `H · detecta a cópia real do caso 9/10 · ${carta}`,
      eTranscricao(texto, fonteDaCarta(f.base, invertida && !f.invertida_similar ? f.invertida : null)),
      `cobertura ${(m.cobertura * 100).toFixed(0)}%`
    )
  }

  // 4. A FRASE DE "Similar." É NOSSA, e o prompt manda repassá-la: dizer que a
  //    inversão não desloca o sentido NUNCA pode ser acusado de cópia.
  for (const carta of ["Dez de Paus", "Dois de Espadas", "Seis de Ouros"]) {
    const f = fichaDaCarta(carta)!
    const texto = `${carta} invertida: a inversão não desloca o sentido desta carta, que permanece semelhante ao da posição normal nesta leitura.`
    confere(`H · não acusa quem repassa a semelhança de "Similar." · ${carta}`, !eTranscricao(texto, fonteDaCarta(f.base, null)))
  }

  // 5. BORDAS
  confere("H · texto curto nunca é acusado", !eTranscricao("Lealdade e perseverança.", fonteDaCarta(fichaDaCarta("Dez de Paus")!.base, null)))
  confere("H · fonte vazia nunca acusa", !eTranscricao("Um texto qualquer com algumas palavras para medir.", ""))
  confere("H · texto vazio não quebra", medeCopia("", "qualquer coisa").cobertura === 0)
  confere("H · acentuação e pontuação não escapam da detecção", eTranscricao(
    fichaDaCarta("Três de Paus")!.base.toUpperCase().replace(/\./g, " --- "),
    fonteDaCarta(fichaDaCarta("Três de Paus")!.base, null)
  ))
  // a cobertura é de palavras do texto, não soma de trechos
  const f10 = fichaDaCarta("Dez de Paus")!
  confere("H · a medida é fração do texto, entre 0 e 1", (() => {
    const m = medeCopia(f10.base, fonteDaCarta(f10.base, null))
    return m.cobertura > 0.99 && m.cobertura <= 1
  })())
}

/**
 * ── I · O DESCARTE ESTÁ LIGADO, E É SEGURO ────────────────────────────────
 *
 * Detectar sem tratar não resolve. Esta parte cobra que o descarte exista na
 * rota, que seja POR CARTA, que o `reading` sobreviva e que nada seja gerado
 * nem recomprado para ocupar o lugar.
 */
function parteI() {
  confere("I · a rota importa o detector", /import\s*\{[^}]*eTranscricao[^}]*\}\s*from\s*["']@\/lib\/oracles\/transcricao["']/.test(fonte))
  confere("I · a rota importa a ficha para montar a fonte comparável", /import\s*\{[^}]*fichaDaCarta[^}]*\}\s*from\s*["']@\/lib\/oracles\/tarot-referencia["']/.test(fonte))
  confere("I · o descarte roda só no tarô", /if \(meaning && k === "tarot"\)/.test(fonte))
  confere("I · a reversão só entra quando a carta saiu invertida e a fonte dá reversão própria", /sym!\.reversed && !ficha\.invertida_similar \? ficha\.invertida : null/.test(fonte))
  confere("I · o significado copiado vira undefined", /if \(eTranscricao\([\s\S]{0,160}meaning = undefined/.test(fonte))
  confere("I · o descarte é registrado no log do servidor", /significados descartados por transcrever a ficha/.test(fonte))

  // SEGURANÇA: o descarte não pode virar nova compra nem matar a leitura
  confere(
    "I · o detector NÃO entra em isUsable (não dispara a segunda chamada paga)",
    !/isUsable[\s\S]{0,400}eTranscricao/.test(fonte) && !/function isUsable[\s\S]{0,300}transcri/i.test(fonte)
  )
  const corpoUsable = fonte.slice(fonte.indexOf("function isUsable"), fonte.indexOf("function isUsable") + 320)
  confere("I · isUsable continua olhando só reading e meanings", /typeof parsed\.reading === "string"/.test(corpoUsable) && /Array\.isArray\(parsed\.meanings\)/.test(corpoUsable))
  confere(
    "I · o reading é preservado: o descarte não o toca",
    /reading: parsed\.reading\.trim\(\)/.test(fonte) && !/reading = undefined/.test(fonte)
  )
  confere("I · nada é gerado para ocupar o lugar do significado descartado", !/meaning = `/.test(fonte) && !/meaning = ".+"/.test(fonte))
  confere("I · nenhum ConsultaError novo por transcrição", !/ConsultaError\([^)]*transcri/i.test(fonte))

  // a interface tem de ter o que mostrar na carta sem legenda
  const foco = fs.readFileSync(path.join(process.cwd(), "components", "focus-card.tsx"), "utf8")
  confere("I · a interface trata a carta sem significado", /item\.meaning\?\.trim\(\)/.test(foco) && /t\.none/.test(foco))

  // E A PROMESSA TEM DE FECHAR. `live` faz o verso prometer que o significado
  // chega quando o oráculo terminar de escrever — verdade só na janela entre o
  // evento "draw" e o evento "oracles". Vinha de `animate`, que é a flag da
  // distribuição das cartas e continua ligada depois; com o descarte, as dez
  // cartas da tiragem de 9 invertidas prometiam para sempre um texto que não
  // vem mais. Conferido na bancada: salva e concluída dizem que a leitura não
  // guardou significado; só a janela do sorteio promete.
  const spread = fs.readFileSync(path.join(process.cwd(), "components", "tarot-spread.tsx"), "utf8")
  confere("I · o verso não promete a partir de `animate`", !/live=\{animate\}/.test(spread), "live={animate} voltou: a promessa não fecha mais")
  confere("I · o verso promete a partir de `pending`", /live=\{pending\}/.test(spread))
  confere("I · TarotSpread aceita `pending`, separado de `animate`", /pending\?: boolean/.test(spread) && /animate = false, pending = false/.test(spread))
  const hero = fs.readFileSync(path.join(process.cwd(), "components", "hero-content.tsx"), "utf8")
  confere(
    "I · a leitura ao vivo só promete enquanto a interpretação não chegou",
    /<TarotSpread[^>]*pending=\{!oracle\?\.reading\}/.test(hero),
    "hero-content precisa passar pending={!oracle?.reading}"
  )
}

parteA()
parteB()
parteC()
parteD()
parteE()
parteF()
parteG()
parteH()
parteI()

if (falhas.length) {
  console.error(`\nA leitura individual do tarô perdeu a fundamentação da fonte: ${falhas.length} de ${conferidos} conferências falharam.\n`)
  for (const f of falhas) console.error(`  ${f}`)
  console.error("")
  process.exit(1)
}
console.log(`leitura individual do tarô: ${conferidos} conferências — ficha nas 10 cartas, reversão rotulada por carta, 70 invertidas e 18 "Similar." nos 14 seeds, ligação e guia em app/consultas/route.ts`)
