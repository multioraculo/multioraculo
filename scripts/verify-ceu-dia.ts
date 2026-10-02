/**
 * Integridade multilíngue da leitura do céu do dia.
 *
 * Nasceu de uma falha real, encontrada em produção em 2026-10-01: as três
 * linhas de `sky_daily` estavam corretamente separadas por idioma e a camada
 * factual saía traduzida certo, mas a `sintese` das linhas `en` e `es` estava
 * gravada em português. Duas causas somadas:
 *
 *  1. o prompt pedia o idioma numa linha e, depois dela, demonstrava a forma
 *     desejada da saída com um exemplo em português. O exemplo venceu;
 *  2. o verificador não olhava idioma, e as duas regras editoriais que ele
 *     aplicava eram regex em português cravadas no arquivo. Para `en` e `es`
 *     elas não casavam com nada, então o texto errado passava limpo e era
 *     gravado na primeira tentativa.
 *
 * Este arquivo cobre as duas, e mais a paridade que faltava:
 *  A. a regra do céu que pede é cobrada nos três idiomas;
 *  B. a esfera de vida inventada é cobrada nos três idiomas;
 *  C. texto correto em PT, EN e ES não dispara nenhuma das duas;
 *  D. o detector de idioma reprova o que está no idioma errado e não reprova
 *     texto curto e legítimo;
 *  E. o PT continua exatamente o que era, e as regras não voltaram a ser
 *     duplicadas dentro de `ceu-do-dia.ts`.
 *
 * Nenhuma chamada paga: `verificarCeu` é função pura, e os fatos saem do
 * cálculo do céu de uma data fixa.
 */
import http from "http"
import type { AddressInfo } from "net"
import { readFileSync } from "node:fs"
import { estadoDoCeu } from "../lib/astro/ceu"
import {
  fatosDoCeu,
  verificarCeu,
  sistemaDoCeu,
  nomesTecnicos,
  minimoDeTermos,
  promptCeuDoDia,
  carregaRetrogradacao,
  EXEMPLOS_RETROGRADACAO,
  type TermoDoCeu,
} from "../lib/astro/ceu-do-dia"
import { ESFERA_DE_VIDA, PEDIDO, idiomaDivergente, nomesExpostos, pedidoDoCeu } from "../lib/astro/editorial"
import { LOCALES, type Locale } from "../lib/i18n/config"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

/** Data fixa: um verificador não pode mudar de resultado conforme o dia. */
const DIA = "2026-10-01"

/**
 * Roda o verificador sobre uma síntese e devolve as violações.
 *
 * Vai sem termos de propósito. As violações de estrutura que isso gera não
 * interessam aqui: cada teste afirma sobre a MENSAGEM que está testando, e
 * assim a prova não depende de montar um payload inteiro válido.
 */
function violacoesDe(sintese: string, locale: Locale): string[] {
  const ceu = estadoDoCeu(DIA)
  const { escolhidos } = fatosDoCeu(ceu, locale)
  const veredito = verificarCeu({ bruto: { termos: [], sintese }, escolhidos, locale })
  return veredito.ok ? [] : veredito.violacoes
}

const pegou = (sintese: string, locale: Locale, marca: string) =>
  violacoesDe(sintese, locale).some((v) => v.startsWith(marca))

// ── A · o céu que pede, nos três idiomas ───────────────────────────────────
// Antes desta correção só o PT era cobrado: a regex vivia dentro de
// `verificarCeu` escrita em português, e para EN e ES não casava com nada.
function parteA() {
  const comPedido: Record<Locale, string[]> = {
    pt: [
      "O movimento exige atenção e o encontro pede firmeza.",
      "A tensão convida à pausa e o dia favorece a espera.",
      "O céu sugere cautela e desafia a pressa.",
    ],
    en: [
      "The movement demands attention and the meeting asks for firmness.",
      "The tension invites a pause and the day favors waiting.",
      "The sky suggests caution and challenges haste.",
    ],
    es: [
      "El movimiento exige atención y el encuentro pide firmeza.",
      "La tensión invita a la pausa y el día favorece la espera.",
      "El cielo sugiere cautela y desafía la prisa.",
    ],
  }
  for (const locale of LOCALES) {
    for (const texto of comPedido[locale]) {
      confere(`A · ${locale}: pedido detectado em "${texto.slice(0, 44)}"`, pegou(texto, locale, "fala como conselho"), "passou sem violação")
    }
  }
}

// ── B · a esfera de vida inventada, nos três idiomas ───────────────────────
// A leitura vale para todas as pessoas: quem escreve não sabe nada sobre quem
// lê, e nomear um domínio da vida inventa um destinatário.
function parteB() {
  const comEsfera: Record<Locale, string[]> = {
    pt: [
      "A firmeza atravessa as relações e o vínculo se refaz.",
      "O movimento toca o trabalho e a carreira se reorganiza.",
      "A revisão alcança o dinheiro e a saúde entra em foco.",
    ],
    en: [
      "Firmness runs through the relationship and the bond is remade.",
      "The movement touches work and the career reorganizes itself.",
      "Review reaches money and health comes into focus.",
    ],
    es: [
      "La firmeza atraviesa las relaciones y el vínculo se rehace.",
      "El movimiento toca el trabajo y la carrera se reorganiza.",
      "La revisión alcanza el dinero y la salud entra en foco.",
    ],
  }
  for (const locale of LOCALES) {
    for (const texto of comEsfera[locale]) {
      confere(`B · ${locale}: esfera de vida detectada em "${texto.slice(0, 44)}"`, pegou(texto, locale, "inventa esfera de vida"), "passou sem violação")
    }
  }
}

// ── C · texto correto não dispara nenhuma das duas, nos três idiomas ───────
// O lado que importa tanto quanto o outro: paridade não pode virar
// verificador mais restritivo. O PT é a síntese real que produção gravou.
const CORRETOS: Record<Locale, string> = {
  pt: "Comunicação intensa encontra conflito de vontades, enquanto transformação revisitada se depara com inovação harmônica. Originalidade em revisão sustenta o movimento em busca de novas perspectivas.",
  en: "Intense communication meets a clash of wills, while revisited transformation encounters harmonic innovation. Originality under review sustains the movement toward new perspectives.",
  es: "La comunicación intensa encuentra un choque de voluntades, mientras la transformación revisada halla innovación armónica. La originalidad en revisión sostiene el movimiento hacia nuevas perspectivas.",
}

function parteC() {
  for (const locale of LOCALES) {
    const vs = violacoesDe(CORRETOS[locale], locale)
    const pedido = vs.filter((v) => v.startsWith("fala como conselho"))
    const esfera = vs.filter((v) => v.startsWith("inventa esfera de vida"))
    const idioma = vs.filter((v) => v.startsWith("a síntese está em"))
    // O PONTO CEGO QUE ESTAVA AQUI: a parte C declarava um texto "correto" sem
    // nunca passá-lo pela regra de nomear. O texto inglês desta lista contém
    // "new", e produção o recusava enquanto o teste o aprovava. Agora ele é
    // cobrado, e é por isso que ele prova a correção em vez de esconder.
    const nomeia = vs.filter((v) => v.startsWith("a síntese nomeia"))
    confere(`C · ${locale}: texto correto não é acusado de pedido`, pedido.length === 0, pedido.join(" / "))
    confere(`C · ${locale}: texto correto não é acusado de esfera de vida`, esfera.length === 0, esfera.join(" / "))
    confere(`C · ${locale}: texto correto não é acusado de idioma errado`, idioma.length === 0, idioma.join(" / "))
    confere(`C · ${locale}: texto correto não é acusado de nomear astrologia`, nomeia.length === 0, nomeia.join(" / "))
  }
  // o caso exato que reprovou em produção: "new" em uso comum
  const comNew = "Originality under review sustains the movement toward new perspectives."
  confere(
    'C · "movement toward new perspectives" passa, com "new" em uso comum',
    !violacoesDe(comNew, "en").some((v) => v.startsWith("a síntese nomeia")),
    violacoesDe(comNew, "en").filter((v) => v.startsWith("a síntese nomeia")).join(" / "),
  )
}

