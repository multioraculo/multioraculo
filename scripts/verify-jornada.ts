/**
 * Jornada dos Sonhos: elegibilidade, persistência, isolamento e editorial.
 *
 * O que este verificador existe para impedir:
 *
 *  1. a regra de disponibilidade voltar a divergir entre tela e rota (a tela
 *     exigia 4 sonhos, a rota 3): zero, um, dois e três ou mais;
 *  2. análise desatualizada passando por nova, ou citando sonho excluído;
 *  3. consulta a sonhos ou análises de outra pessoa;
 *  4. chamada ao modelo (e cobrança) com a análise já em dia;
 *  5. o prompt contaminado por exemplo, travessão, ou sem a escala certa
 *     (dois sonhos nunca viram "padrão recorrente");
 *  6. travessão, diagnóstico, previsão, redução a medo/bloqueio, conexão sem
 *     ancoragem e repetição entre campos no texto gerado, em PT, EN e ES.
 *
 * As análises abaixo são fixtures escritas à mão. Zero IA, zero rede.
 */
import fs from "node:fs"
import path from "node:path"
import {
  carregarSonhosDoUsuario,
  decidirJornada,
  estadoDaJornada,
  janelaDeSonhos,
  lerAnalise,
  MAX_SONHOS,
  salvarAnalise,
  ultimaAnaliseDoUsuario,
  type JornadaV2,
  type LinhaDeJornada,
  type SonhoDaJornada,
} from "../lib/dreams/jornada-estado"
import { consultarJornadaEmAndamento, httpStatusFor, JORNADA_TRAVA_MS, PRIMEIRA_JORNADA_FIM, PRIMEIRA_JORNADA_INICIO, regraDeConsumo } from "../lib/billing/usage"
import { STARTED_WINDOW_MS } from "../lib/billing/entitlement"
import { E1, E2, R1, R2, R3, REAL_1, REAL_3, REAL_4 } from "./fixtures-bateria-jornada"
import { executarJornada, type DepsJornada } from "../lib/dreams/jornada-servico"
import { montarMensagemJornada, montarPromptJornada, normalizarJornada, verificarJornada } from "../lib/oracles/jornada-sonhos"
import { LOCALES } from "../lib/i18n/config"
import type { Locale } from "../lib/i18n/config"
import { pt } from "../lib/i18n/dictionaries/pt"
import { en } from "../lib/i18n/dictionaries/en"
import { es } from "../lib/i18n/dictionaries/es"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

// ── sonhos de exemplo ─────────────────────────────────────────────────────────
const S = (id: string, dia: number, texto: string): SonhoDaJornada => ({
  id,
  dream_description: texto,
  created_at: `2026-09-${String(dia).padStart(2, "0")}T12:00:00.000Z`,
})
const PT_S1 = S("d1", 1, "Eu estava diante de um rio largo e uma ponte quebrada impedia a passagem. Do outro lado, minha avó acenava. Tentei atravessar a nado e a correnteza me devolveu à margem.")
const PT_S2 = S("d2", 5, "Atravessei um corredor comprido de uma escola vazia e abri uma porta que dava num campo desconhecido. Havia um barco parado e ninguém por perto. Eu não sabia se tinha chegado ou se estava só de passagem.")
const PT_S3 = S("d3", 9, "Estava num barco pequeno, remando sozinha num rio calmo. Na margem, uma casa com a luz acesa. Não remei até lá; fiquei olhando a luz e deixei o barco seguir.")
const EN_S1 = S("d1", 1, "I stood before a wide river and a broken bridge blocked the way. On the other side my grandmother was waving. I tried to swim across and the current pushed me back to the bank.")
const EN_S2 = S("d2", 5, "I walked down a long corridor in an empty school and opened a door onto an unknown field. A boat sat idle and nobody was around. I could not tell whether I had arrived or was only passing through.")
const ES_S1 = S("d1", 1, "Estaba frente a un río ancho y un puente roto impedía el paso. Del otro lado, mi abuela me saludaba. Intenté cruzar a nado y la corriente me devolvió a la orilla.")
const ES_S2 = S("d2", 5, "Crucé un pasillo largo de una escuela vacía y abrí una puerta que daba a un campo desconocido. Había un bote quieto y nadie cerca. No sabía si había llegado o solo estaba de paso.")

function jornada(over: Partial<JornadaV2> & Pick<JornadaV2, "dreamIds" | "timeline" | "connections" | "integrated" | "openQuestions">, locale = "pt"): JornadaV2 {
  return { versao: 2, locale, evolution: [], ...over }
}
const tl = (...itens: Array<[string, string, string]>) => itens.map(([title, archetypes, summary], i) => ({ number: i + 1, title, archetypes, summary }))

const BOA: Record<string, { sonhos: SonhoDaJornada[]; j: JornadaV2; locale: Locale }> = {
  "pt-2": {
    locale: "pt",
    sonhos: [PT_S1, PT_S2],
    j: jornada({
      dreamIds: ["d1", "d2"],
      timeline: tl(
        ["A ponte quebrada", "rio · ponte · avó · correnteza", "A passagem é impedida; do outro lado alguém conhecido acena, e a tentativa de cruzar a nado devolve à margem."],
        ["O corredor e o campo desconhecido", "corredor · porta · campo · barco", "A passagem acontece e conduz a um lugar sem referências, onde a dúvida é se houve chegada."],
      ),
      connections: [
        "Em ambos os sonhos há um limite a cruzar, primeiro uma ponte quebrada sobre o rio, depois uma porta ao fim do corredor. O que muda é o que o limite faz: bloqueia no primeiro sonho e cede no segundo. Isso pode indicar um deslocamento na maneira como a passagem aparece.",
        "A figura conhecida muda de lugar. A avó acena do outro lado do rio, como chamado e destino; no campo desconhecido ninguém está por perto. Uma hipótese é que a companhia deixou de ser o ponto de referência da travessia, embora possa ser só uma diferença de cenário.",
        "O barco parado surge uma única vez e altera a leitura do conjunto: é o primeiro meio de transporte, onde antes havia o esforço do corpo a nado. Pode sugerir que a travessia deixa de depender do esforço e passa a depender de algo que ninguém conduz.",
      ],
      integrated:
        "Lidos juntos, os dois sonhos parecem tratar de um limite que primeiro impede e depois deixa passar, sem entregar um destino. Quem sonha oscila entre tentar vencer a água pela força e chegar a um lugar sem sinais de chegada. É uma leitura possível entre outras, e com dois sonhos ela permanece uma hipótese inicial.",
      openQuestions: [
        "Não está claro se o campo desconhecido é um destino ou apenas outra etapa da passagem.",
        "Fica em aberto se a ausência de companhia no segundo sonho marca uma mudança ou é um acaso do cenário.",
      ],
    }),
  },
  "pt-3": {
    locale: "pt",
    sonhos: [PT_S1, PT_S2, PT_S3],
    j: jornada({
      dreamIds: ["d1", "d2", "d3"],
      timeline: tl(
        ["A ponte quebrada", "rio · ponte · avó · correnteza", "Passagem impedida, alguém conhecido do outro lado."],
        ["O corredor e o campo desconhecido", "corredor · porta · campo · barco", "Passagem cumprida, destino sem referências."],
        ["O barco à deriva", "barco · rio calmo · casa · luz", "Quem sonha remava sozinha e deixou o barco seguir diante da luz da margem."],
      ),
      connections: [
        "O rio volta no terceiro sonho, agora calmo, e o barco que estava parado no campo passa a ser ocupado por quem sonha. A água deixa de ser o que repele e vira o meio em que se está.",
        "A luz acesa na casa da margem faz o papel que a avó tinha no primeiro sonho: algo visível do outro lado. A diferença é que dessa vez não há tentativa de alcançar, só o olhar.",
        "Nos três sonhos a chegada fica sem confirmação. Pode sugerir que a travessia importa mais do que o destino, ou apenas que o material ainda não mostra um destino.",
      ],
      evolution: [
        { type: "persists", text: "O rio permanece como cenário, ora obstáculo, ora lugar de percurso." },
        { type: "changed", text: "A posição de quem sonha passa de tentar cruzar a nado para conduzir um barco e, por fim, deixá-lo seguir." },
        { type: "gaining", text: "A luz na margem ganha o lugar que a figura da avó ocupava, sem aproximação." },
        { type: "revised", text: "A hipótese de que a passagem buscava um destino perde apoio quando olhar a luz parece bastar." },
      ],
      integrated:
        "Com três sonhos, o rio deixa de ser só barreira e passa a ser o lugar em que se está. A mudança mais visível é de posição: de quem tenta vencer para quem acompanha. É uma leitura possível, sujeita a revisão com novos sonhos.",
      openQuestions: [
        "Continua incerto se a luz na margem substitui a figura da avó ou apenas ocupa o mesmo espaço da cena.",
        "Não se sabe se o barco sem rumo no terceiro sonho é descanso ou ausência de direção.",
      ],
    }),
  },
  "en-2": {
    locale: "en",
    sonhos: [EN_S1, EN_S2],
    j: jornada({
      locale: "en",
      dreamIds: ["d1", "d2"],
      timeline: tl(
        ["The broken bridge", "river · bridge · grandmother · current", "The crossing is blocked; someone familiar waves from the far side, and swimming only returns the dreamer to the bank."],
        ["The corridor and the unknown field", "corridor · door · field · boat", "The crossing happens and leads somewhere without landmarks, where it is unclear whether anything was reached."],
      ),
      connections: [
        "Both dreams have a threshold to cross, first a broken bridge over the river, then a door at the end of the corridor. What changes is what the threshold does: it blocks in the first dream and gives way in the second. That may point to a shift in how the idea of passage appears.",
        "The familiar figure changes place. The grandmother waves from across the river, as a call and a destination; in the unknown field nobody is near. One hypothesis is that company stopped being the reference point of the crossing, though it could just be a difference of scenery.",
        "The idle boat appears once and alters the reading of the whole: it is the first vehicle, where before there was the effort of swimming. It might suggest that the crossing stops depending on effort and begins to depend on something nobody steers.",
      ],
      integrated:
        "Read together, the two dreams seem to concern a threshold that first stops and then allows passage, without delivering a destination. The dreamer moves between trying to beat the water by force and reaching a place with no sign of arrival. This is one possible reading among others, and with two dreams it remains an initial hypothesis.",
      openQuestions: [
        "It is unclear whether the unknown field is a destination or only another stage of the passage.",
        "It stays open whether the absence of company in the second dream marks a change or a quirk of the scenery.",
      ],
    }, "en"),
  },
  "es-2": {
    locale: "es",
    sonhos: [ES_S1, ES_S2],
    j: jornada({
      locale: "es",
      dreamIds: ["d1", "d2"],
      timeline: tl(
        ["El puente roto", "río · puente · abuela · corriente", "El paso está impedido; del otro lado alguien conocido saluda, y nadar solo devuelve a la orilla."],
        ["El pasillo y el campo desconocido", "pasillo · puerta · campo · bote", "El paso ocurre y conduce a un lugar sin referencias, donde no se sabe si hubo llegada."],
      ),
      connections: [
        "En ambos sueños hay un límite que cruzar, primero un puente roto sobre el río, luego una puerta al final del pasillo. Lo que cambia es lo que hace el límite: bloquea en el primer sueño y cede en el segundo. Eso puede indicar un desplazamiento en la manera en que aparece el paso.",
        "La figura conocida cambia de lugar. La abuela saluda desde el otro lado del río, como llamado y destino; en el campo desconocido nadie está cerca. Una hipótesis es que la compañía dejó de ser el punto de referencia de la travesía, aunque podría ser solo una diferencia de escenario.",
        "El bote quieto aparece una sola vez y altera la lectura del conjunto: es el primer medio de transporte, donde antes estaba el esfuerzo de nadar. Podría sugerir que la travesía deja de depender del esfuerzo y pasa a depender de algo que nadie conduce.",
      ],
      integrated:
        "Leídos juntos, los dos sueños parecen tratar de un límite que primero impide y luego deja pasar, sin entregar un destino. Quien sueña oscila entre intentar vencer el agua por la fuerza y llegar a un lugar sin señales de llegada. Es una lectura posible entre otras, y con dos sueños sigue siendo una hipótesis inicial.",
      openQuestions: [
        "No está claro si el campo desconocido es un destino o solo otra etapa del paso.",
        "Queda abierto si la ausencia de compañía en el segundo sueño marca un cambio o es un azar del escenario.",
      ],
    }, "es"),
  },
}

