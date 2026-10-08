/**
 * Interpretação de sonhos: pontuação e função de cada seção.
 *
 * O que este verificador existe para impedir:
 *
 *  1. o travessão (ou a meia risca) voltando ao prompt, ao exemplo do prompt
 *     ou ao texto gerado, em PT, EN e ES;
 *  2. a rota voltar a ter um prompt próprio, sem a regra, em vez de usar
 *     `montarPromptSonho` e a guarda de stream;
 *  3. a estrutura voltar a repetir a mesma tese em introdução, síntese e
 *     fechamento (limite de repetição medido entre seções);
 *  4. a guarda de stream falhar quando o traço e seus espaços chegam em
 *     chunks diferentes.
 *
 * Os textos abaixo são fixtures escritas à mão (o "antes" reproduz o formato
 * que o prompt antigo pedia). Zero IA, zero rede.
 */
import fs from "node:fs"
import path from "node:path"
import {
  criarGuardaTracos,
  dividirSecoes,
  montarPromptSonho,
  removerTracos,
  sobreposicao,
  TITULOS_SONHO,
  verificarInterpretacaoSonho,
} from "../lib/oracles/sonhos-prompt"
import { LOCALES } from "../lib/i18n/config"
import type { Locale } from "../lib/i18n/config"

const falhas: string[] = []
let conferidos = 0
function confere(titulo: string, ok: boolean, detalhe = "") {
  conferidos += 1
  if (!ok) falhas.push(detalhe ? `${titulo}: ${detalhe}` : titulo)
}

const RELATO = `Eu estava na casa da minha infância, mas a escada levava para baixo, até um porão alagado. Uma mulher de vestido azul me entregou uma chave enferrujada e eu não conseguia abrir a porta, embora ouvisse alguém chamar meu nome do outro lado. Quando a água chegou aos joelhos, não senti medo, só cansaço.`

// ── ANTES: o formato que o prompt antigo pedia (fixture) ──────────────────────
const ANTES_PT = `## INTRODUÇÃO

Este sonho revela um movimento profundo do inconsciente. Vamos explorar seus símbolos como dramatizações de processos psíquicos internos — a relação entre consciente e inconsciente, padrões arquetípicos e movimentos de transformação.

## SÍMBOLOS PRINCIPAIS

**1. A casa da infância**
A casa representa o mundo interno e as origens, o lugar onde a identidade se formou. Ela revela como o inconsciente guarda as memórias que moldam a pessoa e o processo de transformação interior.

**2. O porão alagado**
O porão é o inconsciente, e a água simboliza as emoções. Ele revela um processo de transformação profunda do inconsciente que precisa ser integrado.

**3. A chave enferrujada**
A chave simboliza o acesso, e a ferrugem mostra o tempo. Revela que a transformação interior precisa de acesso ao inconsciente.

## DINÂMICA PSÍQUICA

**O dilema central**
O sonho mostra a relação entre consciente e inconsciente, com a casa da infância como origem e o porão alagado como inconsciente. A chave enferrujada é o acesso ao inconsciente, e a transformação interior depende dele.

O sonhador precisa integrar o inconsciente, pois o sonho prova que há emoções antigas esperando transformação.

## SÍNTESE

**O movimento do inconsciente**
Este sonho revela um movimento profundo do inconsciente, uma relação entre consciente e inconsciente, com a casa da infância, o porão alagado e a chave enferrujada como símbolos de transformação interior.

O inconsciente está comunicando:
- A transformação interior é necessária
- O inconsciente precisa ser integrado
- As emoções antigas esperam ser acessadas

## MENSAGEM DO INCONSCIENTE

**O chamado**
- O que o inconsciente quer comunicar?
- Como integrar o inconsciente à vida?
- Que transformação interior você precisa?

O inconsciente comunica que a transformação interior é necessária, e a relação entre consciente e inconsciente precisa ser integrada.`

