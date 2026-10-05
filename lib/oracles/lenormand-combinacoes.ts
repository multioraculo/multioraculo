/**
 * GERADO POR scripts/extrair-lenormand.mjs — NÃO EDITAR À MÃO.
 *
 * As COMBINAÇÕES do léxico de Caitlín Matthews, The Complete Lenormand Oracle Handbook (Destiny Books), cap. 2 (Lenormand Lexicon),
 * uma entrada por combinação glosada, na ordem em que a fonte a escreve.
 * Extraído em 2026-10-05. sha256 do PDF: a5cbdaadfb0aeb0bcd3999a20c5dbec2ebe346d60edae0046479bdb0d6c542db
 *
 * A ORDEM É O SENTIDO. O livro afirma, na ficha da Raposa: "When Fox comes
 * before a card, it will affect what follows more severely, so Fox + Fish means
 * that something is seriously up with your money, whereas Fish + Fox is saying
 * you received the wrong change." Dos pares que aparecem nas duas direções,
 * NENHUM repete o texto. Por isso `cartas` é uma lista ORDENADA e nada aqui
 * simetriza: a ausência de A→B não é suprida por B→A.
 *
 * NÃO ESTÃO AQUI as entradas "X on House of Y": são o sistema de CASAS do Grand
 * Tableau, outro método e outra mesa.
 *
 * `qualificadores` só é preenchido para Nuvens e Foice, as duas cartas cuja
 * direção na arte muda o sentido segundo a fonte (p. 62, 71 e 159).
 */

export type CombinacaoLenormand = {
  /** índices em LENORMAND_DECK, NA ORDEM DA FONTE: cartas[0] age sobre cartas[1] */
  cartas: number[]
  /** "L", "R" ou "" por carta, na mesma ordem */
  qualificadores: string[]
  glosa: string
  /** página do PDF */
  pagina: number
  /** índice da carta em cuja ficha a entrada está impressa */
  dono: number
}

export const LENORMAND_COMBINACOES_FONTE = "Caitlín Matthews, The Complete Lenormand Oracle Handbook (Destiny Books), cap. 2 (Lenormand Lexicon)"
export const LENORMAND_COMBINACOES_PDF_SHA256 = "a5cbdaadfb0aeb0bcd3999a20c5dbec2ebe346d60edae0046479bdb0d6c542db"