// ── D · o detector de idioma ───────────────────────────────────────────────
// As duas primeiras são as sínteses REAIS que estavam gravadas nas linhas `en`
// e `es` de 2026-10-01, em português. São a prova de regressão do defeito.
function parteD() {
  const CONTAMINADO_EN =
    "A comunicação intensa encontra um confronto de vontades, enquanto a revisão de estruturas profundas se faz presente. Harmonia entre identidade e inovação cria um pano de fundo que sustenta essa dinâmica."
  const CONTAMINADO_ES =
    "Hoje, a comunicação intensa e profunda encontra um confronto entre ação e transformação. Ao mesmo tempo, há uma revisão de estruturas coletivas que busca inovação e equilíbrio harmônico."

  confere("D · a linha `en` de produção era português", idiomaDivergente(CONTAMINADO_EN, "en") === "pt", String(idiomaDivergente(CONTAMINADO_EN, "en")))
  confere("D · a linha `es` de produção era português", idiomaDivergente(CONTAMINADO_ES, "es") === "pt", String(idiomaDivergente(CONTAMINADO_ES, "es")))
  confere("D · o verificador reprova a síntese `en` contaminada", pegou(CONTAMINADO_EN, "en", "a síntese está em"), "passou sem violação de idioma")
  confere("D · o verificador reprova a síntese `es` contaminada", pegou(CONTAMINADO_ES, "es", "a síntese está em"), "passou sem violação de idioma")

  for (const locale of LOCALES) {
    confere(`D · ${locale}: o texto correto é reconhecido como ${locale}`, idiomaDivergente(CORRETOS[locale], locale) === null, String(idiomaDivergente(CORRETOS[locale], locale)))
  }

  // trocas cruzadas: cada texto correto, cobrado no idioma errado
  for (const esperado of LOCALES) {
    for (const real of LOCALES) {
      if (real === esperado) continue
      confere(`D · ${real} gravado em ${esperado} é pego`, idiomaDivergente(CORRETOS[real], esperado) === real, String(idiomaDivergente(CORRETOS[real], esperado)))
    }
  }

  // o lado seguro: texto curto e pobre em palavras de função empata e PASSA,
  // porque reprovar à toa custa uma chamada paga
  const semEvidencia: Array<[string, Locale]> = [
    ["Movement meets limit. Review sustains change.", "en"],
    ["Thought and limit stand face to face, and comparison enters the same movement.", "en"],
    ["", "en"],
    ["", "pt"],
  ]
  for (const [texto, locale] of semEvidencia) {
    confere(`D · sem evidência não reprova: "${texto.slice(0, 40)}" (${locale})`, idiomaDivergente(texto, locale) === null, String(idiomaDivergente(texto, locale)))
  }
}

