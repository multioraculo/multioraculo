/**
 * GERADO por scripts/montar-glosas-davison.ts. Não edite à mão: refaça as fatias e monte de novo.
 *
 * Paráfrase estruturada do Davison (Synastry, 1977). O trecho literal do livro NÃO está
 * aqui: cada glosa guarda página, título e hash do trecho de onde saiu, e o literal vive
 * só na auditoria interna, fora do repositório.
 */
import type { GlosaDeSemelhanca } from "./tipos"

export const SEMELHANCAS_DAVISON: GlosaDeSemelhanca[] = [
 {
  "id": "elemento:fire|fire",
  "dimensao": "elemento",
  "valor": "fire|fire",
  "aplicaA": {
   "tipos": [],
   "corpos": []
  },
  "simetria": "simetrico",
  "papeis": null,
  "nucleos": [
   "As duas pessoas podem ter vários fatores psicológicos em comum, e cada uma pode se ver refletida na outra.",
   "Com um objetivo comum, a união das duas pode render empreendimento criativo e ação muito eficaz.",
   "As duas podem se estimular uma à outra e se dar muito bem, como se diz de uma casa em chamas."
  ],
  "tensoesPossiveis": [
   "Pode haver choque de vontades se uma das duas não cede a liderança à outra.",
   "Se o entusiasmo de cada uma não tem a mesma direção, as duas podem puxar para lados diferentes.",
   "Um choque básico de temperamento pode resultar em explosões repentinas e destrutivas.",
   "Com disposição de sobra nas duas, podem se esgotar uma à outra.",
   "O orgulho ferido pode estar por trás de um rompimento."
  ],
  "ressalvas": [
   "O fogo depende mais que os outros elementos do apoio e do contraste: o ar o alimenta, a terra o contém e o conserva."
  ],
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "papel de gênero na liderança; não entra, só fica o choque de vontades."
   }
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Fire/Fire",
   "pdfPaginaInicio": 42,
   "pdfPaginaFim": 42,
   "hash": "82a3d83ac4393d21"
  },
  "nucleoOperacional": [
   {
    "texto": "Duas pessoas de fogo podem se estimular e agir com eficácia quando têm um objetivo comum.",
    "deRefs": [
     "nucleos[1]",
     "nucleos[2]"
    ]
   },
   {
    "texto": "Podem chocar vontades por liderança e esgotar-se uma à outra.",
    "deRefs": [
     "tensoesPossiveis[0]",
     "tensoesPossiveis[3]"
    ]
   }
  ]
 },
 {
  "id": "elemento:earth|fire",
  "dimensao": "elemento",
  "valor": "earth|fire",
  "aplicaA": {
   "tipos": [],
   "corpos": []
  },
  "simetria": "assimetrico",
  "papeis": {
   "fire": "Quem tem predominância de fogo quer começar logo, quer ver o projeto tomar forma rapidamente e pondera pouco as dúvidas sobre a viabilidade.",
   "earth": "Quem tem predominância de terra firma as bases e resolve o lado prático antes de começar, e pode frear o ímpeto do fogo."
  },
  "nucleos": [
   "A combinação é espírito trabalhando com matéria, e tudo depende de achar a mistura certa.",
   "Quem tem terra pode dar um freio prático ao ímpeto do fogo e impedir que o entusiasmo fuja do controle.",
   "Quem tem fogo pode apreciar a lealdade da terra quando a expressão emocional da terra se solta.",
   "Cada lado tem o que falta ao outro: o entusiasmo sem senso prático leva a ações temerárias, e a terra carece de visão e ousadia para sair da rotina."
  ],
  "tensoesPossiveis": [
   "O fogo pode achar a terra lenta e arrastada, e sentir-se sufocado pela terra.",
   "A terra pode criticar o fogo por saltar antes de olhar, e o fogo pode achar que a terra olha tanto que o salto chega tarde.",
   "O fogo pode se impacientar por não despertar o entusiasmo da terra, e ter o orgulho ferido quando seus planos são examinados quanto à viabilidade financeira.",
   "O conservadorismo da terra pode chocar o instinto pioneiro do fogo, que pode se ressentir de ter o próprio juízo posto em dúvida.",
   "A terra pode achar o fogo otimista demais, e o fogo pode achar que falta imaginação à terra.",
   "O ardor sexual do fogo pode ter dificuldade com a abordagem mais introvertida da terra."
  ],
  "ressalvas": [
   "A combinação harmoniosa de fogo e terra pode não ser fácil de alcançar.",
   "Terra demais pode sufocar o fogo."
  ],
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [
   {
    "categoria": "exemplo_historico",
    "motivo": "exemplo militar histórico; fora da camada operacional."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "qualificação de valor da ação do fogo; fica só o risco de ação sem freio."
   },
   {
    "categoria": "genero",
    "motivo": "pronome masculino aplicado ao elemento; reescrito sem pronome."
   }
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Fire/Earth",
   "pdfPaginaInicio": 43,
   "pdfPaginaFim": 43,
   "hash": "3724521d40a06d80"
  },
  "nucleoOperacional": [
   {
    "texto": "Fogo e terra: o ímpeto de um encontra o senso prático do outro, e cada um tem o que falta ao outro.",
    "deRefs": [
     "nucleos[1]",
     "nucleos[3]"
    ]
   },
   {
    "texto": "O fogo pode achar a terra lenta, a terra pode achar o fogo precipitado, e a harmonia pode não ser fácil.",
    "deRefs": [
     "tensoesPossiveis[0]",
     "tensoesPossiveis[1]",
     "ressalvas[0]"
    ]
   }
  ]
 },
 {
  "id": "elemento:air|fire",
  "dimensao": "elemento",
  "valor": "air|fire",
  "aplicaA": {
   "tipos": [],
   "corpos": []
  },
  "simetria": "assimetrico",
  "papeis": {
   "air": "Quem tem predominância de ar alimenta o entusiasmo do fogo com ideias.",
   "fire": "Quem tem predominância de fogo depende do ar para continuar ardendo, e uma brisa o aviva."
  },
  "nucleos": [
   "Há muita afinidade entre fogo e ar.",
   "O ar mantém o fogo aceso, e uma brisa pode atiçar as chamas e aumentar a atividade."
  ],
  "tensoesPossiveis": [
   "A parceria corre o risco de ficar volátil demais.",
   "Entusiasmo somado a idealismo pode levar a um modo de vida utópico, sem contato com a realidade.",
   "Pode faltar a abordagem prática, ou as duas pessoas podem ficar excitadas demais."
  ],
  "ressalvas": [],
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta a cada lado; o texto descreve, não prescreve."
   }
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Fire/Air",
   "pdfPaginaInicio": 43,
   "pdfPaginaFim": 43,
   "hash": "750fc81f5ccc1746"
  },
  "nucleoOperacional": [
   {
    "texto": "Fogo e ar têm muita afinidade: o ar mantém o fogo aceso.",
    "deRefs": [
     "nucleos[0]",
     "nucleos[1]"
    ]
   },
   {
    "texto": "A parceria pode ficar volátil demais e perder o contato com o prático.",
    "deRefs": [
     "tensoesPossiveis[0]",
     "tensoesPossiveis[1]",
     "tensoesPossiveis[2]"
    ]
   }
  ]
 },
 {
  "id": "elemento:fire|water",
  "dimensao": "elemento",
  "valor": "fire|water",
  "aplicaA": {
   "tipos": [],
   "corpos": []
  },
  "simetria": "assimetrico",
  "papeis": {
   "fire": "Quem tem predominância de fogo dirige as emoções para fora e descarrega a tensão em ação vigorosa.",
   "water": "Quem tem predominância de água deixa as emoções serem trabalhadas por muito tempo, sofre por dentro e remói quando ferida."
  },
  "nucleos": [
   "O fogo pode evaporar a água e a água pode extinguir o fogo.",
   "A tensão emocional acumulada na água pode romper de repente, como um rio represado, com grande estrago antes de se acalmar.",
   "Quem tem água se preocupa se um projeto soa certo e se pode gerar tensão emocional em alguém."
  ],
  "tensoesPossiveis": [
   "A confiança, o ímpeto e a coragem às vezes temerária do fogo podem intimidar a sensibilidade da água, que pode sentir falta de solidariedade e compreensão.",
   "Pode ser difícil achar um terreno comum, embora o Sol seja o principal significador do fogo e a Lua o da água.",
   "O impulso de agir de quem tem fogo pode ser barrado repetidas vezes pela timidez de quem tem água.",
   "Quem tem água pode questionar as certezas e a fé cega de quem tem fogo, que pode parecer sem sabedoria e sem consciência social.",
   "O amor ardente do fogo pode sobrepujar as delicadas suscetibilidades da água.",
   "O instinto de autopreservação da água, quando desenvolvido demais, pode impedir a iniciativa, o que frustra quem tem fogo."
  ],
  "ressalvas": [],
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [
   {
    "categoria": "prescricao",
    "motivo": "conselho de paciência e contenção; o texto descreve, não prescreve."
   },
   {
    "categoria": "genero",
    "motivo": "luminares como Homem e Esposa cósmicos; papel de gênero."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "qualificação de valor sobre a água; fica só o efeito sobre o impulso do fogo."
   }
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Fire/Water",
   "pdfPaginaInicio": 44,
   "pdfPaginaFim": 44,
   "hash": "b52545fd1e477083"
  },
  "nucleoOperacional": [
   {
    "texto": "O fogo dirige as emoções para fora e descarrega a tensão em ação; a água deixa as emoções trabalharem por muito tempo, e a tensão pode estourar de repente.",
    "deRefs": [
     "nucleos[1]",
     "papeis.fire",
     "papeis.water"
    ]
   },
   {
    "texto": "A coragem do fogo pode intimidar a sensibilidade da água, e a timidez da água pode barrar o impulso do fogo.",
    "deRefs": [
     "tensoesPossiveis[0]",
     "tensoesPossiveis[2]"
    ]
   }
  ]
 },
 {
  "id": "elemento:earth|earth",
  "dimensao": "elemento",
  "valor": "earth|earth",
  "aplicaA": {
   "tipos": [],
   "corpos": []
  },
  "simetria": "simetrico",
  "papeis": null,
  "nucleos": [
   "Pode haver respeito mútuo pela abordagem prática e pelo senso comum de cada uma.",
   "As qualidades sólidas e confiáveis das duas favorecem a construção gradual de uma relação firme.",
   "O interesse pelos aspectos físicos da intimidade pode dar base de satisfação mútua nas fases iniciais."
  ],
  "tensoesPossiveis": [
   "A relação pode ser pouco aventureira, sem a faísca da inspiração e o elemento de novidade.",
   "Se sentirem falta de mais emoção e de escapar da rotina monótona, as duas podem se inclinar a buscar satisfação fora.",
   "Pode haver tendência de uma tomar a outra por dada, como algo líquido e certo.",
   "Os interesses inspiradores e estéticos podem ser sacrificados à busca de uma ambição, ou esquecidos na luta pela sobrevivência."
  ],
  "ressalvas": [
   "A relação pode ser pouco aventureira, a menos que choques entre planetas dos dois mapas tragam alguma agitação."
  ],
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [
   {
    "categoria": "papel_social",
    "motivo": "enquadra a relação como casamento; reescrito como intimidade."
   }
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Earth/Earth",
   "pdfPaginaInicio": 44,
   "pdfPaginaFim": 44,
   "hash": "b8386b7eac4fb82c"
  },
  "nucleoOperacional": [
   {
    "texto": "Duas pessoas de terra podem respeitar o senso prático uma da outra e construir aos poucos uma relação firme.",
    "deRefs": [
     "nucleos[0]",
     "nucleos[1]"
    ]
   },
   {
    "texto": "A relação pode ficar pouco aventureira, e uma pode tomar a outra por dada.",
    "deRefs": [
     "tensoesPossiveis[0]",
     "tensoesPossiveis[2]",
     "ressalvas[0]"
    ]
   }
  ]
 },
 {
  "id": "elemento:air|earth",
  "dimensao": "elemento",
  "valor": "air|earth",
  "aplicaA": {
   "tipos": [],
   "corpos": []
  },
  "simetria": "assimetrico",
  "papeis": {
   "air": "Quem tem predominância de ar atua no plano intelectual, com teorias, idealismo e voos de fantasia.",
   "earth": "Quem tem predominância de terra se concentra em metas materiais e mantém os pés no chão."
  },
  "nucleos": [
   "Na combinação de terra e ar, há um equilíbrio a ser encontrado entre prática e teoria.",
   "O ar tende a ressecar a terra e formar poeira, mas a terra só mantém a vida orgânica florescendo quando é arejada."
  ],
  "tensoesPossiveis": [
   "Quem tem terra pode não apreciar a abordagem intelectual e os voos de fantasia do ar, e o ar pode não gostar do método lento e conservador da terra.",
   "O ar pode se frustrar com a reação lenta da terra e com o ceticismo diante de seus voos mais extravagantes.",
   "A terra pode achar o ar levado com facilidade demais por belas teorias e idealismo que talvez não se realizem.",
   "A terra pode ter pouca paciência com as formalidades sociais e a preocupação do ar com etiqueta, que pode parecer pouco sincera.",
   "O ar pode não apreciar o foco da terra no lado físico do sexo, e a terra pode não entender o aparente distanciamento do ar.",
   "A terra pode sentir uma espécie de deslealdade nos voos românticos de imaginação do ar."
  ],
  "ressalvas": [
   "Uma parceria útil e valiosa pode resultar se o ar aceita ser trazido à terra com regularidade e se a terra admite que a vida não se resume ao plano material."
  ],
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [
   {
    "categoria": "juizo_moral",
    "motivo": "qualificação de valor sobre a terra; ficam os atritos de ritmo e método."
   }
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Earth/Air",
   "pdfPaginaInicio": 44,
   "pdfPaginaFim": 45,
   "hash": "b47583e274e910e0"
  },
  "nucleoOperacional": [
   {
    "texto": "Ar e terra pedem equilíbrio entre teoria e prática.",
    "deRefs": [
     "nucleos[0]"
    ]
   },
   {
    "texto": "O ar pode se frustrar com a lentidão da terra, e a terra pode achar o ar levado por teorias que talvez não se realizem.",
    "deRefs": [
     "tensoesPossiveis[1]",
     "tensoesPossiveis[2]"
    ]
   }
  ]
 },
 {
  "id": "elemento:earth|water",
  "dimensao": "elemento",
  "valor": "earth|water",
  "aplicaA": {
   "tipos": [],
   "corpos": []
  },
  "simetria": "assimetrico",
  "papeis": {
   "earth": "Quem tem predominância de terra insiste em resultados práticos e pode ter dificuldade em entender uma pessoa emocionalmente sensível.",
   "water": "Quem tem predominância de água é emocionalmente sensível e pode oferecer sentimentalidade demais."
  },
  "nucleos": [
   "Terra e água reagem mais do que tomam a iniciativa, mesmo em seus signos cardinais.",
   "O lado físico e sensual da relação sexual é muito importante para as duas pessoas.",
   "A terra contém e limita rios e oceanos, e a irrigação controlada torna cultiváveis as terras áridas."
  ],
  "tensoesPossiveis": [
   "A parceria pode sofrer de falta de motivação e talvez dependa de algum incentivo vital para agir.",
   "Cada uma pode ter dificuldade com as oscilações de humor ocasionais da outra.",
   "A impassibilidade de quem tem terra pode dificultar entender quem é emocionalmente sensível.",
   "Quem tem água pode não aceitar a insistência da terra em resultados práticos quando isso implica ignorar as reações emocionais dos outros.",
   "O muito sentimento da água pode encontrar pouca resposta da terra, mais prosaica, e a terra pode ofender a delicadeza da água."
  ],
  "ressalvas": [
   "Uma parceria harmoniosa pode resultar se a terra se esforça para entender os humores da água e se a água admite que sentimentos alheios às vezes são sacrificados ao progresso."
  ],
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [
   {
    "categoria": "prescricao",
    "motivo": "conselho geral de cooperar; o texto descreve, não prescreve."
   }
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Earth/Water",
   "pdfPaginaInicio": 45,
   "pdfPaginaFim": 45,
   "hash": "e66c06e548408fe0"
  },
  "nucleoOperacional": [
   {
    "texto": "Terra e água tendem a reagir mais do que a tomar a iniciativa, e o lado físico da relação importa muito para as duas.",
    "deRefs": [
     "nucleos[0]",
     "nucleos[1]"
    ]
   },
   {
    "texto": "Pode faltar motivação, e a terra pode ter dificuldade com os humores e a sensibilidade da água.",
    "deRefs": [
     "tensoesPossiveis[0]",
     "tensoesPossiveis[1]",
     "tensoesPossiveis[2]"
    ]
   }
  ]
 },
 {
  "id": "elemento:air|air",
  "dimensao": "elemento",
  "valor": "air|air",
  "aplicaA": {
   "tipos": [],
   "corpos": []
  },
  "simetria": "simetrico",
  "papeis": null,
  "nucleos": [
   "A união pode ser descrita como um encontro de mentes.",
   "As duas pessoas tendem a trabalhar juntas com mais proveito em base intelectual.",
   "Provavelmente não há dificuldade para se comunicar e trocar ideias sobre vários assuntos.",
   "As duas podem ter forte gosto pela vida social."
  ],
  "tensoesPossiveis": [
   "As duas podem gastar mais tempo debatendo prós e contras do que pondo os planos em ação.",
   "Há risco de se envolverem demais em questões abstratas e teóricas e dedicarem pouco tempo e esforço às questões práticas e próximas.",
   "Se os compromissos sociais não coincidem, pode haver pouco convívio entre as duas, e a vida doméstica pode ficar negligenciada.",
   "A inquietação de cada uma pode apenas aumentar a excitabilidade nervosa da outra."
  ],
  "ressalvas": [
   "Muito depende da interação dos dois Mercúrios: em configuração harmoniosa, o prazer intelectual de cada uma na companhia da outra pode ser muito gratificante.",
   "É uma parceria que tende a carecer de algum lastro."
  ],
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Air/Air",
   "pdfPaginaInicio": 45,
   "pdfPaginaFim": 46,
   "hash": "b830bb4e4081e373"
  },
  "nucleoOperacional": [
   {
    "texto": "Duas pessoas de ar se encontram na mente: comunicam-se sem dificuldade e gostam da vida social.",
    "deRefs": [
     "nucleos[0]",
     "nucleos[2]",
     "nucleos[3]"
    ]
   },
   {
    "texto": "Podem debater mais do que agir, perder-se no abstrato e alimentar a inquietação uma da outra.",
    "deRefs": [
     "tensoesPossiveis[0]",
     "tensoesPossiveis[1]",
     "tensoesPossiveis[3]"
    ]
   }
  ]
 },
 {
  "id": "elemento:air|water",
  "dimensao": "elemento",
  "valor": "air|water",
  "aplicaA": {
   "tipos": [],
   "corpos": []
  },
  "simetria": "assimetrico",
  "papeis": {
   "air": "Quem tem predominância de ar tem intelecto distante, prefere atitude imparcial ou razões lógicas e tende a viver o momento.",
   "water": "Quem tem predominância de água tem simpatias prontas, aceita as pessoas como são e tem forte interesse pelo passado."
  },
  "nucleos": [
   "A parceria é entre intelecto e emoção.",
   "Quem tem água tende a aceitar as pessoas como são, e quem tem ar adota abordagem mais crítica e quer descobrir o que as motiva.",
   "Grande parte do comportamento da água vem de um vivo interesse pelo passado, enquanto o ar tende a viver o momento.",
   "O ar, que raramente atenta às reações emocionais alheias, pode ignorar o motivo da preocupação da água, que sabe pela experiência passada que certas circunstâncias trazem certas reações."
  ],
  "tensoesPossiveis": [
   "O intelecto distante do ar pode achar que as simpatias da água nem sempre são sensatamente dirigidas.",
   "A aparente capacidade do ar de se isolar das questões emocionais pode parecer rasa ou insensível à água.",
   "A água tende a transformar a experiência emocional passada ou presente em preconceito, difícil de entender ou aceitar para o ar.",
   "A água pode ter medos estranhos e sem explicação, dos quais o ar tende a rir ou zombar por não terem fundamento racional.",
   "Ao estourar a superstição da água com lógica fria, o ar pode ignorar que a superstição encobria um medo meio escondido, e a água pode trocá-la por outra superstição.",
   "Se o ar critica a água com dureza demais, em vez de só humor sombrio ou silêncio emburrado pode resultar uma tempestade emocional."
  ],
  "ressalvas": [
   "Um aspecto harmonioso entre o Mercúrio do ar e a Lua da água pode ajudar muito a mistura dos dois elementos.",
   "O intelecto separado da emoção pode resultar em atitude insensível com os outros."
  ],
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [
   {
    "categoria": "diagnostico",
    "motivo": "rótulo clínico; ficam os medos sem fundamento racional."
   },
   {
    "categoria": "juizo_moral",
    "motivo": "julgamento de valor sobre a emoção; não entra."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho a cada lado; o texto descreve, não prescreve."
   }
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Air/Water",
   "pdfPaginaInicio": 46,
   "pdfPaginaFim": 46,
   "hash": "eaa3fd9d0f32667c"
  },
  "nucleoOperacional": [
   {
    "texto": "Ar e água unem intelecto e emoção: o ar tende a viver o momento, e a água, o passado.",
    "deRefs": [
     "nucleos[0]",
     "nucleos[2]"
    ]
   },
   {
    "texto": "O distanciamento do ar pode parecer insensível à água, e o ar pode zombar de medos da água que lhe parecem sem fundamento.",
    "deRefs": [
     "tensoesPossiveis[1]",
     "tensoesPossiveis[3]"
    ]
   }
  ]
 },
 {
  "id": "elemento:water|water",
  "dimensao": "elemento",
  "valor": "water|water",
  "aplicaA": {
   "tipos": [],
   "corpos": []
  },
  "simetria": "simetrico",
  "papeis": null,
  "nucleos": [
   "A parceria é muito emocional.",
   "As duas tendem a ser muito intuitivas, e cada uma pode saber por instinto como atender às necessidades da outra e antecipar suas reações.",
   "Cada uma pode tender a se agarrar à outra, numa associação de proteção mútua.",
   "Pode ser uma combinação muito caseira e doméstica.",
   "Pode haver momentos em que uma das duas tem necessidade de tranquilização."
  ],
  "tensoesPossiveis": [
   "A forte ênfase na água pode produzir personalidade retraída e muito sensível, com mudanças de humor que a outra não tem iniciativa firme para dissipar.",
   "Medos específicos de uma pessoa podem ser reforçados pela outra por simpatia mal dirigida, em vez de desencorajar a autoindulgência.",
   "Se cada uma não leva em conta os humores da outra, pode surgir ressentimento mútuo."
  ],
  "ressalvas": [],
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [
   {
    "categoria": "diagnostico",
    "motivo": "rótulo clínico; ficam os medos específicos."
   },
   {
    "categoria": "prescricao",
    "motivo": "conselho de conduta a quem acolhe; não entra."
   }
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Water/Water",
   "pdfPaginaInicio": 46,
   "pdfPaginaFim": 47,
   "hash": "876880569ae81830"
  },
  "nucleoOperacional": [
   {
    "texto": "Duas pessoas de água formam uma parceria muito emocional e intuitiva, que pode se agarrar à proteção mútua e ser muito caseira.",
    "deRefs": [
     "nucleos[0]",
     "nucleos[1]",
     "nucleos[2]",
     "nucleos[3]"
    ]
   },
   {
    "texto": "O humor retraído de uma pode não ser dissipado pela outra, e pode surgir ressentimento se os humores não forem levados em conta.",
    "deRefs": [
     "tensoesPossiveis[0]",
     "tensoesPossiveis[2]"
    ]
   }
  ]
 },
 {
  "id": "modo:cardinal|cardinal",
  "dimensao": "modo",
  "valor": "cardinal|cardinal",
  "aplicaA": {
   "tipos": [],
   "corpos": []
  },
  "simetria": "simetrico",
  "papeis": null,
  "nucleos": [
   "Pode funcionar bem em base de ação total, se as duas concordam de antemão quais são os objetivos e se as ambições se realizam de modo mais eficaz em ação conjunta.",
   "Pessoas cardinais pedem espaço para tocar os próprios empreendimentos e manter uma medida de independência, que significa muito para essas pessoas.",
   "É a mais dinâmica das combinações."
  ],
  "tensoesPossiveis": [
   "A natureza competitiva de uma pode se chocar com a da outra.",
   "Com fortes tensões entre os planetas dos dois mapas, as duas podem ficar em desencontro de propósitos.",
   "Qualquer afirmação excessiva de independência ou tentativa de forçar a questão pode prejudicar a associação, pois a pessoa cardinal não gosta de ser contrariada."
  ],
  "ressalvas": [
   "Com bastante harmonia entre os planetas dos dois mapas, pode haver muita admiração mútua, cada uma apreciando as realizações da outra."
  ],
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [
   {
    "categoria": "prescricao",
    "motivo": "conselho de dividir esferas de ação; não entra."
   }
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Cardinal/Cardinal",
   "pdfPaginaInicio": 48,
   "pdfPaginaFim": 48,
   "hash": "f1f083447749ce2b"
  },
  "nucleoOperacional": [
   {
    "texto": "Dois cardinais formam a combinação mais dinâmica e pedem espaço para os próprios empreendimentos.",
    "deRefs": [
     "nucleos[1]",
     "nucleos[2]"
    ]
   },
   {
    "texto": "A competitividade de um pode se chocar com a do outro, sobretudo sob tensões entre os mapas.",
    "deRefs": [
     "tensoesPossiveis[0]",
     "tensoesPossiveis[1]"
    ]
   }
  ]
 },
 {
  "id": "modo:cardinal|fixed",
  "dimensao": "modo",
  "valor": "cardinal|fixed",
  "aplicaA": {
   "tipos": [],
   "corpos": []
  },
  "simetria": "assimetrico",
  "papeis": {
   "cardinal": "Quem tem predominância de cardinal pode dar a iniciativa.",
   "fixed": "Quem tem predominância de fixo pode dar a força motriz para consolidar a posição ganha pelo empreendimento do cardinal."
  },
  "nucleos": [
   "A combinação pode representar a força irresistível em contato com o objeto imóvel.",
   "Com o mesmo elemento predominante nos dois mapas, ou com fogo e ar juntos, ou terra e água juntos, os talentos se combinam com mais eficácia e menos atrito."
  ],
  "tensoesPossiveis": [
   "Quem tem fixo pode achar a pessoa de cardinal precipitada e descuidada demais.",
   "Quem tem cardinal pode achar a pessoa de fixo preguiçosa, pouco empreendedora e apegada demais à posição e aos recursos."
  ],
  "ressalvas": [
   "Muito depende de como a qualidade mutável está representada nos dois mapas, pois costuma ser exigida dose considerável de adaptabilidade dos dois lados.",
   "Os atritos descritos valem quando falta afinidade básica entre as duas pessoas."
  ],
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Cardinal/Fixed",
   "pdfPaginaInicio": 48,
   "pdfPaginaFim": 48,
   "hash": "30e8fa291c972e33"
  },
  "nucleoOperacional": [
   {
    "texto": "Cardinal e fixo: força irresistível junto a objeto imóvel, com a iniciativa de um e a força motriz do outro.",
    "deRefs": [
     "nucleos[0]",
     "papeis.cardinal",
     "papeis.fixed"
    ]
   },
   {
    "texto": "Os atritos aparecem quando falta afinidade básica: o fixo vê o cardinal como precipitado, e o cardinal vê o fixo como pouco empreendedor e apegado à posição.",
    "deRefs": [
     "tensoesPossiveis[0]",
     "tensoesPossiveis[1]",
     "ressalvas[1]"
    ]
   }
  ]
 },
 {
  "id": "modo:cardinal|mutable",
  "dimensao": "modo",
  "valor": "cardinal|mutable",
  "aplicaA": {
   "tipos": [],
   "corpos": []
  },
  "simetria": "assimetrico",
  "papeis": {
   "cardinal": "Quem tem predominância de cardinal é a pessoa mais ativa da dupla.",
   "mutable": "Quem tem predominância de mutável se dispõe a se adaptar à pessoa mais ativa."
  },
  "nucleos": [
   "Quem tem mutável se dispõe a se adaptar à pessoa mais ativa."
  ],
  "tensoesPossiveis": [
   "A parceria pode ficar muito ativa e sem qualquer tipo de âncora."
  ],
  "ressalvas": [
   "Funciona com mais êxito quando as duas têm maioria de planetas no mesmo elemento, ou quando a combinação reúne fogo e ar."
  ],
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Cardinal/Mutable",
   "pdfPaginaInicio": 49,
   "pdfPaginaFim": 49,
   "hash": "2c46db943687c109"
  },
  "nucleoOperacional": [
   {
    "texto": "Quem tem mutável tende a se adaptar à pessoa mais ativa.",
    "deRefs": [
     "nucleos[0]"
    ]
   },
   {
    "texto": "A parceria pode ficar muito ativa e sem âncora.",
    "deRefs": [
     "tensoesPossiveis[0]"
    ]
   }
  ]
 },
 {
  "id": "modo:fixed|fixed",
  "dimensao": "modo",
  "valor": "fixed|fixed",
  "aplicaA": {
   "tipos": [],
   "corpos": []
  },
  "simetria": "simetrico",
  "papeis": null,
  "nucleos": [
   "Os signos fixos tendem a ser conservadores e resistentes à mudança.",
   "Em seu ponto alto, as duas combinam bem em atividades que pedem perseverança, fidelidade e firmeza de propósito.",
   "Nenhuma das duas quer ser dominada pela outra."
  ],
  "tensoesPossiveis": [
   "Pode faltar flexibilidade para se adaptar a circunstâncias em mudança.",
   "Com muitas tensões planetárias entre os mapas, as diferenças podem se agravar porque nenhuma cede à outra, com o orgulho envolvido.",
   "Uma pequena divergência pode virar grande desentendimento por teimosia e inflexibilidade mútuas.",
   "Pode haver intolerância e ciúme, e uma batalha de vontades."
  ],
  "ressalvas": [
   "Muito depende da atitude emocional básica das duas pessoas.",
   "Com relações planetárias predominantemente harmoniosas entre os mapas, é uma combinação muito favorável a um empreendimento conjunto duradouro.",
   "A associação exige acentuada harmonia planetária entre os mapas para ter êxito."
  ],
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [
   {
    "categoria": "papel_social",
    "motivo": "enquadra a relação como casamento duradouro; reescrito como empreendimento duradouro."
   }
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Fixed/Fixed",
   "pdfPaginaInicio": 49,
   "pdfPaginaFim": 49,
   "hash": "a99d7cf40ae82632"
  },
  "nucleoOperacional": [
   {
    "texto": "Dois fixos tendem a ser conservadores, firmes e perseverantes, e nenhum quer ser dominado.",
    "deRefs": [
     "nucleos[0]",
     "nucleos[1]",
     "nucleos[2]"
    ]
   },
   {
    "texto": "Falta flexibilidade, e uma pequena divergência pode virar grande desentendimento por teimosia mútua.",
    "deRefs": [
     "tensoesPossiveis[0]",
     "tensoesPossiveis[2]"
    ]
   }
  ]
 },
 {
  "id": "modo:fixed|mutable",
  "dimensao": "modo",
  "valor": "fixed|mutable",
  "aplicaA": {
   "tipos": [],
   "corpos": []
  },
  "simetria": "assimetrico",
  "papeis": {
   "fixed": "Quem tem predominância de fixo tende a ter força de caráter e às vezes gosta de exercer o papel principal.",
   "mutable": "Quem tem predominância de mutável quer variedade e mudança, cultiva afinidade mental e tende a ser dependente."
  },
  "nucleos": [
   "Quem tem mutável pode desenvolver grande admiração pela força de caráter da outra pessoa.",
   "Quem tem mutável tende a ser dependente e a sentir necessidade de uma pessoa mais forte para ter êxito pessoal.",
   "Quem tem fixo às vezes gosta de exercer o papel principal."
  ],
  "tensoesPossiveis": [
   "Quem tem mutável pode se sentir infeliz se não aceita um papel passivo, pois quem tem fixo pode não satisfazer seu apetite de variedade e mudança nem a afinidade mental que busca.",
   "Quem tem fixo pode não se impressionar com a versatilidade de quem tem mutável e achá-la volúvel e pouco confiável.",
   "Quem tem mutável pode achar quem tem fixo estólido, autocrático e inflexível."
  ],
  "ressalvas": [
   "Com o mesmo elemento predominante nos dois mapas, a parceria tem mais chance de êxito.",
   "As tensões dependem de haver razoável harmonia entre os mapas e de cada uma reconhecer qualidades importantes que faltam à outra."
  ],
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [
   {
    "categoria": "genero",
    "motivo": "pronome masculino; reescrito como 'quem tem fixo'."
   }
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Fixed/Mutable",
   "pdfPaginaInicio": 49,
   "pdfPaginaFim": 49,
   "hash": "c477b04586bd3583"
  },
  "nucleoOperacional": [
   {
    "texto": "Quem tem mutável pode admirar a força de caráter do fixo e depender de uma pessoa mais forte, e o fixo às vezes gosta do papel principal.",
    "deRefs": [
     "nucleos[0]",
     "nucleos[1]",
     "nucleos[2]"
    ]
   },
   {
    "texto": "O mutável pode achar o fixo inflexível, e o fixo pode achar o mutável volúvel.",
    "deRefs": [
     "tensoesPossiveis[1]",
     "tensoesPossiveis[2]"
    ]
   }
  ]
 },
 {
  "id": "modo:mutable|mutable",
  "dimensao": "modo",
  "valor": "mutable|mutable",
  "aplicaA": {
   "tipos": [],
   "corpos": []
  },
  "simetria": "simetrico",
  "papeis": null,
  "nucleos": [
   "Tende a florescer com mais força no plano mental.",
   "As duas tendem a ser muito adaptáveis.",
   "Costuma florescer pelo desenvolvimento de interesses mentais compartilhados e pela capacidade mútua de se comunicar livremente."
  ],
  "tensoesPossiveis": [
   "A combinação tende a ficar sem âncora e a agir sem profundidade suficiente em situações que exigem compromisso total.",
   "O objetivo comum pode ficar indeterminado demais, com a inquietação de uma alimentando a da outra.",
   "Quando falta terra, as duas podem sentir aversão a lidar com questões práticas e se animar em fantasias que levam a escapismo acentuado."
  ],
  "ressalvas": [
   "Com a maioria dos aspectos cruzados entre os mapas favoráveis, pode haver alto grau de afinidade mental.",
   "A menos que Saturno seja forte nos dois mapas e esteja em configuração harmoniosa com a maioria dos planetas da outra pessoa, a parceria pode carecer de estabilidade."
  ],
  "especificos": [],
  "dependeDaCondicaoNatal": [
   {
    "de": "ambos",
    "nota": "A estabilidade depende de Saturno ser forte nos dois mapas natais; essa condição não é calculada nesta versão."
   }
  ],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [
   {
    "categoria": "condicao_natal_nao_modelada",
    "motivo": "depende da força natal de Saturno nos dois mapas, que o motor não calcula; registrada como dependência."
   }
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Mutable/Mutable",
   "pdfPaginaInicio": 49,
   "pdfPaginaFim": 50,
   "hash": "432d5de3eab46abc"
  },
  "nucleoOperacional": [
   {
    "texto": "Dois mutáveis tendem a ser muito adaptáveis e a florescer em interesses mentais compartilhados e comunicação livre.",
    "deRefs": [
     "nucleos[0]",
     "nucleos[1]",
     "nucleos[2]"
    ]
   },
   {
    "texto": "A combinação pode ficar sem âncora, com objetivo comum indeterminado e inquietação alimentada pelas duas.",
    "deRefs": [
     "tensoesPossiveis[0]",
     "tensoesPossiveis[1]"
    ]
   }
  ]
 },
 {
  "id": "signo_do_corpo",
  "dimensao": "signo_do_corpo",
  "valor": "signo_do_corpo",
  "aplicaA": {
   "tipos": [],
   "corpos": [
    "sun",
    "moon",
    "mercury",
    "venus",
    "mars"
   ]
  },
  "simetria": "simetrico",
  "papeis": null,
  "nucleos": [
   "Os planetas mais rápidos tratam de fatores mais pessoais."
  ],
  "tensoesPossiveis": [
   "Quando os planetas mais rápidos ocupam o mesmo signo, tendem a surgir dificuldades."
  ],
  "ressalvas": [],
  "especificos": [
   {
    "corpos": [
     "moon"
    ],
    "nucleos": [
     "A mesma posição da Lua aparece com frequência quando se comparam os mapas de pares que o livro descreve como harmoniosos."
    ],
    "ressalvas": [
     "É observação estatística do livro, sem fonte verificável nesta versão."
    ]
   }
  ],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [
   "O livro nomeia a Lua e os planetas rápidos; Júpiter e Saturno não são nomeados.",
   "Urano, Netuno e Plutão são a geração e ficam fora desta leitura."
  ],
  "descartes": [
   {
    "categoria": "fora_do_escopo",
    "motivo": "Urano, Netuno e Plutão como condicionantes da geração; o seletor já os exclui."
   }
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Same-sign positions (p. 30)",
   "pdfPaginaInicio": 30,
   "pdfPaginaFim": 30,
   "hash": "b384cf4fd7a62d0a"
  },
  "nucleoOperacional": [
   {
    "texto": "Planetas rápidos no mesmo signo tratam de fatores pessoais, e podem trazer dificuldades.",
    "deRefs": [
     "nucleos[0]",
     "tensoesPossiveis[0]"
    ]
   }
  ],
  "nucleoOperacionalEspecifico": [
   {
    "corpos": [
     "moon"
    ],
    "texto": "Para a Lua, o livro registra, como observação estatística não verificada, que a mesma posição lunar é frequente em pares que o livro descreve como harmoniosos.",
    "deRefs": [
     "especificos[0].nucleos[0]",
     "especificos[0].ressalvas[0]"
    ]
   }
  ]
 },
 {
  "id": "elemento_do_sol",
  "dimensao": "elemento_do_sol",
  "valor": "elemento_do_sol",
  "aplicaA": {
   "tipos": [
    "igual"
   ],
   "corpos": []
  },
  "simetria": "simetrico",
  "papeis": null,
  "nucleos": [
   "Cada elemento tende a entender por instinto como lidar com os seus iguais.",
   "O Sol representa a natureza real e essencial de uma pessoa."
  ],
  "tensoesPossiveis": [],
  "ressalvas": [
   "Há muitas situações em que a afinidade teórica entre Sóis no mesmo elemento pode ser descontada.",
   "O lugar dos dois Sóis pode ter papel pequeno na avaliação total, e dar ênfase demais a esse fator pode enganar muito.",
   "Se um Sol está no fim de Áries e o outro no começo de Leão, tecnicamente estão em quadratura, o que pode indicar dificuldade de adaptação.",
   "Se os mapas têm maioria de planetas em elementos diferentes, como ar e água, uma comparação mais verdadeira é o contraste entre esses elementos.",
   "Se há choques planetários entre os dois mapas, essas desarmonias podem pesar muito mais do que a concórdia sugerida pelos Sóis."
  ],
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [
   {
    "categoria": "fora_do_escopo",
    "motivo": "popularização da compatibilidade por signo solar; o livro a relativiza e a camada só guarda as ressalvas."
   }
  ],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Sun sign and element (p. 39)",
   "pdfPaginaInicio": 39,
   "pdfPaginaFim": 39,
   "hash": "362b06e4e96c726c"
  },
  "nucleoOperacional": [
   {
    "texto": "Sóis no mesmo elemento têm afinidade teórica: cada elemento tende a entender por instinto como lidar com os seus.",
    "deRefs": [
     "nucleos[0]",
     "ressalvas[0]"
    ]
   },
   {
    "texto": "O lugar dos Sóis pode ter papel pequeno na avaliação total, e choques entre planetas dos dois mapas podem pesar mais do que a concórdia dos Sóis.",
    "deRefs": [
     "ressalvas[1]",
     "ressalvas[4]"
    ]
   }
  ]
 },
 {
  "id": "semelhanca_geral",
  "dimensao": "semelhanca_geral",
  "valor": "semelhanca_geral",
  "aplicaA": {
   "tipos": [],
   "corpos": []
  },
  "simetria": "simetrico",
  "papeis": null,
  "nucleos": [],
  "tensoesPossiveis": [],
  "ressalvas": [
   "Semelhança grande demais entre os mapas pode fazer com que o caráter de cada pessoa não complemente o da outra, e a competição pode substituir a cooperação.",
   "Ênfase demais no mesmo elemento pode atrair no começo e levar a tédio ou monotonia na relação.",
   "O contraste de temperamentos costuma dar sabor à relação, desde que haja grau razoável de entendimento e que o contraste não seja tão completo que nenhuma das partes consiga se adaptar."
  ],
  "especificos": [],
  "dependeDaCondicaoNatal": [],
  "condicoesPorItem": {},
  "limitacoes": [],
  "descartes": [],
  "fonte": {
   "livro": "davison-synastry",
   "edicao": "1977; edição não identificada no arquivo",
   "natureza": "semelhanca",
   "secao": "Too great a similarity (p. 30, 39)",
   "pdfPaginaInicio": 30,
   "pdfPaginaFim": 39,
   "hash": "bdc98c774f4a97e5"
  },
  "nucleoOperacional": [],
  "ressalvaOperacional": {
   "texto": "Semelhança grande demais pode deixar um mapa sem complementar o outro, e a competição pode substituir a cooperação; é o contraste que costuma dar sabor à relação.",
   "deRefs": [
    "ressalvas[0]",
    "ressalvas[1]",
    "ressalvas[2]"
   ]
  }
 }
]
