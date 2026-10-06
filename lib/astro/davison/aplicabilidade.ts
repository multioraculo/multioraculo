/**
 * A aplicabilidade das frases do repertório que citam um tipo de relação.
 *
 * Davison às vezes ilustra uma dinâmica geral com um vínculo ("em relações de
 * trabalho, Marte fornece o impulso...") e às vezes escreve algo que só faz
 * sentido num vínculo ("em vínculo de negócios, ... capital para financiar
 * invenções"). Esta é a REVISÃO LOCALIZADA, feita lendo cada frase, de uma ou
 * outra coisa. Não é filtro por palavra: a palavra só localizou os candidatos
 * (`scripts/listar-frases-de-vinculo.ts`); a classificação é de conteúdo.
 *
 *  - `exemplo_contextual`: o vínculo é só ilustração de uma dinâmica geral. Se a frase nomeia o tipo de vínculo
 *    (`mantemEm`), o nome sai nos outros vínculos e a frase original fica no vínculo dele.
 *    Se o exemplo sai sem perder o sentido, `texto` traz o núcleo geral e é ele
 *    que vai ao prompt; a frase completa fica na glosa, para auditoria. Se
 *    não sai sem inventar (um papel dito por metáfora, uma atividade), `texto`
 *    é `null` e a frase vai como está. Vale para qualquer vínculo.
 *  - `dependencia_real`: a afirmação só se sustenta naquele contexto, e
 *    `vinculos` diz em quais. Para os demais a frase NÃO vai ao prompt.
 *
 * É só uma restrição de aplicabilidade da própria evidência. O aspecto, o
 * ranking, o orçamento e a relevância não dependem dela: o seletor nem a lê.
 * Quem a aplica é o payload, que filtra e troca o texto ao montar o prompt.
 *
 * O vínculo `outro` (relação não especificada) não recebe frase de dependência
 * real: nada autoriza supor atração, parceria de negócios ou convívio doméstico
 * onde o vínculo declarado não diz.
 *
 * Fora desta revisão ficam as frases que falam de um CAMPO DA VIDA (o ambiente
 * doméstico na casa 4, o trabalho cotidiano na casa 6, a carreira na casa 10)
 * ou de uma terceira pessoa (os filhos de quem tem a casa): não dizem que tipo
 * de relação as duas pessoas têm.
 */
import type { Vinculo } from "../sinastria-servico"

export type ClasseDeAplicabilidade = "exemplo_contextual" | "dependencia_real"

export type RevisaoDeFrase =
  | {
      classe: "exemplo_contextual"
      /** a frase como está na glosa, para detectar se a glosa mudou sem a revisão */
      de: string
      /** o núcleo geral, sem o exemplo; `null` quando a frase vai como está */
      texto: string | null
      /** vínculos em que o exemplo é o próprio vínculo e a frase original fica (ex.: "amizade firme" na amizade) */
      mantemEm?: readonly Vinculo[]
      /** o que o exemplo era, e por que sai ou fica */
      nota: string
    }
  | {
      classe: "dependencia_real"
      de: string
      /** os vínculos em que a frase se aplica; os demais não a recebem */
      vinculos: readonly Vinculo[]
      nota: string
    }

const EX = (de: string, texto: string | null, nota: string, mantemEm?: readonly Vinculo[]): RevisaoDeFrase => ({ classe: "exemplo_contextual", de, texto, nota, ...(mantemEm ? { mantemEm } : {}) })
const DEP = (de: string, vinculos: readonly Vinculo[], nota: string): RevisaoDeFrase => ({ classe: "dependencia_real", de, vinculos, nota })

const ROM: readonly Vinculo[] = ["romantico"]
const NEG: readonly Vinculo[] = ["trabalho"]
/** frases que se declaram fora do romance: não vão ao vínculo romântico, nem ao `outro`, que poderia ser um */
const NAO_ROM: readonly Vinculo[] = ["amizade", "familia", "trabalho"]

