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
import { readFileSync } from "node:fs"
import { estadoDoCeu } from "../lib/astro/ceu"
import { fatosDoCeu, verificarCeu, sistemaDoCeu } from "../lib/astro/ceu-do-dia"
import { ESFERA_DE_VIDA, PEDIDO, idiomaDivergente } from "../lib/astro/editorial"
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
    confere(`C · ${locale}: texto correto não é acusado de pedido`, pedido.length === 0, pedido.join(" / "))
    confere(`C · ${locale}: texto correto não é acusado de esfera de vida`, esfera.length === 0, esfera.join(" / "))
    confere(`C · ${locale}: texto correto não é acusado de idioma errado`, idioma.length === 0, idioma.join(" / "))
  }
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
  const PT_PEDIDO_ORIGINAL = "(exig|ped(e|indo)|demand|convid|favorec|desafi|propõe|sugere|aconselha)\\w*"
  const PT_ESFERA_ORIGINAL = "(afetiv|afeto|amoros|relaç|relacionament|vínculo|trabalh|carreir|financ|dinheiro|saúde|família)\\w*"
  confere("E · o PT de PEDIDO é a lista original, intacta", PEDIDO.pt.length === 1 && PEDIDO.pt[0].source === PT_PEDIDO_ORIGINAL, PEDIDO.pt.map((r) => r.source).join(" "))
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
  confere("E · `ceu-do-dia.ts` usa as tabelas por idioma", /PEDIDO\[locale\]/.test(fonte) && /ESFERA_DE_VIDA\[locale\]/.test(fonte))

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

function main() {
  parteA()
  parteB()
  parteC()
  parteD()
  parteE()

  if (falhas.length) {
    console.error(`\nA leitura do céu falhou em ${falhas.length} ponto(s):\n`)
    for (const f of falhas) console.error(`  ${f}`)
    console.error("")
    process.exit(1)
  }
  console.log(`céu do dia: ${conferidos} conferências, idioma cobrado e regras editoriais em pt/en/es`)
}

main()
