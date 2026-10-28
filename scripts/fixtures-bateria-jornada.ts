/**
 * Relatos fictícios controlados e saídas REAIS (gpt-4o) da primeira bateria
 * editorial (docs/bateria-jornada-1.md), usados como fixtures de regressão:
 * o verificador tem de pegar o que o leitor humano apontou nelas.
 * Sem rede, sem custo.
 */
import type { JornadaV2, SonhoDaJornada } from "../lib/dreams/jornada-estado"

const S = (id: string, data: string, texto: string): SonhoDaJornada => ({ id, created_at: `${data}T12:00:00.000Z`, dream_description: texto })

export const R1 = S("r1", "2026-09-03", "Eu estava na margem de um rio largo e escuro. Havia uma ponte de madeira, mas faltavam várias tábuas no meio. Minha avó, já falecida, estava do outro lado, de vestido azul, e acenava devagar. Tentei atravessar a nado e a correnteza me empurrava de volta. Acordei cansada, com a sensação de ter ficado a um passo.")
export const R2 = S("r2", "2026-09-17", "Eu caminhava por um corredor comprido de uma escola vazia, com cheiro de giz. No fim havia uma porta de ferro que abriu sem esforço. Do outro lado, um campo aberto de grama alta e um barco de madeira virado de lado no capim, longe de qualquer água. Não havia ninguém. Sentei no barco e fiquei olhando o céu, sem saber se tinha chegado ou se ainda estava a caminho.")
export const R3 = S("r3", "2026-09-30", "Estava sozinha num barco pequeno, remando num rio calmo ao entardecer. Na margem havia uma casa com a luz acesa e uma figura na janela que eu não conseguia reconhecer. Não remei até lá. Parei os remos e deixei o barco seguir devagar, olhando a luz.")
export const D1 = S("d1", "2026-09-05", "Eu estava num supermercado e precisava escolher entre dois carrinhos iguais. Um atendente me entregou uma lista de compras escrita num idioma que eu não conhecia. Comprei uma única maçã e paguei com uma moeda antiga. Todo mundo no caixa me aplaudiu e eu não entendi por quê.")
export const D2 = S("d2", "2026-09-19", "Eu era criança e brincava de esconde-esconde num sótão cheio de relógios parados. Uma amiga que nunca vi me contava um segredo ao ouvido, mas eu só ouvia o som do mar. Dei de ombros e continuei contando até dez, de olhos fechados.")
export const E1 = S("e1", "2026-09-04", "I was standing on a pier at night, holding a lantern that kept going out. A man in a gray coat asked me to carry a sealed envelope to the other shore, but the ferry had no pilot. I stepped on anyway and the deck was warm.")
export const E2 = S("e2", "2026-09-18", "I was in my childhood kitchen and the table was set for six, but I was the only one there. A window opened onto the same dark water as before, and the envelope was lying under a plate, already open and empty.")

const tl = (...i: Array<[string, string, string]>) => i.map(([title, archetypes, summary], k) => ({ number: k + 1, title, archetypes, summary }))

/** teste 1 (2 sonhos relacionados): "Em aberto" veio vazio */
export const REAL_1: JornadaV2 = {
  versao: 2, locale: "pt", dreamIds: ["r1", "r2"], evolution: [], openQuestions: [],
  timeline: tl(["Ponte sobre o rio escuro", "rio largo e escuro · ponte de madeira · avó acenando", "Atravessar um rio largo e escuro por uma ponte incompleta para alcançar a avó falecida, mas é empurrada pela correnteza."], ["Corredor na escola vazia", "corredor de escola vazia · porta de ferro · barco de madeira no campo", "Caminhar por um corredor vazio até uma porta de ferro que se abre para um campo aberto com um barco de madeira virado."]),
  connections: [
    "Nos dois sonhos, há a presença de madeira em elementos de travessia: a ponte incompleta no primeiro e o barco virado no segundo. Ambos simbolizam meios de transporte ou passagem que não estão em uso pleno, sugerindo transições interrompidas ou incompletas.",
    "A figura da avó falecida no primeiro sonho e o campo vazio no segundo apontam para a ausência de pessoas significativas ou guias, tornando a travessia mais solitária e incerta em ambos os cenários.",
    "O rio escuro e a escola vazia criam atmosferas de desolação e desafio. No primeiro, a natureza e uma figura familiar estão distantes, enquanto no segundo, a arquitetura escolar se transforma em um campo vazio, indicando uma mudança de ambiente que não traz pessoas, mas sim um espaço aberto.",
  ],
  integrated: "Os dois sonhos apresentam elementos de travessia e transição, simbolizados pela ponte e pelo barco, que não cumprem seu papel de transporte. Ambos sugerem um movimento interrompido ou uma passagem não concretizada, enquanto quem sonha enfrenta a solidão e a ausência de guias significativos, seja pela figura da avó já falecida ou pela escola vazia e o campo deserto. A sensação de incerteza e de estar a caminho permeia ambos os relatos, embora os cenários e os desfechos sejam distintos.",
}