// ── A. disponibilidade: zero, um, dois, três ou mais ──────────────────────────
const D = (n: number) => Array.from({ length: n }, (_, i) => S(`x${i + 1}`, i + 1, `sonho ${i + 1}`))
const linha = (j: JornadaV2, extra: Partial<LinhaDeJornada> = {}): LinhaDeJornada => ({
  id: "a1",
  analysis_text: JSON.stringify(j),
  created_at: "2026-10-01T00:00:00.000Z",
  ...extra,
})
const jx = (ids: string[]): JornadaV2 => jornada({ dreamIds: ids, timeline: [], connections: ["c"], integrated: "i", openQuestions: [] })

confere("zero sonhos: nenhuma síntese", estadoDaJornada([], null).fase === "nenhum")
confere("um sonho: convite", estadoDaJornada(D(1), null).fase === "convite")
confere("um sonho com análise antiga: ainda só convite", estadoDaJornada(D(1), linha(jx(["x1", "x2"]))).fase === "convite")
confere("dois sonhos: primeira síntese disponível", estadoDaJornada(D(2), null).fase === "pronta")
confere("três sonhos sem análise: disponível", estadoDaJornada(D(3), null).fase === "pronta")
confere("análise ilegível não conta como análise", estadoDaJornada(D(2), linha(jx([]), { analysis_text: "texto solto antigo" })).fase === "pronta")

// ── B. reabertura e atualização ───────────────────────────────────────────────
confere("em dia: análise cobre os mesmos sonhos", estadoDaJornada(D(2), linha(jx(["x1", "x2"]))).fase === "atual")
const stale = estadoDaJornada(D(3), linha(jx(["x1", "x2"])))
confere("novo sonho: análise desatualizada", stale.fase === "desatualizada" && stale.novos.join() === "x3")
confere("novo sonho: não é tratada como em dia", stale.fase !== "atual")
const apagado = estadoDaJornada(D(3).filter((s) => s.id !== "x2"), linha(jx(["x1", "x2", "x3"])))
confere("sonho excluído: detectado", apagado.fase === "sonho_excluido" && apagado.excluidos.join() === "x2")
const apagadoENovo = estadoDaJornada([...D(3).filter((s) => s.id !== "x2"), S("x9", 20, "novo")], linha(jx(["x1", "x2", "x3"])))
confere("excluído e novo (mesma contagem): ainda detectado", apagadoENovo.fase === "sonho_excluido")
const antigo = (n: number) => ({ id: "v1", analysis_text: JSON.stringify({ timeline: Array.from({ length: n }, (_, i) => ({ number: i + 1, title: "t", archetypes: "a", summary: "s" })), patterns: ["p"], turningPoint: "t", essence: "e" }), created_at: "2026-09-01T00:00:00.000Z" })
confere("formato antigo, mesma contagem: em dia", estadoDaJornada(D(4), antigo(4)).fase === "atual")
confere("formato antigo, mais sonhos: desatualizada", estadoDaJornada(D(5), antigo(4)).fase === "desatualizada")
confere("formato antigo, menos sonhos: excluído", estadoDaJornada(D(3), antigo(4)).fase === "sonho_excluido")
confere("formato antigo continua legível", lerAnalise(antigo(4).analysis_text)?.versao === 1)
confere("formato novo é lido com versao 2", lerAnalise(JSON.stringify(jx(["x1"])))?.versao === 2)
confere("texto solto antigo não quebra a leitura", lerAnalise("Texto corrido") === null && lerAnalise(null) === null)

// janela: só os mais recentes entram, em ordem cronológica
const muitos = D(MAX_SONHOS + 3)
const jan = janelaDeSonhos([...muitos].reverse())
confere("janela: tamanho máximo", jan.length === MAX_SONHOS)
confere("janela: mais recentes, em ordem cronológica", jan[0].id === "x4" && jan[jan.length - 1].id === `x${MAX_SONHOS + 3}`)
const emDiaJanela = estadoDaJornada(muitos, linha(jx(jan.map((s) => s.id))))
confere("janela: análise da janela atual está em dia", emDiaJanela.fase === "atual")

// ── C. decisão da rota: reutilizar antes de cobrar ────────────────────────────
confere("decisão: um sonho é insuficiente", decidirJornada(D(1), null).acao === "insuficiente")
confere("decisão: zero sonhos é insuficiente", decidirJornada([], null).acao === "insuficiente")
confere("decisão: dois sonhos geram", decidirJornada(D(2), null).acao === "gerar")
confere("decisão: em dia reutiliza (sem modelo, sem cota)", decidirJornada(D(2), linha(jx(["x1", "x2"]))).acao === "reutilizar")
const d3 = decidirJornada(D(3), linha(jx(["x1", "x2"])))
confere("decisão: sonho novo gera com a análise anterior", d3.acao === "gerar" && d3.anterior !== null && d3.novosIds.join() === "x3")
const d4 = decidirJornada(D(3).filter((s) => s.id !== "x2"), linha(jx(["x1", "x2", "x3"])))
confere("decisão: sonho excluído gera sem levar a análise anterior ao modelo", d4.acao === "gerar" && d4.anterior === null)
const d5 = decidirJornada(D(5), antigo(4))
confere("decisão: análise antiga (v1) não vai ao prompt", d5.acao === "gerar" && d5.anterior === null)

