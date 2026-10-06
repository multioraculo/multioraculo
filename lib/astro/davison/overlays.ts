/**
 * GERADO por scripts/montar-glosas-davison.ts. Não edite à mão: refaça as fatias e monte de novo.
 *
 * Paráfrase estruturada do Davison (Synastry, 1977). O trecho literal do livro NÃO está
 * aqui: cada glosa guarda página, título e hash do trecho de onde saiu, e o literal vive
 * só na auditoria interna, fora do repositório.
 */
import type { GlosaDeOverlay } from "./tipos"

export const OVERLAYS_DAVISON: GlosaDeOverlay[] = [
 {
  "id": "sun@casa1",
  "planeta": "sun",
  "casa": 1,
  "funcaoIntroduzida": "Quem tem o Sol reflete a essência de si em sintonia com a forma como quem tem a casa se apresenta ao mundo.",
  "campoAtivado": "A forma como quem tem a casa se apresenta ao mundo e o senso de si das duas pessoas.",
  "facilidades": [
   "Quem tem a casa pode estimular quem tem o Sol a ser mais plenamente a sua essência.",
   "Quem tem a casa pode reconhecer o valor individual de quem tem o Sol e tê-lo em mais estima.",
   "Quem tem a casa pode reconhecer e admirar a capacidade de liderança de quem tem o Sol.",
   "Há possibilidade de muita atração mútua, com admiração de um lado e satisfação em recebê-la do outro.",
   "O calor e a afeição do Sol podem encorajar e dar mais confiança a quem tem a casa, oferecendo um exemplo a seguir.",
   "Um aspecto harmônico do Sol ao ângulo Ascendente, vindo de outro setor do mapa de quem tem a casa, pode sustentar um vínculo forte.",
   "Quem tem o Sol pode oferecer benevolência e encorajamento sem reservas, e o reconhecimento que espera em troca pode ser um preço pequeno."
  ],
  "tensoes": [
   "Quem tem a casa pode não aceitar passivamente a autoridade de quem tem o Sol, e uma disputa por supremacia pode surgir.",
   "Podem existir fortes contrastes, psicológicos e físicos.",
   "Quem tem o Sol pode tentar dominar a outra pessoa ou impressioná-la com pose e exibição de saber.",
   "A quincúncio pode indicar antipatia.",
   "Quem tem o Sol pode esperar reconhecimento pelo papel de patrono e mentor que exerce, em troca do apoio que oferece.",
   "Quem tem o Sol pode inspirar ou monopolizar a atenção, e o vínculo não é morno."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2"
    ],
    "justificativa": "Os núcleos tratam de ser a própria essência, de reconhecer o valor de cada um e a capacidade de liderança."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:3",
     "facilidades:4"
    ],
    "justificativa": "Atração mútua, admiração e afeição que encorajam sustentam esta dimensão."
   },
   {
    "categoria": "acao_desejo",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:2"
    ],
    "justificativa": "A disputa por supremacia e a tentativa de dominar tratam de conflito de poder entre as duas pessoas."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:6"
    ],
    "justificativa": "Trata de encorajamento e benevolência oferecidos livremente a quem tem a casa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando o Sol está aflito; essa condição natal não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "O efeito, de muito proveito ou o inverso, depende dos aspectos entre os mapas dirigidos ao Sol."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Em vínculos entre gerações, quem tem o Sol pode tentar moldar a outra pessoa à própria imagem."
   }
  ],
  "reforcoPorAngulo": "O efeito é mais marcado quando o Sol cai sobre o Ascendente de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Sun in the 1st House",
   "pdfPaginaInicio": 96,
   "pdfPaginaFim": 96,
   "hash": "f9d97a8e408ac831"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "papel_social",
    "motivo": "variação por tipo de relação (pai e filho); fica só uma nota neutra em condicionadoPor."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento de valor sobre o resultado; fica a dependência dos aspectos."
   },
   {
    "categoria": "previsao",
    "motivo": "afirmação categórica sobre o futuro do vínculo; fica 'não é morno' como possibilidade."
   }
  ]
 },
 {
  "id": "sun@casa2",
  "planeta": "sun",
  "casa": 2,
  "funcaoIntroduzida": "Quem tem o Sol projeta a essência de si sobre a forma como quem tem a casa acumula e maneja seus recursos.",
  "campoAtivado": "Recursos, economias e segurança material de quem tem a casa.",
  "facilidades": [
   "Quem tem o Sol pode trazer oportunidades para melhorar a situação financeira de quem tem a casa.",
   "Quem tem o Sol pode até oferecer o apoio financeiro para isso.",
   "Quem tem o Sol pode oferecer orientação e conhecimento prático para ampliar os recursos e alcançar alguma segurança financeira.",
   "Quem tem o Sol costuma ser um apoiador e defensor leal de quem tem a casa.",
   "Pode haver atração física considerável."
  ],
  "tensoes": [
   "Quem tem o Sol pode fazer uma reivindicação grande demais sobre os recursos de quem tem a casa.",
   "Quem tem o Sol pode esperar que quem tem a casa seja financeiramente autossuficiente e independente.",
   "Quem tem o Sol costuma esperar reconhecimento pela generosidade dos presentes e alguma retribuição.",
   "Quem tem o Sol pode exigir apreço pelos serviços que presta e esperar algo à altura de sua posição."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2",
     "tensoes:0",
     "tensoes:1"
    ],
    "justificativa": "Os núcleos tratam de dinheiro, apoio financeiro, ampliação de recursos e autossuficiência financeira."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2"
    ],
    "justificativa": "Fala de oportunidades e de ampliar os recursos, ou seja, de crescimento material."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "tensoes:2",
     "tensoes:3"
    ],
    "justificativa": "A expectativa de reconhecimento, apreço e posição trata do valor atribuído a quem tem o Sol."
   },
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "facilidades:3"
    ],
    "justificativa": "A lealdade e a defesa constante de quem tem a casa sustentam esta dimensão."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:4"
    ],
    "justificativa": "A atração física considerável é o conteúdo que sustenta esta dimensão."
   }
  ],
  "condicionadoPor": [],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Sun in the 2nd",
   "pdfPaginaInicio": 96,
   "pdfPaginaFim": 97,
   "hash": "afbe9851c200f596"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "papel_social",
    "motivo": "posição social: fica só a expectativa de retribuição à altura."
   }
  ]
 },
 {
  "id": "sun@casa3",
  "planeta": "sun",
  "casa": 3,
  "funcaoIntroduzida": "Quem tem o Sol projeta a essência de si sobre o modo como quem tem a casa se relaciona com o entorno e reúne informação prática.",
  "campoAtivado": "Comunicação, informação prática e relação com o ambiente próximo.",
  "facilidades": [
   "Quem tem a casa pode apreciar o estímulo mental recebido de quem tem o Sol.",
   "Quem tem o Sol costuma ouvir com atenção, encorajar a expor o ponto de vista e ajudar a desenvolver as ideias de modo amplo, dando-lhes mais sentido.",
   "Pode surgir uma companhia animada, sobretudo no plano mental.",
   "Quem tem o Sol pode aliviar problemas de deslocamento de quem tem a casa.",
   "Uma convivência livre e descontraída, como entre irmãos, é favorecida."
  ],
  "tensoes": [
   "No plano mental, quem tem o Sol pode esperar algum esforço de quem tem a casa na solução de seus problemas, oferecendo o conhecimento e deixando a prática com a outra pessoa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2"
    ],
    "justificativa": "Os núcleos tratam de estímulo mental, escuta, desenvolvimento de ideias e conversa entre as duas pessoas."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:3",
     "tensoes:0"
    ],
    "justificativa": "Falam de ajuda com deslocamentos e de transformar o saber prático em ação."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:2",
     "facilidades:4"
    ],
    "justificativa": "A companhia animada e a convivência descontraída tratam de proximidade entre as duas pessoas."
   }
  ],
  "condicionadoPor": [],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Sun in the 3rd",
   "pdfPaginaInicio": 97,
   "pdfPaginaFim": 97,
   "hash": "2703f30758865d05"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "genero",
    "motivo": "variação por sexo e estado civil; a convivência descontraída fica só como 'entre irmãos'."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel conjugal."
   }
  ]
 },
 {
  "id": "sun@casa4",
  "planeta": "sun",
  "casa": 4,
  "funcaoIntroduzida": "Quem tem o Sol tende a assumir uma posição de guia e liderança, que quem tem a casa aceita por instinto.",
  "campoAtivado": "Lar, raízes e o ambiente doméstico de quem tem a casa.",
  "facilidades": [
   "Quem tem o Sol pode ajudar quem tem a casa a se abrir e a desenvolver suas capacidades.",
   "O ambiente doméstico de quem tem a casa pode refletir facetas da personalidade de quem tem o Sol que a impressionam.",
   "O efeito pode ser sutil: quem tem a casa pode desejar, sem perceber, seguir o exemplo de quem tem o Sol.",
   "O vínculo pode ser importante, porque quem tem a casa fica sempre atento aos padrões de quem tem o Sol."
  ],
  "tensoes": [],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2"
    ],
    "justificativa": "O desenvolvimento de capacidades e o desejo de seguir um exemplo tratam de autoexpressão e referência pessoal."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "O ambiente doméstico moldado por facetas de quem tem o Sol trata do lar concreto."
   },
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "facilidades:3"
    ],
    "justificativa": "A importância do vínculo e a atenção constante aos padrões sustentam a permanência."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "O efeito sutil vale salvo quando há aspectos desfavoráveis entre os mapas envolvendo o Sol."
   },
   {
    "tipo": "idade_ou_contexto",
    "nota": "Esse vínculo tende a se formar muito cedo ou muito tarde na vida."
   }
  ],
  "reforcoPorAngulo": "O efeito é mais marcado quando o Sol cai sobre o Fundo do Céu (IC) de quem tem a casa.",
  "limitacoes": [
   "O livro não dá consequência tensa própria para esta leitura; só indica que aspectos desfavoráveis alteram o efeito sutil."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Sun in the 4th",
   "pdfPaginaInicio": 97,
   "pdfPaginaFim": 97,
   "hash": "03270b0ba827cff8"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel de pai ou mãe atribuído a quem tem o Sol; fica só a orientação e a liderança."
   }
  ]
 },
 {
  "id": "sun@casa5",
  "planeta": "sun",
  "casa": 5,
  "funcaoIntroduzida": "Quem tem o Sol estimula as atividades criativas de quem tem a casa, pelo exemplo ou apoiando seus projetos com entusiasmo.",
  "campoAtivado": "Atividades criativas, passatempos e prazer.",
  "facilidades": [
   "Quem tem o Sol pode inspirar quem tem a casa a seguir seu exemplo.",
   "Quem tem o Sol pode apoiar com entusiasmo os projetos de quem tem a casa e se interessar por seus passatempos.",
   "Quem tem o Sol costuma despertar uma resposta emocional calorosa, e quem tem a casa pode se sentir com o ânimo elevado.",
   "Quem tem a casa pode ser particularmente indulgente com as falhas no comportamento de quem tem o Sol.",
   "O vínculo favorece a amizade: quem tem o Sol pode trazer alegria e sentir prazer na resposta afetuosa da outra pessoa."
  ],
  "tensoes": [],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1"
    ],
    "justificativa": "O estímulo à criação e o apoio aos projetos tratam de autoexpressão de quem tem a casa."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:2",
     "facilidades:3",
     "facilidades:4"
    ],
    "justificativa": "A resposta emocional calorosa, a indulgência e o prazer na afeição tratam de carinho entre as duas pessoas."
   }
  ],
  "condicionadoPor": [],
  "reforcoPorAngulo": null,
  "limitacoes": [
   "O livro não dá consequência tensa para esta leitura; só há facilidades."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Sun in the 5th",
   "pdfPaginaInicio": 97,
   "pdfPaginaFim": 97,
   "hash": "f2ebc30fbc52932f"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   }
  ]
 },
 {
  "id": "sun@casa6",
  "planeta": "sun",
  "casa": 6,
  "funcaoIntroduzida": "Quem tem o Sol pode oferecer algum tipo de serviço a quem tem a casa.",
  "campoAtivado": "Serviço, trabalho cotidiano, eficiência e rotina.",
  "facilidades": [
   "Quem tem a casa pode contar com a ajuda de quem tem o Sol.",
   "O apoio sincero pode encorajar quem tem a casa a funcionar com a maior eficiência possível.",
   "Quem tem o Sol pode indicar caminhos para melhorar o sistema de trabalho de quem tem a casa e torná-lo mais confiável.",
   "O vínculo pode surgir da necessidade de as duas pessoas ganharem a vida no mesmo local."
  ],
  "tensoes": [
   "Quem tem o Sol pode pedir, de vez em quando, retribuição pela ajuda, pois tende a valorizar os serviços de quem tem a casa.",
   "O vínculo tende a ser passageiro, conforme a conveniência das duas pessoas.",
   "Em uma relação de trabalho, quem tem o Sol pode esperar uma recompensa digna pelos serviços.",
   "Pode haver pouco envolvimento emocional."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2",
     "facilidades:3",
     "tensoes:2"
    ],
    "justificativa": "Os núcleos tratam de ajuda concreta, eficiência, sistema de trabalho e ganhar a vida em conjunto."
   },
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "O caráter passageiro e dependente da conveniência trata da duração do vínculo."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "tensoes:3"
    ],
    "justificativa": "A falta de envolvimento emocional trata da ausência de intimidade."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:0"
    ],
    "justificativa": "O pedido de retribuição impõe uma contrapartida sobre a ajuda oferecida."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "tipo_de_relacao",
    "nota": "Em relações de serviço, como a de médico e paciente, a leitura é favorável a quem tem o Sol quando ele está bem aspectado no mapa natal e os aspectos entre os mapas não se chocam muito."
   },
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "Essa leitura favorável em relações de serviço depende de o Sol estar bem aspectado no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Sun in the 6th",
   "pdfPaginaInicio": 98,
   "pdfPaginaFim": 98,
   "hash": "bd8a30249c60b807"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "papel_social",
    "motivo": "variação por tipo de relação; fica uma nota neutra em condicionadoPor."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "'relocação' do Sol é técnica do livro; mantido só o pouco envolvimento emocional."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "atribuição de reticência sem núcleo operacional independente."
   }
  ]
 },
 {
  "id": "sun@casa7",
  "planeta": "sun",
  "casa": 7,
  "funcaoIntroduzida": "Quem tem o Sol pode ser a pessoa ideal para atuar em parceria com quem tem a casa.",
  "campoAtivado": "Parcerias, cooperação e rivalidade declarada entre as duas pessoas.",
  "facilidades": [
   "Quem tem o Sol pode ajudar a fortalecer os pontos fracos de quem tem a casa, que consegue reconhecer sem dificuldade.",
   "No ponto mais favorável, quem tem o Sol pode ser uma parceria desejável e um aliado valioso, ampliando o círculo e organizando amparo para quem tem a casa."
  ],
  "tensoes": [
   "Havendo aflições fortes, pode surgir rivalidade na relação.",
   "Quem tem o Sol pode ser tentado a explorar o conhecimento das áreas vulneráveis de quem tem a casa e a tirar seu equilíbrio por completo.",
   "Sob aflição, quem tem o Sol pode deixar a independência prevalecer sobre a cooperação e se tornar um oponente formidável."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "acao_desejo",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:1",
     "tensoes:2"
    ],
    "justificativa": "Rivalidade, exploração de vulnerabilidades e oposição formidável tratam de disputa e conflito entre as duas pessoas."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "A ampliação do círculo e a organização de amparo tratam de crescimento do alcance de quem tem a casa."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "Fortalecer pontos fracos trata do senso de si de quem tem a casa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando o Sol está muito aflito; essa condição natal não é calculada nesta versão."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Na relação de advogado e cliente, a leitura é favorável a quem tem o Sol quando ele está razoavelmente livre de aflição no mapa natal e no mapa de quem tem a casa."
   }
  ],
  "reforcoPorAngulo": "O efeito é mais marcado quando o Sol cai sobre o Descendente de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Sun in the 7th",
   "pdfPaginaInicio": 98,
   "pdfPaginaFim": 98,
   "hash": "b31952f78578f7c5"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": true,
    "aspectos": false
   },
   "tensoes[2]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho dirigido a quem tem a casa; não entra na camada descritiva."
   }
  ]
 },
 {
  "id": "sun@casa8",
  "planeta": "sun",
  "casa": 8,
  "funcaoIntroduzida": "Quem tem o Sol pode levar quem tem a casa a perceber, com desconforto, algo em si que só uma mudança profunda resolve.",
  "campoAtivado": "Mudança profunda, autoavaliação, recursos compartilhados e intensidade.",
  "facilidades": [
   "Por crítica construtiva, quem tem o Sol pode ajudar quem tem a casa a se avaliar com objetividade.",
   "Quem tem o Sol pode indicar um modo novo de enfrentar problemas, ajudando a acessar recursos antes desconhecidos.",
   "Quem tem o Sol pode fazer exigências que despertam uma resposta que quem tem a casa não sabia poder dar.",
   "O apreço de quem tem o Sol pode crescer na medida em que quem tem a casa tolera a crítica e se mantém por conta própria.",
   "Em aspecto favorável, quem tem o Sol pode dar ajuda financeira, orientação sobre compra e venda ou muito apoio moral.",
   "Havendo respeito mútuo, um vínculo duradouro pode se construir sobre essa posição."
  ],
  "tensoes": [
   "Com o Sol aflito ou em choque com planetas de quem tem a casa, pode surgir uma situação muito incômoda, conforme a autoestima e a autoproteção de quem tem a casa.",
   "A falta de autoestima ou de autoproteção pode atrair desaprovação ou formas mais desagradáveis de crítica.",
   "Quem tem o Sol tende a tomar a outra pessoa pela avaliação que faz de si mesma.",
   "Com o Sol muito aflito ou muitos aspectos difíceis entre os mapas, empréstimos e arranjos financeiros complicados podem trazer dificuldades.",
   "Pode haver atração ou repulsa sexual, conforme as circunstâncias e os aspectos recebidos pelo Sol."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2",
     "tensoes:0"
    ],
    "justificativa": "Os núcleos tratam de enfrentar problemas de modo novo, despertar respostas inéditas e mudança profunda."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:3",
     "tensoes:0",
     "tensoes:2"
    ],
    "justificativa": "Autoavaliação, autoestima e a avaliação que cada um faz de si tratam do senso de si."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "A desaprovação e as formas desagradáveis de crítica funcionam como freio sobre quem tem a casa."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:4",
     "tensoes:3"
    ],
    "justificativa": "Ajuda financeira, compra e venda e arranjos financeiros complicados tratam de dinheiro concreto."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "tensoes:4"
    ],
    "justificativa": "A atração ou repulsa sexual trata da intimidade entre as duas pessoas."
   },
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "facilidades:5"
    ],
    "justificativa": "O vínculo duradouro com respeito mútuo trata de permanência."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando o Sol está aflito no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também depende de aspectos difíceis entre os mapas dirigidos ao Sol."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [
   "Uma passagem do livro sobre aprendizados valiosos tirados dessas experiências ficou fora por estar ligada a uma dívida de tipo kármico, descartada."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Sun in the 8th",
   "pdfPaginaInicio": 98,
   "pdfPaginaFim": 99,
   "hash": "cfdc0a38b008efec"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": true,
    "aspectos": false
   },
   "tensoes[3]": {
    "natal": true,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "karma",
    "motivo": "dívida kármica; fora do repertório."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento de caráter; fica só a percepção de algo a transformar."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de cautela; fica só a possibilidade de dificuldade."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de casamento e divórcio; fora do repertório."
   },
   {
    "categoria": "fatalismo",
    "motivo": "'só pode' e o rótulo transcendente foram suavizados para 'mudança profunda'."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "lição moral ligada à passagem kármica, sem núcleo operacional independente."
   }
  ]
 },
 {
  "id": "sun@casa9",
  "planeta": "sun",
  "casa": 9,
  "funcaoIntroduzida": "Quem tem o Sol pode ser fonte de inspiração para a busca de quem tem a casa por uma filosofia de vida.",
  "campoAtivado": "Crenças, filosofia de vida, ensino, viagens e horizontes mais amplos.",
  "facilidades": [
   "Pela forma como orienta a vida por suas crenças, quem tem o Sol pode despertar o interesse de quem tem a casa por ensinamentos religiosos ou filosóficos.",
   "Quem tem o Sol pode atuar como mentor, em uma relação de mestre e discípulo (guru).",
   "Quem tem o Sol pode divulgar as realizações de quem tem a casa e ajudar a torná-las conhecidas por um público maior.",
   "O vínculo pode nascer de uma viagem.",
   "Quem tem o Sol pode melhorar os planos de viagem, oferecer transporte e pôr quem tem a casa em contato com países estrangeiros, ampliando seus horizontes."
  ],
  "tensoes": [
   "Quem tem o Sol espera que a outra pessoa se esforce para entender suas ideias, sobretudo o espírito dessas ideias.",
   "Com aspectos difíceis vindos do mapa de quem tem a casa, podem ocorrer mal-entendidos.",
   "Podem existir diferenças fundamentais de opinião: quem tem o Sol sustenta firmemente suas ideias e tende a provocar uma resposta animada."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "tensoes:0",
     "tensoes:1",
     "tensoes:2"
    ],
    "justificativa": "Os núcleos tratam de transmitir ideias, entender, mal-entendido e diferença de opinião entre as duas pessoas."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:4",
     "facilidades:2"
    ],
    "justificativa": "Ampliação de horizontes, contato com outros países e um público maior tratam de ampliação."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "Divulgar as realizações reconhece o valor de quem tem a casa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "Os mal-entendidos dependem de aspectos difíceis entre os mapas dirigidos ao Sol."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Sun in the 9th",
   "pdfPaginaInicio": 99,
   "pdfPaginaFim": 99,
   "hash": "6e61c80034a53f17"
  },
  "condicoesPorItem": {
   "tensoes[1]": {
    "natal": false,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de esforço mútuo; fica o mal-entendido como possibilidade."
   }
  ]
 },
 {
  "id": "sun@casa10",
  "planeta": "sun",
  "casa": 10,
  "funcaoIntroduzida": "Quem tem o Sol pode estar em posição de elevar a reputação de quem tem a casa.",
  "campoAtivado": "Reputação, carreira e posição pública de quem tem a casa.",
  "facilidades": [
   "Quem tem o Sol pode supervisionar o trabalho de quem tem a casa e estar em posição de indicá-la para um avanço.",
   "Quem tem o Sol pode inspirar pelo exemplo e estender seu patrocínio.",
   "Quem tem o Sol pode abrir contatos influentes que ajudam o avanço de quem tem a casa e facilitam seu caminho.",
   "Quem tem o Sol pode apontar uma fraqueza que atrapalha o avanço e dar orientação prática para superá-la."
  ],
  "tensoes": [
   "Quem tem o Sol pode impedir o progresso de quem tem a casa.",
   "Quem tem o Sol pode sentir necessidade do apoio ou do reconhecimento de suas capacidades para elevar a própria autoestima.",
   "Quem tem o Sol tende a agir como figura parental, sentindo-se responsável pelo comportamento da outra pessoa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2",
     "tensoes:0"
    ],
    "justificativa": "Supervisão do trabalho, avanço profissional e contatos de carreira tratam de trabalho concreto."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:1",
     "tensoes:1"
    ],
    "justificativa": "Inspirar pelo exemplo e precisar de reconhecimento tratam de autoestima e reconhecimento."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:2"
    ],
    "justificativa": "Impedir o progresso e assumir a responsabilidade pelo comportamento da outra pessoa funcionam como controle."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:2",
     "facilidades:3"
    ],
    "justificativa": "Contatos que facilitam o caminho e a superação de uma fraqueza tratam de crescimento."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "O patrocínio de quem tem o Sol depende de os aspectos entre os mapas serem favoráveis."
   }
  ],
  "reforcoPorAngulo": "O efeito é mais marcado quando o Sol cai sobre o Meio do Céu de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Sun in the 10th",
   "pdfPaginaInicio": 99,
   "pdfPaginaFim": 100,
   "hash": "19e940ebba4a20b4"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho a quem tem a casa e atribuição de falha; fica só a possibilidade de apontar uma fraqueza."
   }
  ]
 },
 {
  "id": "sun@casa11",
  "planeta": "sun",
  "casa": 11,
  "funcaoIntroduzida": "Quem tem o Sol pode inspirar quem tem a casa a formular com mais clareza os próprios ideais.",
  "campoAtivado": "Amizade, grupos e ideais.",
  "facilidades": [
   "Em alguns casos, quem tem o Sol pode ajudar a realizar esses ideais.",
   "Com aspectos favoráveis entre os mapas, uma amizade recompensadora pode surgir, com quem tem a casa atraída por quem tem o Sol.",
   "Quem tem o Sol pode ocupar uma posição de liderança em um grupo a que quem tem a casa pertence.",
   "Quem tem o Sol pode se sentir à vontade, como amigo, para dar uma palavra sobre a condução dos assuntos de quem tem a casa.",
   "A crítica amistosa pode ser valiosa, porque quem tem o Sol costuma aceitar a outra pessoa exatamente como é."
  ],
  "tensoes": [],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "Ajudar a realizar ideais trata de ampliar o que a outra pessoa almeja."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:4"
    ],
    "justificativa": "A amizade recompensadora e a aceitação plena tratam de afeição entre as duas pessoas."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "facilidades:3",
     "facilidades:4"
    ],
    "justificativa": "A palavra de crítica amistosa sobre a conduta dos assuntos funciona como freio dado entre amigos."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "A posição de liderança no grupo trata de reconhecimento e liderança."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A amizade recompensadora depende de os aspectos entre os mapas serem favoráveis."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [
   "O livro não dá consequência tensa para esta leitura; só há facilidades."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Sun in the 11th",
   "pdfPaginaInicio": 100,
   "pdfPaginaFim": 100,
   "hash": "b131df22e4ea9525"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   }
  ]
 },
 {
  "id": "sun@casa12",
  "planeta": "sun",
  "casa": 12,
  "funcaoIntroduzida": "Quem tem o Sol pode encorajar quem tem a casa a desenvolver uma grande variedade de interesses.",
  "campoAtivado": "Segredos, confidências, bastidores e o que fica oculto na relação.",
  "facilidades": [
   "Quem tem o Sol pode trazer a quem tem a casa uma perspectiva nova e total da vida.",
   "Quem tem o Sol pode ser um apoio discreto, agindo nos bastidores e organizando amparo vindo de fontes inesperadas.",
   "Quem tem o Sol pode intuir segredos bem guardados, e quem tem a casa pode senti-lo instintivamente como alguém de confiança para confidências.",
   "Quem recebe confidências com frequência, como clérigo ou médico, costuma ter o Sol na casa 12 de quem confia nessa pessoa, e pode estar preparado para servir quem passa por um momento difícil.",
   "Quem tem a casa pode aprender analisando os erros de quem tem o Sol."
  ],
  "tensoes": [
   "Com a maioria dos aspectos desfavoráveis, quem tem o Sol pode ser fonte de confusão para quem tem a casa.",
   "Quem tem o Sol pode encorajar um curso de ação contrário ao bem físico ou moral de quem tem a casa e, talvez, aos interesses da comunidade.",
   "Quem tem o Sol pode frustrar os planos de quem tem a casa, tramar contra quem tem a casa e minar sua posição aos poucos, explorando seu ponto fraco em proveito próprio.",
   "Com aspectos difíceis, podem surgir mal-entendidos por correntes subterrâneas difíceis de localizar, ou uma hostilidade oculta que corrói a relação.",
   "Pode ser difícil para quem tem a casa tratar a relação com objetividade."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "Variedade de interesses e perspectiva nova da vida tratam de ampliação."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "Agir nos bastidores e organizar amparo tratam de apoio concreto."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "Intuir segredos e confiar confidências tratam de confiança íntima."
   },
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "tensoes:3"
    ],
    "justificativa": "Mal-entendidos por correntes subterrâneas tratam de comunicação confusa."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:2"
    ],
    "justificativa": "Frustrar planos e minar a posição funcionam como freio sobre quem tem a casa."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "tensoes:0",
     "facilidades:0"
    ],
    "justificativa": "Confusão e uma perspectiva nova e total da vida tratam de reavaliação profunda."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "O efeito depende da condição natal do Sol; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma favorável ou tensa depende da maioria dos aspectos entre os mapas dirigidos ao Sol."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Sun in the 12th",
   "pdfPaginaInicio": 100,
   "pdfPaginaFim": 100,
   "hash": "0483350a97ce9830"
  },
  "condicoesPorItem": {
   "tensoes[3]": {
    "natal": false,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "destino",
    "motivo": "crença providencial e fatalista; fora do repertório."
   },
   {
    "categoria": "diagnostico",
    "motivo": "atribuição de desajustes psicológicos; fica só a dificuldade de objetividade."
   },
   {
    "categoria": "fatalismo",
    "motivo": "frase de valor sem núcleo operacional."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo de ofício; mantido só como ilustração de quem recebe confidências."
   }
  ]
 },
 {
  "id": "moon@casa1",
  "planeta": "moon",
  "casa": 1,
  "funcaoIntroduzida": "Quem tem a Lua projeta sobre quem tem a casa o impulso lunar de proteger e cuidar.",
  "campoAtivado": "O comportamento familiar e a abordagem cotidiana da vida de quem tem a casa.",
  "facilidades": [
   "Cada pessoa pode sentir que é agradável estar na companhia da outra.",
   "Quem tem a Lua pode se sentir em casa com o comportamento familiar de quem tem a casa, reconhecendo por instinto traços que correspondem ao seu temperamento.",
   "Quem tem a casa pode apreciar a resposta solidária que desperta em quem tem a Lua.",
   "A sensibilidade lunar pode permitir a quem tem a Lua entender a psicologia de quem tem a casa e saber como despertar seu interesse e uma resposta solidária.",
   "Quem tem a casa pode plantar a semente de uma ideia que, com o tempo, vira um projeto valioso para benefício mútuo.",
   "Pode haver atração física marcada.",
   "Quem tem a Lua pode encontrar, de forma tangível na presença de quem tem a casa, aquilo de que sente necessidade por instinto.",
   "Quem tem a casa costuma se dispor a fazer os ajustes necessários para tornar a relação ainda mais agradável.",
   "O contato costuma resultar numa relação agradável, salvo quando a Lua está muito aflita.",
   "A cordialidade de quem tem a casa pode nascer do reconhecimento instintivo do apreço solidário de quem tem a Lua, e despertar nessa pessoa ainda mais interesse, cuidado e impulso de se abrir."
  ],
  "tensoes": [
   "Se quem tem a casa não aceitar o cuidado como gesto de interesse amistoso, quem tem a Lua pode reagir ficando de humor instável e retraído.",
   "Quem tem a Lua pode se preocupar demais com os problemas de quem tem a casa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:3",
     "tensoes:0",
     "facilidades:6",
     "facilidades:9"
    ],
    "justificativa": "Sentir-se em casa, a sensibilidade lunar e o humor instável tratam de sentimento e resposta emocional."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2",
     "facilidades:5",
     "tensoes:1",
     "facilidades:9"
    ],
    "justificativa": "A companhia agradável, a atração física e a preocupação com o outro tratam de afeição e intimidade."
   },
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:4"
    ],
    "justificativa": "A semente de uma ideia que vira projeto trata de troca de ideias entre as duas pessoas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma favorável vale salvo quando a Lua está muito aflita; essa condição natal não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma favorável vale salvo quando a Lua faz aspecto adverso ao Ascendente, vindo de outro setor do mapa de quem tem a casa; aspectos de tensão entre os mapas alteram a resposta."
   }
  ],
  "reforcoPorAngulo": "O efeito é mais marcado quando a Lua cai sobre o Ascendente de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Moon in the 1st House",
   "pdfPaginaInicio": 101,
   "pdfPaginaFim": 101,
   "hash": "efda6b262bea8833"
  },
  "condicoesPorItem": {
   "facilidades[8]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "finalidade atribuída ao vínculo, em tom de conselho; não entra na camada descritiva."
   },
   {
    "categoria": "previsao",
    "motivo": "frequência entre casais; previsão de casamento fora do repertório."
   },
   {
    "categoria": "diagnostico",
    "motivo": "termo clínico ou de saúde sobre as respostas; fica só a tensão como possibilidade."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "ressalva sobre sexos e idade."
   }
  ]
 },
 {
  "id": "moon@casa2",
  "planeta": "moon",
  "casa": 2,
  "funcaoIntroduzida": "Quem tem a Lua pode reconhecer em quem tem a casa uma presença estabilizadora e se interessar em ajudar quem tem a casa a fazer render seus recursos.",
  "campoAtivado": "Recursos, economias e bem-estar material de quem tem a casa.",
  "facilidades": [
   "Quem tem a Lua pode ter um jeito instintivo de orientar sobre onde investir economias e como multiplicar e conservar os recursos.",
   "Quem tem a Lua pode contribuir de outras formas com o bem-estar de quem tem a casa, demonstrando interesse com presentes e generosidade.",
   "Quem tem a Lua pode sentir prazer em presentear.",
   "Os sentimentos de quem tem a Lua costumam estar muito envolvidos nos serviços que presta."
  ],
  "tensoes": [
   "Com aspectos adversos à Lua, quem tem a Lua pode se preocupar demais com os problemas financeiros de quem tem a casa e atrapalhar mais do que ajudar.",
   "Quem tem a Lua pode tolher a liberdade de quem tem a casa e até insinuar, talvez sem justiça, que o apreço pela sua ajuda é insuficiente."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:0"
    ],
    "justificativa": "Investir economias, multiplicar recursos e problemas financeiros tratam de dinheiro concreto."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1"
    ],
    "justificativa": "Multiplicar recursos e a generosidade em presentes tratam de ampliação e generosidade."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:3",
     "tensoes:0"
    ],
    "justificativa": "Os sentimentos envolvidos nos serviços e a preocupação excessiva tratam de sentimento."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "O prazer em presentear trata de carinho dirigido à outra pessoa."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "Tolher a liberdade e cobrar apreço funcionam como restrição."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa vale com aspectos adversos envolvendo a Lua."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Moon in the 2nd",
   "pdfPaginaInicio": 101,
   "pdfPaginaFim": 102,
   "hash": "bd390c27ccb80797"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": false,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "finalidade atribuída ao vínculo, em tom de conselho; não entra na camada descritiva."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "exaltação da Lua é dignidade natal que o motor não calcula."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho dirigido a quem tem a casa; fora do repertório."
   }
  ]
 },
 {
  "id": "moon@casa3",
  "planeta": "moon",
  "casa": 3,
  "funcaoIntroduzida": "Quem tem a Lua pode se fascinar com o funcionamento mental de quem tem a casa e com o modo como enfrenta seus problemas mentais.",
  "campoAtivado": "Ideias, comunicação, informação e viagens curtas.",
  "facilidades": [
   "Quando os aspectos entre os mapas ajudam, pode se estabelecer uma afinidade mental útil.",
   "Quem tem a Lua pode semear na mente de quem tem a casa uma ideia nova que floresce com o tempo, e ajudar a achar fontes de informação úteis.",
   "Quem tem a Lua pode funcionar como espelho, apontando falhas no raciocínio e ajudando quem tem a casa a se comunicar com mais eficácia.",
   "A memória de quem tem a Lua pode ajudar a acrescentar fatos úteis ao repertório de quem tem a casa.",
   "Quem tem a Lua pode motivar viagens curtas periódicas de quem tem a casa."
  ],
  "tensoes": [
   "As ideias de quem tem a casa podem estimular as reações mentais de quem tem a Lua, com resultados favoráveis ou instáveis.",
   "Quando falta harmonia entre os mapas, um fator emocional pode intrometer-se e impedir a compreensão exata das ideias que cada um quer comunicar.",
   "Com a Lua aflita e aspectos desfavoráveis, quem tem a Lua pode pôr a outra pessoa numa pista falsa de pensamento ou ter pouca simpatia por suas ideias.",
   "Quem tem a Lua pode absorver as ideias de quem tem a casa e depois repeti-las como suas."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2",
     "tensoes:0",
     "tensoes:1",
     "tensoes:2",
     "tensoes:3"
    ],
    "justificativa": "Os núcleos tratam de ideias, compreensão, afinidade mental e mal-entendido entre as duas pessoas."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "O fator emocional que atrapalha a compreensão trata de sentimento que interfere."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:3",
     "facilidades:4"
    ],
    "justificativa": "Acrescentar fatos úteis e motivar viagens curtas tratam de informação e deslocamento do dia a dia."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa se acentua com a Lua aflita no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "Se o resultado é favorável ou instável depende dos aspectos entre os mapas envolvendo a Lua."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Com a Lua bem aspectada, a posição favorece a Lua de quem é vizinho ou parente próximo; entre quem ensina e quem aprende, favorece a Lua de quem ensina na casa de quem aprende."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Moon in the 3rd",
   "pdfPaginaInicio": 102,
   "pdfPaginaFim": 102,
   "hash": "645af0bc0f9cb041"
  },
  "condicoesPorItem": {
   "tensoes[2]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "finalidade atribuída ao vínculo, em tom de conselho; não entra na camada descritiva."
   },
   {
    "categoria": "papel_social",
    "motivo": "variação por tipo de relação; fica uma nota neutra em condicionadoPor."
   }
  ]
 },
 {
  "id": "moon@casa4",
  "planeta": "moon",
  "casa": 4,
  "funcaoIntroduzida": "Quem tem a Lua pode fazer quem tem a casa se sentir em casa, por afinidade natural, e parte da família.",
  "campoAtivado": "Lar, ambiente doméstico, família e raízes de quem tem a casa.",
  "facilidades": [
   "Quem tem a Lua pode antecipar as reações instintivas de quem tem a casa diante de uma situação.",
   "Quem tem a Lua pode dar ideias que facilitam as tarefas domésticas, como decoração, cozinha e mudanças úteis no ambiente doméstico.",
   "Quem tem a Lua pode assumir uma atitude de cuidado e proteção, saindo do caminho para proteger quem tem a casa."
  ],
  "tensoes": [
   "A atitude protetora pode chegar a parecer monopolizar quem tem a casa.",
   "Quem tem a Lua nem sempre estabiliza, e uma Lua aflita pode precipitar mudanças periódicas de residência ou reviravoltas domésticas.",
   "Quem tem a casa pode ter dificuldade de acumular patrimônio, pois quem tem a Lua pode evitar compromissos nessa direção, o que dá sensação de estar preso."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2"
    ],
    "justificativa": "Antecipar reações instintivas e cuidar tratam de instinto, sensibilidade e segurança afetiva."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:1",
     "tensoes:1",
     "tensoes:2"
    ],
    "justificativa": "Tarefas domésticas, mudanças de residência e acumular patrimônio tratam da casa concreta."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:2"
    ],
    "justificativa": "Monopolizar e a sensação de estar preso tratam de restrição."
   },
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "tensoes:1",
     "tensoes:2"
    ],
    "justificativa": "Estabilidade doméstica e compromissos de patrimônio tratam de permanência."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "O efeito depende do signo ocupado pela Lua; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "O efeito também depende dos aspectos recebidos pela Lua."
   }
  ],
  "reforcoPorAngulo": "O efeito é mais marcado quando a Lua cai sobre o Fundo do Céu de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Moon in the 4th",
   "pdfPaginaInicio": 102,
   "pdfPaginaFim": 103,
   "hash": "ffd44739da8af20f"
  },
  "condicoesPorItem": {
   "tensoes[1]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "finalidade atribuída ao vínculo, em tom de conselho; não entra na camada descritiva."
   },
   {
    "categoria": "previsao",
    "motivo": "frequência entre casais e parentes por casamento; fora do repertório."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel materno; fica só o cuidado e a proteção."
   }
  ]
 },
 {
  "id": "moon@casa5",
  "planeta": "moon",
  "casa": 5,
  "funcaoIntroduzida": "Quem tem a Lua pode sentir atração pelo modo como quem tem a casa usa seus talentos, se projeta e encara a criação e o prazer.",
  "campoAtivado": "Criação, talento, autoexpressão e atividades prazerosas.",
  "facilidades": [
   "Pode haver envolvimento emocional e demonstração de afeto.",
   "Quem tem a Lua tende a ser uma plateia que aprecia, encorajando quem tem a casa a mostrar seus talentos e gostando de seu senso de humor.",
   "Quem tem a Lua pode apelar ao senso de dramático de quem tem a casa e ajudar em sua autodramatização.",
   "O vínculo costuma indicar uma associação feliz."
  ],
  "tensoes": [],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:3"
    ],
    "justificativa": "Envolvimento emocional, afeto e uma associação feliz tratam de afeição entre as duas pessoas."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2"
    ],
    "justificativa": "Mostrar talentos e dramatizar a si mesmo tratam de autoexpressão."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "O envolvimento emocional trata de sentimento."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma favorável vale salvo quando a Lua está muito aflita; essa condição natal não é calculada nesta versão."
   },
   {
    "tipo": "idade_ou_contexto",
    "nota": "Com grande diferença de idade, a pessoa mais velha pode tender a assumir uma atitude parental, seja quem tem a casa, seja quem tem a Lua."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [
   "O livro não dá consequência tensa própria para esta leitura; só diz que a Lua muito aflita altera a leitura favorável."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Moon in the 5th",
   "pdfPaginaInicio": 103,
   "pdfPaginaFim": 103,
   "hash": "5862610227b361c9"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "finalidade atribuída ao vínculo, em tom de conselho; não entra na camada descritiva."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel parental por idade; fica só uma nota em condicionadoPor."
   }
  ]
 },
 {
  "id": "moon@casa6",
  "planeta": "moon",
  "casa": 6,
  "funcaoIntroduzida": "Quem tem a Lua pode ter uma percepção instintiva das áreas em que quem tem a casa tem necessidade de apoio.",
  "campoAtivado": "Serviço, rotina, eficiência e bem-estar físico.",
  "facilidades": [
   "Quem tem a Lua pode prestar ajuda prática com prazer.",
   "Quem tem a Lua pode dar indicações que melhoram a eficiência geral e, muitas vezes, o bem-estar físico de quem tem a casa.",
   "Quem tem a Lua pode ajudar com tarefas incômodas.",
   "Quem tem a Lua pode ver a outra pessoa como alguém a quem prestar serviço, mostrando a si mesmo que é capaz de atenção solidária.",
   "O vínculo pode ser muito calmante."
  ],
  "tensoes": [
   "Quem tem a Lua pode se agitar e se preocupar demais, e ser mais obstáculo do que ajuda, uma fonte de irritação.",
   "A preocupação excessiva com o bem-estar físico pode abater o ânimo de quem tem a casa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2"
    ],
    "justificativa": "Ajuda prática, eficiência e tarefas incômodas tratam de organização concreta e serviço."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:3",
     "facilidades:4",
     "tensoes:0"
    ],
    "justificativa": "Atenção solidária, vínculo calmante e irritação tratam de sentimento e sensibilidade."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "A preocupação que abate o ânimo funciona como contenção."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando a Lua está aflita no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também vale com aspectos difíceis entre os mapas, e o vínculo calmante com aspectos favoráveis."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Na relação de médico e paciente, quem tem a Lua na casa 6 pode se interessar pelo bem-estar da outra pessoa além do dever."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Moon in the 6th",
   "pdfPaginaInicio": 103,
   "pdfPaginaFim": 103,
   "hash": "39c5aa3ef40c8e75"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "finalidade atribuída ao vínculo, em tom de conselho; não entra na camada descritiva."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho dirigido a quem tem a casa; fica só a possibilidade de abater o ânimo."
   },
   {
    "categoria": "papel_social",
    "motivo": "variação por tipo de relação; fica uma nota neutra em condicionadoPor."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "rótulo de julgamento; fica o serviço como demonstração de atenção."
   }
  ]
 },
 {
  "id": "moon@casa7",
  "planeta": "moon",
  "casa": 7,
  "funcaoIntroduzida": "Quem tem a Lua pode saber por instinto como complementar e equilibrar as facetas mais importantes da personalidade de quem tem a casa.",
  "campoAtivado": "Parcerias, relações entre iguais, círculo de amizades e reputação pública.",
  "facilidades": [
   "Quem tem a Lua pode ampliar o círculo de amizades de quem tem a casa, aproximando de pessoas úteis e divulgando sua reputação.",
   "Pela ligação da Lua com a publicidade, a casa 7 é um local favorável à Lua de quem atua com divulgação.",
   "As duas pessoas podem compartilhar vários interesses.",
   "Em negociações pessoais delicadas, quem tem a Lua pode atuar como mediação sensível.",
   "Com a Lua bem aspectada e a maioria dos aspectos favoráveis, a relação pode ser muito feliz, e quem tem a casa pode reconhecer em quem tem a Lua alguém com quem cooperar com prazer."
  ],
  "tensoes": [
   "Quem tem a Lua tende a tratar a outra pessoa como igual e a esperar o reconhecimento de seu status de igual, sem gostar de condescendência.",
   "Com a Lua muito aflita, quem tem a Lua pode ficar particularmente sensível quanto aos seus direitos."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "Ampliar o círculo de amizades trata de crescimento do alcance social."
   },
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:3"
    ],
    "justificativa": "A mediação sensível em negociações pessoais trata de troca e compreensão entre as pessoas."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:1",
     "facilidades:0"
    ],
    "justificativa": "O reconhecimento como igual, os direitos e a reputação tratam de identidade e reconhecimento."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:2",
     "facilidades:4"
    ],
    "justificativa": "Interesses compartilhados e uma associação feliz tratam de afeição e proximidade."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "A sensibilidade sobre direitos sob aflição trata de sensibilidade emocional."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando a Lua está muito aflita; essa condição natal não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma favorável depende de a maioria dos aspectos entre os mapas ser favorável."
   }
  ],
  "reforcoPorAngulo": "O efeito é mais marcado quando a Lua cai sobre o Descendente de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Moon in the 7th",
   "pdfPaginaInicio": 104,
   "pdfPaginaFim": 104,
   "hash": "115569d34c3a96bf"
  },
  "condicoesPorItem": {
   "tensoes[1]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "finalidade atribuída ao vínculo, em tom de conselho; não entra na camada descritiva."
   },
   {
    "categoria": "previsao",
    "motivo": "frequência entre casais; fora do repertório."
   },
   {
    "categoria": "papel_social",
    "motivo": "variação por ofício; fica só a ligação da Lua com a divulgação."
   }
  ]
 },
 {
  "id": "moon@casa8",
  "planeta": "moon",
  "casa": 8,
  "funcaoIntroduzida": "Quem tem a Lua pode envolver fortemente os próprios sentimentos em uma relação do tipo tudo ou nada com quem tem a casa.",
  "campoAtivado": "Intensidade emocional, dinheiro e heranças.",
  "facilidades": [
   "A relação raramente é morna.",
   "Quem tem a casa pode aproveitar as experiências de quem tem a Lua e tornar essa pessoa mais ciente dos acontecimentos dramáticos que lhe ensinaram lições valiosas.",
   "Com a Lua bem aspectada, quem tem a Lua pode ajudar a outra pessoa a alcançar uma fonte oculta de percepção e a aprofundar o conhecimento de si."
  ],
  "tensoes": [
   "Os sentimentos de quem tem a casa podem ser ardentes, exigindo bastante autocontrole emocional, ou quase inexistentes.",
   "Uma simpatia ou antipatia forte pode atuar como impulso subconsciente cujos apelos não podem ser negados.",
   "Com a imaginação solta, quem tem a Lua pode se deter nas possibilidades terríveis de uma situação, em vez de relatar o que de fato aconteceu.",
   "Com a Lua mal aspectada, quem tem a casa pode ter pouca inclinação a entrar na relação.",
   "Podem surgir disputas por dinheiro e heranças, e quem tem a Lua pode desconfiar dos motivos da outra pessoa, às vezes sem justiça."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:0",
     "tensoes:0",
     "tensoes:1"
    ],
    "justificativa": "Sentimentos ardentes ou ausentes e impulso subconsciente tratam de sentimento e instinto."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2",
     "tensoes:2"
    ],
    "justificativa": "Lições de acontecimentos dramáticos, fonte oculta de percepção e dramatização tratam de intensidade e revelação."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "tensoes:3"
    ],
    "justificativa": "A pouca inclinação a entrar na relação trata de afeição."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "tensoes:4"
    ],
    "justificativa": "Disputas por dinheiro e heranças tratam de recursos."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "O efeito depende da condição natal da Lua; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "O efeito depende dos aspectos entre os mapas dirigidos à Lua."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Moon in the 8th",
   "pdfPaginaInicio": 104,
   "pdfPaginaFim": 104,
   "hash": "533f0dd2b25e57b1"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "finalidade atribuída ao vínculo, em tom de conselho; não entra na camada descritiva."
   },
   {
    "categoria": "karma",
    "motivo": "explicação por vida passada; fora do repertório."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho dirigido a quem tem a casa; fica só a possibilidade de disputas."
   },
   {
    "categoria": "fatalismo",
    "motivo": "mantido como 'não podem ser negados' só como descrição do impulso."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel de gênero; fica 'quem tem a Lua'."
   }
  ]
 },
 {
  "id": "moon@casa9",
  "planeta": "moon",
  "casa": 9,
  "funcaoIntroduzida": "Quem tem a Lua quer entender por que quem tem a casa acredita e age do modo como acredita e age.",
  "campoAtivado": "Crenças, filosofia de vida, viagens e experiência de outros países.",
  "facilidades": [
   "Quem tem a Lua pode sentir atração por quem tem a casa por crer que entende sua filosofia de vida, e completá-la com a própria experiência.",
   "O acordo em princípios amplos pode ser superficial, mas a compreensão mútua tem chance de crescer, pois quem tem a Lua quer fomentar a relação.",
   "Quem tem a Lua pode despertar o gosto por viajar e mostrar como ampliar a experiência com outros países.",
   "O vínculo ocorre às vezes entre companhias de viagem, que trocam ideias e dão interesse a uma viagem comum."
  ],
  "tensoes": [
   "Com a Lua muito aflita, pode haver falta total de simpatia pela filosofia de vida ou pela formação espiritual de cada um."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:3",
     "tensoes:0"
    ],
    "justificativa": "Entender a filosofia do outro, trocar ideias e a falta de simpatia tratam de compreensão e desencontro."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "O gosto por viajar e a ampliação de horizontes tratam de ampliação."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando a Lua está muito aflita; essa condição natal não é calculada nesta versão."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Entre gerações, quem tem a Lua pode encorajar cedo a autonomia e o gosto por viagens, na crença de que isso completa a educação."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Moon in the 9th",
   "pdfPaginaInicio": 105,
   "pdfPaginaFim": 105,
   "hash": "450e1b7f70817919"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "finalidade atribuída ao vínculo, em tom de conselho; não entra na camada descritiva."
   },
   {
    "categoria": "papel_social",
    "motivo": "variação por tipo de relação; fica uma nota neutra em condicionadoPor."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento de valor atribuído a quem tem a Lua; mantida só como crença."
   }
  ]
 },
 {
  "id": "moon@casa10",
  "planeta": "moon",
  "casa": 10,
  "funcaoIntroduzida": "Quem tem a Lua pode entender por instinto o que quem tem a casa busca na vida, compartilhar seus objetivos e querer que sejam alcançados.",
  "campoAtivado": "Carreira, ambição e reputação de quem tem a casa.",
  "facilidades": [
   "A fé evidente nas capacidades pode inspirar quem tem a casa a dar o pequeno esforço extra que separa o sucesso do fracasso.",
   "Quem tem a Lua pode nutrir as ambições de quem tem a casa e fazer indicações que ajudam a revelar talentos latentes.",
   "As indicações de quem tem a Lua podem abrir oportunidades de carreira.",
   "Quem tem a Lua pode assumir uma atitude parental, empurrando suavemente rumo a um objetivo e protegendo a reputação de quem tem a casa de ataques.",
   "Pode haver um vínculo doméstico entre as duas pessoas."
  ],
  "tensoes": [
   "Com a Lua muito aflita, a antipatia crescente de quem tem a casa pode levar quem tem a Lua a depreciar a reputação de quem tem a casa.",
   "Quem tem a casa pode ver quem tem a Lua como uma responsabilidade, pôr seus assuntos em ordem e às vezes responder por essa pessoa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:0"
    ],
    "justificativa": "Inspirar a dar um esforço extra, revelar talentos e reputação tratam de autoexpressão e reconhecimento."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:2",
     "tensoes:1"
    ],
    "justificativa": "Oportunidades de carreira e pôr assuntos em ordem tratam de trabalho e organização concreta."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:3"
    ],
    "justificativa": "A atitude protetora e parental trata de sentimento e cuidado."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "tensoes:0"
    ],
    "justificativa": "A antipatia crescente trata de afeição que se perde."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando a Lua está muito aflita; essa condição natal não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma favorável depende de a Lua estar bem aspectada, e a relação com o vínculo doméstico é citada nesse caso."
   }
  ],
  "reforcoPorAngulo": "O efeito é mais marcado quando a Lua cai sobre o Meio do Céu de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Moon in the 10th",
   "pdfPaginaInicio": 105,
   "pdfPaginaFim": 105,
   "hash": "405f5a3f7da675d2"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "finalidade atribuída ao vínculo, em tom de conselho; não entra na camada descritiva."
   },
   {
    "categoria": "previsao",
    "motivo": "frequência entre casais; fora do repertório."
   },
   {
    "categoria": "papel_social",
    "motivo": "papéis de gênero; fica 'quem tem a Lua' e 'quem tem a casa'."
   }
  ]
 },
 {
  "id": "moon@casa11",
  "planeta": "moon",
  "casa": 11,
  "funcaoIntroduzida": "Quem tem a Lua pode sentir atração instintiva por quem tem a casa.",
  "campoAtivado": "Amizade, ideais e grupos.",
  "facilidades": [
   "Quem tem a Lua pode apreciar os ideais de quem tem a casa e demonstrar interesse amistoso por seu bem-estar.",
   "O vínculo pode se apoiar em um grupo reunido em torno de um ideal comum.",
   "Esse vínculo costuma indicar um laço real de amizade."
  ],
  "tensoes": [],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2"
    ],
    "justificativa": "O interesse amistoso e o laço de amizade tratam de afeição entre as duas pessoas."
   },
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "Um laço real de amizade trata de permanência do vínculo."
   }
  ],
  "condicionadoPor": [],
  "reforcoPorAngulo": null,
  "limitacoes": [
   "O livro não dá consequência tensa para esta leitura; só há facilidades."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Moon in the 11th",
   "pdfPaginaInicio": 105,
   "pdfPaginaFim": 105,
   "hash": "fbc0592773d62514"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "finalidade atribuída ao vínculo, em tom de conselho; não entra na camada descritiva."
   }
  ]
 },
 {
  "id": "moon@casa12",
  "planeta": "moon",
  "casa": 12,
  "funcaoIntroduzida": "Quem tem a Lua pode reconhecer por instinto os problemas de quem tem a casa e perceber seus pontos fracos.",
  "campoAtivado": "Vulnerabilidades, preocupações e confidências.",
  "facilidades": [
   "Quem tem a Lua tende a uma atitude especialmente generosa e a proteger quem tem a casa quando um ponto vulnerável pode ser atacado.",
   "Com a maioria dos aspectos favoráveis à Lua, quem tem a Lua tende a ficar bem-disposto com quem tem a casa.",
   "Quem tem a Lua pode convidar quem tem a casa a confiar-lhe suas aflições."
  ],
  "tensoes": [
   "A preocupação pode ser constrangedora, e quem tem a Lua pode se inquietar demais com os problemas ou a saúde de quem tem a casa.",
   "Com a Lua aflita, quem tem a Lua pode não levar em conta as fraquezas da outra pessoa, ofender-se sem motivo e até falar mal pelas costas.",
   "Quem tem a Lua pode se ocupar demais do bem-estar de quem tem a casa e agir em nome da outra pessoa sem necessidade."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:0",
     "tensoes:1"
    ],
    "justificativa": "Reconhecer problemas, proteger, preocupar-se e ofender-se tratam de sentimento, empatia e sensibilidade."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "O convite à confidência trata de confiança íntima."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:2"
    ],
    "justificativa": "Agir em nome da outra pessoa sem necessidade trata de controle."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando a Lua está aflita; essa condição natal não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma favorável depende de a maioria dos aspectos à Lua ser favorável."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Moon in the 12th",
   "pdfPaginaInicio": 106,
   "pdfPaginaFim": 106,
   "hash": "65bc55e68cc6df89"
  },
  "condicoesPorItem": {
   "tensoes[1]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "finalidade atribuída ao vínculo, em tom de conselho; não entra na camada descritiva."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho dirigido a quem tem a casa; fora do repertório."
   }
  ]
 },
 {
  "id": "mercury@casa1",
  "planeta": "mercury",
  "casa": 1,
  "funcaoIntroduzida": "Quem tem Mercúrio traz à vida de quem tem a casa um modo de pensar e de trocar ideias.",
  "campoAtivado": "Troca mental entre as duas pessoas, deslocamentos e inquietação.",
  "facilidades": [
   "O modo de pensar de quem tem Mercúrio pode agradar a quem tem a casa.",
   "Quem tem Mercúrio pode obter estímulo mental ao trocar ideias com quem tem a casa.",
   "O vínculo pode servir de apoio quando as duas pessoas têm interesse comum por atividades intelectuais."
  ],
  "tensoes": [
   "Pode haver falta de compreensão de fundo no plano mental, mesmo com comunicação frequente.",
   "Quem tem Mercúrio pode levar quem tem a casa a viajar mais que o habitual ou aumentar sua inquietação.",
   "Sem interesse intelectual comum, a conversa pode gastar tempo de quem tem a casa com assuntos sem importância real."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:0",
     "tensoes:2"
    ],
    "justificativa": "Os itens tratam de como o pensamento agrada, estimula e às vezes não é compreendido na conversa entre as duas pessoas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Mercúrio é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também vale quando Mercúrio faz aspecto adverso ao grau ascendente de quem tem a casa, vindo de outro setor do mapa."
   }
  ],
  "reforcoPorAngulo": "O efeito é mais marcado quando Mercúrio está em conjunção com o Ascendente de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mercury in the 1st House",
   "pdfPaginaInicio": 106,
   "pdfPaginaFim": 106,
   "hash": "f2c4739430bbed06"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "previsao",
    "motivo": "afirmação futura reescrita como possibilidade."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "mercury@casa2",
  "planeta": "mercury",
  "casa": 2,
  "funcaoIntroduzida": "Quem tem Mercúrio observa o modo como quem tem a casa lida com as finanças e pode comentá-lo.",
  "campoAtivado": "Finanças, recursos e avaliação da capacidade de ganho.",
  "facilidades": [
   "Quem tem Mercúrio pode perceber falhas no modo como quem tem a casa organiza as finanças.",
   "Quem tem Mercúrio pode trazer sugestões úteis para ampliar os recursos de quem tem a casa.",
   "Pode ajudar quem tem a casa a avaliar de modo mais realista a própria capacidade de ganho."
  ],
  "tensoes": [
   "As orientações de quem tem Mercúrio podem se mostrar mal fundamentadas.",
   "Transações financeiras com quem tem Mercúrio podem acabar em prejuízo para quem tem a casa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2",
     "tensoes:1"
    ],
    "justificativa": "Os itens tratam de dinheiro, recursos e capacidade de ganho concretos, vistos por uma e outra pessoa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Mercúrio é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também vale quando há vários aspectos adversos entre os mapas dirigidos a Mercúrio."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mercury in the 2nd",
   "pdfPaginaInicio": 106,
   "pdfPaginaFim": 106,
   "hash": "1db521aba951e47d"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de resultado reescrita como possibilidade."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "mercury@casa3",
  "planeta": "mercury",
  "casa": 3,
  "funcaoIntroduzida": "Quem tem Mercúrio traz comunicação livre e estímulo mental a quem tem a casa.",
  "campoAtivado": "Comunicação, notícias, contatos entre conhecidos e atividades educativas.",
  "facilidades": [
   "A comunicação entre as duas pessoas pode fluir com liberdade.",
   "Quem tem Mercúrio pode ser fonte de estímulo mental que amplia a compreensão de ideias de quem tem a casa.",
   "A posição favorece uma relação fácil, em base de vizinhança.",
   "Quem tem Mercúrio pode levar notícias e informações a quem tem a casa ou servir de intermediário entre quem tem a casa e conhecidos.",
   "O vínculo pode se dar por atividades educativas de vários tipos."
  ],
  "tensoes": [
   "As ideias das duas pessoas podem se chocar, com discussões e mal-entendidos."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2",
     "facilidades:3",
     "tensoes:0"
    ],
    "justificativa": "Os itens tratam de conversa livre, estímulo mental, notícias, mal-entendidos e discussões entre as duas pessoas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma favorável vale desde que os aspectos do mapa de quem tem a casa dirigidos a Mercúrio não sejam desfavoráveis; senão, vale a forma tensa."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mercury in the 3rd",
   "pdfPaginaInicio": 107,
   "pdfPaginaFim": 107,
   "hash": "008bcc2c7c72505d"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "previsao",
    "motivo": "o 'deveria poder' do livro virou possibilidade."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "papel de intermediário mantido como possibilidade, sem papel social fixo."
   }
  ]
 },
 {
  "id": "mercury@casa4",
  "planeta": "mercury",
  "casa": 4,
  "funcaoIntroduzida": "Quem tem Mercúrio estimula a mobilidade e planta ideias no ambiente doméstico de quem tem a casa.",
  "campoAtivado": "Mobilidade, viagens e o cenário doméstico.",
  "facilidades": [
   "Quem tem Mercúrio pode dar a quem tem a casa um incentivo para viajar ou se tornar mais móvel.",
   "Quem tem Mercúrio pode atuar sobre o cenário doméstico de quem tem a casa.",
   "As ideias plantadas podem ser reconhecidas por instinto como pertinentes à situação de quem tem a casa."
  ],
  "tensoes": [
   "A atitude de quem tem Mercúrio pode ter um traço de informalidade."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "O conteúdo é a ideia plantada na mente de uma pessoa e reconhecida por ela como sua."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "Trata do cenário doméstico, ou seja, o ambiente da casa de quem tem a casa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "Como Mercúrio fica perto do Sol e de Vênus, esses corpos podem estar também na quarta casa, e os efeitos mais passageiros de Mercúrio ficam menos visíveis."
   }
  ],
  "reforcoPorAngulo": "O efeito é mais marcado quando Mercúrio está em conjunção com o ângulo da quarta casa, o Fundo do Céu.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mercury in the 4th",
   "pdfPaginaInicio": 107,
   "pdfPaginaFim": 107,
   "hash": "91c3aae3993e7787"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "previsao",
    "motivo": "afirmação futura reescrita como possibilidade."
   }
  ]
 },
 {
  "id": "mercury@casa5",
  "planeta": "mercury",
  "casa": 5,
  "funcaoIntroduzida": "Quem tem o planeta oferece ideias à casa de quem a tem.",
  "campoAtivado": "Criação, passatempos e atividades ligadas a crianças e educação.",
  "facilidades": [
   "As ideias de quem tem Mercúrio podem estimular a imaginação criativa de quem tem a casa.",
   "O vínculo pode se apoiar em um interesse comum por passatempos ou por atividades ligadas a crianças e educação."
  ],
  "tensoes": [
   "Uma atitude crítica demais diante dos esforços criativos de quem tem a casa.",
   "As ideias podem atrapalhar, em vez de ajudar, a realização dos projetos criativos de quem tem a casa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "O núcleo é a oferta de ideias de uma pessoa à outra, ou seja, a troca de ideias."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:1"
    ],
    "justificativa": "A crítica excessiva e o atrapalho aos projetos são freio sobre o que a outra pessoa cria."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Mercúrio é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também depende de aspectos difíceis entre os mapas dirigidos a Mercúrio."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mercury in the 5th",
   "pdfPaginaInicio": 107,
   "pdfPaginaFim": 107,
   "hash": "1ba8f0ce5b73951c"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   }
  ]
 },
 {
  "id": "mercury@casa6",
  "planeta": "mercury",
  "casa": 6,
  "funcaoIntroduzida": "Quem tem Mercúrio oferece a quem tem a casa saber prático sobre trabalho e cuidado do corpo.",
  "campoAtivado": "Tarefas, trabalho, dieta e condicionamento físico.",
  "facilidades": [
   "Quem tem Mercúrio pode trazer saber prático sobre a maneira mais eficaz de realizar tarefas.",
   "Pode fazer sugestões sobre a dieta e a manutenção da forma física de quem tem a casa.",
   "Em períodos de tensão de quem tem a casa, pode ajudar com orientação eficaz."
  ],
  "tensoes": [
   "As orientações de quem tem Mercúrio podem desestabilizar quem tem a casa.",
   "Melhorias técnicas sugeridas podem resultar apenas em novos obstáculos."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:1"
    ],
    "justificativa": "Os itens tratam de tarefas, técnica, dieta e forma física, ou seja, a organização concreta do dia a dia."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa vale quando os aspectos entre os mapas dirigidos a Mercúrio são desfavoráveis."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Numa relação de trabalho, quando o Mercúrio de quem é empregado cai na sexta casa de quem emprega, a duração do vínculo depende de o Sol da primeira pessoa também cair nessa casa."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mercury in the 6th",
   "pdfPaginaInicio": 107,
   "pdfPaginaFim": 107,
   "hash": "43286df119de2121"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de duração virou dependência de uma condição, em nota por tipo de relação."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "caso por tipo de relação (trabalho), mantido só como nota de condição."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho do livro reescrito como possibilidade descritiva de ajuda."
   }
  ]
 },
 {
  "id": "mercury@casa7",
  "planeta": "mercury",
  "casa": 7,
  "funcaoIntroduzida": "Quem tem Mercúrio põe diante de quem tem a casa ideias e pontos de vista próprios, que completam as de quem tem a casa.",
  "campoAtivado": "Discussão, debate, contatos e confronto de pontos de vista.",
  "facilidades": [
   "Quem tem Mercúrio pode trazer ideias que complementam e completam as de quem tem a casa.",
   "Em discussões, pode apresentar um ponto de vista oposto, o que permite comparar os dois e avaliar o valor de cada um.",
   "Pode ampliar o círculo de contatos de quem tem a casa, e outras pessoas também podem servir de caixa de ressonância para suas ideias.",
   "Quem tem Mercúrio pode gostar de examinar as ideias de quem tem a casa à luz de um ponto de vista próprio e diferente.",
   "A disposição de cooperar no plano mental pode tornar a discussão e o debate produtivos."
  ],
  "tensoes": [
   "Fatores emocionais ou outros podem despertar preconceitos e distorções que impedem discussões objetivas."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2",
     "facilidades:3",
     "facilidades:4",
     "tensoes:0"
    ],
    "justificativa": "Os itens tratam de discussão, comparação de pontos de vista, debate e perda de objetividade na troca de ideias."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma favorável vale desde que Mercúrio não receba muitos aspectos discordantes do mapa de quem tem a casa; senão, vale a forma tensa."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Em relações de representação, como a de quem tem advogado ou agente, o mesmo vale para o Mercúrio dessa pessoa, desde que a maioria dos aspectos seja favorável."
   }
  ],
  "reforcoPorAngulo": "O efeito é mais marcado quando Mercúrio está em conjunção com o Descendente de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mercury in the 7th",
   "pdfPaginaInicio": 107,
   "pdfPaginaFim": 108,
   "hash": "d5b54d0805ad733d"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "fatalismo",
    "motivo": "o verbo de garantia foi trocado por possibilidade."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "juízo de valor sobre a posição retirado; ficou só a condição."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "caso por tipo de relação (advogado, agente), mantido só como nota de condição."
   }
  ]
 },
 {
  "id": "mercury@casa8",
  "planeta": "mercury",
  "casa": 8,
  "funcaoIntroduzida": "Quem tem Mercúrio pode entender as motivações inconscientes de quem tem a casa.",
  "campoAtivado": "Motivações profundas, autotransformação, valores internos e finanças.",
  "facilidades": [
   "Quem tem Mercúrio pode entender as motivações inconscientes de quem tem a casa mais do que a maioria das pessoas.",
   "Pode dar indicações úteis sobre como realizar alguma medida de autotransformação.",
   "Quando quem tem Mercúrio aprecia o senso de valores internos de quem tem a casa, o contato pode ser muito gratificante."
  ],
  "tensoes": [
   "Ter essa área subliminar penetrada por outra pessoa nem sempre é confortável.",
   "Quem tem Mercúrio pode usar, de propósito ou sem querer, o conhecimento das motivações íntimas de quem tem a casa em proveito próprio.",
   "Transações financeiras com quem tem Mercúrio podem ser terreno delicado quando o balanço dos aspectos é adverso."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:1",
     "tensoes:0"
    ],
    "justificativa": "Os itens tratam de autotransformação e da penetração de uma área íntima por outra pessoa, ou seja, revelação."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:0",
     "tensoes:1"
    ],
    "justificativa": "Tratam das motivações inconscientes e íntimas de uma pessoa e do uso que a outra faz delas."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "tensoes:2"
    ],
    "justificativa": "O item trata de transações financeiras entre as duas pessoas, ou seja, dinheiro concreto."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Mercúrio é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também vale quando os aspectos entre os mapas dirigidos a Mercúrio são desfavoráveis."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mercury in the 8th",
   "pdfPaginaInicio": 108,
   "pdfPaginaFim": 108,
   "hash": "6dfbab2993c01403"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "advertência reescrita como descrição de terreno delicado."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "mercury@casa9",
  "planeta": "mercury",
  "casa": 9,
  "funcaoIntroduzida": "Quem tem Mercúrio pode trazer a quem tem a casa áreas que ainda não tinham sido exploradas.",
  "campoAtivado": "Viagens, encontros em deslocamento e conversas sobre ideias e filosofia de vida.",
  "facilidades": [
   "Quem tem Mercúrio pode chamar a atenção de quem tem a casa para áreas que ainda não explorou.",
   "As duas pessoas podem fazer a mesma viagem com frequência e conversar, descobrindo interesse comum pelos detalhes mais superficiais do cotidiano.",
   "Às vezes a comunicação é mais profunda, com encontro de mentes e troca de ideias sobre aspectos filosóficos da vida.",
   "O vínculo pode ocorrer entre amigos distantes que se mantêm em contato por carta."
  ],
  "tensoes": [
   "Pode haver pouco acordo entre as duas pessoas, e as discussões podem levar a debates improdutivos ou a especulação sem fruto."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2",
     "facilidades:3",
     "tensoes:0"
    ],
    "justificativa": "Os itens tratam de conversa, troca de ideias, correspondência e discussões sem proveito entre as duas pessoas."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "O conteúdo é a ampliação do horizonte de quem tem a casa com áreas ainda não exploradas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Mercúrio é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A comunicação mais profunda é mais provável com aspectos favoráveis entre os mapas, e a forma tensa com aspectos desfavoráveis."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mercury in the 9th",
   "pdfPaginaInicio": 108,
   "pdfPaginaFim": 108,
   "hash": "18c7fefb05c09a4c"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "previsao",
    "motivo": "afirmação futura reescrita como possibilidade."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "mercury@casa10",
  "planeta": "mercury",
  "casa": 10,
  "funcaoIntroduzida": "Quem tem Mercúrio pode compreender por que as ambições de quem tem a casa seguem certa direção.",
  "campoAtivado": "Carreira, ambições, realizações e reputação.",
  "facilidades": [
   "Quem tem Mercúrio pode compreender por que as ambições de quem tem a casa seguem certa direção e o que se busca alcançar.",
   "Pode fazer sugestões que favorecem a carreira de quem tem a casa, chamando atenção para detalhes que passaram despercebidos.",
   "Pode comunicar as realizações de quem tem a casa a outras pessoas e aproximar quem tem a casa de quem possa dar assistência."
  ],
  "tensoes": [
   "Quem tem Mercúrio pode criticar os objetivos de quem tem a casa.",
   "Pode espalhar boatos ociosos que afetam a reputação de quem tem a casa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "Trata de reconhecer as ambições e o valor do que a outra pessoa tenta realizar."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "Trata de sugestões para a carreira, ou seja, o trabalho concreto de quem tem a casa."
   },
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:2",
     "tensoes:1"
    ],
    "justificativa": "Tratam de divulgar realizações a outros e de boatos que circulam sobre a pessoa."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:0"
    ],
    "justificativa": "A crítica aos objetivos de quem tem a casa funciona como freio sobre o que a pessoa busca."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Mercúrio é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também vale quando há aspectos adversos entre os mapas dirigidos a Mercúrio."
   }
  ],
  "reforcoPorAngulo": "O efeito é mais marcado quando Mercúrio está em conjunção com o Meio do Céu de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mercury in the 10th",
   "pdfPaginaInicio": 108,
   "pdfPaginaFim": 108,
   "hash": "7c625e921560ae28"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "previsao",
    "motivo": "afirmação futura reescrita como possibilidade."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "mercury@casa11",
  "planeta": "mercury",
  "casa": 11,
  "funcaoIntroduzida": "Quem tem Mercúrio pode entender os ideais de quem tem a casa e aproximar quem tem a casa de pessoas com ideais semelhantes.",
  "campoAtivado": "Ideais, amizades, esperanças e desejos, e o círculo de relações.",
  "facilidades": [
   "A conversa e a qualidade do intelecto de quem tem Mercúrio podem despertar atração em quem tem a casa.",
   "Quem tem Mercúrio pode entender os ideais de quem tem a casa e aproximar quem tem a casa de pessoas com ideais semelhantes.",
   "Pode ajudar quem tem a casa a avaliar de modo mais realista o caminho para realizar esperanças e desejos."
  ],
  "tensoes": [
   "Pode haver falta básica de sintonia entre as duas pessoas.",
   "As sugestões de quem tem Mercúrio podem atrapalhar mais do que ajudar.",
   "Quem tem Mercúrio pode apresentar de modo distorcido as ideias de quem tem a casa a outros do círculo, criando dificuldades para suas relações."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:2"
    ],
    "justificativa": "Os itens tratam de conversa, compreensão de ideais e ideias apresentadas de modo distorcido a outras pessoas."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "Trata da atração que a conversa e o intelecto despertam em quem tem a casa."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "tensoes:0"
    ],
    "justificativa": "A falta básica de sintonia entre as duas pessoas é uma questão de sentimento e empatia."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Mercúrio é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também vale quando Mercúrio recebe vários aspectos desfavoráveis do mapa de quem tem a casa."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mercury in the 11th",
   "pdfPaginaInicio": 108,
   "pdfPaginaFim": 109,
   "hash": "a39798c6094d3585"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "mercury@casa12",
  "planeta": "mercury",
  "casa": 12,
  "funcaoIntroduzida": "Quem tem Mercúrio pode se interessar pelo modo como quem tem a casa se ajusta à vida como um todo.",
  "campoAtivado": "Ajuste à vida, pontos vulneráveis, fraquezas e áreas de atenção e transformação.",
  "facilidades": [
   "Quem tem Mercúrio pode estar atento aos pontos vulneráveis de quem tem a casa e apontar incoerências em seu comportamento.",
   "A crítica oferecida pode ajudar quem tem a casa a evitar armadilhas.",
   "Com Mercúrio bem aspectado e aspectos favoráveis entre os mapas, pode dar muitas orientações úteis.",
   "Mesmo com aspectos menos favoráveis, pode dar orientações úteis, que quem tem a casa pode ter dificuldade de pôr em prática.",
   "Quem tem Mercúrio pode apontar as áreas que mais pedem atenção extra e transformação."
  ],
  "tensoes": [
   "Quem tem a casa pode se inclinar a ressentir as orientações ou achar particularmente difícil colocá-las em prática.",
   "Com muitos aspectos adversos, quem tem Mercúrio pode ser fonte de incômodo, espalhando boatos pelas costas e conversando de modo a espicaçar as fraquezas de quem tem a casa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "limites",
    "sustentadaPor": [
     "facilidades:1",
     "tensoes:0"
    ],
    "justificativa": "A crítica sobre incoerências e pontos vulneráveis funciona como freio, e pode ser acolhida ou resistida."
   },
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:2",
     "tensoes:1"
    ],
    "justificativa": "Tratam de orientações dadas, de boatos e de conversas que tocam as fraquezas de quem tem a casa."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:4"
    ],
    "justificativa": "O item trata de áreas que pedem atenção extra e transformação, a partir de fraquezas apontadas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "As muitas orientações úteis valem com Mercúrio bem aspectado no mapa natal; a forma tensa se acentua com muitos aspectos adversos. Essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma favorável também depende de aspectos favoráveis entre os mapas dirigidos a Mercúrio."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mercury in the 12th",
   "pdfPaginaInicio": 109,
   "pdfPaginaFim": 109,
   "hash": "753a9b5b704201de"
  },
  "condicoesPorItem": {
   "tensoes[1]": {
    "natal": false,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "juízo de valor sobre o conselho retirado; ficou 'orientações úteis'."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "venus@casa1",
  "planeta": "venus",
  "casa": 1,
  "funcaoIntroduzida": "Quem tem Vênus traz charme e harmonia ao encontro com quem tem a casa.",
  "campoAtivado": "A relação pessoal, o charme e a sensação de estar à vontade com a outra pessoa.",
  "facilidades": [
   "Quem tem a casa pode perceber de modo particular o charme de quem tem Vênus.",
   "A personalidade de quem tem a casa pode tocar uma corda harmoniosa em quem tem Vênus.",
   "Quem tem a casa pode se sentir muito à vontade e apreciar a companhia de quem tem Vênus.",
   "Quem tem Vênus tende a incentivar quem tem a casa a ser naturalmente quem é."
  ],
  "tensoes": [
   "Grande parte do que a posição oferece pode diminuir.",
   "Pela possessividade excessiva de quem tem Vênus, quem tem a casa pode despertar ciúme ou inveja.",
   "O vínculo afetuoso pode seguir existindo, pontuado por brigas e abalos emocionais."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2",
     "tensoes:1",
     "tensoes:2"
    ],
    "justificativa": "Os itens tratam de charme, conforto na companhia, ciúme e o vínculo afetuoso com brigas entre as duas pessoas."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:3"
    ],
    "justificativa": "O conteúdo é o incentivo a que a outra pessoa se expresse como ela é de modo natural."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Vênus é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também vale quando os aspectos entre os mapas dirigidos a Vênus são desfavoráveis."
   }
  ],
  "reforcoPorAngulo": "O efeito é mais marcado quando Vênus está em conjunção com o Ascendente de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Venus in the 1st House",
   "pdfPaginaInicio": 109,
   "pdfPaginaFim": 109,
   "hash": "0a8712cf777851b7"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "previsao",
    "motivo": "avaliação e presságio retirados; ficou a dinâmica de charme e conforto."
   },
   {
    "categoria": "papel_social",
    "motivo": "vínculo conjugal citado como exemplo; o repertório é neutro quanto ao vínculo."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "venus@casa2",
  "planeta": "venus",
  "casa": 2,
  "funcaoIntroduzida": "Quem tem Vênus, pelo senso de valores, percebe as qualidades de quem tem a casa e pode gerar bem-estar em quem tem a casa.",
  "campoAtivado": "Bens, recursos, senso de valores e sensação de estabilidade.",
  "facilidades": [
   "Quem tem Vênus pode agir de modo particularmente favorável sobre quem tem a casa, em coisas materiais e também no plano emocional.",
   "O senso de valores de quem tem Vênus faz perceber as qualidades de quem tem a casa e pode gerar bem-estar em quem tem a casa.",
   "Quem tem Vênus costuma se esforçar para ajudar quem tem a casa.",
   "O vínculo pode indicar entendimento mútuo pronunciado entre as duas pessoas."
  ],
  "tensoes": [
   "Quem tem Vênus muito afligido pode ser fonte de distração para a outra pessoa.",
   "A outra pessoa pode negligenciar oportunidades proveitosas e se descuidar de assuntos financeiros."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "tensoes:1"
    ],
    "justificativa": "Os itens tratam de coisas materiais, oportunidades proveitosas e cuidado com assuntos financeiros."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "O conteúdo é o reconhecimento das qualidades de quem tem a casa pelo senso de valores do outro."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:2",
     "facilidades:3"
    ],
    "justificativa": "Tratam de empenho em ajudar e de entendimento mútuo entre as duas pessoas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Vênus é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também vale quando os aspectos entre os mapas são em maioria desarmônicos."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "A distração por Vênus afligido vale para todos os tipos de relação."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Venus in the 2nd",
   "pdfPaginaInicio": 109,
   "pdfPaginaFim": 110,
   "hash": "3954c304a4f7fa8a"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "genero",
    "motivo": "dinâmica de gênero retirada; ficou o entendimento entre as duas pessoas."
   },
   {
    "categoria": "previsao",
    "motivo": "afirmação futura reescrita como possibilidade."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "venus@casa3",
  "planeta": "venus",
  "casa": 3,
  "funcaoIntroduzida": "Quem tem Vênus favorece afinidade mental e entendimento mútuo com quem tem a casa.",
  "campoAtivado": "Afinidade mental, conversa e expressão de ideias.",
  "facilidades": [
   "Pode haver um grau considerável de afinidade mental e entendimento mútuo entre as duas pessoas.",
   "As conversas podem ser divertidas e envolventes.",
   "Quem tem Vênus tende a incentivar quem tem a casa a comunicar seus pensamentos e, ao acolhê-los com simpatia, a expressar as ideias de forma agradável.",
   "Quem tem Vênus pode expor o próprio ponto de vista de modo muito persuasivo."
  ],
  "tensoes": [
   "O entendimento entre as duas pessoas pode diminuir."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2",
     "facilidades:3",
     "tensoes:0"
    ],
    "justificativa": "Os itens tratam de conversa, expressão de ideias, persuasão e afinidade mental entre as duas pessoas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Vênus é afetado de modo adverso no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também vale quando os aspectos do mapa de quem tem a casa dirigidos a Vênus são desarmônicos."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Na relação entre quem ensina e quem aprende, o vínculo é favorável quando é o Vênus de quem ensina que está envolvido, com Vênus fortalecido no mapa natal e aspectos favoráveis."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Venus in the 3rd",
   "pdfPaginaInicio": 110,
   "pdfPaginaFim": 110,
   "hash": "d3041c3e4e7cabf8"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "previsao",
    "motivo": "afirmação futura reescrita como possibilidade."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "juízo de valor retirado; ficou a condição por tipo de relação."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "caso por tipo de relação (ensino), mantido só como nota de condição."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "venus@casa4",
  "planeta": "venus",
  "casa": 4,
  "funcaoIntroduzida": "Quem tem Vênus pode despertar em quem tem a casa simpatia instintiva e sensação de estar em casa.",
  "campoAtivado": "Lar, ambiente, imóvel, hábitos e reações instintivas.",
  "facilidades": [
   "Quem tem a casa pode sentir simpatia instintiva e muito conforto junto de quem tem Vênus.",
   "Quem tem Vênus pode ajudar a embelezar o lar de quem tem a casa, abrir oportunidades de melhorar o ambiente ou ajudar a adquirir um imóvel.",
   "Quem tem Vênus pode adotar uma atitude de cuidado diante de quem tem a casa, com resultados muito satisfatórios.",
   "Por admiração, quem tem a casa pode imitar os hábitos e as reações instintivas de quem tem Vênus."
  ],
  "tensoes": [
   "Quem tem a casa pode ceder à linha de menor resistência no trato com quem tem Vênus."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:3"
    ],
    "justificativa": "Tratam de simpatia instintiva, conforto e imitação de hábitos e reações instintivas."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "O conteúdo é o lar, o ambiente e a aquisição de imóvel, ou seja, a organização concreta da casa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Vênus é debilitado ou muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A atitude de cuidado só rende resultados satisfatórios sem aspectos particularmente adversos entre os mapas; a forma tensa também depende de aspectos pouco úteis."
   }
  ],
  "reforcoPorAngulo": "O efeito é mais marcado quando Vênus está em conjunção com o Fundo do Céu de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Venus in the 4th",
   "pdfPaginaInicio": 110,
   "pdfPaginaFim": 110,
   "hash": "d9b528258ed28551"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel parental retirado; ficou a atitude de cuidado."
   },
   {
    "categoria": "previsao",
    "motivo": "possibilidade mantida; futuro do livro retirado onde apareceu."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "venus@casa5",
  "planeta": "venus",
  "casa": 5,
  "funcaoIntroduzida": "Quem tem Vênus pode ser fonte de grande prazer para quem tem a casa.",
  "campoAtivado": "Prazer na companhia, esforços criativos e associação romântica.",
  "facilidades": [
   "Quem tem Vênus pode ser fonte de grande prazer, e quem tem a casa pode sempre gostar dessa companhia.",
   "Quem tem Vênus tende a apreciar os esforços criativos de quem tem a casa e a incentivar sua apresentação de forma atraente e dramática.",
   "A posição pode indicar associação romântica quando a idade das duas pessoas é adequada.",
   "Quem tem Vênus pode ter talento especial para ajudar a lidar com crianças e a ganhar popularidade entre as crianças."
  ],
  "tensoes": [],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2"
    ],
    "justificativa": "Os itens tratam de prazer na companhia e de associação romântica entre as duas pessoas."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "O conteúdo é o apreço e o incentivo aos esforços criativos, isto é, a autoexpressão de quem tem a casa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A duração da associação romântica depende da condição natal de Vênus; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A duração da associação romântica também depende dos aspectos entre os mapas dirigidos a Vênus."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "O talento com crianças é citado para a relação entre amigos, quando o Vênus de quem é amigo cai na quinta casa de quem cuida das crianças."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [
   "O livro não descreve forma tensa para esta posição; só diz que a permanência de uma associação romântica depende da condição natal e dos aspectos."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Venus in the 5th",
   "pdfPaginaInicio": 110,
   "pdfPaginaFim": 110,
   "hash": "cfaa1d1f7c46eab1"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de duração virou dependência de condição natal e aspectos."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel de pai ou mãe retirado; ficou o talento com crianças em nota por tipo de relação."
   },
   {
    "categoria": "genero",
    "motivo": "dinâmica de gênero retirada."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "venus@casa6",
  "planeta": "venus",
  "casa": 6,
  "funcaoIntroduzida": "Quem tem Vênus tende a sentir prazer em prestar serviços a quem tem a casa.",
  "campoAtivado": "Serviços, tarefas do dia a dia, condições de trabalho e cuidado.",
  "facilidades": [
   "Quem tem Vênus tende a sentir muito prazer em prestar serviços variados e em mostrar como realizar tarefas com mais facilidade.",
   "Pode haver reciprocidade, com quem tem Vênus necessitando em algum momento do cuidado e do apoio de quem tem a casa."
  ],
  "tensoes": [],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "O conteúdo é a prestação de serviços e a execução de tarefas, ou seja, rotina e serviço concretos."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "Trata de reciprocidade, cuidado e apoio entre as duas pessoas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "Nas relações de trabalho, a leitura vale salvo quando Vênus é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Em relações de trabalho, o Vênus de quem emprega na sexta casa de quem é empregado traz atenção a condições de trabalho agradáveis; no sentido inverso, pode haver indulgência excessiva de quem emprega."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [
   "O livro não descreve forma tensa geral para esta posição, só notas por tipo de relação."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Venus in the 6th",
   "pdfPaginaInicio": 110,
   "pdfPaginaFim": 110,
   "hash": "504073732529f253"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão reescrita como possibilidade em nota por tipo de relação."
   },
   {
    "categoria": "papel_social",
    "motivo": "papéis conjugais retirados; ficou a reciprocidade entre as duas pessoas."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "caso por tipo de relação (cuidado médico), não incorporado."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "juízo de valor retirado."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "venus@casa7",
  "planeta": "venus",
  "casa": 7,
  "funcaoIntroduzida": "Quem tem Vênus, regente natural da sétima casa, abre a possibilidade de cooperação mútua com quem tem a casa.",
  "campoAtivado": "Cooperação, parceria e harmonia na relação.",
  "facilidades": [
   "Pode haver alto grau de cooperação mútua entre as duas pessoas.",
   "Quem tem Vênus pode avaliar com cuidado a capacidade de quem tem a casa de estabelecer uma relação feliz antes de se comprometer.",
   "Satisfeita essa avaliação, o vínculo pode sustentar uma parceria particularmente harmoniosa."
  ],
  "tensoes": [
   "Se a posição repete a posição natal de cada pessoa, cada uma pode deixar à outra o estabelecimento da harmonia, e a parceria pode sofrer."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2",
     "tensoes:0"
    ],
    "justificativa": "Os itens tratam de comprometer-se, de manter a parceria e do que a enfraquece."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "O item trata de uma parceria harmoniosa entre as duas pessoas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A leitura favorável vale desde que Vênus não seja muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura favorável também vale quando os aspectos entre os mapas são em maioria favoráveis."
   }
  ],
  "reforcoPorAngulo": "O efeito é mais marcado quando Vênus está em conjunção com o Descendente de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Venus in the 7th",
   "pdfPaginaInicio": 111,
   "pdfPaginaFim": 111,
   "hash": "5c03930f024abf64"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "papel_social",
    "motivo": "vínculo conjugal citado como exemplo; o repertório é neutro quanto ao vínculo."
   },
   {
    "categoria": "previsao",
    "motivo": "promessa reescrita como possibilidade."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "venus@casa8",
  "planeta": "venus",
  "casa": 8,
  "funcaoIntroduzida": "Quem tem Vênus mobiliza em quem tem a casa sentimentos profundamente enraizados.",
  "campoAtivado": "Sentimento profundo, atração sexual, fascínio e clareza sobre si.",
  "facilidades": [
   "Pode haver considerável atração sexual entre as duas pessoas.",
   "Quem tem Vênus pode parecer dotado de um fascínio misterioso.",
   "Ao lidar com essa fonte de fascínio, quem tem a casa pode ganhar muita clareza sobre si."
  ],
  "tensoes": [
   "Quem tem a casa pode não ter clareza sobre as razões de suas reações emocionais, simpáticas ou antipáticas.",
   "Parte do interesse pode se basear na atração física, que sustenta pouco a permanência da relação."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1"
    ],
    "justificativa": "Tratam de atração sexual e fascínio entre as duas pessoas."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "tensoes:0"
    ],
    "justificativa": "O conteúdo são reações emocionais cujas razões não ficam claras para quem as sente."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "O item trata de clareza sobre si ganha ao lidar com um fascínio intenso."
   },
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "Trata de uma relação baseada em atração física, com pouca sustentação de permanência."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "Muita coisa depende dos aspectos entre os mapas dirigidos a Vênus."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Quando há interesse romântico, a permanência depende de outros indícios de afinidade mais durável."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Venus in the 8th",
   "pdfPaginaInicio": 111,
   "pdfPaginaFim": 111,
   "hash": "f7cbb7b4fc1f4ee9"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "genero",
    "motivo": "dinâmica de gênero retirada."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de verificar outros indícios virou nota de condição."
   },
   {
    "categoria": "previsao",
    "motivo": "probabilidade reescrita como possibilidade."
   }
  ]
 },
 {
  "id": "venus@casa9",
  "planeta": "venus",
  "casa": 9,
  "funcaoIntroduzida": "Pelo exemplo, quem tem Vênus pode atuar sobre toda a abordagem de vida de quem tem a casa.",
  "campoAtivado": "Viagens, filosofia de vida, ideias e persuasão.",
  "facilidades": [
   "A disposição amistosa evidente de quem tem Vênus pode despertar em quem tem a casa mais interesse em entender as ideias que motivam seu modo de vida.",
   "Quem tem Vênus pode despertar maior desejo de viajar e ainda oferecer transporte ou mostrar como viajar com mais facilidade ou conforto.",
   "O vínculo estimula afinidade e atmosfera de cordialidade, e quem tem a casa pode se fascinar pela filosofia de quem tem Vênus e se mostrar aberta à persuasão."
  ],
  "tensoes": [],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2"
    ],
    "justificativa": "Os itens tratam de entender as ideias do outro e de abertura à persuasão numa troca de pontos de vista."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "O conteúdo é a ampliação do horizonte pelo desejo de viajar e pelos meios para isso."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A atmosfera de cordialidade vale salvo quando Vênus é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Entre quem ensina e quem aprende, o vínculo é muito útil quando é a nona casa de quem aprende que está envolvida."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [
   "O livro não descreve forma tensa para esta posição, só a ressalva de que Vênus muito afligido altera a atmosfera de cordialidade."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Venus in the 9th",
   "pdfPaginaInicio": 111,
   "pdfPaginaFim": 111,
   "hash": "f9a90adae51d07b9"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "previsao",
    "motivo": "afirmação futura reescrita como possibilidade."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "caso por tipo de relação (ensino), mantido só como nota."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "venus@casa10",
  "planeta": "venus",
  "casa": 10,
  "funcaoIntroduzida": "Quem tem Vênus pode oferecer ajuda e incentivo à carreira de quem tem a casa.",
  "campoAtivado": "Carreira, objetivos, reputação, lealdade e admiração.",
  "facilidades": [
   "Quem tem Vênus pode oferecer ajuda considerável à carreira de quem tem a casa e incentivo valioso na busca de seus objetivos.",
   "Quem tem Vênus pode reconhecer o valor do que quem tem a casa tenta realizar.",
   "Quem tem a casa pode manter o alto apreço de quem tem Vênus por seu valor.",
   "Demonstrações de lealdade de quem tem a casa costumam ser amplamente retribuídas.",
   "Quem tem Vênus pode se tornar objeto de adoração, e quem tem a casa pode desejar pôr quem tem Vênus num pedestal."
  ],
  "tensoes": [
   "Quem tem a casa pode sentir a tentação de a abusar do apoio generoso de quem tem Vênus."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "O conteúdo é ajuda concreta à carreira, ou seja, trabalho e recursos de quem tem a casa."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2",
     "facilidades:4"
    ],
    "justificativa": "Tratam de reconhecer o valor da outra pessoa, de apreço mantido e de adoração."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "Trata de incentivo generoso na busca dos objetivos, ou seja, estímulo ao crescimento."
   },
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "facilidades:3"
    ],
    "justificativa": "O item trata de lealdade demonstrada e retribuída entre as duas pessoas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Vênus é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também vale quando há aspectos difíceis entre os mapas dirigidos a Vênus."
   }
  ],
  "reforcoPorAngulo": "O efeito é mais marcado quando Vênus está em conjunção com o Meio do Céu de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Venus in the 10th",
   "pdfPaginaInicio": 111,
   "pdfPaginaFim": 111,
   "hash": "c78693cf34ab98ef"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "genero",
    "motivo": "a inversão é de gênero; a dinâmica de adoração foi mantida sem os papéis."
   },
   {
    "categoria": "previsao",
    "motivo": "afirmação futura reescrita como possibilidade."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "venus@casa11",
  "planeta": "venus",
  "casa": 11,
  "funcaoIntroduzida": "Quem tem Vênus aprecia os ideais de quem tem a casa e pode ajudar a realizar alguns de seus sonhos.",
  "campoAtivado": "Ideais, sonhos e amizade.",
  "facilidades": [
   "A associação pode ser muito feliz.",
   "Quem tem Vênus pode apreciar particularmente os ideais de quem tem a casa.",
   "Pode ajudar quem tem a casa a realizar alguns de seus sonhos.",
   "O vínculo pode indicar a possibilidade de construir uma amizade baseada nos motivos mais elevados."
  ],
  "tensoes": [
   "Quem tem Vênus pode ser tentado a manter a amizade por motivos ocultos.",
   "Quem tem a casa pode abusar da disposição amistosa de quem tem Vênus."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:3"
    ],
    "justificativa": "Tratam de uma associação feliz e de uma amizade, ou seja, afeição entre as duas pessoas."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "O conteúdo é o apreço pelos ideais da outra pessoa, isto é, reconhecimento do seu valor."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "Trata de ajuda para realizar sonhos, ou seja, ampliação do que a outra pessoa almeja."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Vênus é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também vale quando os aspectos entre os mapas dirigidos a Vênus são desarmônicos."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Venus in the 11th",
   "pdfPaginaInicio": 112,
   "pdfPaginaFim": 112,
   "hash": "c611cdbf1379b5ea"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "papel_social",
    "motivo": "vínculo conjugal citado como exemplo; o repertório é neutro quanto ao vínculo."
   },
   {
    "categoria": "previsao",
    "motivo": "afirmação futura reescrita como possibilidade."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "venus@casa12",
  "planeta": "venus",
  "casa": 12,
  "funcaoIntroduzida": "Quem tem Vênus pode ter talento especial para ajudar quem tem a casa a se ajustar a situações difíceis.",
  "campoAtivado": "Ajuste a situações difíceis, conforto, bem-estar do corpo e temas ocultos ou místicos.",
  "facilidades": [
   "Quem tem Vênus pode ter talento especial para ajudar quem tem a casa a se ajustar a situações difíceis.",
   "Pode sugerir soluções quando quem tem a casa enfrenta problemas complicados.",
   "Pode ser companhia solidária e confortar quem tem a casa em momentos de aflição.",
   "Pode aproximar quem tem a casa de quem cuide do bem-estar do corpo e de necessidades espirituais.",
   "Pode apresentar a quem tem a casa o estudo de temas ocultos ou místicos."
  ],
  "tensoes": [
   "Quem tem Vênus pode nem sempre dizer exatamente o que pensa, por receio de perturbar quem tem a casa.",
   "O contato pode ter efeito sedutor e fazer quem tem a casa, consciente ou não, perder de vista seus objetivos.",
   "Pode explorar as suscetibilidades de quem tem a casa e jogar com sua simpatia em proveito próprio."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2"
    ],
    "justificativa": "Tratam de ajustar-se a situações difíceis e de conforto em momentos de aflição."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "O conteúdo são soluções para problemas complicados, ou seja, organização concreta de uma saída."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "tensoes:1",
     "tensoes:2"
    ],
    "justificativa": "Tratam de efeito sedutor e do uso das simpatias da outra pessoa em proveito próprio."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Vênus é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também vale quando os aspectos entre os mapas dirigidos a Vênus são discordantes."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Entre quem recebe cuidados médicos e quem os presta, o vínculo é favorável quando é a décima segunda casa de quem recebe os cuidados que está envolvida."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Venus in the 12th",
   "pdfPaginaInicio": 112,
   "pdfPaginaFim": 112,
   "hash": "03ef818884b59889"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "caso por tipo de relação (cuidado médico), mantido só como nota de condição."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "juízo de valor retirado."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "mars@casa1",
  "planeta": "mars",
  "casa": 1,
  "funcaoIntroduzida": "Quem tem Marte mantém em alerta quem tem a casa e a desafia a se esforçar e a reunir coragem.",
  "campoAtivado": "Esforço pessoal, coragem em emergência, independência e iniciativa diante de quem tem Marte.",
  "facilidades": [
   "Quem tem Marte pode desafiar quem tem a casa a se esforçar até o limite e a reunir coragem numa emergência.",
   "Quem tem Marte pode ser um defensor corajoso do que importa a quem tem a casa.",
   "Quem tem Marte pode esperar de quem tem a casa certa independência e autossuficiência.",
   "Com aspectos harmoniosos entre os mapas, o desafio pode ajudar quem tem a casa a acompanhar e igualar o desempenho de quem tem Marte.",
   "As ideias de quem tem Marte podem estimular respostas complementares de quem tem a casa e abrir caminho a uma colaboração eficaz.",
   "A colaboração pode funcionar muito bem numa parceria de negócios."
  ],
  "tensoes": [
   "Pode haver atritos por precipitação ou assertividade demais de quem tem Marte.",
   "A atividade de quem tem Marte pode fazer exigências demais a quem tem a casa.",
   "A tentativa de despertar uma resposta mais enérgica pode irritar, pela urgência constante em pressionar por resultados rápidos.",
   "Pode haver forte atração física entre as duas pessoas."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "acao_desejo",
    "sustentadaPor": [
     "facilidades:0",
     "tensoes:0",
     "tensoes:3"
    ],
    "justificativa": "Tratam de desafio, iniciativa, assertividade precipitada, atrito aberto e atração física entre as duas pessoas."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:1",
     "tensoes:2"
    ],
    "justificativa": "As exigências demais e a pressão por resultados rápidos são contenção e cobrança sobre quem tem a casa."
   },
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:4"
    ],
    "justificativa": "As ideias de uma pessoa provocam respostas complementares da outra, ou seja, troca de ideias."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:5"
    ],
    "justificativa": "O conteúdo é a eficácia da colaboração numa parceria de negócios, ou seja, trabalho concreto."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "Trata da expectativa de independência e autossuficiência, o senso de si de quem tem a casa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Marte é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também depende de aspectos discordantes entre os mapas dirigidos a Marte."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma facilitadora, em que o desafio ajuda a igualar o desempenho, depende de aspectos harmoniosos entre os mapas."
   }
  ],
  "reforcoPorAngulo": "Quando Marte cai sobre o Ascendente de quem tem a casa, a leitura ganha ênfase.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mars in the 1st House",
   "pdfPaginaInicio": 112,
   "pdfPaginaFim": 112,
   "hash": "faa87111250867d3"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Marte, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "aspecto próximo ao grau ascendente vindo de outros setores é técnica fora do que o motor modela."
   },
   {
    "categoria": "previsao",
    "motivo": "constatação sobre casais; descartada por ser previsão sobre o tipo de vínculo."
   },
   {
    "categoria": "genero",
    "motivo": "restrição a sexos opostos; fica a atração, sem recorte de gênero."
   }
  ]
 },
 {
  "id": "mars@casa2",
  "planeta": "mars",
  "casa": 2,
  "funcaoIntroduzida": "Quem tem Marte estimula a iniciativa de quem tem a casa no uso dos próprios recursos.",
  "campoAtivado": "Recursos financeiros, iniciativa e independência material.",
  "facilidades": [
   "Quem tem Marte pode encorajar quem tem a casa a mostrar mais iniciativa ao lidar com o dinheiro e os recursos.",
   "Quem tem Marte pode esperar que quem tem a casa demonstre independência financeira, respeitando também a própria.",
   "Pode haver forte estímulo sexual entre as duas pessoas, e o desfecho depende dos aspectos entre os mapas."
  ],
  "tensoes": [
   "Pode haver desacordo sobre o modo como quem tem a casa lida com seus problemas financeiros.",
   "Quem tem Marte pode invejar a situação financeira de quem tem a casa."
  ],
  "excessosPossiveis": [
   "Quem tem Marte pode encorajar quem tem a casa a gastar demais ou a se arriscar demais em questões financeiras."
  ],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:0",
     "excessosPossiveis:0"
    ],
    "justificativa": "O conteúdo é dinheiro, recursos e o modo de administrá-los, inclusive gasto e risco financeiro."
   },
   {
    "categoria": "acao_desejo",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2"
    ],
    "justificativa": "Trata de iniciativa estimulada e de estímulo sexual entre as duas pessoas."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "O estímulo sexual é um tipo de atração entre as duas pessoas."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "excessosPossiveis:0"
    ],
    "justificativa": "O excesso de gasto e a ousadia financeira estimulada são ampliação além da medida."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:1",
     "tensoes:1"
    ],
    "justificativa": "A expectativa de independência e a inveja da situação do outro tocam o valor próprio de cada pessoa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Marte é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também depende de aspectos inarmônicos entre os mapas, e o desfecho do estímulo sexual também depende deles."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mars in the 2nd",
   "pdfPaginaInicio": 113,
   "pdfPaginaFim": 113,
   "hash": "703549976124d509"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Marte, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "genero",
    "motivo": "restrição a sexos opostos; fica o estímulo sexual, sem recorte de gênero."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento de resultado benéfico; fica só a dependência dos aspectos."
   }
  ]
 },
 {
  "id": "mars@casa3",
  "planeta": "mars",
  "casa": 3,
  "funcaoIntroduzida": "Quem tem Marte oferece forte estímulo mental a quem tem a casa.",
  "campoAtivado": "Pensamento claro, discussão franca, debate de opiniões e deslocamentos.",
  "facilidades": [
   "Quem tem Marte quer conhecer e apreciar as razões por trás das ações de quem tem a casa e pode consultar quem tem a casa sobre problemas que pedem raciocínio claro.",
   "Quem tem Marte tende a expor os próprios problemas com franqueza e a argumentar e debater o ponto de vista de quem tem a casa.",
   "Quem tem Marte pode desafiar as opiniões de quem tem a casa para levar essa pessoa a se expor.",
   "Quem tem Marte pode esperar que quem tem a casa tenha opinião própria, sem se deixar levar por argumentos alheios ou boatos."
  ],
  "tensoes": [
   "Quem tem Marte pode invejar as realizações mentais de quem tem a casa.",
   "Divergências fortes nas discussões podem terminar em acrimônia.",
   "Quem tem Marte pode ser o motivo de quem tem a casa precisar viajar com frequência."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2",
     "facilidades:3",
     "tensoes:1"
    ],
    "justificativa": "Tratam de debate, consulta, franqueza e acrimônia na troca de ideias entre as duas pessoas."
   },
   {
    "categoria": "acao_desejo",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2"
    ],
    "justificativa": "O debate e o desafio às opiniões são disputa aberta de argumentos."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "tensoes:0",
     "facilidades:3"
    ],
    "justificativa": "Inveja de realizações mentais e expectativa de opinião própria tocam o valor e a autonomia de cada pessoa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa depende de aspectos discordantes entre os mapas dirigidos a Marte."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Entre vizinhos, o livro aponta dificuldades quando os aspectos entre os mapas não são especialmente harmoniosos."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mars in the 3rd",
   "pdfPaginaInicio": 113,
   "pdfPaginaFim": 113,
   "hash": "e33002538f140771"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo de relação específica; vira nota de tipo de relação, sem versão separada."
   },
   {
    "categoria": "prescricao",
    "motivo": "orientação de conduta; fica só o risco de acrimônia em divergência forte."
   }
  ]
 },
 {
  "id": "mars@casa4",
  "planeta": "mars",
  "casa": 4,
  "funcaoIntroduzida": "Quem tem Marte desafia quem tem a casa a rever suas reações instintivas e hábitos diante dessa pessoa.",
  "campoAtivado": "Lar, reações instintivas, hábitos e segurança no ambiente doméstico.",
  "facilidades": [
   "Quem tem a casa pode reagir por instinto com simpatia ou antipatia a quem tem Marte, conforme os aspectos entre os mapas.",
   "Quem tem Marte pode apreciar quem tem a casa pelo que essa pessoa é.",
   "Com aspectos favoráveis, quem tem a casa pode sentir mais segurança na presença de quem tem Marte.",
   "Em casa compartilhada, quem tem Marte pode trazer vivacidade ao ambiente doméstico, onde as coisas não ficam paradas.",
   "Com aspectos razoavelmente harmoniosos, a ausência de quem tem Marte pode trazer uma calmaria menos desejável que a presença, mesmo que esta às vezes canse."
  ],
  "tensoes": [
   "Quem tem a casa pode ver quem tem Marte como um peso e uma fonte de perturbação num clima doméstico que se quer calmo.",
   "Quem tem Marte pode ser fonte de trabalho doméstico extra, com exigências que mantêm quem tem a casa ocupada e consomem suas forças."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2",
     "facilidades:4",
     "tensoes:0"
    ],
    "justificativa": "Tratam de reação instintiva, segurança afetiva e clima do lar na presença de quem tem Marte."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:3",
     "tensoes:1"
    ],
    "justificativa": "O conteúdo é a vida doméstica, com seu movimento e o trabalho extra da casa."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "O apreço de quem tem Marte por quem tem a casa como ela é toca a afeição entre as duas pessoas."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "As exigências de quem tem Marte funcionam como cobrança que prende quem tem a casa a tarefas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Marte é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura depende dos aspectos entre os mapas: favoráveis dão segurança, discordantes dão a forma tensa."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Quando quem tem Marte tem responsabilidade sobre uma criança, essa posição pode indicar atitude exigente e expectativa de independência precoce."
   }
  ],
  "reforcoPorAngulo": "Quando Marte cai sobre o Imum Coeli de quem tem a casa, a leitura ganha ênfase.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mars in the 4th",
   "pdfPaginaInicio": 113,
   "pdfPaginaFim": 113,
   "hash": "ac6aec86791eaf41"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Marte, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo de relação específica; vira nota de tipo de relação, sem versão separada."
   },
   {
    "categoria": "previsao",
    "motivo": "afirmação probabilística sobre a reação; virou possibilidade com 'pode'."
   }
  ]
 },
 {
  "id": "mars@casa5",
  "planeta": "mars",
  "casa": 5,
  "funcaoIntroduzida": "Quem tem Marte oferece a quem tem a casa um incentivo para criar mais e assumir o comando de uma situação.",
  "campoAtivado": "Criatividade, iniciativa, autoridade, lealdade e atração apaixonada.",
  "facilidades": [
   "O incentivo de quem tem Marte pode estimular quem tem a casa a criar mais e a demonstrar capacidade de assumir o comando.",
   "O vínculo pode funcionar muito bem como companhia.",
   "Quem tem Marte pode valorizar muito as demonstrações de lealdade de quem tem a casa.",
   "Pode haver um vínculo apaixonado entre as duas pessoas."
  ],
  "tensoes": [
   "Quem tem Marte pode pôr à prova o senso de lealdade de quem tem a casa.",
   "Pode haver disputas sobre quem toma a iniciativa ou exerce a autoridade."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "O incentivo a criar mais e a assumir o comando toca autoexpressão e liderança de quem tem a casa."
   },
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "facilidades:2",
     "tensoes:0"
    ],
    "justificativa": "A valorização e o teste da lealdade tratam de dever assumido e permanência do vínculo."
   },
   {
    "categoria": "acao_desejo",
    "sustentadaPor": [
     "tensoes:1",
     "facilidades:3"
    ],
    "justificativa": "A disputa por iniciativa e autoridade e a paixão são ação, desejo e conflito aberto."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:3"
    ],
    "justificativa": "A companhia e o vínculo apaixonado tratam de afeição e atração."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Marte é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [
   "Por si só, esse vínculo não prova afinidade verdadeira."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mars in the 5th",
   "pdfPaginaInicio": 113,
   "pdfPaginaFim": 114,
   "hash": "20ba5ba3899cf1af"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Marte, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "genero",
    "motivo": "restrição a sexos opostos; fica o vínculo apaixonado, sem recorte de gênero."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento sobre a verdade da afinidade; virou limitação, sem 'garantia'."
   }
  ]
 },
 {
  "id": "mars@casa6",
  "planeta": "mars",
  "casa": 6,
  "funcaoIntroduzida": "Quem tem Marte desafia quem tem a casa a mostrar eficiência e conhecimento técnico, e se dispõe a aplicar as próprias habilidades.",
  "campoAtivado": "Trabalho, eficiência, tarefas, serviço e esforço pelo bem-estar alheio.",
  "facilidades": [
   "Quem tem Marte pode oferecer ajuda útil quando há tarefas a fazer.",
   "Quem tem Marte pode manter quem tem a casa ocupada, valorizando o trabalho pelo trabalho e o esforço pelo bem-estar de outros."
  ],
  "tensoes": [
   "Quem tem Marte pode nem sempre aprovar o modo de trabalhar de quem tem a casa.",
   "Quem tem Marte pode se impacientar se a tarefa parecer demorar demais.",
   "Essa atitude pode ser fonte de irritação mútua.",
   "A crítica excessiva de quem tem Marte pode mexer com os nervos de quem tem a casa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:1"
    ],
    "justificativa": "Tratam de tarefas, eficiência, trabalho e ritmo de execução, ou seja, a organização concreta do serviço."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:3"
    ],
    "justificativa": "A desaprovação do modo de fazer e a crítica excessiva são controle sobre o trabalho de quem tem a casa."
   },
   {
    "categoria": "acao_desejo",
    "sustentadaPor": [
     "tensoes:1",
     "tensoes:2"
    ],
    "justificativa": "A impaciência e a irritação mútua são atrito aberto no ritmo do trabalho."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Marte é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também vale quando os aspectos entre os mapas são desfavoráveis."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Quando quem tem Marte é empregado de quem tem a casa, o livro vê posição favorável, com possível falta de iniciativa."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mars in the 6th",
   "pdfPaginaInicio": 114,
   "pdfPaginaFim": 114,
   "hash": "4311644df5960228"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Marte, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo de relação específica; vira nota de tipo de relação, sem versão separada."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento de valor sobre a posição; fica só a nota de relação."
   }
  ]
 },
 {
  "id": "mars@casa7",
  "planeta": "mars",
  "casa": 7,
  "funcaoIntroduzida": "Quem tem Marte age de modo a testar a cooperação de quem tem a casa e seu jeito de lidar com o dá e recebe da parceria.",
  "campoAtivado": "Parceria, cooperação, reconhecimento mútuo de qualidades e atrito.",
  "facilidades": [
   "Quem tem a casa pode perceber em quem tem Marte qualidades que acredita não ter e sentir que colaborar fortalece a própria posição.",
   "Quem tem Marte pode reconhecer qualidades de quem tem a casa que complementam as suas.",
   "Esse reconhecimento mútuo pode sustentar uma parceria muito eficaz, se os aspectos entre os mapas forem favoráveis.",
   "Quando as duas pessoas gostam de discutir, o atrito pode não trazer grande dano.",
   "Pode haver algum grau de atração física."
  ],
  "tensoes": [
   "A relação pode sofrer atrito quando as facetas irritantes de quem tem Marte ficam mais evidentes.",
   "Quem tem Marte pode esperar que quem tem a casa se envolva em suas próprias disputas e brigas.",
   "Desacordos podem surgir sem motivo aparente.",
   "Com aflições severas de Marte, quem tem a casa pode sofrer, em mente e talvez em corpo, com a hostilidade de quem tem Marte."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "acao_desejo",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:1",
     "tensoes:2",
     "facilidades:3",
     "facilidades:4"
    ],
    "justificativa": "Tratam de atrito, disputa, desacordo e atração, ou seja, conflito aberto e desejo."
   },
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "facilidades:2",
     "facilidades:0"
    ],
    "justificativa": "A parceria eficaz e a colaboração que fortalece a posição tratam de permanência do vínculo."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1"
    ],
    "justificativa": "Tratam de reconhecer o valor das qualidades da outra pessoa e de fortalecer a própria posição."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:4"
    ],
    "justificativa": "A atração física é um tipo de atração entre as duas pessoas."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:3"
    ],
    "justificativa": "Com aflições severas, o sofrimento pela hostilidade de quem tem Marte mostra contenção e dano a quem tem a casa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Marte é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A parceria eficaz depende de aspectos favoráveis entre os mapas dirigidos a Marte."
   }
  ],
  "reforcoPorAngulo": "Quando Marte cai sobre o Descendente de quem tem a casa, a leitura ganha ênfase.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mars in the 7th",
   "pdfPaginaInicio": 114,
   "pdfPaginaFim": 114,
   "hash": "1acdebecd29003b9"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; descartado."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de casamento; descartada."
   },
   {
    "categoria": "genero",
    "motivo": "restrição a sexos opostos; fica a atração, sem recorte de gênero."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento moral sobre a pessoa; ficou a hostilidade como dinâmica descritiva."
   }
  ]
 },
 {
  "id": "mars@casa8",
  "planeta": "mars",
  "casa": 8,
  "funcaoIntroduzida": "Quem tem Marte pode tornar quem tem a casa ciente de motivações subconscientes que normalmente operam fora do seu conhecimento.",
  "campoAtivado": "Motivações profundas, sondagem psicológica, mudança profunda e atração.",
  "facilidades": [
   "Nesse processo, quem tem a casa pode abandonar algumas ideias preconcebidas.",
   "Um comentário penetrante de quem tem Marte pode tocar o subconsciente de quem tem a casa e levar a mudanças profundas, até uma transformação.",
   "Pode haver forte atração sexual entre as duas pessoas."
  ],
  "tensoes": [
   "Quem tem Marte pode sondar as motivações subconscientes de quem tem a casa mais fundo que a maioria, e essa sondagem pode ser incômoda.",
   "A relação pode não florescer até quem tem Marte ter mais certeza das razões reais por trás das ações de quem tem a casa.",
   "O modo de quem tem Marte conhecer mais a fundo quem tem a casa pode ser desagradável para essa pessoa.",
   "Com fortes aspectos cruzados a Marte, a relação pode não avançar."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:0"
    ],
    "justificativa": "Tratam de sondagem profunda, abandono de ideias e mudança profunda a partir de um comentário penetrante."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:2",
     "tensoes:2"
    ],
    "justificativa": "A atração sexual e o desagrado com o método de conhecer o outro tratam de intimidade."
   },
   {
    "categoria": "acao_desejo",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "A atração sexual intensa é desejo entre as duas pessoas."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:2"
    ],
    "justificativa": "O incômodo da sondagem e o desagrado tocam a sensibilidade de quem tem a casa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Marte é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também depende de fortes aspectos cruzados a Marte vindos do mapa de quem tem a casa."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [
   "Por si só, a forte atração sexual não indica necessariamente uma relação de amor verdadeiro."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mars in the 8th",
   "pdfPaginaInicio": 114,
   "pdfPaginaFim": 115,
   "hash": "dba8d3415d25bb8b"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Marte, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "genero",
    "motivo": "restrição a sexos opostos; fica a atração, sem recorte de gênero."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento sobre a verdade do amor; virou limitação."
   }
  ]
 },
 {
  "id": "mars@casa9",
  "planeta": "mars",
  "casa": 9,
  "funcaoIntroduzida": "Quem tem Marte estimula o pensamento de quem tem a casa e desafia sua visão de vida.",
  "campoAtivado": "Visão de vida, troca franca de opiniões, argumentos e viagens.",
  "facilidades": [
   "Quem tem a casa pode perceber a necessidade de esclarecer as ideias e dar mais força aos argumentos.",
   "Quem tem Marte pode querer saber o que quem tem a casa pensa sobre assuntos que o interessam e usar essa pessoa como caixa de ressonância.",
   "Mesmo ao pedir opinião, quem tem Marte pode estar apenas comparando o conselho com o que já decidira.",
   "Quem tem Marte pode esperar que quem tem a casa tenha opiniões claras sobre vários assuntos e tratar essa pessoa como enciclopédia.",
   "O vínculo favorece a troca franca de opiniões."
  ],
  "tensoes": [
   "Se as filosofias de vida forem muito divergentes, a comunicação verdadeira pode se tornar impossível.",
   "Quem tem Marte pode acelerar os preparativos de viagem de quem tem a casa ou impor a essa pessoa a necessidade de viajar mais que o usual."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2",
     "facilidades:3",
     "facilidades:4",
     "tensoes:0"
    ],
    "justificativa": "Tratam de troca de opiniões, escuta, conselho e comunicação que pode se tornar impossível."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "Esclarecer as próprias ideias e dar força aos argumentos toca a autoexpressão de quem tem a casa."
   },
   {
    "categoria": "acao_desejo",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:3"
    ],
    "justificativa": "O uso do outro como caixa de ressonância e a expectativa de opiniões firmes têm tom de disputa de argumentos."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "Medir o conselho contra o que já foi decidido mostra limite à influência do outro."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Marte é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A comunicação verdadeira se perde quando os aspectos entre os mapas são discordantes."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mars in the 9th",
   "pdfPaginaInicio": 115,
   "pdfPaginaFim": 115,
   "hash": "a7631de6f2c7fb11"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Marte, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "mars@casa10",
  "planeta": "mars",
  "casa": 10,
  "funcaoIntroduzida": "Quem tem Marte desafia quem tem a casa a mostrar que merece a própria reputação e, com isso, a alcançar alto nível de desempenho.",
  "campoAtivado": "Carreira, reputação, realização, rivalidade e apoio ao sucesso.",
  "facilidades": [
   "Quem tem Marte pode oferecer estímulo constante à realização e esperar esforços intensos de quem tem a casa para atingir seus objetivos.",
   "Quem tem Marte pode dar apoio enérgico se perceber que quem tem a casa fará esforço recíproco para ter sucesso.",
   "Quem tem Marte pode se congratular por ter incentivado quem tem a casa, se a reputação dessa pessoa crescer depois.",
   "Quem tem Marte pode fazer sugestões sobre o emprego mais adequado para quem tem a casa."
  ],
  "tensoes": [
   "Pode haver rivalidade e até antagonismo entre as duas pessoas.",
   "Esse antagonismo pode, ainda assim, estimular quem tem a casa a se esforçar mais.",
   "Quem tem Marte pode buscar prestígio à custa de quem tem a casa.",
   "Em casos extremos, quem tem Marte pode tentar prejudicar deliberadamente a reputação de quem tem a casa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2",
     "tensoes:2",
     "tensoes:3"
    ],
    "justificativa": "Tratam de reputação, realização, reconhecimento do valor do outro e prestígio disputado."
   },
   {
    "categoria": "acao_desejo",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:1",
     "tensoes:2",
     "facilidades:1"
    ],
    "justificativa": "Rivalidade, antagonismo e busca de prestígio são competição e conflito aberto."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:3",
     "facilidades:0"
    ],
    "justificativa": "As sugestões de ocupação e o estímulo à realização tratam de carreira e trabalho."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:3"
    ],
    "justificativa": "A tentativa de prejudicar a reputação é restrição imposta a quem tem a casa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Marte é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também vale quando os aspectos entre os mapas são difíceis."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Quando quem tem Marte é empregador de quem tem a casa, pode ser exigente, mas tende a recompensar a realização, salvo aspectos discordantes."
   }
  ],
  "reforcoPorAngulo": "Quando Marte cai sobre o Meio do Céu de quem tem a casa, a leitura ganha ênfase.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mars in the 10th",
   "pdfPaginaInicio": 115,
   "pdfPaginaFim": 115,
   "hash": "49e420cd3936c490"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel parental e de gênero; descartado."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "exaltação do planeta é dignidade, técnica fora do que o motor calcula."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Marte, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo de relação específica; vira nota de tipo de relação, sem versão separada."
   }
  ]
 },
 {
  "id": "mars@casa11",
  "planeta": "mars",
  "casa": 11,
  "funcaoIntroduzida": "Quem tem Marte pode encorajar quem tem a casa a dar passos práticos para realizar seus sonhos.",
  "campoAtivado": "Amizade, aspirações, esperança e apoio entre amigos.",
  "facilidades": [
   "Quem tem Marte pode ir além do esperado para buscar a amizade de quem tem a casa.",
   "Os anseios de quem tem a casa podem acender o entusiasmo de quem tem Marte, o que dá a quem tem a casa mais esperança de realizá-los."
  ],
  "tensoes": [
   "Quem tem a casa pode dedicar tempo e esforço a resolver os problemas de quem tem Marte, como gesto de amizade.",
   "Quem tem a casa pode se preocupar com quem tem Marte diante de problemas de saúde ou de circunstâncias difíceis.",
   "Quem tem Marte pode frustrar uma das aspirações mais caras de quem tem a casa.",
   "O contato pode render pouco, quando os aspectos entre os mapas são discordantes."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:0",
     "tensoes:0",
     "tensoes:1"
    ],
    "justificativa": "Tratam de busca de amizade, cuidado e preocupação entre as duas pessoas."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "Aspirações que acendem entusiasmo e esperança são encorajamento e otimismo."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "A preocupação com o outro diante de dificuldades toca a sensibilidade e a empatia."
   },
   {
    "categoria": "acao_desejo",
    "sustentadaPor": [
     "tensoes:2"
    ],
    "justificativa": "A frustração de uma aspiração por quem tem Marte aparece como disputa velada."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "As formas que pesam sobre quem tem a casa valem quando Marte é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A frustração de aspirações e o contato que rende pouco dependem de aspectos discordantes entre os mapas."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mars in the 11th",
   "pdfPaginaInicio": 115,
   "pdfPaginaFim": 115,
   "hash": "bb16fee4bccdb728"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Marte, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "diagnostico",
    "motivo": "referência a problemas de saúde; mantida como circunstância difícil, sem diagnóstico."
   }
  ]
 },
 {
  "id": "mars@casa12",
  "planeta": "mars",
  "casa": 12,
  "funcaoIntroduzida": "Quem tem Marte pode descobrir o ponto fraco de quem tem a casa e usar o que descobre em benefício próprio.",
  "campoAtivado": "Pontos fracos, vulnerabilidade, honestidade consigo e proteção.",
  "facilidades": [
   "Experiências desse contato podem levar quem tem a casa a se avaliar com mais eficácia, com total honestidade, e a cultivar um trato direto com os outros.",
   "Com Marte bem aspectado e aspectos harmoniosos, quem tem Marte pode ajudar a trabalhar e fortalecer pontos fracos, protegendo quem tem a casa até que consiga se defender com mais eficácia."
  ],
  "tensoes": [
   "Quem tem Marte pode saber como explorar fraquezas psicológicas de quem tem a casa para abalar essa pessoa.",
   "Tentar encobrir fraquezas pode parecer falta de sinceridade a quem tem Marte.",
   "A relação pode ficar muito crítica entre as duas pessoas."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "A reavaliação de si e a franqueza ganham força a partir da experiência intensa do contato."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1"
    ],
    "justificativa": "Tratam de se avaliar, de ser honesto consigo e de reunir autossuficiência própria."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "tensoes:0",
     "facilidades:1"
    ],
    "justificativa": "A exploração de fraquezas e a proteção em áreas vulneráveis tocam a sensibilidade de quem tem a casa."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "Ter de encobrir fraquezas diante do outro é contenção da própria expressão."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma de apoio vale com Marte bem aspectado no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa vale quando os aspectos a Marte não são preponderantemente favoráveis; a de apoio, quando são harmoniosos."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Mars in the 12th",
   "pdfPaginaInicio": 116,
   "pdfPaginaFim": 116,
   "hash": "de5736e50da7a33a"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Marte, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel de protetor de gênero; ficou apenas a proteção descrita."
   }
  ]
 },
 {
  "id": "jupiter@casa1",
  "planeta": "jupiter",
  "casa": 1,
  "funcaoIntroduzida": "Quem tem Júpiter dedica a quem tem a casa um interesse benevolente, que pode levar a uma amizade gratificante.",
  "campoAtivado": "Apresentação pessoal, amizade, tolerância, conselho e ajuda.",
  "facilidades": [
   "Quem tem a casa pode receber favores de quem tem Júpiter.",
   "Estar com quem tem Júpiter pode deixar quem tem a casa bem-disposta e completamente à vontade.",
   "As duas pessoas podem descobrir aspirações comuns e respeito pelas qualidades uma da outra.",
   "Quem tem a casa pode dar a quem tem Júpiter uma saída para seus instintos altruístas.",
   "Quem tem Júpiter tende a fazer concessões se quem tem a casa ficar aquém dos padrões esperados.",
   "Quem tem Júpiter pode dar conselho e ajuda com prazer, quando está em condição de fazê-lo."
  ],
  "tensoes": [
   "O conselho de quem tem Júpiter pode enganar quem tem a casa ou ser mal entendido por essa pessoa."
  ],
  "excessosPossiveis": [
   "Quem tem a casa pode abusar da generosidade e da tolerância de quem tem Júpiter.",
   "Quem tem a casa pode se descuidar, contando que quem tem Júpiter corrija seus erros.",
   "Quem tem Júpiter pode incentivar gastos além dos recursos ou excessos de indulgência."
  ],
  "dimensoes": [
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:4"
    ],
    "justificativa": "Tratam de favores, companhia à vontade e concessões entre as duas pessoas, ou seja, afeição e confiança."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:5",
     "excessosPossiveis:0",
     "excessosPossiveis:2"
    ],
    "justificativa": "Generosidade, ajuda e estímulo a gastar e a se indulgenciar tratam de ampliação e excesso."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:2",
     "facilidades:3"
    ],
    "justificativa": "Respeito mútuo pelas qualidades de cada um e saída para o altruísmo tocam o reconhecimento do valor do outro."
   },
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:5",
     "tensoes:0"
    ],
    "justificativa": "O conselho que ajuda ou engana e é mal entendido trata de troca e compreensão entre as duas pessoas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "As formas de excesso e de conselho enganoso valem quando Júpiter é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "As formas de excesso também dependem de aspectos discordantes entre os mapas dirigidos a Júpiter."
   }
  ],
  "reforcoPorAngulo": "Quando Júpiter cai sobre o Ascendente de quem tem a casa, a leitura ganha ênfase.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Jupiter in the 1st House",
   "pdfPaginaInicio": 116,
   "pdfPaginaFim": 116,
   "hash": "60ac4bd1e1005dcd"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Júpiter, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; ficou só o abuso como possibilidade."
   }
  ]
 },
 {
  "id": "jupiter@casa2",
  "planeta": "jupiter",
  "casa": 2,
  "funcaoIntroduzida": "Quem tem Júpiter pode oferecer ajuda material ou conselho que ampliem os recursos materiais de quem tem a casa.",
  "campoAtivado": "Recursos materiais, senso de valores, ajuda financeira e empréstimo.",
  "facilidades": [
   "Quem tem Júpiter pode ajudar quem tem a casa a cultivar um senso de valores mais realista.",
   "Se quem tem a casa precisar de auxílio financeiro, quem tem Júpiter pode ajudar com prazer.",
   "Quem tem a casa também pode emprestar dinheiro a quem tem Júpiter sem risco."
  ],
  "tensoes": [
   "O conselho de quem tem Júpiter pode ser mal fundamentado."
  ],
  "excessosPossiveis": [
   "Quem tem Júpiter pode encorajar quem tem a casa a gastar sem prudência."
  ],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2",
     "excessosPossiveis:0"
    ],
    "justificativa": "Tratam de dinheiro, ajuda material, empréstimo e gasto, ou seja, recursos concretos."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "excessosPossiveis:0",
     "facilidades:1"
    ],
    "justificativa": "A ajuda generosa e o estímulo a gastar sem prudência tratam de ampliação e excesso."
   },
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "tensoes:0"
    ],
    "justificativa": "O conselho mal fundamentado trata da troca de orientação entre as duas pessoas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Júpiter é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também depende de aspectos discordantes entre os mapas, e o empréstimo sem risco, de aspectos que não sejam discordantes."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Entre corretor ou banqueiro e cliente, o livro vê posição favorável para o Júpiter do profissional, se razoavelmente livre de aflição."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Jupiter in the 2nd",
   "pdfPaginaInicio": 116,
   "pdfPaginaFim": 117,
   "hash": "230e1b7455b7180c"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Júpiter, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo de relação específica; vira nota de tipo de relação, sem versão separada."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento de valor; virou 'posição favorável' na nota de relação."
   }
  ]
 },
 {
  "id": "jupiter@casa3",
  "planeta": "jupiter",
  "casa": 3,
  "funcaoIntroduzida": "Quem tem Júpiter é fácil de conversar, e a conversa pode ocupar bastante do tempo de quem tem a casa.",
  "campoAtivado": "Conversa, conhecimento do dia a dia, informação e experiência.",
  "facilidades": [
   "Com Júpiter bem aspectado e aspectos favoráveis, quem tem Júpiter pode querer ajudar quem tem a casa a ampliar seu conhecimento cotidiano.",
   "Quem tem Júpiter pode transmitir bastante informação útil a quem tem a casa.",
   "Quem tem Júpiter se dispõe a recorrer à própria experiência."
  ],
  "tensoes": [
   "Pode haver dificuldade se quem tem a casa não reconhece que quem tem Júpiter está distorcendo o senso de proporção.",
   "Mesmo com Júpiter bem aspectado, quem tem Júpiter pode dizer o que acha que agrada a quem tem a casa, em vez do que de fato é o caso."
  ],
  "excessosPossiveis": [
   "Quem tem Júpiter pode se gabar, exagerar ou até blefar quando não está seguro dos fatos."
  ],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2",
     "excessosPossiveis:0",
     "tensoes:0",
     "tensoes:1"
    ],
    "justificativa": "Tratam de conversa, informação, exagero e dizer o que agrada, ou seja, linguagem e compreensão."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0",
     "excessosPossiveis:0"
    ],
    "justificativa": "Ampliar o conhecimento e exagerar fatos tratam de crescimento e excesso."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "As formas de excesso e de distorção valem quando Júpiter é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma de ajuda depende de aspectos favoráveis entre os mapas e a de distorção, de aspectos discordantes."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Entre professor e aluno, quando a casa é do aluno, o livro vê ligação favorável, salvo Júpiter muito afligido."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Jupiter in the 3rd",
   "pdfPaginaInicio": 117,
   "pdfPaginaFim": 117,
   "hash": "80e4d1cfbeae5e6e"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Júpiter, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo de relação específica; vira nota de tipo de relação, sem versão separada."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; ficou só a possibilidade de dizer o que agrada."
   }
  ]
 },
 {
  "id": "jupiter@casa4",
  "planeta": "jupiter",
  "casa": 4,
  "funcaoIntroduzida": "Quem tem Júpiter pode fazer quem tem a casa se sentir em casa onde estiver e saber por instinto como deixar essa pessoa à vontade.",
  "campoAtivado": "Lar, sentir-se acolhido, memória, talentos latentes e individualidade.",
  "facilidades": [
   "Quem tem Júpiter pode saber por instinto como deixar quem tem a casa à vontade, onde quer que esteja.",
   "Quem tem Júpiter pode assumir com naturalidade uma atitude parental diante de quem tem a casa.",
   "Quem tem Júpiter pode despertar em quem tem a casa memórias fortes do passado, e com isso quem tem a casa pode descobrir talentos latentes.",
   "Salvo fortes aflições de Júpiter, quem tem Júpiter pode nutrir esses talentos e ajudar a individualidade de quem tem a casa a se desdobrar.",
   "Quem tem Júpiter pode ajudar no ambiente doméstico, com melhorias e talvez aumentando o valor do imóvel."
  ],
  "tensoes": [],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2"
    ],
    "justificativa": "Tratam de acolhimento, instinto, atitude parental e memórias, ou seja, segurança afetiva e sentimento."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:2",
     "facilidades:3"
    ],
    "justificativa": "Descobrir e nutrir talentos latentes e a individualidade toca o senso de si de quem tem a casa."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:4"
    ],
    "justificativa": "As melhorias no ambiente doméstico e o valor do imóvel tratam de casa e organização concreta."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:3",
     "facilidades:4"
    ],
    "justificativa": "Nutrir talentos e aumentar o valor do imóvel tratam de crescimento e ampliação."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A leitura vale com Júpiter sem fortes aflições no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "O livro vê ligação favorável em relações de cuidado e de serviço, como responsável e criança e construtor e cliente, se a maioria dos aspectos a Júpiter for favorável."
   }
  ],
  "reforcoPorAngulo": "Quando Júpiter cai sobre o Imum Coeli de quem tem a casa, a leitura ganha ênfase.",
  "limitacoes": [
   "O livro não descreve tensões para esta casa, só a ressalva de que a leitura depende de Júpiter sem fortes aflições."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Jupiter in the 4th",
   "pdfPaginaInicio": 117,
   "pdfPaginaFim": 117,
   "hash": "375121def1733daf"
  },
  "condicoesPorItem": {
   "facilidades[3]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Júpiter, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo de relação específica; vira nota de tipo de relação, sem versão separada."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento de valor sobre a relação; virou 'ligação favorável' na nota de relação."
   }
  ]
 },
 {
  "id": "jupiter@casa5",
  "planeta": "jupiter",
  "casa": 5,
  "funcaoIntroduzida": "Quem tem Júpiter quer facilitar o uso das faculdades criativas de quem tem a casa e apoiar a busca de meios de autoexpressão.",
  "campoAtivado": "Criatividade, prazer, lazer, artes, passatempos e afeto.",
  "facilidades": [
   "Quem tem Júpiter pode facilitar o uso das faculdades criativas de quem tem a casa e a descoberta de meios eficazes de autoexpressão.",
   "Quem tem Júpiter pode dar prazer a quem tem a casa e oferecer oportunidades que talvez não existiriam, valorizando em troca seu apoio e sua opinião.",
   "Quem tem a casa pode sentir prazer na companhia de quem tem Júpiter, sobretudo em eventos sociais e locais de diversão.",
   "O vínculo pode crescer por interesse comum em teatro, artes ou algum passatempo agradável.",
   "Quem tem Júpiter pode ter disposição benevolente com os filhos de quem tem a casa.",
   "Pode haver uma amizade romântica, com muito afeto mútuo."
  ],
  "tensoes": [
   "A relação pode ser menos cordial."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "A facilitação da criatividade e dos meios de autoexpressão toca o senso de si de quem tem a casa."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2",
     "facilidades:5",
     "tensoes:0"
    ],
    "justificativa": "Prazer na companhia, afeto mútuo e relação menos cordial tratam de afeição entre as duas pessoas."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:4"
    ],
    "justificativa": "Oferecer oportunidades e benevolência com os filhos tratam de generosidade."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma menos cordial vale quando Júpiter é mal aspectado no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma menos cordial também depende de aspectos mormente discordantes entre os mapas dirigidos a Júpiter."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Jupiter in the 5th",
   "pdfPaginaInicio": 117,
   "pdfPaginaFim": 117,
   "hash": "22d2954720c2891d"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de augúrio para a parceria; descartada."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel de tio, gendrado e social; descartado."
   },
   {
    "categoria": "genero",
    "motivo": "restrição a sexos opostos; fica a amizade romântica, sem recorte de gênero."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Júpiter, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "jupiter@casa6",
  "planeta": "jupiter",
  "casa": 6,
  "funcaoIntroduzida": "Quem tem Júpiter pode prestar serviço valioso a quem tem a casa e ter prazer nisso.",
  "campoAtivado": "Trabalho, serviço, rotina, técnicas e bem-estar.",
  "facilidades": [
   "Quem tem Júpiter pode transmitir um saber técnico que complementa e amplia o de quem tem a casa.",
   "Quem tem Júpiter pode apresentar técnicas novas que facilitam as tarefas de rotina de quem tem a casa.",
   "Quem tem Júpiter tende a se interessar pelo bem-estar de quem tem a casa.",
   "Quem tem Júpiter pode aceitar que quem tem a casa assuma posição sênior, e esta pode reconhecer alguma obrigação de zelar pelos interesses daquele."
  ],
  "tensoes": [],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1"
    ],
    "justificativa": "Tratam de técnicas, tarefas de rotina e serviço, ou seja, trabalho e organização concreta."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "O interesse pelo bem-estar do outro trata de cuidado e carinho entre as duas pessoas."
   },
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "facilidades:3"
    ],
    "justificativa": "A posição sênior aceita e a obrigação de zelar pelos interesses tratam de dever assumido."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "O saber que amplia o de quem tem a casa trata de crescimento."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "tipo_de_relacao",
    "nota": "Entre paciente e responsáveis pelos cuidados médicos, quando a casa é do paciente, o livro vê ligação útil."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Quando quem tem Júpiter é empregado de quem tem a casa, o livro aponta apoio leal e sem reservas, salvo Júpiter muito afligido e aspectos discordantes."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [
   "O livro não descreve tensões para esta casa, só a ressalva ligada ao Júpiter muito afligido na relação de emprego."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Jupiter in the 6th",
   "pdfPaginaInicio": 118,
   "pdfPaginaFim": 118,
   "hash": "d2e97243c851a2b8"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo de relação específica; vira nota de tipo de relação, sem versão separada."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Júpiter, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "jupiter@casa7",
  "planeta": "jupiter",
  "casa": 7,
  "funcaoIntroduzida": "Quem tem Júpiter pode pôr quem tem a casa em contato com pessoas influentes e ampliar seu círculo social, num clima de cooperação.",
  "campoAtivado": "Parceria, cooperação, contatos, círculo social e reputação.",
  "facilidades": [
   "A parceria pode ser muito cooperativa.",
   "Quem tem Júpiter pode ter prazer especial em trabalhar junto com quem tem a casa.",
   "Quem tem Júpiter pode pôr quem tem a casa em contato com pessoas influentes e ampliar seu círculo social.",
   "Com Júpiter bem aspectado, quem tem Júpiter pode ter interesse especial em tornar a reputação de quem tem a casa conhecida em área mais ampla."
  ],
  "tensoes": [
   "Quem tem Júpiter pode fazer promessas que não consegue cumprir ou agir de modo desleal."
  ],
  "excessosPossiveis": [
   "Uma opinião exagerada de quem tem Júpiter sobre quem tem a casa pode se voltar contra essa pessoa ou fazer essa pessoa tentar mais do que consegue."
  ],
  "dimensoes": [
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:0"
    ],
    "justificativa": "Parceria cooperativa, trabalho conjunto e promessas não cumpridas tratam de lealdade e permanência."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:2",
     "facilidades:3",
     "excessosPossiveis:0"
    ],
    "justificativa": "Ampliar o círculo social, divulgar a reputação e exagerar a opinião tratam de ampliação e excesso."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:3",
     "excessosPossiveis:0"
    ],
    "justificativa": "A reputação de quem tem a casa e a opinião exagerada sobre ela tocam o valor reconhecido do outro."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Júpiter é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também depende de aspectos discordantes entre os mapas, e a parceria cooperativa, de Júpiter sem forte aflição."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Entre assessor de imprensa e cliente, o livro vê ligação útil quando o Júpiter é do assessor."
   }
  ],
  "reforcoPorAngulo": "Quando Júpiter cai sobre o Descendente de quem tem a casa, a leitura ganha ênfase.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Jupiter in the 7th",
   "pdfPaginaInicio": 118,
   "pdfPaginaFim": 118,
   "hash": "a219e1bc84aa47eb"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Júpiter, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "previsao",
    "motivo": "constatação sobre casais; descartada como previsão sobre o tipo de vínculo."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo de relação específica; vira nota de tipo de relação, sem versão separada."
   }
  ]
 },
 {
  "id": "jupiter@casa8",
  "planeta": "jupiter",
  "casa": 8,
  "funcaoIntroduzida": "Quem tem Júpiter pode tornar quem tem a casa ciente de uma faceta antes negligenciada de si, que pode ter funcionado como ponto forte ou fraco.",
  "campoAtivado": "Faceta negligenciada de si, transformação, atração e transações financeiras.",
  "facilidades": [
   "Quem tem a casa pode se concentrar em realçar e enriquecer algum atributo especial.",
   "Quem tem a casa pode tentar transformar um defeito, eliminando-o como fator de peso e convertendo-o em fonte de proveito.",
   "Quem tem Júpiter costuma ter em mente o interesse de quem tem a casa.",
   "Pode haver considerável atração física e apreciação instintiva das qualidades uma da outra, base sobre a qual uma relação sólida pode se construir.",
   "Com Júpiter bem sustentado e aspectos harmoniosos, as transações financeiras entre as duas pessoas costumam correr sem problemas, cada uma agindo com lealdade."
  ],
  "tensoes": [
   "Quem tem Júpiter pode ter interesse no dinheiro de quem tem a casa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1"
    ],
    "justificativa": "Tratam de realçar atributos e de transformar um defeito, ou seja, mudança profunda de si."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1"
    ],
    "justificativa": "Realçar um atributo próprio e transformar um defeito tocam o senso de si de quem tem a casa."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:3",
     "facilidades:2"
    ],
    "justificativa": "A atração, a apreciação mútua e o interesse pelo outro tratam de afeição e atração."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:4",
     "tensoes:0"
    ],
    "justificativa": "As transações financeiras e o interesse no dinheiro do outro tratam de recursos concretos."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Júpiter é muito afligido, e a das transações sem problemas, quando é bem sustentado no mapa natal; essas condições não são calculadas nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "As transações sem problemas dependem de aspectos mormente harmoniosos entre os mapas."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Para o Júpiter de banqueiro ou de quem cuida das transações financeiras da pessoa com a casa, o livro vê posição favorável se razoavelmente bem aspectado."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Jupiter in the 8th",
   "pdfPaginaInicio": 118,
   "pdfPaginaFim": 118,
   "hash": "b389df821a5452cd"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Júpiter, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de casamento; descartada, ficou só o interesse no dinheiro."
   },
   {
    "categoria": "genero",
    "motivo": "restrição a sexos opostos; fica a atração, sem recorte de gênero."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo de relação específica; vira nota de tipo de relação, sem versão separada."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento de valor sobre o defeito; virou 'fator de peso'."
   }
  ]
 },
 {
  "id": "jupiter@casa9",
  "planeta": "jupiter",
  "casa": 9,
  "funcaoIntroduzida": "Quem tem Júpiter pode apresentar a quem tem a casa um leque mais amplo de ensinamentos filosóficos e religiosos e dar mais compreensão de problemas abstratos.",
  "campoAtivado": "Filosofia, religião, ensino, publicação, viagens e horizontes.",
  "facilidades": [
   "Quem tem Júpiter se dispõe a recorrer à própria experiência e ao próprio conhecimento para ampliar a compreensão de quem tem a casa.",
   "Quem tem Júpiter pode estimular as ideias de quem tem a casa sobre vários assuntos e ajudar a ampliar seus horizontes.",
   "Quem tem a casa tende a valorizar a opinião de quem tem Júpiter e a confiar-lhe confidências.",
   "O vínculo pode simbolizar uma relação feliz baseada em confiança mútua.",
   "Quem tem Júpiter pode ajudar nas viagens de quem tem a casa, despertar interesse por países estrangeiros e às vezes oferecer transporte."
  ],
  "tensoes": [],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2"
    ],
    "justificativa": "Tratam de transmitir conhecimento, estimular ideias e confiar confidências, ou seja, troca e compreensão."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:4"
    ],
    "justificativa": "Ampliar a compreensão, os horizontes e as viagens tratam de crescimento e ampliação."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:2",
     "facilidades:3"
    ],
    "justificativa": "A confiança mútua e as confidências tratam de intimidade e confiança íntima."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A relação baseada em confiança vale a menos que Júpiter seja muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A relação baseada em confiança também depende de aspectos que não sejam discordantes entre os mapas."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Entre professor e aluno, quando a casa é do aluno, e entre mestre e discípulo, o livro vê ligação favorável; quem tem Júpiter pode enxergar a direção do desenvolvimento do outro."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [
   "O livro não descreve tensões para esta casa, só a ressalva de que a relação confiante depende de Júpiter sem forte aflição."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Jupiter in the 9th",
   "pdfPaginaInicio": 118,
   "pdfPaginaFim": 119,
   "hash": "bbeaa095cf34fbba"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Júpiter, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo de relação específica; vira nota de tipo de relação, sem versão separada."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo de relação editorial; fora do escopo operacional."
   }
  ]
 },
 {
  "id": "jupiter@casa10",
  "planeta": "jupiter",
  "casa": 10,
  "funcaoIntroduzida": "Quem tem Júpiter pode contribuir para o status de quem tem a casa, apresentando pessoas influentes ou orientando com base em experiência profissional.",
  "campoAtivado": "Carreira, status, reputação, ambição e metas.",
  "facilidades": [
   "Quem tem Júpiter pode despertar em quem tem a casa o gosto pelo sucesso e, com sua opinião favorável, dar incentivo extra para ter sucesso.",
   "Quem tem Júpiter pode ajudar quem tem a casa a alcançar metas e realizar todo o seu potencial, porque valoriza os objetivos dessa pessoa.",
   "Quem tem Júpiter pode fortalecer a crença de quem tem a casa em si e incentivar a realizar ambições aplicando os esforços com sabedoria."
  ],
  "tensoes": [
   "Quem tem Júpiter pode enfraquecer a decisão de quem tem a casa ao tornar o caminho fácil demais.",
   "Quem tem Júpiter pode atrapalhar o progresso de quem tem a casa com conselhos inadequados."
  ],
  "excessosPossiveis": [
   "Quem tem Júpiter pode levar quem tem a casa a mirar mais alto do que consegue."
  ],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2"
    ],
    "justificativa": "Tratam de status, carreira e aplicação dos esforços, ou seja, trabalho e organização concreta."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2",
     "tensoes:0"
    ],
    "justificativa": "Gosto pelo sucesso, crença em si e decisão tocam o senso de si e o valor reconhecido."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:1",
     "excessosPossiveis:0"
    ],
    "justificativa": "Alcançar metas e mirar além da capacidade tratam de ampliação e excesso."
   },
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "Conselhos inadequados tratam da orientação trocada entre as duas pessoas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Júpiter é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também depende de aspectos discordantes entre os mapas dirigidos a Júpiter."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Quando quem tem Júpiter tem responsabilidade ou chefia sobre quem tem a casa, o livro aponta reconhecimento adequado aos esforços."
   }
  ],
  "reforcoPorAngulo": "Quando Júpiter cai sobre o Meio do Céu de quem tem a casa, a leitura ganha ênfase.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Jupiter in the 10th",
   "pdfPaginaInicio": 119,
   "pdfPaginaFim": 119,
   "hash": "53905076e9c7e528"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel parental e de gênero; descartado."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Júpiter, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo de relação específica; vira nota de tipo de relação, sem versão separada."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento de valor; mantida só a ajuda por conselho e experiência."
   }
  ]
 },
 {
  "id": "jupiter@casa11",
  "planeta": "jupiter",
  "casa": 11,
  "funcaoIntroduzida": "Quem tem Júpiter pode ajudar quem tem a casa a ampliar o círculo de amigos e a vida social.",
  "campoAtivado": "Amizade, grupos de afins, ideais e vida social.",
  "facilidades": [
   "Pode se desenvolver uma amizade muito gratificante entre as duas pessoas.",
   "Quem tem Júpiter pode apresentar quem tem a casa a um grupo de afins que trabalha por um fim específico.",
   "Quem tem Júpiter tende a apreciar os ideais de quem tem a casa e pode ajudar a realizá-los.",
   "Quem tem Júpiter pode ser amigo no sentido mais pleno, fazendo concessões a lapsos passageiros de quem tem a casa.",
   "Quem tem Júpiter dá valor especial à amizade de quem tem a casa."
  ],
  "tensoes": [],
  "excessosPossiveis": [
   "Quem tem a casa pode abusar da generosidade de quem tem Júpiter e tratá-la como algo dado.",
   "Indulgência, otimismo ou autoestima em excesso podem comprometer o conjunto."
  ],
  "dimensoes": [
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:3",
     "facilidades:4"
    ],
    "justificativa": "Amizade gratificante, concessões e valor dado à amizade tratam de afeição entre as duas pessoas."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2",
     "excessosPossiveis:1"
    ],
    "justificativa": "Ampliar a vida social, ajudar a realizar ideais e o excesso de otimismo tratam de ampliação."
   },
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "facilidades:3",
     "excessosPossiveis:0"
    ],
    "justificativa": "As concessões a lapsos e o risco de tomar a generosidade por dada tratam de lealdade e permanência."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma menos favorável vale quando Júpiter é debilitado no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma menos favorável também depende de aspectos discordantes entre os mapas dirigidos a Júpiter."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [
   "O livro vê esta posição como favorável para o Júpiter alheio e descreve apenas excessos como ressalva, sem tensões próprias."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Jupiter in the 11th",
   "pdfPaginaInicio": 119,
   "pdfPaginaFim": 119,
   "hash": "cb0235825b858944"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Júpiter, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; ficou só o excesso como possibilidade."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento de valor; virou a ressalva sobre posição favorável."
   }
  ]
 },
 {
  "id": "jupiter@casa12",
  "planeta": "jupiter",
  "casa": 12,
  "funcaoIntroduzida": "Quem tem Júpiter pode ser a pessoa a quem quem tem a casa mais provavelmente recorre em tempos difíceis.",
  "campoAtivado": "Apoio em tempos difíceis, confidências, bastidores e interesse por temas ocultos.",
  "facilidades": [
   "Quem tem Júpiter pode mostrar como lidar com deficiências de caráter ou temperamento que levam a situações desconcertantes.",
   "Quem tem Júpiter pode reforçar a autoconfiança de quem tem a casa, que pode reunir coragem nova para enfrentar problemas que parecem menos formidáveis.",
   "Quem tem Júpiter pode agir nos bastidores para resolver os problemas de quem tem a casa e ajudar a restaurar a confiança em si.",
   "Quem tem Júpiter pode se interessar muito por descobrir o que move quem tem a casa, o que pode estimular confidências.",
   "Quem tem Júpiter pode despertar interesse por ocultismo, misticismo e temas que aprofundam a compreensão do que há por baixo da vida, e pela ideia de que muitas barreiras entre áreas da experiência são ilusórias."
  ],
  "tensoes": [
   "Quem tem Júpiter pode nem sempre guardar as confidências de quem tem a casa, sobretudo com Júpiter afligido e aspectos discordantes.",
   "Havendo vínculo romântico entre as duas pessoas, pode haver risco de escândalo."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:3",
     "tensoes:0"
    ],
    "justificativa": "Tratam de autoconfiança, apoio em tempos difíceis e confidências, ou seja, sensibilidade e segurança afetiva."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2"
    ],
    "justificativa": "Reforçar a autoconfiança e restaurar a fé em si tocam o senso de si."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:4",
     "facilidades:0"
    ],
    "justificativa": "Descobrir temas ocultos e lidar com deficiências tratam de revelação e reavaliação."
   },
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:3",
     "tensoes:0"
    ],
    "justificativa": "As confidências compartilhadas e quebradas tratam da troca entre as duas pessoas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma de indiscrição vale quando Júpiter é afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma de indiscrição também depende de aspectos discordantes entre os mapas dirigidos a Júpiter."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Para o Júpiter de médico ou de quem cuida da pessoa com a casa, o livro vê posição favorável; amigos com Júpiter nela tendem a se mobilizar quando a pessoa está enferma."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Jupiter in the 12th",
   "pdfPaginaInicio": 119,
   "pdfPaginaFim": 120,
   "hash": "90b67623b1f4dcc6"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": true,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura é escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Júpiter, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo de relação específica; vira nota de tipo de relação, sem versão separada."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; ficou só o risco de escândalo."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "exemplo de relação; mantido apenas como nota de tipo de relação."
   }
  ]
 },
 {
  "id": "saturn@casa1",
  "planeta": "saturn",
  "casa": 1,
  "funcaoIntroduzida": "Quem tem Saturno pode valorizar quem tem a casa como fator de estabilidade, e o senso de responsabilidade dessa pessoa pode se desenvolver com mais eficácia.",
  "campoAtivado": "A personalidade de quem tem a casa e o que nela transmite confiança.",
  "facilidades": [
   "Algo na personalidade de quem tem a casa pode convencer quem tem Saturno de que é possível contar com essa pessoa.",
   "Quem tem Saturno pode valorizar quem tem a casa como fator de estabilidade, e o senso de responsabilidade dessa pessoa pode se desenvolver com mais eficácia.",
   "O vínculo pode se mostrar duradouro.",
   "Com Saturno bem aspectado e aspectos favoráveis entre os mapas, quem tem Saturno pode pôr sua experiência a serviço do que mais ajuda quem tem a casa.",
   "Quem tem Saturno pode buscar a essência de quem tem a casa por trás da aparência da personalidade; o processo pode ser penoso, e o resultado, de benefício duradouro.",
   "O vínculo pode trazer a quem tem a casa experiências que não surgiriam por conta própria."
  ],
  "tensoes": [
   "As atitudes de quem tem Saturno podem exigir paciência e resistência de quem tem a casa e sobrecarregá-la de responsabilidades e de atenção.",
   "Quem tem a casa pode sentir que carrega quem tem Saturno e que só de si vem toda a leveza do vínculo.",
   "Sem um elemento de leveza, o vínculo pode ficar sério demais e pesado, e reduzir o prazer da companhia mútua.",
   "Quem tem Saturno pode projetar medos e inibições em quem tem a casa, mostrar-se crítico e reduzir o entusiasmo e o clima entre as duas pessoas.",
   "O vínculo pode vir cercado de dificuldades, como cuidar de quem tem Saturno ou lidar com um problema físico ou revés financeiro, e pedir perseverança e autodisciplina.",
   "Quem tem Saturno pode hesitar em se comprometer, e quem tem a casa pode perder oportunidades por causa disso.",
   "Em algum momento, pode caber a quem tem a casa assumir uma responsabilidade em nome de quem tem Saturno, ou sentir como dever cumprir uma tarefa especial em benefício dessa pessoa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:3"
    ],
    "justificativa": "As exigências sobre a outra pessoa e a projeção de medos e inibições são freio e controle sobre o que ela faz."
   },
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2",
     "tensoes:5",
     "tensoes:6"
    ],
    "justificativa": "A confiança, a duração do vínculo e a hesitação em se comprometer tratam de permanência e lealdade."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:4"
    ],
    "justificativa": "A busca da essência por trás da máscara trata do senso de si e da autoexpressão de quem tem a casa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Saturno é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também depende de aspectos discordantes entre os mapas; a forma favorável, de aspectos favoráveis."
   }
  ],
  "reforcoPorAngulo": "A leitura vale com mais ênfase quando Saturno cai sobre o Ascendente de quem tem a casa.",
  "limitacoes": [
   "O livro diz quem sofre mais quando Saturno está sem apoio, mas atribui isso ao marido; essa atribuição saiu e não foi generalizada."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Saturn in the 1st House",
   "pdfPaginaInicio": 120,
   "pdfPaginaFim": 121,
   "hash": "0983a7fb35bbd6d9"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel conjugal de marido e esposa; sai."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão sobre casamento e filhos; sai."
   },
   {
    "categoria": "karma",
    "motivo": "karma; sai."
   },
   {
    "categoria": "prescricao",
    "motivo": "prescrição sobre o casamento; sai."
   },
   {
    "categoria": "diagnostico",
    "motivo": "atribuição de defeito de temperamento; sai."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "exaltação como técnica; fora do escopo."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal; registrada em condicionadoPor."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "juízo de valor sobre o orgulho; sai."
   },
   {
    "categoria": "papel_social",
    "motivo": "Atribui o maior sofrimento ao marido quando Saturno não está bem amparado; é papel conjugal, sem paráfrase neutra fiel."
   },
   {
    "categoria": "karma",
    "motivo": "Dívida cármica da esposa para com o marido; karma e papel conjugal, descartados."
   }
  ]
 },
 {
  "id": "saturn@casa2",
  "planeta": "saturn",
  "casa": 2,
  "funcaoIntroduzida": "Quem tem Saturno pode mostrar a quem tem a casa como formar e melhorar seus recursos, descartando o supérfluo e retendo o essencial.",
  "campoAtivado": "Os recursos de quem tem a casa, a segurança e as questões financeiras, inclusive dívidas.",
  "facilidades": [
   "Quem tem Saturno pode ensinar a formar e melhorar recursos, descartando o supérfluo e retendo só o essencial.",
   "Com Saturno bem aspectado, quem tem Saturno pode dar mais senso de segurança e uma atitude prudente e responsável diante das finanças.",
   "Quem tem Saturno pode orientar sobre como se proteger de riscos e evitar investimentos duvidosos.",
   "Com Saturno bem apoiado, quem tem Saturno pode guardar dinheiro para a outra pessoa, ensinar economia e mostrar como lidar com recursos com sensatez.",
   "Quem tem a casa pode dever algo a quem tem Saturno, e a dívida pode ser paga em termos materiais."
  ],
  "tensoes": [
   "Com Saturno debilitado ou aflito e aspectos discordantes, o conselho cauteloso e temeroso pode fazer perder oportunidades lucrativas de investimento ou sofrer perdas.",
   "Quem tem Saturno pode ser fonte de despesa para quem tem a casa.",
   "Quem tem Saturno pode se intrometer nas finanças de quem tem a casa, e a reputação desta pode sofrer por promessas já feitas serem quebradas sem intenção.",
   "Com Saturno aflito, as atitudes financeiras de quem tem Saturno podem mostrar a quem tem a casa um exemplo do que não fazer com o dinheiro."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:3",
     "tensoes:0",
     "tensoes:1"
    ],
    "justificativa": "O conteúdo trata de recursos, dinheiro, economia, investimento e despesa concretos."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:0",
     "facilidades:2"
    ],
    "justificativa": "O conselho cauteloso e a proteção contra riscos tratam de cautela e freio sobre as decisões financeiras."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Saturno é debilitado ou aflito no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também depende de aspectos discordantes entre os mapas; a forma favorável, de aspectos favoráveis."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "O livro aponta a leitura tensa em especial quando quem tem Saturno administra as finanças de quem tem a casa."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Saturn in the 2nd",
   "pdfPaginaInicio": 121,
   "pdfPaginaFim": 121,
   "hash": "5121c34e6ab507cd"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": true,
    "aspectos": true
   },
   "tensoes[3]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "prescrição sobre dívidas; sai."
   },
   {
    "categoria": "prescricao",
    "motivo": "prescrição sobre seguir conselho; sai, a dependência fica registrada."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "juízo de valor sobre a posição; a ressalva virou nota de tipo de relação."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "saturn@casa3",
  "planeta": "saturn",
  "casa": 3,
  "funcaoIntroduzida": "Quem tem Saturno pode oferecer a quem tem a casa um modo de pensar mais estável e disciplinado.",
  "campoAtivado": "O pensamento, o estudo, a mobilidade e as viagens de quem tem a casa, e a relação com a vizinhança.",
  "facilidades": [
   "Quem tem Saturno pode ajudar quem tem a casa a se concentrar nos estudos e a afiar a crítica, pensando de modo mais disciplinado.",
   "Quem tem a casa pode distinguir com mais facilidade o essencial do supérfluo e se dispersar menos.",
   "Quem tem Saturno pode dar a quem tem a casa mais tempo para sentar e refletir."
  ],
  "tensoes": [
   "Quem tem Saturno pode limitar a mobilidade de quem tem a casa ou atrasar suas viagens, tornando-as mais árduas.",
   "Quem tem Saturno pode pedir que quem tem a casa cumpra incumbências de responsabilidade em seu nome.",
   "Com Saturno aflito, a relação de quem tem a casa com a vizinhança pode se deteriorar.",
   "As ideias de quem tem Saturno podem parecer pesadas, a conversa enfadonha e a abordagem mental minuciosa demais para quem tem a casa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "tensoes:3"
    ],
    "justificativa": "O conteúdo trata de como se pensa, se conversa e se recebem as ideias entre as duas pessoas."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:1"
    ],
    "justificativa": "A limitação da mobilidade, o atraso nas viagens e os encargos pedidos são restrição imposta a quem tem a casa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A relação com a vizinhança piorar depende de Saturno aflito no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Entre professor e aluno, com a casa do aluno envolvida, as lições podem exigir muito esforço mental."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Saturn in the 3rd",
   "pdfPaginaInicio": 121,
   "pdfPaginaFim": 121,
   "hash": "804780f1c34b4fe6"
  },
  "condicoesPorItem": {
   "tensoes[2]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de cautela; sai."
   },
   {
    "categoria": "papel_social",
    "motivo": "variação por tipo de relação; vira nota em condicionadoPor."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "saturn@casa4",
  "planeta": "saturn",
  "casa": 4,
  "funcaoIntroduzida": "Quem tem Saturno pode querer assumir diante de quem tem a casa uma responsabilidade de tipo parental.",
  "campoAtivado": "As reações habituais e instintivas de quem tem a casa e as responsabilidades domésticas.",
  "facilidades": [
   "Quem tem Saturno pode levar quem tem a casa a prestar mais atenção às suas reações habituais e instintivas.",
   "Quem tem a casa pode aprender muito com quem tem Saturno.",
   "Quem tem Saturno pode incentivar quem tem a casa a seguir os passos de um progenitor."
  ],
  "tensoes": [
   "Sem Saturno bem aspectado e aspectos excepcionalmente favoráveis, a presença de quem tem Saturno pode ser avassaladora, sobretudo se o contato começou quando quem tem a casa era muito jovem.",
   "A atitude de quem tem Saturno pode ser crítica demais e minar a autoconfiança de quem tem a casa.",
   "Quem tem Saturno pode esperar que quem tem a casa assuma responsabilidades demais, sobretudo domésticas, cedo demais.",
   "Sem aspectos predominantemente harmoniosos, quem tem a casa pode não se sentir à vontade na presença de quem tem Saturno."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:1",
     "tensoes:2"
    ],
    "justificativa": "A presença avassaladora, a crítica excessiva e a carga de responsabilidade precoce são controle e freio sobre quem tem a casa."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:0",
     "tensoes:3"
    ],
    "justificativa": "O conteúdo trata de reações instintivas e habituais e do desconforto sentido na presença do outro."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "A crítica que mina a autoconfiança de quem tem a casa toca o senso de si."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale a menos que Saturno seja bem aspectado no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa vale a menos que os aspectos entre os mapas sejam excepcionalmente favoráveis, ou predominantemente harmoniosos."
   },
   {
    "tipo": "idade_ou_contexto",
    "nota": "A presença pode ser avassaladora sobretudo se o contato começou quando quem tem a casa era muito jovem."
   }
  ],
  "reforcoPorAngulo": "A leitura vale com mais ênfase quando Saturno cai sobre o Fundo do Céu de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Saturn in the 4th",
   "pdfPaginaInicio": 122,
   "pdfPaginaFim": 122,
   "hash": "ef3c53ebf497e5aa"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "genero",
    "motivo": "'pai' neutralizado como progenitor."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "saturn@casa5",
  "planeta": "saturn",
  "casa": 5,
  "funcaoIntroduzida": "Quem tem Saturno pode ser exigente e reservado diante dos empreendimentos de quem tem a casa.",
  "campoAtivado": "A criação, os empreendimentos de quem tem a casa e a resposta emocional e de apreço que recebe.",
  "facilidades": [
   "A desaprovação sentida pode levar quem tem a casa a se esforçar mais, só para mostrar o contrário; quem tem Saturno pode concluir que só obtém resultado pleno sem mostrar entusiasmo.",
   "A experiência pode levar quem tem a casa a criar pelo resultado, e não para obter aprovação.",
   "O vínculo pode dar a quem tem Saturno experiências que o levam a controlar mais as próprias emoções."
  ],
  "tensoes": [
   "Pode ser difícil obter o apoio de quem tem Saturno em um empreendimento, e quem tem Saturno pode menosprezar os esforços criativos de quem tem a casa.",
   "Pode ser difícil despertar uma resposta emocional em quem tem Saturno; a falta de simpatia pode formar uma barreira à compreensão e à proximidade.",
   "Quem tem Saturno pode ser exigente e duvidar de que quem tem a casa se dedique plenamente; a falta de entusiasmo pode ser crítica fundada sobre a qualidade do trabalho.",
   "Com aspectos discordantes, quem tem a casa pode viver uma decepção emocional profunda; com Saturno muito aflito, o vínculo traz pouca alegria.",
   "Pode haver o desafio de conquistar o interesse de quem tem Saturno, que se faz de difícil.",
   "Quem tem Saturno pode ser severo demais com crianças e pouco entusiasmado com as atividades sociais de quem tem a casa, às vezes por inveja de algum atributo que lhe falta."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "tensoes:1",
     "tensoes:3",
     "tensoes:4"
    ],
    "justificativa": "A falta de resposta emocional e de simpatia, a decepção e o jogo de interesse tratam de afeição e proximidade."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:2"
    ],
    "justificativa": "O menosprezo, a exigência e a crítica sobre o trabalho são freio e crítica diante do que a outra pessoa cria."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:0"
    ],
    "justificativa": "Criar pelo resultado e não pela aprovação, e reagir ao menosprezo, tratam de autoexpressão e senso de valor próprio."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "Ganhar controle sobre as próprias emoções trata de sentimento e sensibilidade."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A leitura mais pesada vale quando Saturno é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A decepção emocional depende de aspectos discordantes entre os mapas."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Saturn in the 5th",
   "pdfPaginaInicio": 122,
   "pdfPaginaFim": 122,
   "hash": "12c8a1a65bf768fc"
  },
  "condicoesPorItem": {
   "tensoes[3]": {
    "natal": true,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "genero",
    "motivo": "condição de sexos opostos; sai."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel conjugal de marido; sai."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; sai."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "juízo e previsão sobre a duração; sai."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão sobre o futuro do vínculo; sai."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "saturn@casa6",
  "planeta": "saturn",
  "casa": 6,
  "funcaoIntroduzida": "Quem tem Saturno pode esperar serviço de quem tem a casa e retribuição plena pelo serviço que presta.",
  "campoAtivado": "O serviço, o trabalho cotidiano e a eficiência de quem tem a casa.",
  "facilidades": [
   "A crítica de quem tem Saturno pode visar ajudar quem tem a casa a melhorar seus métodos, com técnicas mais confiáveis.",
   "O objetivo final da crítica pode ser tornar quem tem a casa mais autossuficiente.",
   "Quem tem Saturno pode manter quem tem a casa ocupada."
  ],
  "tensoes": [
   "Quem tem Saturno pode adotar uma atitude crítica diante do jeito de quem tem a casa fazer as coisas e testar sua eficiência.",
   "Quem tem Saturno pode parecer pronto demais para achar falhas.",
   "Quem tem Saturno pode, por vezes, atrapalhar o progresso de quem tem a casa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2",
     "tensoes:0"
    ],
    "justificativa": "O conteúdo trata de serviço, métodos de trabalho, eficiência e atividade concreta."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:1",
     "tensoes:2"
    ],
    "justificativa": "O teste de eficiência, a busca de falhas e o atrapalho ao progresso são crítica e freio."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale a menos que Saturno seja bem aspectado no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa vale a menos que os aspectos entre os mapas sejam particularmente favoráveis."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "O livro aponta atrito em especial quando quem tem Saturno é empregado de quem tem a casa ou cuida da saúde dessa pessoa."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Saturn in the 6th",
   "pdfPaginaInicio": 122,
   "pdfPaginaFim": 122,
   "hash": "551097cc8c49932d"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "juízo de valor sobre a posição; virou nota de tipo de relação."
   },
   {
    "categoria": "papel_social",
    "motivo": "papéis de empregado e de quem cuida da saúde; só nota de tipo de relação."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "saturn@casa7",
  "planeta": "saturn",
  "casa": 7,
  "funcaoIntroduzida": "Quem tem Saturno pode avaliar o valor de quem tem a casa como parceiro, pondo à prova se atende aos seus padrões.",
  "campoAtivado": "A parceria um a um e a possibilidade de um vínculo sólido o bastante para durar.",
  "facilidades": [
   "Saturno representa aqui a possibilidade de um vínculo permanente, sólido o bastante para resistir ao tempo.",
   "Se quem tem a casa atende aos padrões de quem tem Saturno, pode ter nessa pessoa um amigo para a vida toda.",
   "Com Saturno bem aspectado, quem tem Saturno pode mostrar integridade na parceria, e sua confiabilidade pode pôr quem tem a casa diante do desafio de demonstrar confiabilidade recíproca."
  ],
  "tensoes": [
   "Pode ser uma relação muito crítica, em que o método de teste de quem tem Saturno pode ser penoso.",
   "Com Saturno aflito e aspectos discordantes, quem tem a casa pode se ressentir dos métodos e questionar o direito de ser posto à prova assim.",
   "Mesmo com reciprocidade, pode não haver resposta efusiva de quem tem Saturno.",
   "Com Saturno aflito, pode ser muito difícil conviver, e a abordagem inflexível ou a falta de entusiasmo pode inviabilizar uma afinidade verdadeira.",
   "Quem tem a casa pode sentir que nunca consegue agradar a quem tem Saturno."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2"
    ],
    "justificativa": "O conteúdo trata de permanência, solidez, lealdade e confiabilidade do vínculo."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:3"
    ],
    "justificativa": "O teste de valor, a crítica e a falta de entusiasmo são restrição e controle sobre a outra pessoa."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:1",
     "tensoes:4"
    ],
    "justificativa": "Ser avaliado quanto ao valor e sentir que não se agrada tratam de reconhecimento do valor do outro."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Saturno é aflito no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também depende de aspectos discordantes entre os mapas; a favorável, de Saturno bem aspectado."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Em parceria de negócios, o vínculo pode funcionar quando Saturno é bem aspectado."
   }
  ],
  "reforcoPorAngulo": "A leitura vale com mais ênfase quando Saturno cai sobre o Descendente de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Saturn in the 7th",
   "pdfPaginaInicio": 123,
   "pdfPaginaFim": 123,
   "hash": "e2558513e036a7b2"
  },
  "condicoesPorItem": {
   "tensoes[1]": {
    "natal": true,
    "aspectos": true
   },
   "tensoes[3]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "exaltação como técnica; fora do escopo."
   },
   {
    "categoria": "previsao",
    "motivo": "promessa futura; virou possibilidade condicionada."
   },
   {
    "categoria": "prescricao",
    "motivo": "preceito de conduta; sai."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "recomendação e juízo sobre papéis; sai."
   },
   {
    "categoria": "papel_social",
    "motivo": "papéis profissionais; só nota de tipo de relação."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "saturn@casa8",
  "planeta": "saturn",
  "casa": 8,
  "funcaoIntroduzida": "Quem tem Saturno pode tornar quem tem a casa ciente de áreas de si sobre as quais costuma ter pouco controle.",
  "campoAtivado": "As áreas de pouco controle de quem tem a casa, a confiança e o tempo para consolidar o vínculo.",
  "facilidades": [
   "Quem tem Saturno pode deixar quem tem a casa desconfortavelmente ciente de certas deficiências, o que pode motivar a transformar certas atitudes para o vínculo funcionar com mais suavidade.",
   "Quem tem Saturno pode precisar conhecer por muito tempo quem tem a casa antes de consolidar o vínculo.",
   "O vínculo pode existir entre pessoas chamadas a enfrentar um grande perigo juntas, e que na experiência reconhecem a natureza essencial uma da outra."
  ],
  "tensoes": [
   "Quem tem Saturno pode ter reservas quanto a aceitar a amizade de quem tem a casa, se as áreas pouco controladas forem fonte de fraqueza.",
   "Com Saturno aflito e aspectos discordantes, pode surgir inimizade de um lado ou do outro, difícil de explicar racionalmente.",
   "Mesmo com poucas aflições, quem tem Saturno pode ser impedido por uma vaga sensação de presságio de se entregar por inteiro ao vínculo.",
   "Quem tem Saturno pode exigir provas convincentes da integridade de quem tem a casa antes de se sentir à vontade, como se debatesse se pode lhe confiar a vida.",
   "As reservas e a cautela excessiva de quem tem Saturno podem afastar quem tem a casa.",
   "O vínculo pode pedir muita tolerância e disposição para sacrifícios de quem tem a casa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "O conteúdo trata de transformar atitudes a partir do confronto com deficiências e áreas de pouco controle."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "tensoes:2",
     "tensoes:3",
     "facilidades:1"
    ],
    "justificativa": "A reserva, a prova de integridade e o tempo para confiar tratam de confiança íntima."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:4"
    ],
    "justificativa": "As reservas e a cautela excessiva de quem tem Saturno são freio ao vínculo."
   },
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "facilidades:1",
     "tensoes:2"
    ],
    "justificativa": "Consolidar o vínculo devagar e hesitar em se entregar tratam de duração e permanência."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Saturno é aflito no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa depende de aspectos discordantes entre os mapas."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Saturn in the 8th",
   "pdfPaginaInicio": 123,
   "pdfPaginaFim": 123,
   "hash": "7b1eaf45b12b220e"
  },
  "condicoesPorItem": {
   "tensoes[1]": {
    "natal": true,
    "aspectos": true
   },
   "tensoes[2]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de morte; sai."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "papel de administrador de finanças e previsão de perda; fora do escopo."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "juízo de valor sobre a base do vínculo; sai."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "saturn@casa9",
  "planeta": "saturn",
  "casa": 9,
  "funcaoIntroduzida": "Quem tem Saturno pode levar quem tem a casa a uma atitude mais séria diante de questões religiosas, filosóficas e importantes da vida.",
  "campoAtivado": "A religião, a filosofia, o entendimento geral da vida, as viagens, o estrangeiro e a correspondência de quem tem a casa.",
  "facilidades": [
   "Os valores ortodoxos e a sabedoria dos ensinamentos antigos podem ganhar mais espaço na consciência de quem tem a casa.",
   "Quem tem Saturno pode incentivar mais responsabilidade na propagação e na conservação do conhecimento e o autodesenvolvimento de quem tem a casa nesses assuntos."
  ],
  "tensoes": [
   "Com Saturno muito aflito e aspectos discordantes, as duas pessoas podem nunca concordar sobre religião ou sobre o entendimento da vida como um todo.",
   "Quem tem Saturno pode depender de quem tem a casa para transporte ou trazer-lhe responsabilidades ligadas ao estrangeiro.",
   "Quem tem Saturno pode atrapalhar a mobilidade de quem tem a casa ou ser a razão de viagens e correspondência obrigatórias."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1"
    ],
    "justificativa": "O conteúdo trata de ampliar o conhecimento, a responsabilidade com ele e o autodesenvolvimento."
   },
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "tensoes:0"
    ],
    "justificativa": "O desencontro sobre religião e entendimento da vida trata de compreensão e mal-entendido entre as pessoas."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:2"
    ],
    "justificativa": "O atrapalho à mobilidade é restrição imposta a quem tem a casa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Saturno é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também depende de aspectos discordantes entre os mapas."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Entre adulto responsável e criança, com a casa da criança envolvida, quem tem Saturno pode exigir padrões educacionais elevados ou enviá-la a um internato."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Saturn in the 9th",
   "pdfPaginaInicio": 123,
   "pdfPaginaFim": 124,
   "hash": "e4b4d882f4c7a589"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": true,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "papel_social",
    "motivo": "variação por tipo de relação; vira nota em condicionadoPor."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "saturn@casa10",
  "planeta": "saturn",
  "casa": 10,
  "funcaoIntroduzida": "Quem tem Saturno pode ter um papel definitivo na carreira de quem tem a casa.",
  "campoAtivado": "A carreira, a ambição, o reconhecimento e o progresso profissional de quem tem a casa.",
  "facilidades": [
   "Quem tem Saturno pode pôr à prova a força da ambição de quem tem a casa, e mesmo entraves e atrasos podem fortalecer, a longo prazo, a vontade de ter sucesso.",
   "Quem tem Saturno pode atrasar o reconhecimento até que quem tem a casa esteja preparado, evitando que falhe numa nova empreitada por falta de experiência.",
   "Quem tem Saturno pode estimular uma abordagem realista das responsabilidades de quem tem a casa.",
   "Quem tem Saturno pode dizer a quem tem a casa a verdade sobre si; a avaliação crítica costuma visar um nível mais alto de realização e autodesenvolvimento.",
   "Quem tem Saturno pode avaliar o prestígio pelo desempenho real e não por ouvir dizer.",
   "Quem tem Saturno pode se preocupar que quem tem a casa faça plena justiça a si e aos seus potenciais quando precisar exibir seus talentos."
  ],
  "tensoes": [
   "Quem tem Saturno pode fazer exigências consideráveis a quem tem a casa.",
   "Com Saturno muito aflito, quem tem Saturno pode assumir uma atitude de autoridade rígida e parental diante de quem tem a casa.",
   "Com Saturno muito aflito, quem tem Saturno pode sentir inveja da posição de quem tem a casa.",
   "Quem tem Saturno pode frustrar de propósito os maiores esforços de quem tem a casa e retardar seu progresso."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2",
     "tensoes:0"
    ],
    "justificativa": "O conteúdo trata de carreira, trabalho, avanço profissional e exigências concretas."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "facilidades:1",
     "tensoes:0",
     "tensoes:3"
    ],
    "justificativa": "O atraso do reconhecimento, as exigências e o retardo do progresso são freio e restrição."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:3",
     "facilidades:5"
    ],
    "justificativa": "A verdade sobre si e fazer justiça aos próprios potenciais tratam de senso de si e autoexpressão."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Saturno é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma favorável depende de aspectos favoráveis entre os mapas, e a tensa, de aspectos discordantes."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Se quem tem Saturno é empregador de quem tem a casa, pode fazer exigências consideráveis e recompensar estritamente conforme o mérito, com Saturno bem aspectado."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Se Saturno de um rival mais velho cai na casa de quem tem a casa, o rival pode barrar o progresso dessa pessoa."
   }
  ],
  "reforcoPorAngulo": "A leitura vale com mais ênfase quando Saturno cai sobre o Meio do Céu de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Saturn in the 10th",
   "pdfPaginaInicio": 124,
   "pdfPaginaFim": 124,
   "hash": "332449bef6bf0cdc"
  },
  "condicoesPorItem": {
   "tensoes[1]": {
    "natal": true,
    "aspectos": false
   },
   "tensoes[2]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel de empregador; só nota de tipo de relação."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel de rival mais velho; só nota de tipo de relação."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "saturn@casa11",
  "planeta": "saturn",
  "casa": 11,
  "funcaoIntroduzida": "Quem tem Saturno pode se interessar de modo prático em ajudar quem tem a casa a realizar seus ideais, se houver trabalho duro e se os considerar valiosos e possíveis.",
  "campoAtivado": "Os ideais, as amizades e as esperanças de quem tem a casa.",
  "facilidades": [
   "Pode crescer uma amizade forte entre as duas pessoas.",
   "Quem tem Saturno pode sempre pôr sua experiência à disposição de quem tem a casa."
  ],
  "tensoes": [
   "Quem tem a casa pode precisar convencer quem tem Saturno de que é uma pessoa sólida e confiável, que não trata a amizade como algo dado.",
   "Quem tem Saturno pode esperar que quem tem a casa contribua com a sua parte na amizade e fazer pedidos em hora inconveniente, exigindo sacrifícios.",
   "Quem tem Saturno pode pôr a amizade à prova com uma exigência que limite a liberdade de quem tem a casa em outras direções.",
   "Com Saturno muito aflito e aspectos discordantes, quem tem a casa pode sentir antipatia e preferir evitar a companhia de quem tem Saturno."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "facilidades:0",
     "tensoes:0",
     "tensoes:1"
    ],
    "justificativa": "A amizade forte, a prova de confiabilidade e a contribuição devida tratam de lealdade e duração."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:2"
    ],
    "justificativa": "A exigência que limita a liberdade em outras direções é restrição e controle."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "Pôr a experiência à disposição trata de ajuda concreta e prática."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A antipatia vale quando Saturno é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A antipatia também depende de aspectos discordantes entre os mapas."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Saturn in the 11th",
   "pdfPaginaInicio": 124,
   "pdfPaginaFim": 124,
   "hash": "55d555192771b1d9"
  },
  "condicoesPorItem": {
   "tensoes[3]": {
    "natal": true,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "saturn@casa12",
  "planeta": "saturn",
  "casa": 12,
  "funcaoIntroduzida": "Quem tem Saturno pode esperar confiabilidade e autossuficiência de quem tem a casa justamente onde essa pessoa é mais vulnerável.",
  "campoAtivado": "As áreas de maior vulnerabilidade de quem tem a casa, o que acontece nos bastidores e as fraquezas pessoais.",
  "facilidades": [
   "Quem tem Saturno pode tornar quem tem a casa mais ciente das áreas de maior vulnerabilidade, dando um incentivo para erradicar essas falhas.",
   "Com aspectos favoráveis, quem tem Saturno pode trabalhar nos bastidores para fortalecer a posição de quem tem a casa."
  ],
  "tensoes": [
   "Pode haver dificuldades no vínculo, e quem tem a casa pode não se sentir à vontade na presença de quem tem Saturno.",
   "Quem tem Saturno pode expor, de modo desconcertante, uma fraqueza de quem tem a casa, despertando ressentimento e dúvidas sobre sua capacidade de agir com consistência ou sabedoria.",
   "Com Saturno aflito e aspectos discordantes, quem tem Saturno pode agir em segredo contra quem tem a casa, minando sua posição e frustrando seus planos.",
   "Quem tem a casa pode ter de abrigar ou auxiliar quem tem Saturno, que pode fazer exigências duras à sua compaixão e ao seu espírito caridoso."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:1",
     "tensoes:2"
    ],
    "justificativa": "Expor fraquezas e minar a posição e os planos são crítica, controle e frustração por contenção."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:3"
    ],
    "justificativa": "O desconforto na presença do outro e o apelo à compaixão tratam de sensibilidade e empatia."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "Perceber as áreas de maior vulnerabilidade e querer eliminar falhas trata de senso de si."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Saturno é aflito no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma favorável depende de aspectos favoráveis entre os mapas, e a tensa, de aspectos discordantes."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Saturn in the 12th",
   "pdfPaginaInicio": 124,
   "pdfPaginaFim": 125,
   "hash": "d722224a956451ce"
  },
  "condicoesPorItem": {
   "tensoes[2]": {
    "natal": true,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "uranus@casa1",
  "planeta": "uranus",
  "casa": 1,
  "funcaoIntroduzida": "Quem tem Urano pode chamar a atenção de quem tem a casa com facetas incomuns da sua personalidade.",
  "campoAtivado": "A personalidade, o ambiente e o círculo de convivência de quem tem a casa.",
  "facilidades": [
   "Pode haver uma atração dinâmica entre as duas pessoas, e o fascínio pode permanecer sem que o vínculo se torne comum.",
   "Quem tem Urano pode tomar a iniciativa no vínculo.",
   "Quem tem Urano pode estimular quem tem a casa a experimentar ideias novas e a desenvolver aspectos antes negligenciados da personalidade.",
   "Quem tem Urano pode introduzir novidade na vida de quem tem a casa, com um novo círculo de amigos e um ambiente totalmente novo."
  ],
  "tensoes": [
   "Com Urano aflito, pode haver tensão sobre quem toma a iniciativa.",
   "Quem tem Urano pode desafiar quem tem a casa, até sem intenção, a mudar pelo seu modo de ser e de viver, o que costuma ser desconfortável.",
   "Com Urano aflito e aspectos discordantes, quem tem Urano pode querer ditar o que quem tem a casa faz, gerando tensão e nervosismo.",
   "Quem tem Urano pode levar quem tem a casa a romper com antigas companhias e depois sair de sua vida tão de repente quanto entrou."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "acao_desejo",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:0"
    ],
    "justificativa": "O conteúdo trata de atração dinâmica, iniciativa e disputa sobre quem a toma."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:2",
     "facilidades:3",
     "tensoes:1",
     "tensoes:3"
    ],
    "justificativa": "Mudar a si mesmo, novidade na vida e ruptura com antigas companhias tratam de mudança profunda."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:2"
    ],
    "justificativa": "Querer ditar o que a outra pessoa faz é controle exercido sobre ela."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Urano é afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também depende de aspectos discordantes entre os mapas; a forma favorável, de aspectos favoráveis."
   }
  ],
  "reforcoPorAngulo": "A leitura vale com mais ênfase quando Urano cai sobre o Ascendente de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Uranus in the 1st House",
   "pdfPaginaInicio": 125,
   "pdfPaginaFim": 125,
   "hash": "2319815fa2cd4e83"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": true,
    "aspectos": false
   },
   "tensoes[2]": {
    "natal": true,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "genero",
    "motivo": "condição de sexos opostos de mesma idade; sai."
   },
   {
    "categoria": "previsao",
    "motivo": "promessa futura; virou possibilidade."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "uranus@casa2",
  "planeta": "uranus",
  "casa": 2,
  "funcaoIntroduzida": "Quem tem Urano pode inspirar quem tem a casa a reexaminar como lida com seus recursos e com sua ideia de segurança.",
  "campoAtivado": "Os recursos de quem tem a casa, a segurança e o dinheiro.",
  "facilidades": [
   "Quem tem Urano pode incentivar uma atitude mais despreocupada diante das questões financeiras."
  ],
  "tensoes": [
   "Os conselhos de quem tem Urano sobre como melhorar a situação financeira podem pedir exame muito cuidadoso antes de serem seguidos, a menos que os aspectos sejam muito favoráveis.",
   "Quem tem Urano pode pôr de repente quem tem a casa na posição de pagar a conta de modo inesperado.",
   "Com aspectos discordantes, quem tem Urano pode achar meios engenhosos de fazer quem tem a casa perder dinheiro."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "tensoes:0",
     "tensoes:1",
     "tensoes:2"
    ],
    "justificativa": "O conteúdo trata de dinheiro, recursos, despesas e decisões financeiras concretas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "O conselho financeiro só é de confiança com aspectos muito favoráveis entre os mapas; com discordantes, vale a forma tensa."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "O livro aponta dificuldade quando quem tem Urano cuida das finanças de quem tem a casa."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Uranus in the 2nd",
   "pdfPaginaInicio": 126,
   "pdfPaginaFim": 126,
   "hash": "a027248d14e7f4ad"
  },
  "condicoesPorItem": {
   "tensoes[2]": {
    "natal": false,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "juízo sobre a posição; virou nota de tipo de relação."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel de administrador de finanças; só nota de tipo de relação."
   }
  ]
 },
 {
  "id": "uranus@casa3",
  "planeta": "uranus",
  "casa": 3,
  "funcaoIntroduzida": "Quem tem Urano pode dar a quem tem a casa uma visão inteiramente nova da vida, com novas fontes de informação e perspectivas mentais diferentes.",
  "campoAtivado": "O pensamento, as fontes de informação, o ambiente e os deslocamentos de quem tem a casa.",
  "facilidades": [
   "A atração física frequente nos contatos de casa 1 pode se transferir para o plano mental e permitir alto grau de afinidade mental, se os aspectos a Urano não forem muito discordantes.",
   "Quem tem Urano pode manter quem tem a casa mentalmente alerta e desafiá-la a voltar aos primeiros princípios e a rever teorias à luz de informação nova.",
   "Quem tem a casa pode, mais tarde, perceber de repente o princípio por trás das ideias que quem tem Urano tentava transmitir.",
   "Quem tem Urano pode ajudar a mudar o ambiente de quem tem a casa e sugerir cortes úteis de tempo em seus modos de viajar."
  ],
  "tensoes": [
   "Com aspectos muito discordantes, o modo de pensar de quem tem Urano pode parecer anormal demais para merecer atenção séria."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:0"
    ],
    "justificativa": "O conteúdo trata de afinidade mental, troca de ideias e dificuldade de ser levado a sério."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:2",
     "facilidades:1"
    ],
    "justificativa": "A percepção repentina de um princípio e a revisão de teorias tratam de revelação e reavaliação."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:3"
    ],
    "justificativa": "Mudar o ambiente e cortar tempo nas viagens trata de organização concreta."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A afinidade mental vale quando os aspectos a Urano não são muito discordantes; com muito discordantes, vale a forma tensa."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Uranus in the 3rd",
   "pdfPaginaInicio": 126,
   "pdfPaginaFim": 126,
   "hash": "ca8f4556866eadec"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   }
  ]
 },
 {
  "id": "uranus@casa4",
  "planeta": "uranus",
  "casa": 4,
  "funcaoIntroduzida": "Quem tem Urano pode ter um efeito desestabilizador sobre o ambiente doméstico e o modo instintivo e habitual de viver de quem tem a casa.",
  "campoAtivado": "O lar, as reações instintivas e habituais, a criação recebida e a base de onde quem tem a casa opera.",
  "facilidades": [
   "Quem tem Urano pode levar quem tem a casa a reexaminar ideias vindas da criação familiar, seus arranjos domésticos e toda a base de onde opera.",
   "A presença de quem tem Urano pode ser sentida como desafio a cultivar o hábito de agir com mais espontaneidade."
  ],
  "tensoes": [
   "Com Urano muito aflito e aspectos discordantes, quem tem Urano pode desorganizar por completo a vida de quem tem a casa e tornar sua posição insustentável.",
   "Quem tem Urano pode seguir uma ocupação incomum que perturba a rotina habitual de quem tem a casa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:1",
     "tensoes:0"
    ],
    "justificativa": "O conteúdo trata de hábito, instinto, espontaneidade e segurança no ambiente doméstico."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:0",
     "tensoes:0"
    ],
    "justificativa": "Reexaminar a base de onde se opera e o risco de desorganização tratam de mudança profunda."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "tensoes:1",
     "facilidades:0"
    ],
    "justificativa": "A ocupação incomum que perturba a rotina e os arranjos domésticos tratam de rotina e casa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Urano é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também depende de aspectos discordantes entre os mapas."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Entre adulto responsável e criança, com a casa da criança envolvida, pode haver mudanças constantes de ambiente doméstico, como mudança de casa, e peso na definição da carreira."
   }
  ],
  "reforcoPorAngulo": "A leitura vale com mais ênfase quando Urano cai sobre o Fundo do Céu de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Uranus in the 4th",
   "pdfPaginaInicio": 126,
   "pdfPaginaFim": 126,
   "hash": "83c8acf16250a210"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": true,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "papel_social",
    "motivo": "variação por tipo de relação; vira nota em condicionadoPor."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "uranus@casa5",
  "planeta": "uranus",
  "casa": 5,
  "funcaoIntroduzida": "Quem tem Urano pode auxiliar os esforços criativos e artísticos de quem tem a casa, estimulando sua originalidade.",
  "campoAtivado": "A criação, a vida social, o lazer e o interesse romântico de quem tem a casa.",
  "facilidades": [
   "Sem Urano muito aflito, as ideias de quem tem Urano costumam dar a quem tem a casa uma visão de novas possibilidades e maior abertura à inspiração.",
   "Quem tem Urano pode trazer novas oportunidades para a vida social de quem tem a casa e uma nova atitude quanto ao lazer.",
   "Os passatempos de quem tem Urano podem despertar um novo interesse em quem tem a casa.",
   "O vínculo pode estimular um interesse romântico mútuo, mas por si só não implica permanência."
  ],
  "tensoes": [
   "Com Urano aflito e aspectos desfavoráveis, as duas pessoas podem ter propósitos cruzados.",
   "Quem tem Urano pode ter uma opinião fraca sobre os esforços criativos de quem tem a casa, ou levá-la a gastar tempo em lazeres aquém de seus talentos."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "Estimular a originalidade e abrir à inspiração trata de autoexpressão de quem tem a casa."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2"
    ],
    "justificativa": "Novas oportunidades sociais, nova atitude diante do lazer e novo interesse tratam de ampliação."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:3"
    ],
    "justificativa": "O interesse romântico mútuo trata de atração e afeição."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "A opinião fraca sobre o que a outra pessoa cria é crítica e freio."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Urano é aflito no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também depende de aspectos desfavoráveis entre os mapas."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Uranus in the 5th",
   "pdfPaginaInicio": 126,
   "pdfPaginaFim": 127,
   "hash": "137fbe4890a5dd3d"
  },
  "condicoesPorItem": {
   "facilidades[0]": {
    "natal": true,
    "aspectos": false
   },
   "tensoes[0]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "genero",
    "motivo": "condição de sexos opostos; sai."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão sobre permanência; só resta que o interesse por si não a implica."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "uranus@casa6",
  "planeta": "uranus",
  "casa": 6,
  "funcaoIntroduzida": "Quem tem Urano pode sugerir novos modos eficazes de fazer as coisas e apresentar a quem tem a casa recursos que poupam trabalho.",
  "campoAtivado": "O trabalho, o serviço, a eficiência dos métodos, a saúde e a rotina de quem tem a casa.",
  "facilidades": [
   "Diante dos métodos de quem tem Urano, quem tem a casa pode achar os seus trabalhosos e menos eficientes e revisá-los para ver o que melhorar.",
   "Quem tem Urano pode apresentar novas dietas ou métodos de condicionamento e outros modos de melhorar a saúde de quem tem a casa.",
   "Quem tem a casa pode rever sua atitude quanto ao serviço e a quem ocupa um papel subordinado, a partir das ideias de quem tem Urano.",
   "Quem tem Urano pode pedir a quem tem a casa um serviço incomum."
  ],
  "tensoes": [
   "Sem Urano bem aspectado e aspectos predominantemente favoráveis, a presença de quem tem Urano pode ser inquietante para quem tem a casa, que pode sentir uma atitude crítica mesmo sem palavras.",
   "Quem tem Urano pode tender a deixar quem tem a casa com os nervos à flor da pele.",
   "Em algum momento, quem tem a casa pode ter motivo de preocupação com a saúde de quem tem Urano."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:2",
     "facilidades:3"
    ],
    "justificativa": "O conteúdo trata de métodos de trabalho, serviço, saúde e organização concreta."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:1"
    ],
    "justificativa": "A inquietação na presença do outro e os nervos à flor da pele tratam de sensibilidade."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale a menos que Urano seja bem aspectado no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa vale a menos que os aspectos entre os mapas sejam predominantemente favoráveis."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "O livro aponta atrito quando quem tem Urano é empregado de quem tem a casa, cuida de sua saúde ou lhe fornece alimentos ou bens fabricados."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Como empregado, quem tem Urano pode questionar os métodos de quem tem a casa e tentar melhorá-los, às vezes com resultados desastrosos, ou ficar inquieto e buscar outro emprego."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Uranus in the 6th",
   "pdfPaginaInicio": 127,
   "pdfPaginaFim": 127,
   "hash": "c4b72e2a1c71fde7"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "juízo sobre a posição; virou nota de tipo de relação."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel de empregado; só nota de tipo de relação."
   }
  ]
 },
 {
  "id": "uranus@casa7",
  "planeta": "uranus",
  "casa": 7,
  "funcaoIntroduzida": "Quem tem Urano pode pôr quem tem a casa, talvez sem perceber, diante da necessidade de uma mudança radical para manter o vínculo em equilíbrio.",
  "campoAtivado": "A parceria um a um, as relações com outras pessoas e a estabilidade do vínculo.",
  "facilidades": [
   "Quem tem Urano pode apresentar a quem tem a casa um círculo inteiramente novo de pessoas.",
   "Quem tem a casa pode decidir mudar sua abordagem diante de outras pessoas por causa do vínculo.",
   "Num vínculo romântico, quem tem Urano pode exercer certo fascínio."
  ],
  "tensoes": [
   "Com Urano aflito e aspectos discordantes, quem tem Urano pode querer interferir nas relações de quem tem a casa e até romper a relação de quem tem a casa com outra pessoa.",
   "Quem tem Urano pode tentar se interpor entre quem tem a casa e seu parceiro, ou ditar a este o que fazer.",
   "O vínculo tende a se manter delicadamente equilibrado e sujeito a mudanças bruscas de rumo, por tendências erráticas ou por circunstâncias repentinas.",
   "Quem tem Urano pode entrar na vida de quem tem a casa de repente e sair com igual rapidez.",
   "O vínculo pode trazer períodos de separação forçada, por uma ocupação de uma das pessoas que envolva muitas viagens ou por circunstâncias imprevistas."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "tensoes:2",
     "tensoes:3"
    ],
    "justificativa": "Mudanças bruscas de rumo e entrada e saída repentinas tratam de ruptura e mudança."
   },
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "tensoes:2",
     "tensoes:4"
    ],
    "justificativa": "O equilíbrio delicado e as separações forçadas tratam de permanência do vínculo."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:1"
    ],
    "justificativa": "Interferir nas relações e ditar o que fazer são controle exercido sobre a outra pessoa."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:2"
    ],
    "justificativa": "O fascínio num vínculo romântico trata de atração."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Urano é aflito no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa depende de aspectos discordantes entre os mapas; a estabilidade do vínculo, de aspectos particularmente harmoniosos."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Em parceria de negócios, o livro só vê encaixe quando novidade e originalidade são o tom do empreendimento."
   }
  ],
  "reforcoPorAngulo": "A leitura vale com mais ênfase quando Urano cai sobre o Descendente de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Uranus in the 7th",
   "pdfPaginaInicio": 127,
   "pdfPaginaFim": 127,
   "hash": "acd4db588945a6fa"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": true,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "genero",
    "motivo": "'homem' neutralizado como quem tem Urano."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel conjugal; virou 'seu parceiro'."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho sobre casar; sai."
   },
   {
    "categoria": "previsao",
    "motivo": "menção a casamento; sai."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "recomendação; virou nota de tipo de relação sem juízo."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "uranus@casa8",
  "planeta": "uranus",
  "casa": 8,
  "funcaoIntroduzida": "Quem tem Urano pode levar quem tem a casa a uma autoavaliação radical e a uma transformação em algum aspecto importante do seu ser.",
  "campoAtivado": "A transformação pessoal, o conhecimento de si, as finanças compartilhadas e a atração física.",
  "facilidades": [
   "O vínculo pode ser especialmente significativo.",
   "Quem tem Urano pode pôr quem tem a casa em contato com ensinamentos ou disciplinas ligados ao conhecimento de si, facilitando o trabalho sobre si.",
   "Quem tem Urano pode estimular o interesse de quem tem a casa por ocultismo.",
   "Quem tem Urano pode despertar o interesse de quem tem a casa por um estudo de economia.",
   "O vínculo pode indicar considerável atração física."
  ],
  "tensoes": [
   "Em assuntos financeiros práticos, quem tem Urano pode agir de modo errático e não ser a pessoa indicada para cuidar dessas questões.",
   "Pode haver disputa entre as duas pessoas sobre quem controla o orçamento comum.",
   "Com Urano aflito e aspectos discordantes, uma atitude experimental demais de qualquer das duas pode levar a complicações indesejáveis."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "A autoavaliação radical e o trabalho sobre si tratam de mudança profunda de quem tem a casa."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:4"
    ],
    "justificativa": "A considerável atração física trata de atração e intimidade."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:1",
     "facilidades:3"
    ],
    "justificativa": "O comportamento errático nas finanças e a disputa pelo orçamento tratam de dinheiro e organização concreta."
   },
   {
    "categoria": "acao_desejo",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "A disputa sobre quem controla o orçamento é competição aberta."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Urano é aflito no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa depende de aspectos discordantes entre os mapas."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Uranus in the 8th",
   "pdfPaginaInicio": 127,
   "pdfPaginaFim": 128,
   "hash": "9988ebb219e25fbd"
  },
  "condicoesPorItem": {
   "tensoes[2]": {
    "natal": true,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "genero",
    "motivo": "condição de sexos opostos; sai."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel conjugal; o orçamento virou 'comum'."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "visão sobre a morte; fora do escopo e sob as palavras banidas."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "uranus@casa9",
  "planeta": "uranus",
  "casa": 9,
  "funcaoIntroduzida": "Quem tem Urano pode levar quem tem a casa a rever toda a sua filosofia de vida.",
  "campoAtivado": "A filosofia, a religião, os livros, as viagens e o estrangeiro.",
  "facilidades": [
   "As visões de quem tem Urano sobre filosofia e religião podem diferir muito das de quem tem a casa e abrir ideias que iluminam problemas antigos e desafiam atitudes.",
   "Quem tem Urano pode apresentar livros novos que estimulam quem tem a casa a seguir novas direções e a pensar de modo mais original.",
   "Quem tem Urano pode despertar maior interesse por países estrangeiros e viagens ao exterior, ou sugerir meios mais fáceis e rápidos de ir de um lugar a outro."
  ],
  "tensoes": [
   "Com Urano muito aflito, o desafio ao pensamento de quem tem a casa pode ser tão drástico que as ideias de quem tem Urano são rejeitadas por completo.",
   "As ideias de quem tem Urano podem ser tão extraordinárias ou perturbadoras que produzem total desestabilização ou apreensão em quem tem a casa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:0"
    ],
    "justificativa": "O conteúdo trata de ideias trocadas, livros, visões diferentes e a rejeição delas."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2"
    ],
    "justificativa": "Novas direções, interesse por países estrangeiros e viagens tratam de ampliação."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:0",
     "tensoes:1"
    ],
    "justificativa": "Rever atitudes e a desestabilização por ideias perturbadoras tratam de reavaliação e crise."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Urano é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Uranus in the 9th",
   "pdfPaginaInicio": 128,
   "pdfPaginaFim": 128,
   "hash": "0c0ab6963a746b55"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "uranus@casa10",
  "planeta": "uranus",
  "casa": 10,
  "funcaoIntroduzida": "Quem tem Urano pode afetar de modo marcante o rumo da carreira de quem tem a casa.",
  "campoAtivado": "A carreira, a reputação, a ocupação e o rumo profissional de quem tem a casa.",
  "facilidades": [
   "Quem tem Urano pode oferecer de repente uma oportunidade de avanço a quem tem a casa.",
   "Pelo exemplo, quem tem Urano pode levar quem tem a casa a se perguntar se faz o trabalho certo e segue o caminho certo para realizar seus objetivos.",
   "Quem tem Urano pode servir de exemplo útil do que não fazer quando seu comportamento parece extraordinário."
  ],
  "tensoes": [
   "Quem tem Urano pode parecer uma pessoa errática, e quem tem a casa pode sentir que sua reputação não sai valorizada pela associação.",
   "Com Urano aflito e aspectos discordantes, o efeito sobre os assuntos de quem tem a casa pode ser muito perturbador.",
   "Quem tem a casa pode considerar que nunca trabalharia para quem tem Urano nem permitiria que essa pessoa dirigisse sua vida."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:1"
    ],
    "justificativa": "O conteúdo trata de carreira, trabalho, oportunidade de avanço e assuntos profissionais."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "tensoes:0",
     "facilidades:1"
    ],
    "justificativa": "A reputação diante dos outros e o questionar-se sobre o próprio rumo tratam de senso de si."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:0",
     "tensoes:1"
    ],
    "justificativa": "A oportunidade repentina e o efeito perturbador sobre os assuntos tratam de mudança e ruptura."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Urano é aflito no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também depende de aspectos discordantes entre os mapas."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Se quem tem Urano é empregador de quem tem a casa, pode esperar muita iniciativa e adaptabilidade e atenção às mudanças."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Se quem tem Urano é adulto responsável por quem tem a casa, pode tentar ditar a ocupação a seguir ou incentivar um caminho original próprio."
   }
  ],
  "reforcoPorAngulo": "A leitura vale com mais ênfase quando Urano cai sobre o Meio do Céu de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Uranus in the 10th",
   "pdfPaginaInicio": 128,
   "pdfPaginaFim": 128,
   "hash": "961a22ab9f7155a2"
  },
  "condicoesPorItem": {
   "tensoes[1]": {
    "natal": true,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel de empregador; só nota de tipo de relação."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel parental; só nota de tipo de relação."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "uranus@casa11",
  "planeta": "uranus",
  "casa": 11,
  "funcaoIntroduzida": "Quem tem Urano pode apresentar a quem tem a casa sociedades e organizações dedicadas a ideais caros a essa pessoa, ou uma grande variedade de amigos.",
  "campoAtivado": "Os ideais, as amizades, os grupos e a ideia de fraternidade.",
  "facilidades": [
   "Quem tem Urano pode dar a quem tem a casa uma nova compreensão do conceito de fraternidade.",
   "Em momentos de emergência, quem tem Urano pode reagir de modo surpreendente e oferecer ajuda quando menos se espera."
  ],
  "tensoes": [
   "A independência de quem tem Urano pode lhe dar um ar casual, e uma associação próxima pode exigir que quem tem a casa vá além da metade do caminho.",
   "Com Urano aflito e aspectos discordantes, quem tem a casa pode nunca buscar a companhia de quem tem Urano no curso natural das coisas.",
   "Se forem reunidas pelo acaso, quem tem a casa pode se sentir claramente desconfortável na presença de quem tem Urano."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "Uma nova compreensão de fraternidade e novos grupos e amizades tratam de ampliação."
   },
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "facilidades:1",
     "tensoes:0"
    ],
    "justificativa": "Ajuda dada em emergência e esforço para sustentar a proximidade tratam de lealdade."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "tensoes:1",
     "tensoes:2"
    ],
    "justificativa": "O desconforto sentido na presença do outro trata de sensibilidade e segurança afetiva."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Urano é aflito no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma tensa também depende de aspectos discordantes entre os mapas."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Uranus in the 11th",
   "pdfPaginaInicio": 128,
   "pdfPaginaFim": 129,
   "hash": "4547c4abc7cf784e"
  },
  "condicoesPorItem": {
   "tensoes[1]": {
    "natal": true,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "regência natural como técnica; fora do escopo."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "uranus@casa12",
  "planeta": "uranus",
  "casa": 12,
  "funcaoIntroduzida": "Quem tem Urano pode levar quem tem a casa a mobilizar toda a sua simpatia e compreensão para encontrar um modo de lidar com quem tem Urano.",
  "campoAtivado": "A vulnerabilidade, a compreensão e o ajuste à vida como um todo de quem tem a casa, e o que acontece nos bastidores.",
  "facilidades": [
   "Com aspectos harmoniosos e Urano bem aspectado, quem tem Urano pode esclarecer os problemas de quem tem a casa e ajudar a se ajustar de modo mais satisfatório à vida, depois de alterações fundamentais em atitudes emocionais e intelectuais.",
   "Quem tem Urano pode propor remédios drásticos, e se quem tem a casa os adotar, pode alcançar resultados surpreendentes.",
   "Quem tem Urano pode atuar nos bastidores em favor de quem tem a casa com grande efeito."
  ],
  "tensoes": [
   "Quem tem a casa pode sentir tensão na presença de quem tem Urano.",
   "Com Urano aflito, quem tem Urano pode fazer quem tem a casa se sentir desconfortável e inadequada, com a impressão de uma trama secreta para explorar seus pontos mais fracos.",
   "Quem tem a casa pode imaginar que quem tem Urano é mais forte justamente onde quem tem a casa é vulnerável, e copiar seus métodos pode piorar as coisas."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:1"
    ],
    "justificativa": "A tensão e o desconforto na presença do outro tratam de sentimento, sensibilidade e empatia."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1"
    ],
    "justificativa": "Alterações fundamentais em atitudes e remédios drásticos tratam de mudança profunda."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma favorável vale com Urano bem aspectado, e a tensa, com Urano aflito no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A forma favorável depende de aspectos harmoniosos entre os mapas, e a tensa, de aspectos discordantes."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "O livro aponta atrito quando quem tem Urano é médico ou cuida da enfermagem de quem tem a casa."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Uranus in the 12th",
   "pdfPaginaInicio": 129,
   "pdfPaginaFim": 129,
   "hash": "82ee1937d4094fee"
  },
  "condicoesPorItem": {
   "tensoes[1]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "a leitura vem escrita como planeta do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "juízo sobre a posição; virou nota de tipo de relação."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal do planeta, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "neptune@casa1",
  "planeta": "neptune",
  "casa": 1,
  "funcaoIntroduzida": "Quem tem Netuno pode alcançar quem tem a casa pelas emoções e pelos impulsos de compaixão.",
  "campoAtivado": "A autoapresentação de quem tem a casa, suas emoções e seus impulsos de compaixão.",
  "facilidades": [
   "Pode aprofundar o sentimento de quem tem a casa pelas pessoas em situação de carência.",
   "Pode interpretar sonhos e explicar fantasias de quem tem a casa.",
   "A presença de quem tem Netuno pode ser muito relaxante e tranquilizadora.",
   "Pode mostrar a quem tem a casa como se dramatizar com mais eficácia.",
   "Com aspectos favoráveis entre os mapas, pode mostrar como alcançar o desejo do coração."
  ],
  "tensoes": [
   "Pode haver o risco de alimentar as ilusões de quem tem a casa.",
   "Pode haver identificação com as emoções de quem tem Netuno e simpatia conduzida além da medida.",
   "O que parecia promissor pode acabar em decepção quando o desejo envolve vantagem pessoal à custa de outros.",
   "As duas pessoas podem formar uma imagem totalmente errada uma da outra.",
   "Quem tem Netuno pode ser fonte de decepção, por vezes por um equívoco de quem tem a casa."
  ],
  "excessosPossiveis": [
   "Em casos extremos, pode haver engano deliberado e envolvimento em escândalo que atinge a reputação de quem tem a casa."
  ],
  "dimensoes": [
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2",
     "tensoes:1"
    ],
    "justificativa": "Trata de sentimento, compaixão e simpatia que fluem ou se confundem entre as duas pessoas."
   },
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "O núcleo é interpretar sonhos e explicar fantasias, ou seja, uma forma de troca de sentido."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:3"
    ],
    "justificativa": "Trata de como quem tem a casa se apresenta e se dramatiza com mais eficácia."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Netuno é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Netuno sejam favoráveis ou discordantes."
   }
  ],
  "reforcoPorAngulo": "A leitura se destaca quando Netuno cai em conjunção com o Ascendente de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Neptune in the 1st House",
   "pdfPaginaInicio": 129,
   "pdfPaginaFim": 130,
   "hash": "d39b90948e7af252"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como neptune do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "mantida só a percepção de pouca confiabilidade, sem julgar a pessoa."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Netuno, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "neptune@casa2",
  "planeta": "neptune",
  "casa": 2,
  "funcaoIntroduzida": "Quem tem Netuno pode inspirar ideias sobre distribuir recursos em favor dos necessitados.",
  "campoAtivado": "Dinheiro, posses e o modo de lidar com os recursos de quem tem a casa.",
  "facilidades": [
   "Pode testar a capacidade de quem tem a casa de soltar as rédeas do dinheiro e adotar mais generosidade.",
   "Pode ter palpites felizes que funcionam bem para quem tem Netuno."
  ],
  "tensoes": [
   "Esses planos de distribuição podem se revelar impraticáveis e sem serviço real.",
   "Pode surgir a tentação de comprar a simpatia de quem tem Netuno por meio da generosidade.",
   "Quem tem Netuno pode se impor aos impulsos de caridade de quem tem a casa ou explorar sua credulidade.",
   "A inveja pode estar na raiz da relação financeira.",
   "Quadros animadores de ganho podem levar a perder o pé, ou circunstâncias externas podem desfazer planos bem montados.",
   "O conselho de quem tem Netuno pode falhar justamente quando é repassado a quem tem a casa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:4",
     "facilidades:0"
    ],
    "justificativa": "Trata de dinheiro, planos financeiros e destino concreto dos recursos."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "A generosidade e a mão mais aberta com o dinheiro são ampliação do que se dá."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:3",
     "tensoes:5"
    ],
    "justificativa": "A inveja e o conselho que falha restringem o alcance dos planos financeiros."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Netuno é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Netuno sejam favoráveis ou discordantes."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Neptune in the 2nd",
   "pdfPaginaInicio": 130,
   "pdfPaginaFim": 130,
   "hash": "ac1a799f6e97972d"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como neptune do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; a dinâmica de influência sobre as finanças foi mantida nas tensões."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; sai a recomendação."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "lição moral e julgamento de quem tem a casa; não é dinâmica descritiva."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Netuno, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "neptune@casa3",
  "planeta": "neptune",
  "casa": 3,
  "funcaoIntroduzida": "Quem tem Netuno pode estimular a imaginação e a apreciação poética de quem tem a casa.",
  "campoAtivado": "Processos mentais, educação, aprendizado, informações e viagens.",
  "facilidades": [
   "Pode acrescentar ao raciocínio comum uma dimensão de percepção intuitiva.",
   "Pode ter o dom de pintar as ideias em imagens que chegam com mais vivacidade a quem tem a casa.",
   "Pode tornar o estudo e o aprendizado mais atraentes para quem tem a casa.",
   "Pode levar a uma visão menos rígida do saber e a ampliar a base de estudo, abandonando o exclusivismo.",
   "Pode captar pensamentos de modo telepático e ampliar a intuição de quem tem a casa.",
   "Com aspectos favoráveis a Netuno, pode despertar o desejo de viajar por relatos fascinantes, inclusive por mar ou ar."
  ],
  "tensoes": [
   "Pode haver confusão mental, e as imagens evocadas podem admitir mais de uma interpretação.",
   "As opiniões de quem tem Netuno, ou o que quem tem a casa imagina que sejam, podem desviar e deixar quem tem a casa confusa.",
   "Pode haver informação errada sobre horários e comodidades de viagem, ou uma viagem inútil."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2",
     "tensoes:0",
     "tensoes:2"
    ],
    "justificativa": "Trata de como imagens, informações e ideias são transmitidas, compreendidas ou confundidas."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:3",
     "facilidades:5"
    ],
    "justificativa": "Trata de ampliar a base de estudo e despertar o desejo de viajar."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:4"
    ],
    "justificativa": "Trata de intuição, imaginação e sensibilidade que ampliam a percepção."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Netuno é afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Netuno sejam favoráveis ou discordantes."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Em relação de ensino, a posição pede mais cautela para quem ensina, salvo aspectos muito favoráveis entre os mapas."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Neptune in the 3rd",
   "pdfPaginaInicio": 130,
   "pdfPaginaFim": 131,
   "hash": "8d161f5aa97b9d3e"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como neptune do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento da pessoa; ficou só o efeito de desvio e confusão."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "avaliação de valor; preservada só como nota de relação de ensino."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; ficou a confusão possível."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Netuno, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "neptune@casa4",
  "planeta": "neptune",
  "casa": 4,
  "funcaoIntroduzida": "Quem tem Netuno pode agir de modo sutil sobre o ambiente doméstico de quem tem a casa.",
  "campoAtivado": "Lar, ambiente doméstico, reações instintivas, hábitos, criação recebida e propriedade.",
  "facilidades": [
   "Os hábitos e as reações instintivas de quem tem a casa podem encontrar aprovação solidária."
  ],
  "tensoes": [
   "Os hábitos e as reações instintivas podem encontrar desconfiança sem motivo claro.",
   "A convivência pode afrouxar o efeito da criação familiar e tentar a abandonar princípios da infância.",
   "Pode haver um pedido sutil de hospedagem, apoiado nos impulsos de caridade, e sensação de obrigação de oferecer abrigo.",
   "Negociações sobre compra ou venda de imóveis podem ser mal conduzidas ou ter algum elemento de engano.",
   "Pode haver uma deterioração sutil do clima doméstico e descuido com alguma cautela essencial."
  ],
  "excessosPossiveis": [
   "Pode haver dissipação do patrimônio de quem tem a casa, ou incentivo a dissipá-lo.",
   "Pode haver tentativa de enganar quem tem a casa quanto a uma herança e envolvimento em escândalo."
  ],
  "dimensoes": [
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:0",
     "tensoes:0",
     "tensoes:2"
    ],
    "justificativa": "Trata de aprovação, desconfiança e obrigações afetivas nas reações instintivas e domésticas."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "tensoes:3",
     "excessosPossiveis:0",
     "excessosPossiveis:1"
    ],
    "justificativa": "Trata de imóveis, patrimônio e herança, ou seja, recursos concretos da casa e da família."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "Trata do afrouxamento de princípios recebidos na criação familiar."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Netuno é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Netuno sejam favoráveis ou discordantes."
   }
  ],
  "reforcoPorAngulo": "A leitura se destaca quando Netuno cai em conjunção com o IC (Fundo do Céu) de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Neptune in the 4th",
   "pdfPaginaInicio": 131,
   "pdfPaginaFim": 131,
   "hash": "2ea09fe6a1be1620"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como neptune do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "diagnostico",
    "motivo": "condição de saúde de terceiro; fora do repertório."
   },
   {
    "categoria": "papel_social",
    "motivo": "relação entre gerações e papel familiar, no sentido inverso; não vira versão separada."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Netuno, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "neptune@casa5",
  "planeta": "neptune",
  "casa": 5,
  "funcaoIntroduzida": "Quem tem Netuno pode ampliar a visão artística de quem tem a casa e somar uma dimensão sutil à sua criatividade.",
  "campoAtivado": "Criação, expressão pessoal, lazer e romance.",
  "facilidades": [
   "Pode inspirar quem tem a casa a se mostrar de modo mais dramático e trazer idealismo às atividades mais queridas.",
   "Pode ampliar o alcance das atividades de lazer.",
   "Pode estimular sonhos de romance ou fantasias românticas compartilhadas.",
   "Pode desafiar a viver à altura dos mais altos ideais românticos, lembrando que o amor pode pedir entrega e disposição ao sacrifício.",
   "Pode desenvolver o reconhecimento intuitivo de ser objeto de afeição e refinar a natureza do próprio afeto.",
   "No ponto mais alto, pode oferecer inspiração para alcançar o ápice do esforço criativo."
  ],
  "tensoes": [
   "Com Netuno muito afligido, o resultado pode ser decepcionante ou uma caricatura sutil e desagradável da relação amorosa.",
   "Pode drenar sutilmente a vitalidade de quem tem a casa ou levar a dissipá-la em empreendimentos infrutíferos."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:5"
    ],
    "justificativa": "Trata de autoexpressão criativa e de exibir a própria personalidade com mais ousadia."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:2",
     "facilidades:3",
     "facilidades:4",
     "tensoes:0"
    ],
    "justificativa": "Trata de romance, afeição e idealização amorosa, ou de sua decepção."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "Trata de vitalidade que se esvai ou se dissipa em esforços sem fruto."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Netuno é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Neptune in the 5th",
   "pdfPaginaInicio": 131,
   "pdfPaginaFim": 131,
   "hash": "3099a92e2b1d4aab"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como neptune do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "condição de idade como pressuposto de romance; não modelada."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Netuno, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "neptune@casa6",
  "planeta": "neptune",
  "casa": 6,
  "funcaoIntroduzida": "Quem tem Netuno pode borrar o foco com que quem tem a casa conduz suas operações técnicas.",
  "campoAtivado": "Trabalho, serviço, eficiência e métodos de quem tem a casa.",
  "facilidades": [
   "Quem tem Netuno pode ser muito solidário com os problemas de quem tem a casa.",
   "Pode estimular uma atitude mais idealista de quem tem a casa diante de prestar serviço.",
   "Com Netuno bem aspectado e aspectos favoráveis entre os mapas, pode ter um efeito calmante."
  ],
  "tensoes": [
   "A eficiência de quem tem a casa pode ficar prejudicada.",
   "Pode haver pouca apreciação dos métodos de quem tem a casa.",
   "Sugestões pouco práticas podem tirar o rumo de quem tem a casa, que pode sentir que a ajuda atrapalhou."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:1",
     "tensoes:2",
     "facilidades:1"
    ],
    "justificativa": "Trata de eficiência, métodos de trabalho e atitude diante do serviço prestado."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2"
    ],
    "justificativa": "Trata de solidariedade e de efeito calmante sobre quem tem a casa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Netuno é afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Netuno sejam favoráveis ou discordantes."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Na relação de trabalho, quem tem Netuno em posição de empregado pode interpretar mal as direções e atrair confusão; em posição de quem emprega, pode ser vago ao passar instruções e lento em medidas práticas de cuidado."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Neptune in the 6th",
   "pdfPaginaInicio": 131,
   "pdfPaginaFim": 132,
   "hash": "29d2062331941b02"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como neptune do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "avaliação de valor sobre a posição em relação de trabalho; ficou só a dinâmica em nota de tipo de relação."
   },
   {
    "categoria": "diagnostico",
    "motivo": "condição de saúde de terceiro; fora do repertório."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Netuno, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "neptune@casa7",
  "planeta": "neptune",
  "casa": 7,
  "funcaoIntroduzida": "Quem tem Netuno pode parecer a quem tem a casa a parceria ideal.",
  "campoAtivado": "Parcerias, relações de a dois e o círculo de associados.",
  "facilidades": [
   "Pode ampliar o círculo de associados de quem tem a casa.",
   "Um certo encanto fascinante pode permanecer, sugerindo uma promessa de comunhão mística.",
   "A experiência pode acostumar a dar liberdade de pensamento e ação aos outros, apoiando-se em vínculos de compreensão compassiva.",
   "Pode aguçar a percepção intuitiva dos elementos de compatibilidade no outro e mostrar a necessidade de sacrifícios numa parceria harmônica.",
   "Pode ajudar a perceber que compreender com compaixão as diferenças de temperamento dissolve barreiras entre as pessoas."
  ],
  "tensoes": [
   "Pode surgir a ilusão de uma felicidade inatingível, e a união imaginada pode não se realizar.",
   "Quem tem Netuno pode permanecer esquivo e fora de alcance.",
   "Pode ser impossível estabelecer uma sintonia satisfatória, e quem tem Netuno pode parecer pouco confiável e sem virtudes práticas."
  ],
  "excessosPossiveis": [
   "Pode haver deturpação deliberada da imagem de quem tem a casa e tentativa de prejudicar sua reputação."
  ],
  "dimensoes": [
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:1",
     "tensoes:0",
     "tensoes:1"
    ],
    "justificativa": "Trata de idealização da parceria, encanto e esquiva na relação entre as duas pessoas."
   },
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "facilidades:2",
     "facilidades:3"
    ],
    "justificativa": "Trata de como se sustenta o vínculo, com liberdade, compaixão e sacrifícios."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "O núcleo é ampliar o círculo de associados de quem tem a casa."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:4",
     "tensoes:2"
    ],
    "justificativa": "Trata de compreensão compassiva ou da falta de sintonia entre as duas pessoas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Netuno é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Netuno sejam favoráveis ou discordantes."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Em relação em que quem tem Netuno atua em nome da outra pessoa, como representante, a leitura tensa pesa mais."
   }
  ],
  "reforcoPorAngulo": "A leitura se destaca quando Netuno cai em conjunção com o Descendente de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Neptune in the 7th",
   "pdfPaginaInicio": 132,
   "pdfPaginaFim": 132,
   "hash": "d6ce5cc82cb03825"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como neptune do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de casamento; descartada."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; ficou apenas o que a experiência pode trazer."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "avaliação de valor sobre quem atua em nome de outro; preservada só como nota de tipo de relação."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Netuno, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "neptune@casa8",
  "planeta": "neptune",
  "casa": 8,
  "funcaoIntroduzida": "Quem tem Netuno pode despertar um descontentamento sutil e uma vaga percepção da necessidade de transformação.",
  "campoAtivado": "Transformação, desejo, o oculto e estados de consciência após a vida física.",
  "facilidades": [
   "O vínculo pode ser muito proveitoso quando há interesse comum, latente ou crescente, pelo oculto e por estados de consciência após a vida física.",
   "Pode mostrar que a autotransformação passa por algum sacrifício, com purificação dos desejos."
  ],
  "tensoes": [
   "O vínculo raramente é inteiramente confortável.",
   "O sentimento pode ser tão vago que o desejo de mudar dificilmente ganha impulso.",
   "A sensação geral de inquietação pode crescer aos poucos até dissolver as últimas resistências.",
   "Pode haver risco de uma atitude nebulosa diante do oculto.",
   "Pode explorar o medo do desconhecido e do que vem depois da vida.",
   "Se há relação sexual, o vínculo pode trazer problemas de desejo não satisfeito."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:1",
     "tensoes:1",
     "tensoes:2"
    ],
    "justificativa": "Trata de mudança profunda de si, de resistências que se dissolvem e de sacrifício que purifica o desejo."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:4"
    ],
    "justificativa": "Trata de mal-estar, medo e sensação de desconforto na relação."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "tensoes:5"
    ],
    "justificativa": "Trata do desejo e da intimidade sexual que podem ficar sem satisfação."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Netuno é afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Netuno sejam favoráveis ou discordantes."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Neptune in the 8th",
   "pdfPaginaInicio": 132,
   "pdfPaginaFim": 132,
   "hash": "a9a46ae0a476d99f"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como neptune do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; ficou o risco de atitude nebulosa."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; sai a recomendação."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "avaliação de valor sobre quem cuida dos negócios de outro; fora do repertório neutro quanto ao vínculo."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "parentes e herança são um tipo de relação específico; não vira versão separada."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento sobre parte da natureza; ficou apenas a purificação dos desejos."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Netuno, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "neptune@casa9",
  "planeta": "neptune",
  "casa": 9,
  "funcaoIntroduzida": "Quem tem Netuno pode elevar e espiritualizar a visão geral de vida de quem tem a casa.",
  "campoAtivado": "Visão de mundo, religião, filosofia, estudos superiores e viagens.",
  "facilidades": [
   "Pode encorajar a ampliar fronteiras e cultivar uma atitude mais receptiva às ideias.",
   "As experiências vividas juntas podem enfraquecer a reverência excessiva ao dogma.",
   "Pode trazer uma compreensão mais compassiva do ensino religioso formal.",
   "Como quem ensina, pode despertar a imaginação e dar novo apelo a temas antes tidos como comuns.",
   "Relatos entusiasmados de experiências no exterior podem despertar um desejo inquieto de viajar.",
   "Pode ajudar a ampliar os horizontes em sentido espiritual, mental e físico."
  ],
  "tensoes": [
   "Com Netuno afligido, pode despertar falsas esperanças e embaçar a compreensão clara de questões religiosas e filosóficas.",
   "Quem tem Netuno pode ser percebido como um falso profeta."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:3",
     "facilidades:4",
     "facilidades:5"
    ],
    "justificativa": "Trata de ampliar fronteiras, horizontes, interesses de estudo e vontade de viajar."
   },
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "tensoes:0",
     "facilidades:3"
    ],
    "justificativa": "Trata de como ideias religiosas e filosóficas são transmitidas, clareadas ou embaçadas."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2"
    ],
    "justificativa": "Trata de como quem tem a casa se relaciona com dogma e crença e com a própria visão."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Netuno é proeminente e muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Netuno sejam favoráveis ou discordantes."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Neptune in the 9th",
   "pdfPaginaInicio": 133,
   "pdfPaginaFim": 133,
   "hash": "f3250e41c3548a14"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como neptune do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "referência política datada e específica; não é dinâmica relacional."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "avaliação de valor sobre um tipo de relação; fora do repertório neutro quanto ao vínculo."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "afirmação sobre o passado da relação; ficou apenas a ligação possível com viagens."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Netuno, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "neptune@casa10",
  "planeta": "neptune",
  "casa": 10,
  "funcaoIntroduzida": "Quem tem Netuno pode inspirar quem tem a casa a elevar seu objetivo consciente de vida.",
  "campoAtivado": "Carreira, objetivo de vida, reputação e figuras de exemplo.",
  "facilidades": [
   "O desfecho pode ser elevar as metas e o pensamento de quem tem a casa rumo a esforços cada vez mais altos.",
   "Quem tem Netuno pode dar muito valor ao apreço de quem tem a casa por sua reputação."
  ],
  "tensoes": [
   "Quanto mais quem tem a casa progride, mais inalcançável a meta pode parecer, com risco de desânimo.",
   "Se tomado como exemplo, pode haver desânimo, sensação de comparação desigual ou de oportunidades negadas.",
   "Os objetivos de quem tem a casa podem ser sutilmente distorcidos ou ficar borrados.",
   "Em situação de rivalidade, pode haver manobra para tirar quem tem a casa de uma promoção e minar sua posição.",
   "A reputação de quem tem a casa pode ser prejudicada, por escândalo ou por descuido e mal-entendido de quem tem Netuno.",
   "Em vínculo próximo, a carreira de quem tem a casa pode ser sacrificada por limitações de quem tem Netuno."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:0",
     "tensoes:4"
    ],
    "justificativa": "Trata de objetivos, reconhecimento, reputação e autoestima na carreira."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:2",
     "tensoes:3",
     "tensoes:5"
    ],
    "justificativa": "Trata de metas distorcidas, posição minada e carreira sacrificada, que contêm o avanço."
   },
   {
    "categoria": "acao_desejo",
    "sustentadaPor": [
     "tensoes:3"
    ],
    "justificativa": "Trata de rivalidade e manobra por uma promoção."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Netuno é afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Netuno sejam favoráveis ou discordantes."
   }
  ],
  "reforcoPorAngulo": "A leitura se destaca quando Netuno cai em conjunção com o Meio do Céu de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Neptune in the 10th",
   "pdfPaginaInicio": 133,
   "pdfPaginaFim": 133,
   "hash": "e1cabc47f5d57cc7"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como neptune do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "diagnostico",
    "motivo": "condição de saúde de terceiro; ficou só a limitação de quem tem Netuno."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "exemplo de relação entre gerações; ficou só o efeito de comparação e desânimo."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Netuno, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "neptune@casa11",
  "planeta": "neptune",
  "casa": 11,
  "funcaoIntroduzida": "Quem tem Netuno pode parecer a quem tem a casa um amigo especialmente desejável.",
  "campoAtivado": "Amizades, grupos, ideais comuns e vida social.",
  "facilidades": [
   "Pode apresentar grupos formados para promover um ideal e ampliar o círculo de amizades, com pessoas de interesses artísticos.",
   "A amizade pode florescer quando mantida com rédea solta.",
   "Quando há distância geográfica, as diferenças de experiência podem ser muito divertidas para as duas pessoas.",
   "As duas pessoas podem ter muito prazer em atividades de lazer juntas.",
   "Pode ser ocasião de cultivar a amizade sem amarras e de aceitar que nem sempre se vive em êxtase."
  ],
  "tensoes": [
   "Se os motivos para buscar a amizade têm algum interesse oculto, a relação pode ser muito diferente do esperado.",
   "Quem tem Netuno pode parecer em condição de realizar as esperanças mais extravagantes e os desejos mais caros.",
   "O contato regular não é favorecido, e a relação pode ser do tipo ganha-fácil, perde-fácil.",
   "Dificuldades de quem tem Netuno podem pedir sacrifícios e despertar a compaixão de quem tem a casa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:4",
     "tensoes:0",
     "tensoes:2"
    ],
    "justificativa": "Trata de amizade, afeição e do grau de proximidade e apego entre as duas pessoas."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:3"
    ],
    "justificativa": "Trata de ampliar o círculo de amigos e o prazer de atividades de lazer."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "tensoes:3"
    ],
    "justificativa": "Trata de compaixão e sacrifício diante das dificuldades da outra pessoa."
   }
  ],
  "condicionadoPor": [],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Neptune in the 11th",
   "pdfPaginaInicio": 133,
   "pdfPaginaFim": 133,
   "hash": "e77fbaefff0ee9b3"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como neptune do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "diagnostico",
    "motivo": "condição de saúde de terceiro; ficaram só as circunstâncias difíceis."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "mantido só como aparência de desejável, sem julgar a pessoa."
   }
  ]
 },
 {
  "id": "neptune@casa12",
  "planeta": "neptune",
  "casa": 12,
  "funcaoIntroduzida": "Quem tem Netuno pode permitir a quem tem a casa ajustar-se com mais facilidade aos problemas da vida.",
  "campoAtivado": "Vulnerabilidades ocultas, escapismo, assistência a quem tem carência e interesses psíquicos.",
  "facilidades": [
   "Pode estimular uma atitude mais relaxada diante dos problemas da vida.",
   "Pode despertar os instintos mais caridosos e abrir caminho para ajudar pessoas em carência, ou quem tem Netuno pode carecer da simpatia de quem tem a casa.",
   "Um interesse comum por temas psíquicos ou pelo misticismo pode aproximar as duas pessoas.",
   "Pode aguçar o reconhecimento intuitivo de quem realmente carece de simpatia e apoio.",
   "Pode levar a abrir mão de aspectos da personalidade que atuam contra os próprios interesses."
  ],
  "tensoes": [
   "Com aspectos discordantes, a relação pode levar ao escapismo, aprofundando as dificuldades e afastando uma solução.",
   "Sem aspectos favoráveis e mistura harmônica dos mapas, as experiências podem ficar abaixo do esperado e, em casos extremos, ser desagradáveis.",
   "Pode haver risco de confiar segredos de modo imprudente e expor pontos fracos a outros."
  ],
  "excessosPossiveis": [
   "Com Netuno afligido, pode haver traição ou atração a uma situação em que a própria pessoa precipita sua ruína."
  ],
  "dimensoes": [
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:3",
     "tensoes:2"
    ],
    "justificativa": "Trata de compaixão, simpatia e exposição de fragilidades."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:4",
     "tensoes:0",
     "excessosPossiveis:0"
    ],
    "justificativa": "Trata de abrir mão de traços de si, escapismo e ruína, ou seja, mudança ou dissolução profunda."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "Trata de adotar uma postura mais relaxada diante das dificuldades da vida."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A leitura depende da condição natal de Netuno e do estado da casa 12 de quem tem a casa; essas condições não são calculadas nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Netuno sejam favoráveis ou discordantes."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [
   "A leitura depende do estado da casa 12 de quem tem a casa, e esse estado não é calculado nesta versão."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Neptune in the 12th",
   "pdfPaginaInicio": 134,
   "pdfPaginaFim": 134,
   "hash": "0d6decce7b905e7b"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": false,
    "aspectos": true
   },
   "excessosPossiveis[0]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como neptune do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; ficou o risco de expor segredos."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento da pessoa; retirado."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "finalidade espiritual; fora do escopo."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Netuno, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "pluto@casa1",
  "planeta": "pluto",
  "casa": 1,
  "funcaoIntroduzida": "Quem tem Plutão pode levar quem tem a casa a tomar consciência de um motivo oculto para agir.",
  "campoAtivado": "Identidade, autoimagem e a essência que a pessoa mostra ou não ao mundo.",
  "facilidades": [
   "Quem tem Plutão pode se sentir atraído por uma potencialidade de quem tem a casa ou por uma faceta que os outros não notam de imediato.",
   "A relação pode despertar o impulso de ser cada vez mais o seu eu essencial.",
   "Pode haver uma transformação que torna quem tem a casa mais completa e integrada.",
   "A relação pode ter significado profundo, com forte potencial de proveito ou dano mútuo, conforme os aspectos entre os mapas.",
   "Pode haver forte carga emotiva entre as duas pessoas e assuntos inacabados a resolver.",
   "Uma situação de perigo vivida juntos pode levar a refletir sobre a finitude e a rever a atitude diante de uma possível continuação depois da vida."
  ],
  "tensoes": [
   "Com Plutão muito afligido e aspectos discordantes, a relação pode ser especialmente prejudicial a quem tem a casa.",
   "Quem tem Plutão pode projetar em quem tem a casa algo profundo que percebe em si e responsabilizá-la por isso, o que gera inimizade."
  ],
  "excessosPossiveis": [
   "Em alguns casos, pode haver domínio hipnótico, com sensação de compulsão a agir ou a adotar certas crenças."
  ],
  "dimensoes": [
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1"
    ],
    "justificativa": "Trata da essência de quem tem a casa e do impulso de ser mais plenamente ela mesma."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:2",
     "facilidades:5",
     "tensoes:1"
    ],
    "justificativa": "Trata de mudança profunda, tomada de consciência de motivos ocultos e reavaliação de crenças."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:4",
     "tensoes:1"
    ],
    "justificativa": "Trata de atração, carga emotiva intensa entre as duas pessoas e inimizade que pode surgir."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Plutão é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Plutão sejam favoráveis ou discordantes."
   }
  ],
  "reforcoPorAngulo": "A leitura se destaca quando Plutão está em conjunção com o Ascendente de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Pluto in the 1st House",
   "pdfPaginaInicio": 135,
   "pdfPaginaFim": 135,
   "hash": "8c890eeaa4195e99"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": true,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como pluto do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "karma",
    "motivo": "causa atribuída a vida anterior; ficou só a carga emotiva possível."
   },
   {
    "categoria": "fatalismo",
    "motivo": "certeza afirmada sobre o significado; reescrito como possibilidade."
   },
   {
    "categoria": "diagnostico",
    "motivo": "diagnóstico psicológico; ficou só a projeção de algo profundo."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel de gênero na dinâmica de domínio; mantido só como dominância hipnótica entre as duas pessoas."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Plutão, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "pluto@casa2",
  "planeta": "pluto",
  "casa": 2,
  "funcaoIntroduzida": "Quem tem Plutão pode levar quem tem a casa a perceber os motivos mais profundos de sua atitude diante do dinheiro e das posses.",
  "campoAtivado": "Dinheiro, posses, valores e segurança.",
  "facilidades": [
   "Pode levar a perguntar em que se baseia o padrão de valores e a reexaminar a atitude diante da segurança.",
   "Com aspectos muito harmônicos entre os mapas, pode haver ganho financeiro."
  ],
  "tensoes": [
   "Com Plutão afligido, podem ocorrer perdas que levam a refletir que a riqueza verdadeira não se mede só pelo material.",
   "Quem tem Plutão pode ter interesse especial pelas finanças de quem tem a casa, com promessa de uma virada financeira espetacular."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:1",
     "tensoes:0",
     "tensoes:1"
    ],
    "justificativa": "Trata de ganho, perda e condução das finanças de quem tem a casa."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:0",
     "tensoes:0"
    ],
    "justificativa": "Trata de reavaliar valores e segurança por meio de motivos profundos revelados."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Plutão é afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Plutão sejam favoráveis ou discordantes."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Pluto in the 2nd",
   "pdfPaginaInicio": 135,
   "pdfPaginaFim": 135,
   "hash": "debffde7a22234a1"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como pluto do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; ficou o interesse de quem tem Plutão pelas finanças."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Plutão, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "pluto@casa3",
  "planeta": "pluto",
  "casa": 3,
  "funcaoIntroduzida": "Quem tem Plutão pode ter forte efeito sobre o modo de pensar de quem tem a casa.",
  "campoAtivado": "Pensamento, ideias, aprendizado e comunicação.",
  "facilidades": [
   "As ideias de quem tem Plutão podem desafiar a pensar de modo novo e pôr em contato com áreas de conhecimento que renovam a visão das coisas.",
   "Pode haver reciprocidade, e ideias de quem tem a casa podem ganhar para quem tem Plutão um significado antes não percebido."
  ],
  "tensoes": [
   "Pode haver tentativa de coagir quem tem a casa a apenas copiar os padrões de pensamento de quem tem Plutão."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:0"
    ],
    "justificativa": "Trata de como as ideias circulam, se influenciam e são impostas ou trocadas entre as duas pessoas."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "Trata de adotar uma maneira inteiramente nova de ver as coisas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "tipo_de_relacao",
    "nota": "Em relações entre gerações, quem tem Plutão pode ter interesse especial na educação da outra pessoa e querer ditar seu rumo."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Pluto in the 3rd",
   "pdfPaginaInicio": 135,
   "pdfPaginaFim": 135,
   "hash": "ea6d94a10d81cf9e"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como pluto do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; ficou a tentativa de coagir."
   },
   {
    "categoria": "papel_social",
    "motivo": "relação entre gerações; preservada só como nota de tipo de relação."
   }
  ]
 },
 {
  "id": "pluto@casa4",
  "planeta": "pluto",
  "casa": 4,
  "funcaoIntroduzida": "Quem tem Plutão pode tornar quem tem a casa consciente de respostas instintivas e habituais antes quase automáticas.",
  "campoAtivado": "Lar, raízes, reações instintivas, ambiente doméstico e carreira.",
  "facilidades": [
   "Pode haver sentimentos fortes, baseados em atração e repulsa instintivas.",
   "Pode evocar lembranças vívidas de experiências passadas que tomam conta de quem tem a casa.",
   "Pode exercer forte pressão sobre o ambiente doméstico e talvez sobre a carreira de quem tem a casa."
  ],
  "tensoes": [
   "Com aspectos discordantes, a carreira pode ser prejudicada ao ser revelado um deslize antigo que atinge a reputação."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1"
    ],
    "justificativa": "Trata de instinto, atração, repulsa e lembranças vívidas."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:2",
     "tensoes:0"
    ],
    "justificativa": "Trata do ambiente doméstico e da carreira de quem tem a casa."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "Trata de lembranças que tomam conta e produzem forte efeito psicológico."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Plutão sejam favoráveis ou discordantes."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Em relações entre gerações, quem tem Plutão pode pesar muito na criação, querer ditar a carreira e seguir seus passos, e incentivar a sair de casa cedo ou a ficar por mais tempo, conforme os aspectos."
   }
  ],
  "reforcoPorAngulo": "A leitura se destaca quando Plutão cai em conjunção com o IC (Fundo do Céu) de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Pluto in the 4th",
   "pdfPaginaInicio": 136,
   "pdfPaginaFim": 136,
   "hash": "0de924df0957ed77"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": false,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como pluto do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "karma",
    "motivo": "atribuição a vida anterior; ficou só a lembrança vívida."
   },
   {
    "categoria": "papel_social",
    "motivo": "relação entre gerações; preservada só como nota de tipo de relação."
   }
  ]
 },
 {
  "id": "pluto@casa5",
  "planeta": "pluto",
  "casa": 5,
  "funcaoIntroduzida": "Quem tem Plutão pode tornar quem tem a casa consciente de talentos criativos latentes e permitir desenvolvê-los de modo dramático.",
  "campoAtivado": "Criação, lazer, prazer, romance e vida afetiva.",
  "facilidades": [
   "Pode haver vínculo emocional muito forte, cuja natureza e desenvolvimento dependem dos aspectos entre os mapas.",
   "Pode haver suscetibilidade a se envolver emocionalmente com pessoas da mesma geração.",
   "Pode estimular a investigar os motivos subjacentes a essa suscetibilidade.",
   "Se as paixões ficam muito envolvidas, pode haver uma transformação de toda a atitude diante dos assuntos do coração.",
   "Pode ter efeito de longo alcance sobre a atitude diante do lazer, do prazer e das atividades de tempo livre."
  ],
  "tensoes": [
   "Com Plutão afligido e aspectos discordantes, a ação de quem tem Plutão sobre os filhos de quem tem a casa pode ser indesejada."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:3"
    ],
    "justificativa": "Trata de vínculo emocional intenso, paixão e envolvimento afetivo."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:2",
     "facilidades:3"
    ],
    "justificativa": "Trata de investigar motivos profundos e transformar a atitude diante dos assuntos do coração."
   },
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:4"
    ],
    "justificativa": "Trata de lazer, prazer e criação como expressão pessoal de quem tem a casa."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Plutão é afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Plutão sejam favoráveis ou discordantes."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Em relações entre gerações, quem tem Plutão pode incentivar a livre expressão ou ditar o lazer e interferir nos amores; no sentido inverso, quem tem a casa pode ficar absorvido na vida da outra pessoa."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Pluto in the 5th",
   "pdfPaginaInicio": 136,
   "pdfPaginaFim": 136,
   "hash": "36ccddac51d165f5"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": true,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como pluto do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "karma",
    "motivo": "atribuição de vínculo kármico; descartada."
   },
   {
    "categoria": "papel_social",
    "motivo": "relação entre gerações; preservada só como nota de tipo de relação."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "condição de idade como pressuposto de envolvimento; não modelada."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Plutão, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "pluto@casa6",
  "planeta": "pluto",
  "casa": 6,
  "funcaoIntroduzida": "Quem tem Plutão pode fazer exigências sobre os serviços de quem tem a casa.",
  "campoAtivado": "Trabalho, serviço, métodos, rotina e atenção ao corpo.",
  "facilidades": [
   "Pode ser um desafio contínuo a revisar e aprimorar os métodos, se o conhecimento técnico é insuficiente.",
   "Pode levar a revisar totalmente a atitude diante do trabalho subordinado e de quem presta serviço.",
   "Pode tornar mais consciente a atitude interior diante de prestar e de receber serviço.",
   "Pode mostrar maneiras de aprimorar a alimentação e novos exercícios que favorecem a forma física.",
   "O modo de vida de quem tem Plutão pode ser um desafio a adotar uma rotina semelhante."
  ],
  "tensoes": [
   "A relação pode ser desconfortável, com a sensação de estar em prova, sob escrutínio contínuo.",
   "Pode haver efeito sutil e de longo alcance sobre a saúde, por sentir quem tem Plutão exigente e crítico demais, sem necessária justificativa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "facilidades:3",
     "facilidades:4"
    ],
    "justificativa": "Trata de métodos de trabalho, serviço, alimentação, exercício e rotina."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:0",
     "tensoes:1"
    ],
    "justificativa": "Trata de escrutínio contínuo e de sentir as exigências como cobrança e crítica."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2"
    ],
    "justificativa": "Trata de rever totalmente a atitude diante de servir e ser servido."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Plutão sejam favoráveis ou discordantes."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Na relação entre quem trata e quem é tratado, a leitura depende de Plutão estar bem sustentado e de aspectos favoráveis entre os mapas."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Pluto in the 6th",
   "pdfPaginaInicio": 136,
   "pdfPaginaFim": 137,
   "hash": "b67402af20784d29"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como pluto do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "avaliação de valor sobre um tipo de relação; fora do repertório neutro quanto ao vínculo."
   },
   {
    "categoria": "diagnostico",
    "motivo": "condição clínica de terceiro; fora do repertório."
   },
   {
    "categoria": "previsao",
    "motivo": "afirmação de dano em tratamento; descartada como previsão e fora do escopo."
   }
  ]
 },
 {
  "id": "pluto@casa7",
  "planeta": "pluto",
  "casa": 7,
  "funcaoIntroduzida": "Quem tem Plutão pode testar até o limite a capacidade de cooperação total de quem tem a casa.",
  "campoAtivado": "Parceria, cooperação, motivações internas sobre a relação e visão do mundo externo.",
  "facilidades": [
   "Pode levar a explorar a natureza real das motivações internas sobre parceria e a perguntar o que se quer da outra pessoa.",
   "Pode tornar consciente um lado oculto que pede para ser transformado e integrado à consciência antes de uma relação plenamente satisfatória.",
   "Pode ter efeito definitivo sobre a visão política de quem tem a casa."
  ],
  "tensoes": [
   "Quem tem Plutão pode esperar dedicação total à parceria.",
   "Com Plutão afligido, as duas pessoas podem nunca chegar a um entendimento, e pode surgir hostilidade permanente.",
   "Algo na atitude de quem tem a casa pode tornar quem tem Plutão consciente de um incômodo profundo que obstrui a harmonia."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "sustentacao_compromisso",
    "sustentadaPor": [
     "tensoes:0"
    ],
    "justificativa": "Trata de dedicação total e cooperação exigida na parceria."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:1"
    ],
    "justificativa": "Trata de transformar um lado oculto e integrá-lo à consciência."
   },
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:0",
     "tensoes:1",
     "tensoes:2"
    ],
    "justificativa": "Trata de motivações íntimas, hostilidade e obstáculo à harmonia da relação."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A forma tensa vale quando Plutão é muito afligido no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Plutão sejam favoráveis ou discordantes."
   }
  ],
  "reforcoPorAngulo": "A leitura se destaca quando Plutão está em conjunção com o Descendente de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Pluto in the 7th",
   "pdfPaginaInicio": 137,
   "pdfPaginaFim": 137,
   "hash": "85c6cbb0a33187c7"
  },
  "condicoesPorItem": {
   "tensoes[1]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como pluto do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "karma",
    "motivo": "atribuição kármica e pressuposição de casamento; descartadas."
   },
   {
    "categoria": "diagnostico",
    "motivo": "diagnóstico psicológico; ficou só o incômodo profundo."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Plutão, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "pluto@casa8",
  "planeta": "pluto",
  "casa": 8,
  "funcaoIntroduzida": "Quem tem Plutão pode tornar quem tem a casa consciente das motivações mais profundas e subconscientes do comportamento.",
  "campoAtivado": "Transformação, desejo, poder, recursos compartilhados e o oculto.",
  "facilidades": [
   "Pode alimentar a convicção crescente de que o maior autocontrole leva a mais poder sobre as circunstâncias e até sobre outras pessoas.",
   "Pode crescer a convicção de que o esforço de buscar alguma autotransformação é justificado.",
   "Com aspectos muito favoráveis, pode ajudar a dissolver repressões profundas e trazer à consciência impulsos ocultos que dominavam as ações.",
   "Pode trazer maior compreensão do fim da vida e da possibilidade de existir algo depois.",
   "Pode haver forte atração física, salvo indicação contrária dos aspectos entre os mapas."
  ],
  "tensoes": [
   "O contato pode ser desconfortável, com a percepção de que resolver problemas profundos pede disciplina rigorosa, sobretudo no desejo.",
   "Pode haver tentação de ceder poder a quem tem Plutão e de lhe dar muito domínio sobre as finanças.",
   "Com interesse pelo oculto, a relação pode levar a águas profundas e, com aspectos discordantes, a experiências desagradáveis."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2",
     "tensoes:0"
    ],
    "justificativa": "Trata de autotransformação, repressões que se dissolvem e motivações profundas reveladas."
   },
   {
    "categoria": "acao_desejo",
    "sustentadaPor": [
     "facilidades:4",
     "tensoes:0"
    ],
    "justificativa": "Trata de desejo, atração física e disciplina sobre o desejo."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:0",
     "facilidades:0"
    ],
    "justificativa": "Trata de autocontrole e disciplina rigorosa como contenção."
   },
   {
    "categoria": "vida_pratica",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "Trata de dar à outra pessoa muito domínio sobre as finanças."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "Parte da leitura vale quando Plutão é muito bem aspectado no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Plutão sejam favoráveis ou discordantes."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Pluto in the 8th",
   "pdfPaginaInicio": 137,
   "pdfPaginaFim": 137,
   "hash": "069532a82e6657c9"
  },
  "condicoesPorItem": {
   "tensoes[2]": {
    "natal": false,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como pluto do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; ficou a tentação de ceder poder."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "juízo de valor; retirado."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "condição de idade como pressuposto da atração; não modelada."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Plutão, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "pluto@casa9",
  "planeta": "pluto",
  "casa": 9,
  "funcaoIntroduzida": "Quem tem Plutão pode ter grande efeito sobre as visões religiosas e a filosofia de vida de quem tem a casa.",
  "campoAtivado": "Religião, filosofia, estudos superiores, viagens e países estrangeiros.",
  "facilidades": [
   "As ideias de quem tem Plutão podem desafiar a examinar as próprias ideias em profundidade, além do que se havia considerado.",
   "Pode revelar uma motivação inconsciente que parecia impor certa visão de mundo.",
   "Pode despertar vivo desejo de ampliar drasticamente os horizontes, com gosto por viagens ao exterior e interesse por outros países.",
   "Pode haver publicidade por meio de quem tem Plutão, com mudanças conforme os aspectos entre os mapas."
  ],
  "tensoes": [
   "Com aspectos discordantes, as crenças podem divergir muito, e quem tem Plutão pode tentar varrer crenças queridas de quem tem a casa.",
   "Pode semear uma filosofia de vida contrária aos próprios interesses de quem tem a casa."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:0"
    ],
    "justificativa": "Trata de examinar a fundo crenças e motivações e de abalar convicções queridas."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:2",
     "facilidades:3"
    ],
    "justificativa": "Trata de ampliar horizontes, viajar e ganhar publicidade."
   },
   {
    "categoria": "comunicacao",
    "sustentadaPor": [
     "facilidades:0",
     "tensoes:0",
     "tensoes:1"
    ],
    "justificativa": "Trata do choque e da troca de ideias e crenças entre as duas pessoas."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Plutão sejam favoráveis ou discordantes."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Pluto in the 9th",
   "pdfPaginaInicio": 138,
   "pdfPaginaFim": 138,
   "hash": "286725fc151cfaa6"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": false,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como pluto do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   }
  ]
 },
 {
  "id": "pluto@casa10",
  "planeta": "pluto",
  "casa": 10,
  "funcaoIntroduzida": "Quem tem Plutão pode exercer algum grau de controle sobre a carreira de quem tem a casa ou despertar certas ambições.",
  "campoAtivado": "Carreira, ambição, reputação, poder e autoridade.",
  "facilidades": [
   "Pode levar a uma atitude mais definida diante de posições de poder e autoridade.",
   "Pode revelar pela primeira vez motivações ocultas que governavam a direção das ambições e o modo de abrir caminho no mundo.",
   "Pode ajudar a transformar objetivos e testar a integridade ao ocupar posições de influência."
  ],
  "tensoes": [
   "Com aspectos discordantes, a reputação de quem tem a casa pode ser prejudicada.",
   "Em rivalidade por um posto, se quem tem Plutão sai à frente à custa de quem tem a casa, a experiência pode acelerar a tomada de consciência."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "identidade",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2",
     "tensoes:0"
    ],
    "justificativa": "Trata de reputação, integridade e postura diante de posições de poder."
   },
   {
    "categoria": "acao_desejo",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "Trata de rivalidade e disputa por um posto."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2"
    ],
    "justificativa": "Trata de revelar motivações ocultas e transformar objetivos."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Plutão sejam favoráveis ou discordantes."
   },
   {
    "tipo": "tipo_de_relacao",
    "nota": "Em relações entre gerações, quem tem Plutão pode querer ditar a carreira de quem tem a casa e que ela siga seus passos; na relação de trabalho, pode ser exigente."
   }
  ],
  "reforcoPorAngulo": "A leitura se destaca quando Plutão cai em conjunção com o Meio do Céu de quem tem a casa.",
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Pluto in the 10th",
   "pdfPaginaInicio": 138,
   "pdfPaginaFim": 138,
   "hash": "f17d404ba760437b"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": false,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como pluto do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de morte e ganho decorrente; descartada."
   },
   {
    "categoria": "papel_social",
    "motivo": "relação entre gerações; preservada só como nota de tipo de relação."
   },
   {
    "categoria": "papel_social",
    "motivo": "relação de trabalho; preservada só como nota de tipo de relação."
   }
  ]
 },
 {
  "id": "pluto@casa11",
  "planeta": "pluto",
  "casa": 11,
  "funcaoIntroduzida": "Quem tem Plutão pode pôr quem tem a casa em contato com grupos dedicados a algum ideal.",
  "campoAtivado": "Amizades, grupos, esperanças e desejos, atividades comunitárias.",
  "facilidades": [
   "Pode levar a examinar em profundidade as razões das esperanças e dos desejos mais queridos e a redefinir a atitude diante de atividades comunitárias.",
   "Quem tem Plutão pode ter forte impulso de buscar a amizade de quem tem a casa, e com aspectos favoráveis o impulso pode ser compartilhado.",
   "A relação pode gerar muita intensidade e determinar em parte a atitude de quem tem a casa diante dos amigos."
  ],
  "tensoes": [
   "Com aspectos discordantes, as duas pessoas podem ter pouco em comum, ou a amizade pode ser encerrada de forma abrupta."
  ],
  "excessosPossiveis": [],
  "dimensoes": [
   {
    "categoria": "afeto_intimidade",
    "sustentadaPor": [
     "facilidades:1",
     "facilidades:2",
     "tensoes:0"
    ],
    "justificativa": "Trata de impulso de amizade, intensidade e ruptura da afeição entre as duas pessoas."
   },
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:2"
    ],
    "justificativa": "Trata de examinar a fundo razões de desejos e de redefinir atitudes, com intensidade."
   },
   {
    "categoria": "expansao",
    "sustentadaPor": [
     "facilidades:0"
    ],
    "justificativa": "Trata de ampliar o contato com grupos e atividades comunitárias."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Plutão sejam favoráveis ou discordantes."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Pluto in the 11th",
   "pdfPaginaInicio": 138,
   "pdfPaginaFim": 138,
   "hash": "abdb0fabd84e02de"
  },
  "condicoesPorItem": {
   "tensoes[0]": {
    "natal": false,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como pluto do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de morte como causa do fim da amizade; descartada."
   }
  ]
 },
 {
  "id": "pluto@casa12",
  "planeta": "pluto",
  "casa": 12,
  "funcaoIntroduzida": "Quem tem Plutão pode tornar quem tem a casa desconfortavelmente consciente de traços de caráter que falham sob pressão.",
  "campoAtivado": "Vulnerabilidades ocultas, compulsões inconscientes, compaixão e saúde.",
  "facilidades": [
   "Pode levar a um exame profundo das áreas do ser que mais falham numa emergência e a rever o ajuste geral à vida.",
   "Pode haver momentos súbitos de iluminação que levam a transformar toda a visão de vida.",
   "Pode envolver pedidos à simpatia e à caridade de quem tem a casa e mudar suas opiniões sobre quem sofre e os desfavorecidos."
  ],
  "tensoes": [
   "Pode haver percepção de compulsões subconscientes e de fraquezas antes desconhecidas.",
   "Quem tem Plutão pode parecer em posição de explorar o ponto fraco de quem tem a casa e minar sua posição de modo insidioso.",
   "A insegurança de quem tem a casa pode ser transmitida a quem tem Plutão, que passa a vê-la como pouco confiável ou arriscada.",
   "A relação pode acentuar os problemas de saúde de quem tem a casa."
  ],
  "excessosPossiveis": [
   "Pode haver envolvimento em alguma atividade clandestina."
  ],
  "dimensoes": [
   {
    "categoria": "transformacao",
    "sustentadaPor": [
     "facilidades:0",
     "facilidades:1",
     "tensoes:0"
    ],
    "justificativa": "Trata de exame profundo de fragilidades, momentos de iluminação e mudança de visão de vida."
   },
   {
    "categoria": "emocional",
    "sustentadaPor": [
     "facilidades:2",
     "tensoes:2"
    ],
    "justificativa": "Trata de compaixão, simpatia e insegurança sentida entre as duas pessoas."
   },
   {
    "categoria": "limites",
    "sustentadaPor": [
     "tensoes:1"
    ],
    "justificativa": "Trata de ponto fraco explorado e posição minada."
   }
  ],
  "condicionadoPor": [
   {
    "tipo": "condicao_natal_do_planeta",
    "nota": "A leitura depende de Plutão ser bem aspectado, e esse estado não é calculado nesta versão."
   },
   {
    "tipo": "aspectos_entre_os_mapas",
    "nota": "A leitura varia conforme os aspectos entre os mapas dirigidos a Plutão sejam favoráveis ou discordantes."
   }
  ],
  "reforcoPorAngulo": null,
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "overlay",
   "secao": "Pluto in the 12th",
   "pdfPaginaInicio": 138,
   "pdfPaginaFim": 139,
   "hash": "225e8d7d8303f57f"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "leitura escrita como pluto do homem na casa da mulher; reescrita como quem tem o planeta e quem tem a casa."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "atribuição de ilegalidade e imoralidade; descartada, ficou só o envolvimento em atividade clandestina."
   },
   {
    "categoria": "diagnostico",
    "motivo": "origem do vínculo em tratamento de doença ou problema psicológico; descartada."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "condição natal da forma mais tensa; descartada como dependência não calculada."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Plutão, que o motor não calcula; registrada como dependência."
   }
  ]
 }
]
