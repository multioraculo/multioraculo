/**
 * GERADO POR scripts/extrair-bendov.mjs — NÃO EDITAR À MÃO.
 *
 * Índice estruturado do Tarô, carta a carta, extraído do capítulo 12 de
 * Yoav Ben-Dov, O Tarô de Marselha Revelado (Pensamento-Cultrix, 2020), capítulo 12.
 * Extraído em 2026-10-03. sha256 do PDF: 1270f3e5e807d26d185431f4e2307d0a9e8e6ac160492f68844b9522a2b36aaf
 *
 * O campo invertida_similar marca as cartas em que a fonte diz só "Similar.",
 * ou seja, aquelas em que a inversão não muda o sentido. As seções
 * "MENSAGEM:" do livro são descartadas na extração: são imperativas e a
 * síntese do produto proíbe prescrever.
 */
export type FichaDeCarta = {
  carta: string
  base: string
  invertida: string
  invertida_similar: boolean
  fonte: string
  pagina: number
}

export const BENDOV_FONTE = "Yoav Ben-Dov, O Tarô de Marselha Revelado (Pensamento-Cultrix, 2020), capítulo 12"
export const BENDOV_PDF_SHA256 = "1270f3e5e807d26d185431f4e2307d0a9e8e6ac160492f68844b9522a2b36aaf"