export const LENORMAND_COMBINACOES: CombinacaoLenormand[] = [
 {
  "dono": 0,
  "cartas": [
   0,
   4
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Health news; make haste slowly; a rose-tree arrives",
  "pagina": 63
 },
 {
  "dono": 0,
  "cartas": [
   0,
   10
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Inflammatory news; aggressive visitors; a repeated news bulletin",
  "pagina": 63
 },
 {
  "dono": 0,
  "cartas": [
   0,
   19
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Public announcement; openly witnessed; social news",
  "pagina": 63
 },
 {
  "dono": 0,
  "cartas": [
   0,
   23
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Longed-for news; matchmaker; loving initiation",
  "pagina": 63
 },
 {
  "dono": 0,
  "cartas": [
   0,
   30
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Happy news; holidaying in haste; optimistic message",
  "pagina": 63
 },
 {
  "dono": 0,
  "cartas": [
   0,
   19,
   24
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Engaged for public appearances",
  "pagina": 63
 },
 {
  "dono": 1,
  "cartas": [
   1,
   6
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Short-term complications; rivals in the game; a tempting chance",
  "pagina": 65
 },
 {
  "dono": 1,
  "cartas": [
   1,
   18
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Official lottery; high good humor; an ambitious gamble",
  "pagina": 65
 },
 {
  "dono": 1,
  "cartas": [
   1,
   16
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Migrating opportunistically; changes for the better",
  "pagina": 65
 },
 {
  "dono": 1,
  "cartas": [
   1,
   12
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Opening gambit; naive humor; childish spon taneity",
  "pagina": 65
 },
 {
  "dono": 1,
  "cartas": [
   1,
   26
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "News of a small win; list of chances; results of the game",
  "pagina": 65
 },
 {
  "dono": 1,
  "cartas": [
   1,
   29,
   24
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Carefree elder weds; lucky winter connection",
  "pagina": 65
 },
 {
  "dono": 2,
  "cartas": [
   2,
   10
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Repeated trips; abusive transaction; marathon run",
  "pagina": 66
 },
 {
  "dono": 2,
  "cartas": [
   2,
   21
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Bus; choice of journey; alternative vehicle",
  "pagina": 66
 },
 {
  "dono": 2,
  "cartas": [
   2,
   23
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Wanderlust; favorite vehicle; affectionate motivation",
  "pagina": 66
 },
 {
  "dono": 2,
  "cartas": [
   2,
   29
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Veteran marine; old vessel; winter shipment",
  "pagina": 66
 },
 {
  "dono": 2,
  "cartas": [
   2,
   35,
   14
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Moving into a critical period of power",
  "pagina": 66
 },
 {
  "dono": 3,
  "cartas": [
   3,
   16
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Changing the brand; moving house; restlessly uncomfortable",
  "pagina": 68
 },
 {
  "dono": 3,
  "cartas": [
   3,
   19
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Tent; communal living; open house",
  "pagina": 68
 },
 {
  "dono": 3,
  "cartas": [
   3,
   14
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Powerful family; extending your house; protecting family values",
  "pagina": 68
 },
 {
  "dono": 3,
  "cartas": [
   3,
   35
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Church; synagogue; mosque; holy place; retreat center",
  "pagina": 68
 },
 {
  "dono": 3,
  "cartas": [
   3,
   26,
   31
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "House deeds recognized; license to work from home",
  "pagina": 68
 },
 {
  "dono": 3,
  "cartas": [
   3,
   21,
   33
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Living between two places in order to earn more",
  "pagina": 68
 },
 {
  "dono": 4,
  "cartas": [
   4,
   9
  ],
  "qualificadores": [
   "",
   "R"
  ],
  "glosa": "Tree surgeon",
  "pagina": 70
 },
 {
  "dono": 4,
  "cartas": [
   4,
   9
  ],
  "qualificadores": [
   "",
   "L"
  ],
  "glosa": "Health danger",
  "pagina": 70
 },
 {
  "dono": 4,
  "cartas": [
   4,
   13
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Lying about your health; misdiagnosis; deceptive health",
  "pagina": 70
 },
 {
  "dono": 4,
  "cartas": [
   4,
   23
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Loving patience; emotional period; favorite tree",
  "pagina": 70
 },
 {
  "dono": 4,
  "cartas": [
   4,
   15
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Shamanism; wisdom of ancestors; clean bill of health",
  "pagina": 70
 },
 {
  "dono": 4,
  "cartas": [
   4,
   20
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Blocked growth; a long delay; a clogged network",
  "pagina": 70
 },
 {
  "dono": 4,
  "cartas": [
   4,
   18,
   11
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Nervous about going to hospital",
  "pagina": 70
 },
 {
  "dono": 5,
  "cartas": [
   5,
   8
  ],
  "qualificadores": [
   "R",
   ""
  ],
  "glosa": "Surprise depression; designer confusion",
  "pagina": 71
 },
 {
  "dono": 5,
  "cartas": [
   5,
   13
  ],
  "qualificadores": [
   "R",
   ""
  ],
  "glosa": "Vigilantly doubtful; kleptomaniac; taking advan tage of confusion",
  "pagina": 71
 },
 {
  "dono": 5,
  "cartas": [
   5,
   16
  ],
  "qualificadores": [
   "L",
   ""
  ],
  "glosa": "Changes clarified; confusions about adoption improve",
  "pagina": 72
 },
 {
  "dono": 5,
  "cartas": [
   5,
   21
  ],
  "qualificadores": [
   "L",
   ""
  ],
  "glosa": "Alternative questions; bipolar condition; of two minds",
  "pagina": 72
 },
 {
  "dono": 5,
  "cartas": [
   5,
   23
  ],
  "qualificadores": [
   "R",
   ""
  ],
  "glosa": "Battle between heart and head; manic condition",
  "pagina": 72
 },
 {
  "dono": 5,
  "cartas": [
   5,
   16,
   34
  ],
  "qualificadores": [
   "L",
   "",
   ""
  ],
  "glosa": "Confusions due to a move begin to settle down",
  "pagina": 72
 },
 {
  "dono": 6,
  "cartas": [
   6,
   13
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Manipulative deceit; a whistleblower; lying divorcee",
  "pagina": 73
 },
 {
  "dono": 6,
  "cartas": [
   6,
   18
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Official complications; bureaucratic betrayal; fe male executive",
  "pagina": 73
 },
 {
  "dono": 6,
  "cartas": [
   6,
   20
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Inaccessible complexities; remote mistress",
  "pagina": 73
 },
 {
  "dono": 6,
  "cartas": [
   6,
   28
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Fascinating; career or professional woman",
  "pagina": 74
 },
 {
  "dono": 6,
  "cartas": [
   6,
   30
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Merry widow; complications melt away; successful rival",
  "pagina": 74
 },
 {
  "dono": 6,
  "cartas": [
   6,
   8,
   14
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "An intelligent woman receives award as a matriarch",
  "pagina": 74
 },
 {
  "dono": 7,
  "cartas": [
   7,
   4
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Poor health; a long drawn-out end; depleted vigor",
  "pagina": 75
 },
 {
  "dono": 7,
  "cartas": [
   7,
   11
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Anxious about a deadline; voicelessness; a rumored death",
  "pagina": 75
 },
 {
  "dono": 7,
  "cartas": [
   7,
   21
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Paths of the dead; no through road; dead end; choices void",
  "pagina": 75
 },
 {
  "dono": 7,
  "cartas": [
   7,
   35
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Critical illness; relinquishing your faith; accepting your fate",
  "pagina": 76
 },
 {
  "dono": 7,
  "cartas": [
   7,
   27
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Lugubrious fellow; mortician; an ill man",
  "pagina": 76
 },
 {
  "dono": 7,
  "cartas": [
   7,
   11,
   5
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Problems arising from bad wording",
  "pagina": 76
 },
 {
  "dono": 8,
  "cartas": [
   8,
   5
  ],
  "qualificadores": [
   "",
   "L"
  ],
  "glosa": "Smudged paintwork; unclear design; clouded pleasure",
  "pagina": 77
 },
 {
  "dono": 8,
  "cartas": [
   8,
   9
  ],
  "qualificadores": [
   "",
   "R"
  ],
  "glosa": "Sudden invitation; strikingly beautiful; col lecting a gift",
  "pagina": 77
 },
 {
  "dono": 8,
  "cartas": [
   8,
   21
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Choice of gifts; many perfumes; alternative selec tion",
  "pagina": 77
 },
 {
  "dono": 8,
  "cartas": [
   8,
   25
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Charm school; secret aptitude; teaching art",
  "pagina": 77
 },
 {
  "dono": 8,
  "cartas": [
   8,
   32
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Important skill; chief pleasure, certainly perfumed",
  "pagina": 77
 },
 {
  "dono": 8,
  "cartas": [
   8,
   27,
   2
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "A gift from a stranger or foreigner",
  "pagina": 77
 },
 {
  "dono": 9,
  "cartas": [
   9,
   8
  ],
  "qualificadores": [
   "L",
   ""
  ],
  "glosa": "Selection of knives",
  "pagina": 79
 },
 {
  "dono": 9,
  "cartas": [
   9,
   8
  ],
  "qualificadores": [
   "R",
   ""
  ],
  "glosa": "Breaking the gift",
  "pagina": 79
 },
 {
  "dono": 9,
  "cartas": [
   9,
   13
  ],
  "qualificadores": [
   "L",
   ""
  ],
  "glosa": "Vigilant pruner",
  "pagina": 79
 },
 {
  "dono": 9,
  "cartas": [
   9,
   13
  ],
  "qualificadores": [
   "R",
   ""
  ],
  "glosa": "Stealthy violence",
  "pagina": 79
 },
 {
  "dono": 9,
  "cartas": [
   9,
   21
  ],
  "qualificadores": [
   "R",
   ""
  ],
  "glosa": "Irrevocable decision: alternative operation; road accident",
  "pagina": 79
 },
 {
  "dono": 9,
  "cartas": [
   9,
   23
  ],
  "qualificadores": [
   "R",
   ""
  ],
  "glosa": "Heart-break; severed affections; dangerous love",
  "pagina": 79
 },
 {
  "dono": 9,
  "cartas": [
   9,
   34
  ],
  "qualificadores": [
   "R",
   ""
  ],
  "glosa": "Stability endangered",
  "pagina": 79
 },
 {
  "dono": 9,
  "cartas": [
   9,
   34
  ],
  "qualificadores": [
   "L",
   ""
  ],
  "glosa": "Safely harvested",
  "pagina": 79
 },
 {
  "dono": 9,
  "cartas": [
   9,
   29,
   11
  ],
  "qualificadores": [
   "L",
   "",
   ""
  ],
  "glosa": "Collecting the sayings of elders",
  "pagina": 79
 },
 {
  "dono": 10,
  "cartas": [
   10,
   0
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Speedy rhetoric; agent provocateur; news of aggres sion",
  "pagina": 80
 },
 {
  "dono": 10,
  "cartas": [
   10,
   2
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Sex between strangers; foreigner’s question; repeated travel",
  "pagina": 81
 },
 {
  "dono": 10,
  "cartas": [
   10,
   17
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Investigative policeman; lawyer for the defense",
  "pagina": 81
 },
 {
  "dono": 10,
  "cartas": [
   10,
   31
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Night exercise; working in research; honorably persuasive",
  "pagina": 81
 },
 {
  "dono": 10,
  "cartas": [
   10,
   8,
   28
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Repeatedly seeking for a gift for your girlfriend",
  "pagina": 81
 },
 {
  "dono": 11,
  "cartas": [
   11,
   7
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Concluding talks; ending the call; termination of a pregnancy",
  "pagina": 82
 },
 {
  "dono": 11,
  "cartas": [
   11,
   8
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Fashionable talk; popular achievement; plea surable tattle",
  "pagina": 82
 },
 {
  "dono": 11,
  "cartas": [
   11,
   12
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Childish babble; baby talk; naive phone call",
  "pagina": 82
 },
 {
  "dono": 11,
  "cartas": [
   11,
   19
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Panic attack; agoraphobia; performance anxiety",
  "pagina": 82
 },
 {
  "dono": 11,
  "cartas": [
   11,
   22
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Understated; libelous; interference on the phone",
  "pagina": 82
 },
 {
  "dono": 11,
  "cartas": [
   11,
   20
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Tongue-tied; dumb; speech impediment",
  "pagina": 82
 },
 {
  "dono": 11,
  "cartas": [
   11,
   31,
   34
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "A reliable evening lecturer",
  "pagina": 82
 },
 {
  "dono": 12,
  "cartas": [
   12,
   1
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Playful student; carefree infant; a lucky start",
  "pagina": 84
 },
 {
  "dono": 12,
  "cartas": [
   12,
   5
  ],
  "qualificadores": [
   "",
   "L"
  ],
  "glosa": "Depressed child; overcast beginning; confused trust",
  "pagina": 84
 },
 {
  "dono": 12,
  "cartas": [
   12,
   8
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Surprise baby; small gift; beginner’s award",
  "pagina": 84
 },
 {
  "dono": 12,
  "cartas": [
   12,
   14
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Empowering the children; a powerful beginning",
  "pagina": 84
 },
 {
  "dono": 12,
  "cartas": [
   12,
   11
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Twins; siblings; gossiping about a child",
  "pagina": 84
 },
 {
  "dono": 12,
  "cartas": [
   12,
   21,
   2
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Beginning of an overseas venture",
  "pagina": 84
 },
 {
  "dono": 13,
  "cartas": [
   13,
   8
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Taking advantage of the gift; a stealthy gift; surpris ingly cunning",
  "pagina": 85
 },
 {
  "dono": 13,
  "cartas": [
   13,
   9
  ],
  "qualificadores": [
   "",
   "L"
  ],
  "glosa": "Cutting to the chase; sleight of hand trick; shock ing theft",
  "pagina": 85
 },
 {
  "dono": 13,
  "cartas": [
   13,
   5
  ],
  "qualificadores": [
   "",
   "L"
  ],
  "glosa": "Smokescreen scam; camouflaging a trick; covert lie",
  "pagina": 85
 },
 {
  "dono": 13,
  "cartas": [
   13,
   25
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Secretly underhanded; educational scam; arcane lar ceny",
  "pagina": 85
 },
 {
  "dono": 13,
  "cartas": [
   13,
   35
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Comeuppance for a thief; deceitful doctrine; priestly imposter",
  "pagina": 85
 },
 {
  "dono": 13,
  "cartas": [
   13,
   3,
   22,
   33
  ],
  "qualificadores": [
   "",
   "",
   "",
   ""
  ],
  "glosa": "A burglary; a doorstep scammer comes to take your cash",
  "pagina": 85
 },
 {
  "dono": 14,
  "cartas": [
   14,
   2
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "A traveling stage manager; a foreign power; transport baron",
  "pagina": 87
 },
 {
  "dono": 14,
  "cartas": [
   14,
   12
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "A naive benefactor; small strength; an inexperienced boss",
  "pagina": 87
 },
 {
  "dono": 14,
  "cartas": [
   14,
   22
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Slimming; reducing in strength; undercutting power",
  "pagina": 87
 },
 {
  "dono": 14,
  "cartas": [
   14,
   33
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Benefactor; patron or matron; financial investor",
  "pagina": 87
 },
 {
  "dono": 14,
  "cartas": [
   14,
   35
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Force majeure; overwhelming burden; critical re sources",
  "pagina": 87
 },
 {
  "dono": 14,
  "cartas": [
   14,
   15,
   30
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Large supernova; philanthropist gives largesse",
  "pagina": 87
 },
 {
  "dono": 15,
  "cartas": [
   15,
   5
  ],
  "qualificadores": [
   "",
   "L"
  ],
  "glosa": "Without guidance; blinded; in a dream or fog",
  "pagina": 88
 },
 {
  "dono": 15,
  "cartas": [
   15,
   5
  ],
  "qualificadores": [
   "",
   "R"
  ],
  "glosa": "Inspiration emerges; an emerging science; elec tricity restored",
  "pagina": 88
 },
 {
  "dono": 15,
  "cartas": [
   15,
   20
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Blocked guidance; hermetic vision; remote outer space",
  "pagina": 88
 },
 {
  "dono": 15,
  "cartas": [
   15,
   23
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "A blessed love; affectionate guidance; passionately inspired",
  "pagina": 89
 },
 {
  "dono": 15,
  "cartas": [
   15,
   34,
   31
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Electrifying the security system at work",
  "pagina": 89
 },
 {
  "dono": 16,
  "cartas": [
   16,
   10
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Continual changes; aggravated by movement; re peated return",
  "pagina": 90
 },
 {
  "dono": 16,
  "cartas": [
   16,
   17
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Birth companion; faithful return; compliant with the changes",
  "pagina": 90
 },
 {
  "dono": 16,
  "cartas": [
   16,
   33
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Financial changes; a fluid movement; transactional changes",
  "pagina": 90
 },
 {
  "dono": 16,
  "cartas": [
   16,
   4,
   20
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Moving for a long time to reach the bor der",
  "pagina": 90
 },
 {
  "dono": 16,
  "cartas": [
   16,
   12,
   29
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "New winter season stock; elder becomes a grandparent",
  "pagina": 90
 },
 {
  "dono": 16,
  "cartas": [
   4,
   20,
   16
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Health hold-ups improve",
  "pagina": 90
 },
 {
  "dono": 17,
  "cartas": [
   17,
   3
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "A family friend; in-house support; brand loyalty",
  "pagina": 91
 },
 {
  "dono": 17,
  "cartas": [
   17,
   10
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Police investigation; forensic technician; argumen tative friend",
  "pagina": 91
 },
 {
  "dono": 17,
  "cartas": [
   17,
   13
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "A frenemy; deceiving friend; manipulating the friend ship",
  "pagina": 92
 },
 {
  "dono": 17,
  "cartas": [
   17,
   16
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Changing friends; some proactive help; birth of a friendship",
  "pagina": 92
 },
 {
  "dono": 17,
  "cartas": [
   17,
   19
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Social network friends; openly friendly; public sup port",
  "pagina": 92
 },
 {
  "dono": 17,
  "cartas": [
   17,
   29
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Protective custody; help in winter; elderly friend",
  "pagina": 92
 },
 {
  "dono": 17,
  "cartas": [
   17,
   30,
   35
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "The end of a happy friendship",
  "pagina": 92
 },
 {
  "dono": 18,
  "cartas": [
   18,
   19
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Public duty; municipal building; communal apart ments",
  "pagina": 93
 },
 {
  "dono": 18,
  "cartas": [
   18,
   25
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Publishing house; institutional directory; doing it by the book",
  "pagina": 93
 },
 {
  "dono": 18,
  "cartas": [
   18,
   24
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Bound to bureaucracy; contracted to the institution, company groupie",
  "pagina": 93
 },
 {
  "dono": 18,
  "cartas": [
   18,
   30
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Confident government; successful business; happy official",
  "pagina": 93
 },
 {
  "dono": 18,
  "cartas": [
   18,
   11,
   0
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "An official announcement is sent out",
  "pagina": 93
 },
 {
  "dono": 19,
  "cartas": [
   19,
   16
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Change of venue",
  "pagina": 95
 },
 {
  "dono": 19,
  "cartas": [
   16,
   19
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Lots of moves or changes",
  "pagina": 95
 },
 {
  "dono": 19,
  "cartas": [
   19,
   18
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "High society; officialdom at play; office party",
  "pagina": 95
 },
 {
  "dono": 19,
  "cartas": [
   19,
   24
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Public engagement; booking a venue; bound to ap pear socially",
  "pagina": 95
 },
 {
  "dono": 19,
  "cartas": [
   19,
   25
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "A book in public domain or out of copyright; book group",
  "pagina": 95
 },
 {
  "dono": 19,
  "cartas": [
   19,
   27
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Gardener; a men’s club; humanity",
  "pagina": 95
 },
 {
  "dono": 19,
  "cartas": [
   19,
   33
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Casino; green investment; public funds; financial world",
  "pagina": 95
 },
 {
  "dono": 19,
  "cartas": [
   19,
   35,
   16
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "A public crisis that requires improvement",
  "pagina": 95
 },
 {
  "dono": 20,
  "cartas": [
   20,
   6
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Complicated delays; jealously estranged; treacherous enemy",
  "pagina": 96
 },
 {
  "dono": 20,
  "cartas": [
   20,
   11
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Nervous about border control; talking remotely",
  "pagina": 97
 },
 {
  "dono": 20,
  "cartas": [
   20,
   17
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "A far-off friend; separated from your companion",
  "pagina": 97
 },
 {
  "dono": 20,
  "cartas": [
   20,
   31
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Keeping remote from the limelight; honorable retirement",
  "pagina": 97
 },
 {
  "dono": 20,
  "cartas": [
   20,
   24,
   33
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "A delayed financial agreement",
  "pagina": 97
 },
 {
  "dono": 21,
  "cartas": [
   21,
   1
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "A lucky approach; risky alternatives; footloose and fancy-free",
  "pagina": 98
 },
 {
  "dono": 21,
  "cartas": [
   21,
   25
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Alternative teaching; substitute teacher; specialized knowledge",
  "pagina": 98
 },
 {
  "dono": 21,
  "cartas": [
   21,
   5
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Unclear route; foggy road; confusing choice",
  "pagina": 98
 },
 {
  "dono": 21,
  "cartas": [
   21,
   7
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "No alternatives; end of the road; path of sickness",
  "pagina": 98
 },
 {
  "dono": 21,
  "cartas": [
   21,
   6
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Winding road; complex alternatives; choosing jeal ousy",
  "pagina": 98
 },
 {
  "dono": 21,
  "cartas": [
   21,
   20
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Mountain trail; blocked road; delay on the high way",
  "pagina": 98
 },
 {
  "dono": 21,
  "cartas": [
   21,
   33,
   29
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "A fiscally mature approach; map of the old river",
  "pagina": 98
 },
 {
  "dono": 22,
  "cartas": [
   22,
   4
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Diminished growth; stressful conditions; plant infes tation",
  "pagina": 100
 },
 {
  "dono": 22,
  "cartas": [
   22,
   18
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Office pilfering; public resources decrease",
  "pagina": 100
 },
 {
  "dono": 22,
  "cartas": [
   22,
   26
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "News of a mob; information about vermin; diet sheet",
  "pagina": 100
 },
 {
  "dono": 22,
  "cartas": [
   22,
   30
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "A stolen day; improvement after loss; light upon the mess",
  "pagina": 100
 },
 {
  "dono": 22,
  "cartas": [
   22,
   35
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "A severe loss",
  "pagina": 100
 },
 {
  "dono": 22,
  "cartas": [
   35,
   22
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Warning of loss; a bur den whittled down",
  "pagina": 100
 },
 {
  "dono": 22,
  "cartas": [
   22,
   34
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Loss of stability; lifestyle erosion; stable weight loss",
  "pagina": 100
 },
 {
  "dono": 22,
  "cartas": [
   22,
   25,
   28
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "A librarian’s worries; a woman’s book worm problem",
  "pagina": 100
 },
 {
  "dono": 23,
  "cartas": [
   23,
   2
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Wanderlust; blow-in lover; yearning for love",
  "pagina": 102
 },
 {
  "dono": 23,
  "cartas": [
   23,
   7
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "End of the affair; a deadly love; heart disease",
  "pagina": 102
 },
 {
  "dono": 23,
  "cartas": [
   23,
   12
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Trustfully given; newly responsive; uncomplicated love",
  "pagina": 102
 },
 {
  "dono": 23,
  "cartas": [
   23,
   22
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Vampire; disappointed in love; diminished affection",
  "pagina": 102
 },
 {
  "dono": 23,
  "cartas": [
   23,
   33
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Flow of emotions; financially passionate; gushing love",
  "pagina": 102
 },
 {
  "dono": 23,
  "cartas": [
   23,
   20,
   0
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "A gay man isolated from love",
  "pagina": 102
 },
 {
  "dono": 24,
  "cartas": [
   24,
   2
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Shipping contract; foreign agreement; soul connec tion",
  "pagina": 103
 },
 {
  "dono": 24,
  "cartas": [
   24,
   14
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Forced marriage; a powerful bond; protective custody",
  "pagina": 103
 },
 {
  "dono": 24,
  "cartas": [
   24,
   20
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Delayed agreement; remote connection; obsta cles to union",
  "pagina": 103
 },
 {
  "dono": 24,
  "cartas": [
   24,
   3,
   16
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Agreeing on a change of abode",
  "pagina": 103
 },
 {
  "dono": 25,
  "cartas": [
   25,
   1
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Opening a (gambling) book to bet on something",
  "pagina": 105
 },
 {
  "dono": 25,
  "cartas": [
   25,
   5
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Ignorance; muddled knowledge; crazy wisdom",
  "pagina": 105
 },
 {
  "dono": 25,
  "cartas": [
   25,
   14
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Mastering wisdom; protecting the secret; grandma’s know-how",
  "pagina": 105
 },
 {
  "dono": 25,
  "cartas": [
   25,
   16
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Translating a codex; a seasonal book; an animated book",
  "pagina": 105
 },
 {
  "dono": 25,
  "cartas": [
   25,
   26
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Index; examination book; advertising catalogue",
  "pagina": 105
 },
 {
  "dono": 25,
  "cartas": [
   25,
   34
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "A sustaining book; secrets secure; sticking by the book",
  "pagina": 105
 },
 {
  "dono": 25,
  "cartas": [
   25,
   6,
   19
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "jealous secrets become public",
  "pagina": 105
 },
 {
  "dono": 26,
  "cartas": [
   26,
   4
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Prescription; health news; family document",
  "pagina": 106
 },
 {
  "dono": 26,
  "cartas": [
   26,
   9
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Indictment; notice to quit; wounding letter",
  "pagina": 106
 },
 {
  "dono": 26,
  "cartas": [
   26,
   2
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Holiday post card; text message; foreign letter",
  "pagina": 106
 },
 {
  "dono": 26,
  "cartas": [
   26,
   6,
   18
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Official complications with your passport",
  "pagina": 106
 },
 {
  "dono": 26,
  "cartas": [
   26,
   9,
   11
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "A missive creating dangerous disquiet",
  "pagina": 106
 },
 {
  "dono": 26,
  "cartas": [
   26,
   15,
   28
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "A female tarot reader; reading cards for a woman",
  "pagina": 106
 },
 {
  "dono": 27,
  "cartas": [
   27,
   1
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Gambler; risk taker; lucky fellow",
  "pagina": 107
 },
 {
  "dono": 27,
  "cartas": [
   27,
   14
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "A fat or powerful man; a drag queen",
  "pagina": 107
 },
 {
  "dono": 27,
  "cartas": [
   27,
   15
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "A scientist; a charismatic man; an astronomer",
  "pagina": 107
 },
 {
  "dono": 27,
  "cartas": [
   27,
   4,
   21
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "A diagnostic physician; an ancestor’s road",
  "pagina": 107
 },
 {
  "dono": 27,
  "cartas": [
   27,
   35
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "A priest; a rabbi; a monk; an embittered man",
  "pagina": 107
 },
 {
  "dono": 28,
  "cartas": [
   28,
   5
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Confused woman; crazy lady; depressed about womanhood",
  "pagina": 108
 },
 {
  "dono": 28,
  "cartas": [
   28,
   8
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Elegant woman; stylish femininity; skilled woman",
  "pagina": 108
 },
 {
  "dono": 28,
  "cartas": [
   28,
   9
  ],
  "qualificadores": [
   "",
   "L"
  ],
  "glosa": "Menopause; surgery for a woman; suddenly sensitive",
  "pagina": 108
 },
 {
  "dono": 28,
  "cartas": [
   28,
   10
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Abortion; recurrent miscarriages; argumentative fe male",
  "pagina": 108
 },
 {
  "dono": 28,
  "cartas": [
   28,
   25
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Educated woman; author; teacher; female stranger",
  "pagina": 108
 },
 {
  "dono": 28,
  "cartas": [
   28,
   1,
   4
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "A woman risks her health",
  "pagina": 108
 },
 {
  "dono": 29,
  "cartas": [
   29,
   2
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Traveling peacemaker; foreign elder; yearning for matu rity",
  "pagina": 110
 },
 {
  "dono": 29,
  "cartas": [
   29,
   7
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Celibacy; age cut-off point; freezing point",
  "pagina": 110
 },
 {
  "dono": 29,
  "cartas": [
   29,
   12
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "A virgin; inexperienced elder; new this winter",
  "pagina": 110
 },
 {
  "dono": 29,
  "cartas": [
   29,
   19
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Public protection; communal discretion; elder’s show",
  "pagina": 110
 },
 {
  "dono": 29,
  "cartas": [
   29,
   30
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Happy old age; maturing confidently; melting the snow",
  "pagina": 110
 },
 {
  "dono": 29,
  "cartas": [
   29,
   23,
   14
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Constant love and protection; grandparental affection",
  "pagina": 110
 },
 {
  "dono": 30,
  "cartas": [
   30,
   3
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Domestic happiness",
  "pagina": 111
 },
 {
  "dono": 30,
  "cartas": [
   3,
   30
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Summer house",
  "pagina": 111
 },
 {
  "dono": 30,
  "cartas": [
   30,
   4
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Recovery of health; growing warmer; tree lights",
  "pagina": 111
 },
 {
  "dono": 30,
  "cartas": [
   30,
   7
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Solstice; eclipse; happiness ends",
  "pagina": 111
 },
 {
  "dono": 30,
  "cartas": [
   30,
   11
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Talking about a holiday; sound and light display; ner vous of sunburn",
  "pagina": 111
 },
 {
  "dono": 30,
  "cartas": [
   30,
   35
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Critical heat; a bomb; spiritual mitigation",
  "pagina": 111
 },
 {
  "dono": 30,
  "cartas": [
   30,
   32,
   6
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Confidence is the key to sophistication",
  "pagina": 111
 },
 {
  "dono": 31,
  "cartas": [
   31,
   1
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Lucky intuition; gambling addict; a brief honor",
  "pagina": 113
 },
 {
  "dono": 31,
  "cartas": [
   31,
   0
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Visiting worker; delivery at work; recognized couri er",
  "pagina": 113
 },
 {
  "dono": 31,
  "cartas": [
   31,
   6
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Complex work; notoriety; jealous of reputation",
  "pagina": 113
 },
 {
  "dono": 31,
  "cartas": [
   31,
   19
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Public celebrity; an all-night party; common recognition",
  "pagina": 113
 },
 {
  "dono": 31,
  "cartas": [
   31,
   24
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Phases of the moon; contract to work; promise of celebrity",
  "pagina": 113
 },
 {
  "dono": 31,
  "cartas": [
   31,
   13,
   20
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Limited by manipulative work condi tions",
  "pagina": 113
 },
 {
  "dono": 32,
  "cartas": [
   32,
   19
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Public breakthrough; community revelation; public release",
  "pagina": 114
 },
 {
  "dono": 32,
  "cartas": [
   32,
   13
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "The wrong door; a lying answer; stealthy solution; lock smith",
  "pagina": 115
 },
 {
  "dono": 32,
  "cartas": [
   32,
   4
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Well-being is paramount; notable ancestors; system- ically tuned",
  "pagina": 115
 },
 {
  "dono": 32,
  "cartas": [
   32,
   30
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Warm assent; holiday allowance; electronic key",
  "pagina": 115
 },
 {
  "dono": 32,
  "cartas": [
   32,
   21,
   34
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Pivotal decision for security; unlocking the failsafe",
  "pagina": 115
 },
 {
  "dono": 33,
  "cartas": [
   33,
   0
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Financial news; speedy money; cash courier",
  "pagina": 116
 },
 {
  "dono": 33,
  "cartas": [
   33,
   2
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Overseas trade; export trading; foreign transaction",
  "pagina": 116
 },
 {
  "dono": 33,
  "cartas": [
   33,
   4
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Health spa; growth of abundance; long-term invest ment",
  "pagina": 116
 },
 {
  "dono": 33,
  "cartas": [
   33,
   10
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Arguing about money; financial discussion; fiscal investigation",
  "pagina": 116
 },
 {
  "dono": 33,
  "cartas": [
   33,
   15
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Dreams of riches or abundance; clarity about money",
  "pagina": 116
 },
 {
  "dono": 33,
  "cartas": [
   33,
   32
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Credit card; sure money or returns; chief fund or ac count",
  "pagina": 116
 },
 {
  "dono": 33,
  "cartas": [
   33,
   0,
   15
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Instant electronic money transfer",
  "pagina": 116
 },
 {
  "dono": 34,
  "cartas": [
   34,
   1
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Upturn stabilizes; fortunate connection; making light of routine",
  "pagina": 118
 },
 {
  "dono": 34,
  "cartas": [
   34,
   2
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Yearning for stability; travel insurance; foreign protection",
  "pagina": 118
 },
 {
  "dono": 34,
  "cartas": [
   34,
   18
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Immoveable; official position; institutional secu rity; stable government",
  "pagina": 118
 },
 {
  "dono": 34,
  "cartas": [
   34,
   22
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Diminished standards; worries about safety",
  "pagina": 118
 },
 {
  "dono": 34,
  "cartas": [
   34,
   25
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Discreetly unchanging; educationally persevering",
  "pagina": 118
 },
 {
  "dono": 34,
  "cartas": [
   34,
   32
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Unlocking the chains; key-holder security; essential standards",
  "pagina": 118
 },
 {
  "dono": 34,
  "cartas": [
   34,
   18,
   29
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Commitments lead to a lonely old age",
  "pagina": 118
 },
 {
  "dono": 35,
  "cartas": [
   35,
   10
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Repressive cult; austere practices; disruptive priest",
  "pagina": 120
 },
 {
  "dono": 35,
  "cartas": [
   35,
   18
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "One God; towering crisis; almighty challenge",
  "pagina": 120
 },
 {
  "dono": 35,
  "cartas": [
   35,
   13
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Outrunning fate; wronged by the test; surviving the burdens",
  "pagina": 120
 },
 {
  "dono": 35,
  "cartas": [
   35,
   14
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Strength to cope with the crisis; overwhelming necessity",
  "pagina": 120
 },
 {
  "dono": 35,
  "cartas": [
   35,
   15
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Clearly doing what’s ethical; blessed by your spiritual path",
  "pagina": 120
 },
 {
  "dono": 35,
  "cartas": [
   35,
   2,
   20
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Travel plans frustrated and blocked",
  "pagina": 120
 },
 {
  "dono": 35,
  "cartas": [
   35,
   15,
   17
  ],
  "qualificadores": [
   "",
   "",
   ""
  ],
  "glosa": "Salvation; angel; spirit ally",
  "pagina": 120
 },
 {
  "dono": 35,
  "cartas": [
   35,
   19
  ],
  "qualificadores": [
   "",
   ""
  ],
  "glosa": "Many gods; openly religious; prayer group",
  "pagina": 120
 }
]