// ── E · o PT não mudou, e as regras não voltaram para dentro do arquivo ────
function parteE() {
  // as listas que vieram de `verificarCeu`, exatamente como eram lá
  // O PT de PEDIDO mudou em UM ponto, e só nele: `desafi` virou `desafia`,
  // porque o radical curto alcançava o substantivo "desafios". Esta asserção
  // guarda as duas coisas ao mesmo tempo: a lista é a esperada, e a diferença
  // em relação à original é exatamente essa troca e nada mais.
  // O PT de PEDIDO mudou em um ponto, e só nele: `desafi` saiu da alternação
  // compartilhada, porque o `\w*` dela alcançava "desafiadora". Os outros oito
  // radicais seguem intactos, na mesma ordem, e as formas verbais de desafiar
  // viraram uma regex própria com fronteira.
  const PT_PEDIDO_SEM_DESAFIAR = "(exig|ped(e|indo)|demand|convid|favorec|propõe|sugere|aconselha)\\w*"
  const PT_ESFERA_ORIGINAL = "(afetiv|afeto|amoros|relaç|relacionament|vínculo|trabalh|carreir|financ|dinheiro|saúde|família)\\w*"
  confere("E · o PT de PEDIDO tem duas entradas", PEDIDO.pt.length === 2, String(PEDIDO.pt.length))
  confere("E · a primeira é a lista original sem o ramo de desafiar", PEDIDO.pt[0]?.source === PT_PEDIDO_SEM_DESAFIAR, PEDIDO.pt[0]?.source)
  confere("E · e os oito radicais originais seguem lá", ["exig", "ped(e|indo)", "demand", "convid", "favorec", "propõe", "sugere", "aconselha"].every((r) => PEDIDO.pt[0].source.includes(r)))
  confere("E · a segunda é de formas verbais com fronteira", /^\\b\(desafia\|/.test(PEDIDO.pt[1]?.source ?? ""), PEDIDO.pt[1]?.source)
  confere("E · o PT de ESFERA_DE_VIDA é a lista original, intacta", ESFERA_DE_VIDA.pt.length === 1 && ESFERA_DE_VIDA.pt[0].source === PT_ESFERA_ORIGINAL, ESFERA_DE_VIDA.pt.map((r) => r.source).join(" "))

  for (const locale of LOCALES) {
    confere(`E · PEDIDO tem lista para ${locale}`, (PEDIDO[locale]?.length ?? 0) > 0)
    confere(`E · ESFERA_DE_VIDA tem lista para ${locale}`, (ESFERA_DE_VIDA[locale]?.length ?? 0) > 0)
    confere(`E · PEDIDO[${locale}] é global, para pegar toda ocorrência`, PEDIDO[locale].every((r) => r.flags.includes("g")))
    confere(`E · ESFERA_DE_VIDA[${locale}] é global`, ESFERA_DE_VIDA[locale].every((r) => r.flags.includes("g")))
  }

  // a regra não pode voltar a ser cravada em português dentro do módulo do céu
  const fonte = readFileSync(new URL("../lib/astro/ceu-do-dia.ts", import.meta.url), "utf8")
  confere("E · `ceu-do-dia.ts` não redeclara a regex de pedido", !/const\s+CONSELHO\s*=\s*\//.test(fonte), "a regex local voltou")
  confere("E · `ceu-do-dia.ts` não redeclara a regex de esfera de vida", !/const\s+VIDA\s*=\s*\//.test(fonte), "a regex local voltou")
  // `PEDIDO` deixou de ser lido direto aqui: quem aplica a regra, e qualifica
  // o homógrafo, é `pedidoDoCeu`. A esfera de vida continua por tabela.
  confere("E · `ceu-do-dia.ts` delega o pedido a `pedidoDoCeu`", /pedidoDoCeu\(sintese, locale\)/.test(fonte))
  confere("E · `ceu-do-dia.ts` usa a tabela de esfera de vida por idioma", /ESFERA_DE_VIDA\[locale\]/.test(fonte))
  confere("E · `ceu-do-dia.ts` não redeclara a lista de pedido", !/const\s+PEDIDO\s*[:=]/.test(fonte))

  // o fecho de idioma, que é a outra metade da correção, nos três prompts
  const marcas: Record<Locale, RegExp> = {
    pt: /IDIOMA: as regras acima estão em português/,
    en: /LANGUAGE: the rules above are written in Portuguese/,
    es: /IDIOMA: las reglas anteriores están en portugués/,
  }
  for (const locale of LOCALES) {
    const sys = sistemaDoCeu(locale)
    confere(`E · ${locale}: o prompt fecha exigindo o idioma`, marcas[locale].test(sys), "o fecho não está no prompt")
    const ultima = sys.trimEnd().split("\n").filter(Boolean).pop() ?? ""
    confere(`E · ${locale}: o fecho é a ÚLTIMA linha do prompt`, marcas[locale].test(ultima), `última linha: ${ultima.slice(0, 60)}`)
  }
}

// ── F · alcance: nenhum idioma pega palavra inocente que os outros deixam ──
// Paridade tem dois lados, e este é o que a primeira tradução errou. As listas
// de EN e ES nasceram como radicais soltos e ficaram MAIS restritivas que o
// PT: "ask" casava dentro de "task", "famil" pegava "familiar", "work" pegava
// "network", "favou?r" pegava "favorable". Nenhum equivalente desses é pego em
// português, então cada um era uma proibição nova inventada na tradução. Em
// produção isso reprovou a geração em inglês nas quatro tentativas.
//
// As palavras abaixo precisam atravessar as duas regras em todos os idiomas. O
// verbo conjugado continua sendo pego, e isso é a parte A e a parte B.
function parteF() {
  const INOCENTES: Record<Locale, string[]> = {
    pt: ["familiar", "rede", "relativo", "vincular", "proposta", "sugestão", "favorável"],
    en: ["familiar", "network", "framework", "worksheet", "task", "mask", "lovely", "bonding", "invitation", "proposition", "suggestion", "favorable", "requirement"],
    es: ["familiar", "vincular", "relacionar", "propuesta", "sugerencia", "favorable", "tarea"],
  }
  for (const locale of LOCALES) {
    for (const palavra of INOCENTES[locale]) {
      const pedido = PEDIDO[locale].some((r) => new RegExp(r.source, "i").test(palavra))
      const esfera = ESFERA_DE_VIDA[locale].some((r) => new RegExp(r.source, "i").test(palavra))
      confere(`F · ${locale}: "${palavra}" atravessa as duas regras`, !pedido && !esfera, `${pedido ? "PEDIDO " : ""}${esfera ? "ESFERA_DE_VIDA" : ""}`)
    }
  }
}

// ── G · nome técnico exposto, contra palavra corrente ──────────────────────
// A regra cobra nomenclatura astrológica na superfície. Antes ela comparava a
// string, e por isso proibia a palavra do idioma que por acaso também é termo
// técnico. Em inglês isso significava banir "new" e "full", que são nomes de
// fase da Lua e duas das palavras mais frequentes da língua, e foi o que
// reprovou a geração em inglês nas quatro tentativas em produção.
//
// Cada caso abaixo diz o termo em jogo e se o uso é comum ou técnico. O uso
// comum passa; o técnico continua reprovando. A regra antiga é recalculada
// aqui ao lado para que o teste prove o que mudou, e o que não mudou.
type Caso = { texto: string; termo: string; tipo: "comum" | "tecnico" }

const CASOS_NOME: Record<Locale, Caso[]> = {
  en: [
    { texto: "The movement toward new perspectives sustains what returns.", termo: "new", tipo: "comum" },
    { texto: "A full picture of the crossing emerges while originality returns.", termo: "full", tipo: "comum" },
    { texto: "The town square fills with voices as the crossing holds.", termo: "square", tipo: "comum" },
    { texto: "Two forces in opposition hold each other without giving way.", termo: "opposition", tipo: "comum" },
    { texto: "A conjunction of impulses crosses what returns for review.", termo: "conjunction", tipo: "comum" },
    { texto: "The new moon marks what returns for review.", termo: "new", tipo: "tecnico" },
    { texto: "A full moon exposes the crossing of wills.", termo: "full", tipo: "tecnico" },
    { texto: "The square aspect crosses an advance that asserts itself.", termo: "square", tipo: "tecnico" },
    { texto: "What returns sits in square with an advance that asserts.", termo: "square", tipo: "tecnico" },
    { texto: "The opposition aspect holds two forces apart.", termo: "opposition", tipo: "tecnico" },
    { texto: "A conjunction aspect gathers what was separate.", termo: "conjunction", tipo: "tecnico" },
  ],
  pt: [
    { texto: "Uma transformação cheia de revisão atravessa o movimento.", termo: "cheia", tipo: "comum" },
    { texto: "A oposição entre duas forças se mantém sem recuo.", termo: "oposição", tipo: "comum" },
    { texto: "Uma conjunção de impulsos atravessa o que retorna.", termo: "conjunção", tipo: "comum" },
    { texto: "A fase cheia expõe o movimento que retorna.", termo: "cheia", tipo: "tecnico" },
    { texto: "O aspecto de oposição mantém duas forças afastadas.", termo: "oposição", tipo: "tecnico" },
    { texto: "O aspecto de conjunção reúne o que estava separado.", termo: "conjunção", tipo: "tecnico" },
  ],
  es: [
    { texto: "Una revisión llena de movimiento sostiene lo que vuelve.", termo: "llena", tipo: "comum" },
    { texto: "La oposición entre dos fuerzas se mantiene sin retroceso.", termo: "oposición", tipo: "comum" },
    { texto: "Una conjunción de impulsos atraviesa lo que vuelve.", termo: "conjunción", tipo: "comum" },
    { texto: "La fase llena expone el movimiento que vuelve.", termo: "llena", tipo: "tecnico" },
    { texto: "El aspecto de oposición mantiene dos fuerzas apartadas.", termo: "oposición", tipo: "tecnico" },
    { texto: "El aspecto de conjunción reúne lo que estaba separado.", termo: "conjunción", tipo: "tecnico" },
  ],
}

/** A regra como era: a string proibida, sem olhar contexto. */
function regraAntiga(sintese: string, nomes: string[]): string[] {
  return nomes.filter((n) => new RegExp(`(^|[^\\p{L}])${n}([^\\p{L}]|$)`, "iu").test(sintese))
}

function parteG() {
  const mudou: string[] = []
  for (const locale of LOCALES) {
    const nomes = nomesTecnicos(locale)
    for (const c of CASOS_NOME[locale]) {
      const agora = nomesExpostos(c.texto, locale, nomes)
      const antes = regraAntiga(c.texto, nomes)
      const pegaAgora = agora.some((n) => n.toLowerCase() === c.termo.toLowerCase())
      const pegavaAntes = antes.some((n) => n.toLowerCase() === c.termo.toLowerCase())

      if (c.tipo === "comum") {
        confere(`G · ${locale}: "${c.termo}" em uso comum passa — ${c.texto.slice(0, 40)}`, !pegaAgora, `pegou: ${agora.join(", ")}`)
      } else {
        confere(`G · ${locale}: "${c.termo}" em uso técnico reprova — ${c.texto.slice(0, 40)}`, pegaAgora, "passou sem violação")
        // o que já era protegido continua protegido: esta é a prova de que a
        // qualificação por contexto não afrouxou nenhuma recusa técnica
        confere(`G · ${locale}: "${c.termo}" técnico já reprovava antes, e continua`, pegavaAntes === pegaAgora, `antes=${pegavaAntes} agora=${pegaAgora}`)
      }
      if (pegavaAntes !== pegaAgora) mudou.push(`${locale}/${c.termo}/${c.tipo}`)
    }
  }

  // o delta precisa ser SÓ de uso comum. Se uma recusa técnica tiver virado
  // passagem em qualquer idioma, a correção foi longe demais.
  const deltaTecnico = mudou.filter((m) => m.endsWith("/tecnico"))
  confere("G · nenhuma recusa de uso TÉCNICO foi afrouxada em idioma nenhum", deltaTecnico.length === 0, deltaTecnico.join(" | "))

  // e o inverso: o verificador e o prompt leem a MESMA lista. Se divergirem, o
  // modelo volta a ser julgado por um critério que não vê.
  for (const locale of LOCALES) {
    const lista = nomesTecnicos(locale)
    const sys = sistemaDoCeu(locale)
    const fora = lista.filter((n) => !sys.includes(n))
    confere(`G · ${locale}: o prompt enuncia todos os ${lista.length} termos que o verificador cobra`, fora.length === 0, `faltam: ${fora.join(", ")}`)
  }
}

// ── H · o contrato de `termos` ─────────────────────────────────────────────
// A regra de cobertura é um teste de substring: cada `termos[].texto` precisa
// ser encontrado LITERALMENTE dentro da síntese. Ela está correta para esta
// arquitetura e não mudou. O que faltava era o prompt dizer isso de forma
// inequívoca, e 10 das 13 violações de produção vieram daí.
//
// Estes casos provam que a regra aceita paráfrase legítima dos FATOS e recusa
// paráfrase entre os termos e a própria síntese, igual nos três idiomas.
type Termo = { texto: string; origem: string; fato_id: string }
type Caso = { termos: Termo[]; sintese: string }

/** os três fatos de DIA, pelo id estável */
const F1 = "aspecto:mercury~mars:square"
const F2 = "aspecto:mars~pluto:opposition"
const F3 = "aspecto:sun~uranus:trine"

const VALIDO: Record<Locale, Caso> = {
  en: {
    termos: [
      { texto: "examining precision", origem: "Mercury", fato_id: F1 },
      { texto: "crossed insistence", origem: "square", fato_id: F1 },
      { texto: "depth under review", origem: "retrogradation of Pluto", fato_id: F2 },
      { texto: "frictionless accord", origem: "trine", fato_id: F3 },
    ],
    sintese: "Examining precision meets crossed insistence, while depth under review finds a frictionless accord. What orients itself holds steady.",
  },
  pt: {
    termos: [
      { texto: "precisão que examina", origem: "Mercúrio", fato_id: F1 },
      { texto: "insistência atravessada", origem: "quadratura", fato_id: F1 },
      { texto: "profundidade em revisão", origem: "retrogradação de Plutão", fato_id: F2 },
      { texto: "acordo sem atrito", origem: "trígono", fato_id: F3 },
    ],
    sintese: "Precisão que examina encontra insistência atravessada, enquanto profundidade em revisão acha acordo sem atrito. O que orienta se mantém firme.",
  },
  es: {
    termos: [
      { texto: "precisión que examina", origem: "Mercurio", fato_id: F1 },
      { texto: "insistencia cruzada", origem: "cuadratura", fato_id: F1 },
      { texto: "profundidad en revisión", origem: "retrogradación de Plutón", fato_id: F2 },
      { texto: "fuerzas enfrentadas", origem: "oposición", fato_id: F2 },
    ],
    sintese: "Precisión que examina encuentra insistencia cruzada, mientras profundidad en revisión halla fuerzas enfrentadas. Lo que orienta se mantiene firme.",
  },
}

/** um quinto termo, para provar que 5 também passa */
const QUINTO: Record<Locale, Termo> = {
  en: { texto: "what orients itself", origem: "Sun", fato_id: F3 },
  pt: { texto: "o que orienta", origem: "Sol", fato_id: F3 },
  es: { texto: "lo que orienta", origem: "Sol", fato_id: F3 },
}

/** paráfrase do próprio termo: mesmo sentido, outras palavras */
const PARAFRASE: Record<Locale, string[]> = {
  en: ["precise examination", "insistence that crosses", "depth revisited", "accord without friction"],
  pt: ["exame preciso", "insistência que atravessa", "profundidade revista", "entendimento sem atrito"],
  es: ["examen preciso", "insistencia que cruza", "profundidad revisada", "fuerzas cara a cara"],
}

function violacoesDoCaso(locale: Locale, caso: Caso): string[] {
  const ceu = estadoDoCeu(DIA)
  const { escolhidos } = fatosDoCeu(ceu, locale)
  const v = verificarCeu({ bruto: caso, escolhidos, locale, minimoTermos: minimoDeTermos(escolhidos) })
  return v.ok ? [] : v.violacoes
}

function parteH() {
  for (const locale of LOCALES) {
    const base = VALIDO[locale]
    const { escolhidos } = fatosDoCeu(estadoDoCeu(DIA), locale)
    confere(`H · ${locale}: o mínimo do dia é 4`, minimoDeTermos(escolhidos) === 4, String(minimoDeTermos(escolhidos)))

    confere(`H · ${locale}: 4 termos literais passam`, violacoesDoCaso(locale, base).length === 0, violacoesDoCaso(locale, base).join(" / "))

    const cinco = { ...base, termos: [...base.termos, QUINTO[locale]] }
    confere(`H · ${locale}: 5 termos literais passam`, violacoesDoCaso(locale, cinco).length === 0, violacoesDoCaso(locale, cinco).join(" / "))

    const tres = { ...base, termos: base.termos.slice(0, 3) }
    confere(
      `H · ${locale}: 3 termos reprovam`,
      violacoesDoCaso(locale, tres).some((v) => v.includes("termos (queremos")),
      violacoesDoCaso(locale, tres).join(" / "),
    )

    const parafraseado = { ...base, termos: base.termos.map((t, i) => ({ ...t, texto: PARAFRASE[locale][i] })) }
    const vsP = violacoesDoCaso(locale, parafraseado)
    confere(
      `H · ${locale}: termo parafraseado reprova`,
      vsP.filter((v) => v.includes("não aparece na síntese")).length === 4,
      vsP.join(" / "),
    )

    const ausente = { ...base, termos: base.termos.map((t, i) => (i === 0 ? { ...t, texto: "nada disso está na frase" } : t)) }
    confere(
      `H · ${locale}: termo que não existe na síntese reprova`,
      violacoesDoCaso(locale, ausente).some((v) => v.includes("não aparece na síntese")),
      violacoesDoCaso(locale, ausente).join(" / "),
    )

    const origemFalsa = { ...base, termos: base.termos.map((t, i) => (i === 0 ? { ...t, origem: "Saturno Saturn" } : t)) }
    confere(
      `H · ${locale}: origem inexistente reprova`,
      violacoesDoCaso(locale, origemFalsa).some((v) => v.includes("não é uma das origens de")),
      violacoesDoCaso(locale, origemFalsa).join(" / "),
    )

    // o prompt precisa dizer o mínimo do DIA, e não a constante. Era a
    // contradição que reprovou duas tentativas: o prompt pedia 3, o
    // verificador cobrava 4, e o modelo obedeceu o prompt.
    const sys = sistemaDoCeu(locale, 4)
    confere(`H · ${locale}: o prompt pede 4 termos quando o dia pede 4`, sys.includes("4") && !/de 3 a 5|3 ou 5/.test(sys), "o prompt ainda fala em 3")
    confere(`H · ${locale}: o prompt manda copiar palavra por palavra`, /palavra por palavra|word for word|palabra por palabra/.test(sys))
  }
}

// ── I · o homógrafo `challenges` ───────────────────────────────────────────
// Mesma frase, mesmos termos literais, mudando só se a palavra é substantivo
// ou verbo. Em produção `Communication meets assertive challenges` foi
// reprovado como conselho, e ali o céu não pedia nada.
const CHALLENGE: Record<Locale, { nome: string[]; verbo: string[] }> = {
  en: {
    nome: [
      "Communication meets assertive challenges.",
      "The challenges remain visible.",
      "Deep challenges cross the movement.",
      "Challenges remain visible while depth returns.",
    ],
    verbo: ["This movement challenges you to reconsider what returns.", "The transit challenges what was established."],
  },
  pt: {
    nome: ["Comunicação encontra desafios assertivos.", "Os desafios seguem visíveis.", "Desafios profundos atravessam o movimento."],
    verbo: ["Este movimento desafia você a rever o que retorna.", "O movimento desafia o que estava estabelecido."],
  },
  es: {
    nome: ["Comunicación encuentra desafíos asertivos.", "Los desafíos siguen visibles.", "Desafíos profundos atraviesan el movimiento."],
    verbo: ["Este movimiento te desafía a revisar lo que vuelve.", "El movimiento desafía lo que estaba establecido."],
  },
}

function parteI() {
  for (const locale of LOCALES) {
    for (const texto of CHALLENGE[locale].nome) {
      confere(`I · ${locale}: substantivo passa — "${texto.slice(0, 40)}"`, pedidoDoCeu(texto, locale).length === 0, `pegou: ${pedidoDoCeu(texto, locale).join(", ")}`)
    }
    for (const texto of CHALLENGE[locale].verbo) {
      confere(`I · ${locale}: ação do céu reprova — "${texto.slice(0, 40)}"`, pedidoDoCeu(texto, locale).length > 0, "passou sem violação")
    }
  }
}

// ── J · o detector de idioma e as marcas de ortografia ─────────────────────
// `ll[aeiou]` no espanhol casava dentro de palavra inglesa comum, e `nh` no
// português fazia o mesmo. Como a marca vale 2 e a margem é 2, uma frase
// inglesa curta era acusada de outro idioma. Os dois ramos saíram.
function parteJ() {
  const ingles = ["challenges", "allow", "village", "collect", "follow", "illuminate", "stellar", "parallel", "enhance", "inhale", "unhappy"]
  for (const palavra of ingles) {
    const frase = `Communication meets ${palavra}.`
    confere(`J · "${palavra}" sozinha não empurra EN para outro idioma`, idiomaDivergente(frase, "en") === null, String(idiomaDivergente(frase, "en")))
  }
  // e o espanhol e o português continuam sendo reconhecidos sem esses ramos
  confere("J · espanhol ainda é reconhecido", idiomaDivergente(VALIDO.es.sintese, "es") === null, String(idiomaDivergente(VALIDO.es.sintese, "es")))
  confere("J · português ainda é reconhecido", idiomaDivergente(VALIDO.pt.sintese, "pt") === null, String(idiomaDivergente(VALIDO.pt.sintese, "pt")))
  confere("J · português ainda é pego dentro de `en`", idiomaDivergente(VALIDO.pt.sintese, "en") === "pt", String(idiomaDivergente(VALIDO.pt.sintese, "en")))
  confere("J · espanhol ainda é pego dentro de `en`", idiomaDivergente(VALIDO.es.sintese, "en") === "es", String(idiomaDivergente(VALIDO.es.sintese, "en")))
}

// ── K · proteção contra custo repetido ─────────────────────────────────────
// O problema, medido em produção em 2026-10-01: sem linha gravada, cada
// visitante dispara até 4 chamadas pagas, todas reprovam, nada é gravado, e o
// próximo visitante repete. Aconteceu três vezes no mesmo dia.
//
// Aqui o PostgREST é falso e roda no processo, e o "modelo" é uma função local
// que conta quantas vezes foi chamada. Nenhuma chamada paga.
async function parteK() {
  const sky = new Map<string, Record<string, unknown>>()
  const esgotado = new Map<string, Record<string, unknown>>()
  const chave = (u: string) => {
    const dia = /dia=eq\.([^&]+)/.exec(u)?.[1] ?? ""
    const loc = /locale=eq\.([^&]+)/.exec(u)?.[1] ?? ""
    return `${dia}|${loc}`
  }

  const servidor = http.createServer((req, res) => {
    let corpo = ""
    req.on("data", (c) => (corpo += String(c)))
    req.on("end", () => {
      const url = req.url ?? ""
      const alvo = url.includes("sky_generation_exhausted") ? esgotado : sky
      res.writeHead(req.method === "POST" ? 201 : 200, { "content-type": "application/json" })
      if (req.method === "POST") {
        try {
          const b = JSON.parse(corpo)
          const linha = Array.isArray(b) ? b[0] : b
          const k = `${linha.dia}|${linha.locale}`
          if (!alvo.has(k)) alvo.set(k, linha) // on conflict do nothing
        } catch {}
        return res.end("[]")
      }
      // `cacheDisponivel`: existe a tabela?
      if (url.includes("select=dia&limit=1")) return res.end("[]")
      // leitura por (dia, locale), em forma de objeto ou nulo
      return res.end(JSON.stringify(alvo.get(chave(url)) ?? null))
    })
  })
  await new Promise<void>((r) => servidor.listen(0, "127.0.0.1", r))
  process.env.NEXT_PUBLIC_SUPABASE_URL = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`
  process.env.SUPABASE_SERVICE_ROLE_KEY = "teste"

  const { leituraDoCeu } = await import("../lib/astro/ceu-do-dia-server")

  let chamadas = 0
  /** devolve sempre algo que reprova, para consumir o ciclo */
  const gerarRuim = async () => {
    chamadas += 1
    return { conteudo: JSON.stringify({ termos: [], sintese: "nada que preste aqui." }), model: "falso" }
  }
  const gerarBom = async (locale: Locale) => {
    chamadas += 1
    return { conteudo: JSON.stringify(VALIDO[locale]), model: "falso" }
  }

  // 1. sem estado -> geração permitida, e o ciclo roda as 4 tentativas
  chamadas = 0
  const r1 = await leituraDoCeu({ dia: DIA, locale: "en", gerar: gerarRuim })
  confere("K · 1. sem estado, a geração é permitida", chamadas === 4, `chamadas=${chamadas}`)
  confere("K · 1. e devolve sintese nula", r1.sintese === null)

  // 2. as 4 reprovações gravaram o esgotamento
  confere("K · 2. o esgotamento foi gravado", esgotado.has(`${DIA}|en`), [...esgotado.keys()].join(","))
  confere("K · 2. com o número de tentativas", esgotado.get(`${DIA}|en`)?.tentativas === 4, String(esgotado.get(`${DIA}|en`)?.tentativas))

  // 3. nova visita no mesmo dia e idioma: ZERO chamadas
  chamadas = 0
  const r3 = await leituraDoCeu({ dia: DIA, locale: "en", gerar: gerarRuim })
  confere("K · 3. nova visita não chama a IA", chamadas === 0, `chamadas=${chamadas}`)
  confere("K · 3. e ainda devolve a camada factual", r3.factual.length > 0 && r3.sintese === null)

  // 4. outro idioma é independente
  chamadas = 0
  await leituraDoCeu({ dia: DIA, locale: "es", gerar: gerarRuim })
  confere("K · 4. outro idioma pode gerar", chamadas === 4, `chamadas=${chamadas}`)

  // 5. o dia seguinte é independente
  chamadas = 0
  await leituraDoCeu({ dia: "2026-10-02", locale: "en", gerar: gerarRuim })
  confere("K · 5. o dia seguinte pode gerar", chamadas === 4, `chamadas=${chamadas}`)

  // 6. síntese válida tem precedência sobre o esgotamento.
  //
  // Usa DIA e `pt`, e não outra data: o caso válido foi montado contra os
  // fatos DESTE dia, e as origens dele só existem aqui. Em outra data as
  // origens seriam outras e a geração "boa" reprovaria por motivo alheio ao
  // que se quer provar.
  chamadas = 0
  const bom = await leituraDoCeu({ dia: DIA, locale: "pt", gerar: () => gerarBom("pt") })
  confere("K · 6. a geração aprovada grava a síntese", bom.sintese !== null, String(bom.violacoes))
  confere("K · 6. e gravou em sky_daily", sky.has(`${DIA}|pt`), [...sky.keys()].join(","))
  confere("K · 6. com uma chamada só", chamadas === 1, `chamadas=${chamadas}`)
  // agora existe linha boa E plantamos um esgotamento no mesmo dia e idioma
  esgotado.set(`${DIA}|pt`, { dia: DIA, locale: "pt", tentativas: 4 })
  chamadas = 0
  const precedencia = await leituraDoCeu({ dia: DIA, locale: "pt", gerar: gerarRuim })
  confere("K · 6. a síntese válida vence o esgotamento", precedencia.sintese !== null && precedencia.cache === true, `sintese=${precedencia.sintese}`)
  confere("K · 6. e sem chamar a IA", chamadas === 0, `chamadas=${chamadas}`)

  // ── a semântica do esgotamento: só reprovação do verificador tranca o dia ──
  // `failed-today` significa "o modelo respondeu quatro vezes e o verificador
  // recusou as quatro". Falha de entrega não é isso, e não pode trancar: a
  // chamada foi paga, mas o ciclo de qualidade não foi consumido.
  const gerarParse = async () => {
    chamadas += 1
    return { conteudo: "isto não é json", model: "falso" }
  }

  // 7. quatro erros de parse: consome as chamadas, não tranca o dia
  const D7 = "2026-10-05"
  chamadas = 0
  await leituraDoCeu({ dia: D7, locale: "en", gerar: gerarParse })
  confere("K · 7. parse inválido consome as 4 tentativas", chamadas === 4, `chamadas=${chamadas}`)
  confere("K · 7. e NÃO grava esgotamento", !esgotado.has(`${D7}|en`), "trancou o dia por erro de formato")

  // 8. três reprovações de verdade e um parse inválido: ainda não tranca
  const D8 = "2026-10-06"
  chamadas = 0
  await leituraDoCeu({
    dia: D8,
    locale: "en",
    gerar: async () => (chamadas < 3 ? gerarRuim() : gerarParse()),
  })
  confere("K · 8. três reprovações mais um parse não trancam", !esgotado.has(`${D8}|en`), "trancou com 3 reprovações")

  // 9. quatro reprovações reais: tranca
  const D9 = "2026-10-07"
  chamadas = 0
  await leituraDoCeu({ dia: D9, locale: "en", gerar: gerarRuim })
  confere("K · 9. quatro reprovações reais trancam o dia", esgotado.has(`${D9}|en`), [...esgotado.keys()].join(","))
  confere("K · 9. com tentativas=4", esgotado.get(`${D9}|en`)?.tentativas === 4, String(esgotado.get(`${D9}|en`)?.tentativas))

  // 10. e a visita seguinte não chama a IA
  chamadas = 0
  await leituraDoCeu({ dia: D9, locale: "en", gerar: gerarRuim })
  confere("K · 10. a visita seguinte não chama a IA", chamadas === 0, `chamadas=${chamadas}`)

  // e o dia que ficou aberto por erro de formato continua aberto
  chamadas = 0
  await leituraDoCeu({ dia: D7, locale: "en", gerar: gerarRuim })
  confere("K · 10. o dia aberto por erro de formato ainda tenta", chamadas === 4, `chamadas=${chamadas}`)

  servidor.close()
}

// ── L · retrogradação e as duas frases ─────────────────────────────────────
// As duas últimas incompatibilidades, medidas em 2026-10-01. A geração em
// inglês reprovou com exatamente três violações:
//
//   "deep transformation" vem de "retrogradation of Pluto" mas não carrega o
//   movimento de volta
//   "unusual perspectives" vem de "retrogradation of Uranus" mas não carrega o
//   movimento de volta
//   1 frases (queremos 2)
//
// Nenhuma era de idioma, nome técnico, contagem de termos, literalidade ou
// `challenge`: as correções anteriores tinham funcionado.
//
// A causa das duas primeiras era desencontro de contrato. O prompt dizia "como
// revisão, retomada, retorno", em português, e mandava o modelo inferir. Mas
// `carregaRetrogradacao` compara contra raízes fechadas, e metade das
// traduções naturais daqueles exemplos reprova: "resumption" e "retaking" para
// retomada, "reconsidered" e "rethought" para algo revisto. A função NÃO foi
// relaxada; o prompt passou a citar palavras que ela aceita, e a primeira
// asserção abaixo é o que impede os dois de divergirem outra vez.
const SEM_VOLTA: Record<Locale, { termo: string; sintese: string }> = {
  en: {
    termo: "deep transformation",
    sintese: "Examining precision meets crossed insistence, while deep transformation finds a frictionless accord. What orients itself holds steady.",
  },
  pt: {
    termo: "transformação profunda",
    sintese: "Precisão que examina encontra insistência atravessada, enquanto transformação profunda acha acordo sem atrito. O que orienta se mantém firme.",
  },
  es: {
    termo: "transformación profunda",
    sintese: "Precisión que examina encuentra insistencia cruzada, mientras transformación profunda halla fuerzas enfrentadas. Lo que orienta se mantiene firme.",
  },
}

const UMA_FRASE: Record<Locale, string> = {
  en: "Examining precision meets crossed insistence, while depth under review finds a frictionless accord and what orients itself holds steady.",
  pt: "Precisão que examina encontra insistência atravessada, enquanto profundidade em revisão acha acordo sem atrito e o que orienta se mantém firme.",
  es: "Precisión que examina encuentra insistencia cruzada, mientras profundidad en revisión halla fuerzas enfrentadas y lo que orienta se mantiene firme.",
}

const TRES_FRASES: Record<Locale, string> = {
  en: "Examining precision meets crossed insistence. Depth under review finds a frictionless accord. What orients itself holds steady.",
  pt: "Precisão que examina encontra insistência atravessada. Profundidade em revisão acha acordo sem atrito. O que orienta se mantém firme.",
  es: "Precisión que examina encuentra insistencia cruzada. Profundidad en revisión halla fuerzas enfrentadas. Lo que orienta se mantiene firme.",
}

const MARCA_RETRO_PROMPT: Record<Locale, RegExp> = {
  pt: /QUANDO A ORIGEM FOR UMA RETROGRADAÇÃO/,
  en: /WHEN THE ORIGIN IS A RETROGRADATION/,
  es: /CUANDO EL ORIGEN SEA UNA RETROGRADACIÓN/,
}
const MARCA_FRASES_PROMPT: Record<Locale, RegExp> = {
  pt: /EXATAMENTE duas frases completas/,
  en: /EXACTLY two complete sentences/,
  es: /EXACTAMENTE dos frases completas/,
}

function parteL() {
  for (const locale of LOCALES) {
    // A GUARDA CONTRA DIVERGÊNCIA: tudo que o prompt cita, a função aceita.
    for (const palavra of EXEMPLOS_RETROGRADACAO[locale]) {
      confere(
        `L · ${locale}: o prompt cita "${palavra}" e a função aceita`,
        carregaRetrogradacao(palavra, locale),
        "o prompt promete o que o verificador recusa",
      )
    }

    const base = VALIDO[locale]
    confere(`L · ${locale}: retrogradação com a volta passa`, violacoesDoCaso(locale, base).length === 0, violacoesDoCaso(locale, base).join(" / "))

    // o termo nomeia o tema e perde o movimento: é o caso de produção
    const sem = SEM_VOLTA[locale]
    const semVolta = {
      termos: base.termos.map((t) => (t.origem.includes("Plut") ? { ...t, texto: sem.termo } : t)),
      sintese: sem.sintese,
    }
    const vsSem = violacoesDoCaso(locale, semVolta)
    confere(
      `L · ${locale}: retrogradação sem a volta reprova`,
      vsSem.some((v) => v.includes("não carrega o movimento de volta")),
      vsSem.join(" / ") || "(nenhuma violação)",
    )

    // exatamente duas frases
    confere(`L · ${locale}: duas frases passam`, !violacoesDoCaso(locale, base).some((v) => v.includes("frases (queremos")))
    const uma = violacoesDoCaso(locale, { ...base, sintese: UMA_FRASE[locale] })
    confere(`L · ${locale}: uma frase reprova`, uma.some((v) => v.includes("1 frases (queremos")), uma.join(" / "))
    const tres = violacoesDoCaso(locale, { ...base, sintese: TRES_FRASES[locale] })
    confere(`L · ${locale}: três frases reprovam`, tres.some((v) => v.includes("3 frases (queremos")), tres.join(" / "))

    // e o prompt diz as duas coisas, no idioma pedido
    const sys = sistemaDoCeu(locale, 4)
    confere(`L · ${locale}: o prompt explicita a semântica da retrogradação`, MARCA_RETRO_PROMPT[locale].test(sys))
    confere(`L · ${locale}: o prompt lista as palavras que servem`, EXEMPLOS_RETROGRADACAO[locale].every((p) => sys.includes(p)))
    confere(`L · ${locale}: o prompt exige exatamente duas frases`, MARCA_FRASES_PROMPT[locale].test(sys))

    // e a mensagem do usuário marca quais origens são retrogradação, em linha
    // separada, para o marcador não acabar dentro de `termos[].origem`
    const { escolhidos } = fatosDoCeu(estadoDoCeu(DIA), locale)
    const { user } = promptCeuDoDia(estadoDoCeu(DIA), escolhidos, locale)
    const temRetro = escolhidos.some((f) => f.origens.some((o) => /retrograda/i.test(o)))
    confere(`L · ${locale}: o pedido marca as origens de retrogradação`, !temRetro || /retrograda/i.test(user))
    confere(`L · ${locale}: e a linha de ORIGENS não leva marcador grudado`, !/ORIGENS[^\n]*(precisa|must|tiene que)/.test(user))
  }
}

// ── M · identidade composta da origem ──────────────────────────────────────
// A string da origem não identifica o fato. Medido em 2026-10-02: 17 origens
// expostas, 14 strings distintas. "Marte" e "Leão" estão no quadrado e na
// oposição de Plutão, e "oposição" está em DOIS fatos (Sol~Saturno e
// Marte~Plutão).
//
// Antes, o verificador resolvia origem -> fato pelo primeiro fato que a
// continha, e errava nos dois sentidos. Agora o termo declara `fato_id` e tudo
// é resolvido dentro dele.
//
// SEGUNDA DATA FIXA, de propósito: 2026-10-01 tem uma oposição só, e o caso A
// precisa de duas para existir. 2026-10-02 tem.
const DIA_COLISAO = "2026-10-02"
const C1 = "aspecto:mercury~mars:square"
const C2 = "aspecto:sun~saturn:opposition"
const C3 = "aspecto:mars~pluto:opposition"

function violacoesEm(dia: string, locale: Locale, caso: Caso): string[] {
  const ceu = estadoDoCeu(dia)
  const { escolhidos } = fatosDoCeu(ceu, locale)
  const v = verificarCeu({ bruto: caso, escolhidos, locale, minimoTermos: minimoDeTermos(escolhidos) })
  return v.ok ? [] : v.violacoes
}

function parteM() {
  // a colisão existe mesmo, nos três idiomas, e a identidade composta a resolve
  for (const locale of LOCALES) {
    const { escolhidos } = fatosDoCeu(estadoDoCeu(DIA_COLISAO), locale)
    const slots = escolhidos.flatMap((f) => f.origens)
    const porString = new Set(slots)
    const porPar = new Set(escolhidos.flatMap((f) => f.origens.map((o) => `${f.id}\u0000${o}`)))
    confere(`M · ${locale}: a colisão de string existe de verdade`, porString.size < slots.length, `${porString.size} de ${slots.length}`)
    confere(`M · ${locale}: e a identidade composta não colide`, porPar.size === slots.length, `${porPar.size} de ${slots.length}`)
  }

  // ── A · duas oposições distintas, uma origem cada: deve PASSAR ───────────
  const A: Caso = {
    termos: [
      { texto: "exame que distingue", origem: "Mercúrio", fato_id: C1 },
      { texto: "limite iluminado", origem: "oposição", fato_id: C2 },
      { texto: "faces que se medem", origem: "oposição", fato_id: C3 },
      { texto: "profundidade em revisão", origem: "retrogradação de Plutão", fato_id: C3 },
    ],
    sintese: "Exame que distingue encontra limite iluminado, enquanto faces que se medem sustentam profundidade em revisão. O dia segue firme.",
  }
  const vA = violacoesEm(DIA_COLISAO, "pt", A)
  confere("M · A. duas oposições diferentes não são origem duplicada", !vA.some((v) => v.includes("usada por mais de um termo")), vA.join(" / "))
  confere("M · A. e o conjunto inteiro passa", vA.length === 0, vA.join(" / "))

  // ── B · `Marte` e `Leão` em dois fatos: duas coberturas, não uma ─────────
  // TODAS as quatro origens caem no fato 1 pela resolução por primeiro match,
  // mas "Marte" e "Leão" foram declarados vindo do fato 3. Nenhum termo de
  // retrogradação aqui, de propósito: ele só existe no fato 3 e puxaria o
  // segundo fato sozinho, escondendo o defeito que este caso mede.
  const B: Caso = {
    termos: [
      { texto: "exame que distingue", origem: "Mercúrio", fato_id: C1 },
      { texto: "travessia sem passagem", origem: "quadratura", fato_id: C1 },
      { texto: "impulso que afirma", origem: "Marte", fato_id: C3 },
      { texto: "presença que se expõe", origem: "Leão", fato_id: C3 },
    ],
    sintese: "Exame que distingue encontra travessia sem passagem, enquanto impulso que afirma sustenta presença que se expõe. O dia segue firme.",
  }
  const vB = violacoesEm(DIA_COLISAO, "pt", B)
  confere("M · B. dois fato_id distintos contam como dois fatos", !vB.some((v) => v.includes("mesmo fato")), vB.join(" / "))
  confere("M · B. e o conjunto inteiro passa", vB.length === 0, vB.join(" / "))

  // ── C · quatro termos do MESMO fato: antes passava, agora reprova ────────
  const C: Caso = {
    termos: [
      { texto: "impulso que afirma", origem: "Marte", fato_id: C3 },
      { texto: "fundo que se expõe", origem: "Plutão", fato_id: C3 },
      { texto: "faces que se medem", origem: "oposição", fato_id: C3 },
      { texto: "profundidade em revisão", origem: "retrogradação de Plutão", fato_id: C3 },
    ],
    sintese: "Impulso que afirma encontra fundo que se expõe, enquanto faces que se medem sustentam profundidade em revisão. O dia segue firme.",
  }
  const vC = violacoesEm(DIA_COLISAO, "pt", C)
  confere("M · C. quatro termos de um fato só reprovam a abrangência", vC.some((v) => v.includes("mesmo fato")), vC.join(" / ") || "(APROVADO, falsamente)")

  // ── os casos restantes do contrato ───────────────────────────────────────
  const semFato: Caso = { ...A, termos: A.termos.map((t, i) => (i === 0 ? { ...t, fato_id: "" } : t)) }
  confere(
    "M · fato_id vazio reprova com nome",
    violacoesEm(DIA_COLISAO, "pt", semFato).some((v) => v.includes('fato_id "(vazio)"')),
    violacoesEm(DIA_COLISAO, "pt", semFato).join(" / "),
  )

  const fatoInventado: Caso = { ...A, termos: A.termos.map((t, i) => (i === 0 ? { ...t, fato_id: "aspecto:nao~existe:conjunction" } : t)) }
  confere(
    "M · fato_id inexistente reprova",
    violacoesEm(DIA_COLISAO, "pt", fatoInventado).some((v) => v.includes("não está entre os fatos de hoje")),
    violacoesEm(DIA_COLISAO, "pt", fatoInventado).join(" / "),
  )

  // "Sol" existe nos fatos de hoje, mas não nas origens do fato declarado
  const origemDeOutroFato: Caso = { ...A, termos: A.termos.map((t, i) => (i === 0 ? { ...t, origem: "Sol" } : t)) }
  const vOutro = violacoesEm(DIA_COLISAO, "pt", origemDeOutroFato)
  confere("M · origem que existe, mas não naquele fato, reprova", vOutro.some((v) => v.includes("não é uma das origens de")), vOutro.join(" / "))

  // o mesmo par (fato_id, origem) duas vezes continua sendo duplicação real
  const parRepetido: Caso = {
    ...A,
    termos: A.termos.map((t, i) => (i === 2 ? { ...t, origem: "oposição", fato_id: C2 } : t)),
  }
  confere(
    "M · o mesmo par usado duas vezes reprova",
    violacoesEm(DIA_COLISAO, "pt", parRepetido).some((v) => v.includes("usada por mais de um termo")),
    violacoesEm(DIA_COLISAO, "pt", parRepetido).join(" / "),
  )

  // ── `desafiadora`: adjetivo passa, verbo reprova ─────────────────────────
  const DESAFIAR: Record<Locale, { passa: string[]; reprova: string[] }> = {
    pt: {
      passa: ["o período é desafiador", "uma dinâmica desafiadora", "os desafios seguem visíveis"],
      reprova: ["este movimento desafia você a agir", "os movimentos desafiam você a agir", "o céu está desafiando você"],
    },
    en: { passa: ["the challenges remain visible", "a challenging shape holds"], reprova: ["this movement challenges you to act"] },
    es: {
      passa: ["el período es desafiador", "una dinámica desafiadora", "los desafíos siguen visibles"],
      reprova: ["este movimiento te desafía a actuar", "los movimientos desafían lo establecido"],
    },
  }
  for (const locale of LOCALES) {
    for (const t of DESAFIAR[locale].passa) {
      confere(`M · ${locale}: "${t.slice(0, 34)}" passa`, pedidoDoCeu(t, locale).length === 0, `pegou: ${pedidoDoCeu(t, locale).join(", ")}`)
    }
    for (const t of DESAFIAR[locale].reprova) {
      confere(`M · ${locale}: "${t.slice(0, 34)}" reprova`, pedidoDoCeu(t, locale).length > 0, "passou sem violação")
    }
  }

  // ── a regra do ângulo, agora no idioma pedido ───────────────────────────
  const MARCA_ANGULO: Record<Locale, RegExp> = {
    pt: /PELO MENOS UM TERMO VEM DE UM ÂNGULO/,
    en: /AT LEAST ONE TERM COMES FROM AN ANGLE/,
    es: /AL MENOS UN TÉRMINO VIENE DE UN ÁNGULO/,
  }
  for (const locale of LOCALES) {
    const sys = sistemaDoCeu(locale, 4)
    confere(`M · ${locale}: a regra do ângulo está no idioma pedido`, MARCA_ANGULO[locale].test(sys))
    confere(`M · ${locale}: o contrato exige fato_id`, /fato_id/.test(sys))
    const { escolhidos } = fatosDoCeu(estadoDoCeu(DIA_COLISAO), locale)
    const { user } = promptCeuDoDia(estadoDoCeu(DIA_COLISAO), escolhidos, locale)
    for (const f of escolhidos) confere(`M · ${locale}: o pedido expõe o fato_id ${f.id}`, user.includes(`fato_id: ${f.id}`))
  }

  // ── cache antigo, sem fato_id, continua legível ─────────────────────────
  // A leitura do cache não revalida `termos`: devolve o que está gravado e
  // nunca chama `verificarCeu`. Linha gravada antes desta mudança não tem
  // `fato_id`, e precisa seguir servindo sem conversão.
  const antigo = [{ texto: "comunicação intensa", origem: "Mercúrio" }] as TermoDoCeu[]
  confere("M · termo antigo sem fato_id é tipo válido", antigo[0].fato_id === undefined && antigo[0].texto.length > 0)

  const fonteServer = readFileSync(new URL("../lib/astro/ceu-do-dia-server.ts", import.meta.url), "utf8")
  confere("M · a leitura do cache não revalida termos", !/verificarCeu/.test(fonteServer.slice(fonteServer.indexOf("async function ler("), fonteServer.indexOf("async function ler(") + 600)))
  const fonteCeu = readFileSync(new URL("../lib/astro/ceu-do-dia.ts", import.meta.url), "utf8")
  // procura DECLARAÇÃO e USO, não a palavra: ela aparece no comentário que
  // explica por que a resolução por primeiro match foi embora
  confere("M · `fatoDaOrigem` não é declarada nem usada", !/const\s+fatoDaOrigem|fatoDaOrigem\s*\.\s*(get|set|has)/.test(fonteCeu), "a resolução por primeiro match voltou")
  confere("M · `origensValidas` global não é declarada nem usada", !/const\s+origensValidas|origensValidas\s*\.\s*has/.test(fonteCeu), "a validação global de origem voltou")
}

async function main() {
  parteA()
  parteB()
  parteC()
  parteD()
  parteE()
  parteF()
  parteG()
  parteH()
  parteI()
  parteJ()
  parteL()
  parteM()
  await parteK()

  if (falhas.length) {
    console.error(`\nA leitura do céu falhou em ${falhas.length} ponto(s):\n`)
    for (const f of falhas) console.error(`  ${f}`)
    console.error("")
    process.exit(1)
  }
  console.log(`céu do dia: ${conferidos} conferências, idioma cobrado e regras editoriais em pt/en/es`)
}

main()