// ── DEPOIS: o formato novo (fixtures; uma por idioma) ─────────────────────────
const DEPOIS: Record<Locale, string> = {
  pt: `## INTRODUÇÃO

Uma escada que desce, na casa onde a infância aconteceu, até um porão tomado pela água. Alguém chama de fora de uma porta que a chave recebida não abre.

## SÍMBOLOS PRINCIPAIS

**1. A escada para baixo**
Numa casa conhecida, o caminho não sobe para os quartos: desce. O relato não traz hesitação ao descer, e isso pode indicar que o movimento de ir ao fundo acontece quase por hábito, não por escolha.

**2. O porão alagado**
Já está cheio de água antes de a pessoa chegar, o que sugere algo que se acumulou sem que ela o tenha provocado agora. A água sobe aos joelhos, ou seja, alcança sem cobrir.

**3. A mulher de vestido azul**
Não fala nada no relato: só entrega. Pode ser lida como uma figura que transmite acesso sem explicar, e a cor azul a aproxima do clima frio e calmo do lugar.

**4. A chave enferrujada**
Ela é dada, não encontrada, mas está gasta. O que foi oferecido pode ter perdido o uso antes de chegar às mãos de quem a recebe.

## DINÂMICA PSÍQUICA

**Receber o acesso e não conseguir usá-lo**
A sequência importa: primeiro a descida, depois a chave, depois a porta que não cede. O sonho parece separar duas coisas que costumam andar juntas, ter permissão para entrar e conseguir entrar. A mulher dá a chave sem ensinar o gesto, e a ferrugem sugere que o instrumento envelhece junto com o assunto que ele deveria abrir.

Do outro lado, a voz chama o nome da pessoa. Isso muda a tensão: a porta não guarda algo estranho, guarda alguém que a conhece. Ao mesmo tempo a água sobe, e a reação não é pressa nem medo, é cansaço. Uma hipótese é que o desgaste, e não o perigo, seja o que organiza a cena: a pessoa não foge da água porque já se acostumou a ficar nela.

## SÍNTESE

- A chave existe, mas o acesso não funciona.
- O chamado vem de quem conhece o nome, não de um estranho.
- O cansaço ocupa o lugar que o medo ocuparia.

## PERGUNTAS PARA REFLEXÃO

- O que a chave gasta poderia abrir, se fosse trocada por algo que você mesmo escolhesse?
- Quem, na sua história, poderia estar do outro lado dizendo o seu nome?`,
  en: `## INTRODUCTION

A staircase leads down, in the house where childhood happened, to a flooded basement. Someone calls from behind a door that the key you were handed will not open.

## MAIN SYMBOLS

**1. The staircase going down**
In a familiar house the way does not go up to the bedrooms but down. The account mentions no hesitation, which may suggest that going deep happens almost by habit rather than by choice.

**2. The flooded basement**
It is already full of water before you arrive, which hints at something that built up without being caused now. The water reaches the knees: it touches without covering.

**3. The woman in the blue dress**
She says nothing in the account, she only hands things over. She can be read as a figure who passes on access without explaining it, and the blue ties her to the cold, calm mood of the place.

**4. The rusty key**
It is given, not found, yet it is worn. What was offered may have lost its use before reaching the hands that receive it.

## PSYCHIC DYNAMICS

**Receiving access and being unable to use it**
The sequence matters: first the descent, then the key, then the door that will not give. The dream seems to separate two things that usually travel together, being allowed in and being able to enter. The woman gives the key without teaching the gesture, and the rust suggests the tool aged along with the matter it was meant to open.

On the other side a voice calls the dreamer by name. That shifts the tension: the door does not hide a stranger, it hides someone who knows them. Meanwhile the water rises, and the reaction is neither haste nor fear but tiredness. One hypothesis is that weariness, not danger, organizes the scene: one does not flee the water because one has grown used to standing in it.

## SYNTHESIS

- The key exists, but access does not work.
- The call comes from someone who knows the name, not from a stranger.
- Tiredness takes the place fear would occupy.

## QUESTIONS FOR REFLECTION

- What could the worn key open if it were swapped for something you chose yourself?
- Who in your story might be on the other side saying your name?`,
  es: `## INTRODUCCIÓN

Una escalera baja, en la casa donde ocurrió la infancia, hasta un sótano inundado. Alguien llama desde una puerta que la llave recibida no abre.

## SÍMBOLOS PRINCIPALES

**1. La escalera hacia abajo**
En una casa conocida el camino no sube a los dormitorios: baja. El relato no menciona duda al bajar, y eso puede indicar que ir al fondo ocurre casi por costumbre y no por elección.

**2. El sótano inundado**
Ya está lleno de agua antes de llegar, lo que sugiere algo acumulado sin que se haya provocado ahora. El agua sube hasta las rodillas: alcanza sin cubrir.

**3. La mujer del vestido azul**
No dice nada en el relato, solo entrega. Puede leerse como una figura que transmite acceso sin explicarlo, y el azul la acerca al clima frío y calmo del lugar.

**4. La llave oxidada**
Se la dan, no la encuentra, pero está gastada. Lo ofrecido pudo haber perdido su uso antes de llegar a las manos de quien la recibe.

## DINÁMICA PSÍQUICA

**Recibir el acceso y no poder usarlo**
La secuencia importa: primero el descenso, luego la llave, luego la puerta que no cede. El sueño parece separar dos cosas que suelen ir juntas, tener permiso para entrar y poder entrar. La mujer da la llave sin enseñar el gesto, y el óxido sugiere que la herramienta envejeció junto con el asunto que debía abrir.

Del otro lado, una voz llama a la persona por su nombre. Eso cambia la tensión: la puerta no esconde a un extraño, esconde a alguien que la conoce. Mientras tanto el agua sube, y la reacción no es prisa ni miedo, es cansancio. Una hipótesis es que el desgaste, y no el peligro, organice la escena: no se huye del agua porque ya se aprendió a estar en ella.

## SÍNTESIS

- La llave existe, pero el acceso no funciona.
- El llamado viene de quien conoce el nombre, no de un extraño.
- El cansancio ocupa el lugar que ocuparía el miedo.

## PREGUNTAS PARA LA REFLEXIÓN

- ¿Qué podría abrir la llave gastada si la cambiaras por algo que tú elegiste?
- ¿Quién, en tu historia, podría estar del otro lado diciendo tu nombre?`,
}