/** A chave é `<id da glosa>#<referência da frase>`. */
export const REVISAO_DE_APLICABILIDADE: Record<string, RevisaoDeFrase> = {
  // ── pares: trabalho e negócios como exemplo de uma dinâmica geral ─────────
  "sun-mars#favoravel.nucleos[5]": EX(
    "Em relações de trabalho, Marte pode fornecer o impulso para pôr em prática a grande estratégia concebida por quem tem o Sol.",
    "Marte pode fornecer o impulso para pôr em prática a grande estratégia concebida por quem tem o Sol.",
    "o trabalho ilustra a divisão entre conceber e executar",
  ),
  "sun-saturn#favoravel.nucleos[5]": EX(
    "O trabalho em parceria com a disciplina de Saturno pode dar a quem tem o Sol uma experiência muito valiosa.",
    "A parceria com a disciplina de Saturno pode dar a quem tem o Sol uma experiência muito valiosa.",
    "o trabalho em parceria é o exemplo; o núcleo é aprender com a disciplina de Saturno",
  ),
  "sun-uranus#adverso.elaboracao[1]": EX(
    "Se as duas pessoas encaram com naturalidade as diferenças de opinião e quem tem o Sol adota atitude indulgente diante das excentricidades de quem tem Urano, uma relação de trabalho satisfatória pode resultar.",
    "Se as duas pessoas encaram com naturalidade as diferenças de opinião e quem tem o Sol adota atitude indulgente diante das excentricidades de quem tem Urano, uma relação satisfatória pode resultar.",
    "o caminho de elaboração vale para a relação, e o trabalho era o exemplo",
  ),
  "moon-moon#favoravel.nucleos[0]": EX(
    "Entre as duas pessoas pode haver apreço solidário e trabalho em harmonia, com respostas compatíveis ao cotidiano.",
    "Entre as duas pessoas pode haver apreço solidário e cooperação em harmonia, com respostas compatíveis ao cotidiano.",
    "trabalhar em harmonia é cooperar; o núcleo é a harmonia no cotidiano",
  ),
  "moon-neptune#favoravel.nucleos[3]": EX(
    "O contato pode dar um forte laço de simpatia, nem sempre com envolvimento apaixonado, e aparece com frequência em amizades platônicas.",
    "O contato pode dar um forte laço de simpatia, nem sempre com envolvimento apaixonado.",
    "as amizades platônicas eram uma observação de frequência, não parte da dinâmica",
  ),
  "mercury-mars#favoravel.nucleos[4]": EX(
    "A combinação dos dois talentos pode levar a planejar e realizar com êxito operações de trabalho.",
    "A combinação dos dois talentos pode levar a planejar e realizar com êxito iniciativas em conjunto.",
    "o núcleo é planejar e executar juntos",
  ),
  "venus-mars#favoravel.nucleos[6]": EX(
    "O contato pode não indicar estímulo emocional ou físico pronunciado e, ainda assim, as duas pessoas podem trabalhar com fluidez na companhia uma da outra.",
    "O contato pode não indicar estímulo emocional ou físico pronunciado e, ainda assim, as duas pessoas podem colaborar com fluidez na companhia uma da outra.",
    "o núcleo é a fluidez sem estímulo pronunciado",
  ),
  "venus-mars#papeis.mars": EX(
    "é o desejo e tende a tomar a iniciativa na relação romântica, com impulso e iniciativa também no trabalho em conjunto",
    "é o desejo e tende a tomar a iniciativa na relação, com impulso e iniciativa também na atuação em conjunto",
    "romance e trabalho eram os dois cenários do mesmo papel",
  ),
  "venus-mars#papeis.venus": EX(
    "é o desejado e tende a convidar essa iniciativa e a responder com afeto, trazendo finesse e acabamento ao trabalho em conjunto",
    "é o desejado e tende a convidar essa iniciativa e a responder com afeto, trazendo finesse e acabamento à atuação em conjunto",
    "o trabalho em conjunto era o cenário",
  ),
  "venus-uranus#favoravel.nucleos[4]": EX(
    "O contato pode enriquecer a vida social de cada pessoa e suas atividades culturais e criativas, mesmo sem romance.",
    "O contato pode enriquecer a vida social de cada pessoa e suas atividades culturais e criativas.",
    "o 'mesmo sem romance' dizia que a dinâmica não depende do vínculo",
  ),
  "mars-mars#favoravel.nucleos[0]": EX(
    "As duas pessoas podem trabalhar juntas com harmonia.",
    "As duas pessoas podem colaborar com harmonia.",
    "trabalhar juntas é colaborar",
  ),
  "mars-jupiter#adverso.tensoesPossiveis[0]": EX(
    "Entre pessoas imaturas deixadas a terminar um trabalho sem supervisão, o tempo pode se perder em brincadeiras intensas e a tarefa ser negligenciada.",
    "Entre pessoas imaturas deixadas a terminar uma tarefa sem supervisão, o tempo pode se perder em brincadeiras intensas e a tarefa ser negligenciada.",
    "o cenário é uma tarefa sem supervisão, não a relação de trabalho",
  ),
  "mars-saturn#favoravel.nucleos[3]": EX(
    "Um arranjo de trabalho possível: quem tem Saturno traça os planos e quem tem Marte os executa.",
    "Um arranjo possível: quem tem Saturno traça os planos e quem tem Marte os executa.",
    "o núcleo é a divisão entre planejar e executar",
  ),
  "mars-uranus#adverso.nucleos[1]": EX(
    "Podem ocorrer brigas violentas ocasionais, que entre pessoas em relação íntima podem apenas interromper por um tempo a relação sexual.",
    "Podem ocorrer brigas violentas ocasionais.",
    "a relação íntima era uma consequência dita só para esse vínculo; o núcleo é a briga ocasional",
  ),
  "jupiter-jupiter#favoravel.nucleos[1]": EX(
    "Costuma haver reconhecimento comum dos fatores que mais servem ao vínculo, o que pode tornar o contato útil entre sócios.",
    "Costuma haver reconhecimento comum dos fatores que mais servem ao vínculo.",
    "'entre sócios' era um exemplo de utilidade",
  ),
  "saturn-saturn#adverso.nucleos[2]": EX(
    "Pode haver disputa por supremacia, cada pessoa achando que tem razão a seu modo e usando métodos tão diferentes que fica difícil achar base comum de trabalho.",
    "Pode haver disputa por supremacia, cada pessoa achando que tem razão a seu modo e usando métodos tão diferentes que fica difícil achar base comum.",
    "a base comum vale para qualquer vínculo",
  ),
  "uranus-pluto#favoravel.nucleos[3]": EX(
    "O contato pode ser muito útil quando as duas pessoas são ambiciosas e empreendedoras, em particular numa parceria de negócios.",
    "O contato pode ser muito útil quando as duas pessoas são ambiciosas e empreendedoras.",
    "o núcleo é a utilidade entre pessoas ambiciosas; os negócios eram o caso particular",
  ),
  "neptune-pluto#favoravel.nucleos[0]": EX(
    "Se as duas pessoas atuam em trabalho assistencial ou em atividades de natureza artística e agem com integridade madura, pode haver colaboração útil.",
    null,
    "o trabalho assistencial ou artístico é uma atividade comum às duas pessoas, e não o tipo de relação; sem ele a condição se perde",
  ),

  // ── pares: só fazem sentido no vínculo ───────────────────────────────────
  "sun-jupiter#favoravel.nucleos[5]": DEP("Em relações de negócios, os aspectos favoráveis podem tornar possível uma colaboração feliz e lucrativa.", NEG, "colaboração lucrativa em negócios"),
  "sun-jupiter#especificos[0].nucleos[0]": DEP("Na conjunção, com os dois corpos bem aspectados no nascimento, uma colaboração feliz e lucrativa em negócios é possível.", NEG, "colaboração lucrativa em negócios"),
  "sun-neptune#adverso.tensoesPossiveis[2]": DEP("Em colaboração de negócios, os esquemas muito imaginativos de quem tem Netuno para lances financeiros espetaculares podem exigir exame minucioso e provas práticas rigorosas antes da aprovação final.", NEG, "aprovação de esquemas financeiros"),
  "jupiter-uranus#favoravel.nucleos[2]": DEP("Em vínculo de negócios, quem tem Urano pode dar a originalidade criativa e quem tem Júpiter o capital para financiar invenções e ideias novas.", NEG, "capital e invenção num negócio"),
  "saturn-pluto#favoravel.nucleos[2]": DEP("Em vínculo de negócios, a combinação pode ajudar as pessoas a assentar o empreendimento em base firme.", NEG, "empreendimento"),
  "neptune-neptune#favoravel.nucleos[1]": DEP("No sextil, como na conjunção, a sintonia simpática pode favorecer a relação entre quem se dirige a um público e esse público ou os colegas de trabalho.", NEG, "público e colegas de trabalho"),
  "venus-mars#favoravel.nucleos[4]": DEP("Fora do romance, as duas pessoas podem trabalhar bem juntas: Marte dá iniciativa e impulso, Vênus dá finesse e acabamento.", NAO_ROM, "a frase se declara fora do romance"),
  "venus-mars#favoravel.nucleos[5]": DEP("Em relações sem ligação com o romance, quem tem Marte pode estimular à ação quem tem Vênus preguiçoso, e quem tem Vênus pode mostrar a quem tem Marte precipitado como agir com mais finesse.", NAO_ROM, "a frase se declara sem ligação com o romance"),
  "venus-mars#favoravel.nucleos[0]": DEP("O contato é o principal indicador de compatibilidade no nível físico e indica resposta pronta ao magnetismo físico um do outro.", ROM, "magnetismo físico"),
  "venus-mars#favoravel.nucleos[2]": DEP("Quem tem Vênus pode dar a resposta amorosa que quem tem Marte deseja e trazer à relação uma sensação de bem-estar harmonioso.", ROM, "resposta amorosa"),
  "mars-pluto#favoravel.nucleos[0]": DEP("Quem tem Marte pode fazer aflorar desejos físicos reprimidos de quem tem Plutão, o que pode despertar resposta em quem tem Marte.", ROM, "desejos físicos"),
  "sun@casa5#facilidades[4]": DEP("O vínculo favorece a amizade: quem tem o Sol pode trazer alegria e sentir prazer na resposta afetuosa da outra pessoa.", ["amizade", "romantico", "familia"], "diz que o vínculo favorece a amizade"),
  "venus-mars#favoravel.nucleos[1]": DEP("Quem tem Marte pode despertar a devoção apaixonada de quem tem Vênus, e muito afeto pode nascer de uma atração a princípio só física.", ROM, "devoção apaixonada e atração física"),
  "venus-uranus#favoravel.nucleos[0]": DEP("O contato representa a capacidade de êxtase e pode significar uma relação de forte estímulo sexual.", ROM, "estímulo sexual"),
  "venus-uranus#favoravel.nucleos[3]": DEP("Quem tem Urano pode se apaixonar perdidamente por quem tem Vênus, e as possibilidades românticas da combinação são consideráveis.", ROM, "paixão e romance"),
  "venus-uranus#favoravel.tensoesPossiveis[2]": DEP("As possibilidades românticas não indicam necessariamente uma relação duradoura, sobretudo se as duas pessoas não forem maduras o bastante ao se conhecerem.", ROM, "ressalva às possibilidades românticas"),
  "venus-pluto#favoravel.nucleos[1]": DEP("O contato pode aumentar a consciência sexual de uma pessoa em relação à outra.", ROM, "consciência sexual"),
  "venus-pluto#adverso.nucleos[0]": DEP("A consciência sexual pode ficar aumentada a ponto de constranger.", ROM, "consciência sexual"),
  "mars-mars#favoravel.nucleos[3]": DEP("O contato pode dar estímulo mútuo do desejo e atração intensa e apaixonada.", ROM, "desejo e atração apaixonada"),
  "mars-mars#especificos[0].nucleos[0]": DEP("Na conjunção, o estímulo mútuo do desejo pode ser especialmente forte e levar a atração intensa e apaixonada.", ROM, "desejo e atração apaixonada"),

  // ── overlays ─────────────────────────────────────────────────────────────
  "sun@casa3#facilidades[4]": EX(
    "Uma convivência livre e descontraída, como entre irmãos, é favorecida.",
    "Uma convivência livre e descontraída é favorecida.",
    "'como entre irmãos' era uma comparação",
  ),
  "sun@casa12#facilidades[3]": EX(
    "Quem recebe confidências com frequência, como clérigo ou médico, costuma ter o Sol na casa 12 de quem confia nessa pessoa, e pode estar preparado para servir quem passa por um momento difícil.",
    "Quem recebe confidências com frequência costuma ter o Sol na casa 12 de quem confia nessa pessoa, e pode estar preparado para servir quem passa por um momento difícil.",
    "clérigo e médico eram exemplos de quem recebe confidências",
  ),
  "jupiter@casa7#facilidades[1]": EX(
    "Quem tem Júpiter pode ter prazer especial em trabalhar junto com quem tem a casa.",
    "Quem tem Júpiter pode ter prazer especial em atuar junto com quem tem a casa.",
    "o núcleo é o prazer de atuar junto",
  ),
  "uranus@casa10#tensoes[2]": EX(
    "Quem tem a casa pode considerar que nunca trabalharia para quem tem Urano nem permitiria que essa pessoa dirigisse sua vida.",
    "Quem tem a casa pode considerar que nunca permitiria que quem tem Urano dirigisse sua vida.",
    "trabalhar para a pessoa era um exemplo de deixar-se dirigir",
  ),
  // o substantivo do tipo de vínculo sai quando a frase serve a outro vínculo; no vínculo dele, a frase fica como está
  "sun-pluto#favoravel.nucleos[3]": EX(
    "O reconhecimento de um vínculo em nível profundo pode favorecer a formação de uma amizade firme.",
    "O reconhecimento de um vínculo em nível profundo pode favorecer a formação de um laço firme.",
    "'amizade' é o tipo de vínculo; o núcleo é o reconhecimento profundo que favorece um laço firme. O 'duradoura' que o modelo acrescentou na bateria 1 não vem da fonte e é problema de geração, não deste texto",
    ["amizade"],
  ),
  "moon@casa4#funcaoIntroduzida": EX(
    "Quem tem a Lua pode fazer quem tem a casa se sentir em casa, por afinidade natural, e parte da família.",
    null,
    "'parte da família' descreve um sentimento de acolhimento, e não o vínculo de família",
  ),
  "sun@casa10#tensoes[2]": EX(
    "Quem tem o Sol tende a agir como figura parental, sentindo-se responsável pelo comportamento da outra pessoa.",
    null,
    "'figura parental' é um papel dito por metáfora, e não um vínculo de família; trocá-lo inventaria",
  ),
  "moon@casa10#facilidades[3]": EX(
    "Quem tem a Lua pode assumir uma atitude parental, empurrando suavemente rumo a um objetivo e protegendo a reputação de quem tem a casa de ataques.",
    null,
    "'atitude parental' é um papel por metáfora",
  ),
  "jupiter@casa4#facilidades[1]": EX(
    "Quem tem Júpiter pode assumir com naturalidade uma atitude parental diante de quem tem a casa.",
    null,
    "'atitude parental' é um papel por metáfora",
  ),
  "saturn@casa4#funcaoIntroduzida": EX(
    "Quem tem Saturno pode querer assumir diante de quem tem a casa uma responsabilidade de tipo parental.",
    null,
    "'de tipo parental' é um papel por metáfora",
  ),
  "saturn@casa10#tensoes[1]": EX(
    "Com Saturno muito aflito, quem tem Saturno pode assumir uma atitude de autoridade rígida e parental diante de quem tem a casa.",
    null,
    "'autoridade parental' é um papel por metáfora",
  ),

  "sun@casa6#tensoes[2]": DEP("Em uma relação de trabalho, quem tem o Sol pode esperar uma recompensa digna pelos serviços.", NEG, "recompensa por serviços"),
  "sun@casa10#facilidades[0]": DEP("Quem tem o Sol pode supervisionar o trabalho de quem tem a casa e estar em posição de indicá-la para um avanço.", NEG, "supervisão no trabalho"),
  "mars@casa1#facilidades[5]": DEP("A colaboração pode funcionar muito bem numa parceria de negócios.", NEG, "parceria de negócios"),
  "sun@casa8#tensoes[4]": DEP("Pode haver atração ou repulsa sexual, conforme as circunstâncias e os aspectos recebidos pelo Sol.", ROM, "atração sexual"),
  "venus@casa5#facilidades[2]": DEP("A posição pode indicar associação romântica quando a idade das duas pessoas é adequada.", ROM, "associação romântica"),
  "venus@casa8#facilidades[0]": DEP("Pode haver considerável atração sexual entre as duas pessoas.", ROM, "atração sexual"),
  "mars@casa2#facilidades[2]": DEP("Pode haver forte estímulo sexual entre as duas pessoas, e o desfecho depende dos aspectos entre os mapas.", ROM, "estímulo sexual"),
  "mars@casa5#facilidades[3]": DEP("Pode haver um vínculo apaixonado entre as duas pessoas.", ROM, "vínculo apaixonado"),
  "mars@casa8#facilidades[2]": DEP("Pode haver forte atração sexual entre as duas pessoas.", ROM, "atração sexual"),
  "jupiter@casa12#tensoes[1]": DEP("Havendo vínculo romântico entre as duas pessoas, pode haver risco de escândalo.", ROM, "vínculo romântico"),
  "uranus@casa5#facilidades[3]": DEP("O vínculo pode estimular um interesse romântico mútuo, mas por si só não implica permanência.", ROM, "interesse romântico"),
  "uranus@casa7#facilidades[2]": DEP("Num vínculo romântico, quem tem Urano pode exercer certo fascínio.", ROM, "vínculo romântico"),
  "neptune@casa5#facilidades[2]": DEP("Pode estimular sonhos de romance ou fantasias românticas compartilhadas.", ROM, "romance"),
  "neptune@casa5#facilidades[3]": DEP("Pode desafiar a viver à altura dos mais altos ideais românticos, lembrando que o amor pode pedir entrega e disposição ao sacrifício.", ROM, "ideais românticos"),
  "neptune@casa8#tensoes[5]": DEP("Se há relação sexual, o vínculo pode trazer problemas de desejo não satisfeito.", ROM, "relação sexual"),
  "jupiter@casa5#facilidades[5]": DEP("Pode haver uma amizade romântica, com muito afeto mútuo.", ["romantico", "amizade"], "amizade romântica: só entre vínculos de afeto"),
  "moon@casa10#facilidades[4]": DEP("Pode haver um vínculo doméstico entre as duas pessoas.", ["romantico", "familia"], "vínculo doméstico: convívio sob o mesmo teto"),
}

export type Aplicabilidade = { aplica: boolean; texto: string | null }

/**
 * O que o prompt faz com uma frase: se vai para este vínculo e com que texto.
 * Frase fora da revisão vale para qualquer vínculo, com o texto original.
 */
export function aplicabilidadeDaFrase(glosaId: string, ref: string, vinculo: Vinculo): Aplicabilidade {
  const r = REVISAO_DE_APLICABILIDADE[`${glosaId}#${ref}`]
  if (!r) return { aplica: true, texto: null }
  if (r.classe === "dependencia_real") return { aplica: r.vinculos.includes(vinculo), texto: null }
  if (r.mantemEm?.includes(vinculo)) return { aplica: true, texto: null }
  return { aplica: true, texto: r.texto }
}
