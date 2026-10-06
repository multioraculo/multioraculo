/**
 * GERADO por scripts/montar-glosas-davison.ts. Não edite à mão: refaça as fatias e monte de novo.
 *
 * Paráfrase estruturada do Davison (Synastry, 1977). O trecho literal do livro NÃO está
 * aqui: cada glosa guarda página, título e hash do trecho de onde saiu, e o literal vive
 * só na auditoria interna, fora do repositório.
 */
import type { GlosaDePar } from "./tipos"

export const INTERASPECTOS_DAVISON: GlosaDePar[] = [
 {
  "id": "sun-sun",
  "corpos": [
   "sun",
   "sun"
  ],
  "simetria": "simetrico",
  "papeis": null,
  "favoravel": {
   "classeOriginal": "aspecto favorável entre os dois Sóis",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "As duas pessoas podem harmonizar seus objetivos de vida e seu modo básico de viver sem atrito excessivo.",
    "O respeito mútuo pelo valor de cada uma como indivíduo e a compatibilidade de temperamento podem formar uma base sólida para um vínculo duradouro."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "Tratam de objetivos de vida, de respeito ao valor individual e de compatibilidade de temperamento entre as duas pessoas."
    },
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "A base descrita é de respeito mútuo e temperamento compatível, apoio de uma relação duradoura."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso entre os Sóis, ou um dos Sóis muito afligido no nascimento ou em Aquário ou Libra",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Pode haver choque de vontades, com cada pessoa insistindo em seus direitos.",
    "Diferenças de temperamento podem ser uma barreira à compreensão adequada.",
    "Pode surgir inimizade aberta ou uma disputa de poder."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [
    "No quadrado, cada pessoa pode ceder parte de sua soberania para que a relação funcione com mais suavidade.",
    "Os talentos e habilidades diferentes de cada pessoa podem ser apreciados como contribuição aos recursos disponíveis para as duas.",
    "Cada pessoa pode florescer com mais harmonia ao usar seus talentos no próprio campo e do próprio modo, sem entrar em conflito de propósitos.",
    "Cada pessoa pode então aprender com a outra, e a relação ganha valor."
   ],
   "dimensoes": [
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2"
     ],
     "justificativa": "Descrevem choque de vontades, disputa de poder e inimizade aberta entre as duas pessoas."
    },
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "A diferença de temperamento aparece como barreira à compreensão entre as duas pessoas."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:0",
      "elaboracao:0",
      "elaboracao:2"
     ],
     "justificativa": "Cada pessoa insiste nos próprios direitos, cede soberania ou usa seus talentos no próprio campo."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "ambos",
    "nucleos": [
     "Na conjunção, a parceria não é necessariamente firme, sobretudo se um ou os dois Sóis estão afligidos no nascimento."
    ],
    "tensoesPossiveis": [
     "Mesmo sem aflição, quem tem um dos Sóis pode achar pouca animação na companhia de quem tem o outro."
    ]
   },
   {
    "aspecto": "opposition",
    "em": "ambos",
    "nucleos": [
     "Na oposição, cada pessoa pode apreciar especialmente na outra as qualidades que complementam as próprias.",
     "Em alguns casos as duas pessoas parecem feitas uma para a outra, com amor à primeira vista."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "quincunx",
    "em": "adverso",
    "nucleos": [
     "No quincunce, a relação pode ser muito instrutiva.",
     "Uma pessoa pode acabar cuidando da outra ou assumindo parte de seus fardos.",
     "Circunstâncias podem desafiar uma ou as duas pessoas a transformar atitudes e hábitos antigos."
    ],
    "tensoesPossiveis": [
     "O quincunce pode trazer problemas difíceis."
    ]
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos Sóis está em Aquário ou Libra, e a conjunção firme ou a oposição muito feliz dependem de Sóis sem aflição ou bem aspectados no nascimento; essas condições não são calculadas nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Sun/Sun",
   "pdfPaginaInicio": 58,
   "pdfPaginaFim": 58,
   "hash": "74a71058afaabd7d"
  },
  "condicoesPorItem": {
   "especificos[0].nucleos[0]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronome masculino aplicado a cada parceiro; reescrito como 'cada pessoa'."
   },
   {
    "categoria": "papel_social",
    "motivo": "recorte de papel conjugal; a dinâmica foi mantida sem o vínculo, e a dependência natal registrada."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; ficou só a possibilidade de ceder soberania, no presente descritivo."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "distância de grau e compatibilidade por signo; o motor trabalha com aspectos e orbes."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "signo natal do Sol não é calculado como condição; registrado como dependência."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "comentário sobre astrologia popular de jornal, sem dinâmica relacional."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "afirmação estatística sobre frequência de aspectos em casais; sem dinâmica descritiva."
   }
  ]
 },
 {
  "id": "sun-moon",
  "corpos": [
   "sun",
   "moon"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "sun": "busca autoexpressão independente e reconhecimento do próprio valor, e tende a ocupar o papel principal na relação",
   "moon": "adapta-se ao Sol, sustenta sua busca e responde por instinto a seus motivos, com sensibilidade que o torna receptivo"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável entre o Sol e a Lua",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem o Sol pode trazer significado e iluminação a quem tem a Lua.",
    "Quem tem a Lua pode atrair, como um ímã, as qualidades solares de quem tem o Sol.",
    "Quem tem a Lua pode se adaptar à busca de autoexpressão independente de quem tem o Sol e sustentá-la, além de reconhecer seu valor como indivíduo.",
    "Quem tem a Lua entende por instinto os motivos básicos de quem tem o Sol e responde de acordo.",
    "As forças dos dois luminares podem se complementar, como a noite complementa o dia.",
    "O Sol de uma pessoa pode iluminar o conceito de ideal que a outra carrega, e a Lua pode refletir de volta o conceito de ideal de quem tem o Sol."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2"
     ],
     "justificativa": "Tratam de significado trazido ao outro, autoexpressão independente e reconhecimento do valor individual."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:3",
      "nucleos:1"
     ],
     "justificativa": "Descrevem entendimento instintivo, resposta sensível e qualidades atraídas de um para o outro."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:4",
      "nucleos:5"
     ],
     "justificativa": "Falam de atração, complemento entre os luminares e do ideal que cada pessoa carrega para o vínculo."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou um dos luminares debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "A sensibilidade da Lua tende a colocá-la no lado que recebe as discórdias que surgem.",
    "A atenção do Sol a si pode deixar de levar em conta as suscetibilidades delicadas e frágeis da Lua.",
    "Os aspectos adversos podem envolver fascinação mesmo quando há tensão ao mesmo tempo.",
    "Sozinhos, os aspectos adversos não indicam necessariamente a incompatibilidade que desfaz o vínculo."
   ],
   "tensoesPossiveis": [
    "Pode se acentuar a tendência a oscilações de humor em quem tem a Lua.",
    "Quem tem o Sol pode se sentir ofendido e ter o orgulho ferido com a sugestão de que um gesto seu tenha provocado a discórdia."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "tensoesPossiveis:0"
     ],
     "justificativa": "Descrevem sensibilidade que recebe as discórdias, fragilidade não considerada e oscilação de humor."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:1",
      "tensoesPossiveis:1"
     ],
     "justificativa": "O orgulho ferido e a atenção voltada a si de quem tem o Sol tratam do senso de si diante da crítica."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "A fascinação que persiste junto com a tensão é atração entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "ambos",
    "nucleos": [
     "A conjunção é um contato particularmente forte entre os mapas e costuma indicar alto grau de compatibilidade.",
     "Pode haver muita simpatia e uma amizade especialmente feliz."
    ],
    "tensoesPossiveis": [
     "Se um dos luminares é muito afligido no nascimento, pode surgir antipatia."
    ]
   },
   {
    "aspecto": "square",
    "em": "adverso",
    "nucleos": [
     "O quadrado é um aspecto particularmente pouco acomodatício.",
     "A capacidade de autoestima do Sol e sua crença na justeza da própria posição podem ser um obstáculo intransponível à aceitação solidária das mudanças de humor e de sentimento de quem tem a Lua."
    ],
    "tensoesPossiveis": [
     "Quem tem a Lua pode se desesperar por não obter a consideração que julga merecer.",
     "Quem tem a Lua pode estar mais voltado à vida pessoal e emocional e não apreciar as considerações mais amplas que motivam quem tem o Sol."
    ]
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos luminares é debilitado, e a antipatia na conjunção surge quando um deles é muito afligido; essas condições não são calculadas nesta versão."
   }
  ],
  "limitacoes": [
   "O livro enquadra a leitura por papéis de gênero; aqui ela vale para quem tem o Sol e quem tem a Lua, e o mapeamento do ideal por gênero ficou generalizado."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Sun/Moon",
   "pdfPaginaInicio": 59,
   "pdfPaginaFim": 60,
   "hash": "bfeabce3e5d95a86"
  },
  "condicoesPorItem": {
   "adverso.nucleos[2]": {
    "natal": false,
    "aspectos": true
   },
   "adverso.nucleos[3]": {
    "natal": false,
    "aspectos": true
   },
   "especificos[0].tensoesPossiveis[0]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "polaridade de gênero atribuída aos luminares; fica só a complementaridade."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel de esposa e de marido; a dinâmica de significado e atração foi mantida sem os papéis."
   },
   {
    "categoria": "prescricao",
    "motivo": "norma sobre como o casamento ideal deveria ser; não entra como conteúdo descritivo."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "regências e exaltações: técnica de dignidade fora do alcance do motor."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'egotismo' é um julgamento da pessoa; ficou só o fato de não considerar a fragilidade da Lua."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "mapeamento de gênero do ideal e comparação com Vênus e Marte; fora do repertório neutro."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "frequência dos aspectos em casais, sem dinâmica relacional."
   },
   {
    "categoria": "genero",
    "motivo": "Mapeia o Sol da mulher ao ideal de homem e o distingue de Marte por sexo; sem paráfrase neutra fiel, e o ideal de parceiro já consta em favoravel.nucleos[5]."
   }
  ]
 },
 {
  "id": "sun-mercury",
  "corpos": [
   "sun",
   "mercury"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "sun": "escuta, encoraja e oferece oportunidades e áreas de estudo a quem tem Mercúrio",
   "mercury": "comunica, expõe ideias e pode interpretar e levar adiante as ideias de quem tem o Sol"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável entre o Sol e Mercúrio",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Uma afinidade mental útil pode se estabelecer com facilidade.",
    "Quem tem o Sol pode ser um ouvinte disposto e encorajar quem tem Mercúrio a se comunicar e expor ideias, que então sente ter alguém que o compreende de verdade.",
    "Quem tem o Sol pode oferecer a quem tem Mercúrio oportunidades de trabalho literário ou sugerir áreas de estudo frutíferas.",
    "Quem tem Mercúrio tende a achar em quem tem o Sol um colaborador útil quando escuta suas ideias com atenção e deferência.",
    "Quem tem Mercúrio pode ser intérprete eficiente e agente útil das ideias de quem tem o Sol."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:3",
      "nucleos:4"
     ],
     "justificativa": "Os núcleos tratam de afinidade mental, escuta, exposição de ideias e interpretação das ideias do outro."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "O núcleo trata de oportunidades de trabalho literário e de áreas de estudo, ou seja, ocupação concreta."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou um dos corpos debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem o Sol pode achar quem tem Mercúrio frívolo, ou considerar suas ideias indignas de atenção séria.",
    "Quem tem Mercúrio pode sentir que quem tem o Sol não aprecia o espírito em que as ideias são concebidas e comunicadas.",
    "Nas combinações desfavoráveis, a defesa que quem tem Mercúrio faz dos interesses do outro pode trazer mais dano que ajuda.",
    "Os resultados dificilmente são desastrosos."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Tratam de ideias desvalorizadas, de espírito não apreciado e de uma defesa mal recebida entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos corpos é debilitado no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Sun/Mercury",
   "pdfPaginaInicio": 60,
   "pdfPaginaFim": 60,
   "hash": "dbcda083640facc4"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes masculinos aplicados aos planetas; reescritos como 'quem tem Mercúrio' e 'quem tem o Sol'."
   },
   {
    "categoria": "prescricao",
    "motivo": "condição de conduta; mantida só como descrição de quando o colaborador é útil."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "valoração geral do papel de Mercúrio; sem dinâmica específica."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "direção de influência sem conteúdo relacional."
   }
  ]
 },
 {
  "id": "sun-venus",
  "corpos": [
   "sun",
   "venus"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "sun": "oferece calor e se sente lisonjeado pela afeição que inspira",
   "venus": "responde com afeição, esforça-se por agradar e pode usar seu poder de persuasão"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável entre o Sol e Vênus",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem o Sol e quem tem Vênus tendem a se manter em termos amistosos sem dificuldade.",
    "O calor de quem tem o Sol pode atrair muita afeição de quem tem Vênus, que reconhece no outro alguém por quem merece fazer um esforço especial para agradar.",
    "Quem tem o Sol pode se sentir lisonjeado pelo calor da afeição que consegue inspirar.",
    "A harmonia pode ser tão alta que as duas pessoas parecem feitas uma para a outra.",
    "Afeição e estima mútuas podem cimentar uma amizade e dar uma capacidade extra de cooperação, mesmo entre conhecidos."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2",
      "nucleos:3"
     ],
     "justificativa": "Falam de afeição, calor, harmonia e do prazer de inspirar carinho entre as duas pessoas."
    },
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "nucleos:4"
     ],
     "justificativa": "A estima mútua é descrita como algo que cimenta a amizade e dá capacidade de cooperação continuada."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou um dos corpos debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem o Sol pode não partilhar os gostos e interesses de lazer de quem tem Vênus.",
    "Quem tem Vênus pode usar seu poder de persuasão em proveito próprio, ou atrair quem tem o Sol e reter os favores no último momento.",
    "Quem tem Vênus pode sentir que quem tem o Sol é dominador demais.",
    "Às vezes há separação temporária, e a ausência pode aumentar o afeto.",
    "Os aspectos adversos raramente indicam dificuldades maiores."
   ],
   "tensoesPossiveis": [
    "Quem tem Vênus pode parecer a quem tem o Sol autoindulgente demais.",
    "Podem surgir ressentimentos e decepções afetivas, com o orgulho ferido de quem tem o Sol."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:3",
      "tensoesPossiveis:1"
     ],
     "justificativa": "Tratam de persuasão e favores retidos, ausência que aumenta o afeto e decepções afetivas."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:2",
      "tensoesPossiveis:1"
     ],
     "justificativa": "O orgulho ferido de quem tem o Sol e a sensação de domínio excessivo tratam do senso de si."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "tensoesPossiveis:1"
     ],
     "justificativa": "Ressentimentos e decepções afetivas descrevem sentimento ferido entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A relação amistosa vale a menos que um dos corpos seja muito afligido no nascimento, e a leitura adversa também vale com um corpo debilitado; essas condições não são calculadas nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Sun/Venus",
   "pdfPaginaInicio": 60,
   "pdfPaginaFim": 60,
   "hash": "002ffcde410e3532"
  },
  "condicoesPorItem": {
   "adverso.nucleos[4]": {
    "natal": false,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes de gênero aplicados aos corpos; reescritos como 'quem tem o Sol' e 'quem tem Vênus'."
   },
   {
    "categoria": "papel_social",
    "motivo": "contexto conjugal e frequência em casais, sem dinâmica descritiva."
   },
   {
    "categoria": "previsao",
    "motivo": "promessa de resultado; ficou só a descrição da relação amistosa, com a ressalva natal."
   },
   {
    "categoria": "previsao",
    "motivo": "prognóstico por progressão sobre o início de uma relação."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "progressões não fazem parte da sinastria deste produto."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "condição natal tratada como dependência, sem valoração."
   }
  ]
 },
 {
  "id": "sun-mars",
  "corpos": [
   "sun",
   "mars"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "sun": "oferece interesse benevolente, confiança e estímulo, e pode conceber a estratégia geral",
   "mars": "traz desejo, impulso e direção aos esforços, e pode fornecer o ímpeto para pôr a estratégia em prática"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável entre o Sol e Marte",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "O desejo de quem tem Marte pode ser estimulado por uma qualidade interior básica de quem tem o Sol.",
    "Quem tem Marte pode despertar o ímpeto, às vezes adormecido, de quem tem o Sol e dar impulso e direção a seus esforços construtivos.",
    "O interesse benevolente de quem tem o Sol pode dar a quem tem Marte mais confiança e estímulo para sustentar esforços que poderiam esmorecer.",
    "A combinação pode gerar muito ímpeto, e uma cooperação entusiasmada pode levar a realizações significativas.",
    "Um interesse comum por atividades físicas com rivalidade amistosa pode favorecer uma companhia agradável.",
    "Em relações de trabalho, Marte pode fornecer o impulso para pôr em prática a grande estratégia concebida por quem tem o Sol."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:3"
     ],
     "justificativa": "Descrevem desejo estimulado, impulso, direção aos esforços e ímpeto gerado entre as duas pessoas."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "O desejo estimulado em uma associação romântica é atração entre as duas pessoas."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "O interesse benevolente que dá confiança e estímulo é encorajamento a sustentar os esforços."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:5"
     ],
     "justificativa": "A estratégia posta em prática em relações de trabalho trata de organização concreta de tarefas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou um dos corpos debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "O orgulho de quem tem o Sol pode chocar com a obstinação de quem tem Marte, num embate por supremacia.",
    "O ímpeto gerado pode ser difícil de manejar com suavidade."
   ],
   "tensoesPossiveis": [
    "Pode haver irritação miúda e tendência a discutir à menor provocação.",
    "Pode haver hostilidade aberta e, em alguns casos, violência.",
    "Se as duas pessoas estão em contato contínuo, a vida em comum pode parecer uma vida em cima de um vulcão."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "tensoesPossiveis:0",
      "tensoesPossiveis:1"
     ],
     "justificativa": "Descrevem embate por supremacia, discussões e hostilidade aberta entre as duas pessoas."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "O orgulho de quem tem o Sol diante da obstinação de quem tem Marte trata do senso de si."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "ambos",
    "nucleos": [
     "Na conjunção, a combinação pode ser útil quando a maioria dos aspectos de apoio a cada corpo é favorável.",
     "Na conjunção, pode haver um elemento de rivalidade em relações de outros tipos."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A conjunção depende muito dos aspectos que cada corpo recebe no nascimento, e a leitura adversa também vale com um corpo debilitado; essas condições não são calculadas nesta versão."
   }
  ],
  "limitacoes": [
   "O livro liga parte da dinâmica sexual a combinações de gênero; essa parte não entrou, e fica só o desejo estimulado e a disputa."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Sun/Mars",
   "pdfPaginaInicio": 61,
   "pdfPaginaFim": 61,
   "hash": "78273e929f54be79"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "dinâmica atribuída ao gênero de quem tem Marte; fica só o desejo estimulado e a iniciativa possível."
   },
   {
    "categoria": "genero",
    "motivo": "autoconceito de masculinidade; sem versão neutra fiel, o trecho saiu."
   },
   {
    "categoria": "genero",
    "motivo": "funcionamento por combinação de gêneros; conteúdo preso ao par homem/mulher, não generalizável."
   },
   {
    "categoria": "papel_social",
    "motivo": "contexto conjugal; fora do repertório neutro quanto ao vínculo."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de filhos e fertilidade; sai por regra."
   },
   {
    "categoria": "fatalismo",
    "motivo": "garantia de resultado; sai por regra."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'benéfico' é classificação de valor; ficou só 'favorável'."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "suporte natal dos dois corpos não é calculado; registrado como dependência."
   },
   {
    "categoria": "genero",
    "motivo": "Fecha o passo por sexo (Marte de qualquer sexo); a dinâmica, o desejo estimulado por aspectos do Sol, já consta em favoravel.nucleos[0]."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "Diz só que o efeito da conjunção depende dos aspectos de cada corpo no nascimento; condição natal que o motor não calcula, já refletida em especificos[0]."
   }
  ]
 },
 {
  "id": "sun-jupiter",
  "corpos": [
   "sun",
   "jupiter"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "sun": "mostra preferência por quem tem Júpiter e pode ser meio de avanço e de melhora material",
   "jupiter": "eleva a autoestima de quem tem o Sol e é generoso, mas pode usar a lisonja em proveito próprio"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável entre o Sol e Júpiter, ou a conjunção com os dois bem aspectados",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Pode haver camaradagem, generosidade de espírito e muito respeito, apreço e encorajamento mútuos.",
    "A combinação pode fortalecer a relação e até sustentá-la com vários aspectos cruzados difíceis, porque cada pessoa reconhece a benevolência da outra, se esforça em favor da outra e tolera suas falhas.",
    "Quem tem Júpiter pode saber como elevar a autoestima de quem tem o Sol.",
    "Quem tem o Sol tende a mostrar favoritismo por quem tem Júpiter e, se estiver em posição de fazê-lo, pode ser meio de avanço, de melhora financeira ou de bem-estar material.",
    "Cada pessoa tende a sentir prazer na companhia da outra.",
    "Em relações de negócios, os aspectos favoráveis podem tornar possível uma colaboração feliz e lucrativa."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:3"
     ],
     "justificativa": "Tratam de generosidade, encorajamento, fortalecimento da relação e avanço de quem tem Júpiter."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2"
     ],
     "justificativa": "O respeito, o apreço mútuo e a autoestima elevada tratam do valor que cada pessoa reconhece na outra."
    },
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "A relação é sustentada mesmo com aspectos difíceis, pela benevolência e tolerância de cada uma."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:3",
      "nucleos:5"
     ],
     "justificativa": "Melhora financeira, bem-estar material e colaboração de negócios tratam de recursos e trabalho."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:4"
     ],
     "justificativa": "O prazer na companhia uma da outra é afeição entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou um dos corpos debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem Júpiter pode usar em proveito próprio o saber elevar a autoestima de quem tem o Sol, empregando lisonja para enganar."
   ],
   "tensoesPossiveis": [
    "Pode surgir falta de sinceridade de um lado ou do outro."
   ],
   "excessosPossiveis": [
    "Quem tem o Sol pode ser desviado pela autoconfiança excessiva de quem tem Júpiter."
   ],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "A lisonja usada para enganar mexe com a autoestima de quem tem o Sol."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "excessosPossiveis:0"
     ],
     "justificativa": "A autoconfiança excessiva de quem tem Júpiter é um excesso que pode desviar a outra pessoa."
    },
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "tensoesPossiveis:0"
     ],
     "justificativa": "A falta de sinceridade de um lado ou de outro trata da lealdade entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "favoravel",
    "nucleos": [
     "Na conjunção, com os dois corpos bem aspectados no nascimento, uma colaboração feliz e lucrativa em negócios é possível."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A conjunção favorável em negócios depende de os dois corpos serem bem aspectados no nascimento, e a leitura adversa também vale com um corpo debilitado; essas condições não são calculadas nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Sun/Jupiter",
   "pdfPaginaInicio": 61,
   "pdfPaginaFim": 62,
   "hash": "c25d8b519975d4ef"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "contexto conjugal; fora do repertório neutro quanto ao vínculo."
   },
   {
    "categoria": "papel_social",
    "motivo": "contexto conjugal e previsão de fecundidade."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de casamento fecundo; sai por regra."
   },
   {
    "categoria": "fatalismo",
    "motivo": "garantia de resultado; sai por regra."
   }
  ]
 },
 {
  "id": "sun-saturn",
  "corpos": [
   "sun",
   "saturn"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "sun": "traz calor, integridade natural, alegria e iniciativa independente, com necessidade de autoexpressão criativa",
   "saturn": "traz senso de dever, estabilidade, controle e cautela, ligado à necessidade de segurança"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável entre o Sol e Saturno",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem o Sol pode dar a quem tem Saturno o calor e a tranquilização de que este carece.",
    "Quem tem Saturno pode trazer um efeito estabilizador e certo controle sobre as extravagâncias mais chamativas de quem tem o Sol.",
    "A integridade natural do Sol, o forte senso de dever de Saturno e a determinação mútua de cumprir responsabilidades podem formar um vínculo.",
    "Esse vínculo pode dar continuidade e durabilidade à relação, mesmo com aspectos cruzados fortemente adversos em outros setores dos dois mapas.",
    "Saturno pode fazer quem tem o Sol perceber suas responsabilidades diante da outra pessoa e ser quem oferece a oportunidade de aprender lições de cooperação.",
    "O trabalho em parceria com a disciplina de Saturno pode dar a quem tem o Sol uma experiência muito valiosa."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "nucleos:2",
      "nucleos:3",
      "nucleos:4"
     ],
     "justificativa": "Tratam de dever, responsabilidade, continuidade e durabilidade do vínculo entre as duas pessoas."
    },
    {
     "categoria": "limites",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:5"
     ],
     "justificativa": "O controle sobre extravagâncias e a disciplina de Saturno são freio e contenção sobre o outro."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "O calor e a tranquilização oferecidos tratam de segurança afetiva de quem tem Saturno."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou um dos corpos debilitado ou os dois em aflição",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "A alegria natural e a iniciativa independente de quem tem o Sol podem encontrar contratempos na abordagem pessimista, cautelosa demais e ponderosa de quem tem Saturno.",
    "A inércia e a obstinação de quem tem Saturno podem pesar sobre a relação e deixar quem tem o Sol com uma sensação de restrição e frustração.",
    "A mão pesada e a prontidão constante de Saturno para criticar podem drenar a vitalidade de quem tem o Sol e não levar em conta sua necessidade de autoexpressão criativa.",
    "O vínculo pode ser mantido mais pelo receio do desconhecido do que por vontade, com cada pessoa se vendo cumprindo seu dever diante de grandes dificuldades.",
    "Quem tem Saturno pode ser visto pela outra pessoa como uma âncora confiável, uma mão firme no leme, ou como um peso que impede um grande sucesso.",
    "Quem tem Saturno pode apontar a quem tem o Sol onde está seu dever, sendo tão pontual em cobrar o que lhe é devido quanto em cumprir o que lhe cabe."
   ],
   "tensoesPossiveis": [
    "Quem tem o Sol pode se arrepender de ter entrado numa relação que drena sua vitalidade.",
    "Em conflito, quem tem o Sol pode saber explorar os pontos fracos de quem tem Saturno.",
    "Quem tem Saturno pode reagir apegando-se ainda mais à outra pessoa, em vez de encerrar a relação."
   ],
   "excessosPossiveis": [],
   "elaboracao": [
    "Quem tem Saturno pode ensinar a quem tem o Sol mais paciência e domínio das questões práticas.",
    "Quem tem o Sol pode mostrar a quem tem Saturno as vantagens de uma visão mais ampla, apoiada em fé e benevolência."
   ],
   "dimensoes": [
    {
     "categoria": "limites",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Descrevem cautela excessiva, inércia, restrição, frustração e crítica constante que contêm o outro."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2",
      "tensoesPossiveis:0"
     ],
     "justificativa": "A iniciativa, a vitalidade e a autoexpressão criativa de quem tem o Sol são cerceadas."
    },
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "nucleos:3",
      "nucleos:5",
      "tensoesPossiveis:2"
     ],
     "justificativa": "Tratam de dever, de manter o vínculo por receio do desconhecido e de apego à relação."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "elaboracao:0"
     ],
     "justificativa": "A paciência e o domínio das questões práticas são organização concreta do que se faz."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "elaboracao:1"
     ],
     "justificativa": "A visão mais ampla que quem tem o Sol mostra é uma ampliação de horizonte para o outro."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "adverso",
    "nucleos": [
     "Na conjunção, a relação costuma ser de longa duração.",
     "Quem tem o Sol pode perceber que carrega os fardos de quem tem Saturno e é a principal fonte de animação da relação."
    ],
    "tensoesPossiveis": [
     "As respostas cautelosas e a aparente falta de entusiasmo de quem tem Saturno podem testar a paciência de quem tem o Sol.",
     "A recusa de Saturno em agir antes de se sentir seguro e convencido pode tolher o estilo do Sol.",
     "Se os esforços de quem tem Saturno falham, a responsabilidade pelo fracasso tende a ser atribuída à outra pessoa."
    ]
   },
   {
    "aspecto": "opposition",
    "em": "adverso",
    "nucleos": [
     "Na oposição, Saturno está em posição de contrariar cada movimento do Sol, fornecendo a inércia que freia as iniciativas da outra pessoa.",
     "Se os dois corpos são bem aspectados no nascimento, um compromisso eficaz pode eventualmente ser alcançado."
    ],
    "tensoesPossiveis": [
     "A falta de leveza emocional de quem tem Saturno pode pesar sobre quem tem o Sol, que é mais exuberante."
    ]
   },
   {
    "aspecto": "square",
    "em": "adverso",
    "nucleos": [
     "No quadrado, os problemas costumam ser mais difíceis, e quem tem o Sol enfrenta com mais dificuldade as táticas obstrutivas de quem tem Saturno.",
     "A cautela excessiva se assusta com a política de compromisso ousado do Sol e exige garantias e cláusulas de segurança que travariam o projeto."
    ],
    "tensoesPossiveis": [
     "Uma sequência de oportunidades perdidas, que quem tem Saturno talvez nunca tenha percebido existirem, pode desgastar quem tem o Sol.",
     "A frustração contínua dos planos pode levar quem tem o Sol a ocultar suas intenções até ser tarde para intervir.",
     "As recriminações posteriores de quem tem Saturno podem incomodar mais do que a oposição teimosa que se teria encontrado antes."
    ]
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos corpos é debilitado, e ver Saturno como âncora ou como peso depende da condição do Sol num mapa e de Saturno no outro; essas condições não são calculadas nesta versão."
   },
   {
    "de": "ambos",
    "nota": "O compromisso eficaz na oposição depende de os dois corpos serem bem aspectados no nascimento; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro enquadra a leitura pelo casamento, pela religião e pelo karma; esses enquadramentos saíram e ficou a dinâmica de dever, cautela e controle."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Sun/Saturn",
   "pdfPaginaInicio": 62,
   "pdfPaginaFim": 63,
   "hash": "16104ff0416dd003"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "contexto conjugal e pronomes de gênero; reescritos como 'quem tem o Sol' e 'quem tem Saturno'."
   },
   {
    "categoria": "papel_social",
    "motivo": "visão de casamento como sacramento; saiu, ficou a lição de cooperação."
   },
   {
    "categoria": "papel_social",
    "motivo": "moral sobre o vínculo conjugal; fora do repertório neutro quanto ao vínculo."
   },
   {
    "categoria": "karma",
    "motivo": "enquadramento cármico; ficou só o ensino mútuo."
   },
   {
    "categoria": "karma",
    "motivo": "dívida cármica; sai por regra."
   },
   {
    "categoria": "destino",
    "motivo": "enquadramento religioso e de instituição; sai por regra."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de duração até aprender as lições; sai por regra."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de associação futura; sai por regra."
   },
   {
    "categoria": "fatalismo",
    "motivo": "garantia de continuidade; reescrito como possibilidade."
   },
   {
    "categoria": "prescricao",
    "motivo": "tom de obrigação sobre dever e serviço; ficou só a descrição de Saturno."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'positivo' e 'negativo' como valoração dos corpos; sai por regra."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'mesquinhez' é julgamento de caráter; sai por regra."
   },
   {
    "categoria": "diagnostico",
    "motivo": "leitura psicológica de mártir; ficou só a descrição do dever cumprido."
   },
   {
    "categoria": "diagnostico",
    "motivo": "'complexo de inferioridade' é termo clínico; ficou só 'pontos fracos'."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "exaltação e queda: técnica de dignidade fora do alcance do motor."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "signo natal e temores subconscientes não são calculados."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "observação sociológica sobre quem entra no casamento."
   },
   {
    "categoria": "papel_social",
    "motivo": "Frase de transição sobre a influência de Saturno na parceria conjugal; não carrega dinâmica própria além do enquadramento de casamento."
   }
  ]
 },
 {
  "id": "sun-uranus",
  "corpos": [
   "sun",
   "uranus"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "sun": "tende à ortodoxia e a procedimentos estabelecidos, com capacidade de independência",
   "uranus": "busca um caminho original, livre de tradição, e desafia o outro a ampliar a individualidade"
  },
  "favoravel": null,
  "adverso": {
   "classeOriginal": "combinação em geral, e em particular aspecto adverso ou um dos corpos debilitado",
   "aplicaA": [
    "conjunction",
    "opposition",
    "square",
    "trine",
    "sextile",
    "quincunx"
   ],
   "nucleos": [
    "A combinação gera dinamismo intenso, com tensão, excitação e estímulo mental no lugar de tédio e frustração.",
    "As duas pessoas têm capacidade de independência, mas o Sol tende à ortodoxia e Urano busca um caminho original, livre de tradição e guiado por uma visão utópica.",
    "O par representa o desafio de expandir a individualidade em uma direção nova e inconformista, revelando novas facetas de si.",
    "Quem tem o Sol tende a achar quem tem Urano um companheiro novo e intrigante, que mostra novos campos a conquistar.",
    "Quem tem Urano tende a manter quem tem o Sol sempre alerta.",
    "Com aspecto adverso ou um dos corpos debilitado, é provável um grau de tensão que testa a força e a flexibilidade do vínculo, qualquer que seja a casa natal."
   ],
   "tensoesPossiveis": [
    "O desafio constante de se ajustar e explorar pode levar ao limite a capacidade de quem tem o Sol, esgotando-o, e a relação costuma não ser fácil.",
    "O vínculo pode ter uma base particularmente frágil.",
    "Um choque súbito de vontades pode levar a uma briga que encerra a relação, se não há outros vínculos fortes em operação.",
    "Qualquer incompatibilidade de temperamento tende a ganhar importância muito além do que merece.",
    "Situações explosivas podem surgir com frequência incômoda."
   ],
   "excessosPossiveis": [],
   "elaboracao": [
    "A combinação pode funcionar com mais naturalidade quando as duas pessoas permitem muita liberdade uma à outra, ao menos em algumas áreas, e Urano tem espaço para experimentar.",
    "Se as duas pessoas encaram com naturalidade as diferenças de opinião e quem tem o Sol adota atitude indulgente diante das excentricidades de quem tem Urano, uma relação de trabalho satisfatória pode resultar.",
    "Se quem tem Urano não coage nem ignora o Sol, sem desafiar sua soberania nem ferir seu orgulho, a relação pode se tornar satisfatória.",
    "A tendência à desintegração pode ser contida se há uma proporção expressiva de aspectos favoráveis mútuos com o Saturno de cada pessoa."
   ],
   "dimensoes": [
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2",
      "tensoesPossiveis:2"
     ],
     "justificativa": "Descrevem dinamismo intenso, direção nova e inconformista e choque súbito que pode encerrar a relação."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:2",
      "elaboracao:2"
     ],
     "justificativa": "Tratam de independência, de individualidade que se expande e de soberania e orgulho de quem tem o Sol."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:2",
      "nucleos:3"
     ],
     "justificativa": "Falam de ampliação da individualidade e de novos campos a conquistar."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "tensoesPossiveis:2",
      "tensoesPossiveis:4"
     ],
     "justificativa": "O choque de vontades e as situações explosivas tratam de conflito aberto entre as duas pessoas."
    },
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "nucleos:5",
      "tensoesPossiveis:1",
      "elaboracao:3"
     ],
     "justificativa": "A força do vínculo, sua base frágil e a contenção da desintegração tratam da permanência da relação."
    }
   ],
   "origem": "leitura_geral"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "adverso",
    "nucleos": [
     "A conjunção é incompatível com uma relação estática."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "square",
    "em": "adverso",
    "nucleos": [
     "No quadrado, soma-se mais excitabilidade a uma combinação já elétrica."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "opposition",
    "em": "adverso",
    "nucleos": [
     "Na oposição, soma-se mais excitabilidade a uma combinação já elétrica."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos corpos é debilitado, e a fragilidade da base depende de um dos corpos estar na sétima casa do mapa natal; essas condições não são calculadas nesta versão."
   },
   {
    "de": "ambos",
    "nota": "A contenção da desintegração depende de aspectos favoráveis mútuos com o Saturno de cada pessoa."
   }
  ],
  "limitacoes": [
   "O livro não separa uma leitura favorável para este par: o conteúdo geral da combinação, que vale para qualquer aspecto, foi registrado só em adverso, e favorável fica vazio.",
   "O livro registra que, entre parentes, amigos ou colegas, o contato pode indicar uma relação intermitente, interrompida por longas ausências; esse recorte por vínculo não entrou nos campos."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Sun/Uranus",
   "pdfPaginaInicio": 64,
   "pdfPaginaFim": 64,
   "hash": "75dad73ab5892e8b"
  },
  "condicoesPorItem": {
   "adverso.nucleos[5]": {
    "natal": true,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronome masculino aplicado ao planeta; reescrito como 'quem tem Urano'."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; ficou só a possibilidade descrita."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "regências e casas naturais: técnica fora do alcance do motor."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "casa natal de um dos corpos não é calculada; registrada como dependência."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "referência a outra combinação do Sol; fora do par."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "variação por tipo de relação; o repertório é neutro quanto ao vínculo."
   }
  ]
 },
 {
  "id": "sun-neptune",
  "corpos": [
   "sun",
   "neptune"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "sun": "deseja incluir todos em sua órbita e pode dar direção e propósito ao anseio de plenitude de Netuno",
   "neptune": "tem lealdades universais, evita compromisso definido e tem imaginação para tecer fantasias criativas"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável entre o Sol e Netuno",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Um vínculo comum de idealismo pode estimular um sentimento sutil de camaradagem.",
    "A capacidade de quem tem Netuno de captar inspirações de planos mais elevados pode intrigar e elevar quem tem o Sol, que pode incentivá-lo a ir além.",
    "O contato tende a atuar no plano emocional: pode haver afinidade sutil e, em sua expressão mais favorável, um sentimento delicado de bem-estar na companhia um do outro e busca de ideais comuns.",
    "Quem tem Netuno pode estimular a imaginação de quem tem o Sol e abrir novas visões fascinantes.",
    "Quem tem Netuno pode ver em quem tem o Sol a personificação de seu ideal, e quem tem o Sol pode dar direção e propósito ao anseio de plenitude de Netuno, incentivando a autotranscendência.",
    "A combinação favorece a ampliação dos interesses estéticos e culturais e uma atmosfera de simpatia mútua que inspira a confiança de Netuno e a benevolência do Sol."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2",
      "nucleos:4"
     ],
     "justificativa": "Tratam de camaradagem, afinidade sutil, bem-estar na companhia e do ideal que um vê no outro."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "O núcleo diz que o contato atua no plano emocional, com afinidade e bem-estar."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:3",
      "nucleos:5"
     ],
     "justificativa": "Falam de imaginação estimulada, novas visões e ampliação de interesses estéticos e culturais."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou um dos corpos debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem o Sol pode querer incluir todos em sua órbita, o que pode desestabilizar quem tem Netuno, que evita compromisso definido.",
    "Quem tem Netuno pode adotar táticas evasivas, que quem tem o Sol tem dificuldade de entender, quando sente que pode ser preso.",
    "Uma incerteza vaga sobre as intenções de cada um pode gerar mal-estar e, às vezes, desconfiança.",
    "A capacidade de tecer fantasias criativas pode levar quem tem o Sol a ter dúvidas graves sobre a confiabilidade de quem tem Netuno e sua falta de qualidades sólidas.",
    "Exigir garantias de sinceridade pode constranger quem tem Netuno, num desconforto que torna a situação ainda mais difícil."
   ],
   "tensoesPossiveis": [
    "Quem tem o Sol pode nunca saber ao certo onde está com quem tem Netuno, que pode achar quem tem o Sol exigente demais e se sentir desconfortável.",
    "Questões claras para quem tem o Sol podem parecer a quem tem Netuno ter muitas implicações sutis, que a outra pessoa, mais descomplicada, não observou.",
    "Em colaboração de negócios, os esquemas muito imaginativos de quem tem Netuno para lances financeiros espetaculares podem exigir exame minucioso e provas práticas rigorosas antes da aprovação final.",
    "No extremo, pode haver um elemento grave de engano, com quem tem Netuno ocultando detalhes do próprio passado ou se aproveitando da magnanimidade de quem tem o Sol, elevando sua autoestima ou abusando de sua confiança."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "Tratam do receio de compromisso definido, de tática evasiva e de ser preso na relação."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:2",
      "tensoesPossiveis:0"
     ],
     "justificativa": "Incerteza vaga, mal-estar e desconfiança descrevem o sentimento entre as duas pessoas."
    },
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:3",
      "tensoesPossiveis:1"
     ],
     "justificativa": "Questões lidas de modo diferente e dúvidas sobre fantasias tratam de mal-entendido entre as duas pessoas."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "tensoesPossiveis:2"
     ],
     "justificativa": "Esquemas de colaboração de negócios e exame prático rigoroso tratam de recursos e trabalho."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:4",
      "tensoesPossiveis:3"
     ],
     "justificativa": "Exigência de garantias, engano e abuso de confiança tratam de confiança íntima entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "ambos",
    "nucleos": [
     "Na conjunção, pode haver afinidade psíquica, com interesse mútuo em atividades estéticas.",
     "A conjunção pode operar de modo mais favorável se os dois corpos são bem aspectados no nascimento."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "square",
    "em": "adverso",
    "nucleos": [
     "O quadrado é uma combinação particularmente desestabilizadora."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "opposition",
    "em": "ambos",
    "nucleos": [
     "A oposição pode operar de modo mais favorável se os dois corpos são bem aspectados no nascimento.",
     "Na oposição, as duas pessoas podem ter de construir confiança, com quem tem Netuno moderando o exagero e quem tem o Sol aceitando que os dons imaginativos do outro nem sempre confundem fantasia e realidade.",
     "Esses dons imaginativos podem ser meio de uma percepção espiritual que eleve a relação a novos níveis de compreensão."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos corpos é debilitado; conjunção e oposição operam de modo mais favorável com os dois corpos bem aspectados, e o quadro de negócios depende de aspectos de Saturno ao Sol e a Netuno; essas condições não são calculadas nesta versão."
   }
  ],
  "limitacoes": [
   "O livro não separa por aspecto o início da leitura sobre evasão e compromisso; foi registrado em adverso, onde o livro o liga à incerteza."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Sun/Neptune",
   "pdfPaginaInicio": 65,
   "pdfPaginaFim": 65,
   "hash": "906eff17a2c5e6fb"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes masculinos aplicados aos planetas; reescritos como 'quem tem o Sol' e 'quem tem Netuno'."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'passado desagradável' é julgamento; ficou 'ocultando detalhes do próprio passado'."
   },
   {
    "categoria": "diagnostico",
    "motivo": "'estado nervoso' é leitura clínica; ficou só o desconforto."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "aspectos natais de Saturno aos dois corpos não são calculados; registrados como dependência."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "recorte por tipo de relação; sem dinâmica descritiva própria."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "avaliação do par para relação de negócios; ficaram só os esquemas financeiros e o exame minucioso."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "'planos mais elevados' mantido só como inspiração; sem técnica de planos."
   }
  ]
 },
 {
  "id": "sun-pluto",
  "corpos": [
   "sun",
   "pluto"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "sun": "age abertamente para alcançar seus fins",
   "pluto": "age em geral encoberto, movido por impulsos subconscientes"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável entre o Sol e Plutão",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Pode haver um fortalecimento considerável de forças, com quem tem Plutão reforçando a crença de quem tem o Sol em si mesmo.",
    "Quem tem o Sol pode dar a quem tem Plutão uma saída eficaz para seus impulsos subconscientes.",
    "Quem tem o Sol pode incentivar quem tem Plutão a mobilizar amplo apoio para a parceria ou a submetê-la a uma reorganização profunda.",
    "O reconhecimento de um vínculo em nível profundo pode favorecer a formação de uma amizade firme.",
    "Pode haver muita atração física entre as duas pessoas."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "O reforço da crença de quem tem o Sol em si mesmo trata do senso de si."
    },
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "A reorganização profunda da parceria trata de mudança profunda."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "A saída para impulsos subconscientes trata de instinto e de sentimento."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:3",
      "nucleos:4"
     ],
     "justificativa": "O vínculo em nível profundo e a atração física tratam de afeição e intimidade entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou um dos corpos debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "As duas pessoas podem sentir uma incompatibilidade profunda e básica, que impede o desenvolvimento de uma associação gratificante.",
    "O contato pode indicar rivalidade e luta por supremacia, com quem tem Plutão procurando minar a posição de quem tem o Sol e bloquear seus planos de progresso.",
    "Quem tem Plutão pode reconhecer e explorar os elementos mais vulneráveis de quem tem o Sol, sobretudo quando orgulho e paixão estão em jogo.",
    "Ciente das principais fragilidades do Sol, quem tem Plutão pode tentar levá-lo a exagerar, pondo-o em situações em que tem de superar suas fraquezas ou admitir a derrota.",
    "Quem tem o Sol pode, por sua vez, testar a capacidade de quem tem Plutão de ficar sozinho e declarar abertamente seus objetivos, e pode explorar o ciúme presente em quem tem Plutão."
   ],
   "tensoesPossiveis": [
    "Às vezes quem tem Plutão reage mantendo-se distante, e uma colaboração realmente próxima se torna quase impossível."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:3",
      "nucleos:4"
     ],
     "justificativa": "Descrevem rivalidade, luta por supremacia, bloqueio de planos e teste de capacidade entre as duas pessoas."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:2",
      "nucleos:3"
     ],
     "justificativa": "Orgulho, paixão e fraquezas de quem tem o Sol tratam do senso de si diante do outro."
    },
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "nucleos:3"
     ],
     "justificativa": "Situações em que se supera a fraqueza ou se admite a derrota tratam de crise e reavaliação."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:4",
      "tensoesPossiveis:0"
     ],
     "justificativa": "Ciúme e distanciamento de quem tem Plutão tratam de intimidade entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos corpos é debilitado no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "A atração física aparece no livro só entre sexos opostos; aqui ficou sem esse recorte, e a leitura de destino foi retirada."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Sun/Pluto",
   "pdfPaginaInicio": 66,
   "pdfPaginaFim": 66,
   "hash": "a8cf9d32ca0dd8c2"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "restrição a sexos opostos; a atração foi mantida sem o recorte de gênero."
   },
   {
    "categoria": "destino",
    "motivo": "enquadramento de destino; sai por regra."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'defeitos de caráter' é julgamento; ficou 'fragilidades'."
   }
  ]
 },
 {
  "id": "moon-moon",
  "corpos": [
   "moon",
   "moon"
  ],
  "simetria": "simetrico",
  "papeis": null,
  "favoravel": {
   "classeOriginal": "aspecto favorável entre as duas Luas, em menor grau que a conjunção",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Entre as duas pessoas pode haver apreço solidário e trabalho em harmonia, com respostas compatíveis ao cotidiano."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "O núcleo trata de apreço solidário e de respostas compatíveis entre as duas pessoas diante do dia a dia."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspectos desfavoráveis entre as duas Luas",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Os hábitos e as reações instintivas de cada pessoa podem entrar em conflito.",
    "Uma pessoa pode deixar de apreciar a reação instintiva da outra diante de uma situação problemática.",
    "Pode haver antipatia instintiva por alguns traços de personalidade da outra pessoa."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Os núcleos tratam de hábitos, reações instintivas e antipatia entre os modos de sentir das duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "favoravel",
    "nucleos": [
     "Na conjunção, há identidade de sentimento e sensação de sintonia entre as duas pessoas.",
     "Na conjunção, as reações instintivas e os hábitos tendem a coincidir, o que pode formar confiança mútua.",
     "Gostos e interesses em comum podem servir de base a um vínculo duradouro.",
     "As duas pessoas podem se acostumar com facilidade à presença uma da outra, com muita interdependência emocional.",
     "O ajuste fácil entre os modos de sentir e responder pode dar sensação de bem-estar na companhia uma da outra."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "opposition",
    "em": "adverso",
    "nucleos": [
     "Na oposição, os hábitos podem se contrastar de modo instigante."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "quincunx",
    "em": "adverso",
    "nucleos": [
     "No quincunce, pode haver uma falta fundamental de unidade entre os sentimentos e os instintos das duas pessoas."
    ],
    "tensoesPossiveis": [
     "Essa falta de unidade é difícil de contrabalançar."
    ]
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A conjunção vale quando nenhum planeta natal está em aspecto desfavorável a ela; essa condição não é calculada nesta versão."
   },
   {
    "de": "ambos",
    "nota": "O contraste da oposição vale a menos que quadraturas ou conjunções de planetas apontados como difíceis afligem uma das Luas; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Moon/Moon",
   "pdfPaginaInicio": 66,
   "pdfPaginaFim": 66,
   "hash": "2d5f058f3eff5cb1"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "exemplo_historico",
    "motivo": "observação sobre casais, sem dinâmica relacional; fica fora."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de harmonia doméstica; retirada."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de duração de vida inteira; fica só a base duradoura."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'boa base' é julgamento; fica a base."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "condição natal não calculada; registrada como dependência."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "condição natal não calculada; registrada como dependência."
   },
   {
    "categoria": "genero",
    "motivo": "fórmula em termos de 'o nativo' e 'parceiros'; reescrita como as duas pessoas."
   }
  ]
 },
 {
  "id": "moon-mercury",
  "corpos": [
   "moon",
   "mercury"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "mercury": "tenta racionalizar e explicar os sentimentos de quem tem a Lua, adaptando-se no nível intelectual",
   "moon": "dá foco ao interesse intelectual, apresenta fatos de modo imaginativo e responde por instinto"
  },
  "favoravel": {
   "classeOriginal": "planetas favoravelmente combinados",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem Mercúrio pode explicar os humores de quem tem a Lua e achar mais cativantes as qualidades lunares da outra pessoa.",
    "Quem tem a Lua pode se fascinar pelas qualidades intelectuais de quem tem Mercúrio, que encontra um público receptivo para suas ideias.",
    "Quem tem a Lua pode dar foco ao interesse intelectual de quem tem Mercúrio, apresentando fatos de modo imaginativo e mais atraente.",
    "A capacidade de se adaptar no nível intelectual pode ser correspondida pela capacidade de responder por instinto."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Os núcleos tratam de explicar humores, apresentar fatos e encontrar público para as ideias entre as duas pessoas."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "A qualidade lunar que se torna mais cativante e o fascínio pelo outro descrevem afeição entre as pessoas."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:3"
     ],
     "justificativa": "A resposta instintiva de quem tem a Lua é o contraponto emocional da adaptação intelectual."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou algum dos dois planetas debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem Mercúrio pode parecer distante demais a quem tem a Lua, pronto a apontar falhas e sem compreender seus sentimentos.",
    "Quem tem a Lua pode se opor aos planos de quem tem Mercúrio por sentir, por instinto, que os planos não levam ao bem-estar comum.",
    "Cada pessoa pode falar em desencontro com a outra, em propósitos cruzados."
   ],
   "tensoesPossiveis": [
    "Quem tem Mercúrio pode tentar racionalizar os sentimentos de quem tem a Lua e parecer, a quem os sente, distante demais.",
    "Quem tem Mercúrio pode ser cortante com os humores aparentemente irracionais de quem tem a Lua."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2"
     ],
     "justificativa": "Os núcleos tratam de incompreensão dos sentimentos e de desencontro de propósitos entre as duas pessoas."
    },
    {
     "categoria": "limites",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "Apontar falhas e opor-se aos planos da outra pessoa são formas de crítica e de freio."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:1",
      "tensoesPossiveis:0",
      "tensoesPossiveis:1"
     ],
     "justificativa": "A racionalização dos sentimentos, o corte com os humores e a oposição instintiva tocam a sensibilidade de quem tem a Lua."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "square",
    "em": "adverso",
    "nucleos": [
     "Na quadratura, quem tem Mercúrio pode se agitar e se afobar para acalmar quem tem a Lua."
    ],
    "tensoesPossiveis": [
     "Esse esforço de acalmar pode acabar agravando as coisas."
    ]
   },
   {
    "aspecto": "conjunction",
    "em": "favoravel",
    "nucleos": [
     "Na conjunção sem aflições, a comunicação fica fácil e os interesses são compartilhados."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "O peso do contato depende da condição de Mercúrio por signo e aspecto; essa condição não é calculada nesta versão."
   },
   {
    "de": "par",
    "nota": "Se a Lua não estiver em signo fixo, o contato pode alcançar só os aspectos mais superficiais do vínculo; essa condição não é calculada nesta versão."
   },
   {
    "de": "mercury",
    "nota": "A forma cortante vale quando Mercúrio está aflito no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "de": "par",
    "nota": "A conjunção só tem a leitura fácil quando não está aflita por outros planetas; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Moon/Mercury",
   "pdfPaginaInicio": 67,
   "pdfPaginaFim": 67,
   "hash": "759fcd6df826d11b"
  },
  "condicoesPorItem": {
   "especificos[1].nucleos[0]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes masculino e feminino aplicados aos corpos; reescrito como quem tem cada corpo."
   },
   {
    "categoria": "papel_social",
    "motivo": "pesos por tipo de vínculo; o repertório é neutro quanto ao vínculo."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'satisfatoriamente' é julgamento; fica o explicar os humores."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "condição natal de Mercúrio não calculada; registrada como dependência."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "dependência registrada."
   },
   {
    "categoria": "diagnostico",
    "motivo": "'irracionais' é rótulo sobre os humores; fica 'aparentemente irracionais' só como percepção descrita."
   }
  ]
 },
 {
  "id": "moon-venus",
  "corpos": [
   "moon",
   "venus"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "venus": "deixa quem tem a Lua à vontade, dá afeto e faz concessões aos seus humores",
   "moon": "responde com afeto e contribui para o clima harmonioso"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável entre a Lua e Vênus",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "As duas pessoas podem sentir muito prazer na companhia uma da outra.",
    "Pode haver interesses culturais compartilhados e os mesmos gostos em entretenimento.",
    "Quem tem Vênus pode pôr quem tem a Lua à vontade, dar afeto e fazer concessões aos seus humores.",
    "Isso costuma suscitar resposta afetuosa de quem tem a Lua, e as duas pessoas podem contribuir para um clima harmonioso."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2",
      "nucleos:3"
     ],
     "justificativa": "Os núcleos tratam de prazer na companhia, afeição dada e resposta afetuosa entre as duas pessoas."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "Fazer concessões aos humores e pôr à vontade toca o sentimento e a segurança afetiva de quem tem a Lua."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou algum dos dois corpos debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem Vênus pode mimar demais quem tem a Lua.",
    "Pode haver desarmonia por uma abordagem casual demais das questões que envolvem a afeição."
   ],
   "tensoesPossiveis": [
    "Quem tem Vênus pode usar o charme para tirar vantagem de um vínculo passageiro.",
    "Quem tem a Lua pode parecer corresponder por flerte ou por ganho de curto prazo.",
    "Os desacordos podem ser menores, de ressentimentos ocasionais quando uma das pessoas não consegue o que quer."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:1",
      "tensoesPossiveis:0",
      "tensoesPossiveis:1"
     ],
     "justificativa": "Os núcleos tratam de abordagem casual do afeto, charme por conveniência e resposta por flerte."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "tensoesPossiveis:2"
     ],
     "justificativa": "Ressentimentos ocasionais por não conseguir o que se quer tocam os sentimentos das duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "square",
    "em": "adverso",
    "nucleos": [
     "Na quadratura, a abordagem casual do afeto, o charme por vantagem e a resposta por flerte são mais prováveis."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "A leitura favorável vale a menos que um dos corpos esteja muito aflito no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "de": "par",
    "nota": "Os desacordos só são pequenos quando nenhum dos corpos está muito aflito no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "de": "par",
    "nota": "O livro também lê como adverso o caso em que um dos corpos está debilitado; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro acrescenta uma leitura que depende de Urano também estar envolvido; ela não foi incluída."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Moon/Venus",
   "pdfPaginaInicio": 67,
   "pdfPaginaFim": 67,
   "hash": "a7dabea7426dae20"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "'her moods', 'his own way': pronomes de gênero; reescrito como quem tem cada corpo."
   },
   {
    "categoria": "papel_social",
    "motivo": "frequência em casais; fica fora."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de impedimento ou ruptura; faz parte da leitura com Urano, não incluída."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "exige um terceiro planeta; fora do repertório de par."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "ranking de valor do contato; retirado."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "registrada como dependência."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "separação e encanto alternado ligados à leitura com Urano; fora do escopo."
   }
  ]
 },
 {
  "id": "moon-mars",
  "corpos": [
   "moon",
   "mars"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "mars": "desafia e estimula, e pode se afirmar demais",
   "moon": "é receptiva, convida e pode reagir em autodefesa"
  },
  "favoravel": {
   "classeOriginal": "condições favoráveis, no vocabulário do livro",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "O jogo entre os dois corpos pode produzir um vínculo estimulante.",
    "Quem tem Marte pode desafiar quem tem a Lua a se expressar por inteiro, e a receptividade lunar pode convidar Marte a mostrar o que lhe é próprio.",
    "O contato indica a possibilidade de muita atração física.",
    "Sob condições favoráveis, quem tem Marte pode dar estímulo útil à imaginação de quem tem a Lua."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [
    "Quem tem Marte pode ser tentado pela atitude maleável de quem tem a Lua a se afirmar demais e a pressioná-la demais."
   ],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "O desafio e o convite entre as duas pessoas descrevem iniciativa e assertividade de uma diante da outra."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "O núcleo trata de atração física entre as duas pessoas."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "Expressar-se por inteiro e mostrar o que lhe é próprio diz respeito à autoexpressão."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "o livro não classifica; trata da tensão sob provocação e da oposição",
   "aplicaA": [
    "opposition"
   ],
   "nucleos": [
    "Sob provocação, quem tem a Lua pode adotar por algum tempo uma atitude agressiva, em pura autodefesa.",
    "Entre pessoas sem interesse emocional uma na outra, o contato pode ser fonte de irritação."
   ],
   "tensoesPossiveis": [
    "Alguns traços de quem tem Marte podem destoar de quem tem a Lua.",
    "Quem tem Marte pode mostrar falta de consideração e de tolerância, o que irrita quem tem a Lua."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "tensoesPossiveis:1"
     ],
     "justificativa": "A atitude agressiva em autodefesa e a falta de consideração descrevem conflito aberto entre as duas pessoas."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:1",
      "tensoesPossiveis:0"
     ],
     "justificativa": "A irritação e o destoar de traços tocam o sentimento e a sensibilidade de quem tem a Lua."
    }
   ],
   "origem": "agrupada_por_tema"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "ambos",
    "nucleos": [
     "Na conjunção, quem tem Marte pode tentar dominar o vínculo."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "opposition",
    "em": "adverso",
    "nucleos": [
     "Na oposição, pode surgir um clima meio nervoso."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "O clima nervoso da oposição vale sobretudo quando um dos corpos está aflito no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro só dá leitura própria à conjunção e à oposição; não separa a quadratura nem o quincunce."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Moon/Mars",
   "pdfPaginaInicio": 68,
   "pdfPaginaFim": 68,
   "hash": "166c436a26788e13"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "papéis de homem e mulher; reescrito sem gênero, com perda dos 'traços femininos e masculinos'."
   },
   {
    "categoria": "genero",
    "motivo": "ideal de mulher e inversão de gênero; fora."
   },
   {
    "categoria": "papel_social",
    "motivo": "contexto conjugal; o repertório é neutro quanto ao vínculo."
   },
   {
    "categoria": "diagnostico",
    "motivo": "hipótese clínica sobre quem tem Marte; retirada."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; retirado."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de êxito do domínio; retirada."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "exaltações e casas por signo; fora do repertório."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "analogia metálica; fora do escopo."
   },
   {
    "categoria": "prescricao",
    "motivo": "fórmula de conselho; retirada."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "registrada como dependência."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'vibração' e 'vantagem' são juízo e linguagem vaga; fica só a atração."
   }
  ]
 },
 {
  "id": "moon-jupiter",
  "corpos": [
   "moon",
   "jupiter"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "jupiter": "expande, mostra benevolência e respeita as conveniências",
   "moon": "se acomoda e dá estima a quem tem Júpiter"
  },
  "favoravel": {
   "classeOriginal": "aspecto entre os dois corpos, lido como favorável",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "O aspecto entre os dois corpos favorece um relacionamento tranquilo e ajuda a suavizar diferenças de temperamento.",
    "As aspirações, os padrões morais e a benevolência de quem tem Júpiter podem atrair, por instinto, quem tem a Lua, que pode ter quem tem Júpiter em alta estima.",
    "Quem tem a Lua pode se esforçar para acomodar quem tem Júpiter, cuja atitude expansiva e respeito pelas conveniências a deixam à vontade.",
    "O contato favorece uma relação social tranquila entre todos os tipos de pessoas."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Os núcleos tratam de aspirações, benevolência e atitude expansiva de quem tem Júpiter diante da outra pessoa."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2"
     ],
     "justificativa": "Suavizar diferenças de temperamento e se sentir à vontade tocam o sentimento e a segurança afetiva."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "A estima de quem tem a Lua por quem tem Júpiter é reconhecimento do valor da outra pessoa."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "algum dos dois corpos muito aflito no mapa natal",
   "aplicaA": [],
   "nucleos": [
    "Quem tem a Lua pode nem sempre aceitar a opinião favorável que quem tem Júpiter faz de si.",
    "Quem tem a Lua pode abusar da generosidade de quem tem Júpiter.",
    "Quem tem Júpiter pode despertar falsas esperanças, fazendo promessas só para acalmar.",
    "Quem tem Júpiter pode superestimar a ajuda que seria capaz de dar."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:3"
     ],
     "justificativa": "O abuso da generosidade e a superestimação da ajuda tratam de excesso na oferta e na demanda de apoio."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "Não aceitar a opinião que a outra pessoa faz de si toca o senso de si e o orgulho."
    },
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "Promessas feitas só para acalmar e as falsas esperanças são uma troca de palavras entre as pessoas."
    }
   ],
   "origem": "condicao_natal"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "favoravel",
    "nucleos": [
     "Na conjunção sem aflições, o contato é agradável."
    ],
    "tensoesPossiveis": [
     "Quem tem Júpiter pode mimar demais quem tem a Lua, que gosta de dar a Júpiter ocasião de mostrar generosidade."
    ]
   },
   {
    "aspecto": "opposition",
    "em": "favoravel",
    "nucleos": [
     "Na oposição, com os dois corpos bem apoiados no mapa natal, pode haver complementaridade com ganhos recíprocos."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura adversa vale quando um dos corpos está muito aflito no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "de": "ambos",
    "nota": "A oposição só é complementar quando os dois corpos estão bem apoiados no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro dá a leitura adversa pela aflição natal de um dos corpos, e não por um aspecto duro entre eles."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Moon/Jupiter",
   "pdfPaginaInicio": 68,
   "pdfPaginaFim": 68,
   "hash": "5c53834efbb9bca2"
  },
  "condicoesPorItem": {
   "especificos[0].nucleos[0]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes de gênero nos corpos; reescrito como quem tem cada corpo."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'bom' é julgamento; fica a relação social tranquila."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de ausência de dificuldades; retirada."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "registrada como dependência."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "registrada como dependência."
   },
   {
    "categoria": "papel_social",
    "motivo": "valoração do contato; retirada."
   }
  ]
 },
 {
  "id": "moon-saturn",
  "corpos": [
   "moon",
   "saturn"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "saturn": "tende a sustentar uma ligação de longa duração por dever, hesitando em romper o laço formal e vendo na outra pessoa um meio de mostrar constância",
   "moon": "pode se acostumar à presença de quem tem Saturno, preferir o que já conhece e criar o hábito de depender"
  },
  "favoravel": {
   "classeOriginal": "aspecto harmônico entre os dois corpos",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem a Lua pode apreciar a atitude de responsabilidade de quem tem Saturno e a disposição de assumir o trabalho de firmar a base do vínculo.",
    "Quem tem Saturno pode dar exemplo de dedicação ao dever, que quem tem a Lua acaba por apreciar.",
    "Quem tem Saturno pode prestar um serviço de longo prazo, assumindo responsabilidades extras diante de uma limitação da outra pessoa.",
    "Quem tem Saturno pode ter uma lição a ensinar a quem tem a Lua, conforme o signo em que Saturno está."
   ],
   "tensoesPossiveis": [
    "Uma aparente falta de resposta emocional entusiasmada de quem tem Saturno pode levar quem tem a Lua a desejar uma companhia mais animada e menos prática.",
    "O vínculo pode ser um teste se uma das pessoas sente carregar parte pesada dos deveres e das responsabilidades.",
    "Quem não está disposto a aceitar os laços do vínculo pode achar as responsabilidades extremamente penosas."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Os núcleos tratam de responsabilidade, dedicação ao dever e serviço de longo prazo, ou seja, duração do vínculo."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2"
     ],
     "justificativa": "O trabalho de firmar a base e as responsabilidades extras são organização concreta da vida em comum."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "tensoesPossiveis:0"
     ],
     "justificativa": "A aparente falta de resposta emocional toca o sentimento de quem tem a Lua."
    },
    {
     "categoria": "limites",
     "sustentadaPor": [
      "tensoesPossiveis:1",
      "tensoesPossiveis:2"
     ],
     "justificativa": "O peso dos deveres e os laços sentidos como penosos são contenção sentida por uma das pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou algum dos dois corpos debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem a Lua pode achar quem tem Saturno frio e austero, sem concessões aos seus humores ou sem entendê-los.",
    "Quem tem a Lua pode se recolher cada vez mais, por receio de rejeição.",
    "Quem tem a Lua pode se ressentir de que quem tem Saturno imponha regras e dite procedimentos.",
    "Mesmo assim, pode haver um forte vínculo entre as duas pessoas."
   ],
   "tensoesPossiveis": [
    "Quem tem a Lua pode se frustrar ao sentir que não consegue chegar a quem tem Saturno.",
    "Quem tem a Lua pode reagir com amuo ou até com rebeldia.",
    "Pode chegar uma frustração total, em que cada pessoa se vê cumprindo o dever em silêncio diante de dificuldades quase intransponíveis.",
    "Quem tem a Lua pode sentir que não pode agir sem inibição por receio de desagradar quem tem Saturno, de olhar crítico.",
    "Quem tem Saturno pode lamentar a instabilidade dos humores de quem tem a Lua.",
    "Entre pessoas que acabam de se conhecer, pode surgir antipatia que dificulta uma amizade."
   ],
   "excessosPossiveis": [],
   "elaboracao": [
    "Quem tem Saturno pode levar mais em conta os sentimentos da outra pessoa e trazer um clima mais leve e menos crítico.",
    "Quem tem a Lua pode achar o vínculo mais compensador ao apreciar a autodisciplina e a dedicação ao dever de quem tem Saturno."
   ],
   "dimensoes": [
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "tensoesPossiveis:1",
      "tensoesPossiveis:4"
     ],
     "justificativa": "A frieza sentida, o recolhimento, o amuo e os humores lamentados tratam de sentimento e sensibilidade."
    },
    {
     "categoria": "limites",
     "sustentadaPor": [
      "nucleos:2",
      "tensoesPossiveis:3"
     ],
     "justificativa": "Impor regras, ditar procedimentos e inibir a espontaneidade por receio de crítica são restrição e controle."
    },
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "nucleos:3",
      "tensoesPossiveis:2"
     ],
     "justificativa": "O forte vínculo que permanece e o dever cumprido em silêncio tratam de permanência do vínculo."
    },
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "tensoesPossiveis:0"
     ],
     "justificativa": "Sentir que não se consegue chegar a quem tem Saturno é uma falha de compreensão entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [],
  "dependeDaCondicaoNatal": [
   {
    "de": "moon",
    "nota": "O amuo ou a rebeldia valem quando a Lua natal está aflita; essa condição não é calculada nesta versão."
   },
   {
    "de": "par",
    "nota": "A leitura adversa também vale quando um dos corpos está debilitado; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Moon/Saturn",
   "pdfPaginaInicio": 69,
   "pdfPaginaFim": 69,
   "hash": "3c7c76c3ca98180e"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes de gênero; reescrito como quem tem cada corpo."
   },
   {
    "categoria": "papel_social",
    "motivo": "figura paterna é papel social; retirada, fica o hábito de depender."
   },
   {
    "categoria": "papel_social",
    "motivo": "contexto conjugal; fica o peso dos deveres."
   },
   {
    "categoria": "diagnostico",
    "motivo": "saúde frágil como causa; fica 'uma limitação da outra pessoa'."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de ruptura; retirada."
   },
   {
    "categoria": "fatalismo",
    "motivo": "afirmação fatalista e assimétrica; retirada."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento sobre quem tem Saturno; fica só a frustração de quem tem a Lua."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho; reescrito como possibilidade descritiva."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "depende de outros aspectos entre os mapas; não modelado aqui."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "dignidades e casas por signo; fora do repertório."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "julgamento sobre motivos para um vínculo; fora do escopo."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "registrada como dependência."
   }
  ]
 },
 {
  "id": "moon-uranus",
  "corpos": [
   "moon",
   "uranus"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "uranus": "traz variedade, novidade e imprevisibilidade",
   "moon": "se fascina e reage com sensibilidade"
  },
  "favoravel": {
   "classeOriginal": "leitura geral do contato, sem separar aspecto",
   "aplicaA": [
    "conjunction",
    "opposition",
    "square",
    "trine",
    "sextile",
    "quincunx"
   ],
   "nucleos": [
    "O contato pode trazer muita atração magnética.",
    "Quem tem a Lua pode se fascinar por qualidades que parecem muito incomuns ou dinâmicas em quem tem Urano.",
    "Quem tem Urano pode reagir de modo marcante ao encanto lunar de quem tem a Lua.",
    "O contato costuma dar uma variedade contínua de experiências estimulantes.",
    "Entre amigos que se veem pouco, o elemento de novidade pode se manter."
   ],
   "tensoesPossiveis": [
    "Ao mesmo tempo, pode surgir tensão entre as duas pessoas.",
    "Contatos casuais do dia a dia podem facilmente se tornar fonte de irritação."
   ],
   "excessosPossiveis": [
    "Uma dieta de excitação constante costuma cansar depois de algum tempo."
   ],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Os núcleos tratam de atração magnética e de fascínio de uma pessoa pelo que a outra traz."
    },
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "nucleos:3",
      "excessosPossiveis:0"
     ],
     "justificativa": "A variedade contínua de experiências estimulantes e o desgaste da excitação constante tratam de intensidade e mudança."
    }
   ],
   "origem": "leitura_geral"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou algum dos dois corpos debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "O comportamento errático e a imprevisibilidade de quem tem Urano podem destoar de quem tem a Lua.",
    "Quem tem a Lua pode ter os nervos abalados e os sentimentos perturbados."
   ],
   "tensoesPossiveis": [
    "Quem tem a Lua pode ficar perturbado pela falta de compreensão que encontra.",
    "Quem tem Urano pode não perceber que se comporta de modo que aflige quem tem a Lua."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:1",
      "tensoesPossiveis:0"
     ],
     "justificativa": "Nervos abalados e sentimentos perturbados tratam de sensibilidade de quem tem a Lua."
    },
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "tensoesPossiveis:0",
      "tensoesPossiveis:1"
     ],
     "justificativa": "A falta de compreensão e a incapacidade de perceber o efeito do próprio comportamento são desencontro entre as pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "A leitura adversa também vale quando um dos corpos está debilitado; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro não dá uma leitura favorável separada; a parte favorável reúne a leitura geral do contato."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Moon/Uranus",
   "pdfPaginaInicio": 70,
   "pdfPaginaFim": 70,
   "hash": "3f66831e2036d904"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "ideal de mulher; retirado, com perda desse conteúdo."
   },
   {
    "categoria": "genero",
    "motivo": "'feminino' aplicado a quem tem a Lua; reescrito como 'encanto lunar'."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão sobre a duração; retirada."
   },
   {
    "categoria": "fatalismo",
    "motivo": "tom fatalista sobre duração; retirado."
   },
   {
    "categoria": "prescricao",
    "motivo": "fórmula de conselho; retirada."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'crucial' é valoração; retirada."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "registrada como dependência."
   }
  ]
 },
 {
  "id": "moon-neptune",
  "corpos": [
   "moon",
   "neptune"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "neptune": "exerce fascínio, traz idealismo e compaixão",
   "moon": "é receptiva e plástica, e se deixa fascinar"
  },
  "favoravel": {
   "classeOriginal": "conjunção ou aspecto benéfico",
   "aplicaA": [
    "conjunction",
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Pode existir uma empatia delicada e sensível entre as duas pessoas.",
    "Quem tem Netuno pode exercer fascínio etéreo sobre quem tem a Lua, que é suscetível.",
    "O idealismo de quem tem Netuno pode acender a imaginação de quem tem a Lua e abrir um mundo novo de beleza e fantasia.",
    "O contato pode dar um forte laço de simpatia, nem sempre com envolvimento apaixonado, e aparece com frequência em amizades platônicas."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [
    "Quem tem a Lua pode se deixar levar pelos mistérios sugeridos por Netuno e se enredar em ideias fantasiosas e ilusórias.",
    "Quem tem a Lua pode deixar de notar que o real para quem tem Netuno vem de perceber os detalhes prosaicos do dia a dia."
   ],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "Os núcleos tratam de empatia sensível e de suscetibilidade ao fascínio, isto é, de sentimento."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:3"
     ],
     "justificativa": "Empatia, simpatia e envolvimento apaixonado ou platônico descrevem afeição entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou algum dos dois corpos debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Pode haver uma sutil falta de afinidade emocional, em que há desejo de agradar mas nenhuma das pessoas sabe bem como.",
    "Quem tem Netuno pode se perder ao tentar sondar os humores de quem tem a Lua.",
    "Quem tem a Lua pode entender mal as intenções de quem tem Netuno.",
    "Quem tem a Lua pode sentir, por instinto, que quem tem Netuno é pouco confiável e muito sujeito às suas suscetibilidades emocionais."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [
    "Os aspectos difíceis podem não prejudicar o vínculo, pois a Lua e Netuno compartilham receptividade e plasticidade.",
    "A capacidade de compaixão de quem tem Netuno pode se manifestar de modo mais favorável quando há aspectos inarmônicos."
   ],
   "dimensoes": [
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:3"
     ],
     "justificativa": "Os núcleos tratam de falta de afinidade emocional, humores difíceis de sondar e suscetibilidades."
    },
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "Entender mal as intenções da outra pessoa é um mal-entendido entre as duas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "A leitura adversa também vale quando um dos corpos está debilitado; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Moon/Neptune",
   "pdfPaginaInicio": 70,
   "pdfPaginaFim": 70,
   "hash": "fec53660601adf33"
  },
  "condicoesPorItem": {
   "adverso.elaboracao[0]": {
    "natal": false,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes de gênero; reescrito como quem tem cada corpo."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'perigo' é juízo; fica a possibilidade de se deixar levar."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'positivamente' é valoração; reescrito como 'de modo mais favorável'."
   },
   {
    "categoria": "prescricao",
    "motivo": "fórmula de tranquilização; reescrita como possibilidade descritiva."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "registrada como dependência."
   }
  ]
 },
 {
  "id": "moon-pluto",
  "corpos": [
   "moon",
   "pluto"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "pluto": "exerce efeito hipnótico e pode compreender por instinto os humores de quem tem a Lua",
   "moon": "reconhece por instinto uma qualidade profunda em quem tem Plutão"
  },
  "favoravel": {
   "classeOriginal": "aspecto harmônico entre a Lua e Plutão",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem Plutão pode ter efeito hipnótico sobre quem tem a Lua.",
    "Quem tem a Lua pode reconhecer por instinto, em quem tem Plutão, uma qualidade profunda do ser que atrai.",
    "Quem tem Plutão pode compreender por instinto os humores e os sentimentos de quem tem a Lua, e um entendimento profundo pode se desenvolver."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [
    "Quem tem Plutão pode saber exatamente onde está o ponto mais vulnerável das defesas de quem tem a Lua e se tornar, em outras circunstâncias, um inimigo muito indesejável."
   ],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "A qualidade que atrai e o entendimento profundo dos sentimentos descrevem atração e intimidade."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "Compreender por instinto humores e sentimentos é empatia e sensibilidade."
    },
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "nucleos:0",
      "excessosPossiveis:0"
     ],
     "justificativa": "O efeito hipnótico e o acesso ao ponto mais vulnerável tratam de intensidade e de exposição profunda."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou algum dos dois corpos debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem a Lua pode reconhecer por instinto, em quem tem Plutão, uma qualidade profunda do ser que repele."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "Reconhecer por instinto uma qualidade que repele trata de sentimento e de instinto de quem tem a Lua."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "favoravel",
    "nucleos": [
     "Na conjunção, quem tem a Lua pode simpatizar com a visão e a filosofia de toda a geração que partilha essa posição de Plutão."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "Se um dos corpos está debilitado, mesmo os aspectos harmônicos podem não trazer harmonia; essa condição não é calculada nesta versão."
   },
   {
    "de": "moon",
    "nota": "A simpatia da conjunção vale a menos que a Lua esteja muito aflita no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "de": "par",
    "nota": "O alcance do contato depende de como Plutão se liga a planetas mais rápidos no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Moon/Pluto",
   "pdfPaginaInicio": 71,
   "pdfPaginaFim": 71,
   "hash": "50c1ae82c63a9d45"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "karma",
    "motivo": "explicação cármica; retirada."
   },
   {
    "categoria": "genero",
    "motivo": "ideal de mulher e instintos 'femininos'; retirado, com perda desse conteúdo."
   },
   {
    "categoria": "previsao",
    "motivo": "'wish to take advantage' e 'will' viraram possibilidade."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "registrada como dependência."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "geração e velocidade; fora do repertório."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'bons' aspectos é valoração; retirada."
   }
  ]
 },
 {
  "id": "mercury-mercury",
  "corpos": [
   "mercury",
   "mercury"
  ],
  "simetria": "simetrico",
  "papeis": null,
  "favoravel": {
   "classeOriginal": "conjunção ou bom aspecto entre os dois Mercúrios",
   "aplicaA": [
    "conjunction",
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Pode haver muita empatia mental, facilitando uma troca harmoniosa de ideias.",
    "Conversas sobre assuntos de interesse comum podem dar prazer às duas pessoas.",
    "Interesses compartilhados ou apreço pela atitude mental da outra pessoa favorecem a comunicação livre.",
    "Na conjunção, cada pessoa pode antecipar os pensamentos da outra."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2",
      "nucleos:3"
     ],
     "justificativa": "Os núcleos tratam de troca de ideias, conversa e comunicação livre entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto difícil entre os dois Mercúrios",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Há uma diferença básica na abordagem dos problemas mentais, e o modo de pensar de uma pessoa pode diferir radicalmente do da outra.",
    "Pode haver um elemento de desafio, com discussões animadas e até desacordos sobre questões intelectuais fundamentais."
   ],
   "tensoesPossiveis": [
    "Cada pessoa pode ser crítica demais com a outra."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "Os núcleos tratam de modos de pensar diferentes e de discussões entre as duas pessoas."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "O desafio e as discussões animadas descrevem disputa entre as duas pessoas."
    },
    {
     "categoria": "limites",
     "sustentadaPor": [
      "tensoesPossiveis:0"
     ],
     "justificativa": "Ser crítica demais com a outra pessoa é uma forma de crítica e de freio."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "opposition",
    "em": "adverso",
    "nucleos": [
     "Na oposição, pode haver mistura de pontos de vista opostos, e opiniões diametralmente contrárias podem estimular o desenvolvimento mental das duas pessoas."
    ],
    "tensoesPossiveis": [
     "Esse ganho é mais difícil de alcançar se Mercúrio está em signo fixo, com alguma tendência ao pensamento dogmático.",
     "Se Mercúrio está estacionário ou retrógrado, quem o tem pode escutar com menos simpatia ideias contrárias às suas."
    ]
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura favorável vale quando os dois Mercúrios estão relativamente livres de outros aspectos aflitivos entre os mapas; essa condição não é calculada nesta versão."
   },
   {
    "de": "ambos",
    "nota": "A dificuldade da oposição aumenta com Mercúrio em signo fixo, estacionário ou retrógrado; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Mercury / Mercury",
   "pdfPaginaInicio": 71,
   "pdfPaginaFim": 71,
   "hash": "29a3543cdde3f346"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "papel_social",
    "motivo": "relação de estudante e professor; o repertório é neutro quanto ao vínculo."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'índice principal de compatibilidade' é ranking; retirado."
   },
   {
    "categoria": "genero",
    "motivo": "pronome 'his' e 'native'; reescrito como 'quem o tem'."
   },
   {
    "categoria": "previsao",
    "motivo": "'will be' é futuro; reescrito como 'pode haver'."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "registrada como dependência."
   }
  ]
 },
 {
  "id": "mercury-venus",
  "corpos": [
   "mercury",
   "venus"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "mercury": "propõe ideias e pode se sentir movido a criticar",
   "venus": "recebe, encoraja e, no caso adverso, pode deixar de questionar"
  },
  "favoravel": {
   "classeOriginal": "ligação agradável, em aspecto favorável",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "As ideias de quem tem Mercúrio podem ser bem recebidas por quem tem Vênus.",
    "Quem tem Vênus pode encorajar quem tem Mercúrio, dar-lhe mais confiança para comunicar suas ideias e até ajudar a difundi-las."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "Os núcleos tratam de ideias recebidas e comunicadas entre as duas pessoas."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "Encorajar, dar confiança e ajudar a difundir ideias é encorajamento e ampliação."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem Vênus pode ser pouco crítico e deixar de questionar incoerências lógicas no pensamento de quem tem Mercúrio.",
    "Quem tem Vênus pode até levar quem tem Mercúrio a crer que conclusões erradas resultam de uma dedução brilhante.",
    "Quem tem Vênus pode estar envolvido demais em seus próprios planos de prazer para dar mais que atenção superficial aos planos de quem tem Mercúrio."
   ],
   "tensoesPossiveis": [
    "Quem tem Mercúrio pode se sentir movido a criticar tendências à preguiça ou preocupação excessiva com prazeres em quem tem Vênus."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Os núcleos tratam de ideias não questionadas, conclusões mal checadas e atenção superficial aos planos."
    },
    {
     "categoria": "limites",
     "sustentadaPor": [
      "tensoesPossiveis:0"
     ],
     "justificativa": "Criticar tendências à preguiça e ao prazer excessivo é uma forma de crítica e de freio."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Mercury/Venus",
   "pdfPaginaInicio": 71,
   "pdfPaginaFim": 72,
   "hash": "e5777b74baf3ab0e"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes de gênero; reescrito como quem tem cada corpo."
   },
   {
    "categoria": "previsao",
    "motivo": "'will be' é futuro; reescrito como 'podem ser'."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'pouco crítico' é descrição relacional, mas 'self-indulgent' e 'laziness' são julgamentos sobre a pessoa; fica só a atenção superficial e a crítica."
   }
  ]
 },
 {
  "id": "mercury-mars",
  "corpos": [
   "mercury",
   "mars"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "mars": "desafia, critica e pode adotar uma atitude mental provocativa",
   "mercury": "propõe ideias e se adapta, estimulado ou 'espetado' pela crítica"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem Marte traz desafio às ideias de quem tem Mercúrio, mantendo-o atento.",
    "Os aspectos favoráveis podem promover uma troca saudável de ideias, com Mercúrio estimulado pela crítica construtiva de Marte.",
    "A crítica de Marte pode ajudar a aprimorar e a acelerar as reações mentais de quem tem Mercúrio.",
    "Se Mercúrio está bem situado e gosta de trocas intelectuais estimulantes, quem o tem pode apreciar a atitude desafiadora de Marte.",
    "A combinação dos dois talentos pode levar a planejar e realizar com êxito operações de trabalho."
   ],
   "tensoesPossiveis": [
    "Há tentação de quem tem Marte adotar uma atitude mental provocativamente agressiva.",
    "Em autodefesa, quem tem Mercúrio pode recorrer a uma exibição de acrobacias verbais inteligentes demais."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Os núcleos tratam de ideias desafiadas, troca de ideias e crítica que apura as reações mentais."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "tensoesPossiveis:0"
     ],
     "justificativa": "Desafiar as ideias e adotar atitude provocativa descrevem assertividade e disputa."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:4"
     ],
     "justificativa": "Planejar e realizar operações de trabalho é organização concreta de recursos e tarefas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto desfavorável, ou Marte debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem Marte pode discutir de modo forte e crítico demais com quem tem Mercúrio, quando o aspecto é desfavorável.",
    "Quem tem Marte pode sentir prazer perverso em apontar falhas nos argumentos de quem tem Mercúrio, ou em se fazer notar importunando a outra pessoa.",
    "Os aspectos adversos, ou mesmo favoráveis vindos de Marte debilitado, podem indicar divergência de interesses e de processos mentais que leva à discórdia, se os desacordos são fundamentais demais."
   ],
   "tensoesPossiveis": [
    "Quem tem Mercúrio pode ficar sujeito a certa tensão nervosa.",
    "Quem tem Mercúrio pode se sentir espetado por Marte e se expressar com mais força que o habitual ou desenvolver tensão nervosa."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "Discutir com força e apontar falhas descrevem disputa e conflito aberto."
    },
    {
     "categoria": "limites",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "Apontar falhas e importunar a outra pessoa são crítica e controle."
    },
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "A divergência de interesses e de processos mentais é desencontro de ideias entre as pessoas."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "tensoesPossiveis:0",
      "tensoesPossiveis:1"
     ],
     "justificativa": "A tensão nervosa e o sentir-se espetado tocam a sensibilidade de quem tem Mercúrio."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [],
  "dependeDaCondicaoNatal": [
   {
    "de": "mercury",
    "nota": "A leitura favorável depende da força de Mercúrio e da capacidade de aproveitar a crítica; essa condição não é calculada nesta versão."
   },
   {
    "de": "par",
    "nota": "O prazer em apontar falhas vale quando Marte é forte e Mercúrio fraco por signo e aspecto; essa condição não é calculada nesta versão."
   },
   {
    "de": "mars",
    "nota": "Aspectos favoráveis também podem dar discórdia quando Marte está debilitado; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Mercury/Mars",
   "pdfPaginaInicio": 72,
   "pdfPaginaFim": 72,
   "hash": "ba48d2a63b991d57"
  },
  "condicoesPorItem": {
   "adverso.nucleos[2]": {
    "natal": true,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes de gênero; reescrito como quem tem cada corpo."
   },
   {
    "categoria": "papel_social",
    "motivo": "contexto profissional; fica a combinação de talentos."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de manejo; retirado."
   },
   {
    "categoria": "diagnostico",
    "motivo": "hipótese psicológica sobre quem tem Marte; retirada."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'perverso' é julgamento, mantido só como descrição curta do prazer em apontar falhas."
   },
   {
    "categoria": "previsao",
    "motivo": "'will finally lead' é previsão; reescrito como 'leva à discórdia, se'."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "registrada como dependência."
   }
  ]
 },
 {
  "id": "mercury-jupiter",
  "corpos": [
   "mercury",
   "jupiter"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "jupiter": "usa a experiência para desenvolver o pensamento, apoia e encoraja",
   "mercury": "propõe ideias, ajuda a formulá-las com nitidez e se adapta"
  },
  "favoravel": {
   "classeOriginal": "contato favorável para a harmonia mental",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem Júpiter pode usar a experiência para desenvolver o pensamento de quem tem Mercúrio, ampliar seu conhecimento e, às vezes, abrir novas intuições filosóficas.",
    "Quem tem Júpiter pode apoiar e encorajar quem tem Mercúrio.",
    "Em geral, as ideias de quem tem Mercúrio são recebidas por Júpiter com ampla tolerância, o que pode formar um clima mental harmonioso e propício ao pensamento criativo.",
    "Quem tem Mercúrio pode ajudar quem tem Júpiter a formular ideias com mais nitidez.",
    "Com o apoio de Júpiter, quem tem Mercúrio costuma estar disposto a ajustar suas ideias e a se adaptar pelo bem do vínculo.",
    "Quem tem Mercúrio pode contribuir com as ideias, e quem tem Júpiter, com os recursos e o encorajamento necessários."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [
    "Se Mercúrio é pego desprevenido pelo apoio otimista demais de Júpiter, podem ocorrer erros de julgamento.",
    "Quem tem Mercúrio pode ficar complacente demais com o apoio otimista de Júpiter."
   ],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2",
      "nucleos:3"
     ],
     "justificativa": "Os núcleos tratam de pensamento desenvolvido, ideias recebidas com tolerância e formuladas com nitidez."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "excessosPossiveis:0"
     ],
     "justificativa": "Ampliar o conhecimento, apoiar e encorajar, e o otimismo em excesso tratam de crescimento e ampliação."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:5"
     ],
     "justificativa": "Contribuir com recursos e com ideias é uma divisão concreta de trabalho e de capital."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou Júpiter debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "As ideias e as capacidades de quem tem Mercúrio podem ser exploradas por quem tem Júpiter, que pode querer tirar todo o proveito possível do vínculo."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "Explorar ideias e capacidades alheias para tirar proveito do vínculo trata de uso concreto de recursos."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "A leitura adversa também vale quando Júpiter está debilitado; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Mercury/Jupiter",
   "pdfPaginaInicio": 72,
   "pdfPaginaFim": 73,
   "hash": "ba4e1222ead3e2aa"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes de gênero; reescrito como quem tem cada corpo."
   },
   {
    "categoria": "papel_social",
    "motivo": "relação de pai e filho; o repertório é neutro quanto ao vínculo."
   },
   {
    "categoria": "papel_social",
    "motivo": "exemplo por tipo de relação; fora."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho ao responsável; retirado."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de despesa; retirada."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo de pai e filho; fora."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'muito útil' é valoração; retirada."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "registrada como dependência."
   },
   {
    "categoria": "papel_social",
    "motivo": "Exemplo de relação entre pai e filho (quem tem Júpiter lida com as preocupações de quem tem Mercúrio); é tipo de relação, e o apoio de Júpiter já consta em favoravel.nucleos[1]."
   }
  ]
 },
 {
  "id": "mercury-saturn",
  "corpos": [
   "mercury",
   "saturn"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "mercury": "propõe ideias, fatos e outras maneiras de olhar",
   "saturn": "firma, confere e freia as ideias"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável, ou boa relação entre os dois planetas",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem Saturno firma e aprofunda o pensamento de quem tem Mercúrio, confere as ideias pela experiência e traz o lado sério das coisas.",
    "Quem tem Mercúrio pode oferecer fatos a mais ou um modo novo de olhar o que quem tem Saturno pondera."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "Os dois núcleos tratam de como as ideias circulam, são conferidas e se renovam entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto desfavorável, ou Saturno proeminente e mal aspectado no mapa natal",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem Saturno questiona o juízo e aponta erros nas ideias de quem tem Mercúrio.",
    "Quem tem Saturno levanta objeções aos planos de quem tem Mercúrio."
   ],
   "tensoesPossiveis": [
    "A espontaneidade de quem tem Mercúrio pode ser contida.",
    "Convencer quem tem Saturno pode exigir esforço."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "tensoesPossiveis:1"
     ],
     "justificativa": "Descreve como as ideias são contestadas e como é difícil convencer, ou seja, a troca de argumentos entre as duas pessoas."
    },
    {
     "categoria": "limites",
     "sustentadaPor": [
      "nucleos:1",
      "tensoesPossiveis:0"
     ],
     "justificativa": "As objeções e a contenção da espontaneidade são freio sobre o que a outra pessoa propõe."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "adverso",
    "nucleos": [
     "Na conjunção, quem tem Saturno pode conferir e reconferir as afirmações de quem tem Mercúrio."
    ],
    "tensoesPossiveis": [
     "O reexame repetido pode minar a confiança de quem tem Mercúrio."
    ]
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "saturn",
    "nota": "A leitura adversa também vale quando Saturno é proeminente e mal aspectado no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Mercury/Saturn",
   "pdfPaginaInicio": 73,
   "pdfPaginaFim": 73,
   "hash": "22e05bcf5d014398"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes masculinos aplicados aos planetas; reescrito como 'quem tem Mercúrio' e 'quem tem Saturno'."
   },
   {
    "categoria": "diagnostico",
    "motivo": "atribui as objeções a medos de quem tem Saturno; fica a objeção, sai a causa psicológica."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento da pessoa; fica só a dificuldade de convencer."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da condição natal de Saturno, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "mercury-uranus",
  "corpos": [
   "mercury",
   "uranus"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "uranus": "estimula e traz um modo novo de ver as coisas",
   "mercury": "dirige as ideias a novos rumos e pode mudar de opinião"
  },
  "favoravel": {
   "classeOriginal": "leitura geral do contato, sem separar aspecto",
   "aplicaA": [
    "conjunction",
    "opposition",
    "square",
    "trine",
    "sextile",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem Urano pode estimular quem tem Mercúrio a dirigir as ideias para novos rumos e a tomar novos estudos.",
    "Quem tem Mercúrio pode se intrigar com o modo novo de ver as coisas que quem tem Urano traz ao vínculo.",
    "É possível que quem tem Urano consiga levar quem tem Mercúrio a mudar opiniões antes firmes."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "Os núcleos tratam de ideias, estudos e modos de ver trocados entre as duas pessoas."
    },
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "Mudar opiniões antes firmes é mudança e reavaliação de ideias."
    }
   ],
   "origem": "leitura_geral"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou Urano debilitado ou muito aflito",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "O efeito de Urano sobre Mercúrio pode ser estimulante demais.",
    "Quem tem Mercúrio pode ser levado por uma nova linha de pensamento que o leva a lugar nenhum e lhe faz perder tempo."
   ],
   "tensoesPossiveis": [
    "Pode haver discussões porque quem tem Urano deixa de fazer o que quem tem Mercúrio espera.",
    "Em alguns casos, as disputas podem levar à perda mútua do controle."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:1",
      "tensoesPossiveis:0"
     ],
     "justificativa": "A linha de pensamento sem destino e as discussões por expectativa frustrada tratam de ideias e de troca."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "tensoesPossiveis:0",
      "tensoesPossiveis:1"
     ],
     "justificativa": "Discussões e disputas com perda mútua do controle descrevem conflito aberto."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "favoravel",
    "nucleos": [
     "Na conjunção, pode haver efeito particularmente estimulante nas trocas mentais, com possibilidade de leitura de pensamento ou de transmissão de pensamento."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "mercury",
    "nota": "A mudança de opinião é menos provável com Mercúrio em signo fixo ou em aspecto a Saturno; essa condição não é calculada nesta versão."
   },
   {
    "de": "uranus",
    "nota": "A leitura adversa vale quando Urano está debilitado ou muito aflito; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro não dá uma leitura favorável separada; a parte favorável reúne a leitura geral do contato."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Mercury / Uranus",
   "pdfPaginaInicio": 73,
   "pdfPaginaFim": 73,
   "hash": "c52c86817a0f157b"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes de gênero; reescrito como quem tem cada corpo."
   },
   {
    "categoria": "previsao",
    "motivo": "'eventually' como desfecho; mantido só como possibilidade."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'desperdício' é julgamento; fica 'perder tempo' como descrição."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "registrada como dependência."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "registrada como dependência."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "mantido como o livro diz, sem endosso; sem alteração do conteúdo."
   }
  ]
 },
 {
  "id": "mercury-neptune",
  "corpos": [
   "mercury",
   "neptune"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "mercury": "pensa de modo lógico e pode se prender à letra",
   "neptune": "traz sensibilidade, imaginação e intuição"
  },
  "favoravel": {
   "classeOriginal": "contatos favoráveis",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quando os contatos são favoráveis e Netuno é forte por signo e bem aspectado, quem o tem pode intuir o que quem tem Mercúrio pensa.",
    "Quando a colaboração atinge seu ponto alto, os dois corpos podem ampliar a compreensão intuitiva do ponto de vista alheio e o interesse comum por buscas artísticas ou místicas, com Netuno trazendo certo refinamento ao pensar.",
    "Quem tem Netuno pode responder de modo emocional aos argumentos mais persuasivos de quem tem Mercúrio.",
    "Os voos de fantasia mais inspiradores de quem tem Netuno podem acender a imaginação de quem tem Mercúrio."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Os núcleos tratam de intuir o pensamento, compreender o ponto de vista e responder a argumentos."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "Responder de modo emocional a argumentos persuasivos toca o sentimento de quem tem Netuno."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspectos adversos",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "O pensamento lógico de quem tem Mercúrio nem sempre se mistura com a sensibilidade e a imaginação de quem tem Netuno, e as duas pessoas podem se entender mal.",
    "Pode ser difícil para quem tem Netuno apreciar a lógica de Mercúrio e para quem tem Mercúrio ver com simpatia os voos de imaginação poética de Netuno.",
    "Quem tem Mercúrio pode sentir que quem tem Netuno não foi inteiramente franco.",
    "Quem tem Mercúrio pode deixar de captar as nuances de sentido que Netuno tentava transmitir, ou tomar uma ilustração alegórica ao pé da letra."
   ],
   "tensoesPossiveis": [
    "Pode haver muitos equívocos pela aparente falta de clareza de Netuno ou pela insistência de Mercúrio na letra, e não no espírito, das contribuições de Netuno."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2",
      "nucleos:3",
      "tensoesPossiveis:0"
     ],
     "justificativa": "Os núcleos tratam de lógica e imaginação que não se entendem, nuances perdidas e equívocos entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "ambos",
    "nucleos": [
     "Na conjunção, pode haver alto grau de afinidade mental."
    ],
    "tensoesPossiveis": [
     "Se a conjunção está afligida por outros planetas, os mal-entendidos podem ser frequentes."
    ]
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "neptune",
    "nota": "A intuição de quem tem Netuno vale quando Netuno é forte por signo e bem aspectado; essa condição não é calculada nesta versão."
   },
   {
    "de": "ambos",
    "nota": "A conjunção se torna fonte de mal-entendidos quando afligida por outros planetas; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Mercury/Neptune",
   "pdfPaginaInicio": 73,
   "pdfPaginaFim": 74,
   "hash": "eae46c37f7e5fb60"
  },
  "condicoesPorItem": {
   "especificos[0].tensoesPossiveis[0]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes de gênero; reescrito como quem tem cada corpo."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'melhor' é valoração; reescrito como 'ponto alto'."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "acusação de falta de franqueza; mantida só como percepção de quem tem Mercúrio."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "registrada como dependência."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "registrada como dependência."
   }
  ]
 },
 {
  "id": "mercury-pluto",
  "corpos": [
   "mercury",
   "pluto"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "pluto": "examina as ideias a fundo e exerce pressão",
   "mercury": "tem de tocar o subconsciente para convencer e tem as ideias transformadas"
  },
  "favoravel": {
   "classeOriginal": "leitura geral do contato, sem separar aspecto",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Convencer quem tem Plutão pode depender de tocar sua mente subconsciente.",
    "Nas trocas, algumas ideias de quem tem Mercúrio podem se transformar durante a conversa.",
    "Quem tem Plutão pode querer examinar a fundo as ideias de quem tem Mercúrio e dar a pressão que leva a acrescentar uma nova dimensão ao seu pensar."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Os núcleos tratam de convencer, discutir e examinar ideias em profundidade entre as duas pessoas."
    },
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Ideias transformadas e nova dimensão ao pensar tratam de mudança e reavaliação profundas."
    }
   ],
   "origem": "agrupada_por_tema"
  },
  "adverso": {
   "classeOriginal": "o livro não separa aspecto; descreve possibilidades de peso e de impasse",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Esses exames podem dar a quem tem Mercúrio sensação de opressão e, talvez, de lavagem cerebral.",
    "Quem tem Plutão pode parecer ter um ponto cego para captar as ideias de quem tem Mercúrio.",
    "Se quem tem Plutão representa um grupo, pode ser difícil lidar com quem o representa, pois pode não haver liberdade para mudar as ideias que lhe pediram para comunicar."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "limites",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2"
     ],
     "justificativa": "A sensação de opressão e a falta de liberdade para mudar ideias tratam de restrição e controle."
    },
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "O ponto cego para captar ideias e a dificuldade de lidar com quem representa um grupo são impasses de troca."
    }
   ],
   "origem": "agrupada_por_tema"
  },
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "limitacoes": [
   "O livro não distingue aspecto favorável e adverso neste par; as duas valências agrupam a leitura geral por conteúdo."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Mercury/Pluto",
   "pdfPaginaInicio": 74,
   "pdfPaginaFim": 74,
   "hash": "513c9d732f9a0ad3"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes de gênero; reescrito como quem tem cada corpo."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento sobre a pessoa; fica a dificuldade de lidar."
   },
   {
    "categoria": "prescricao",
    "motivo": "'has to' é exigência; reescrito como 'pode depender de'."
   },
   {
    "categoria": "diagnostico",
    "motivo": "sensação subjetiva relatada; mantida como sensação possível, sem diagnóstico."
   }
  ]
 },
 {
  "id": "venus-venus",
  "corpos": [
   "venus",
   "venus"
  ],
  "simetria": "simetrico",
  "papeis": null,
  "favoravel": {
   "classeOriginal": "aspecto favorável entre as duas Vênus",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Um elo afim pode estimular um companheirismo feliz e a consideração afetuosa pelas necessidades de cada pessoa.",
    "Os gostos e as aversões das duas pessoas raramente se chocam."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "Os dois núcleos tratam de afeição, consideração pelas necessidades e afinidade de gostos entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto desfavorável, ou uma das Vênus debilitada",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "O apreço mútuo e a atitude compartilhada diante das relações tendem a diminuir um pouco."
   ],
   "tensoesPossiveis": [
    "Pressões externas ou atitude possessiva demais de uma ou das duas pessoas podem tornar a relação sufocante.",
    "As duas pessoas podem agir em propósitos cruzados ao tentar se agradar e ficar melindradas com qualquer falta de apreço.",
    "Pode haver desacordo sobre o lazer, e os gostos das duas pessoas podem diferir muito."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0",
      "tensoesPossiveis:0",
      "tensoesPossiveis:1"
     ],
     "justificativa": "Descreve o apreço que diminui, a possessividade e o melindre diante da falta de apreço entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "favoravel",
    "nucleos": [
     "Na conjunção, sem aflição em nenhuma das Vênus, o contato é especialmente feliz, com gostos em comum e convite a confidências compartilhadas."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "opposition",
    "em": "favoravel",
    "nucleos": [
     "A oposição pode, às vezes, funcionar bem, porque Vênus rege a casa 7 natural; menos quando Vênus está debilitada."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "A leitura depende da condição natal de cada Vênus: a aflição ou debilidade enfraquece a forma favorável; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro diz que, quando há muitos aspectos de apoio entre outros planetas, os efeitos adversos costumam ser pequenos."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Venus/Venus",
   "pdfPaginaInicio": 74,
   "pdfPaginaFim": 74,
   "hash": "44210fc9bf980ebb"
  },
  "condicoesPorItem": {
   "especificos[1].nucleos[0]": {
    "natal": true,
    "aspectos": false
   }
  },
  "descartes": [
   {
    "categoria": "previsao",
    "motivo": "previsão sobre casamento duradouro; removida."
   },
   {
    "categoria": "fatalismo",
    "motivo": "a frase nega garantia; o conceito de garantia foi descartado."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "caso particular de um casal, com previsão de separação; não entra."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "dependência da condição natal de cada Vênus, registrada como dependência."
   }
  ]
 },
 {
  "id": "venus-mars",
  "corpos": [
   "venus",
   "mars"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "mars": "é o desejo e tende a tomar a iniciativa na relação romântica, com impulso e iniciativa também no trabalho em conjunto",
   "venus": "é o desejado e tende a convidar essa iniciativa e a responder com afeto, trazendo finesse e acabamento ao trabalho em conjunto"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável entre os dois planetas",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "O contato é o principal indicador de compatibilidade no nível físico e indica resposta pronta ao magnetismo físico um do outro.",
    "Quem tem Marte pode despertar a devoção apaixonada de quem tem Vênus, e muito afeto pode nascer de uma atração a princípio só física.",
    "Quem tem Vênus pode dar a resposta amorosa que quem tem Marte deseja e trazer à relação uma sensação de bem-estar harmonioso.",
    "Pode surgir a sensação de pertencer uma à outra e a capacidade de intuir o modo de se agradar.",
    "Fora do romance, as duas pessoas podem trabalhar bem juntas: Marte dá iniciativa e impulso, Vênus dá finesse e acabamento.",
    "Em relações sem ligação com o romance, quem tem Marte pode estimular à ação quem tem Vênus preguiçoso, e quem tem Vênus pode mostrar a quem tem Marte precipitado como agir com mais finesse.",
    "O contato pode não indicar estímulo emocional ou físico pronunciado e, ainda assim, as duas pessoas podem trabalhar com fluidez na companhia uma da outra."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2",
      "nucleos:3"
     ],
     "justificativa": "Tratam de atração, afeto, resposta amorosa, sensação de pertencimento e intuição de como agradar."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:4",
      "nucleos:5"
     ],
     "justificativa": "Tratam de desejo, iniciativa, impulso e estímulo à ação entre as duas pessoas."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:4",
      "nucleos:6"
     ],
     "justificativa": "O núcleo descreve o trabalho em conjunto, com iniciativa de um lado e acabamento do outro."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto desfavorável, ou um dos dois planetas debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Pode ser difícil para as duas pessoas se ajustarem uma à outra no nível físico ou emocional.",
    "A atração física pode continuar igual, mas pode haver problemas para expressá-la de modo satisfatório para as duas pessoas.",
    "Quem busca apenas um envolvimento casual pode gostar do desafio e da excitação gerados pelos aspectos discordantes."
   ],
   "tensoesPossiveis": [
    "Quem tem Vênus pode achar quem tem Marte rude ou agressivo demais.",
    "Quem tem Marte pode se cansar de ver seus avanços mal recebidos e se tornar incômodo, às vezes provocador, ou ver o entusiasmo se desgastar.",
    "Quem tem Marte pode forçar demais o ritmo, e quem tem Vênus pode ficar seletivo demais ao conceder seus favores.",
    "Sem a atenção e o apreço que julga merecer, quem tem Marte pode buscar consolo em outro lugar.",
    "A relação pode ficar sujeita a tensão, e uma ou as duas pessoas podem sentir ciúme.",
    "A intensidade de sentimento de cada lado pode ser desigual e, às vezes, uma das pessoas pode ser antipática à outra."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0",
      "tensoesPossiveis:4",
      "tensoesPossiveis:5"
     ],
     "justificativa": "Tratam de ajuste íntimo, ciúme e sentimento desigual entre as duas pessoas."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:1",
      "tensoesPossiveis:1",
      "tensoesPossiveis:2"
     ],
     "justificativa": "Tratam de avanços, ritmo forçado, seletividade e a expressão do desejo entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "opposition",
    "em": "favoravel",
    "nucleos": [
     "A oposição não indica necessariamente desarmonia, porque Vênus e Marte regem signos opostos do zodíaco."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "A oposição pode fortalecer o vínculo quando há recepção mútua por signo (Vênus em Áries e Marte em Libra, ou Vênus em Escorpião e Marte em Touro); isso não é calculado nesta versão."
   },
   {
    "de": "par",
    "nota": "A forma adversa também vale quando Vênus ou Marte está debilitado; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "Segundo o livro, aspectos favoráveis entre os dois planetas não bastam, por si, para consolidar a relação sem outros indícios de compatibilidade.",
   "O livro pede atenção à idade e às circunstâncias das pessoas; em vínculos muito distintos, o contato pode ser só prazer em jogos de esforço físico.",
   "O livro descreve o contato de Marte e Vênus como estímulo a um ideal de parceiro definido por gênero; esse mapeamento saiu e não foi generalizado."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Venus/Mars",
   "pdfPaginaInicio": 74,
   "pdfPaginaFim": 76,
   "hash": "85a528ef6a47e6e5"
  },
  "condicoesPorItem": {
   "adverso.nucleos[2]": {
    "natal": false,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "símbolos de Marte e Vênus para os sexos animais; referência de gênero removida."
   },
   {
    "categoria": "previsao",
    "motivo": "casamento e procriação; previsão e fora do escopo."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo de criança e avô; virou nota em limitações."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel romântico por iniciativa: mantido como descrição de dinâmica em papéis, sem papel de gênero."
   },
   {
    "categoria": "prescricao",
    "motivo": "recomendação de qual sexo deve ter qual planeta; removida."
   },
   {
    "categoria": "genero",
    "motivo": "discussão de papéis masculino e feminino; removida."
   },
   {
    "categoria": "genero",
    "motivo": "qualidades masculinas e femininas; removido."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "recepção mútua por signo; registrada como dependência não calculada."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "debilidade de um dos planetas; registrada como dependência."
   },
   {
    "categoria": "diagnostico",
    "motivo": "atribuição psicológica; removida."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "a ideia de merecimento foi removida; fica a falta de atenção."
   },
   {
    "categoria": "previsao",
    "motivo": "Fala de aspectos favoráveis consolidarem ou não um casamento; a ressalva, que o contato não basta sem outros indícios de compatibilidade, está em limitacoes."
   },
   {
    "categoria": "papel_social",
    "motivo": "Pede considerar idade e circunstâncias de cada pessoa; é tipo de relação e contexto, registrado em limitacoes."
   },
   {
    "categoria": "genero",
    "motivo": "Mapeia Marte da mulher e Vênus do homem a ideais de parceria por sexo; sem paráfrase neutra fiel."
   }
  ]
 },
 {
  "id": "venus-jupiter",
  "corpos": [
   "venus",
   "jupiter"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "venus": "atrai a disposição favorável de quem tem Júpiter e tem afeto a oferecer, além de talentos artísticos, graças sociais e gosto por diversão",
   "jupiter": "faz aflorar o afeto que quem tem Vênus procura ocasião de dar, aprecia seus talentos e traz atitude esportiva e otimista"
  },
  "favoravel": {
   "classeOriginal": "contato feliz entre os dois planetas",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Contato muito feliz, em que as duas pessoas podem disputar quem presenteia mais.",
    "Quem tem Vênus atrai a disposição favorável de quem tem Júpiter, que faz aflorar o afeto que quem tem Vênus procura ocasião de dar.",
    "Pode haver cooperação elevada por estima mútua, convívio social feliz entre amigos e apoio que amenize desarmonias de outros aspectos difíceis.",
    "Quem tem Júpiter pode parecer, a quem tem Vênus, a personificação maior que a vida do par ideal.",
    "Quem tem Júpiter pode apreciar os talentos artísticos e as graças sociais de quem tem Vênus; se esta pessoa valoriza otimismo e visão filosófica, ganha um aliado afetuoso.",
    "A atitude esportiva de Júpiter e o gosto de Vênus por diversão podem dar um interesse comum por lazer prazeroso e leve."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:3"
     ],
     "justificativa": "Tratam de afeto atraído e retribuído e do par ideal visto na outra pessoa."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:5"
     ],
     "justificativa": "Tratam de generosidade em presentes e de lazer prazeroso e leve compartilhado."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:2",
      "nucleos:4"
     ],
     "justificativa": "Tratam de estima mútua e de apreço pelos talentos e valores da outra pessoa."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto desfavorável, ou um dos planetas debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Muitos dos benefícios descritos para o contato podem estar presentes."
   ],
   "tensoesPossiveis": [
    "Se quem tem Vênus está mais bem situado, pode tentar ser possessivo demais ou ressentir o sucesso de quem tem Júpiter, se isso reduz a atenção a si.",
    "Quem tem Vênus pode ficar centrado demais em si para apreciar as muitas virtudes de quem tem Júpiter."
   ],
   "excessosPossiveis": [
    "Pode haver ênfase demais em extravagância ou autoindulgência.",
    "Se quem tem Júpiter é o planeta mais forte, quem tem Vênus pode ser levado a excessos."
   ],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:0",
      "excessosPossiveis:0",
      "excessosPossiveis:1"
     ],
     "justificativa": "Descreve extravagância, autoindulgência e excessos, a face excessiva da generosidade e da expansão."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "tensoesPossiveis:0",
      "tensoesPossiveis:1"
     ],
     "justificativa": "Descreve possessividade, ressentimento por menos atenção e autocentramento entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "A leitura depende de qual planeta está mais forte ou melhor situado, e da debilidade de um deles; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Venus/Jupiter",
   "pdfPaginaInicio": 76,
   "pdfPaginaFim": 76,
   "hash": "a499a9b9012a6490"
  },
  "condicoesPorItem": {
   "favoravel.nucleos[2]": {
    "natal": false,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "papel feminino e masculino atribuído por sexo; removido. Perdeu-se a ideia de 'trazer à tona a capacidade latente de ser atraente'."
   },
   {
    "categoria": "papel_social",
    "motivo": "papel social de gênero; removido."
   },
   {
    "categoria": "previsao",
    "motivo": "promessa virou possibilidade."
   },
   {
    "categoria": "previsao",
    "motivo": "referência a casais; removida."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "debilidade e força relativa dos planetas; registradas como dependência."
   }
  ]
 },
 {
  "id": "venus-saturn",
  "corpos": [
   "venus",
   "saturn"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "venus": "oferece e busca afeto; pode ter muito a aprender com quem tem Saturno",
   "saturn": "traz integridade, confiabilidade e consideração sóbria, e pode ter dificuldade em demonstrar o afeto"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável entre os dois planetas",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Se quem tem Vênus valoriza integridade e confiabilidade, pode apreciar quem tem Saturno.",
    "O contato tende a favorecer a construção de longo prazo de um vínculo afetuoso, sem prometer êxtase.",
    "Os aspectos favoráveis estimulam a lealdade entre as duas pessoas.",
    "Quem tem Saturno tende a ter consideração sóbria pelos méritos de quem tem Vênus.",
    "Um aspecto favorável pode significar a aceitação pronta, por quem tem Saturno, das cargas que lhe cabem."
   ],
   "tensoesPossiveis": [
    "Muitas vezes quem tem Vênus fornece a maior parte do afeto.",
    "Quem tem Saturno pode ter dificuldade em demonstrar o afeto por fora, ou faltar delicadeza ao expressá-lo, mesmo sendo igualmente afetuoso.",
    "Quem tem Vênus pode desenvolver afeto por quem tem Saturno que não retribui ou que se revela inacessível."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2",
      "nucleos:4"
     ],
     "justificativa": "Tratam de lealdade, construção de longo prazo, confiabilidade e aceitação de responsabilidades."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:3",
      "tensoesPossiveis:0",
      "tensoesPossiveis:1",
      "tensoesPossiveis:2"
     ],
     "justificativa": "Tratam de quem dá afeto, de quem tem dificuldade em demonstrá-lo e do afeto não retribuído."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto desfavorável, ou um dos planetas debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem Saturno pode, de algum modo, ser o meio de negar prazeres a quem tem Vênus.",
    "Quem tem Saturno pode ter por dever seguir princípios rígidos de conduta, sem concessão à necessidade de amor e atenção de quem tem Vênus.",
    "Quem tem Saturno pode tentar desencorajar demonstrações excessivas de sentimento, e quem tem Vênus se sente sem uma saída natural para as emoções.",
    "Quem tem Saturno pode carregar muita responsabilidade na relação e começar a se perguntar se tudo isso compensa."
   ],
   "tensoesPossiveis": [
    "A falta de consideração ou a negligência constante de quem tem Saturno pode abater a alegria de quem tem Vênus e esgotar sua capacidade de dar afeto.",
    "Quem tem Saturno pode se sentir lesado pela atitude menos responsável ou frívola de quem tem Vênus, que não aprecia o trabalho duro de dar à relação um alicerce firme.",
    "Quem tem Vênus pode se sentir desencorajado com o que parece uma crítica imerecida de quem tem Saturno, associando-o a circunstâncias externas que limitam sua liberdade.",
    "Quem tem Vênus tende a sofrer mais."
   ],
   "excessosPossiveis": [
    "Quem tem Saturno pode ser tentado a exigir demais de quem tem Vênus."
   ],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "limites",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Tratam de prazeres negados, princípios rígidos e desencorajamento de demonstrações de sentimento."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:2",
      "tensoesPossiveis:0",
      "tensoesPossiveis:2"
     ],
     "justificativa": "Tratam de afeto desencorajado, negligência e crítica sentida como imerecida entre as duas pessoas."
    },
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "nucleos:3",
      "tensoesPossiveis:1"
     ],
     "justificativa": "Tratam de responsabilidade carregada e do trabalho de dar um alicerce firme à relação."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "favoravel",
    "nucleos": [
     "A conjunção é tradicionalmente descrita como combinação que promete felicidade e constância.",
     "Na conjunção, quem tem Vênus pode ter muito a aprender com quem tem Saturno, cuja experiência pode firmar as respostas emocionais e ajudar a formar um senso sólido de valores."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "conjunction",
    "em": "adverso",
    "nucleos": [],
    "tensoesPossiveis": [
     "Na conjunção, a aparente frieza de quem tem Saturno pode evocar em quem tem Vênus a sensação de restrição e de não ser apreciada."
    ]
   },
   {
    "aspecto": "opposition",
    "em": "adverso",
    "nucleos": [
     "A oposição pode até impedir que uma amizade se forme.",
     "Se outros contatos aproximam as pessoas, quem tem Saturno pode trocar o amor por ganho financeiro e receber tudo o que quem tem Vênus dá, sem retorno visível."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "A forma adversa também vale quando Vênus ou Saturno está debilitado; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro liga a aprendizagem com a experiência maior de quem tem Saturno ao caso em que quem tem Vênus é atraído por uma pessoa mais velha; a idade não é modelada."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Venus/Saturn",
   "pdfPaginaInicio": 76,
   "pdfPaginaFim": 77,
   "hash": "ae9f2e266cd34f6b"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes e termos de gênero (mate, she, he); reescritos como quem tem Vênus e quem tem Saturno."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão sobre a parceria; removida."
   },
   {
    "categoria": "fatalismo",
    "motivo": "o 'sempre' foi retirado."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "a autoridade de Ptolomeu foi tirada; fica a descrição tradicional da conjunção."
   },
   {
    "categoria": "papel_social",
    "motivo": "o peso da responsabilidade foi mantido sem papel social."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "debilidade de um dos planetas; registrada como dependência."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "o julgamento 'imerecida' foi mantido como percepção de quem tem Vênus."
   }
  ]
 },
 {
  "id": "venus-uranus",
  "corpos": [
   "venus",
   "uranus"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "uranus": "exerce fascínio elétrico, com originalidade, jeito independente e novos insights criativos, e pode perder o interesse de repente",
   "venus": "atrai e encanta, e pode demorar a perceber a atração que exerce, vendo a relação com mais distanciamento"
  },
  "favoravel": {
   "classeOriginal": "contato entre os dois planetas, sem aspecto adverso",
   "aplicaA": [
    "conjunction",
    "opposition",
    "square",
    "trine",
    "sextile",
    "quincunx"
   ],
   "nucleos": [
    "O contato representa a capacidade de êxtase e pode significar uma relação de forte estímulo sexual.",
    "Quem tem Urano exerce fascínio elétrico sobre quem tem Vênus, que o acha extraespecial e se intriga com sua originalidade, independência e novos insights criativos.",
    "Quem tem Urano é muito suscetível ao charme e à atratividade de quem tem Vênus, que pode parecer desejável a ponto de despertar o desejo de ter a pessoa a qualquer custo.",
    "Quem tem Urano pode se apaixonar perdidamente por quem tem Vênus, e as possibilidades românticas da combinação são consideráveis.",
    "O contato pode enriquecer a vida social de cada pessoa e suas atividades culturais e criativas, mesmo sem romance.",
    "Tende a ser o oposto da parceria Vênus-Saturno, e a vida pode ficar muito interessante quando os dois planetas atuam em combinação."
   ],
   "tensoesPossiveis": [
    "O contato não está entre os fatores que mais estabilizam uma relação: momentos de êxtase não se prolongam, e parte do atrativo vem do contraste com o prosaico.",
    "Quem tem Vênus pode demorar a perceber o tamanho da atração que exerce e, assim, ver a relação com mais distanciamento e controle.",
    "As possibilidades românticas não indicam necessariamente uma relação duradoura, sobretudo se as duas pessoas não forem maduras o bastante ao se conhecerem.",
    "Pode ser difícil viver de excitação permanente, e uma das pessoas, em geral quem tem Urano, pode perder o interesse de repente, com a familiaridade ou o tempo."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2",
      "nucleos:3"
     ],
     "justificativa": "Tratam de êxtase, fascínio, atração e paixão entre as duas pessoas."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:4"
     ],
     "justificativa": "O núcleo descreve o enriquecimento da vida social, cultural e criativa de cada pessoa."
    },
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "tensoesPossiveis:0",
      "tensoesPossiveis:2",
      "tensoesPossiveis:3"
     ],
     "justificativa": "Tratam de permanência do vínculo, instabilidade e perda de interesse com o tempo."
    }
   ],
   "origem": "leitura_geral"
  },
  "adverso": {
   "classeOriginal": "aspecto desfavorável, ou um dos planetas debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Um fim abrupto da relação é mais provável.",
    "Enquanto o fascínio dura, pode ser mais intenso."
   ],
   "tensoesPossiveis": [
    "O rompimento final pode ser uma experiência muito emocional."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "nucleos:0",
      "tensoesPossiveis:0"
     ],
     "justificativa": "Tratam de ruptura abrupta e de um rompimento final intenso entre as duas pessoas."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "O núcleo descreve um fascínio mais intenso enquanto a relação dura."
    },
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "O núcleo trata da duração mais curta do vínculo por fim abrupto."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "favoravel",
    "nucleos": [
     "Na conjunção, há muito fascínio mútuo e interesse vivo um pelo outro."
    ],
    "tensoesPossiveis": [
     "Pode surgir tensão pela sensação de que a relação é ótima demais para durar."
    ]
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "A forma adversa também vale quando Vênus ou Urano está debilitado; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro liga a durabilidade à maturidade das pessoas ao se conhecerem; isso não é modelado nesta versão."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Venus/Uranus",
   "pdfPaginaInicio": 77,
   "pdfPaginaFim": 78,
   "hash": "b5217bc4426392a0"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "previsao",
    "motivo": "referência a casais; removida."
   },
   {
    "categoria": "genero",
    "motivo": "condição de sexos opostos; removida."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "glândulas sexuais, exaltação e relação de casas por signo; técnica fora do escopo."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho e previsão de períodos de risco; removidos."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplos de compositor e atores; removidos."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho sobre quem deve lidar com o contato; removido."
   },
   {
    "categoria": "fatalismo",
    "motivo": "previsão; removida."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "citação de filosofia; removida."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "debilidade; registrada como dependência."
   }
  ]
 },
 {
  "id": "venus-neptune",
  "corpos": [
   "venus",
   "neptune"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "venus": "traz afeição e pode inspirar em quem tem Netuno compreensão compassiva e talvez autossacrifício",
   "neptune": "traz ideal de pureza e ternura, pode ter um encanto ilusório e abrir uma visão nova sobre arte e música"
  },
  "favoravel": {
   "classeOriginal": "contato entre os dois planetas, sem aspecto adverso",
   "aplicaA": [
    "conjunction",
    "opposition",
    "square",
    "trine",
    "sextile",
    "quincunx"
   ],
   "nucleos": [
    "A nota-chave ideal da combinação é a pureza do afeto.",
    "O contato pode indicar muita ternura de sentimento dos dois lados.",
    "No nível mais alto, quem tem Vênus pode inspirar em quem tem Netuno compreensão compassiva e talvez autossacrifício.",
    "Quem tem Netuno pode, de muitos modos sutis, fazer aflorar a capacidade de afeto de quem tem Vênus.",
    "Quem tem Netuno pode dar a quem tem Vênus uma visão nova e mais visionária do mundo da arte e da música."
   ],
   "tensoesPossiveis": [
    "Esse ideal é difícil de realizar para pessoas comuns.",
    "Quando o amor se confunde com atração física e autoindulgência mútua, a combinação pode ficar aquém da perfeição que as duas pessoas almejam.",
    "A menos que as duas pessoas sejam muito lúcidas, Netuno pode ter um encanto mais ilusório que real para quem tem Vênus, que pode perceber que a relação ideal não é provável."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2",
      "nucleos:3",
      "tensoesPossiveis:1",
      "tensoesPossiveis:2"
     ],
     "justificativa": "Tratam de pureza de afeto, ternura, afeto despertado e ilusão do ideal amoroso entre as duas pessoas."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "O núcleo descreve compreensão compassiva despertada em quem tem Netuno."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:4"
     ],
     "justificativa": "O núcleo descreve a ampliação da visão de quem tem Vênus sobre arte e música."
    }
   ],
   "origem": "leitura_geral"
  },
  "adverso": {
   "classeOriginal": "aspecto desfavorável, ou um dos planetas debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Pode surgir alguma falta de compreensão no nível emocional.",
    "Quem tem Netuno pode interpretar mal as respostas afetuosas de quem tem Vênus, ou ficar nervosamente constrangido com essas respostas e tomar uma atitude evasiva no último momento."
   ],
   "tensoesPossiveis": [
    "Quem tem Vênus pode nunca ter segurança nem plena satisfação."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "tensoesPossiveis:0"
     ],
     "justificativa": "Tratam de falta de compreensão emocional, respostas afetuosas mal interpretadas e insegurança afetiva."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:1",
      "tensoesPossiveis:0"
     ],
     "justificativa": "Tratam de evasão diante do afeto e de insatisfação na intimidade entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "A forma adversa também vale quando Vênus ou Netuno está debilitado; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Venus/Neptune",
   "pdfPaginaInicio": 78,
   "pdfPaginaFim": 78,
   "hash": "7ba0748638abc96c"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "exemplo_historico",
    "motivo": "artistas e compositores falecidos; removido."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "debilidade; registrada como dependência."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'mortais comuns' virou 'pessoas comuns'; o ideal permanece como descrição."
   }
  ]
 },
 {
  "id": "venus-pluto",
  "corpos": [
   "venus",
   "pluto"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "pluto": "intensifica o que Vênus traz às relações; pode pressionar avanços íntimos ou bloquear aproximações",
   "venus": "é a capacidade de criar harmonia e gosta de agir de modo agradável aos outros, se isso não custa muito conforto e compostura"
  },
  "favoravel": {
   "classeOriginal": "planetas bem situados e combinados de modo favorável",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Pode haver reconhecimento mútuo de um vínculo emocional profundo, que parece bem estabelecido e é aceito sem questionamento.",
    "O contato pode aumentar a consciência sexual de uma pessoa em relação à outra.",
    "A capacidade de Plutão de intensificar os outros planetas pesa nas relações pessoais, sobretudo com Vênus, a capacidade de criar harmonia."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "Tratam de vínculo profundo reconhecido e de consciência sexual aumentada entre as duas pessoas."
    },
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "O núcleo descreve a intensificação que Plutão traz às relações pessoais."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto desfavorável, ou um dos planetas debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "A consciência sexual pode ficar aumentada a ponto de constranger.",
    "Os avanços de quem tem Plutão podem se tornar desconfortavelmente pressionantes para quem tem Vênus.",
    "Quem tem Plutão pode bloquear as aproximações íntimas de quem tem Vênus, preferindo manter distância ou encerrar uma relação que ameaça trazer envolvimento emocional."
   ],
   "tensoesPossiveis": [
    "Às vezes a situação pode se inverter, com quem tem Plutão pressionando por atenções indesejadas sobre quem tem Vênus."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Tratam de consciência sexual constrangedora, avanços pressionantes e bloqueio de aproximações íntimas."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:1",
      "tensoesPossiveis:0"
     ],
     "justificativa": "Tratam de avanços insistentes e de atenções indesejadas pressionadas sobre a outra pessoa."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "ambos",
    "nucleos": [
     "Na conjunção, as duas pessoas podem parecer irresistivelmente atraídas uma à outra, com resultado que depende dos aspectos natais a cada planeta."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "opposition",
    "em": "ambos",
    "nucleos": [
     "Na oposição, as duas pessoas também podem parecer irresistivelmente atraídas, e o resultado depende dos aspectos natais a cada planeta."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "O resultado depende dos aspectos natais a cada planeta e da debilidade de Vênus ou Plutão; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Venus/Pluto",
   "pdfPaginaInicio": 79,
   "pdfPaginaFim": 79,
   "hash": "8e8568ab19ae3f05"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "karma",
    "motivo": "vidas passadas; removido."
   },
   {
    "categoria": "genero",
    "motivo": "condição de sexos opostos; removida."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'para melhor ou pior' virou resultado dependente dos aspectos natais."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "debilidade; registrada como dependência."
   }
  ]
 },
 {
  "id": "mars-mars",
  "corpos": [
   "mars",
   "mars"
  ],
  "simetria": "simetrico",
  "papeis": null,
  "favoravel": {
   "classeOriginal": "aspecto favorável entre os dois Martes",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "As duas pessoas podem trabalhar juntas com harmonia.",
    "Uma compatibilidade de objetivos pode ajudar a cooperação sem atritos.",
    "A amizade pode ser estimulada por interesse mútuo em condicionamento físico e esporte.",
    "O contato pode dar estímulo mútuo do desejo e atração intensa e apaixonada."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:3"
     ],
     "justificativa": "Tratam de empenho conjunto, objetivos comuns e estímulo mútuo do desejo entre as duas pessoas."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:2",
      "nucleos:3"
     ],
     "justificativa": "Tratam de amizade e de atração intensa e apaixonada entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto desfavorável, ou um dos Martes debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Pode haver muito atrito e até uma relação tempestuosa.",
    "Pode haver choque de vontades, com as duas pessoas querendo se afirmar de modos opostos ao mesmo tempo, ou cada uma pode irritar a outra.",
    "Quando uma toma a iniciativa, a outra pode lançar uma contra-iniciativa, e cada uma tenta superar a outra.",
    "Quando o impulso de um Marte cruza o propósito do outro, pode haver irritação e talvez inimizade."
   ],
   "tensoesPossiveis": [
    "O resultado pode ser o esgotamento das duas pessoas.",
    "Mesmo assim, pode ser difícil levar uma grande operação a uma conclusão plenamente bem-sucedida."
   ],
   "excessosPossiveis": [],
   "elaboracao": [
    "Um plano geral definido de antemão, ou uma terceira pessoa de confiança de ambos como árbitro nas disputas, são caminhos apontados para a colaboração."
   ],
   "dimensoes": [
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:2",
      "nucleos:3"
     ],
     "justificativa": "Tratam de choque de vontades, contra-iniciativa e disputa aberta entre as duas pessoas."
    },
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "elaboracao:0"
     ],
     "justificativa": "O caminho apontado é combinar um plano de antemão e recorrer a um árbitro nas disputas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "favoravel",
    "nucleos": [
     "Na conjunção, o estímulo mútuo do desejo pode ser especialmente forte e levar a atração intensa e apaixonada."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "A leitura depende da condição natal de cada Marte e de quão bem cada um se integra aos planetas do outro mapa; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Mars/Mars",
   "pdfPaginaInicio": 79,
   "pdfPaginaFim": 79,
   "hash": "b62fd4854bf63223"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "condição de sexos opostos; removida."
   },
   {
    "categoria": "genero",
    "motivo": "pronome masculino sobre o nativo; removido."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "dependência da condição natal; registrada."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "debilidade; registrada como dependência."
   },
   {
    "categoria": "prescricao",
    "motivo": "exigência convertida em caminho apontado."
   }
  ]
 },
 {
  "id": "mars-jupiter",
  "corpos": [
   "mars",
   "jupiter"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "mars": "desperta o entusiasmo de Júpiter, empreende, promove esquemas e é estimulado por Júpiter a alcançar novos patamares",
   "jupiter": "apoia os esforços de Marte com conselho sensato e, às vezes, ajuda financeira, e tende a ser generoso e tranquilo"
  },
  "favoravel": {
   "classeOriginal": "planetas combinados com harmonia",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem Marte pode despertar o entusiasmo de quem tem Júpiter.",
    "O contato pode ser útil a membros de equipes em disputas esportivas e a quem as treina.",
    "Quem tem Júpiter pode apoiar os esforços de quem tem Marte com conselho sensato e, às vezes, ajuda financeira.",
    "Quem tem Júpiter pode orientar os impulsos de quem tem Marte com sensatez.",
    "Quando os planetas se combinam com harmonia, quem tem Marte pode ser estimulado a alcançar novos patamares de realização.",
    "Quem tem Marte pode trazer benefício financeiro a quem tem Júpiter, ao promover com empenho esquemas de ganho mútuo."
   ],
   "tensoesPossiveis": [
    "Quem tem Marte pode tirar vantagem da generosidade de quem tem Júpiter, que tende a ser bastante tranquilo.",
    "A combinação pode ser inflamatória e desequilibrante."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:4",
      "nucleos:5"
     ],
     "justificativa": "Tratam de entusiasmo despertado, novos patamares de realização e ganho mútuo."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:4"
     ],
     "justificativa": "Tratam de entusiasmo, disputas esportivas e iniciativa estimulada entre as duas pessoas."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:2",
      "nucleos:5"
     ],
     "justificativa": "Tratam de ajuda financeira e de benefício financeiro de esquemas de ganho mútuo."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto desfavorável, ou um dos planetas debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem Marte pode despertar o entusiasmo de quem tem Júpiter, e este pode desafiar a iniciativa de quem tem Marte."
   ],
   "tensoesPossiveis": [
    "Entre pessoas imaturas deixadas a terminar um trabalho sem supervisão, o tempo pode se perder em brincadeiras intensas e a tarefa ser negligenciada."
   ],
   "excessosPossiveis": [
    "Quem tem Júpiter pode ficar otimista demais ou descuidado, e quem tem Marte, precipitado demais, assumindo riscos indevidos.",
    "Cada pessoa pode estimular demais a outra."
   ],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "excessosPossiveis:0",
      "excessosPossiveis:1"
     ],
     "justificativa": "Descrevem otimismo demais, descuido, riscos indevidos e estímulo excessivo, a face excessiva da expansão."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "excessosPossiveis:0"
     ],
     "justificativa": "Tratam de entusiasmo, desafio à iniciativa e precipitação em assumir riscos."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "A leitura depende da condição natal dos dois planetas e da debilidade de um deles; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Mars/Jupiter",
   "pdfPaginaInicio": 79,
   "pdfPaginaFim": 80,
   "hash": "0bca61d5fa540ccd"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes masculinos aplicados aos planetas; reescritos como quem tem Marte e quem tem Júpiter."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "dependência da condição natal; registrada."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "debilidade; registrada como dependência."
   }
  ]
 },
 {
  "id": "mars-saturn",
  "corpos": [
   "mars",
   "saturn"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "mars": "é o impulso, que para uso construtivo é canalizado e controlado, e quer avançar com rapidez, iniciativa e ousadia",
   "saturn": "é a massa e a resistência ao impulso, e tende à abordagem lenta, deliberada e cautelosa, que firma e freia"
  },
  "favoravel": {
   "classeOriginal": "planetas em relação favorável, ou colaboração relativamente satisfatória",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Com muita compreensão e disposição favorável nos outros contatos entre os mapas, as pessoas podem cooperar para lidar com essa combinação tensa e às vezes intolerante.",
    "Quem tem Saturno pode ensinar paciência a quem tem Marte e a avaliar antes de agir, e quem tem Marte pode mostrar a quem tem Saturno o valor da iniciativa e da ousadia.",
    "Quem tem Saturno pode ajudar a moderar a tendência de quem tem Marte de expressar suas qualidades de modo desinibido demais.",
    "Um arranjo de trabalho possível: quem tem Saturno traça os planos e quem tem Marte os executa.",
    "Quem tem Saturno pode assumir o papel de guia e mentor de quem tem Marte impetuoso, que cuida da ação principal que a parceria requer."
   ],
   "tensoesPossiveis": [
    "Mesmo na forma mais favorável, a combinação é descrita como tensa e quebradiça, e pode gerar situações difíceis ocasionais."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "limites",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Tratam de paciência, avaliação antes de agir e moderação de uma expressão desinibida."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:4"
     ],
     "justificativa": "Tratam do valor da iniciativa e da ousadia e da ação principal assumida por quem tem Marte."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:3",
      "nucleos:4"
     ],
     "justificativa": "Tratam de divisão do trabalho entre planejar e executar e de colaboração prática."
    }
   ],
   "origem": "agrupada_por_tema"
  },
  "adverso": {
   "classeOriginal": "planetas em conflito, sobretudo se um deles está debilitado por signo",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Pode haver luta até o fim, e a pessoa vencida pode ficar com sensação permanente de frustração.",
    "Se a luta ficar sem solução, uma guerra constante de desgaste pode destruir o que restava de disposição favorável entre as pessoas.",
    "Quando frustrado, quem tem Marte pode recorrer a ação vigorosa ou violenta para se soltar do que o retém.",
    "Quem tem Saturno pode sentir prazer em frear de repente quem tem Marte para demonstrar seu poder.",
    "O desejo de quem tem Marte de avançar rápido pode não se combinar com a abordagem lenta, deliberada e cautelosa de quem tem Saturno, sobretudo se este tende a procrastinar.",
    "Quem tem Marte se sente fora de seu elemento quando muito freado, e quem tem Saturno suspeita que pressa demais convida a erros."
   ],
   "tensoesPossiveis": [
    "Quem tem Saturno pode julgar os empreendimentos de quem tem Marte mal pensados e mal preparados.",
    "Quem tem Marte pode esperar que quem tem Saturno arrume o que ficou para trás, corrigindo omissões e erros decorrentes da pressa.",
    "Entre pessoas em contato cotidiano, a combinação é difícil de manejar.",
    "A relação pode variar de muito difícil a uma colaboração relativamente satisfatória."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "limites",
     "sustentadaPor": [
      "nucleos:3",
      "nucleos:4",
      "nucleos:5"
     ],
     "justificativa": "Tratam de frear de repente, ritmo lento e cauteloso e sensação de ser muito freado."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2",
      "nucleos:4"
     ],
     "justificativa": "Tratam de luta até o fim, ação vigorosa para se soltar e desejo de avançar rápido."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "tensoesPossiveis:1"
     ],
     "justificativa": "Descreve o trabalho de arrumar omissões e erros decorrentes da pressa."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "favoravel",
    "nucleos": [
     "Na conjunção, quem tem Saturno pode estabilizar e dirigir o impulso de quem tem Marte, e quem tem Marte pode fazer com que quem tem Saturno não negligencie responsabilidades.",
     "Na conjunção, cada pessoa pode manter a outra alerta."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "A leitura depende de outros contatos entre os dois mapas, para saber se as pessoas lidam com as situações difíceis que a combinação pode trazer; isso não é calculado."
   },
   {
    "de": "par",
    "nota": "A forma adversa também vale quando um dos planetas está debilitado por signo, e o signo em comum dos dois planetas muda a leitura; essas condições não são calculadas nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Mars / Saturn",
   "pdfPaginaInicio": 80,
   "pdfPaginaFim": 81,
   "hash": "8392529fe092b590"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento de valor sobre a combinação; removido."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "exaltações e casas simbólicas; técnica fora do escopo. Perdeu-se a ideia de posição inflexível na parceria e de autoafirmação que abala a estabilidade."
   },
   {
    "categoria": "prescricao",
    "motivo": "exigência de conduta; removida."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão sobre casamento e filhos; removida."
   },
   {
    "categoria": "diagnostico",
    "motivo": "termo clínico removido; fica a amplitude de difícil a satisfatória."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "debilidade por signo; registrada como dependência."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "leitura por signo em comum; registrada como dependência não calculada."
   },
   {
    "categoria": "genero",
    "motivo": "pronomes masculinos aplicados aos planetas; reescritos como quem tem Marte e quem tem Saturno."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "Explica a má reputação da combinação pela aversão humana ao esforço; é comentário sobre a fama, sem dinâmica entre as duas pessoas."
   }
  ]
 },
 {
  "id": "mars-uranus",
  "corpos": [
   "mars",
   "uranus"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "uranus": "dá estímulo dinâmico ao impulso de Marte, sugerindo novas áreas para a iniciativa, e tenta desarmar o oponente pela surpresa",
   "mars": "favorece a abordagem direta e fornece o impulso que encoraja o engenho inventivo de Urano"
  },
  "favoravel": {
   "classeOriginal": "contato entre os dois planetas, sem aspecto adverso",
   "aplicaA": [
    "conjunction",
    "opposition",
    "square",
    "trine",
    "sextile",
    "quincunx"
   ],
   "nucleos": [
    "Combinação de alta tensão que pode estimular de modo fascinante quem gosta de excitação.",
    "Quem tem Urano pode dar estímulo dinâmico ao impulso de quem tem Marte, sugerindo novas áreas para a iniciativa.",
    "Quem tem Marte pode fornecer o impulso que encoraja o engenho inventivo de quem tem Urano a florescer.",
    "A combinação pode indicar uma atração física poderosa.",
    "Quem tem Urano pode motivar e desafiar quem tem Marte e mostrar como empregar seu impulso com mais eficácia."
   ],
   "tensoesPossiveis": [
    "Pode haver, com frequência, um elemento de tensão."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:2",
      "nucleos:4"
     ],
     "justificativa": "Tratam de estímulo à iniciativa, impulso e eficácia no emprego do impulso entre as duas pessoas."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:3"
     ],
     "justificativa": "O núcleo descreve atração física poderosa entre as duas pessoas."
    },
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "O núcleo descreve alta tensão e excitação intensa que estimulam as duas pessoas."
    }
   ],
   "origem": "leitura_geral"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso entre os planetas, ou um dos planetas debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Podem surgir de irritações pequenas a uma situação explosiva em que as duas pessoas perdem a calma e nenhuma quer ceder.",
    "Podem ocorrer brigas violentas ocasionais, que entre pessoas em relação íntima podem apenas interromper por um tempo a relação sexual.",
    "Entre pessoas em contato cotidiano, as irritações podem se multiplicar."
   ],
   "tensoesPossiveis": [
    "Quando os esforços de acomodação falham ou nem são tentados, a relação pode se romper de modo irreversível."
   ],
   "excessosPossiveis": [],
   "elaboracao": [
    "Conversar sobre os problemas de modo amistoso, em vez de impor uma solução a outra pessoa, é um caminho apontado.",
    "Pausas ocasionais na companhia uma da outra, evitar ficar a sós com frequência e dar liberdade ampla podem aliviar as irritações do contato cotidiano.",
    "Quem tem Urano reconhecer que quem tem Marte às vezes toma a iniciativa, e quem tem Marte dar liberdade de ação a quem tem Urano, é um caminho apontado.",
    "Um acordo para discordar pode poupar muito desgaste."
   ],
   "dimensoes": [
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Tratam de irritação, explosão e brigas entre as duas pessoas que não querem ceder."
    },
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "elaboracao:0",
      "elaboracao:3"
     ],
     "justificativa": "Os caminhos apontados são conversar de modo amistoso e firmar um acordo para discordar."
    },
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "tensoesPossiveis:0"
     ],
     "justificativa": "Descreve a ruptura irreversível da relação quando a acomodação falha."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "square",
    "em": "adverso",
    "nucleos": [
     "No quadrado, quem tem Marte pode achar quem tem Urano errático e imprevisível demais."
    ],
    "tensoesPossiveis": [
     "Para compreender mais a fundo, quem tem Marte pode sondar e testar continuamente as reações de quem tem Urano.",
     "Quem tem Urano pode se ressentir disso e se afastar para um ambiente onde seus atos não tenham de ser explicados e justificados."
    ]
   },
   {
    "aspecto": "conjunction",
    "em": "adverso",
    "nucleos": [
     "Na conjunção, as duas pessoas podem sentir falta de espaço de manobra e parecer pisar uma nos pés da outra."
    ],
    "tensoesPossiveis": [
     "Por vontade de medir forças de tempos em tempos, podem se alfinetar de propósito e provocar briga para descarregar a tensão acumulada.",
     "Depois das brigas, as duas pessoas podem levar tempo para recuperar a compostura, se a relação continua."
    ]
   },
   {
    "aspecto": "opposition",
    "em": "adverso",
    "nucleos": [
     "Na oposição, as duas pessoas têm espaço de manobra, e pode haver muita esgrima, cada uma tentando estabelecer sua posição à custa da outra.",
     "Quem tem Marte costuma preferir a abordagem direta, e quem tem Urano costuma tentar desarmar o oponente pela surpresa."
    ],
    "tensoesPossiveis": [
     "Se cada pessoa jogar a espera, pode haver impasse.",
     "Quem tem Urano pode ignorar ameaças ou ações hostis de quem tem Marte e seguir seu curso como se ninguém pudesse questioná-lo, o que pode irritar ainda mais."
    ]
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "A forma adversa também vale quando Marte ou Urano está debilitado; essa condição não é calculada nesta versão."
   },
   {
    "de": "par",
    "nota": "Se as disputas serão vistas como variação interessante ou geram ódio mútuo crescente depende do número de contatos harmoniosos entre os mapas; isso não é calculado nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Mars/Uranus",
   "pdfPaginaInicio": 81,
   "pdfPaginaFim": 82,
   "hash": "d2d853db2cae7ab9"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "qualidades masculinas e ideal de masculinidade; a dinâmica de desafio e novo ângulo ficou em núcleo neutro."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "regência fisiológica; fora do escopo."
   },
   {
    "categoria": "prescricao",
    "motivo": "exigência convertida em caminhos apontados."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "debilidade; registrada como dependência."
   },
   {
    "categoria": "previsao",
    "motivo": "referência a casal; trocada por 'pessoas em relação íntima'."
   }
  ]
 },
 {
  "id": "mars-neptune",
  "corpos": [
   "mars",
   "neptune"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "mars": "favorece a abordagem direta e o objetivo claro, prefere campanha curta e incisiva e foca a vida prática",
   "neptune": "tem métodos muitas vezes tortuosos e metas com idealismo e universalidade, e é sensível"
  },
  "favoravel": {
   "classeOriginal": "planetas combinados de modo favorável",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem Netuno pode introduzir uma dimensão nova de sentimento e sensibilidade no desejo de quem tem Marte, que acha a outra pessoa misteriosamente desejável.",
    "Quem tem Netuno pode ajudar quem tem Marte a apreciar o valor tático da manobra menos óbvia e ensinar-lhe a gentileza e a compaixão.",
    "Quem tem Marte pode ajudar quem tem Netuno a dar direção e mais impulso para alcançar seus ideais.",
    "Quando quem tem Marte está desgastado de lutas, quem tem Netuno pode ser fonte de compreensão solidária e apoio.",
    "A combinação traz possibilidades de elevada inspiração e empenho estético."
   ],
   "tensoesPossiveis": [
    "Pela certeza firme de sua abordagem, quem tem Marte pode semear dúvidas em quem tem Netuno que já estava decidido por outro rumo.",
    "Às vezes quem tem Netuno pode se preocupar com algum desastre imaginário que atinja quem tem Marte."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "O núcleo descreve sentimento e sensibilidade novos no desejo entre as duas pessoas."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "O núcleo descreve direção e impulso dados aos ideais de quem tem Netuno."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:3"
     ],
     "justificativa": "Tratam de sensibilidade, compreensão solidária e apoio na fadiga de lutas."
    }
   ],
   "origem": "agrupada_por_tema"
  },
  "adverso": {
   "classeOriginal": "aspecto desfavorável, ou um dos planetas debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Marte favorece a abordagem direta e o objetivo claro; Netuno tem métodos muitas vezes tortuosos e metas com idealismo e universalidade.",
    "Quem tem Netuno pode atrair quem tem Marte e jogar com suas paixões, permanecendo provocadoramente inacessível ou simulando um afeto que não existe.",
    "A relação pode ter tons sensuais."
   ],
   "tensoesPossiveis": [
    "Quem tem Marte pode ficar intrigado ou irritado com a falta de certeza ou clareza e de impulso de quem tem Netuno.",
    "Quem tem Netuno pode não entender por que quem tem Marte faz questão de tudo ou deixa de considerar os sentimentos alheios ao perseguir seus interesses."
   ],
   "excessosPossiveis": [],
   "elaboracao": [
    "Levar em conta a sensibilidade de quem tem Netuno, e a atenção de quem tem Marte voltada à vida prática, é um caminho apontado."
   ],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "tensoesPossiveis:0",
      "tensoesPossiveis:1"
     ],
     "justificativa": "Tratam de abordagem direta contra métodos tortuosos, falta de clareza e mal-entendido entre as duas pessoas."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Tratam de atração explorada, afeto simulado e tons sensuais na relação."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "elaboracao:0",
      "tensoesPossiveis:1"
     ],
     "justificativa": "Tratam da sensibilidade de uma pessoa e dos sentimentos alheios ignorados."
    }
   ],
   "origem": "agrupada_por_tema"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "adverso",
    "nucleos": [
     "Na conjunção, pode existir uma relação física com tons emocionais particularmente fortes."
    ],
    "tensoesPossiveis": [
     "Há casos em que uma das pessoas, ou as duas, não têm amor real pela outra."
    ]
   },
   {
    "aspecto": "opposition",
    "em": "adverso",
    "nucleos": [
     "Na oposição se evidencia o problema de conciliar a franqueza de Marte com a abordagem tortuosa de Netuno.",
     "Quem tem Netuno pode deixar de apreciar aonde quem tem Marte quer chegar e seus objetivos mais amplos, e quem tem Marte quer fixar quem tem Netuno em questões específicas e dissipar a aura de mistério."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "square",
    "em": "adverso",
    "nucleos": [
     "O quadrado acentua as diferenças básicas dos dois planetas e aumenta a dificuldade de uma combinação harmoniosa."
    ],
    "tensoesPossiveis": [
     "Quem tem Netuno pode responder à insensibilidade e à insistência de quem tem Marte com engano e subterfúgio, simulando emoções que não sente.",
     "Quem tem Marte pode tomar as respostas falsas por genuínas, se são o que esperava receber como tributo à própria personalidade.",
     "O clima emocional pode azedar porque as pessoas não têm real percepção das necessidades emocionais e aspirações uma da outra.",
     "O fascínio inicial pode dar lugar a frustração crescente e desilusão, quando quem tem Marte percebe que o glamour era a recusa de Netuno em tratar as questões de modo direto.",
     "Quem tem Netuno pode se ofender com a abordagem sempre brusca de quem tem Marte, que não aprecia seus ideais e pisoteia sua sensibilidade."
    ]
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "A forma adversa também vale quando Marte ou Netuno está debilitado; essa condição não é calculada nesta versão."
   },
   {
    "de": "par",
    "nota": "O livro diz que muito depende do nível de desenvolvimento das pessoas; isso não é modelado nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Mars/Neptune",
   "pdfPaginaInicio": 82,
   "pdfPaginaFim": 83,
   "hash": "2cb155cf4f58bf84"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "fora_do_escopo",
    "motivo": "leitura de mapa individual; fora do escopo."
   },
   {
    "categoria": "genero",
    "motivo": "associação por sexo a sedução e estupro; removida, pois não descreve a dinâmica e depende de gênero."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "'depravação' é julgamento moral; fica só a sensualidade como tom da relação."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "gladiadores, Era de Áries e Peixes; exemplo histórico e simbólico."
   },
   {
    "categoria": "prescricao",
    "motivo": "exigência convertida em caminho apontado."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "nível evolutivo; fora do escopo, registrado como dependência."
   },
   {
    "categoria": "genero",
    "motivo": "condição de sexos opostos removida."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "debilidade; registrada como dependência."
   }
  ]
 },
 {
  "id": "mars-pluto",
  "corpos": [
   "mars",
   "pluto"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "mars": "pode sentir urgência de sondar as profundezas psicológicas ocultas de quem tem Plutão e é atraído a fazer aflorar desejos reprimidos",
   "pluto": "tende a fazer aflorar a capacidade de ação de Marte e pode ser atraído pelo impulso e pela iniciativa de Marte"
  },
  "favoravel": {
   "classeOriginal": "ambos os planetas bem aspectados no mapa natal",
   "aplicaA": [],
   "nucleos": [
    "Quem tem Marte pode fazer aflorar desejos físicos reprimidos de quem tem Plutão, o que pode despertar resposta em quem tem Marte.",
    "Quem tem Plutão pode fazer aflorar a capacidade de ação de quem tem Marte.",
    "Quem tem Marte pode sentir uma urgência irresistível de sondar as profundezas psicológicas ocultas de quem tem Plutão.",
    "O aspecto pode ser particularmente compulsivo.",
    "A combinação pode ser útil e construtiva quando os dois planetas são bem aspectados no mapa natal.",
    "Quem tem Plutão pode ser particularmente atraído pelo impulso e pela iniciativa que Marte simboliza.",
    "Os efeitos desse contato dificilmente são desprezíveis, e a capacidade de cada pessoa de reagir de forma construtiva ao estímulo da outra pode depender de como os planetas se integram nos mapas natais."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:5"
     ],
     "justificativa": "Tratam de desejo trazido à tona, capacidade de ação e atração por iniciativa entre as duas pessoas."
    },
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "nucleos:2",
      "nucleos:3"
     ],
     "justificativa": "Tratam de sondagem das profundezas e de um aspecto compulsivo e intenso."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "O núcleo descreve desejo e resposta íntima entre as duas pessoas."
    }
   ],
   "origem": "condicao_natal"
  },
  "adverso": {
   "classeOriginal": "conjunção ou aspecto desfavorável, ou um dos planetas debilitado, ou ambos muito afligidos",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "A combinação pode ser perigosamente destrutiva quando os dois planetas estão muito afligidos no mapa natal.",
    "O poder de quem tem Plutão de atrair quem tem Marte pode ser usado de modo deliberadamente provocador, com a intenção de levar quem tem Marte a exagerar e se destruir.",
    "Quem tem Marte pode explorar, em proveito próprio, os impulsos profundos de quem tem Plutão.",
    "Pode surgir um sentimento de rivalidade entre as pessoas."
   ],
   "tensoesPossiveis": [
    "Quem tem Plutão em posição fraca pode, consciente ou inconscientemente, convidar de quem tem Marte um tratamento que inflige dor."
   ],
   "excessosPossiveis": [
    "Se a rivalidade sai do controle, quem tem Marte pode adotar uma política de agressão total, sem limites."
   ],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "excessosPossiveis:0",
      "nucleos:3"
     ],
     "justificativa": "Tratam de rivalidade e de agressão total sem limites entre as duas pessoas."
    },
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "Tratam de destruição, provocação deliberada e um ponto de exagero que leva à ruína."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "adverso",
    "nucleos": [
     "Na conjunção, vale a mesma exploração de impulsos profundos descrita para o aspecto adverso."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "A leitura depende dos aspectos a Plutão no nascimento e de como os planetas se integram nos mapas natais; essas condições não são calculadas nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Mars/Pluto",
   "pdfPaginaInicio": 83,
   "pdfPaginaFim": 83,
   "hash": "ee929d2f3b3aba1e"
  },
  "condicoesPorItem": {
   "adverso.nucleos[0]": {
    "natal": true,
    "aspectos": false
   },
   "especificos[0].nucleos[0]": {
    "natal": false,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "qualidades masculinas e femininas atribuídas por sexo; removidas."
   },
   {
    "categoria": "diagnostico",
    "motivo": "atribuição psicológica de causa; fica a dinâmica."
   },
   {
    "categoria": "diagnostico",
    "motivo": "termo clínico; reescrito como tratamento que inflige dor."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "dependência da condição natal; registrada."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "aflição natal dos dois planetas; registrada como dependência."
   }
  ]
 },
 {
  "id": "jupiter-jupiter",
  "corpos": [
   "jupiter",
   "jupiter"
  ],
  "simetria": "simetrico",
  "papeis": null,
  "favoravel": {
   "classeOriginal": "aspecto favorável entre os dois Júpiteres",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "As duas pessoas podem concordar em questões de filosofia, ética e padrões morais gerais.",
    "Costuma haver reconhecimento comum dos fatores que mais servem ao vínculo, o que pode tornar o contato útil entre sócios.",
    "Cada pessoa pode ter respeito saudável pela outra e trabalhar em favor da outra.",
    "O contato estimula a consideração mútua e a disposição de reconhecer os pontos fortes da outra pessoa.",
    "Pode haver tolerância mútua e aceitação ampla do modo de vida da outra pessoa, em qualquer tipo de vínculo."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "O núcleo trata de as duas pessoas chegarem a acordo sobre filosofia e ética, ou seja, de entendimento."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:2",
      "nucleos:3"
     ],
     "justificativa": "Respeito e reconhecimento dos pontos fortes da outra pessoa são o reconhecimento do valor do outro."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:4"
     ],
     "justificativa": "Tolerância mútua e aceitação ampla do modo de vida alheio são ampliação do olhar das duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "um ou os dois Júpiteres debilitados",
   "aplicaA": [],
   "nucleos": [
    "Pode haver diferença de visão sobre filosofia ou religião.",
    "As duas pessoas podem ter padrões morais diferentes."
   ],
   "tensoesPossiveis": [
    "Essas diferenças podem, de vez em quando, ser motivo de desacordo."
   ],
   "excessosPossiveis": [
    "Tendências à expansividade excessiva de uma pessoa podem ficar sem freio ou até ser encorajadas pela outra.",
    "As extravagâncias podem se multiplicar sem cuidado."
   ],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "tensoesPossiveis:0"
     ],
     "justificativa": "Descreve diferença de visão e de padrões que podem gerar desacordo entre as duas pessoas."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "excessosPossiveis:0",
      "excessosPossiveis:1"
     ],
     "justificativa": "O conteúdo é o excesso de expansividade, encorajado ou sem freio, e a multiplicação de extravagâncias."
    }
   ],
   "origem": "condicao_natal"
  },
  "especificos": [],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura adversa vale quando um ou os dois Júpiteres estão debilitados no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro não separa a leitura por aspecto: só distingue o contato favorável do caso de Júpiter debilitado; a lista de aspectos adversos é o padrão do projeto."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Jupiter/Jupiter",
   "pdfPaginaInicio": 84,
   "pdfPaginaFim": 84,
   "hash": "ea3647f1716f02d6"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende de debilidade natal, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "tipo de vínculo (sócios); o repertório é neutro quanto ao vínculo."
   }
  ]
 },
 {
  "id": "jupiter-saturn",
  "corpos": [
   "jupiter",
   "saturn"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "jupiter": "propõe expansão e melhoria, e pode ser quem mais dá",
   "saturn": "dá definição e forma prática, confere gastos e freia, e pode ser quem mais recebe"
  },
  "favoravel": {
   "classeOriginal": "aspecto harmonioso, com Saturno bem situado",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem Saturno pode dar aos planos de expansão e melhoria de quem tem Júpiter definição mais clara, forma prática e mais eficácia, pela experiência.",
    "Em harmonia, as duas pessoas podem assegurar base financeira sólida, com Saturno freando gastos imprudentes de quem tem Júpiter.",
    "Quem tem Júpiter pode encorajar quem tem Saturno a não se reter quando uma ação mais ampla traria resultados maiores.",
    "Diante de erros de juízo de quem tem Júpiter, quem tem Saturno pode intervir como mão estabilizadora.",
    "Quem tem Saturno pode sugerir modos de aplicar no dia a dia os estudos filosóficos de quem tem Júpiter.",
    "Quem tem Saturno pode organizar sobre base sólida os planos de ganho de quem tem Júpiter e canalizar seu impulso de crescimento para empreendimentos de retorno prático.",
    "O par é complementar, mas não traz vantagens automaticamente."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:4",
      "nucleos:5"
     ],
     "justificativa": "Os núcleos tratam de forma prática, base financeira e organização concreta dos planos."
    },
    {
     "categoria": "limites",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:3"
     ],
     "justificativa": "Saturno freia gastos imprudentes e intervém diante de erros, ou seja, contenção sobre o outro."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2"
     ],
     "justificativa": "Planos de expansão ganham definição e há encorajamento a uma ação mais ampla."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou planeta debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Saturno pode levar quem tem Júpiter a perdas financeiras ou em espécie, como um empréstimo com pagamento adiado.",
    "No plano psicológico, a vivacidade de quem tem Júpiter pode ficar um tanto restringida por quem tem Saturno.",
    "Pode haver falta de apreço mútuo."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [
    "Certa dose de concessão de lado a lado pode ajudar a aprimorar o vínculo."
   ],
   "dimensoes": [
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "O núcleo descreve perda financeira e empréstimo com pagamento adiado, ou seja, recursos concretos."
    },
    {
     "categoria": "limites",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "A vivacidade de quem tem Júpiter fica restringida, o que é frustração por contenção."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "A falta de apreço mútuo é falta de reconhecimento do valor da outra pessoa."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "square",
    "em": "adverso",
    "nucleos": [
     "No quadrado, pode ser difícil para as duas pessoas chegarem a um objetivo comum."
    ],
    "tensoesPossiveis": [
     "No quadrado, as duas pessoas podem deixar de se apreciar o bastante."
    ]
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "saturn",
    "nota": "A leitura favorável pressupõe Saturno bem situado no mapa natal; essa condição não é calculada nesta versão."
   },
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos planetas está debilitado; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro diz que muito depende do padrão geral de interação entre os dois mapas."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Jupiter/Saturn",
   "pdfPaginaInicio": 84,
   "pdfPaginaFim": 84,
   "hash": "4fccfb5b9cf6cfd3"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes masculinos aplicados aos planetas; reescritos como quem tem cada planeta."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende de debilidade natal, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende de Saturno bem situado no mapa natal; registrada como dependência."
   }
  ]
 },
 {
  "id": "jupiter-uranus",
  "corpos": [
   "jupiter",
   "uranus"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "jupiter": "encoraja, tolera e pode financiar a originalidade e a independência da outra pessoa",
   "uranus": "traz originalidade, invenção, independência e interesses fora do comum"
  },
  "favoravel": {
   "classeOriginal": "combinação favorável",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem Júpiter pode encorajar a originalidade e a capacidade inventiva de quem tem Urano.",
    "Quem tem Júpiter pode ser tolerante com as manifestações de independência de quem tem Urano.",
    "Em vínculo de negócios, quem tem Urano pode dar a originalidade criativa e quem tem Júpiter o capital para financiar invenções e ideias novas.",
    "Quem tem Júpiter pode apoiar com simpatia os interesses ocultistas ou metafísicos de quem tem Urano e apreciar seu modo pouco ortodoxo.",
    "Quando favoravelmente configurados, quem tem Urano pode receber de repente a generosidade de quem tem Júpiter."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:4"
     ],
     "justificativa": "Há encorajamento da originalidade e generosidade recebida, ou seja, ampliação e crescimento."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "O núcleo trata do capital que financia invenções, isto é, de recursos concretos."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:3"
     ],
     "justificativa": "A tolerância à independência e o apoio ao modo pouco ortodoxo reconhecem o valor da outra pessoa."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "um dos corpos debilitado ou aspecto adverso",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem Urano pode recorrer a ações erráticas para quebrar a complacência de quem tem Júpiter."
   ],
   "tensoesPossiveis": [
    "Quem tem Júpiter pode ser provocado a agir sem prudência."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "tensoesPossiveis:0"
     ],
     "justificativa": "A ação errática de uma pessoa e a reação imprudente da outra descrevem provocação e conflito aberto."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "adverso",
    "nucleos": [
     "A conjunção pode ser uma incógnita, a não ser que um dos Saturnos esteja em aspecto favorável a esse ponto."
    ],
    "tensoesPossiveis": [
     "A excitabilidade de quem tem Urano pode levar quem tem Júpiter a apostar sem necessidade ou a correr riscos desnecessários."
    ]
   },
   {
    "aspecto": "opposition",
    "em": "adverso",
    "nucleos": [],
    "tensoesPossiveis": [
     "Na oposição, as duas pessoas podem não concordar sobre problemas financeiros."
    ]
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "Na conjunção, a leitura depende de um Saturno de uma das pessoas estar em aspecto favorável à conjunção; isso não é calculado nesta versão."
   },
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos corpos está debilitado no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Jupiter/Uranus",
   "pdfPaginaInicio": 84,
   "pdfPaginaFim": 85,
   "hash": "f9562b6b390baea4"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes masculinos aplicados aos planetas; reescritos como quem tem cada planeta."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende de debilidade natal, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento sobre a pessoa; fica só a ação que visa quebrar a complacência."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "tipo de vínculo; mantido só como exemplo da divisão de funções, sem versão própria."
   }
  ]
 },
 {
  "id": "jupiter-neptune",
  "corpos": [
   "jupiter",
   "neptune"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "jupiter": "fomenta e encoraja a inspiração e o idealismo, e tem impulsos filantrópicos",
   "neptune": "traz compaixão, inspiração e idealismo, e uma leitura mais ampla das questões morais"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Existe afinidade simpática: as duas pessoas podem desenvolver compreensão intuitiva das aspirações espirituais e dos valores morais uma da outra.",
    "Quem tem Júpiter pode fomentar e encorajar a inspiração e o idealismo de quem tem Netuno.",
    "A natureza compassiva de quem tem Netuno pode achar saídas caridosas para os impulsos filantrópicos de quem tem Júpiter, dando nova dimensão à sua compreensão filosófica.",
    "Quem tem Netuno pode trazer a quem tem Júpiter uma sensação de rico preenchimento, que pode chegar ao plano material e trazer ganhos financeiros."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "O núcleo trata de compreensão intuitiva, de entendimento mútuo entre as duas pessoas."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Encorajamento da inspiração e nova dimensão à compreensão filosófica são crescimento e ampliação."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "A natureza compassiva é sensibilidade e empatia que encontram saídas para os impulsos da outra pessoa."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:3"
     ],
     "justificativa": "O preenchimento pode chegar ao plano material, com ganhos financeiros."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto desfavorável, ou um corpo debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem Netuno pode induzir a erro quem tem Júpiter, nem sempre de propósito, que sente então a confiança mal depositada.",
    "Quem tem Júpiter pode não apreciar a leitura mais ampla de questões morais de quem tem Netuno e duvidar da sinceridade de seus propósitos."
   ],
   "tensoesPossiveis": [
    "Pode surgir falta de confiança mútua.",
    "Quem tem Netuno pode se aproveitar da generosidade de quem tem Júpiter, apelando à compaixão com histórias tristes ou lhe tirando recursos financeiros ou de outra natureza."
   ],
   "excessosPossiveis": [
    "Os dois planetas são expansivos e podem levar a exageros; nas relações, quem tem Júpiter pode se exibir diante de quem tem Netuno.",
    "Quem tem Netuno pode encenar diante de quem tem Júpiter."
   ],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "Descreve indução a erro, interpretação diferente e dúvida sobre a sinceridade, ou seja, mal-entendido."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "tensoesPossiveis:0"
     ],
     "justificativa": "A falta de confiança mútua é perda de confiança entre as duas pessoas."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "tensoesPossiveis:1"
     ],
     "justificativa": "O núcleo é a perda de recursos financeiros ou de outra natureza."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "excessosPossiveis:0",
      "excessosPossiveis:1"
     ],
     "justificativa": "Exibir-se e encenar diante da outra pessoa são formas de autoexpressão exagerada."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "favoravel",
    "nucleos": [
     "Na conjunção, cada pessoa pode apreciar com simpatia as aspirações da outra."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "A conjunção favorável vale a menos que haja aspectos adversos vindos de outros setores de um dos mapas; isso não é calculado nesta versão."
   },
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos corpos está debilitado no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro dá o exagero como tendência dos dois planetas expansivos juntos, sem ligá-lo a um aspecto; foi posto no adverso, onde aparece."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Jupiter/Neptune",
   "pdfPaginaInicio": 85,
   "pdfPaginaFim": 85,
   "hash": "246b9ca1ed6a8a46"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes masculinos aplicados aos planetas; reescritos como quem tem cada planeta."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende de debilidade natal, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende de aspectos de outros setores dos mapas; registrada como dependência."
   }
  ]
 },
 {
  "id": "jupiter-pluto",
  "corpos": [
   "jupiter",
   "pluto"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "jupiter": "traz otimismo, compreensão filosófica e ajuda a quem tem Plutão a realizar ambições",
   "pluto": "revela impulsos generosos e potenciais profundos, e pode ajudar com conhecimento interno"
  },
  "favoravel": {
   "classeOriginal": "leitura sem ressalva, em contraste com o aspecto desfavorável",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem Plutão pode tornar quem tem Júpiter mais consciente de seus impulsos generosos e filantrópicos.",
    "Quem tem Plutão pode ajudar quem tem Júpiter a realizar potenciais profundos de sua compreensão filosófica, e a consciência de quem tem Júpiter pode passar por transformação.",
    "Quem tem Júpiter pode aumentar o otimismo de quem tem Plutão e dar-lhe maior compreensão de valores filosóficos.",
    "Quem tem Júpiter pode ajudar quem tem Plutão a realizar suas ambições com mais suavidade e persuasão e a achar uma posição de poder e influência.",
    "Por seu conhecimento interno, quem tem Plutão pode ajudar quem tem Júpiter em termos financeiros."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "O núcleo descreve potenciais profundos e uma transformação na consciência da outra pessoa."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2"
     ],
     "justificativa": "Impulsos generosos mais conscientes e otimismo aumentado são crescimento e ampliação."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:3"
     ],
     "justificativa": "A realização de ambições e a busca de posição de poder tratam de liderança e autoexpressão."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:4"
     ],
     "justificativa": "O núcleo é a ajuda financeira por conhecimento interno, isto é, recursos concretos."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto desfavorável, ou um corpo debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem Plutão pode recusar com obstinação a filosofia de vida e os padrões morais de quem tem Júpiter.",
    "Quem tem Júpiter pode achar quem tem Plutão fixado demais no próprio rumo e sem disposição a concessões."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "A recusa obstinada e a falta de concessão são disputa e choque de vontades entre as duas pessoas."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos corpos está debilitado no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Jupiter/Pluto",
   "pdfPaginaInicio": 85,
   "pdfPaginaFim": 85,
   "hash": "9e95f7b6375dc8e7"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes masculinos aplicados aos planetas; reescritos como quem tem cada planeta."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende de debilidade natal, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "saturn-saturn",
  "corpos": [
   "saturn",
   "saturn"
  ],
  "simetria": "simetrico",
  "papeis": null,
  "favoravel": {
   "classeOriginal": "aspecto favorável entre os dois Saturnos",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "As duas pessoas podem apreciar o senso de responsabilidade uma da outra e confiar na integridade da outra.",
    "A capacidade de autodisciplina de uma pessoa não opera em desconforto da outra, e cada uma pode buscar seus objetivos práticos sem choque.",
    "O contato é fator de estabilidade e traz solidez, confiabilidade e dependência mútua que favorecem a permanência do vínculo.",
    "As duas pessoas podem colaborar em planos de segurança financeira e de aposentadoria.",
    "A experiência de uma pode complementar e reforçar a da outra, e cada uma pode ensinar à outra lições valiosas, com muito menos dor que sob aspecto adverso."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2"
     ],
     "justificativa": "Responsabilidade, integridade e confiabilidade mútuas sustentam a permanência do vínculo."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "O núcleo é a busca de objetivos práticos de cada pessoa sem choque entre elas."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:3"
     ],
     "justificativa": "O núcleo trata de planos de segurança financeira e de aposentadoria, isto é, de organização concreta."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou um dos Saturnos debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "As duas pessoas podem não concordar na divisão de responsabilidades.",
    "Numa área em que uma pessoa se sente inferior, pode haver compensação em excesso às custas da outra.",
    "Pode haver disputa por supremacia, cada pessoa achando que tem razão a seu modo e usando métodos tão diferentes que fica difícil achar base comum de trabalho.",
    "Os aspectos adversos tendem a testar o senso de segurança de cada pessoa e a criar uma atmosfera tensa."
   ],
   "tensoesPossiveis": [
    "Pode haver choque entre as ambições de cada pessoa.",
    "As dificuldades podem ser de circunstância, e não psicológicas, e testar a capacidade de resistência paciente e a disposição de assumir grande responsabilidade.",
    "Se uma pessoa não respeita os compromissos mais sérios da outra, pode surgir discórdia."
   ],
   "excessosPossiveis": [],
   "elaboracao": [
    "Um acordo que dê a cada pessoa suas áreas próprias de responsabilidade, com suas ideias e métodos, pode ser um modo de lidar com a situação.",
    "Em alguns casos, cada pessoa pode seguir uma carreira independente."
   ],
   "dimensoes": [
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:2",
      "tensoesPossiveis:0"
     ],
     "justificativa": "A disputa por supremacia e o choque de ambições são disputa e conflito aberto entre as duas pessoas."
    },
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "nucleos:0",
      "tensoesPossiveis:1",
      "tensoesPossiveis:2"
     ],
     "justificativa": "A divisão de responsabilidades e o respeito aos compromissos sérios tratam de dever assumido."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "A sensação de inferioridade e a compensação em excesso tratam do senso de si de cada pessoa."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:3"
     ],
     "justificativa": "O teste do senso de segurança e a atmosfera tensa tratam de segurança afetiva."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "square",
    "em": "adverso",
    "nucleos": [
     "No quadrado, as divergências sobre a divisão de responsabilidades podem ser especialmente marcadas."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "opposition",
    "em": "adverso",
    "nucleos": [
     "Na oposição, cada pessoa pode parecer à outra contida demais para ser receptiva.",
     "Na oposição, cada pessoa pode ser tentada a questionar qualquer pretensão de autoridade da outra.",
     "Na oposição, o efeito pode aparecer sobretudo nas casas dos dois mapas em que os Saturnos caem."
    ],
    "tensoesPossiveis": [
     "Se uma das pessoas tem Saturno na casa sete, a oposição pode ser uma relação especialmente exigente."
    ]
   },
   {
    "aspecto": "conjunction",
    "em": "ambos",
    "nucleos": [
     "Na conjunção, as pessoas podem compartilhar responsabilidades, preocupações e experiências, cada uma aprendendo com a outra.",
     "Um laço pode se formar por as pessoas se sentirem parceiras na adversidade."
    ],
    "tensoesPossiveis": [
     "As duas pessoas podem ficar dependentes demais uma da outra."
    ]
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos Saturnos está debilitado no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro diz que a oposição só ocorre com grande diferença de idade, de cerca de 15, 45 ou 75 anos, o que a liga a um tema geracional."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Saturn/Saturn",
   "pdfPaginaInicio": 86,
   "pdfPaginaFim": 86,
   "hash": "411d6e4c4bc297ce"
  },
  "condicoesPorItem": {
   "favoravel.nucleos[4]": {
    "natal": false,
    "aspectos": true
   },
   "adverso.nucleos[3]": {
    "natal": false,
    "aspectos": true
   }
  },
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronome masculino aplicado a cada pessoa; reescrito como cada pessoa."
   },
   {
    "categoria": "papel_social",
    "motivo": "variação por tipo de relação; o repertório é neutro quanto ao vínculo."
   },
   {
    "categoria": "karma",
    "motivo": "causa cármica atribuída; fica só a dificuldade de circunstância."
   },
   {
    "categoria": "previsao",
    "motivo": "augúrio sobre tipos de relação; é previsão e variação por vínculo."
   },
   {
    "categoria": "diagnostico",
    "motivo": "exemplos de doença e deficiência; não entram como dinâmica."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "juízo de quem tem razão; fica só o desacordo de métodos."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende de debilidade natal, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "tipos de vínculo; o repertório é neutro quanto ao vínculo."
   },
   {
    "categoria": "prescricao",
    "motivo": "a necessidade de evitar o choque virou só a descrição do choque possível."
   },
   {
    "categoria": "fatalismo",
    "motivo": "tendência fatalista suavizada para 'pode haver'."
   }
  ]
 },
 {
  "id": "saturn-uranus",
  "corpos": [
   "saturn",
   "uranus"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "saturn": "representa a ordem estabelecida, a cautela e o hábito",
   "uranus": "representa o novo, a independência e a originalidade"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem Urano pode mostrar a quem tem Saturno as vantagens de uma abordagem original diante de problemas antigos.",
    "Quem tem Saturno pode mostrar a quem tem Urano como disciplinar tendências erráticas e atenuar excentricidades, para que sejam mais aceitáveis ao elemento ortodoxo da sociedade.",
    "Quem tem Saturno pode ajudar quem tem Urano a organizar a inventividade e a aplicar a originalidade e a engenhosidade de modo prático e eficaz.",
    "Cada planeta pode ser ajudado pela ação moderadora do outro."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "O núcleo trata de uma abordagem original diante de problemas antigos, ou seja, de mudança."
    },
    {
     "categoria": "limites",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "Disciplinar tendências erráticas e atenuar excentricidades é contenção sobre a outra pessoa."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "Organizar a inventividade e aplicá-la de modo prático e eficaz é organização concreta."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou um planeta debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem Saturno pode ver o comportamento mais extravagante de quem tem Urano com desagrado e reprovação, buscando frear suas excentricidades e seu desprezo pela convenção.",
    "Quem tem Saturno pode tentar incutir um senso de autodisciplina e de respeito ao costume estabelecido que sente faltar.",
    "Há notável falta de simpatia entre as duas pessoas.",
    "Quem tem Urano pode ser levado a comportamento ainda mais extravagante, para chocar o senso de decoro de quem tem Saturno."
   ],
   "tensoesPossiveis": [
    "Pode haver uma situação de anda e para, em que cada pessoa despreza certos traços da outra e ainda encontra muito a admirar.",
    "A cautela e as táticas de adiamento de quem tem Saturno podem chocar com a abordagem confiante e espontânea de quem tem Urano, e cada um sente que o outro o desequilibra.",
    "Quem tem Saturno pode perder a confiança em seu senso de oportunidade, e quem tem Urano pode sentir desperdiçado seu talento para improvisar na hora.",
    "Entre pessoas que se conhecem agora, pode surgir rápida irritação mútua que impeça uma associação duradoura.",
    "Pode haver discórdia, e as duas pessoas podem ter problemas difíceis a resolver antes de se sentirem à vontade juntas.",
    "Uma atitude conservadora demais pode estreitar a mente e levar a oportunidades perdidas; uma experimental demais pode levar a erros, por desprezar a história ou faltar com precauções.",
    "A diferença básica entre os dois planetas não indica uma combinação fácil das virtudes que cada um representa.",
    "Quem tem Saturno tende a se sentir pouco à vontade diante da independência e da falta de conformismo de quem tem Urano."
   ],
   "excessosPossiveis": [],
   "elaboracao": [
    "Quem tem Urano pode conseguir ajudar quem tem Saturno a adotar um estilo de vida mais moderno e original."
   ],
   "dimensoes": [
    {
     "categoria": "limites",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "Frear excentricidades e incutir autodisciplina e respeito ao costume são tentativas de contenção."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:3",
      "tensoesPossiveis:1"
     ],
     "justificativa": "O comportamento extravagante para chocar e o choque de ritmos descrevem disputa entre as duas pessoas."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:2",
      "tensoesPossiveis:3",
      "tensoesPossiveis:7"
     ],
     "justificativa": "A falta de simpatia e a irritação mútua tratam de sentimento e sensibilidade entre as pessoas."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "tensoesPossiveis:2"
     ],
     "justificativa": "Perder a confiança no próprio senso de oportunidade e sentir desperdiçado o próprio talento tratam do senso de si."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "adverso",
    "nucleos": [
     "Na conjunção, há uma luta implícita de poder entre o velho e o novo.",
     "Quem tem Urano pode levar quem tem Saturno a uma prova de força, testando até onde afirma a independência e vence a oposição obstinada a um rumo pouco ortodoxo."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "opposition",
    "em": "adverso",
    "nucleos": [
     "Na oposição, quem tem Saturno pode conter de modo útil as inclinações mais excêntricas de quem tem Urano."
    ],
    "tensoesPossiveis": [
     "Na oposição, se não há aceitação mútua de que novidades se integrem à prática estabelecida e de que ficar parado traz deterioração, podem surgir discórdias e um desgosto mútuo que desgasta o vínculo."
    ]
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos planetas está debilitado; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Saturn/Uranus",
   "pdfPaginaInicio": 87,
   "pdfPaginaFim": 87,
   "hash": "ffc6004deda61c32"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes masculinos aplicados aos planetas; reescritos como quem tem cada planeta."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "adjetivo valorativo sobre quem tem Saturno; fica só o choque ao decoro."
   },
   {
    "categoria": "prescricao",
    "motivo": "condição de aceitação mútua escrita como descrição, sem dever."
   },
   {
    "categoria": "fatalismo",
    "motivo": "o inevitável foi reescrito como possibilidade."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende de debilidade natal, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "leitura de mapa natal, fora da sinastria."
   }
  ]
 },
 {
  "id": "saturn-neptune",
  "corpos": [
   "saturn",
   "neptune"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "saturn": "traz abordagem prática e realista, sentido de responsabilidade e leitura literal",
   "neptune": "traz ideais, inspiração, nuances e linguagem figurada, com compreensão ampla e compassiva"
  },
  "favoravel": {
   "classeOriginal": "aspecto harmonioso, ou o melhor da combinação",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem Saturno pode mostrar a quem tem Netuno como dar expressão prática a ideais, inspirações e sonhos e como conter e usar com eficácia seus voos de fantasia.",
    "Quem tem Netuno pode apresentar a quem tem Saturno um olhar menos prosaico e mais idealista.",
    "Quem tem Saturno pode ajudar quem tem Netuno a adotar abordagem mais prática, e quem tem Netuno pode mostrar que a vida não é regida só pela tradição e pelas exigências da necessidade.",
    "Quem tem Netuno pode ensinar a quem tem Saturno certa resignação e reverência pelos aspectos espirituais da vida, e quem tem Saturno pode ajudar a avaliar com objetividade os problemas do dia a dia."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2"
     ],
     "justificativa": "Dar expressão prática a ideais e adotar abordagem mais prática tratam de organização concreta."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:3"
     ],
     "justificativa": "Um olhar mais idealista e a reverência pelo espiritual são ampliação do modo de ver da outra pessoa."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou um planeta debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem Saturno pode desconfiar da aparente falta de definição de quem tem Netuno e achar que a maioria dos problemas se expressa em preto e branco, enquanto quem tem Netuno percebe miríades de tons sutis.",
    "Quem tem Saturno pode optar sem concessões por uma solução prática de senso comum, que deixa a outra pessoa chocada com a aparente falta de sentimento e de consciência dos aspectos espirituais.",
    "Pode ser difícil para quem tem Saturno fazer quem tem Netuno assumir responsabilidade, pois o que importa a um pode parecer de pouca importância ao outro.",
    "Pressão indesejada de quem tem Saturno pode levar quem tem Netuno a buscar seus fins por subterfúgio.",
    "O que quem tem Saturno tomou por promessa firme pode não ter sido assim pretendido por quem tem Netuno, cuja linguagem poética pode ter sido lida de modo literal."
   ],
   "tensoesPossiveis": [
    "Quem tem Netuno pode se decepcionar com a insensibilidade e o centramento em si de quem tem Saturno.",
    "Quem tem Saturno pode duvidar da integridade de quem tem Netuno.",
    "Pode haver falha em conciliar valores materiais e espirituais, e tentar forçar a questão ou impor regras pode trazer mais problema do que resolve.",
    "Planos de lucro financeiro por meio da outra pessoa podem se revelar ilusões, e a credulidade de quem tem Netuno pode ser explorada para fins financeiros.",
    "Para quem tem Saturno, Netuno pode representar a ameaça do desconhecido, e para quem tem Netuno a falta de sensibilidades mais finas de Saturno pode ser incompreensível."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:4"
     ],
     "justificativa": "Preto e branco contra tons sutis e palavra poética lida de modo literal são mal-entendido."
    },
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "nucleos:2",
      "nucleos:4"
     ],
     "justificativa": "Assumir responsabilidade e o que foi tomado por promessa firme tratam de dever assumido."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "tensoesPossiveis:1"
     ],
     "justificativa": "A dúvida sobre a integridade da outra pessoa é abalo da confiança íntima."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "tensoesPossiveis:0"
     ],
     "justificativa": "A decepção diante da insensibilidade trata de sentimento e sensibilidade."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "tensoesPossiveis:3"
     ],
     "justificativa": "O núcleo é o lucro financeiro por meio da outra pessoa e sua exploração, isto é, recursos concretos."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "opposition",
    "em": "adverso",
    "nucleos": [
     "Na oposição, alguma acomodação entre as ambições materiais de quem tem Saturno e as aspirações espirituais de quem tem Netuno pode ser possível."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "square",
    "em": "adverso",
    "nucleos": [],
    "tensoesPossiveis": [
     "No quadrado, cada pessoa pode ficar com sensação de frustração e até consternação diante da tarefa aparentemente impossível de conciliar objetivos e pontos de vista tão diferentes."
    ]
   },
   {
    "aspecto": "conjunction",
    "em": "ambos",
    "nucleos": [
     "A conjunção pode colocar as pessoas diante da decisão de quem assume a responsabilidade na área do signo e das casas em que ocorre."
    ],
    "tensoesPossiveis": [
     "Quem tem Saturno pode acabar assumindo o comando por conta própria, pois forçar quem tem Netuno a assumir responsabilidade costuma dar pouco resultado.",
     "Quem tem Saturno pode sentir-se no dever de tomar quem tem Netuno em mãos para ensinar a ser mais eficiente."
    ]
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos planetas está debilitado; essa condição não é calculada nesta versão."
   },
   {
    "de": "par",
    "nota": "Na conjunção, o livro diz que muito depende de aspectos feitos à conjunção por planetas de uma das pessoas; isso não é calculado nesta versão."
   }
  ],
  "limitacoes": [
   "O livro abre chamando esta de outra combinação difícil; a leitura favorável é descrita como o melhor caso e como o aspecto harmonioso."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Saturn/Neptune",
   "pdfPaginaInicio": 88,
   "pdfPaginaFim": 89,
   "hash": "2bf2fc23060df7fd"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes masculinos aplicados aos planetas; reescritos como quem tem cada planeta."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "rótulo de irresponsabilidade crônica; fica só a dinâmica de responsabilidade."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento moral; fica só a possibilidade de explorar a credulidade."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta; não entra na camada operacional."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de resignação; só a descrição de quem assume o comando foi mantida."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende de debilidade natal, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "saturn-pluto",
  "corpos": [
   "saturn",
   "pluto"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "saturn": "traz dependabilidade, aplicação e ambição, e pode tentar restringir",
   "pluto": "traz dedicação total e pode minar, destruir ou agir às escondidas"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem Saturno pode apreciar a dedicação total de quem tem Plutão.",
    "Quem tem Plutão pode admirar a confiabilidade, a aplicação e a ambição de quem tem Saturno.",
    "Em vínculo de negócios, a combinação pode ajudar as pessoas a assentar o empreendimento em base firme.",
    "O contato rende mais quando cada pessoa tem respeito saudável pelas qualidades da outra."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:3"
     ],
     "justificativa": "Apreciar a dedicação, admirar a confiabilidade e respeitar as qualidades é reconhecer o valor da outra pessoa."
    },
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "A confiabilidade e a aplicação admiradas tratam de lealdade e estabilidade."
    },
    {
     "categoria": "vida_pratica",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "O núcleo é assentar um empreendimento em base firme, isto é, organização concreta."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou um planeta debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem Plutão pode explorar os medos de quem tem Saturno, minar seu senso de responsabilidade ou destruir o que quem tem Saturno constrói com cuidado.",
    "Quem tem Saturno pode tentar restringir a liberdade de ação de quem tem Plutão, em alguns casos como tentar impedir para sempre a erupção de um vulcão.",
    "Quem tem Plutão pode assumir uma atitude mais distante e agir às escondidas para alcançar seus fins."
   ],
   "tensoesPossiveis": [
    "A não ser que outros setores dos mapas tragam fortes elementos de compatibilidade, o choque pode levar a inveja, desconfiança mútua e antagonismo profundo."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "limites",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "A tentativa de restringir a liberdade de ação é freio e controle sobre a outra pessoa."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:2"
     ],
     "justificativa": "Minar, destruir e agir às escondidas para alcançar fins tratam de disputa e conflito."
    },
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "Destruir o que a outra pessoa constrói é ruptura e crise."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "tensoesPossiveis:0"
     ],
     "justificativa": "Inveja e desconfiança mútua tratam de confiança íntima abalada."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "square",
    "em": "adverso",
    "nucleos": [
     "No quadrado, o choque entre as duas pessoas é indicado como especialmente marcado."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "conjunction",
    "em": "ambos",
    "nucleos": [
     "A conjunção é um aspecto crucial, em que quem tem Saturno pode sentir forte compulsão de prestar serviço a quem tem Plutão."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos planetas está debilitado; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro chama esta combinação de difícil no mapa natal; essa leitura natal não foi usada."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Saturn/Pluto",
   "pdfPaginaInicio": 89,
   "pdfPaginaFim": 89,
   "hash": "1e0a0e1a6bfe81cc"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes masculinos aplicados aos planetas; reescritos como quem tem cada planeta."
   },
   {
    "categoria": "karma",
    "motivo": "significação cármica; não entra."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende de debilidade natal, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "leitura de mapa natal, fora da sinastria."
   }
  ]
 },
 {
  "id": "uranus-uranus",
  "corpos": [
   "uranus",
   "uranus"
  ],
  "simetria": "simetrico",
  "papeis": null,
  "favoravel": {
   "classeOriginal": "sextil ou trígono entre os dois Urano",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "O sextil ou o trígono pode indicar que a experiência da pessoa mais velha estimula a mais nova a explorar novos caminhos de pensamento, ampliando sua originalidade criativa.",
    "O contato pode ser útil entre pessoas que partilham um passatempo, pois cada uma pode trazer um ponto de vista que abre novos horizontes à outra.",
    "A pessoa mais velha pode apreciar a visão e os objetivos da mais nova e dar-lhe a liberdade necessária para pôr os planos em prática."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1"
     ],
     "justificativa": "Novos caminhos de pensamento e novos horizontes abertos à outra pessoa são ampliação."
    },
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "Cada pessoa traz um ponto de vista à outra, o que é troca de ideias."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "O núcleo inclui reforçar a originalidade criativa da pessoa mais nova, ou seja, autoexpressão."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "Dar liberdade para pôr planos em prática trata de iniciativa."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, sobretudo o quadrado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "No quadrado, pode ser difícil para a pessoa mais velha compreender o desejo de liberdade de ação da mais nova, o que pode estar na raiz da diferença de perspectiva entre gerações.",
    "O quadrado indica que os impulsos de autoexpressão dinâmica das duas pessoas estão no ponto de maior conflito.",
    "A pessoa mais velha pode sentir que tem o direito de ditar o comportamento que espera da mais nova, que se ressente do que vê como limitação injustificada e busca de propósito formas de mostrar independência."
   ],
   "tensoesPossiveis": [
    "O quadrado é um aspecto potencialmente explosivo.",
    "Qualquer tentativa da geração mais velha de fazer o relógio voltar é alheia ao espírito de Urano e pode resultar em atrito ou revolta."
   ],
   "excessosPossiveis": [],
   "elaboracao": [
    "Os resultados podem ser mais favoráveis quando as duas partes admitem que cada geração tem sua abordagem de questões morais, intelectuais e espirituais e seu papel no ciclo do progresso humano.",
    "Responsabilidade e autodisciplina podem florescer quando há certa margem de liberdade para ganhar experiência."
   ],
   "dimensoes": [
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "A dificuldade de compreender o desejo de liberdade e a diferença de perspectiva são mal-entendido entre gerações."
    },
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Os impulsos de autoexpressão em conflito e a busca de mostrar independência tratam do senso de si."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:2",
      "tensoesPossiveis:0"
     ],
     "justificativa": "Ditar comportamento, ressentir limitação e o aspecto explosivo tratam de disputa e conflito aberto."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "favoravel",
    "nucleos": [
     "Na conjunção, com os Urano favoravelmente aspectados, as pessoas podem concordar sobre novos rumos e novas ideias."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "conjunction",
    "em": "ambos",
    "nucleos": [
     "A conjunção pode se referir sobretudo ao efeito sobre as duas pessoas de acontecimentos do mundo exterior."
    ],
    "tensoesPossiveis": [
     "A conjunção pode ser um contato nervoso, com risco de discórdia se os direitos e a liberdade de ação de cada pessoa não são respeitados."
    ]
   },
   {
    "aspecto": "opposition",
    "em": "ambos",
    "nucleos": [
     "A oposição, de natureza complementar, pode ser estimulante para o pensamento em alguns vínculos."
    ],
    "tensoesPossiveis": [
     "Na oposição, qualquer comportamento pouco ortodoxo da pessoa mais nova pode irritar a mais velha, sobretudo se esta é indulgente com as extravagâncias da juventude."
    ]
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "Na conjunção, o livro diz que muito depende dos aspectos feitos a esse ponto por outros planetas; isso não é calculado nesta versão."
   },
   {
    "de": "ambos",
    "nota": "A leitura estimulante da oposição só vale quando Urano está bem integrado nos mapas natais; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro liga os aspectos à diferença de idade: a conjunção vale para contemporâneos, e sextil, quadrado, trígono e oposição pedem cerca de 14, 21, 28 e 42 anos.",
   "O livro trata o quadrado, em particular, como tema de diferença entre gerações; essa leitura é geracional e vale só como dinâmica entre as duas pessoas."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Uranus/Uranus",
   "pdfPaginaInicio": 89,
   "pdfPaginaFim": 90,
   "hash": "503ae6582fd2b6bf"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes masculinos aplicados às pessoas; reescritos como a pessoa mais nova."
   },
   {
    "categoria": "papel_social",
    "motivo": "variação por tipo de relação; o repertório é neutro quanto ao vínculo."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta a cada lado; só a leitura descritiva foi mantida."
   },
   {
    "categoria": "fatalismo",
    "motivo": "'só pode' reescrito como possibilidade."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "adjetivo de valor; não entra."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da integração natal de Urano, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "tipo de relação; o repertório é neutro quanto ao vínculo."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "trata de planetas mais rápidos com Urano, fora do par."
   }
  ]
 },
 {
  "id": "uranus-neptune",
  "corpos": [
   "uranus",
   "neptune"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "uranus": "mobiliza de modo dinâmico as faculdades intuitivas",
   "neptune": "é um estado de consciência receptivo e ultrassensível"
  },
  "favoravel": null,
  "adverso": {
   "classeOriginal": "conjunção e aspectos adversos, ou um corpo debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "As duas pessoas podem sentir uma dissonância vaga, difícil de explicar, mas real.",
    "Quem tem Urano pode mexer com a imaginação de quem tem Netuno e produzir uma intensidade emocional difícil de controlar.",
    "Essa intensidade pode inspirar quem tem Netuno a um novo nível de criatividade artística e ampliar sua consciência espiritual.",
    "Quem tem Netuno pode acrescentar visão e compaixão ao olhar utópico de quem tem Urano.",
    "Quem tem Netuno pode mexer de modo sutil com a capacidade de excitação de quem tem Urano, o que pode aumentar sua intuição ou deixar a pessoa mais inquieta e errática."
   ],
   "tensoesPossiveis": [
    "Quem tem Urano pode aumentar a capacidade de quem tem Netuno de se iludir ou sua dificuldade de formular ideias com precisão cristalina.",
    "Quem tem Urano pode se sentir totalmente frustrado com a imprevisibilidade de quem tem Netuno.",
    "A parceria pode ficar vagamente insatisfatória, com um descontentamento sutil e nebuloso, difícil de identificar e mais ainda de resolver."
   ],
   "excessosPossiveis": [],
   "elaboracao": [
    "O contato pode ser manejado por pessoas cujo desenvolvimento pessoal está bem adiantado."
   ],
   "dimensoes": [
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:1",
      "tensoesPossiveis:2"
     ],
     "justificativa": "A intensidade emocional difícil de controlar e o descontentamento nebuloso tratam de sentimento e sensibilidade."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:2",
      "nucleos:3"
     ],
     "justificativa": "Novo nível de criatividade e acréscimo de visão e compaixão são crescimento e ampliação."
    },
    {
     "categoria": "comunicacao",
     "sustentadaPor": [
      "tensoesPossiveis:0"
     ],
     "justificativa": "A dificuldade de formular ideias com precisão trata de linguagem e compreensão."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "adverso",
    "nucleos": [
     "Na conjunção, essa dissonância vaga entre as duas pessoas também pode aparecer."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos corpos está debilitado no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro não dá valência favorável própria a este par; os resultados possíveis, inclusive os de inspiração, aparecem na leitura adversa.",
   "O livro situa a oposição Urano/Netuno numa geração e época específicas; essa leitura geracional e histórica não entrou na glosa."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Uranus / Neptune",
   "pdfPaginaInicio": 90,
   "pdfPaginaFim": 90,
   "hash": "ddfd5c618f4f2e83"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "exemplo_historico",
    "motivo": "tema geracional e histórico (Primeira Guerra, jazz); não entra como dinâmica da sinastria."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "rótulos 'positivo' e 'negativo'; reescritos como dinâmico e receptivo."
   },
   {
    "categoria": "genero",
    "motivo": "pronome masculino aplicado ao planeta; reescrito como quem tem Netuno."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende de debilidade natal, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "comentário sobre a literatura, fora do escopo."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de manejo; mantido só como descrição de possibilidade."
   },
   {
    "categoria": "diagnostico",
    "motivo": "expressão de tom clínico; mantida só como dificuldade de formular ideias e de se iludir, em termos descritivos."
   }
  ]
 },
 {
  "id": "uranus-pluto",
  "corpos": [
   "uranus",
   "pluto"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "uranus": "afirma individualidade e originalidade, e age de modo aberto e muitas vezes errático",
   "pluto": "mobiliza apoio e oposição, e pode agir às escondidas"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Quem tem Plutão pode ajudar quem tem Urano a afirmar a individualidade com mais eficácia e a expressar a originalidade de modo mais dramático, mobilizando apoio e estimulando maiores esforços.",
    "Quem tem Urano pode mostrar a quem tem Plutão novos caminhos para alcançar seus objetivos.",
    "Se as duas pessoas têm interesses fora do comum, a colaboração pode produzir resultados empolgantes.",
    "O contato pode ser muito útil quando as duas pessoas são ambiciosas e empreendedoras, em particular numa parceria de negócios."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "identidade",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "O núcleo é afirmar a individualidade e expressar a originalidade com mais eficácia."
    },
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "Mostrar novos caminhos para alcançar objetivos trata de mudança."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "Interesses fora do comum que produzem resultados empolgantes tratam de ampliação."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:3"
     ],
     "justificativa": "Ambição e iniciativa empreendedora das duas pessoas tratam de iniciativa e desejo."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto adverso, ou um planeta debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "O elemento de vontade própria de cada lado pode entrar em jogo de forma abrupta.",
    "Quem tem Urano pode agir de modo mais aberto e muitas vezes errático para conseguir o que quer.",
    "Quem tem Plutão pode agir às escondidas e mobilizar oposição poderosa contra a outra pessoa."
   ],
   "tensoesPossiveis": [
    "Quem tem Plutão pode estranhar o comportamento errático ou imprevisível de quem tem Urano.",
    "Quem tem Urano pode se sentir desconfortável com traços menos óbvios de quem tem Plutão, que parecem dominar seu sentir e pensar.",
    "A mudança pode se tornar uma questão central na parceria.",
    "Pode haver situações em que nenhuma das pessoas quer transigir."
   ],
   "excessosPossiveis": [],
   "elaboracao": [
    "Um acordo sobre eliminar de forma drástica os fatores que irritam as duas pessoas pode ser essencial à continuidade da parceria."
   ],
   "dimensoes": [
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Vontade própria, ação aberta e errática e oposição mobilizada tratam de disputa e conflito aberto."
    },
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "tensoesPossiveis:2",
      "elaboracao:0"
     ],
     "justificativa": "A mudança como questão central e a eliminação drástica de fatores tratam de mudança profunda."
    },
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "tensoesPossiveis:1"
     ],
     "justificativa": "O desconforto com traços que dominam o sentir e o pensar trata de sensibilidade."
    },
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "elaboracao:0"
     ],
     "justificativa": "O acordo é condição para a continuidade da parceria, ou seja, a permanência do vínculo."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos planetas está debilitado; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Uranus/Pluto",
   "pdfPaginaInicio": 91,
   "pdfPaginaFim": 91,
   "hash": "f59fc51c39177b8a"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronomes masculinos aplicados aos planetas; reescritos como quem tem cada planeta."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende de debilidade natal, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "previsao",
    "motivo": "previsão de rompimento; não entra."
   },
   {
    "categoria": "fatalismo",
    "motivo": "tom de inevitabilidade; não entra."
   }
  ]
 },
 {
  "id": "neptune-neptune",
  "corpos": [
   "neptune",
   "neptune"
  ],
  "simetria": "simetrico",
  "papeis": null,
  "favoravel": {
   "classeOriginal": "Netunos bem aspectados (sextil, trígono e conjunção)",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "No trígono, pode haver sintonia semelhante, e a pessoa mais velha pode inflamar a imaginação da mais nova e dar-lhe uma visão que estimula suas realizações posteriores.",
    "No sextil, como na conjunção, a sintonia simpática pode favorecer a relação entre quem se dirige a um público e esse público ou os colegas de trabalho.",
    "Esse tipo de vínculo, nos aspectos favoráveis, também pode ocorrer entre o mapa de uma cidade e os de habitantes que sentem forte sintonia com o ambiente ou são muito estimados pelos concidadãos."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:0",
      "nucleos:1",
      "nucleos:2"
     ],
     "justificativa": "Sintonia simpática, imaginação inflamada e sensação de rapport tratam de sensibilidade e empatia."
    },
    {
     "categoria": "expansao",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "Uma visão que estimula realizações posteriores é ampliação e crescimento."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "Netuno mal aspectado no mapa natal de uma das pessoas",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Se uma pessoa tem Netuno mal aspectado no mapa natal, a outra pode sentir decepção sutil com uma qualidade de ser, real ou imaginada, que a primeira mostra ou parece mostrar."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "A decepção sutil diante de uma qualidade real ou imaginada trata de sentimento e sensibilidade."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "ambos",
    "nucleos": [
     "Na conjunção entre Netunos bem aspectados, pode haver forte sintonia simpática entre as pessoas.",
     "Na conjunção, cada pessoa pode alimentar os sonhos da outra e fomentar suas ilusões, conforme os aspectos feitos à conjunção por outros pontos dos mapas."
    ],
    "tensoesPossiveis": []
   },
   {
    "aspecto": "square",
    "em": "adverso",
    "nucleos": [],
    "tensoesPossiveis": [
     "No quadrado, pode haver falha em compreender os humores emocionais mais sutis da outra pessoa.",
     "No quadrado, o que cada pessoa vê como desejo do coração pode parecer inconciliável."
    ]
   },
   {
    "aspecto": "opposition",
    "em": "favoravel",
    "nucleos": [
     "Na oposição, o legado de alguém de outra época, em música, arte, filosofia ou exemplo de vida, pode ter apelo vívido para outra pessoa."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "Na conjunção, o livro diz que harmonia ou discórdia dependem dos aspectos feitos à conjunção por outros pontos dos mapas; isso não é calculado nesta versão."
   },
   {
    "de": "neptune",
    "nota": "A leitura adversa vale quando um dos Netunos está mal aspectado no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro diz que só a conjunção ocorre entre pessoas da mesma geração; o quadrado, o trígono e a oposição pedem cerca de 41, 61 e 82 anos de diferença.",
   "Para o livro, Netuno indica como cada pessoa responde ao clima emocional e às metas de sua própria geração."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Neptune/Neptune",
   "pdfPaginaInicio": 91,
   "pdfPaginaFim": 92,
   "hash": "83f0537f97ed991e"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "referência a gênero e a lamento de idade; não entra."
   },
   {
    "categoria": "exemplo_historico",
    "motivo": "citação de exemplo ilustrativo; não entra."
   },
   {
    "categoria": "diagnostico",
    "motivo": "exemplo clínico de um tipo de relação; não entra."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta em relação profissional; não entra."
   },
   {
    "categoria": "papel_social",
    "motivo": "variação por tipo de relação; o repertório é neutro quanto ao vínculo."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "previsão sobre a fase de vida; tratada como limitação por idade."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende de aspecto natal, que o motor não calcula; registrada como dependência."
   }
  ]
 },
 {
  "id": "neptune-pluto",
  "corpos": [
   "neptune",
   "pluto"
  ],
  "simetria": "assimetrico",
  "papeis": {
   "neptune": "reage tornando-se esquivo e misterioso",
   "pluto": "sonda fraquezas, medos e fantasias"
  },
  "favoravel": {
   "classeOriginal": "aspecto favorável",
   "aplicaA": [
    "trine",
    "sextile"
   ],
   "nucleos": [
    "Se as duas pessoas atuam em trabalho assistencial ou em atividades de natureza artística e agem com integridade madura, pode haver colaboração útil."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "sustentacao_compromisso",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "O núcleo é uma colaboração útil com integridade madura em trabalho assistencial ou artístico."
    }
   ],
   "origem": "separada_pela_fonte"
  },
  "adverso": {
   "classeOriginal": "aspecto desfavorável, ou um corpo debilitado",
   "aplicaA": [
    "square",
    "opposition",
    "quincunx"
   ],
   "nucleos": [
    "Quem tem Plutão pode mexer com os medos e as fantasias de quem tem Netuno, aumentando tendências de fuga da realidade que já existam.",
    "Quem tem Plutão pode sondar as fraquezas de quem tem Netuno, forçando algum tipo de transformação.",
    "Quem tem Netuno pode reagir tornando-se mais esquivo e misterioso para desconcertar quem tem Plutão e levá-lo a abandonar atividades indesejadas."
   ],
   "tensoesPossiveis": [
    "Uma desconfiança profunda dos motivos uma da outra pode corroer as raízes de qualquer vínculo."
   ],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "Mexer com medos e fantasias trata de sentimento e sensibilidade."
    },
    {
     "categoria": "transformacao",
     "sustentadaPor": [
      "nucleos:1"
     ],
     "justificativa": "Sondar fraquezas e forçar transformação são mudança profunda."
    },
    {
     "categoria": "acao_desejo",
     "sustentadaPor": [
      "nucleos:2"
     ],
     "justificativa": "A reação esquiva para desconcertar a outra pessoa descreve uma disputa velada."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "tensoesPossiveis:0"
     ],
     "justificativa": "A desconfiança profunda dos motivos da outra pessoa abala a confiança íntima."
    }
   ],
   "origem": "agrupada_por_tema"
  },
  "especificos": [],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A leitura adversa também vale quando um dos corpos está debilitado no mapa natal; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro associa a conjunção Netuno/Plutão a uma geração específica, atenta ao clima de sua época; essa leitura geracional não entrou na glosa.",
   "O livro não separa por aspecto os efeitos de Plutão sobre Netuno; foram postos no adverso, onde aparecem ao lado da debilidade e do aspecto desfavorável."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Neptune/Pluto",
   "pdfPaginaInicio": 92,
   "pdfPaginaFim": 92,
   "hash": "37d3a4dc1ec6a19c"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo histórico (Segunda Guerra); tema geracional que não entra como dinâmica."
   },
   {
    "categoria": "diagnostico",
    "motivo": "rótulo clínico 'neurótico' e 'fobias'; ficam só medos, fantasias e fuga da realidade."
   },
   {
    "categoria": "genero",
    "motivo": "pronomes masculinos aplicados aos planetas; reescritos como quem tem cada planeta."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende de debilidade natal, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "leitura de mapa natal, fora da sinastria."
   }
  ]
 },
 {
  "id": "pluto-pluto",
  "corpos": [
   "pluto",
   "pluto"
  ],
  "simetria": "simetrico",
  "papeis": null,
  "favoravel": {
   "classeOriginal": "qualquer aspecto entre os dois Plutões, sem separar favorável e adverso",
   "aplicaA": [
    "conjunction",
    "opposition",
    "square",
    "trine",
    "sextile",
    "quincunx"
   ],
   "nucleos": [
    "O contato tende a operar sobretudo em áreas subliminares da consciência, onde podem surgir sentimentos compulsivos de atração ou repulsa."
   ],
   "tensoesPossiveis": [],
   "excessosPossiveis": [],
   "elaboracao": [],
   "dimensoes": [
    {
     "categoria": "emocional",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "Sentimentos compulsivos operando abaixo da consciência tratam de sentimento e instinto."
    },
    {
     "categoria": "afeto_intimidade",
     "sustentadaPor": [
      "nucleos:0"
     ],
     "justificativa": "Atração e repulsa entre as duas pessoas tratam de afeição e atração."
    }
   ],
   "origem": "leitura_geral"
  },
  "adverso": null,
  "especificos": [
   {
    "aspecto": "conjunction",
    "em": "ambos",
    "nucleos": [
     "Contemporâneos envolvidos em atividade de grupo podem descobrir identidade próxima em suas posições de Plutão."
    ],
    "tensoesPossiveis": []
   }
  ],
  "dependeDaCondicaoNatal": [
   {
    "de": "par",
    "nota": "Harmonia ou discórdia dependem de como cada Plutão é aspectado nos mapas natais, sobretudo nas casas ocupadas; essa condição não é calculada nesta versão."
   }
  ],
  "limitacoes": [
   "O livro não separa leitura favorável e adversa: por isso não há leitura adversa própria, e a classe original acima é neutra.",
   "Pelo ritmo de Plutão, só a conjunção, o sextil e talvez o quadrado ocorrem entre pessoas vivas; trígono e oposição só aparecem com ancestrais, salvo casos raros."
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "interaspecto",
   "secao": "Pluto/Pluto",
   "pdfPaginaInicio": 92,
   "pdfPaginaFim": 92,
   "hash": "07485db643902dd7"
  },
  "condicoesPorItem": {},
  "descartes": [
   {
    "categoria": "exemplo_historico",
    "motivo": "personagens históricos; não entra."
   },
   {
    "categoria": "tecnica_fora_do_mvp",
    "motivo": "técnica de ângulos, remetida a outro capítulo."
   },
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende de aspectos natais, que o motor não calcula; registrada como dependência."
   },
   {
    "categoria": "fora_do_escopo",
    "motivo": "aspectos com ancestrais, fora do escopo; registrado como limitação."
   },
   {
    "categoria": "genero",
    "motivo": "pronome masculino genérico; reescrito sem pronome."
   }
  ]
 }
]