/** teste 3 (3 sonhos, com leitura anterior): trajetória de crescimento e "barco nos três sonhos" inventados */
export const REAL_3: JornadaV2 = {
  versao: 2, locale: "pt", dreamIds: ["r1", "r2", "r3"], openQuestions: [],
  timeline: tl(["Ponte Incompleta sobre Rio Escuro", "ponte de madeira · avó falecida · rio largo e escuro", "Uma ponte de madeira incompleta sobre um rio largo e escuro impede a travessia até a avó já falecida que acena do outro lado."], ["Barco Virado no Campo", "escola vazia · barco de madeira virado · campo aberto", "Após atravessar um corredor de escola vazia, um campo aberto aparece com um barco de madeira virado, sugerindo incerteza sobre a chegada ou partida."], ["Barco no Rio ao Entardecer", "barco pequeno · rio calmo · casa com luz acesa", "Navegando sozinha em um barco pequeno num rio calmo ao entardecer, uma casa com luz acesa na margem é observada sem aproximação."]),
  connections: [
    "Nos três sonhos, há a presença constante de elementos aquáticos: o rio largo e escuro do primeiro, o barco virado distante de água no segundo e o rio calmo no terceiro. A água sugere um elemento de transição ou fluxo emocional que se modifica ao longo dos sonhos.",
    "A figura da avó falecida no primeiro sonho e a figura indistinta na janela do terceiro sonho podem simbolizar guias ou presenças importantes que, apesar de não serem alcançadas, continuam a influenciar a jornada.",
    "O barco de madeira aparece nos três sonhos, mudando de contexto: da impossibilidade de uso no segundo para um meio de navegação no terceiro, sugerindo uma evolução na capacidade de conduzir a própria travessia.",
    "A atmosfera de solitude e observação se mantém, mas se transforma: do esforço frustrado para nadar até a avó no primeiro sonho até a contemplação passiva da luz na janela no terceiro, indicando uma mudança de atitude frente à travessia.",
    "A transição de cenários fechados para abertos (da escola vazia ao campo e ao rio aberto) sugere uma progressão do controle para a liberdade, embora a incerteza sobre o destino persista.",
  ],
  evolution: [
    { type: "persists", text: "A presença de barcos de madeira, que simbolizam um meio de transporte, aparece em todos os sonhos, mudando de posição e contexto." },
    { type: "changed", text: "A interação com a água, antes uma barreira no primeiro sonho, se torna um elemento de calmaria e contemplação no terceiro." },
    { type: "gaining", text: "A imagem do rio e do barco navegando com relativa autonomia no terceiro sonho sugere uma evolução na capacidade de conduzir a própria jornada." },
    { type: "fading", text: "A figura da avó falecida, presente no primeiro sonho, não retorna nos sonhos subsequentes, sendo substituída por figuras indistintas." },
  ],
  integrated: "Os três sonhos compartilham temas de travessia e transição, simbolizados por rios e barcos, sugerindo um processo de deslocamento e busca de direção. O primeiro sonho apresenta um desafio não superado, enquanto o segundo introduz uma pausa contemplativa e um barco fora de contexto, e o terceiro culmina em uma navegação calma que indica progresso na condução de suas próprias experiências. A presença de figuras distantes ou indistintas sugere influências ou guias não plenamente acessíveis, mas que continuam a impactar a jornada. A transição de cenários fechados para abertos e de ação frustrada para contemplação passiva aponta para uma evolução na atitude frente à travessia, embora a incerteza sobre o destino final persista.",
}

/** teste 4 (EN, 2 sonhos): "recurring" com dois sonhos; perguntas que puxam para a vida desperta */
export const REAL_4: JornadaV2 = {
  versao: 2, locale: "en", dreamIds: ["e1", "e2"], evolution: [],
  timeline: tl(["Pier at Night with Lantern", "pier · lantern · gray-coated man · sealed envelope · ferry", "The dreamer stands on a pier at night with a lantern that keeps going out and is asked by a man in a gray coat to carry a sealed envelope across the water on a pilotless ferry."], ["Childhood Kitchen with Open Envelope", "childhood kitchen · table set for six · dark water view · open and empty envelope", "The dreamer is in a childhood kitchen, alone at a table set for six, with a window showing dark water and an open, empty envelope under a plate."]),
  connections: [
    "Both dreams involve a body of dark water, suggesting a symbolic continuity of unknown or subconscious depths that connect different settings: the pier and the kitchen.",
    "The envelope appears in both dreams, initially sealed in the first and open and empty in the second, indicating a potential shift from mystery or potential to revelation or loss.",
    "In the first dream, the dreamer is tasked with a journey across water, while in the second, the setting is domestic and static, hinting at a transition from movement and uncertainty to introspection and solitude.",
    "The lantern that goes out in the first dream contrasts with the kitchen setting in the second dream where there is no mention of light, suggesting a shift from attempting to illuminate the unknown to accepting what is present.",
  ],
  integrated: "The two dreams present a journey from an uncertain task given by an external figure to a more introspective moment in a familiar setting. The recurring image of dark water ties both dreams together, symbolizing the unknown or emotional depths. The envelope, initially a task to be completed, transforms into an open and empty object, which could suggest a transition from potential or expectation to a realization or void. The movement from the pier to the kitchen reflects a shift from external to internal focus, from an active crossing to a passive waiting or reflection.\n\nThe dreams together propose a narrative of exploring unknown territories, only to arrive at a place of introspection and solitude. The absence of others at the table set for six might imply a feeling of isolation or self-reflection, contrasting with the external task presented by the man in the first dream. The warmth of the ferry deck in the first dream contrasts with the static kitchen setting, suggesting different emotional tones in the journey and the arrival.",
  openQuestions: [
    "What might the significance of the envelope's transition from sealed to open and empty be, and how does it relate to the dreamer's waking life experiences or feelings?",
    "How does the recurring theme of dark water connect to the dreamer's emotions or subconscious, and what might it represent in terms of personal exploration?",
    "What does the absence of others at the table set for six in the second dream suggest about the dreamer's feelings of connection or isolation?",
  ],
}
