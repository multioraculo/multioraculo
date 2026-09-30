/**
 * Proteção da síntese pessoal das interconexões.
 *
 * Cobre o que o produto promete e o que ele nunca pode fazer:
 *  A. o verificador barra invenção, previsão, conselho e frase genérica;
 *  B. o molde determinístico passa pelo próprio verificador;
 *  C. o fluxo inteiro: geração, reparo, molde, cache e mapa corrigido.
 *
 * Nenhuma chamada paga: o modelo é uma função local que devolve o que o teste
 * mandar. O PostgREST é falso e roda no processo.
 */
import http from "http"
import type { AddressInfo } from "net"
import { corposEm, diaDeHoje, estadoDoCeu } from "../lib/astro/ceu"
import { mapaNatal, type DadosNascimento } from "../lib/astro/mapa"
import { interconexoesDoDia } from "../lib/astro/interconexoes"
import { fatosPessoais } from "../lib/astro/fatos-interconexoes"
import { verificarSintesePessoal } from "../lib/astro/verificador-interconexoes"
import { promptInterconexoes } from "../lib/astro/prompt-interconexoes"
import { sinteseDeterministica } from "../lib/astro/fallback-interconexoes"
import { hashDoMapa } from "../lib/astro/interconexoes-server"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

// ── um mapa de verdade, e os fatos reais de hoje ────────────────────────────
const NASCIMENTO: DadosNascimento = {
  born_on: "1988-03-14",
  born_at: "21:40",
  lat: -19.92,
  lon: -43.94,
  place_label: "Belo Horizonte, MG",
  tz: "America/Sao_Paulo",
}

const dia = diaDeHoje()
const mapa = mapaNatal(NASCIMENTO)
const ceu = estadoDoCeu(dia)
const { escolhidas } = interconexoesDoDia(mapa, ceu, corposEm(ceu.jdMeio + 1 / 24))
const fatos = fatosPessoais({ mapa, escolhidas, locale: "pt" })

// ── A · o verificador ───────────────────────────────────────────────────────
function parteA() {
  confere("há fatos para trabalhar", fatos.length > 0, "nenhum fato gerado para o mapa de teste")

  const principal = fatos.find((f) => f.tipo === "interconexao")
  const boa = {
    afirmacoes: [
      { texto: "algo se aproxima do seu mapa", fato: principal?.id ?? "f1" },
      { texto: "e outra coisa se afasta", fato: fatos[1]?.id ?? "f1" },
    ],
    sintese: `Algo se aproxima do seu mapa hoje. E outra coisa se afasta ao mesmo tempo. ${principal?.texto.split(" ").slice(0, 3).join(" ")}.`,
  }

  const recusas: Array<[string, unknown]> = [
    ["síntese vazia", { afirmacoes: [], sintese: "" }],
    [
      "planeta que não está nos fatos",
      { ...boa, sintese: "Plutão toca seu mapa hoje de um jeito que você reconhece agora. E segue." },
    ],
    [
      "afirma futuro",
      { ...boa, sintese: `Hoje algo vai acontecer no seu mapa. ${principal?.texto.split(" ").slice(0, 3).join(" ")}.` },
    ],
    [
      "dá conselho",
      { ...boa, sintese: `Procure observar o que se move. ${principal?.texto.split(" ").slice(0, 3).join(" ")}.` },
    ],
    [
      "genérico: não nomeia nada dos fatos",
      { afirmacoes: boa.afirmacoes, sintese: "Hoje é um dia de movimento. Algo se organiza por dentro." },
    ],
    ["fato declarado que não existe", { ...boa, afirmacoes: [{ texto: "x", fato: "f999" }, { texto: "y", fato: "f998" }] }],
  ]

  for (const [nome, bruto] of recusas) {
    const v = verificarSintesePessoal({ bruto, fatos, locale: "pt" })
    confere(`recusa: ${nome}`, !v.ok, "foi aceita")
  }
}