// ── A. o prompt: sem o caractere, nem como exemplo, em nenhum idioma ──────────
for (const locale of LOCALES) {
  const p = montarPromptSonho(locale)
  confere(`prompt ${locale}: sem travessão nem meia risca`, !/[—–]/.test(p))
  confere(`prompt ${locale}: dita a regra de pontuação`, /travessão/.test(p))
  for (const t of Object.values(TITULOS_SONHO[locale])) confere(`prompt ${locale}: contém o título ${t}`, p.includes(`## ${t}`))
  confere(`prompt ${locale}: pede 2 perguntas e síntese curta`, /Exatamente 2 perguntas/.test(p) && /2 a 3 pontos/.test(p))
}

// ── B. a rota usa o módulo (não volta a ter prompt próprio) ───────────────────
const rota = fs.readFileSync(path.join(process.cwd(), "app/api/sonhos/interpret/route.ts"), "utf8")
confere("rota: usa montarPromptSonho", /montarPromptSonho\(/.test(rota))
confere("rota: usa a guarda de travessão no stream", /criarGuardaTracos\(/.test(rota))
confere("rota: sem SYSTEM_PROMPT literal próprio", !/const SYSTEM_PROMPT\s*=/.test(rota))
confere("rota: sem travessão no código", !/[—–]/.test(rota.replace(/^\s*\/\/.*$/gm, "")))

// ── C. o texto novo passa em PT, EN e ES; o antigo reprova ────────────────────
for (const locale of LOCALES) {
  const v = verificarInterpretacaoSonho(DEPOIS[locale], locale)
  confere(`depois ${locale}: aprovado`, v.length === 0, v.join("; "))
  confere(`depois ${locale}: sem travessão`, !/[—–]/.test(DEPOIS[locale]))
}
const vAntes = verificarInterpretacaoSonho(ANTES_PT, "pt")
confere("antes: reprovado", vAntes.length > 0)
confere("antes: detecta travessão", vAntes.some((x) => /travessão/.test(x)))

// ── D. mutações: cada defeito individual é pego ───────────────────────────────
const base = DEPOIS.pt
const mutacoes: [string, string, RegExp][] = [
  ["travessão no meio do texto", base.replace("sem ensinar o gesto, e", "sem ensinar o gesto — e"), /travessão/],
  ["meia risca", base.replace("Quem, na sua", "Quem – na sua"), /travessão/],
  ["introdução de 3 frases", base.replace("Alguém chama de fora de uma porta que a chave recebida não abre.", "Alguém chama de fora. A porta não abre. A chave não serve."), /introdução/],
  ["síntese com 4 pontos", base.replace("- O cansaço ocupa", "- Um quarto ponto qualquer.\n- O cansaço ocupa"), /síntese/],
  ["síntese com parágrafo", base.replace("## SÍNTESE\n\n", "## SÍNTESE\n\nEm resumo, o sonho fala de acesso.\n\n"), /síntese/],
  ["3 perguntas", base.replace("## PERGUNTAS PARA REFLEXÃO\n\n", "## PERGUNTAS PARA REFLEXÃO\n\n- Que pergunta extra?\n"), /perguntas/],
  ["parágrafo de fechamento", base + "\n\nO inconsciente comunica que a chave gasta e o chamado são o centro do sonho.", /fora da lista/],
  ["título antigo", base.replace("## PERGUNTAS PARA REFLEXÃO", "## MENSAGEM DO INCONSCIENTE"), /fora do formato/],
  [
    "síntese recapitula a dinâmica",
    base.replace(/## SÍNTESE[\s\S]*?## PERGUNTAS/, "## SÍNTESE\n\n- A sequência importa: primeiro a descida, depois a chave, depois a porta que não cede.\n- A mulher dá a chave sem ensinar o gesto, e a ferrugem sugere que o instrumento envelhece.\n\n## PERGUNTAS"),
    /SÍNTESE.*repete/,
  ],
  [
    "introdução repete a síntese",
    base.replace(/## INTRODUÇÃO[\s\S]*?## SÍMBOLOS/, "## INTRODUÇÃO\n\nA chave existe, mas o acesso não funciona. O chamado vem de quem conhece o nome.\n\n## SÍMBOLOS"),
    /repete/,
  ],
]
for (const [nome, texto, esperado] of mutacoes) {
  const v = verificarInterpretacaoSonho(texto, "pt")
  confere(`mutação "${nome}" é pega`, v.some((x) => esperado.test(x)), v.length ? v.join("; ") : "passou sem violação")
}

// ── E. a guarda de stream: o resultado não depende de onde o stream corta ─────
const amostras = [
  "Uma frase — com aposto — no meio.",
  "Intervalo de 2–3 dias e uma pausa – curta.",
  "Linha um\n— fala solta no começo\nLinha três",
  "Sem nenhum traço, só hífen-composto e - lista.",
  "Termina com traço —",
  "— começa com traço",
]
const esperadoDaGuarda = amostras.map((a) => removerTracos(a))
for (let i = 0; i < amostras.length; i++) {
  const r = esperadoDaGuarda[i]
  confere(`guarda: amostra ${i + 1} sem traço`, !/[—–]/.test(r), JSON.stringify(r))
  // corta em toda posição possível e em fatias de 1 caractere
  let divergiu = ""
  for (let corte = 0; corte <= amostras[i].length; corte++) {
    const g = criarGuardaTracos()
    const saida = g.empurrar(amostras[i].slice(0, corte)) + g.empurrar(amostras[i].slice(corte)) + g.encerrar()
    if (saida !== r) { divergiu = `corte ${corte}: ${JSON.stringify(saida)} != ${JSON.stringify(r)}`; break }
  }
  const g1 = criarGuardaTracos()
  const um = [...amostras[i]].map((c) => g1.empurrar(c)).join("") + g1.encerrar()
  if (!divergiu && um !== r) divergiu = `char a char: ${JSON.stringify(um)} != ${JSON.stringify(r)}`
  confere(`guarda: amostra ${i + 1} independe do corte`, !divergiu, divergiu)
}
confere("guarda: aposto vira vírgula", removerTracos("a — b — c") === "a, b, c", JSON.stringify(removerTracos("a — b — c")))
confere("guarda: intervalo numérico vira hífen", removerTracos("2–3 dias") === "2-3 dias")
confere("guarda: lista com hífen simples fica intacta", removerTracos("- um\n- dois") === "- um\n- dois")
confere("guarda: espaço final preservado", removerTracos("fim. ") === "fim. ")

// ── F. a medida de repetição distingue o antes do depois ──────────────────────
const sAntes = dividirSecoes(ANTES_PT, "pt")
const sDepois = dividirSecoes(DEPOIS.pt, "pt")
const repAntes = sobreposicao(sAntes.sintese ?? "", `${sAntes.introducao}\n${sAntes.simbolos}\n${sAntes.dinamica}`)
const repDepois = sobreposicao(sDepois.sintese ?? "", `${sDepois.introducao}\n${sDepois.simbolos}\n${sDepois.dinamica}`)
confere("repetição: síntese antiga repete mais que a nova", repAntes > repDepois, `${repAntes.toFixed(2)} vs ${repDepois.toFixed(2)}`)

void RELATO

if (falhas.length) {
  console.error(`verify:sonhos FALHOU (${falhas.length} de ${conferidos})`)
  for (const f of falhas) console.error("  ✗ " + f)
  process.exit(1)
}
console.log(`verify:sonhos OK (${conferidos} conferências)`)
