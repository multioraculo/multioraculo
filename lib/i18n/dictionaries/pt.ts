/**
 * Dicionário em português (idioma padrão). É a fonte do tipo Dictionary:
 * todo outro idioma precisa ter exatamente estas chaves.
 */
export const pt = {
  meta: {
    title: "Multioráculo - Síntese Multioráculo",
    description:
      "A mesma pergunta, vista por vários ângulos. Tarô, I Ching, Runas, Búzios e Cartas Lenormand.",
  },

  common: {
    appName: "Multioráculo",
    login: "Login",
    logout: "Sair",
    save: "Salvar",
    saved: "Salvo",
    saving: "Salvando…",
    cancel: "Cancelar",
    delete: "Excluir",
    close: "Fechar",
    edit: "Editar",
    collapse: "Recolher",
    options: "Opções",
    share: "Encaminhar",
    copied: "Copiado para a área de transferência.",
    loginRequired: "Faça login para continuar.",
  },

  oracles: {
    tarot: "Tarô",
    iching: "I Ching",
    runas: "Runas",
    buzios: "Búzios",
    lenormand: "Lenormand",
  },

  nav: {
    home: "Multioráculo",
    dreams: "Diário de Sonhos",
    dreamsShort: "Sonhos",
    grimoire: "Grimório",
    subscription: "Assinatura",
    savedReadings: "Leituras Salvas",
    oracles: "Oráculos",
    faq: "FAQ",
    savedDreams: "Sonhos Salvos",
  },

  header: {
    backToStart: "Voltar ao início",
    circularText: "oráculo • síntese multi-oráculo • tarô • i ching • runas • búzios • lenormand • ",
    sessionEnded: "Sessão encerrada.",
  },

  locale: {
    label: "Idioma",
  },

  login: {
    title: "Entre para salvar suas leituras",
    subtitle: "Sem login você pode consultar normalmente, mas não terá histórico.",
    namePlaceholder: "Seu nome",
    emailPlaceholder: "seu@email.com",
    passwordPlaceholder: "Sua senha",
    signIn: "Entrar",
    signingIn: "Entrando...",
    createAccount: "Criar conta",
    creating: "Criando...",
    haveAccount: "Já tenho conta",
    continueWithout: "Continuar sem login",
    success: "Login feito com sucesso.",
    accountCreated: "Conta criada. Verifique seu email para confirmar o cadastro antes de entrar.",
  },

  hero: {
    badge: "Síntese Multioráculo",
    titleEmphasis: "A singularidade",
    titleRest: "te trouxe",
    titleLine2: "até aqui.",
    subtitle:
      "A mesma pergunta, vista por vários ângulos. Tarô, I Ching, Runas, Búzios e Cartas Lenormand. Cada oráculo revela uma parte do mapa. Juntos, eles mostram o caminho inteiro.",
    prompt: "Está pronta para começar? Escreva sua pergunta.",
    placeholders: [
      "Onde estou confundindo desejo com destino?",
      "O que a vida já colocou diante de mim que ainda não vi?",
      "Qual parte de mim precisa morrer para que algo maior possa nascer?",
      "Se eu não fosse guiado pelo medo, qual seria o meu gesto agora?",
      "O que é verdadeiro aqui e o que é apenas ruído da mente?",
      "Qual é a lição que o tempo já está tentando me ensinar, mas eu insisto em ignorar?",
      "Que corrente invisível está movendo meu destino neste instante?",
      "Onde estou tentando controlar, quando deveria apenas permitir?",
      "Qual é o fio mais fino, porém mais forte, que pode me guiar neste momento?",
      "O que estou chamando de obstáculo, mas que na verdade é uma iniciação?",
      "Que oportunidade já está madura, mas espera apenas a minha coragem?",
      "O que realmente significa prosperidade para mim agora?",
      "Se a vida me desse apenas um gesto hoje, qual seria o gesto correto?",
    ],
    submit: "Receber minha resposta",
    freeHint: "Sua primeira tiragem é gratuita e não precisa de cadastro.",
  },

  results: {
    yourQuestion: "Sua pergunta",
    stageDraw: "• está realizando a sua tiragem",
    stageOracles: "• está lendo cada oráculo",
    stageSynthesis: "• está escrevendo a sua resposta",
    yourAnswer: "Sua resposta",
    yourAnswerHint: "• Esta é a sua resposta",
    readByOracle: "Ler por oráculo",
    drawLabel: "Tiragem",
    traditionalReading: "Leitura tradicional",
    interpreting: "Interpretando a tiragem...",
    saveReading: "Salvar Leitura",
    saveReadingTitle: "Salvar leitura",
    saved: "Salvo",
    newQuestion: "Fazer outra pergunta",
    noReadingToSave: "Não há leitura pronta para salvar.",
    loginToSave: "Faça login para salvar.",
    saveFailed: "Não foi possível salvar a leitura.",
    savedOk: "Leitura salva!",
    consultFailed: "Não foi possível concluir a consulta.",
    drawIncomplete: "A tiragem não foi concluída.",
  },

  oraclesPage: {
    whatIsTitle: "O que é um oráculo",
    whatIsText:
      "Um oráculo é, em essência, uma tecnologia de percepção. Não é apenas superstição ou acaso, é um mecanismo construído por gerações para transformar padrões invisíveis em símbolos visíveis.",
    howTitle: "Como funciona tecnicamente",
    how: [
      {
        title: "1. Sistema fechado de símbolos",
        text: "Cada oráculo tem um conjunto limitado e bem definido de signos (hexagramas, cartas, runas, conchas).",
      },
      {
        title: "2. Aleatoriedade ritualizada",
        text: "O sorteio ou lançamento cria a ponte. Ele desarma a mente racional e permite que o inconsciente e o campo de sincronicidade entrem.",
      },
      {
        title: "3. Repertório interpretativo",
        text: "Cada símbolo foi cultivado em uma tradição. Ele carrega camadas de sentido acumuladas ao longo de séculos.",
      },
      {
        title: "4. Sincronicidade",
        text: "A correspondência entre sua pergunta e o resultado não é causal, é simbólica. É como se o universo mostrasse um espelho específico naquele instante.",
      },
    ],
    askTitle: "Como perguntar",
    askIntro:
      "A clareza da resposta depende da clareza da pergunta. Mais do que palavras certas, importa a postura interior. Perguntas feitas com abertura e atenção tendem a trazer respostas mais nítidas.",
    askExamples: [
      { label: "Pergunte por direção:", example: "\"Para onde mover energia agora?\"" },
      { label: "Pergunte por gesto:", example: "\"Qual ação transforma este ciclo?\"" },
      { label: "Pergunte por compreensão:", example: "\"O que ainda não estou vendo?\"" },
    ],
    askOutro:
      "Evite perguntas fechadas do tipo \"sim ou não\". Prefira enunciados que revelam o movimento do momento. O oráculo não entrega uma ordem, mas um espelho. Ele aponta para onde olhar e com que espírito agir.",
    deliversTitle: "O que o oráculo entrega",
    deliversText:
      "O oráculo não prediz o futuro como uma máquina. Ele mostra a qualidade do momento. Quais forças estão atuando. Quais riscos e possibilidades já estão em movimento. Assim como uma bússola não te empurra, mas mostra o norte, o oráculo não decide, mas revela direção.",
    traditionsTitle: "As cinco tradições do Multioráculo",
    traditionsIntro:
      "Para traduzir sua pergunta com precisão, reunimos um conjunto essencial de tradições: cinco linguagens simbólicas que compõem a leitura simultânea do Multioráculo. Cada uma ilumina um plano do momento; juntas, oferecem uma visão coerente e acionável.",
    traditions: [
      {
        title: "Tarô",
        text: "Linguagem de 78 imagens que espelham a jornada psíquica. Na leitura junguiana, os Arcanos Maiores mapeiam a individuação: por exemplo, o Louco como impulso de vida, a Morte como transformação inevitável, a Torre como queda das estruturas rígidas, a Temperança como integração de opostos e o Mundo como totalidade. Esses são exemplos, não uma lista completa. O Tarô não prediz; revela qual arquétipo está em cena e que atitude ele pede agora. Funciona muito bem para dar nome à força interna e ao conflito que moldam a pergunta.",
      },
      {
        title: "I Ching",
        text: "Clássico chinês da mudança com 64 hexagramas. Cada consulta traz Julgamento, Imagem e, quando surgem, Linhas Mutáveis. Ele descreve a qualidade do tempo, orientando quando avançar, quando recolher e como alinhar caráter e ação. A ética é central: clareza, modéstia, firmeza, suavidade. Em vez de sim ou não, o I Ching oferece ritmo e postura. É excelente para decisões que dependem de timing e de ajuste fino.",
      },
      {
        title: "Runas",
        text: "Sistema do Elder Futhark em que cada runa é letra, força e princípio de natureza. Elas falam de vontade em ato: iniciar, cortar, proteger, revelar, colher. São diretas e operacionais, favorecendo leituras curtas que viram prática rápida. A chave é cadência: criar ciclos curtos de gesto e revisão, evitando confundir velocidade com progresso. Úteis para destravar movimento e dar disciplina ao impulso.",
      },
      {
        title: "Búzios",
        text: "Oráculo afro-atlântico que lê a queda de conchas para indicar odus e qualidades dos Orixás, isto é, princípios vivos como justiça, coragem, doçura, movimento e paz. Mostra fluxo e bloqueio do axé na situação e chama responsabilidade: palavra certa, tempo certo, respeito ao limite. No app, tratamos como orientação de princípios e postura. Para ritos e prescrições religiosas, sempre encaminhar a uma casa de culto e liderança qualificada.",
      },
      {
        title: "Lenormand",
        text: "Baralho de 36 cartas, linguagem prática do cotidiano: carta, chave, caminhos, casa, jardim, navio. Lê-se em pares e cadeias como frases curtas, gerando sinais verificáveis no curto prazo. É a ponte entre símbolo e agenda: confirmações, convites, obstáculos logísticos, desdobramentos de 24 a 72 horas. Ótimo para validar um pressentimento com evidência concreta.",
      },
    ],
    whyTogetherTitle: "Por que ler os cinco juntos",
    whyTogetherText:
      "Cada sistema ilumina um plano do mesmo instante. O Tarô nomeia a dinâmica psíquica. O I Ching alinha ao tempo. As Runas dão gesto e cadência. Os Búzios oferecem eixo ético e relação com o sagrado. O Lenormand ancora tudo no sinal prático. Em conjunto, você não recebe cinco respostas soltas, mas uma visão coerente que vai do arquétipo ao calendário, da intenção à ação.",
  },

  faq: {
    items: [
      {
        q: "O Multioráculo prevê o futuro?",
        a: "Não. Ele revela a qualidade do momento e a postura eficaz agora. Você continua no comando das suas escolhas.",
      },
      {
        q: "O que recebo em cada tiragem?",
        a: "Uma leitura simultânea de Tarô, I Ching, Runas, Búzios e Lenormand com síntese unificada e os cinco oráculos em abas para consulta completa. Inclui um sinal prático para as próximas 24 a 72 horas. Os planos incluem também interpretação de sonhos, a Jornada onírica e o Grimório.",
      },
      {
        q: "Quantas tiragens tenho em cada plano?",
        a: "Free: 1 tiragem e 1 interpretação de sonho gratuitas sem cadastro e, com conta, 1 de cada por mês.\nEssencial: 8 tiragens e 3 interpretações de sonho por mês, mais 1 Jornada onírica.\nIlimitado: tudo sem limite para uso pessoal.",
      },
      {
        q: "O que conta como uma tiragem?",
        a: "Fazer uma pergunta nova e gerar a leitura completa. Reabrir a mesma leitura não consome nova tiragem.",
      },
      {
        q: "Posso cancelar quando quiser?",
        a: "Sim. Cancelamento a qualquer momento. O acesso permanece até o fim do ciclo já pago.",
      },
      {
        q: "Há período de teste gratuito?",
        a: "Podemos fazer campanhas promocionais com uma tiragem gratuita. Quando estiver ativo, avisaremos dentro do app.",
      },
      {
        q: "O que faço se as respostas parecerem se contradizer?",
        a: "Use a síntese unificada como referência principal. Ela alinha os cinco ângulos em uma orientação coerente. Depois, aprofunde nas abas para ver nuances de timing, atitude e verificação prática.",
      },
      {
        q: "Com que frequência devo perguntar?",
        a: "Qualidade vence quantidade. Uma boa pergunta por semana costuma produzir mais clareza do que muitas perguntas por dia. No Essencial, siga a cadência de duas por semana. No Ilimitado, mantenha intenção clara para não gerar ruído.",
      },
      {
        q: "O app armazena minhas perguntas e leituras?",
        a: "O histórico fica no seu dispositivo para que você possa revisar. Se ativarmos sincronização em nuvem, avisaremos com transparência e opção de controle.",
      },
      {
        q: "As leituras substituem aconselhamento médico, jurídico ou financeiro?",
        a: "Não. O Multioráculo é uma ferramenta de reflexão e direção. Para decisões clínicas, legais ou financeiras, procure profissionais qualificados.",
      },
      {
        q: "Como o Búzios é tratado no app?",
        a: "Com respeito à tradição afro-brasileira. Usamos linguagem de princípios e postura. Para ritos, prescrições específicas e orientação religiosa, procure uma casa e um sacerdote qualificado.",
      },
      {
        q: "O que significa sinal prático de 24 a 72 horas?",
        a: "É um indicador verificável no cotidiano, como mensagem, convite, confirmação ou limiar concreto. Se o sinal vier, avance. Se não vier, refine a pergunta e ajuste a postura.",
      },
      {
        q: "Como tornar minhas perguntas mais claras?",
        a: "Prefira perguntas abertas e situadas no presente. Exemplos: Qual gesto destrava este ciclo? O que preciso deixar para trás agora? Onde está o fio guia desta decisão?",
      },
      {
        q: "O Ilimitado tem algum limite oculto?",
        a: "É ilimitado para uso pessoal humano. Não permitimos automações, uso em massa ou redistribuição comercial das tiragens.",
      },
      {
        q: "Funciona no celular?",
        a: "Sim. A experiência é desenhada para mobile primeiro.",
      },
      {
        q: "Qual é o suporte disponível?",
        a: "Suporte por e-mail para todos os planos.",
      },
    ],
  },

  subscription: {
    titleSuffix: ": Assine clareza.",
    subtitle: "Decisões certas começam com respostas precisas. Cinco oráculos convergem para você.",
    perMonth: "/mês",
    forWhom: "Para quem:",
    mostPopular: "Mais Popular",
    essential: {
      name: "Essencial",
      price: "R$ 9,99",
      tagline: "Cadência e foco.",
      description: "8 tiragens e 3 interpretações de sonho por mês, com a Jornada onírica mensal, para manter o rumo sem ansiedade.",
      features: [
        "8 tiragens completas por mês: 5 oráculos + síntese integrada",
        "3 interpretações de sonho por mês",
        "Jornada onírica: 1 análise evolutiva dos seus sonhos por mês",
        "Leituras salvas, notas e Grimório vinculados às consultas",
      ],
      forWhom: "prefere uma pergunta boa por vez, semana após semana, e registra o que vive.",
      cta: "Começar com Essencial",
    },
    unlimited: {
      name: "Ilimitado",
      price: "R$ 13,99",
      tagline: "Decisão em ritmo vivo.",
      description: "Tiragens, sonhos e Jornada sem limite (uso pessoal) para transformar símbolo em gesto, todos os dias.",
      features: [
        "Tiragens completas ilimitadas",
        "Interpretações de sonho ilimitadas",
        "Jornada onírica sempre que quiser",
        "Histórico completo de leituras, sonhos e Grimório",
      ],
      forWhom: "cria, lidera ou ajusta rota com frequência e quer fricção zero.",
      cta: "Assinar Ilimitado",
    },
    notesTitle: "Observações",
    notes: [
      "Conta como 1 tiragem quando você faz uma pergunta nova e recebe a leitura completa; reabrir a mesma leitura não consome.",
      "Cancelamento a qualquer momento; cobrança mensal recorrente (BRL).",
      "\"Ilimitado\" sujeito a uso pessoal razoável (não permite automação/massa)",
    ],
  },

  savedReadings: {
    title: "Leituras Salvas",
    emptyTitle: "Ainda não há leituras salvas.",
    emptyText: "Faça uma pergunta e salve sua primeira leitura.",
    askNow: "Fazer uma pergunta agora",
    confirmDelete: "Deseja excluir esta leitura?",
    view: "Ver leitura",
  },

  readingDetail: {
    back: "Leituras Salvas",
    yourQuestion: "Sua pergunta",
    yourAnswer: "Sua resposta",
    readByOracle: "Ler por oráculo",
    drawLabel: "Tiragem",
    traditionalReading: "Leitura tradicional",
  },

  readingNotes: {
    title: "Nota pessoal",
    placeholder: "Adicionar nota pessoal sobre esta leitura...",
    alsoJournal: "Salvar também no Diário",
    journalTitlePlaceholder: "Título da entrada no Diário (opcional)",
    save: "Salvar nota",
    savedCheck: "Salvo ✓",
    savedOk: "Nota salva.",
    savedWithJournal: "Nota salva e adicionada ao Diário.",
    errorSaving: "Erro ao salvar nota.",
    errorSavingReading: "Erro ao salvar nota na leitura.",
    errorSavingJournal: "Erro ao salvar no Diário.",
  },

  deleteReading: {
    delete: "Excluir leitura",
    confirm: "Confirmar exclusão",
    deleting: "Excluindo...",
    failed: "Não foi possível excluir a leitura.",
    done: "Leitura excluída.",
  },

  dreams: {
    titleEmphasis: "O inconsciente",
    titleRest: "fala",
    titleLine2: "enquanto você dorme.",
    subtitle: "Descreva seu sonho e revele os símbolos que a psique está comunicando.",
    prompt: "Descreva seu sonho com os detalhes que lembrar.",
    placeholder: "Descreva seu sonho...",
    interpret: "Interpretar Símbolos",
    interpreting: "Interpretando símbolos...",
    interpretingShort: "Interpretando...",
    yourDream: "Seu sonho",
    personalNotes: "Notas pessoais",
    notesPlaceholder: "Adicionar suas reflexões...",
    saveToJournal: "Salvar no Diário",
    waitToFinish: "Aguarde a interpretação concluir...",
    anotherDream: "Interpretar outro sonho",
    shareTitle: "Diário de Sonhos",
    errorInterpret: "Erro ao interpretar sonho.",
    noResponse: "Sem resposta do servidor.",
    savedOk: "Sonho salvo com sucesso!",
    errorSave: "Erro ao salvar sonho.",
    loginToSee: "Faça login para ver seus sonhos salvos.",
    freeHint: "Sua primeira interpretação é gratuita e não precisa de cadastro.",
    seePlans: "Ver planos",
  },

  savedDreams: {
    journeyTitle: "Sua Jornada",
    journeyIntro:
      "Leitura da evolução dos seus sonhos, revelando padrões que retornam, transformações que se aprofundam e o tema essencial que se desdobra ao longo da sua travessia interior.",
    generate: "Gerar Análise",
    lastAnalysis: "Última análise: {date}",
    analyzing: "Analisando sua jornada onírica...",
    timeline: "Linha de Evolução",
    patterns: "Padrões Recorrentes",
    turningPoint: "Ponto de Virada",
    essence: "Essência da Fase Atual",
    saveAnalysis: "Salvar Análise",
    analysisSavedOn: "✓ Análise salva em {date}",
    refreshAnalysis: "Atualizar Análise",
    analysisSaved: "Análise da jornada salva!",
    errorGenerate: "Erro ao gerar análise.",
    errorSaveAnalysis: "Erro ao salvar análise.",
    title: "Sonhos Salvos",
    newDream: "Novo Sonho",
    empty: "Nenhum sonho salvo ainda.",
    interpretFirst: "Interpretar primeiro sonho",
    confirmDelete: "Deseja excluir este sonho?",
    viewInterpretation: "Ver interpretação",
    editNotes: "Editar notas pessoais",
    personalNotes: "Notas pessoais",
    deleted: "Sonho excluído.",
    errorDelete: "Erro ao excluir sonho.",
    notesUpdated: "Notas atualizadas.",
    errorNotes: "Erro ao atualizar notas.",
  },

  grimoire: {
    title: "Grimório",
    intro:
      "Seu espaço sagrado para registrar o que a vida revela. Cada registro guarda um fragmento da sua travessia interior. Escreva sobre o que sentiu, compreendeu ou viveu.",
    loginToAccess: "Faça login para acessar seu Grimório.",
    newEntry: "Novo Registro",
    newNote: "Nova nota",
    titlePlaceholder: "Hoje meu dia...",
    contentPlaceholder: "Escreva sobre o seu dia...",
    editTitlePlaceholder: "Título (opcional)",
    saveToGrimoire: "Salvar no Grimório",
    empty: "Nenhuma anotação no Grimório ainda.",
    createFirst: "Criar primeira anotação",
    confirmDelete: "Deseja excluir esta nota?",
    linkedToReading: "Vinculada a uma leitura",
    created: "Nota criada.",
    updated: "Nota atualizada.",
    deleted: "Nota excluída.",
    errorCreate: "Erro ao criar nota.",
    errorUpdate: "Erro ao atualizar nota.",
    errorDelete: "Erro ao excluir nota.",
  },

  buzios: {
    firstCast: "1ª queda",
    secondCast: "2ª queda · confirmação",
    openCount: "{open} de {total} búzios abertos",
    ariaPrimary: "Primeira queda: {open} dos {total} búzios abertos, correspondente ao Odu {odu}",
    ariaConfirmation: "Segunda queda, confirmação: {open} dos {total} búzios abertos, correspondente ao Odu {odu}",
  },

  billing: {
    planNames: { free: "Free", essential: "Essencial", unlimited: "Ilimitado" },
    currentPlan: "Seu plano atual",
    freeDescription: "1 tiragem completa e 1 interpretação de sonho gratuitas, sem cadastro. Com conta, 1 de cada por mês, além de sonhos salvos e Grimório. A Jornada onírica faz parte dos planos pagos.",
    trialUsed: "Você já usou sua tiragem gratuita. Entre para continuar.",
    freeDreamAvailable: "Você tem 1 interpretação de sonho gratuita disponível este mês.",
    freeDreamUsed: "Você já utilizou sua interpretação de sonho gratuita deste mês. Assine para continuar.",
    dreamTrialUsed: "Você já usou sua interpretação de sonho gratuita. Entre para continuar.",
    dreamLimitReached: "Você já usou as {limit} interpretações de sonho deste período. A cota renova em {date}.",
    usageDreams: "{used} de {limit} interpretações de sonho usadas neste período",
    usageDreamsUnlimited: "Interpretações de sonho ilimitadas",
    usageJourney: "{used} de {limit} análises da Jornada onírica usadas neste período",
    usageJourneyUnlimited: "Jornada onírica sem limite",
    journeyPlanRequired: "A Jornada onírica faz parte dos planos Essencial e Ilimitado.",
    journeyLimitReached: "Você já usou a Jornada onírica deste período. A cota renova em {date}.",
    freeAvailable: "Você tem 1 tiragem gratuita disponível este mês.",
    freeUsed: "Você já utilizou sua tiragem gratuita deste mês. Assine para continuar consultando.",
    limitReachedFree: "Você já utilizou sua tiragem gratuita deste mês. Assine para continuar consultando.",
    manage: "Gerenciar assinatura",
    switchPlan: "Trocar de plano",
    loginToSubscribe: "Entre para assinar",
    redirecting: "Redirecionando…",
    usage: "{used} de {limit} tiragens usadas neste período",
    usageUnlimited: "Tiragens ilimitadas para uso pessoal",
    renews: "Renova em {date}",
    statusPending: "Pagamento em processamento. Assim que a Stripe confirmar, seu plano será liberado automaticamente.",
    statusPaymentProblem: "Há um problema com o pagamento da sua assinatura. Atualize o cartão em Gerenciar assinatura para manter o plano.",
    statusCanceling: "Cancelamento agendado para {date}. Você mantém o acesso até lá.",
    statusEnded: "Sua assinatura foi encerrada. Você está no plano Free.",
    checkoutCanceled: "Pagamento cancelado. Nada foi cobrado.",
    managedElsewhere: "Assinatura gerenciada por {provider}. Use o app da loja para alterá-la.",
    providers: { stripe: "Stripe", google_play: "Google Play", apple: "App Store" },
    errors: {
      generic: "Não foi possível iniciar o pagamento. Tente novamente.",
      alreadySubscribed: "Você já tem uma assinatura ativa. Use Gerenciar assinatura.",
      notConfigured: "Pagamentos ainda não estão disponíveis.",
      noCustomer: "Nenhuma assinatura encontrada para esta conta.",
      unauthenticated: "Entre para continuar.",
    },
    limitReached: "Você já usou as {limit} tiragens deste período. A cota renova em {date}.",
    limitReachedCta: "Ver planos",
    loginRequired: "Entre para continuar consultando.",
    billingUnavailable: "As consultas estão temporariamente indisponíveis. Tente novamente em instantes.",
  },
}

export type Dictionary = typeof pt