// ── B · o molde passa no próprio verificador ────────────────────────────────
function parteB() {
  const molde = sinteseDeterministica(fatos, "pt")
  const v = verificarSintesePessoal({ bruto: molde, fatos, locale: "pt" })
  confere("o molde determinístico passa no verificador", v.ok, v.ok ? "" : v.violacoes.join(" | "))
  confere("o molde nomeia algo real", molde.sintese.length > 40, `saiu com ${molde.sintese.length} caracteres`)
  confere(
    "o molde não usa linguagem de encher",
    !/transforma|crescimento|jornada|energia/i.test(molde.sintese),
    molde.sintese.slice(0, 80),
  )

  // as duas coisas que a primeira geração real entregou erradas ao leitor
  confere("o molde não tem vírgula dobrada", !/,\s*,/.test(molde.sintese), molde.sintese.slice(0, 90))
  confere("o molde concorda em gênero", !/\bseu (Lua|Vênus)\b/.test(molde.sintese), molde.sintese.slice(0, 90))

  // o molde é lido pelo leitor: em inglês e espanhol ele não pode sair meio em
  // português, que foi como este arquivo nasceu
  for (const [loc, intruso] of [["en", /\b(faz|com orbe de|está em|se aproximando|se afastando)\b/i], ["es", /\b(faz|está em|se aproximando|se afastando)\b/i]] as const) {
    const f = fatosPessoais({ mapa, escolhidas, locale: loc })
    const m = sinteseDeterministica(f, loc)
    confere(`o molde em ${loc} não tem português dentro`, !intruso.test(m.sintese), m.sintese.slice(0, 110))
    confere(`o molde em ${loc} passa no verificador`, verificarSintesePessoal({ bruto: m, fatos: f, locale: loc }).ok)
  }
}

/**
 * F. A CAMADA CONCRETA.
 *
 * O exemplo concreto é o que faz a leitura parecer sobre a vida de alguém, e é
 * também o lugar mais fácil de inventar. Estas conferências não julgam se o
 * exemplo é bom: exigem que ele esteja preso em alguma coisa.
 *
 * O QUE ELAS NÃO PEGAM, e é bom estar escrito: conteúdo concreto afirmado SEM
 * marca de hipótese. "pode aparecer como dúvidas sobre investimentos" é visto;
 * "dúvidas sobre investimentos", solto no meio da frase, não é, porque não
 * existe sinal que separe isso de interpretação comum sem um analisador de
 * língua. Contra esse caso valem o prompt e o veto de previsão, não esta lista.
 */
function parteF() {
  const principal = fatos.find((f) => f.tipo === "interconexao")!
  const nomeReal = principal.texto.split(" ")[0]

  // uma síntese onde a frase do exemplo vem logo depois de nomear o fato, que
  // é a forma que o produto pede
  const monta = (exemplo: string) => ({
    afirmacoes: [
      { texto: `${nomeReal} toca um ponto seu`, fato: principal.id },
      { texto: "e o segundo ponto responde", fato: fatos[1]?.id ?? principal.id },
    ],
    // o exemplo vem LOGO DEPOIS da frase que nomeia o fato: é essa vizinhança
    // que o liga a uma relação medida
    sintese: `${nomeReal} toca um ponto seu hoje. ${exemplo} E o segundo ponto responde.`,
  })

  const bom = "Isso pode aparecer como vontade de reorganizar o espaço de casa."
  const v = verificarSintesePessoal({ bruto: monta(bom), fatos, locale: "pt" })
  confere("exemplo na frase seguinte à do fato passa", v.ok, v.ok ? "" : v.violacoes.join(" | "))

  // e o caso mais comum na prosa: interpretação e exemplo na MESMA frase
  const juntos = {
    afirmacoes: [
      { texto: `${nomeReal} toca um ponto seu`, fato: principal.id },
      { texto: "e o segundo ponto responde", fato: fatos[1]?.id ?? principal.id },
    ],
    sintese: `${nomeReal} toca um ponto seu hoje, o que pode aparecer como vontade de reorganizar a casa. E o segundo ponto responde.`,
  }
  const vj = verificarSintesePessoal({ bruto: juntos, fatos, locale: "pt" })
  confere("exemplo na mesma frase do fato passa", vj.ok, vj.ok ? "" : vj.violacoes.join(" | "))

  const recusas: Array<[string, unknown]> = [
    [
      "exemplo solto, sem fato nenhum por perto",
      {
        afirmacoes: [
          { texto: `${nomeReal} toca um ponto seu`, fato: principal.id },
          { texto: "e o segundo responde", fato: fatos[1]?.id ?? principal.id },
        ],
        // o exemplo fica longe de qualquer nome de fato: a frase dele e a
        // anterior não nomeiam nada
        sintese: `${nomeReal} toca um ponto seu hoje. E o segundo responde. O dia segue assim. Isso pode aparecer como vontade de mudar a rotina.`,
      },
    ],
    ["exemplo com hora que ninguém calculou", monta("Isso pode aparecer como uma conversa às 15h.")],
    ["exemplo com dia da semana", monta("Isso pode surgir como um assunto que volta na quinta-feira.")],
    ["exemplo com mês", monta("Isso pode se manifestar como um plano guardado desde janeiro.")],
    ["exemplo com período do dia", monta("Isso pode ser sentido como um cansaço à noite.")],
    [
      "exemplo que desobedece ao veto de expressões",
      monta("Isso pode aparecer como uma mudança de energias em casa."),
    ],
  ]

  for (const [nome, bruto] of recusas) {
    const r = verificarSintesePessoal({ bruto, fatos, locale: "pt" })
    confere(`recusa: ${nome}`, !r.ok, "foi aceita")
  }

  // teto: dois exemplos por relação medida
  const muitos = {
    afirmacoes: [
      { texto: `${nomeReal} toca um ponto seu`, fato: principal.id },
      { texto: "e o segundo responde", fato: fatos[1]?.id ?? principal.id },
    ],
    sintese:
      `${nomeReal} toca um ponto seu hoje. E o segundo responde. ` +
      Array.from({ length: 9 }, (_, i) => `${nomeReal} pode aparecer como coisa ${"a".repeat(i + 1)}.`).join(" "),
  }
  confere("recusa: exemplos demais", !verificarSintesePessoal({ bruto: muitos, fatos, locale: "pt" }).ok, "foi aceita")

  // a casa natal é o que permite escolher o terreno da vida sem chutar
  const comCasa = fatos.filter((f) => f.tipo === "interconexao" && /casa \d/.test(f.texto))
  confere(
    "os fatos trazem a casa do ponto natal",
    comCasa.length > 0 || escolhidas.every((c) => c.ponto.tipo === "angulo" || c.ponto.casa === null),
    "nenhuma interconexão de corpo natal diz em que casa ela cai",
  )

  // o molde não inventa exemplo nenhum, e continua passando
  const molde = sinteseDeterministica(fatos, "pt")
  confere(
    "o molde não traz exemplo concreto",
    !/pode (aparecer|surgir|se manifestar|ser percebido|ser sentido)/i.test(molde.sintese),
    molde.sintese.slice(0, 90),
  )
}