export const BENDOV_CARTAS: FichaDeCarta[] = [
 {
  "carta": "O Mago",
  "base": "O começo de algo. Sorte de iniciante. Ter vários instrumentos e meios à disposição. Uso de forças sobrenaturais. Criar a realidade com poder da mente. Treinamento e aquisição de habilidades práticas. Improvisação. Exibir ou mostrar para outras pessoas.",
  "invertida": "Trapaça, truque de mão, enganar. Ostentar, fingir. Falta de autoconsciência sobre o corpo, a sexualidade ou motivos básicos. Prestes a perder algo devido à inexperiência ou imprecisão.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 433
 },
 {
  "carta": "A Papisa",
  "base": "Sabedoria combinada com intelecto e intuição. Uma mãe espiritual. Uma mulher escondendo sua força num mundo dominado por homens. Modéstia. Segredos, algo oculto, mistério. Obter uma dica de algo que permanece amplamente desconhecido. Impossível dar uma resposta definitiva agora.",
  "invertida": "A necessidade de esconder a verdadeira natureza por trás das convenções da sociedade normal. Abordagem conservadora do sexo e do corpo. Bloqueio emocional.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 433
 },
 {
  "carta": "A Imperatriz",
  "base": "Abundância, crescimento, produtividade. Toque natural ou humano dentro de um ambiente artificial. Inteligência emocional. Proteção e cuidados. Maternidade. Uma figura feminina poderosa. Identidade feminina forte.",
  "invertida": "Comportamento impulsivo. Alguém com quem é difícil argumentar. Superproteção. Envolvimento excessivo na vida dos outros. Problemas com uma forte figura materna.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 433
 },
 {
  "carta": "O Imperador",
  "base": "Conquistas práticas e materiais. Assuntos relacionados ao local de trabalho ou à fonte de renda. Autoridade e controle. Uma posição de comando. Uma figura paterna protetora, patrão ou patrocinador. Assertividade. Assuntos militares.",
  "invertida": "Beligerância, violência, tentar resolver as coisas com a força bruta. Ditadura. Possibilidade de abuso sexual. Dificuldade em lidar com uma figura paterna dominante. Negação e ocultação de fraquezas interiores.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 433
 },
 {
  "carta": "O Papa",
  "base": "Professor, instrutor ou conselheiro. Educação e conhecimento. Experiência acadêmica. Religião organizada, medicina convencional ou psicologia. Pai espiritual. Consulta ou tratamento com um especialista. Casamento.",
  "invertida": "Adesão excessiva a convenções e normas ultrapassadas. Burocracia. Uma instituição opressiva. Hipocrisia, discriminação. Divórcio.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 434
 },
 {
  "carta": "O Amante",
  "base": "Amor, relacionamento amoroso. Envolvimento emocional. Necessidade de fazer uma escolha ou se desvencilhar de influências passadas. As inclinações do coração correspondem à vontade divina. Pequenos passos são sinais de desejo interior.",
  "invertida": "Relacionamento complexo entre várias pessoas; por exemplo, um triângulo amoroso ou tensão entre mãe e esposa. Hesitação, dilema. Confusão com relação aos próprios sentimentos e vontades.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 434
 },
 {
  "carta": "O Carro",
  "base": "Vitória ou uma conquista que coloca o consulente numa posição forte e protegida. Ambição, energia, motivação para seguir em frente. Honra pública. Poder e status alto.",
  "invertida": "Fraqueza oculta atrás da fachada. Arrogância, vaidade. Superproteção. Fechamento emocional. Confusão com relação aos próprios objetivos. Perder o toque simples com as pessoas e o contato com a realidade.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 434
 },
 {
  "carta": "A Justiça",
  "base": "Lei e ordem, questões legais e judiciais. Julgamento justo e equilibrado. Uma consciência desenvolvida. Racionalidade. Argumentar com base em regras claras e normas comuns. Um toque de graça e humanidade além de considerações objetivas.",
  "invertida": "Pequena responsabilidade. Uma atitude crítica e reprovadora. Sentimentos de culpa. Controle repressivo de si e dos outros. Ideias negativas que impedem a mudança e o avanço.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 435
 },
 {
  "carta": "O Eremita",
  "base": "Uma busca pela verdade ou entendimento espiritual. Concentrar-se num propósito claro. Cuidado, exame cuidadoso. Autoprivação por uma causa significativa. Lealdade aos princípios. Fé inabalável.",
  "invertida": "Uma atitude fechada e reclusa. Isolamento, solidão. Ideias fixas. Cuidado e suspeita excessivos. Uma abordagem crítica, à procura de defeitos. Desejos ocultos e negados.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 435
 },
 {
  "carta": "A Roda da Fortuna",
  "base": "Mudança nas circunstâncias e na posição. Um aumento após uma queda. Jogatina, pôr fé nos caprichos da sorte. Ciclos da vida, fechamento de círculos. Adaptação para a rotina da vida cotidiana. Uma dica sobre encarnações anteriores.",
  "invertida": "Um declínio após um período de ascendência. O perigo espreita no cume. Movendo-se num círculo fechado. Humor oscilante. Sentir-se impotente para mudar uma situação.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 435
 },
 {
  "carta": "A Força",
  "base": "Poder e coragem para enfrentar desafios. Expressão controlada de impulsos criativos, anseios e desejos. Mobilização de recursos internos em direção a um objetivo comum. Assumir riscos.",
  "invertida": "A necessidade de manter as coisas sob controle gera tensões constantes. Risco de perder a capacidade de controle. Conflito interior e avaliação irrealista das próprias forças pode levar ao fracasso.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 435
 },
 {
  "carta": "O Enforcado",
  "base": "Ver as coisas de um ponto de vista único. Enfrentar dificuldades por uma causa nobre. Período de profundo autoexame. Passividade. Aceitação da realidade, mesmo que seja o oposto do que se espera.",
  "invertida": "Isolamento. Vitimismo. Incapacidade de agir. Negar as próprias qualidades únicas, esforçando-se para ser “normal” a todo custo. Viver uma realidade particular e fantasiosa.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 436
 },
 {
  "carta": "A Morte",
  "base": "O fim de algo cuja hora chegou. Romper influências do passado ou o apego a figuras dominantes. Desistir do supérfluo e manter apenas o essencial. A desintegração do velho abre espaço para o novo.",
  "invertida": "Dificuldade para lidar com perdas ou mudanças. Dificuldades temporárias, um desafio difícil. Desintegração. Percepção de uma verdade dolorosa. Esta carta não prevê morte futura, mas pode refletir ansiedade com a possibilidade de morrer ou o ato de lamentar uma perda que já aconteceu.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 436
 },
 {
  "carta": "A Temperança",
  "base": "Reconciliação, compromisso, relaxamento de tensões. Integração de opostos. Capacidade de fazer o aparentemente impossível. Um lento processo de destilação e melhoria. Paciência, perseverança. Autoaperfeiçoamento.",
  "invertida": "Avanços e retrocessos, sem fazer um progresso real. Perder a paciência com um processo demorado. Preocupação consigo mesmo, ato de afastar outros que possam ajudar.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 436
 },
 {
  "carta": "O Diabo",
  "base": "Uma explosão de criatividade. Paradoxos e contradições. Ironia e zombaria de normas comuns. Agindo a partir de desejos, paixões e impulsos. Superar trauma familiar do passado.",
  "invertida": "Tentação, atração pelo sombrio e proibido. Exploração, egoísmo, dominação. Autossatisfação compulsiva. O comportamento insensível tem seu preço. Dificuldade em desapegar-se de um vínculo prejudicial.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 437
 },
 {
  "carta": "A Torre",
  "base": "Romper estruturas sólidas. Livrar-se de um confinamento. Progresso repentino após longas preparações. Encontro sexual vigoroso e cheio de energia. O sucesso está na simplicidade e na modéstia.",
  "invertida": "Choque. Colapso de projetos ou estruturas confiáveis. Uma queda de uma posição aparentemente sólida e segura. Caos, confusão, dificuldade em entender o que está acontecendo. Vaidade e orgulho levam ao fracasso.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 437
 },
 {
  "carta": "A Estrela",
  "base": "Abertura, simplicidade, retorno à natureza. Pureza, honestidade. Mostrar-se “como você é”, aceitando o próprio corpo e os próprios desejos. Generosidade. Sorte do céu. Sentimento intuitivo de orientação ou energia proveniente de um plano superior.",
  "invertida": "Otimismo ingênuo e pensamento positivo. Expor a si mesmo ao perigo ou abuso. Dificuldade em estabelecer fronteiras adequadas. Desperdício, esbanjamento.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 437
 },
 {
  "carta": "A Lua",
  "base": "Emoções profundas, talvez relacionadas à mãe ou a uma figura feminina. Uma experiência diferente da realidade. Ansiar por algo inacessível. Encontrar os pontos fortes ocultos. Ocupação com o passado distante. Um tesouro escondido.",
  "invertida": "Sentimentos vagos e perturbadores. Dificuldades emocionais. Um período de depressão. Perigo à espreita sob a superfície. Recuar. O caminho a seguir é difícil de encontrar.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 437
 },
 {
  "carta": "O Sol",
  "base": "Luz e calor, abundância, bênçãos. Sentimentos agradáveis. Cura emocional ou física. Parceria, confiança, compartilhamento, fraternidade. Toque humano. Figura paterna ideal. Assuntos relacionados a crianças ou filhos. Definir limites de uma maneira moderada e não opressiva.",
  "invertida": "Viver num espaço limitado. Dificuldade para enfrentar a realidade de frente. Imaturidade, dependência dos outros. Alguém ou algo muito intenso e enérgico, com o qual é difícil se sentir à vontade. Um pai ausente.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 438
 },
 {
  "carta": "O Julgamento",
  "base": "Revelação, esclarecimento, um novo entendimento. Ponto de virada num processo de terapia. Cura de um relacionamento familiar. Revelação, segredos descobertos, notoriedade. Nascimento de um bebê ou algo novo.",
  "invertida": "Revelação de algo que deveria ter sido mantido oculto. Falta de privacidade. Constatação desagradável. Problema ligado à relação entre pai e filho. Muito drama e alarde.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 438
 },
 {
  "carta": "O Mundo",
  "base": "Conclusão de um processo. Atividade equilibrada e realizações em vários domínios. Contato com lugares distantes. Harmonia e correspondência entre diferentes planos. Gravidez. Algo novo está para nascer. A dança da vida.",
  "invertida": "Vida numa bolha. Dificuldade para compartilhar o próprio mundo com os outros. Desconexão entre os sentimentos e a vida exterior. Preocupação consigo mesmo, autoimagem idealizada, incapacidade de seguir em frente.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 438
 },
 {
  "carta": "O Louco",
  "base": "Liberdade com relação a convenções e normas. Algo ou alguém único e excepcional. Opções mantidas em aberto. Desistir do controle. Espontaneidade. Incerteza. Atenção para o aqui e agora. Partir numa viagem.",
  "invertida": "Dificuldade em escolher e se comprometer com algo estável. Inquietação. Falta de propósito. Se perder. Comportamento tolo. Excentricidade. Falta de aceitação no ambiente social. Dificuldade em planejar com antecedência. O",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 439
 },
 {
  "carta": "Ás de Ouros",
  "base": "Um bom começo para as coisas materiais. Estabilidade financeira e física. Uma perspectiva prática. Uma soma significativa de dinheiro. Abordagem utilitarista. Ganância. Algo básico e sem sofisticação.",
  "invertida": "Similar.",
  "invertida_similar": true,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 440
 },
 {
  "carta": "Dois de Ouros",
  "base": "Dualidade. Duas opções ou dois elementos. Colaborar enquanto mantém distância. Numa estrada sinuosa, avançar de maneiras complexas. Reconhecimento e familiaridade.",
  "invertida": "Similar.",
  "invertida_similar": true,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 440
 },
 {
  "carta": "Três de Ouros",
  "base": "Resultados. Uma parceria ou aliança produz frutos. Primeiros resultados de um projeto. Boas perspectivas.",
  "invertida": "Decepção. Uma parceria ou projeto que não dá os frutos esperados.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 440
 },
 {
  "carta": "Quatro de Ouros",
  "base": "Estabilidade. Ativos materiais sólidos. Algo testado pelo tempo. Confiabilidade. Tradição, honra e reputação. Instituições sociais bem estabelecidas.",
  "invertida": "Conservadorismo. Seguir padrões antigos e ultrapassados.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 440
 },
 {
  "carta": "Cinco de Ouros",
  "base": "Ruptura. Algo novo aparece e desestabiliza estruturas existentes. Um novo elemento chama atenção, mas também desperta resistência.",
  "invertida": "Similar.",
  "invertida_similar": true,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 440
 },
 {
  "carta": "Seis de Ouros",
  "base": "Expansão. Abundância de recursos e possíveis maneiras de avançar. Uma perspectiva positiva, sucesso. Um bom equilíbrio entre estabilidade e movimento.",
  "invertida": "Similar.",
  "invertida_similar": true,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 440
 },
 {
  "carta": "Sete de Ouros",
  "base": "Aceitação. Algo novo é bem recebido. Ajuda e proteção. Integrar-se num sistema sem perder a individualidade.",
  "invertida": "Falta de independência, necessidade de contar com a ajuda e a aceitação dos outros.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 440
 },
 {
  "carta": "Oito de Ouros",
  "base": "Uniformidade. Uma estrutura mecânica. Considerações práticas provam ser eficientes, mas carecem de um toque humano. Trabalho de rotina. Um avanço lento e paciente.",
  "invertida": "Similar.",
  "invertida_similar": true,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 441
 },
 {
  "carta": "Nove de Ouros",
  "base": "Motivação. Encontrar um nicho para si mesmo num sistema já existente. Pensamento resiliente e independente dando frutos a longo prazo.",
  "invertida": "Similar.",
  "invertida_similar": true,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 441
 },
 {
  "carta": "Dez de Ouros",
  "base": "Abundância. Atividade intensiva em assuntos práticos. Sucesso material e realizações. Alguns podem estar recebendo mais que outros.",
  "invertida": "Similar.",
  "invertida_similar": true,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 441
 },
 {
  "carta": "Valete de Ouros",
  "base": "Um esforço prático. Potenciais inexplorados estão ao seu alcance. Sucesso tangível no início. Uma sólida base material para maiores avanços.",
  "invertida": "Hesitação, falta de um propósito claro. Pensar em termos de realizações passadas faz com que se perca oportunidades no presente.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 441
 },
 {
  "carta": "Cavaleiro de Ouros",
  "base": "Avanço numa direção prática. Uma expressão produtiva de criatividade. Um objetivo claro à vista.",
  "invertida": "Busca constante por dinheiro sem alcançar estabilidade material. Paixões e desejos podem interferir em planos práticos.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 441
 },
 {
  "carta": "Rainha de Ouros",
  "base": "Ativos tangíveis, estabilidade material e pessoal, uma visão sóbria e realista. Observando as coisas de uma perspectiva prática e pragmática.",
  "invertida": "Conservadorismo, resistência à mudança, visar apenas a preservação dos ativos existentes. Observar as coisas apenas da perspectiva material.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 441
 },
 {
  "carta": "Rei de Ouros",
  "base": "Confiança e segurança, uma atitude cautelosa, mas uma visão otimista. Procurando novas conquistas enquanto mantém ativos existentes seguros.",
  "invertida": "Insatisfação com o que já se tem. Pouco-caso com as coisas boas da situação atual. Uma perspectiva limitada. C",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 441
 },
 {
  "carta": "Ás de Copas",
  "base": "O início de um relacionamento amoroso. Expressão de sentimentos calorosos. Desejo romântico por algo extraordinário. Crescimento emocional e espiritual.",
  "invertida": "Insensibilidade emocional, sentir um vazio. Evitar intimidade. Sentimentos negativos. Coração partido.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 443
 },
 {
  "carta": "Dois de Copas",
  "base": "Parceria. Um relacionamento romântico ou um relacionamento pessoal próximo. Dinâmica interpessoal baseada em normas sociais. Paixão num relacionamento amoroso que pode se revelar destrutiva.",
  "invertida": "Uma crise num relacionamento. Decepção com alguém perto de você.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 443
 },
 {
  "carta": "Três de Copas",
  "base": "Nascimento. Algo novo traz alegria e felicidade. Cuidar de uma criança. Questões da relação pai e filho. Um projeto comum motivado por sentimentos e não apenas por interesses.",
  "invertida": "Problemas na relação com os pais ou com um filho. Forte aliança de duas pessoas deixa uma terceira de fora.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 443
 },
 {
  "carta": "Quatro de Copas",
  "base": "Família. Um coletivo de pessoas (família, comunidade etc.) com uma história e um sentimento de grupo. Compromisso com um grupo em detrimento de interesses pessoais.",
  "invertida": "Problemas e discórdia na família ou numa comunidade duradoura. Uma estrutura social fixa que não permite adaptação ou flexibilidade.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 443
 },
 {
  "carta": "Cinco de Copas",
  "base": "Conexões. Popularidade, relações com muitas pessoas. Tornar-se o centro das atenções num grupo. Confiar nas conexões com outras pessoas para avançar ou superar dificuldades.",
  "invertida": "Preocupação excessiva com a atividade social. Perder a si mesmo em múltiplas conexões superficiais. Cultivar o contato virtual em vez de contatos reais.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 443
 },
 {
  "carta": "Seis de Copas",
  "base": "Continuidade. Um relacionamento de longo prazo. Repetição entre diferentes gerações da família. Uma aliança pessoal estável.",
  "invertida": "Monotonia, repetição tediosa. Perda de tempo e repetição das mesmas armadilhas emocionais.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 443
 },
 {
  "carta": "Sete de Copas",
  "base": "Individualidade. Uma pessoa isolada encontrando seu lugar num grupo. Contato com pessoas em posições elevadas. Qualidades excepcionais apreciadas.",
  "invertida": "Problemas de integração num grupo ou organização. Ser parte de um coletivo, mas se sentir isolado e distante.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 444
 },
 {
  "carta": "Oito de Copas",
  "base": "Envolvimento. Desenvolver relacionamentos pessoais dentro de um grupo. Um ambiente favorável a relações humanas. Uma festa ou reunião familiar.",
  "invertida": "Interferência do ambiente na vida de um casal. As pressões da família em relações românticas ou assuntos pessoais.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 444
 },
 {
  "carta": "Nove de Copas",
  "base": "Coordenação. Pessoas ou peças trabalhando juntas, cada uma em seu devido lugar. Aceitar o papel de alguém num relacionamento social ou ambiente de grupo. Felicidade. Desejos se tornando realidade.",
  "invertida": "Uma situação social confusa. Dificuldade para se situar num ambiente complexo.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 444
 },
 {
  "carta": "Dez de Copas",
  "base": "Liderança. Uma pessoa com qualidades especiais recebe reconhecimento e um cargo alto. Assumir a responsabilidade por outras pessoas. Manter uma posição superior.",
  "invertida": "Um líder em queda. Perda de popularidade. Decepção por causa da ingratidão das pessoas que ajudou.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 444
 },
 {
  "carta": "Valete de Copas",
  "base": "Primeiras etapas hesitantes de um romance. Timidez. Intenções sinceras. Tentar descobrir os próprios sentimentos.",
  "invertida": "Envolvimento excessivo nos sentimentos pessoais. Perder contato com outras pessoas. Negligência em assuntos práticos.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 444
 },
 {
  "carta": "Cavaleiro de Copas",
  "base": "Um gesto romântico, oferecer o coração, cortejar. Abertura, sinceridade, um coração simples. Um amante em potencial pode aparecer.",
  "invertida": "Sentimentos superficiais e instáveis. Uma atitude excessivamente otimista, mas irrealista. Uma exibição aberta de sentimentos rasos ou pouco sinceros.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 445
 },
 {
  "carta": "Rainha de Copas",
  "base": "Um mundo interior rico que não é revelado. Proteger a privacidade ou ativos valiosos. Fortes sentimentos mantidos sob controle.",
  "invertida": "Postura fechada, defensiva. Desconfiança dos outros devido a experiências passadas negativas. Esconder as emoções sob o disfarce de criticismo racional.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 445
 },
 {
  "carta": "Rei de Copas",
  "base": "Maturidade emocional, otimismo, capacidade de superar feridas do passado e olhar para o futuro. Abertura para coisas novas, mas com prudência e cautela. Fechar os ouvidos para as vozes do passado.",
  "invertida": "Dificuldade em superar um golpe emocional. Perspectiva pessimista causada por experiências passadas negativas. P",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 445
 },
 {
  "carta": "Ás de Paus",
  "base": "Impulso criativo. Sexualidade ativa. Impulsos fortes. Energia e direção. Força da vida. Início de crescimento. Dispersar os esforços em diferentes direções.",
  "invertida": "Falta de energia, restrição, sexualidade reprimida, um bloqueio criativo.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 446
 },
 {
  "carta": "Dois de Paus",
  "base": "Encruzilhadas. Várias opções para escolher. Todo curso oferece benefícios. Um breve encontro com alguém que segue seu próprio caminho. Bloquear o avanço de um oponente.",
  "invertida": "Similar.",
  "invertida_similar": true,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 446
 },
 {
  "carta": "Três de Paus",
  "base": "Direção. Avançar depois de um momento de hesitação. Encontrar um caminho intermediário entre dois cursos de ação. Ganhar vantagem mantendo a neutralidade entre dois lados conflitantes.",
  "invertida": "Similar.",
  "invertida_similar": true,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 446
 },
 {
  "carta": "Quatro de Paus",
  "base": "Paralisação. Uma pausa temporária para se preparar para futuros avanços. Tensões no momento, mas boas perspectivas a longo prazo. Fazer um movimento agora não é interessante para ninguém.",
  "invertida": "Similar.",
  "invertida_similar": true,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 446
 },
 {
  "carta": "Cinco de Paus",
  "base": "Superação. Vencer uma oposição fraca. Romper o equilíbrio. Focar o objetivo principal. Iniciativa para fazer uma jogada vencedora.",
  "invertida": "(com a parte coberta da haste central na parte inferior da carta) Deparar-se com uma situação complexa, perdendo vantagem.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 446
 },
 {
  "carta": "Seis de Paus",
  "base": "Colaboração. Uma forte aliança entre duas partes com objetivos diferentes, mas interesses comuns no momento. Condições favoráveis para satisfazer o gosto pelo luxo.",
  "invertida": "(com a flor decorada na parte inferior da carta) Busca excessiva pelo luxo. Necessidade de romper uma aliança de oponentes.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 446
 },
 {
  "carta": "Sete de Paus",
  "base": "Luta. Alguém lutando contra muitos oponentes. Obstinação, resistência, manter a posição numa situação de conflito. Um combate difícil com um resultado incerto.",
  "invertida": "Similar.",
  "invertida_similar": true,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 447
 },
 {
  "carta": "Oito de Paus",
  "base": "Regulamentação. É possível avançar apenas seguindo as regras. Ocupação com objetivos de curto prazo enquanto perde a perspectiva de longo prazo. Um bloqueio.",
  "invertida": "Similar.",
  "invertida_similar": true,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 447
 },
 {
  "carta": "Nove de Paus",
  "base": "Interrupção. Dificuldades e oposições muito difíceis de superar. Desistir dos projetos para evitar conflitos. Começar de novo após um período desafiador.",
  "invertida": "Similar.",
  "invertida_similar": true,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 447
 },
 {
  "carta": "Dez de Paus",
  "base": "Lealdade. Uma parceria ou aliança vence dificuldades, conseguindo superá-las. Intenções puras e perseverança levam ao sucesso. Honrar os princípios, apesar de todas as dificuldades.",
  "invertida": "Similar.",
  "invertida_similar": true,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 447
 },
 {
  "carta": "Valete de Paus",
  "base": "Um potencial criativo que ainda precisa ser processado. Manter uma distância segura dos acontecimentos e aguardar o momento certo.",
  "invertida": "Uma tarefa além das forças do consulente. Dificuldade no controle de desejos e impulsos. Abordagem imatura da sexualidade.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 447
 },
 {
  "carta": "Cavaleiro de Paus",
  "base": "Uma mudança de direção, para satisfazer desejos e paixões. Uma parada temporária, mas ainda com energia e desejo de avanço.",
  "invertida": "Preocupação com a satisfação dos próprios desejos. Problema na definição de objetivos de longo prazo. Cair em tentação.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 447
 },
 {
  "carta": "Rainha de Paus",
  "base": "Uma figura feminina com uma forte personalidade. Coisas relacionadas com comida e o ato de comer. Manter a cordialidade, deixando claro que se pode usar de truculência se necessário. Uma posição segura e bem defendida.",
  "invertida": "Intimidação, ameaça. Usar a sexualidade como um meio de controle. Problemas com uma forte figura materna. Medo do poder feminino.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 447
 },
 {
  "carta": "Rei de Paus",
  "base": "Uma atitude madura com relação a impulsos e desejos. Criatividade controlada. Incentivar a si mesmo para avançar. Investir ativos atuais em projetos futuros.",
  "invertida": "Planos de avanço frustrados por atitudes contraproducentes. Hesitação, conflitos. Tendência para tornar as coisas muito difíceis e complexas. E",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 448
 },
 {
  "carta": "Ás de Espadas",
  "base": "Uma iniciativa planejada. Pensamento racional e lógico, argúcia mental. Uma decisão conclusiva. Prontidão para lutar. Ambição, competitividade. Uma vitória com realizações estáveis.",
  "invertida": "Pensamentos negativos e improdutivos. Equívocos, ilusões. Autossabotagem. Lesão.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 449
 },
 {
  "carta": "Dois de Espadas",
  "base": "Limites. Limites que protegem e definem algo que está em desenvolvimento. Fazer pleno uso da situação presente. Preparativos para futuros avanços. Uma visão clara abrangendo a situação como um todo.",
  "invertida": "Similar.",
  "invertida_similar": true,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 449
 },
 {
  "carta": "Três de Espadas",
  "base": "Vitória. Superando uma oposição fraca. Superar um dilema e seguir adiante numa direção clara. Uma terceira pessoa intervém e vence dois oponentes enfraquecidos",
  "invertida": "Uma falha. Derrota de um oponente mais fraco. Tentativa frustrada de tomar uma decisão definitiva.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 449
 },
 {
  "carta": "Quatro de Espadas",
  "base": "Restrição. Um espaço limitado para o desenvolvimento e para manobra. Tentar pressionar para vencer restrições. Potenciais de crescimento depois que limitações atuais diminuírem.",
  "invertida": "Confinamento e bloqueio. Falta de motivação ou energia para sair de uma situação limitada.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 449
 },
 {
  "carta": "Cinco de Espadas",
  "base": "Ruptura. Um impulso para a frente que supera os limites existentes. Manter o ânimo numa situação difícil. Fazer as coisas do próprio jeito.",
  "invertida": "Uma iniciativa inútil para mudar a situação. Teimosia que não leva a lugar nenhum. Fatores opressivos não podem ser eliminados no momento.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 449
 },
 {
  "carta": "Seis de Espadas",
  "base": "Adaptação. Aceitar limitações e adaptar-se a elas. Respeitar a ordem presente. Comprometer-se a fim de tirar o melhor proveito da situação.",
  "invertida": "Resignação, renúncia, desistir da ambição para mudar as coisas para melhor. Falta de espírito de luta.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 449
 },
 {
  "carta": "Sete de Espadas",
  "base": "Sagacidade. Atitude focada e determinação. Concentrar-se num objetivo claro e fazer o que for preciso para alcançá-lo. Vencer uma luta com probabilidades equilibradas.",
  "invertida": "Uma visão estreita e egocêntrica. Investir os esforços e recursos de alguém numa causa perdida.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 450
 },
 {
  "carta": "Oito de Espadas",
  "base": "Defesas. Erguer escudos e bloqueios. Mecanismos de defesa psicológica. Necessidade de estar no controle total. Um tesouro bem guardado. Entrar nos domínios de outra pessoa com a permissão dela.",
  "invertida": "Similar.",
  "invertida_similar": true,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 450
 },
 {
  "carta": "Nove de Espadas",
  "base": "Coragem. Vencer uma luta contra uma força superior. Intenções puras. Fazer bom uso de meios imperfeitos.",
  "invertida": "Perder contra um oponente mais forte. Desleixo. Preparativos imperfeitos para vencer um desafio.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 450
 },
 {
  "carta": "Dez de Espadas",
  "base": "Exaustão. Uma situação complexa com muitos interesses conflitantes. Uma longa batalha sem um resultado claro. Necessidade de encontrar um aliado que queira atacar o problema de um ponto de vista diferente.",
  "invertida": "Imobilidade. Impossibilidade de mudança no momento. Sentimento de ser atacado por todos os lados. Uma derrota dolorosa e humilhante.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 450
 },
 {
  "carta": "Valete de Espadas",
  "base": "Preparação para um desafio futuro. Buscar conciliar razão e desejos intensos. Hesitação em usar o próprio poder.",
  "invertida": "Confusão, pensamentos negativos e inibidores, autossabotagem. O mau uso das próprias ferramentas pode causar danos.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 450
 },
 {
  "carta": "Cavaleiro de Espadas",
  "base": "Energia e recursos para avançar. Ainda procurando a direção certa. Pairar acima das restrições práticas. Determinação e perseverança.",
  "invertida": "Tentar impor as próprias opiniões equivocadas. Insistir numa direção errada. Perder o contato com a realidade.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 450
 },
 {
  "carta": "Rainha de Espadas",
  "base": "Uma posição segura e protegida. Defender o próprio território. Preparação para algo que ainda não deve ser exposto.",
  "invertida": "Atitude defensiva e rigidez. Suspeita e ideias fixas bloqueando o avanço e impedindo novas conexões.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 451
 },
 {
  "carta": "Rei de Espadas",
  "base": "Determinação em romper com o passado. Força de vontade. Sentir-se preparado para lidar com a incerteza. Sabedoria e maturidade intelectual.",
  "invertida": "Um coração dividido. A necessidade de romper com algo ao qual ainda se está ligado. Calcular demais numa tentativa vã de superar a incerteza.",
  "invertida_similar": false,
  "fonte": "Ben-Dov, O Tarô de Marselha Revelado",
  "pagina": 451
 }
]