// ── D. isolamento entre usuários (banco falso) ────────────────────────────────
type Row = Record<string, any>
function bancoFalso(tabelas: Record<string, Row[]>) {
  const consultas: Array<{ tabela: string; filtros: Array<[string, unknown]> }> = []
  const inserts: Array<{ tabela: string; linha: Row }> = []
  const client = {
    from(tabela: string) {
      const filtros: Array<[string, unknown]> = []
      let desc = false
      let lim: number | null = null
      let insercao: Row | null = null
      const linhas = () => {
        let r = (tabelas[tabela] ?? []).filter((x) => filtros.every(([c, v]) => x[c] === v))
        r = [...r].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)) * (desc ? -1 : 1))
        return lim ? r.slice(0, lim) : r
      }
      const b: any = {
        select() { return b },
        eq(c: string, v: unknown) { filtros.push([c, v]); return b },
        order(_c: string, o: { ascending: boolean }) { desc = !o.ascending; return b },
        limit(n: number) { lim = n; return b },
        insert(linha: Row) { insercao = { id: "novo", created_at: "2026-10-02T00:00:00.000Z", ...linha }; return b },
        async maybeSingle() { consultas.push({ tabela, filtros }); return { data: linhas()[0] ?? null, error: null } },
        async single() { inserts.push({ tabela, linha: insercao! }); return { data: insercao, error: null } },
        then(res: any) { consultas.push({ tabela, filtros }); return Promise.resolve({ data: linhas(), error: null }).then(res) },
      }
      return b
    },
  }
  return { client, consultas, inserts }
}
const banco = bancoFalso({
  dreams: [
    { id: "a1", user_id: "ana", dream_description: "sonho da ana 1", created_at: "2026-09-01" },
    { id: "a2", user_id: "ana", dream_description: "sonho da ana 2", created_at: "2026-09-02" },
    { id: "b1", user_id: "beto", dream_description: "sonho do beto", created_at: "2026-09-03" },
  ],
  journey_analyses: [
    { id: "ja", user_id: "ana", analysis_text: JSON.stringify(jx(["a1", "a2"])), created_at: "2026-09-10" },
    { id: "jb", user_id: "beto", analysis_text: JSON.stringify(jx(["b1"])), created_at: "2026-09-11" },
  ],
})
async function main() {
  const doBeto = await carregarSonhosDoUsuario(banco.client, "beto")
  const daAna = await carregarSonhosDoUsuario(banco.client, "ana")
  confere("isolamento: beto só vê o próprio sonho", doBeto.length === 1 && doBeto[0].id === "b1")
  confere("isolamento: ana não recebe sonho do beto", daAna.length === 2 && daAna.every((s) => s.id.startsWith("a")))
  const aAna = await ultimaAnaliseDoUsuario(banco.client, "ana")
  const aCaio = await ultimaAnaliseDoUsuario(banco.client, "caio")
  confere("isolamento: análise é a da própria pessoa", aAna?.id === "ja")
  confere("isolamento: quem não tem análise não recebe a de outro", aCaio === null)
  confere("isolamento: toda consulta filtra por user_id", banco.consultas.length >= 4 && banco.consultas.every((c) => c.filtros.some(([col]) => col === "user_id")))
  const nova = await salvarAnalise(banco.client, "ana", jx(["a1", "a2"]))
  confere("persistência: insere linha nova para o usuário", banco.inserts.length === 1 && banco.inserts[0].linha.user_id === "ana" && banco.inserts[0].tabela === "journey_analyses")
  confere("persistência: guarda os ids dentro do JSON e só as colunas que existem em produção", lerAnalise(nova.analysis_text)?.versao === 2 && !("dreams_analyzed" in banco.inserts[0].linha) && banco.inserts[0].linha.dreams_count === 2 && JSON.stringify(Object.keys(banco.inserts[0].linha).sort()) === JSON.stringify(["analysis_text", "created_at", "dreams_count", "id", "user_id"]))
  const reaberta = lerAnalise(nova.analysis_text)
  confere("persistência: reabertura devolve o que foi salvo", reaberta?.versao === 2 && reaberta.data.dreamIds.join() === "a1,a2" && reaberta.data.integrated === "i" && reaberta.data.connections.join() === "c")

  // ── E. prompt ───────────────────────────────────────────────────────────────
  for (const locale of LOCALES) {
    for (const n of [2, 3]) {
      const p = montarPromptJornada(locale, { n })
      confere(`prompt ${locale}/${n}: sem travessão nem meia risca`, !/[—–]/.test(p))
      confere(`prompt ${locale}/${n}: pede o idioma da saída`, /Idioma de todos os textos do JSON: \S/.test(p))
      confere(`prompt ${locale}/${n}: dita a regra de pontuação`, /travessão/.test(p))
      confere(`prompt ${locale}/${n}: sem o exemplo editorial do pedido`, !/atravessar um espaço|a passagem é impedida/i.test(p))
    }
  }
  const p2 = montarPromptJornada("pt", { n: 2 })
  const p3 = montarPromptJornada("pt", { n: 3 })
  confere("prompt 2 sonhos: proíbe padrão consolidado e zera a evolução", /DOIS sonhos/.test(p2) && /não afirme padrão recorrente/.test(p2) && /"evolution": \[\]/.test(p2))
  confere("prompt 3+ sonhos: pede permanece, mudou, força, relevância e incerteza", /o que permanece/.test(p3) && /ganharam força/.test(p3) && /perderam relevância/.test(p3) && /continua incerto/.test(p3))
  confere("prompt: pede hipótese, sem diagnóstico, sem trajetória fabricada", /hipótese/.test(p3) && /Nada de diagnóstico/.test(p3) && /Não fabrique trajetória/.test(p3) && /Não invente detalhes/.test(p3))
  const comAnterior = montarPromptJornada("pt", { n: 3, anterior: { integrated: "Leitura prévia X.", connections: ["Conexão prévia Y."] }, novosNumeros: [3] })
  confere("prompt com anterior: trata como hipótese e manda reescrever", /LEITURA ANTERIOR/.test(comAnterior) && /não verdade estabelecida/.test(comAnterior) && /reescreva a leitura/.test(comAnterior) && /Leitura prévia X/.test(comAnterior))
  confere("prompt sem anterior: não menciona leitura anterior", !/LEITURA ANTERIOR/.test(p3))
  const comTraco = montarPromptJornada("pt", { n: 3, anterior: { integrated: "A — B", connections: ["C – D"] } })
  confere("prompt: análise anterior com travessão é limpa antes de ir ao modelo", !/[—–]/.test(comTraco))
  const msg = montarMensagemJornada(BOA["pt-3"].sonhos, "pt")
  confere("mensagem: sonhos numerados em ordem", msg.indexOf("Sonho 1") < msg.indexOf("Sonho 2") && msg.indexOf("Sonho 2") < msg.indexOf("Sonho 3"))
  confere("mensagem: traz só os relatos recebidos", /barco pequeno/.test(msg) && !/sonho do beto/.test(msg))

  // ── F. normalização da resposta do modelo ───────────────────────────────────
  const cru: any = {
    timeline: [{ title: "A — B", archetypes: "x – y", summary: "s" }, { title: "T2", archetypes: "a", summary: "s2" }],
    connections: ["Uma — conexão", "Outra conexão", ""],
    evolution: [{ type: "persists", text: "algo" }],
    integrated: "Leitura — com traço.",
    openQuestions: ["Pergunta – um?", "Outra?"],
  }
  const nz = normalizarJornada(cru, { sonhos: [PT_S1, PT_S2], locale: "pt" })!
  confere("normalizar: remove travessão e meia risca de todo campo", nz && !/[—–]/.test(JSON.stringify(nz)))
  confere("normalizar: ids vêm do servidor, em ordem", nz.dreamIds.join() === "d1,d2")
  confere("normalizar: com dois sonhos a evolução é descartada", nz.evolution.length === 0)
  confere("normalizar: descarta itens vazios", nz.connections.length === 2)
  const nz3 = normalizarJornada({ ...cru, evolution: [{ type: "persists", text: "a" }, { type: "inventado", text: "b" }, { type: "changed", text: "" }] }, { sonhos: [PT_S1, PT_S2, PT_S3], locale: "pt" })!
  confere("normalizar: tipo desconhecido e texto vazio saem da evolução", nz3.evolution.length === 1 && nz3.evolution[0].type === "persists")
  confere("normalizar: resposta sem conteúdo vira null (falha técnica, sem cobrança)", normalizarJornada({}, { sonhos: [PT_S1, PT_S2], locale: "pt" }) === null && normalizarJornada(null, { sonhos: [PT_S1, PT_S2], locale: "pt" }) === null)
  const embrulhada = normalizarJornada({ ...cru, connections: [{ text: "Conexão A." }, { text: "Conexão B." }], openQuestions: [{ text: "Pergunta 1?" }, "Pergunta 2?"] }, { sonhos: [PT_S1, PT_S2], locale: "pt" })
  confere("normalizar: itens embrulhados em {text} são aproveitados, não derrubam a resposta", embrulhada !== null && embrulhada.connections.join("|") === "Conexão A.|Conexão B." && embrulhada.openQuestions.join("|") === "Pergunta 1?|Pergunta 2?")
  confere("normalizar: timeline sempre com um item por sonho", normalizarJornada({ ...cru, timeline: [] }, { sonhos: [PT_S1, PT_S2], locale: "pt" })!.timeline.length === 2)

  // ── G. verificador editorial: PT, EN e ES ───────────────────────────────────
  for (const [nome, { sonhos, j, locale }] of Object.entries(BOA)) {
    const v = verificarJornada(j, sonhos, locale)
    confere(`fixture ${nome}: aprovada`, v.length === 0, v.join("; "))
    confere(`fixture ${nome}: sem travessão`, !/[—–]/.test(JSON.stringify(j)))
  }
  const base = BOA["pt-2"]
  const clone = (f: (j: JornadaV2) => void, b = base) => {
    const j: JornadaV2 = JSON.parse(JSON.stringify(b.j))
    f(j)
    return verificarJornada(j, b.sonhos, b.locale)
  }
  const pega = (nome: string, v: string[], re: RegExp) => confere(`mutação "${nome}" é pega`, v.some((x) => re.test(x)), v.join("; ") || "passou")
  pega("travessão numa conexão", clone((j) => { j.connections[0] = j.connections[0].replace(", primeiro", " — primeiro") }), /travessão/)
  pega("meia risca no integrado", clone((j) => { j.integrated += " – fim" }), /travessão/)
  pega("padrão recorrente com dois sonhos", clone((j) => { j.integrated = "Há um padrão recorrente de passagens impedidas, que pode se repetir." }), /recorrência/)
  pega("'sempre' com dois sonhos", clone((j) => { j.connections[1] += " Isso sempre acontece." }), /recorrência/)
  pega("evolução com dois sonhos", clone((j) => { j.evolution = [{ type: "persists", text: "x" }] }), /evolução preenchida/)
  pega("diagnóstico", clone((j) => { j.integrated += " Isso lembra um quadro depressivo." }), /diagnóstico/)
  pega("o sonho prova", clone((j) => { j.integrated = "O sonho prova que algo mudou na vida da pessoa." }), /categórica/)
  pega("previsão", clone((j) => { j.integrated += " Você vai atravessar em breve." }), /categórica/)
  pega("cita Jung", clone((j) => { j.integrated += " Para Jung, a ponte é a função transcendente." }), /autor/)
  pega("redução a medo e bloqueio", clone((j) => { j.connections[2] += " Há medo, bloqueio e trauma." }), /reduz/)
  pega("sem linguagem de hipótese", clone((j) => { j.integrated = "Os dois sonhos tratam de um limite que impede e depois deixa passar." }), /hipótese/)
  pega("conexão genérica, sem ancoragem", clone((j) => { j.connections[0] = "Há mudança interior profunda em curso, com movimentos delicados." }), /ancoragem/)
  pega("integrado copia uma conexão", clone((j) => { j.integrated = j.connections[0] }), /repete/)
  pega("conexões repetidas", clone((j) => { j.connections[1] = j.connections[0] }), /conexão 1 contra 2/)
  pega("nenhuma conexão com dois sonhos", clone((j) => { j.connections = [] }), /conexões/)
  confere("uma só conexão com dois sonhos é permitida (sonhos diferentes)", clone((j) => { j.connections = [j.connections[0]] }).every((x) => !/conexões/.test(x)))
  pega("cinco conexões com dois sonhos", clone((j) => { j.connections = [...j.connections, ...j.connections] }), /conexões/)
  pega("uma só pergunta em aberto", clone((j) => { j.openQuestions = [j.openQuestions[0]] }), /em aberto/)
  pega("ids que não batem com o material", clone((j) => { j.dreamIds = ["d1", "zz"] }), /ids/)
  pega("linha do tempo incompleta", clone((j) => { j.timeline = j.timeline.slice(0, 1) }), /linha do tempo/)
  const tres = BOA["pt-3"]
  pega("três sonhos sem evolução", clone((j) => { j.evolution = [] }, tres), /evolução/)
  confere("três sonhos: 'recorrente' é permitido", verificarJornada({ ...tres.j, integrated: tres.j.integrated + " O rio é um elemento recorrente." }, tres.sonhos, "pt").every((x) => !/recorrência/.test(x)))
  const bEn = BOA["en-2"]
  pega("EN: padrão recorrente com dois sonhos", clone((j) => { j.integrated = "There is a recurring pattern here, which may repeat." }, bEn), /recorrência/)
  pega("EN: diagnóstico", clone((j) => { j.integrated += " This looks like depression." }, bEn), /diagnóstico/)
  pega("EN: travessão", clone((j) => { j.integrated += " The end — maybe." }, bEn), /travessão/)
  const bEs = BOA["es-2"]
  pega("ES: padrão recorrente com dois sonhos", clone((j) => { j.integrated = "Hay un patrón recurrente aquí, que puede repetirse." }, bEs), /recorrência/)
  pega("ES: categórico", clone((j) => { j.integrated += " Esto prueba que algo cambió." }, bEs), /categórica/)
  pega("ES: travessão", clone((j) => { j.integrated += " El fin — quizá." }, bEs), /travessão/)

  // ── H. interface e rota: ligações que não podem se perder ───────────────────
  const lê = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8")
  const rota = lê("app/sonhos/journey/route.ts")
  const serv = lê("lib/dreams/jornada-servico.ts")
  confere("rota: delega a sequência ao serviço", /executarJornada\(/.test(rota))
  confere("serviço: decide antes de cobrar", serv.indexOf("decidirJornada(") > 0 && serv.indexOf("ler(d)") < serv.indexOf("d.consumir("))
  confere("serviço: reutiliza antes de cobrar e antes do modelo", serv.indexOf('"reutilizar"') > 0 && serv.indexOf('"reutilizar"') < serv.indexOf("d.consumir(") && serv.indexOf("d.consumir(") < serv.indexOf("d.gerar("))
  confere("serviço: recusa geração simultânea antes e depois de cobrar", serv.indexOf("d.outraEmAndamento(null)") < serv.indexOf("d.consumir(") && serv.indexOf("d.consumir(") < serv.indexOf("d.outraEmAndamento(seed)"))
  confere("serviço: salva a análise gerada", /salvarAnalise\(/.test(serv))
  confere("serviço: falha técnica não cobra", /d\.falhar\(seed\)/.test(serv))
  confere("rota: a trava de banco é a de jornada", /jornadaEmAndamento\(userId, seed\)/.test(rota))
  confere("serviço: lê pelo usuário da sessão, nunca pelo corpo", /carregarSonhosDoUsuario\(d\.client, d\.userId\)/.test(serv) && !/body\??\.(userId|user_id)/.test(rota))
  confere("rota: a regra de 3 sonhos e o limite de 20 antigos acabaram", !/length < 3/.test(rota) && !/\.limit\(20\)/.test(rota))
  confere("rota: falha técnica não cobra", /failReading\(seed\)/.test(rota))
  const comp = lê("components/jornada-sonhos.tsx")
  confere("tela: nada é gerado ao abrir (sem useEffect)", !/useEffect/.test(comp))
  confere("tela: usa o estado da regra única", /estadoDaJornada\(/.test(comp))
  confere("tela: avisa análise desatualizada e sonho excluído", /outdatedOne/.test(comp) && /deletedNotice/.test(comp))
  const lista = lê("components/saved-dreams-list.tsx")
  confere("sonhos salvos: a Jornada aparece com 2 sonhos", /dreams\.length >= 2 && <JornadaSonhos/.test(lista) && !/dreams\.length >= 4/.test(lista))
  confere("sonhos salvos: convite discreto com um sonho", /dreams\.length === 1/.test(lista) && /oneDreamHint/.test(lista))

  // ── I. idiomas: as mesmas chaves, com texto próprio, sem travessão ──────────
  const chaves = ["oneDreamHint", "exploreConnections", "firstReadingNote", "connectionsTitle", "evolutionTitle", "integratedTitle", "openTitle", "basedOn", "basedOnWindow", "generatedOn", "dreamsConsidered", "outdatedOne", "outdatedMany", "updateAnalysis", "deletedNotice", "regenerate"] as const
  const dicts = { pt, en, es }
  for (const [loc, d] of Object.entries(dicts)) {
    const t = d.savedDreams as Record<string, any>
    for (const c of chaves) confere(`i18n ${loc}: ${c}`, typeof t[c] === "string" && t[c].length > 0)
    for (const e of ["persists", "changed", "gaining", "fading", "revised"]) confere(`i18n ${loc}: evolutionTypes.${e}`, typeof t.evolutionTypes?.[e] === "string")
    const novos = [...chaves.map((c) => t[c]), t.journeyIntro, ...Object.values(t.evolutionTypes)].join("\n")
    confere(`i18n ${loc}: textos novos sem travessão`, !/[—–]/.test(novos))
  }
  confere("i18n: convite de um sonho no texto pedido (PT)", pt.savedDreams.oneDreamHint === "Registre mais um sonho para descobrir as conexões entre eles.")
  confere("i18n: botão no texto pedido (PT)", pt.savedDreams.exploreConnections === "Explorar conexões entre meus sonhos")
  confere("i18n: EN e ES diferem do PT", en.savedDreams.exploreConnections !== pt.savedDreams.exploreConnections && es.savedDreams.exploreConnections !== pt.savedDreams.exploreConnections)
  confere("i18n: EN sem português", !/sonho|conexões|Registre/i.test(`${en.savedDreams.oneDreamHint} ${en.savedDreams.exploreConnections} ${en.savedDreams.deletedNotice}`))
  confere("i18n: ES sem português", !/sonho|conexões|Registre/i.test(`${es.savedDreams.oneDreamHint} ${es.savedDreams.exploreConnections} ${es.savedDreams.deletedNotice}`))

  // ── J. fluxo completo com banco, cobrança e modelo falsos ───────────────────
  let relogio = 0
  const marca = () => `2026-10-02T00:00:${String(++relogio).padStart(2, "0")}.000Z`
  function mundo(o: { limite: number | null; sonhos: Row[]; analises?: Row[]; falhaAoSalvar?: boolean; modelo?: "ok" | "erro" | "vazio" }) {
    const tabelas: Record<string, Row[]> = { dreams: o.sonhos.map((x) => ({ user_id: "ana", ...x })), journey_analyses: (o.analises ?? []).map((x) => ({ user_id: "ana", ...x })) }
    const usos: Array<{ seed: string; status: string }> = []
    const modelo = { chamadas: 0, prompts: [] as string[], mensagens: [] as string[] }
    let seq = 0
    const client = {
      from(tabela: string) {
        const filtros: Array<[string, unknown]> = []
        let desc = false, lim: number | null = null, ins: Row | null = null
        const rows = () => {
          let r = (tabelas[tabela] ?? []).filter((x) => filtros.every(([c, v]) => x[c] === v))
          r = [...r].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)) * (desc ? -1 : 1))
          return lim ? r.slice(0, lim) : r
        }
        const b: any = {
          select() { return b }, eq(c: string, v: unknown) { filtros.push([c, v]); return b },
          order(_c: string, x: { ascending: boolean }) { desc = !x.ascending; return b }, limit(n: number) { lim = n; return b },
          insert(l: Row) { ins = { id: `${tabela}-${++seq}`, created_at: marca(), ...l }; return b },
          async maybeSingle() { return { data: rows()[0] ?? null, error: null } },
          async single() {
            if (o.falhaAoSalvar) return { data: null, error: { message: "RLS" } }
            tabelas[tabela].push(ins!); return { data: ins, error: null }
          },
          then(res: any) { return Promise.resolve({ data: rows(), error: null }).then(res) },
        }
        return b
      },
    }
    const deps = (locale: Locale = "pt", hook?: () => void): DepsJornada => ({
      client, userId: "ana", locale,
      novaSeed: () => `s${++seq}`,
      async consumir(seed) {
        const conta = usos.filter((u) => u.status === "completed" || u.status === "started").length
        if (o.limite !== null && conta >= o.limite) return { allowed: false, status: 429, corpo: { code: "limit_reached" } }
        usos.push({ seed, status: "started" })
        hook?.()
        return { allowed: true }
      },
      async concluir(seed) { usos.find((u) => u.seed === seed)!.status = "completed" },
      async falhar(seed) { usos.find((u) => u.seed === seed)!.status = "failed" },
      async outraEmAndamento(seed) { return usos.some((u) => u.status === "started" && u.seed !== seed) },
      modeloDisponivel: () => true,
      async gerar(system, user) {
        modelo.chamadas += 1; modelo.prompts.push(system); modelo.mensagens.push(user)
        await new Promise((r) => setTimeout(r, 5))
        if (o.modelo === "erro") throw new Error("falha do provedor")
        if (o.modelo === "vazio") return { raw: {}, model: "gpt-4o" }
        const n = (user.match(/Sonho \d+ \(/g) ?? []).length
        return {
          model: "gpt-4o",
          raw: {
            timeline: Array.from({ length: n }, (_, i) => ({ title: `T${i + 1}`, archetypes: "a · b", summary: `S${i + 1}` })),
            connections: ["Conexão um entre os sonhos.", "Conexão dois entre eles.", "Conexão três mais distinta."],
            evolution: n >= 3 ? [{ type: "persists", text: "Permanece algo." }, { type: "changed", text: "Mudou outra coisa." }] : [],
            integrated: "Pode sugerir uma leitura possível do conjunto.",
            openQuestions: ["Fica em aberto um ponto?", "Resta outro ponto incerto?"],
          },
        }
      },
      async registrarUso() {},
    })
    const completos = () => usos.filter((u) => u.status === "completed").length
    return { tabelas, usos, modelo, deps, completos }
  }
  const sn = (id: string, dia: number, t?: string) => ({ id, dream_description: t ?? `relato ${id}`, created_at: `2026-09-${String(dia).padStart(2, "0")}T12:00:00+00:00` })

  // 1. gerar, salvar sozinho, sair, voltar: a mesma análise, sem nova cobrança
  {
    const w = mundo({ limite: 1, sonhos: [sn("d1", 1), sn("d2", 2)] })
    const r1 = await executarJornada(w.deps())
    confere("fluxo: primeira geração responde 200 e salva", r1.status === 200 && r1.corpo.saved === true && r1.corpo.reused === false)
    confere("fluxo: uma chamada ao modelo e uma cobrança concluída", w.modelo.chamadas === 1 && w.completos() === 1)
    confere("fluxo: a análise foi gravada sem clique", w.tabelas.journey_analyses.length === 1)
    const gravada = w.tabelas.journey_analyses[0]
    const r2 = await executarJornada(w.deps())
    confere("fluxo: voltar devolve a mesma análise (reaproveitada)", r2.status === 200 && r2.corpo.reused === true && (r2.corpo.journey as any).id === gravada.id && (r2.corpo.journey as any).analysis_text === gravada.analysis_text)
    confere("fluxo: voltar não chama o modelo nem cobra", w.modelo.chamadas === 1 && w.completos() === 1 && w.usos.length === 1)
    confere("fluxo: voltar não grava outra linha", w.tabelas.journey_analyses.length === 1)
    const quarta = await executarJornada(w.deps())
    confere("fluxo: reabrir de novo continua sem custo", quarta.corpo.reused === true && w.modelo.chamadas === 1)

    // 2. terceiro sonho: atualização reconsidera o conjunto e leva a anterior ao prompt
    w.tabelas.dreams.push({ user_id: "ana", ...sn("d3", 3) })
    const estado = estadoDaJornada(w.tabelas.dreams as any, gravada as any)
    confere("terceiro sonho: a análise vira desatualizada", estado.fase === "desatualizada")
    const w2 = mundo({ limite: null, sonhos: w.tabelas.dreams, analises: w.tabelas.journey_analyses })
    const r3 = await executarJornada(w2.deps())
    const nova = lerAnalise((r3.corpo.journey as any).analysis_text)
    confere("terceiro sonho: gera de novo, com os 3 ids", r3.status === 200 && nova?.versao === 2 && nova.data.dreamIds.join() === "d1,d2,d3")
    confere("terceiro sonho: a leitura anterior entra no prompt como hipótese", /LEITURA ANTERIOR/.test(w2.modelo.prompts[0]) && /sonhos 3/.test(w2.modelo.prompts[0]))
    confere("terceiro sonho: a análise antiga continua intacta no histórico", w2.tabelas.journey_analyses.length === 2 && w2.tabelas.journey_analyses[0].id === gravada.id)
    confere("terceiro sonho: pede evolução (3 sonhos)", /ganharam força/.test(w2.modelo.prompts[0]) && nova?.versao === 2 && nova.data.evolution.length === 2)
  }

  // 3. sonho excluído: nada do conteúdo apagado vai ao modelo, e a análise antiga não é reescrita
  {
    const ids = ["d1", "d2", "d3"]
    const base = mundo({ limite: null, sonhos: ids.map((id, i) => sn(id, i + 1, id === "d2" ? "SEGREDO DO SONHO EXCLUÍDO" : `relato ${id}`)) })
    const r1 = await executarJornada(base.deps())
    const salva = base.tabelas.journey_analyses[0]
    confere("exclusão: base gerada", r1.status === 200)
    const apos = mundo({ limite: null, sonhos: base.tabelas.dreams.filter((x) => x.id !== "d2"), analises: [salva] })
    const est = estadoDaJornada(apos.tabelas.dreams as any, salva as any)
    confere("exclusão: a tela esconde a leitura (sonho_excluido)", est.fase === "sonho_excluido" && est.excluidos.join() === "d2")
    const r2 = await executarJornada(apos.deps())
    confere("exclusão: gera de novo só com os sonhos que restam", r2.status === 200 && (lerAnalise((r2.corpo.journey as any).analysis_text) as any).data.dreamIds.join() === "d1,d3")
    const tudo = apos.modelo.prompts.join("\n") + apos.modelo.mensagens.join("\n")
    confere("exclusão: o conteúdo excluído não chega ao modelo", !/SEGREDO/.test(tudo) && !/LEITURA ANTERIOR/.test(tudo))
    confere("exclusão: a linha antiga permanece como estava", apos.tabelas.journey_analyses[0].analysis_text === salva.analysis_text && apos.tabelas.journey_analyses.length === 2)
    const ficou1 = mundo({ limite: null, sonhos: [sn("d1", 1)], analises: [salva] })
    const r3 = await executarJornada(ficou1.deps())
    confere("exclusão até restar 1 sonho: recusa sem modelo e sem cobrança", r3.status === 400 && r3.corpo.code === "not_enough_dreams" && ficou1.modelo.chamadas === 0 && ficou1.usos.length === 0)
  }

  // 4. simultâneos: nunca duas análises nem duas cobranças
  for (const [nome, limite] of [["ilimitado", null], ["Essencial (1/mês)", 1]] as const) {
    const w = mundo({ limite, sonhos: [sn("d1", 1), sn("d2", 2)] })
    const rs = await Promise.all([executarJornada(w.deps()), executarJornada(w.deps()), executarJornada(w.deps())])
    confere(`simultâneos ${nome}: no máximo uma chamada ao modelo`, w.modelo.chamadas <= 1, String(w.modelo.chamadas))
    confere(`simultâneos ${nome}: no máximo uma análise gravada`, w.tabelas.journey_analyses.length <= 1, String(w.tabelas.journey_analyses.length))
    confere(`simultâneos ${nome}: no máximo uma cobrança concluída`, w.completos() <= 1)
    confere(`simultâneos ${nome}: nenhuma cobrança fica pendurada`, w.usos.every((u) => u.status !== "started"))
    confere(`simultâneos ${nome}: os recusados recebem in_progress ou limite, nunca erro`, rs.every((x) => x.status === 200 || x.status === 409 || x.status === 429))
  }
  {
    // pedido que leu o estado antigo e só cobra depois que outro já terminou
    const w = mundo({ limite: null, sonhos: [sn("d1", 1), sn("d2", 2)] })
    const salvaPorOutro = () => {
      w.tabelas.journey_analyses.push({ id: "outra", user_id: "ana", analysis_text: JSON.stringify(jx(["d1", "d2"])), created_at: marca() })
    }
    const r = await executarJornada(w.deps("pt", salvaPorOutro))
    confere("corrida tardia: reaproveita a análise que o outro salvou", r.status === 200 && r.corpo.reused === true && (r.corpo.journey as any).id === "outra")
    confere("corrida tardia: sem modelo e com a cobrança devolvida", w.modelo.chamadas === 0 && w.completos() === 0 && w.usos[0].status === "failed")
  }

  // 5. falhas: nada de cobrança perdida, nada de análise incompleta
  {
    const e = mundo({ limite: 1, sonhos: [sn("d1", 1), sn("d2", 2)], modelo: "erro" })
    const r = await executarJornada(e.deps())
    confere("falha do modelo: 500, cobrança devolvida e nada gravado", r.status === 500 && e.usos[0].status === "failed" && e.tabelas.journey_analyses.length === 0)
    const r2 = await executarJornada(e.deps())
    confere("falha do modelo: a pessoa pode tentar de novo", r2.status === 500 && e.usos.length === 2 && e.usos.every((u) => u.status === "failed"))
    const v = mundo({ limite: 1, sonhos: [sn("d1", 1), sn("d2", 2)], modelo: "vazio" })
    const rv = await executarJornada(v.deps())
    confere("resposta vazia do modelo: falha técnica, sem cobrança, sem linha", rv.status === 500 && v.usos[0].status === "failed" && v.tabelas.journey_analyses.length === 0)
    const s = mundo({ limite: 1, sonhos: [sn("d1", 1), sn("d2", 2)], falhaAoSalvar: true })
    const rs = await executarJornada(s.deps())
    confere("falha ao salvar: a leitura chega à tela (saved=false) e a cobrança vale", rs.status === 200 && rs.corpo.saved === false && Boolean(rs.corpo.journeyData) && s.completos() === 1)
    const b = mundo({ limite: 0, sonhos: [sn("d1", 1), sn("d2", 2)] })
    const rb = await executarJornada(b.deps())
    confere("sem direito no plano: bloqueio repassado, sem modelo", rb.status === 429 && rb.corpo.code === "limit_reached" && b.modelo.chamadas === 0)
    const u = mundo({ limite: 1, sonhos: [sn("d1", 1)] })
    const ru = await executarJornada(u.deps())
    confere("um sonho: 400 sem modelo e sem cobrança", ru.status === 400 && u.modelo.chamadas === 0 && u.usos.length === 0)
  }

  // 6. análise antiga (sem ids): compatível e nunca reescrita
  {
    const velha = { id: "v1", analysis_text: JSON.stringify({ timeline: [{ number: 1, title: "t", archetypes: "a", summary: "s" }, { number: 2, title: "t", archetypes: "a", summary: "s" }, { number: 3, title: "t", archetypes: "a", summary: "s" }, { number: 4, title: "t", archetypes: "a", summary: "s" }], patterns: ["p"], turningPoint: "tp", essence: "e" }), created_at: "2026-09-20T00:00:00.000Z" }
    const quatro = [1, 2, 3, 4].map((i) => sn(`d${i}`, i))
    const emDia = mundo({ limite: null, sonhos: quatro, analises: [velha] })
    const r = await executarJornada(emDia.deps())
    confere("análise antiga em dia: reaproveitada, sem custo", r.corpo.reused === true && emDia.modelo.chamadas === 0 && emDia.usos.length === 0)
    const cinco = mundo({ limite: null, sonhos: [...quatro, sn("d5", 5)], analises: [velha] })
    const r2 = await executarJornada(cinco.deps())
    confere("análise antiga + sonho novo: gera no formato novo", r2.status === 200 && lerAnalise((r2.corpo.journey as any).analysis_text)?.versao === 2)
    confere("análise antiga: não vai ao prompt e a linha antiga fica intacta", !/LEITURA ANTERIOR/.test(cinco.modelo.prompts[0]) && cinco.tabelas.journey_analyses[0].analysis_text === velha.analysis_text && cinco.tabelas.journey_analyses.length === 2)
    const dep = estadoDaJornada(cinco.tabelas.dreams as any, velha as any)
    confere("análise antiga: a tela a trata como desatualizada com 1 novo", dep.fase === "desatualizada" && dep.novos.length === 1)
  }

  // 7. o limite de 12 e a ordem cronológica no prompt
  {
    const treze = Array.from({ length: 14 }, (_, i) => ({
      id: `d${String(i + 1).padStart(2, "0")}`,
      dream_description: `relato número ${i + 1}`,
      // formatos de data misturados e inseridos fora de ordem: o instante é que manda
      created_at: i % 2 ? `2026-09-${String(i + 1).padStart(2, "0")}T12:00:00+00:00` : `2026-09-${String(i + 1).padStart(2, "0")}T12:00:00.000Z`,
    }))
    const w = mundo({ limite: null, sonhos: [...treze].reverse() })
    const r = await executarJornada(w.deps())
    const msg = w.modelo.mensagens[0]
    const ordem = [...msg.matchAll(/Sonho (\d+) \([^)]*\):\n"relato número (\d+)"/g)].map((m) => [Number(m[1]), Number(m[2])])
    confere("12 sonhos: o prompt traz exatamente 12", ordem.length === MAX_SONHOS)
    confere("12 sonhos: são os mais recentes (3 a 14), numerados de 1 a 12 em ordem cronológica", ordem.every(([pos, rel], i) => pos === i + 1 && rel === i + 3), JSON.stringify(ordem.slice(0, 3)))
    const lida = lerAnalise((r.corpo.journey as any).analysis_text)
    confere("12 sonhos: os ids salvos são os mesmos, na mesma ordem", lida?.versao === 2 && lida.data.dreamIds.join() === treze.slice(2).map((x) => x.id).join())
    confere("12 sonhos: a análise fica em dia com 14 sonhos", estadoDaJornada(treze, r.corpo.journey as any).fase === "atual")
    const mais = [...treze, { id: "d15", dream_description: "relato número 15", created_at: "2026-09-28T12:00:00.000Z" }]
    const est = estadoDaJornada(mais, r.corpo.journey as any)
    confere("12 sonhos: o 15º sonho torna a análise desatualizada", est.fase === "desatualizada" && est.novos.join() === "d15")
    const comp = lê("components/jornada-sonhos.tsx")
    confere("12 sonhos: a tela só fala em 'mais recentes' quando a análise usou o teto", /conta === MAX_SONHOS && estado\.total > MAX_SONHOS/.test(comp))
  }

  // 8. a tela mostra só texto do dicionário nos erros (o `error` do servidor está em português)
  {
    const comp = lê("components/jornada-sonhos.tsx")
    confere("erros: a tela não repassa o texto do servidor", !/new Error\(json/.test(comp) && !/err\.message/.test(comp) && /inProgress/.test(comp))
    for (const [loc, d] of Object.entries({ pt, en, es })) {
      const t = d.savedDreams as Record<string, any>
      confere(`i18n ${loc}: inProgress`, typeof t.inProgress === "string" && !/[—–]/.test(t.inProgress))
      for (const k of ["journeyPlanRequired", "journeyLimitReached"]) confere(`i18n ${loc}: billing.${k}`, typeof (d.billing as any)[k] === "string" && (d.billing as any)[k].length > 10)
      for (const k of ["analyzing", "errorGenerate"]) confere(`i18n ${loc}: ${k}`, typeof t[k] === "string")
    }
    confere("i18n: inProgress em EN e ES não está em português", !/Aguarde|leitura/.test(en.savedDreams.inProgress + es.savedDreams.inProgress.replace(/lectura/g, "")))
  }

  // ── K. entre instâncias: o BANCO é a única coisa compartilhada ──────────────
  // Cada "instância" é um conjunto de dependências sem memória comum. A cobrança
  // imita consume_reading: trava por (usuário, tipo) durante a gravação da linha
  // 'started', que fica visível (commit) quando a trava solta. A consulta de
  // exclusividade é a função REAL (consultarJornadaEmAndamento) sobre um cliente falso.
  {
    let semente = 20261025
    const rnd = () => { semente = (semente + 0x6d2b79f5) | 0; let t = Math.imul(semente ^ (semente >>> 15), 1 | semente); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
    const pausa = () => new Promise<void>((r) => setTimeout(r, Math.floor(rnd() * 3)))

    const novoBanco = (usuarios: Record<string, Row[]>, limite: number | null) => {
      let desvio = 0 // relógio falso, em ms
      const agora = () => Date.now() + desvio
      const tabelas: Record<string, Row[]> = { dreams: [], journey_analyses: [], reading_usage: [] }
      for (const [u, ds] of Object.entries(usuarios)) for (const d of ds) tabelas.dreams.push({ user_id: u, ...d })
      const modelo = { chamadas: 0, porUsuario: {} as Record<string, number> }
      const travas = new Map<string, Promise<void>>()
      let seq = 0
      const clienteDe = (tab: string) => {
        const filtros: Array<(r: Row) => boolean> = []
        let desc = false, lim: number | null = null, ins: Row | null = null
        const rows = () => {
          let r = tabelas[tab].filter((x) => filtros.every((f) => f(x)))
          r = [...r].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)) * (desc ? -1 : 1))
          return lim ? r.slice(0, lim) : r
        }
        const b: any = {
          select() { return b },
          eq(c: string, v: unknown) { filtros.push((r) => r[c] === v); return b },
          neq(c: string, v: unknown) { filtros.push((r) => r[c] !== v); return b },
          gte(c: string, v: string) { filtros.push((r) => String(r[c]) >= v); return b },
          order(_c: string, x: { ascending: boolean }) { desc = !x.ascending; return b },
          limit(n: number) { lim = n; return b },
          insert(l: Row) { ins = { id: `${tab}-${++seq}`, created_at: new Date(agora()).toISOString(), ...l }; return b },
          async maybeSingle() { return { data: rows()[0] ?? null, error: null } },
          async single() { tabelas[tab].push(ins!); return { data: ins, error: null } },
          then(res: any) { return Promise.resolve({ data: rows(), error: null }).then(res) },
        }
        return b
      }
      const client = { from: (t: string) => clienteDe(t) }
      const instancia = (userId: string, opcoes: { posCheckFalha?: boolean; preCheckFalha?: boolean; semModelo?: boolean } = {}): DepsJornada => ({
        client, userId, locale: "pt",
        novaSeed: () => `s${++seq}`,
        async consumir(seed) {
          await pausa()
          const chave = userId + ":journey"
          const anterior = travas.get(chave) ?? Promise.resolve()
          let solta!: () => void
          travas.set(chave, new Promise<void>((r) => (solta = r)))
          await anterior // pg_advisory_xact_lock
          try {
            await pausa()
            const conta = tabelas.reading_usage.filter((u) => u.user_id === userId && (u.status === "completed" || (u.status === "started" && String(u.created_at) >= new Date(agora() - 600000).toISOString()))).length
            if (limite !== null && conta >= limite) return { allowed: false, status: 429, corpo: { code: "limit_reached" } }
            tabelas.reading_usage.push({ user_id: userId, kind: "journey", seed, status: "started", created_at: new Date(agora()).toISOString() })
            return { allowed: true }
          } finally { solta() }
        },
        async concluir(seed) { await pausa(); tabelas.reading_usage.find((u) => u.seed === seed)!.status = "completed" },
        async falhar(seed) { await pausa(); tabelas.reading_usage.find((u) => u.seed === seed)!.status = "failed" },
        async outraEmAndamento(seed) {
          await pausa()
          if (seed === null && opcoes.preCheckFalha) throw new Error("consulta caiu")
          if (seed !== null && opcoes.posCheckFalha) throw new Error("consulta caiu")
          return consultarJornadaEmAndamento(client, userId, seed, agora())
        },
        modeloDisponivel: () => true,
        async gerar(_s, u) {
          await pausa()
          modelo.chamadas += 1
          modelo.porUsuario[userId] = (modelo.porUsuario[userId] ?? 0) + 1
          const n = (u.match(/Sonho \d+ \(/g) ?? []).length
          return { model: "gpt-4o", raw: { timeline: Array.from({ length: n }, (_, i) => ({ title: `T${i + 1}`, archetypes: "a", summary: "s" })), connections: ["c1", "c2"], evolution: [], integrated: "Pode sugerir algo.", openQuestions: ["q1?", "q2?"] } }
        },
        async registrarUso() {},
      })
      const analises = (u: string) => tabelas.journey_analyses.filter((a) => a.user_id === u)
      const usosDe = (u: string, st?: string) => tabelas.reading_usage.filter((x) => x.user_id === u && (!st || x.status === st))
      return { tabelas, modelo, instancia, analises, usosDe, avanca: (ms: number) => { desvio += ms } }
    }
    const dr = (id: string, dia: number) => ({ id, dream_description: `relato ${id}`, created_at: `2026-09-${String(dia).padStart(2, "0")}T12:00:00+00:00` })

    // K1. corrida aleatória: 2 a 4 instâncias, mesma pessoa, mesmo conjunto de sonhos
    let geraram = 0, recuaram = 0, ambosRecuaram = 0
    const TENTATIVAS = 150
    for (let t = 0; t < TENTATIVAS; t++) {
      const limite = t % 2 ? 1 : null
      const b = novoBanco({ ana: [dr("d1", 1), dr("d2", 2)] }, limite)
      const n = 2 + (t % 3)
      const rs = await Promise.all(Array.from({ length: n }, () => executarJornada(b.instancia("ana"))))
      const ok = b.modelo.chamadas <= 1 && b.analises("ana").length <= 1 && b.usosDe("ana", "completed").length <= 1 && b.usosDe("ana", "started").length === 0 && rs.every((x) => [200, 409, 429].includes(x.status))
      if (!ok) { confere(`corrida ${t}: invariantes (modelo ${b.modelo.chamadas}, análises ${b.analises("ana").length}, cobranças ${b.usosDe("ana", "completed").length}, pendentes ${b.usosDe("ana", "started").length})`, false); break }
      if (b.modelo.chamadas === 1) geraram += 1; else ambosRecuaram += 1
      recuaram += rs.filter((x) => x.status === 409).length
      // a tentativa seguinte termina com UMA análise e UMA cobrança, nunca duas
      const depois = await executarJornada(b.instancia("ana"))
      const fim = b.analises("ana").length === 1 && b.usosDe("ana", "completed").length === 1 && depois.status === 200
      if (!fim) { confere(`corrida ${t}: tentativa seguinte (${b.analises("ana").length} análises, ${b.usosDe("ana", "completed").length} cobranças, status ${depois.status})`, false); break }
    }
    confere(`entre instâncias: ${TENTATIVAS} corridas sem análise nem cobrança duplicada`, true)
    confere("entre instâncias: há progresso (a maioria das corridas gera uma análise)", geraram > TENTATIVAS * 0.5, `${geraram} de ${TENTATIVAS}`)
    confere("entre instâncias: os concorrentes recuam com 409 (houve disputa real)", recuaram > 0)

    // K2. usuários diferentes geram ao mesmo tempo, cada um a sua
    {
      const b = novoBanco({ ana: [dr("a1", 1), dr("a2", 2)], beto: [dr("b1", 1), dr("b2", 2), dr("b3", 3)], caio: [dr("c1", 1), dr("c2", 2)] }, 1)
      const rs = await Promise.all([executarJornada(b.instancia("ana")), executarJornada(b.instancia("beto")), executarJornada(b.instancia("caio"))])
      confere("usuários diferentes: cada um gera a própria análise", ["ana", "beto", "caio"].every((u) => b.analises(u).length === 1) && b.modelo.chamadas === 3)
      confere("usuários diferentes: cada um paga uma vez, só pelo que é seu", ["ana", "beto", "caio"].every((u) => b.usosDe(u, "completed").length === 1))
      confere("usuários diferentes: a análise de cada um cita só os sonhos dele", ["ana", "beto", "caio"].every((u) => (lerAnalise(b.analises(u)[0].analysis_text) as any).data.dreamIds.every((id: string) => id.startsWith(u[0]))))
      confere("usuários diferentes: ninguém é recusado por causa de outro", rs.every((x) => x.status === 200))
    }

    // K3. reabrir uma análise atual não cobra, nem com várias instâncias
    {
      const b = novoBanco({ ana: [dr("d1", 1), dr("d2", 2)] }, 1)
      await executarJornada(b.instancia("ana"))
      const antes = b.tabelas.reading_usage.length
      const rs = await Promise.all([1, 2, 3, 4].map(() => executarJornada(b.instancia("ana"))))
      confere("reabertura: todas devolvem a análise salva", rs.every((x) => x.status === 200 && x.corpo.reused === true))
      confere("reabertura: nenhuma cobrança nova, nenhum modelo, nenhuma linha nova", b.tabelas.reading_usage.length === antes && b.modelo.chamadas === 1 && b.analises("ana").length === 1)
    }

    // K4. interrupções: nada de trava permanente
    {
      const b = novoBanco({ ana: [dr("d1", 1), dr("d2", 2)] }, null)
      // uma instância morre depois de cobrar: a linha fica 'started'
      b.tabelas.reading_usage.push({ user_id: "ana", kind: "journey", seed: "morta", status: "started", created_at: new Date(Date.now()).toISOString() })
      const durante = await executarJornada(b.instancia("ana"))
      confere("interrupção: dentro da janela a trava vale (409, sem cobrança, sem modelo)", durante.status === 409 && durante.corpo.code === "in_progress" && b.modelo.chamadas === 0 && b.usosDe("ana").length === 1)
      b.avanca(JORNADA_TRAVA_MS + 1000)
      const depois = await executarJornada(b.instancia("ana"))
      confere("interrupção: passada a janela a pessoa gera normalmente", depois.status === 200 && b.modelo.chamadas === 1 && b.analises("ana").length === 1)
      confere("interrupção: a janela da trava é curta (2 min, menor que a da cota)", JORNADA_TRAVA_MS === 120000 && JORNADA_TRAVA_MS < STARTED_WINDOW_MS)
      const c = novoBanco({ ana: [dr("d1", 1), dr("d2", 2)] }, null)
      c.tabelas.reading_usage.push({ user_id: "ana", kind: "journey", seed: "morta", status: "failed", created_at: new Date(Date.now()).toISOString() })
      const livre = await executarJornada(c.instancia("ana"))
      confere("interrupção: linha 'failed' nunca trava", livre.status === 200)
      const d = novoBanco({ ana: [dr("d1", 1), dr("d2", 2)], beto: [dr("b1", 1), dr("b2", 2)] }, null)
      d.tabelas.reading_usage.push({ user_id: "beto", kind: "journey", seed: "outra", status: "started", created_at: new Date(Date.now()).toISOString() })
      const deAna = await executarJornada(d.instancia("ana"))
      confere("interrupção: a trava de um usuário não afeta outro", deAna.status === 200)
    }

    // K5. a checagem que garante exclusividade falha fechada; o atalho falha aberto
    {
      const b = novoBanco({ ana: [dr("d1", 1), dr("d2", 2)] }, 1)
      const r = await executarJornada(b.instancia("ana", { posCheckFalha: true }))
      confere("falha na checagem pós-cobrança: não gera, devolve a cobrança, 409", r.status === 409 && b.modelo.chamadas === 0 && b.usosDe("ana", "completed").length === 0 && b.usosDe("ana", "started").length === 0 && b.usosDe("ana", "failed").length === 1)
      const c = novoBanco({ ana: [dr("d1", 1), dr("d2", 2)] }, 1)
      const r2 = await executarJornada(c.instancia("ana", { preCheckFalha: true }))
      confere("falha só no atalho pré-cobrança: segue e gera", r2.status === 200 && c.modelo.chamadas === 1)
    }

    // K6. a consulta real filtra como a garantia exige
    {
      const agora = Date.now()
      const iso = (ms: number) => new Date(agora - ms).toISOString()
      const base = { user_id: "ana", kind: "journey", status: "started", created_at: iso(1000) }
      const cliente = (rows: Row[], erro = false) => {
        const f: Array<(r: Row) => boolean> = []
        let lim = 999
        const b: any = {
          select() { return b }, eq(c: string, v: unknown) { f.push((r) => r[c] === v); return b }, neq(c: string, v: unknown) { f.push((r) => r[c] !== v); return b },
          gte(c: string, v: string) { f.push((r) => String(r[c]) >= v); return b }, limit(n: number) { lim = n; return b },
          then(res: any) { return Promise.resolve(erro ? { data: null, error: { message: "boom" } } : { data: rows.filter((r) => f.every((x) => x(r))).slice(0, lim), error: null }).then(res) },
        }
        return { from: () => b }
      }
      const q = (rows: Row[], seed: string | null = "minha") => consultarJornadaEmAndamento(cliente(rows), "ana", seed, agora)
      confere("consulta: outra geração minha em curso conta", await q([{ ...base, seed: "outra" }]) === true)
      confere("consulta: a própria seed não conta", await q([{ ...base, seed: "minha" }]) === false)
      confere("consulta: sem seed (atalho), qualquer geração em curso conta", await q([{ ...base, seed: "minha" }], null) === true)
      confere("consulta: de outro usuário não conta", await q([{ ...base, user_id: "beto", seed: "x" }]) === false)
      confere("consulta: de outro tipo não conta", await q([{ ...base, kind: "reading", seed: "x" }, { ...base, kind: "dream", seed: "y" }]) === false)
      confere("consulta: concluída ou falha não conta", await q([{ ...base, status: "completed", seed: "x" }, { ...base, status: "failed", seed: "y" }]) === false)
      confere("consulta: além da janela não conta", await q([{ ...base, created_at: iso(JORNADA_TRAVA_MS + 1000), seed: "x" }]) === false)
      confere("consulta: dentro da janela conta", await q([{ ...base, created_at: iso(JORNADA_TRAVA_MS - 5000), seed: "x" }]) === true)
      let lancou = false
      try { await consultarJornadaEmAndamento(cliente([], true), "ana", "minha", agora) } catch { lancou = true }
      confere("consulta: erro do banco é lançado (nunca vira 'ninguém')", lancou)
    }

    // K7. as premissas do banco que a garantia usa, lidas da migration
    {
      const sql = lê("supabase/migrations/20260907_visitor_readings.sql")
      const fn = sql.slice(sql.indexOf("create or replace function public.consume_reading"))
      confere("banco: consume_reading trava por (usuário, tipo) antes de gravar", fn.indexOf("pg_advisory_xact_lock(hashtext(p_user_id::text || ':' || p_kind))") > 0 && fn.indexOf("pg_advisory_xact_lock") < fn.indexOf("insert into public.reading_usage"))
      confere("banco: a linha 'started' é gravada na mesma transação da trava", /insert into public\.reading_usage \(user_id, seed, status, locale, kind\)\s+values \(p_user_id, p_seed, 'started'/.test(fn))
      confere("banco: só service_role executa consume_reading", /grant execute on function public\.consume_reading\([^)]*\) to service_role/.test(sql) && /revoke all on function public\.consume_reading\([^)]*\) from public, anon, authenticated/.test(sql))
      const serv2 = lê("lib/dreams/jornada-servico.ts")
      confere("serviço: a análise é salva ANTES de a cobrança sair de 'started'", serv2.indexOf("await salvarAnalise(") > 0 && serv2.indexOf("await salvarAnalise(") < serv2.indexOf("await d.concluir(seed)"))
      confere("serviço: a checagem pós-cobrança falha fechada", /d\.outraEmAndamento\(seed\)\.catch\(\(\) => true\)/.test(serv2))
    }
  }


  // ── L. esquema real da tabela: id, user_id, analysis_text, created_at ───────
  // (produção NÃO tem dreams_analyzed: a coluna inexistente fazia leitura e gravação falharem)
  {
    const COLUNAS = ["id", "user_id", "analysis_text", "dreams_count", "created_at"]
    const OBRIGATORIAS = ["user_id", "analysis_text", "dreams_count"] // dreams_count é NOT NULL em produção
    const linhas: Row[] = []
    let n = 0
    const estrito = {
      from(tabela: string) {
        if (tabela !== "journey_analyses") throw new Error("tabela inesperada " + tabela)
        const checa = (cols: string[]) => { for (const c of cols) if (!COLUNAS.includes(c.trim())) throw new Error(`column "${c.trim()}" of relation "journey_analyses" does not exist`) }
        const filtros: Array<[string, unknown]> = []
        let ins: Row | null = null
        const b: any = {
          select(cols: string) { checa(cols.split(",")); return b },
          eq(c: string, v: unknown) { checa([c]); filtros.push([c, v]); return b },
          order(c: string) { checa([c]); return b }, limit() { return b },
          insert(l: Row) { checa(Object.keys(l)); for (const o of OBRIGATORIAS) if (l[o] === undefined || l[o] === null) throw new Error(`null value in column "${o}" of relation "journey_analyses" violates not-null constraint`); ins = { id: "r" + ++n, created_at: "2026-10-26T00:00:00.000Z", ...l }; return b },
          async single() { linhas.push(ins!); return { data: ins, error: null } },
          async maybeSingle() { const r = linhas.filter((x) => filtros.every(([c, v]) => x[c] === v)); return { data: r[r.length - 1] ?? null, error: null } },
        }
        return b
      },
    }
    let erro = ""
    try {
      const gravada = await salvarAnalise(estrito, "ana", jx(["d1", "d2"]))
      const lida = await ultimaAnaliseDoUsuario(estrito, "ana")
      confere("esquema real: gravar e reler sem tocar em coluna inexistente e informando a obrigatória", lida?.id === gravada.id && lerAnalise(lida.analysis_text)?.versao === 2 && gravada.dreams_count === 2)
    } catch (e: any) { erro = e.message }
    confere("esquema real: nenhuma consulta usa coluna que não existe", erro === "", erro)
    const fonte = lê("lib/dreams/jornada-estado.ts").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
    confere("esquema real: o código das consultas não cita dreams_analyzed", !/\.(select|insert)\([^)]*dreams_analyzed/.test(fonte))
    confere("esquema real: a tela e a rota também não", !/dreams_analyzed/.test(lê("components/jornada-sonhos.tsx").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")) && !/dreams_analyzed/.test(lê("app/sonhos/journey/route.ts").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")))
    const sqlIso = lê("supabase/checks/journey_analyses_isolamento.sql").replace(/--.*$/gm, "")
    confere("esquema real: o SQL de verificação não usa coluna inexistente", !/dreams_analyzed/.test(sqlIso))
    // análise antiga sem coluna de contagem: a contagem vem da linha do tempo
    const velha4 = antigo(4)
    confere("análise antiga sem contagem: 4 itens e 4 sonhos, em dia", estadoDaJornada(D(4), velha4).fase === "atual")
    confere("análise antiga sem contagem: 5 sonhos, desatualizada com 1 novo", estadoDaJornada(D(5), velha4).fase === "desatualizada" && estadoDaJornada(D(5), velha4).novos.length === 1)
    const comContagem = { ...antigo(1), dreams_count: 4 }
    confere("análise antiga com dreams_count: a coluna manda sobre a linha do tempo", estadoDaJornada(D(4), comContagem).fase === "atual" && estadoDaJornada(D(5), comContagem).fase === "desatualizada" && estadoDaJornada(D(3), comContagem).fase === "sonho_excluido")
    let semObrigatoria = ""
    try { await salvarAnalise({ from: () => ({ insert: () => ({ select: () => ({ single: async () => ({ data: null, error: { message: "null value in column dreams_count" } }) }) }) }) }, "ana", jx(["d1", "d2"])) } catch (e: any) { semObrigatoria = e.message }
    confere("esquema real: erro de gravação é lançado (a rota então responde saved=false)", /dreams_count/.test(semObrigatoria))
    confere("análise antiga sem contagem: 3 sonhos, sonho excluído", estadoDaJornada(D(3), velha4).fase === "sonho_excluido")
  }

  // ── M. política: a primeira Jornada de cada conta é gratuita (uma única vez) ───
  {
    const I = "2026-10-01T00:00:00.000Z", F = "2026-11-01T00:00:00.000Z"
    const free = regraDeConsumo("journey", 0, I, F)
    confere("política: Free na Jornada vira 'primeira gratuita', limite 1, para sempre", free.primeiraGratis && free.limit === 1 && !free.planoNecessario && free.inicio === PRIMEIRA_JORNADA_INICIO && free.fim === PRIMEIRA_JORNADA_FIM)
    confere("política: a janela da primeira gratuita cobre qualquer período", Date.parse(PRIMEIRA_JORNADA_INICIO) <= 0 && Date.parse(PRIMEIRA_JORNADA_FIM) > Date.parse("2060-01-01"))
    const ess = regraDeConsumo("journey", 1, I, F), ilim = regraDeConsumo("journey", null, I, F)
    confere("política: Essencial segue igual (1 por período)", !ess.primeiraGratis && ess.limit === 1 && ess.inicio === I && ess.fim === F)
    confere("política: Ilimitado segue igual (sem limite)", !ilim.primeiraGratis && ilim.limit === null && ilim.inicio === I)
    confere("política: tiragem e sonho não ganham nada", !regraDeConsumo("reading", 1, I, F).primeiraGratis && !regraDeConsumo("dream", 1, I, F).primeiraGratis)
    confere("política: outro tipo com limite 0 continua exigindo plano", regraDeConsumo("dream", 0, I, F).planoNecessario === true && regraDeConsumo("reading", 0, I, F).planoNecessario === true)

    // a conta Free: primeira vale, atualização seguinte é recusada com free_used
    const mundoFree = () => {
      const w = mundo({ limite: null, sonhos: [sn("d1", 1), sn("d2", 2)] })
      const base = w.deps()
      const comRegra = (): DepsJornada => ({
        ...base,
        async consumir(seed) {
          const usadas = w.usos.filter((u) => u.status === "completed" || u.status === "started").length // janela: a vida da conta
          if (usadas >= regraDeConsumo("journey", 0, I, F).limit!) return { allowed: false, status: 402, corpo: { code: "free_used", limit: 1, used: usadas } }
          w.usos.push({ seed, status: "started" })
          return { allowed: true }
        },
      })
      return { w, comRegra }
    }
    const f = mundoFree()
    const r1 = await executarJornada(f.comRegra())
    confere("conta Free: a primeira Jornada é gerada e salva", r1.status === 200 && r1.corpo.saved === true && f.w.completos() === 1)
    f.w.tabelas.dreams.push({ user_id: "ana", ...sn("d3", 3) })
    const r2 = await executarJornada(f.comRegra())
    confere("conta Free: a atualização seguinte é recusada (402 free_used), sem modelo", r2.status === 402 && r2.corpo.code === "free_used" && f.w.modelo.chamadas === 1)
    confere("conta Free: reabrir a primeira continua grátis e disponível", (await executarJornada({ ...f.comRegra(), client: mundo({ limite: null, sonhos: f.w.tabelas.dreams.slice(0, 2), analises: f.w.tabelas.journey_analyses }).deps().client })).corpo.reused === true)
    const g = mundoFree()
    const rs = await Promise.all([executarJornada(g.comRegra()), executarJornada(g.comRegra()), executarJornada(g.comRegra())])
    confere("conta Free: três pedidos simultâneos geram uma única Jornada e cobram uma vez", g.w.modelo.chamadas <= 1 && g.w.tabelas.journey_analyses.length <= 1 && g.w.completos() <= 1 && rs.every((x) => [200, 402, 409].includes(x.status)))
    const h = mundoFree()
    const hf = h.comRegra()
    const mudo = { ...hf, async gerar() { throw new Error("falha do provedor") } } as DepsJornada
    await executarJornada(mudo)
    const rh = await executarJornada(h.comRegra())
    confere("conta Free: geração que falhou não gasta a gratuita", rh.status === 200 && h.w.completos() === 1)

    // o banco: janela por conta, contando só o que vale (migration)
    const sql = lê("supabase/migrations/20260907_visitor_readings.sql")
    confere("banco: consume_reading conta pela janela recebida (a vida da conta, aqui)", /created_at >= p_period_start\s+and created_at <\s+p_period_end/.test(sql) && /status = 'completed'/.test(sql))
    confere("banco: uso que falhou não conta", /status = 'failed'/.test(sql) && !/status in \('failed'/.test(sql))
    const uso = lê("lib/billing/usage.ts")
    confere("consumo: o RPC usa a regra de produto (limite e janela dela)", /p_limit: regra\.limit/.test(uso) && /p_period_start: regra\.inicio/.test(uso) && /p_period_end: regra\.fim/.test(uso))
    confere("consumo: primeira gratuita esgotada responde free_used (não plan_required)", /if \(regra\.primeiraGratis\) return \{ allowed: false, code: "free_used"/.test(uso))
    confere("consumo: free_used responde 402 como os demais bloqueios de plano", httpStatusFor("free_used") === 402)

    // interface e textos
    const comp = lê("components/jornada-sonhos.tsx")
    confere("tela: free_used mostra o texto do dicionário e o link para planos", /free_used/.test(comp) && /journeyFreeUsed/.test(comp))
    for (const [loc, d] of Object.entries({ pt, en, es })) {
      const b = d.billing as Record<string, any>
      confere(`i18n ${loc}: journeyFreeUsed`, typeof b.journeyFreeUsed === "string" && b.journeyFreeUsed.length > 20 && !/[—–]/.test(b.journeyFreeUsed))
      const quadro = JSON.stringify(d)
      confere(`i18n ${loc}: os planos não dizem mais que o Free 'não inclui' a Jornada`, !/Jornada onírica", free: "Não inclui"|Dream Journey", free: "Not included"|Viaje onírico", free: "No incluido"/.test(quadro.replace(/\\"/g, '"')))
    }
    confere("i18n: EN e ES do aviso não estão em português", !/Jornada|gratuita|atualiza/i.test(en.billing.journeyFreeUsed + es.billing.journeyFreeUsed))
    confere("i18n: a tabela de planos diz 'só a primeira' para o Free (PT)", /free: "Só a primeira"/.test(lê("lib/i18n/dictionaries/pt.ts")))
  }

  // ── N. a primeira bateria com o modelo real vira regressão ──────────────────
  {
    const v1 = verificarJornada(REAL_1, [R1, R2], "pt")
    confere("bateria real 1: 'Em aberto' vazio é pego", v1.some((x) => /em aberto/.test(x)), v1.join("; "))
    const v3 = verificarJornada(REAL_3, [R1, R2, R3], "pt")
    confere("bateria real 3: trajetória de crescimento ('progresso', 'progressão', 'evolução na') é pega", v3.some((x) => /progresso ou evolução/.test(x)), v3.join("; "))
    confere("bateria real 3: 'Em aberto' vazio é pego", v3.some((x) => /em aberto/.test(x)))
    const v4 = verificarJornada(REAL_4, [E1, E2], "en")
    confere("bateria real 4: 'recurring' com dois sonhos é pego", v4.some((x) => /recorrência/.test(x)), v4.join("; "))
    confere("bateria real 4: pergunta sobre a vida desperta é pega", v4.some((x) => /vida desperta/.test(x)))
    // o que não pode virar falso positivo: texto bom continua limpo com as regras novas
    for (const [nome, { sonhos, j, locale }] of Object.entries(BOA)) confere(`regras novas: fixture ${nome} continua aprovada`, verificarJornada(j, sonhos, locale).length === 0)
    // o prompt carrega as correções e não vaza as imagens dos relatos reais
    const p2 = montarPromptJornada("pt", { n: 2 }), p3 = montarPromptJornada("pt", { n: 3 })
    confere("prompt: exige citar a imagem exata de cada sonho e proíbe contar imagem ausente", /nomeie a imagem exata de CADA sonho/.test(p2) && /não pode ser contada como presente em todos/.test(p2))
    confere("prompt: proíbe valorar a mudança como progresso ou evolução", /não as chame de progresso, progressão, evolução da pessoa/.test(p3))
    confere("prompt: 'openQuestions' é obrigatório e não pergunta sobre a vida desperta", /campo obrigatório, sempre de 2 a 3 itens, nunca vazio/.test(p3) && /não perguntam sobre a vida desperta/.test(p3))
    confere("prompt: com dois sonhos prefere poucas conexões frágeis a uma firme e fraca", /de 1 a 4/.test(p2) && /prefira poucas conexões, ditas como frágeis/.test(p2))
    confere("prompt: não contém imagens dos relatos usados na bateria", !/(?<![\p{L}])(ponte|barco|avó|supermercado|envelope|rio)(?![\p{L}])/iu.test(p2 + p3))
    // as chaves que o modelo precisa devolver continuam nomeadas no prompt
    confere("prompt: nomeia as cinco chaves do JSON", ["timeline", "connections", "evolution", "integrated", "openQuestions"].every((k) => p3.includes('"' + k + '"')))
  }

  if (falhas.length) {
    console.error(`verify:jornada FALHOU (${falhas.length} de ${conferidos})`)
    for (const f of falhas) console.error("  ✗ " + f)
    process.exit(1)
  }
  console.log(`verify:jornada OK (${conferidos} conferências)`)
}
main()