/**
 * E. O PROMPT NÃO PODE CONTRARIAR O VERIFICADOR.
 *
 * O verificador reprova síntese que não nomeia nada dos fatos. O prompt já
 * disse, uma vez, "sem nomear a técnica", e o modelo entendeu que não podia
 * nomear planeta nenhum: TODA geração reprovava e gastava uma chamada de reparo
 * para pôr os nomes de volta. Custou o dobro em dinheiro e em segundos, e só
 * apareceu numa geração de verdade. Este teste é o que impede a volta disso.
 */
function parteE() {
  const { user } = promptInterconexoes({ fatos, locale: "pt" })
  confere("prompt: manda NOMEAR os corpos da lista", /NOMEIE os corpos/.test(user), "a instrução sumiu")
  confere(
    "prompt: não manda esconder os nomes",
    !/sem nomear a t[ée]cnica/i.test(user),
    "voltou a frase que o modelo lê como 'não cite planeta'",
  )
}

// ── C · o fluxo inteiro ─────────────────────────────────────────────────────
async function parteC() {
  let linha: Record<string, unknown> | null = null
  const servidor = http.createServer((req, res) => {
    let corpo = ""
    req.on("data", (c) => (corpo += String(c)))
    req.on("end", () => {
      res.writeHead(req.method === "POST" ? 201 : 200, { "content-type": "application/json" })
      if (req.method === "POST") {
        try {
          const b = JSON.parse(corpo)
          linha = Array.isArray(b) ? b[0] : b
        } catch {}
        return res.end("[]")
      }
      if (req.url?.includes("select=dia&")) return res.end("[]")
      return res.end(JSON.stringify(linha))
    })
  })
  await new Promise<void>((r) => servidor.listen(0, "127.0.0.1", r))
  process.env.NEXT_PUBLIC_SUPABASE_URL = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`
  process.env.SUPABASE_SERVICE_ROLE_KEY = "teste"

  const { sinteseDoDia } = await import("../lib/astro/interconexoes-server")
  const hash = hashDoMapa({ born_on: NASCIMENTO.born_on, born_at: NASCIMENTO.born_at, tz: NASCIMENTO.tz!, lat: NASCIMENTO.lat, lon: NASCIMENTO.lon })
  const base = { userId: "00000000-0000-0000-0000-000000000001", dia, locale: "pt" as const, mapa, escolhidas }

  // 1 · geração boa de primeira
  const principal = fatos.find((f) => f.tipo === "interconexao")!
  const nomeReal = principal.texto.split(" ")[0]
  const boa = JSON.stringify({
    afirmacoes: [
      { texto: `${nomeReal} chega perto de um ponto seu`, fato: principal.id },
      { texto: "e o ângulo ainda não fechou", fato: fatos[1]?.id ?? principal.id },
    ],
    sintese: `${nomeReal} chega perto de um ponto seu hoje. E o ângulo ainda não fechou.`,
  })
  let chamadas = 0
  const gerarBom = async () => {
    chamadas += 1
    return { conteudo: boa, model: "gpt-4o", usage: { prompt_tokens: 1200, completion_tokens: 200 } }
  }

  const r1 = await sinteseDoDia({ ...base, mapaHash: hash, gerar: gerarBom })
  confere("geração: devolve síntese", Boolean(r1.sintese), "veio vazia")
  confere("geração: não veio do cache", r1.cache === false)
  confere("geração: modo generated", r1.diagnostico?.modo === "generated", String(r1.diagnostico?.modo))
  confere("geração: uma chamada só", chamadas === 1, `foram ${chamadas}`)

  // 2 · segunda abertura: cache, sem chamar o modelo
  chamadas = 0
  const r2 = await sinteseDoDia({ ...base, mapaHash: hash, gerar: gerarBom })
  confere("cache: segunda abertura vem do cache", r2.cache === true)
  confere("cache: o modelo NÃO foi chamado", chamadas === 0, `foi chamado ${chamadas} vez(es)`)
  confere("cache: mesmo texto", r2.sintese === r1.sintese)

  // 3 · mapa corrigido: hash muda, a linha antiga não serve
  chamadas = 0
  const outroHash = hashDoMapa({ born_on: "1988-03-14", born_at: "22:10", tz: NASCIMENTO.tz!, lat: NASCIMENTO.lat, lon: NASCIMENTO.lon })
  confere("hash: mapa diferente gera hash diferente", outroHash !== hash)
  const r3 = await sinteseDoDia({ ...base, mapaHash: outroHash, gerar: gerarBom })
  confere("hash: mapa corrigido NÃO reusa a síntese antiga", r3.cache === false)
  confere("hash: o modelo foi chamado de novo", chamadas === 1, `foi chamado ${chamadas} vez(es)`)

  // 4 · reprovação sempre: dois reparos e depois o molde
  linha = null
  chamadas = 0
  const gerarRuim = async () => {
    chamadas += 1
    return {
      conteudo: JSON.stringify({ afirmacoes: [{ texto: "x", fato: "f999" }], sintese: "Hoje é um dia de movimento." }),
      model: "gpt-4o",
      usage: { prompt_tokens: 1200, completion_tokens: 200 },
    }
  }
  const r4 = await sinteseDoDia({ ...base, mapaHash: hash, gerar: gerarRuim })
  confere("falha: termina COM síntese", Boolean(r4.sintese), "ficou sem leitura")
  confere("falha: modo fallback", r4.diagnostico?.modo === "fallback", String(r4.diagnostico?.modo))
  confere("falha: 1 geração + 2 reparos", chamadas === 3, `foram ${chamadas}`)
  confere("falha: o texto genérico não sobreviveu", !r4.sintese.includes("dia de movimento"), r4.sintese.slice(0, 60))

  servidor.close()
}

/**
 * D. SEM PLANO, ZERO CHAMADA. Isto se prova pela ORDEM no arquivo da rota: a
 * checagem de plano tem de vir antes de a chave da OpenAI ser lida e antes de o
 * cliente ser construído. Se alguém inverter essas linhas um dia, o produto
 * passa a gerar leitura paga para depois escondê-la, e o teste cai aqui.
 */
async function parteD() {
  const fs = await import("fs")
  const arquivo = fs.readFileSync("app/api/interconexoes/sintese/route.ts", "utf8")
  // só o CORPO da função: os imports no topo citam tudo e atrapalhariam a ordem
  const rota = arquivo.slice(arquivo.indexOf("export async function POST"))

  const iSessao = rota.indexOf("auth.getUser()")
  const iPlano = rota.indexOf("getUserEntitlement")
  const i402 = rota.indexOf("plano_necessario")
  const iChave = rota.indexOf("process.env.OPENAI_API_KEY")
  const iCliente = rota.indexOf("new OpenAI(")

  confere("rota: o usuário vem da sessão", iSessao > 0)
  confere("rota: o usuário NUNCA vem do corpo do pedido", !/req(uest)?\.json\(\)/.test(rota), "a rota lê o corpo")
  confere("rota: plano conferido depois da sessão", iPlano > iSessao, "a ordem está trocada")
  confere("rota: sem plano devolve 402", i402 > 0 && i402 > iPlano)
  confere("rota: o 402 acontece ANTES de ler a chave da OpenAI", i402 < iChave, "a chave é lida antes da checagem")
  confere("rota: o 402 acontece ANTES de construir o cliente", i402 < iCliente, "o cliente nasce antes da checagem")
}

async function main() {
  parteA()
  parteB()
  parteE()
  parteF()
  await parteC()
  await parteD()

  if (falhas.length) {
    console.error(`\nA síntese das interconexões falhou em ${falhas.length} ponto(s):\n`)
    for (const f of falhas) console.error(`  ${f}`)
    console.error("")
    process.exit(1)
  }
  console.log(`interconexões: ${conferidos} conferências, molde aprovado, cache e mapa_hash respeitados`)
}

main()
