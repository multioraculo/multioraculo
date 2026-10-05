/**
 * GERADO POR scripts/extrair-lenormand.mjs — NÃO EDITAR À MÃO.
 *
 * Ficha individual de cada uma das 36 cartas do Lenormand, extraída de
 * Caitlín Matthews, The Complete Lenormand Oracle Handbook (Destiny Books), cap. 2 (Lenormand Lexicon).
 * Extraído em 2026-10-05. sha256 do PDF: a5cbdaadfb0aeb0bcd3999a20c5dbec2ebe346d60edae0046479bdb0d6c542db
 *
 * SÓ SIGNIFICADO ISOLADO: as "Combinations" do livro ficam de fora, e do
 * "General" saem as frases que citam outra carta. `frasesCortadas` diz quantas.
 * `pagina` é a página do PDF. O texto traz hifenização de fim de linha do
 * original; é evidência interna, não texto exibido.
 */
export type FichaLenormand = {
  /** índice em LENORMAND_DECK, 0 a 35 */
  indice: number
  /** nome como o livro o grafa (Rod, Paths…) */
  nomeFonte: string
  pagina: number
  geral: string
  frasesCortadas: number
  efeito: string
  efeitoNota: string
  substantivos: string[]
  adjetivos: string[]
  verbos: string[]
  adverbios: string[]
  pessoas: string[]
  tempo: string
  universo: string
}

export const LENORMAND_FONTE = "Caitlín Matthews, The Complete Lenormand Oracle Handbook (Destiny Books), cap. 2 (Lenormand Lexicon)"
export const LENORMAND_PDF_SHA256 = "a5cbdaadfb0aeb0bcd3999a20c5dbec2ebe346d60edae0046479bdb0d6c542db"

export const LENORMAND_FICHAS: FichaLenormand[] = [
 {
  "indice": 0,
  "nomeFonte": "Rider",
  "pagina": 62,
  "geral": "Rider brings news, announcements, and messages. Rider can also be a visitor, a witness, someone with news, a go-between, a courier or mail carrier, or an attractive young man. Rider comes quickly or speedily, and as the first card in the pack, he initiates a whole train of events. As a person, Rider can indicate “the other man” or the lover of a gay man, but he might be just an eligible young man.",
  "frasesCortadas": 4,
  "efeito": "Fortunate",
  "efeitoNota": "Rider generally brings good things",
  "substantivos": [
   "News",
   "message",
   "visitor",
   "haste",
   "act",
   "delivery",
   "progress",
   "invi tation",
   "mail",
   "parcel"
  ],
  "adjetivos": [
   "Speedy",
   "versatile",
   "athletic",
   "active",
   "updated",
   "progressive",
   "informal"
  ],
  "verbos": [
   "Arrive",
   "witness",
   "inform",
   "send",
   "announce",
   "ride",
   "initiate",
   "ap proach",
   "invite",
   "run"
  ],
  "adverbios": [
   "Speedily",
   "athletically",
   "actively",
   "hastily",
   "progressively"
  ],
  "pessoas": [
   "Equestrian",
   "go-between",
   "courier",
   "agent",
   "eligible young man",
   "initiator",
   "forerunner"
  ],
  "tempo": "Rider is speedy in effect and denotes soon",
  "universo": "Deliverer of Destiny"
 },
 {
  "indice": 1,
  "nomeFonte": "Clover",
  "pagina": 64,
  "geral": "Clover provides a very small window of opportunity for you to take advantage of or enjoy.",
  "frasesCortadas": 4,
  "efeito": "Fortunate",
  "efeitoNota": "but remember Clover’s fortune is brief!",
  "substantivos": [
   "Luck",
   "small gain",
   "ease",
   "humor",
   "good-luck charm",
   "game",
   "lottery",
   "gambit",
   "fun"
  ],
  "adjetivos": [
   "Fortunate",
   "opportune",
   "spontaneous",
   "carefree",
   "happy-go lucky",
   "easy",
   "light",
   "play",
   "ephemeral",
   "brief"
  ],
  "verbos": [
   "Risk",
   "gamble",
   "win",
   "chance"
  ],
  "adverbios": [
   "Fortunately",
   "fleetingly",
   "easily",
   "humorously",
   "opportunis tically"
  ],
  "pessoas": [
   "A chancer",
   "a single person",
   "a gamer",
   "gambler",
   "opportunist",
   "clown",
   "stand-up comedian"
  ],
  "tempo": "Now or immediately",
  "universo": "Luck"
 },
 {
  "indice": 2,
  "nomeFonte": "Ship",
  "pagina": 65,
  "geral": "Ship stands for travel, movement, and going overseas. It implies distance, going away, abroad, or over, and usually implies a long journey that is beyond your immediate region. This card can also stand for any vehicle, conveyance, or form of transport. Ship also represents the soul and, by extension, wishing or yearning for something.",
  "frasesCortadas": 5,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Overseas",
   "journey",
   "voyage",
   "transfer",
   "soul",
   "motivation",
   "trade",
   "away",
   "over",
   "trip",
   "vehicle",
   "wish"
  ],
  "adjetivos": [
   "Foreign",
   "wandering",
   "strange",
   "international",
   "transient",
   "distant"
  ],
  "verbos": [
   "Travel",
   "translate",
   "yearn",
   "navigate",
   "pilot",
   "export",
   "go",
   "transact",
   "motivate"
  ],
  "adverbios": [
   "Yearningly",
   "movingly",
   "distantly",
   "strangely"
  ],
  "pessoas": [
   "Stranger",
   "foreigner",
   "sailor",
   "marine",
   "traveler",
   "immigrant",
   "emigrant",
   "rover",
   "travel agent",
   "exporter"
  ],
  "tempo": "Within months",
  "universo": "Foreign Service"
 },
 {
  "indice": 3,
  "nomeFonte": "House",
  "pagina": 67,
  "geral": "From a tent to a mansion, House will work for your home or shelter. It extends to cover the family or people who live in your house and those whom you welcome there. It can stand for the structure of your body itself, or the skin you are in, as well as your homepage on social networking, or your base of operations.",
  "frasesCortadas": 4,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Home",
   "household",
   "comfort",
   "headquarters",
   "foundation",
   "nu clear family",
   "brand"
  ],
  "adjetivos": [
   "Domestic",
   "familial",
   "internal",
   "in-house",
   "local",
   "inside",
   "homely"
  ],
  "verbos": [
   "Dwell",
   "reside",
   "shelter",
   "inhabit",
   "found",
   "settle",
   "base"
  ],
  "adverbios": [
   "Residentially",
   "domestically",
   "comfortably"
  ],
  "pessoas": [
   "Resident",
   "householder",
   "homeowner",
   "homing pigeon",
   "real tor",
   "landlord"
  ],
  "tempo": "December; morning",
  "universo": "Hearth of Destiny"
 },
 {
  "indice": 4,
  "nomeFonte": "Tree",
  "pagina": 69,
  "geral": "Tree stands for health and well-being, growth, and even life itself. Because Tree can also stand for long lasting, it can represent memory in systems like seeds, blueprints, and DNA, as well as boredom, ennui, and extended time. It also shows up as ancestral or genetic memory, in this context. Tree covers all networks and systems and can indicate the well-being of a group or system as much as of the body’s own system.",
  "frasesCortadas": 4,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Patience",
   "DNA",
   "well-being",
   "blueprint",
   "time",
   "ancestral memory",
   "network",
   "life",
   "system",
   "ancestors"
  ],
  "adjetivos": [
   "Slowly",
   "boring",
   "long-lasting",
   "healthy",
   "genetic",
   "living"
  ],
  "verbos": [
   "Grow",
   "slow down",
   "endure",
   "heal",
   "extend",
   "bear",
   "systematize"
  ],
  "adverbios": [
   "Healthfully",
   "lastingly",
   "patiently",
   "memorably",
   "systemically"
  ],
  "pessoas": [
   "Patient",
   "doctor",
   "therapist",
   "tree specialist",
   "extended family",
   "ancestors"
  ],
  "tempo": "Very slowly",
  "universo": "Destined Connections"
 },
 {
  "indice": 5,
  "nomeFonte": "Clouds",
  "pagina": 70,
  "geral": "Clouds brings confusion, lack of clarity, and trouble. This trouble can be about unclear or ambiguous motivations that have not been worked out properly, avoidance, or about someone not making up their mind. Clouds has a light or dark side in every deck. You need to note which side yours falls upon because it makes a difference to the reading. Traditional decks tend to have dark Clouds on the right. Below, I shall be placing an L or R after each definition to indicate that the dark clouds are on the left or right side. Cards that fall next to the dark side of the Clouds will be most troubled. Cards that fall next to the lighter side of the Clouds are about things that are clearing up.",
  "frasesCortadas": 5,
  "efeito": "Challenging",
  "efeitoNota": "on its dark side. Improving on its sunny side",
  "substantivos": [
   "Confusion",
   "intransigence",
   "head-trip",
   "thoughts",
   "suspicion"
  ],
  "adjetivos": [
   "Overcast",
   "depressed",
   "ambiguous",
   "cloudy",
   "cerebral",
   "crazy",
   "troubled"
  ],
  "verbos": [
   "Avoid",
   "hide",
   "question",
   "doubt",
   "muddle",
   "suspect"
  ],
  "adverbios": [
   "Madly",
   "confusedly",
   "doubtingly",
   "ambiguously"
  ],
  "pessoas": [
   "Moody or ambiguous person",
   "eccentric",
   "depressive",
   "theo rist",
   "pessimist",
   "suspect",
   "widower"
  ],
  "tempo": "November",
  "universo": "Fateful Confusion"
 },
 {
  "indice": 6,
  "nomeFonte": "Snake",
  "pagina": 72,
  "geral": "Snake brings complications. It is the means or method by which Snake gets things that cause the complications. Snake can be self-possessed to the point of self-absorption or selfishness, which creates an atmosphere for upset, rivalry, and jealousy. When Snake represents a woman she isn’t necessarily a deceiver. She could be intelligent and self-possessed rather than a jealous rival, but she will certainly be high maintenance because she knows what she wants and will get it. Snake can also be impressive and showy, if not a little proud. Snake can also stand for a lesbian partner.",
  "frasesCortadas": 3,
  "efeito": "Challenging",
  "efeitoNota": "",
  "substantivos": [
   "Difficult woman",
   "rivalry",
   "treachery",
   "betrayal",
   "envy",
   "upset",
   "hypocrisy",
   "pride",
   "complexity"
  ],
  "adjetivos": [
   "Jealous",
   "complex",
   "sophisticated",
   "exclusive",
   "shrewd",
   "clever",
   "exotic",
   "devious",
   "impressive"
  ],
  "verbos": [
   "Complicate",
   "meander",
   "twist",
   "poison",
   "fascinate",
   "tempt",
   "manipulate"
  ],
  "adverbios": [
   "Jealously",
   "treacherously",
   "venomously",
   "exclusively",
   "clev erly"
  ],
  "pessoas": [
   "A rival",
   "siren",
   "mistress",
   "iconic bitch",
   "divorcee",
   "widow",
   "sepa rated woman",
   "the other woman",
   "a sophisticated, intelligent, or ca reer woman"
  ],
  "tempo": "February",
  "universo": "Consequences of Fate"
 },
 {
  "indice": 7,
  "nomeFonte": "Coffin",
  "pagina": 74,
  "geral": "Coffin means endings, things gone past their sell-by-date, and also illness. Coffin calls a halt and can bring you up short by its finality. When it comes up in a reading, a sense of deadness or numbness comes with it. There is no dynamism, just a muffled echo of nothing there. Within the proper context of a question, it can show up as a death or a funeral, but don’t rush to read this as \"the death card” because it rarely reveals this; it is much more of ten showing an end or a completion. Many decks show a coffin draped with a pall-cloth. Some readers see the head of the coffin as having a different effect than the bottom or undraped end. When read this way, it is the card facing the drape that is ending, while the card facing the head of the coffin signifies the new begin ning or opportunity. Take note that this is not a universally agreed upon reading. Coffin often indicates an ongoing illness.",
  "frasesCortadas": 1,
  "efeito": "Challenging",
  "efeitoNota": "",
  "substantivos": [
   "Bankruptcy",
   "nothing",
   "death",
   "funeral",
   "finality",
   "deadline",
   "si lence",
   "misfortune",
   "rest",
   "musical instrument"
  ],
  "adjetivos": [
   "Mortal",
   "completed",
   "sick",
   "depletion",
   "redundant",
   "final",
   "numb",
   "deadened",
   "lugubrious",
   "void",
   "ill",
   "unlucky",
   "closed",
   "stale",
   "boxed",
   "empty",
   "deaf"
  ],
  "verbos": [
   "End",
   "discontinue",
   "decline",
   "forget",
   "block-out",
   "extinguish",
   "refuse",
   "stagnate",
   "excavate",
   "silence"
  ],
  "adverbios": [
   "Deathly",
   "forgetfully",
   "depletedly",
   "declining",
   "sickeningly",
   "silently"
  ],
  "pessoas": [
   "Archaeologist",
   "ghost",
   "undertaker",
   "coroner",
   "someone from your past"
  ],
  "tempo": "Midnight; a few months off",
  "universo": "Unluckiness"
 },
 {
  "indice": 8,
  "nomeFonte": "Bouquet",
  "pagina": 76,
  "geral": "Bouquet is a surprise, a gift, or something pleasant. It is a card that brings happiness, cheer, and something unexpectedly nice. Bouquet is about beauty, grace, and charm and is a word that describes design, art, color, per fume, and fashion. In that sense it can indicate one’s self-image, personality, or the face we show to the world.",
  "frasesCortadas": 3,
  "efeito": "Fortunate",
  "efeitoNota": "Bouquet brings us nice or pleasurable things",
  "substantivos": [
   "Gift",
   "selection",
   "enjoyment",
   "palette",
   "deeds",
   "aptitude",
   "talent",
   "repertoire",
   "perfume",
   "color",
   "fashion",
   "self-image"
  ],
  "adjetivos": [
   "Surprising",
   "skilled",
   "various",
   "artistic",
   "pictorial",
   "illus trated",
   "delightful",
   "pleasurable"
  ],
  "verbos": [
   "Give",
   "design",
   "enjoy",
   "charm",
   "invite",
   "do",
   "make",
   "beautify",
   "deco rate"
  ],
  "adverbios": [
   "Skillfully",
   "pleasurably",
   "invitingly",
   "charmingly",
   "colorfully"
  ],
  "pessoas": [
   "Designer",
   "model",
   "beautician",
   "interior decorator",
   "florist",
   "makeup artist"
  ],
  "tempo": "Spring",
  "universo": "Gift of Service"
 },
 {
  "indice": 9,
  "nomeFonte": "Scythe",
  "pagina": 77,
  "geral": "Scythe acts quickly, suddenly, and sharp. If it points to the left then it will sever, cut, or have dangerous effect upon whatever is before it. If the blade points to the right, then it will sever, cut, or irrevocably affect what follows it, so please remember that this will affect your reading. The handle of the Scythe toward the left or right means that the card facing it might be gathered in, collected, or sorted out toward the card on that side.",
  "frasesCortadas": 5,
  "efeito": "Challenging",
  "efeitoNota": "",
  "substantivos": [
   "Break",
   "accident",
   "surgery",
   "operation",
   "rupture",
   "wound",
   "scar",
   "disconnection",
   "division"
  ],
  "adjetivos": [
   "Curtailed",
   "sudden",
   "sharp",
   "succinct",
   "concise",
   "irrev ocable",
   "dangerous",
   "risky",
   "decisive",
   "resolute",
   "military"
  ],
  "verbos": [
   "Cut",
   "sever",
   "divide",
   "reap",
   "gather",
   "harvest",
   "rake",
   "sort",
   "collect",
   "remove"
  ],
  "adverbios": [
   "Dividedly",
   "quickly",
   "accidentally",
   "collectedly",
   "dangerously"
  ],
  "pessoas": [
   "Surgeon",
   "dentist",
   "risk assessor",
   "farmer",
   "tailor",
   "dressmaker",
   "war victim",
   "amputee",
   "soldier"
  ],
  "tempo": "Sudden; autumn",
  "universo": "Dangerous risk"
 },
 {
  "indice": 10,
  "nomeFonte": "Rod",
  "pagina": 79,
  "geral": "Rod, sometimes also called Whip, has a wide variety of meanings that can be confusing at first. It can be disputive and argumentative, like a lawyer or student proving his or her thesis, but it could also indicate slanderous statements, vilification, and verbal abuse, as well as a discussion, conversation, or debate. Some meanings arise from the fact that historically the birch, as it was known in Britain, was used to discipline children and crim inals. Rod is repetitive. It describes sexual activity, exercise, discipline, violence, aggression, or abuse.",
  "frasesCortadas": 5,
  "efeito": "Challenging",
  "efeitoNota": "",
  "substantivos": [
   "Dispute",
   "argument",
   "research",
   "sexuality",
   "a physical workout",
   "discipline",
   "violence",
   "assault",
   "aggression",
   "conversation",
   "questions",
   "coercion",
   "rhetoric"
  ],
  "adjetivos": [
   "Repeating",
   "sexy",
   "abusive",
   "rough",
   "investigate",
   "persua sive",
   "active"
  ],
  "verbos": [
   "Discuss",
   "argue",
   "exercise",
   "practice",
   "punish",
   "run",
   "vilify",
   "crit icize",
   "strike",
   "dance"
  ],
  "adverbios": [
   "Sweepingly",
   "repeatedly",
   "abusively",
   "violently",
   "argumen tatively"
  ],
  "pessoas": [
   "Critic",
   "canvasser",
   "sex worker",
   "whistle-blower",
   "trouble maker",
   "repeater",
   "lawyer",
   "advocate"
  ],
  "tempo": "September; over and over",
  "universo": "Fateful Discrimination"
 },
 {
  "indice": 11,
  "nomeFonte": "Birds",
  "pagina": 81,
  "geral": "Birds signify what is orally related, so that can cover phone-calls, tweets, rumors, the word on the street, or gossip. Some Lenormand packs show Owls rather than Birds, but they do the same job. Birds are interested in things, and so the curiosity that fuels conversation and rumor is part of its pattern. Birds an nounce a pregnancy, since now there are two rather than one.",
  "frasesCortadas": 5,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Gossip",
   "phone call",
   "anxiety",
   "disquiet",
   "busyness",
   "announce ment of pregnancy",
   "rumor"
  ],
  "adjetivos": [
   "Talkative",
   "nervous",
   "curious",
   "garrulous",
   "stressful",
   "hectic",
   "vocal",
   "oral"
  ],
  "verbos": [
   "Excite",
   "spout",
   "chatter",
   "phone",
   "state"
  ],
  "adverbios": [
   "Excitedly",
   "anxiously",
   "restlessly",
   "curiously",
   "orally"
  ],
  "pessoas": [
   "Recording engineer",
   "talk-show host",
   "telephone operator",
   "siblings"
  ],
  "tempo": "Currently; now; twilight",
  "universo": "Speculating Luck"
 },
 {
  "indice": 12,
  "nomeFonte": "Child",
  "pagina": 83,
  "geral": "Child stands for things that are small, new, or beginning, as well as literally meaning a baby, child, or young person under eighteen years old. It includes meanings that convey a child’s worldview such as simple, innocent, and wondering. It can also mean naivete, immaturity, a faux pas, or being unprepared. When Child shows up next to a Significator, it can convey a sense of infantilization or smallness.",
  "frasesCortadas": 3,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Novelty",
   "beginning",
   "innocence",
   "wonder",
   "faux pas",
   "debut",
   "small"
  ],
  "adjetivos": [
   "Young",
   "new",
   "immature",
   "naive",
   "simple",
   "asexual",
   "inexpe rienced",
   "vulnerable",
   "fragile",
   "little",
   "uncomplicated"
  ],
  "verbos": [
   "Start",
   "wonder",
   "trust",
   "begin",
   "infantilize"
  ],
  "adverbios": [
   "Trustingly",
   "innocently",
   "naively"
  ],
  "pessoas": [
   "Small person",
   "student",
   "learner",
   "rookie",
   "newbie",
   "a minor",
   "simpleton",
   "debutant or beginner",
   "a child or baby"
  ],
  "tempo": "August",
  "universo": "Simplicity of service"
 },
 {
  "indice": 13,
  "nomeFonte": "Fox",
  "pagina": 84,
  "geral": "Fox refers to something that is wrong or going on behind your back. Foxes, by their nature, learn to survive by ducking and diving, thieving and stealthy observation, so this card is what you use to convey survival or getting by. It can also mean manipulating or taking advantage of someone.",
  "frasesCortadas": 3,
  "efeito": "Challenging",
  "efeitoNota": "",
  "substantivos": [
   "Trickery",
   "theft",
   "stealth",
   "self-employment",
   "lie",
   "scam",
   "larceny",
   "mistake"
  ],
  "adjetivos": [
   "Wrong",
   "cunning",
   "guilty",
   "clever",
   "underhanded",
   "deceitful",
   "fraudulent",
   "predatory",
   "vigilant",
   "streetwise"
  ],
  "verbos": [
   "Survive",
   "cheat",
   "steal",
   "manipulate",
   "take advantage of",
   "dodge",
   "outsmart"
  ],
  "adverbios": [
   "Trickily",
   "cunningly",
   "manipulatively",
   "fraudulently"
  ],
  "pessoas": [
   "Imposter",
   "con artist",
   "trickster",
   "predator",
   "detective",
   "black sheep",
   "cheat",
   "vigilante"
  ],
  "tempo": "Noon; a few months off",
  "universo": "Fateful Survival"
 },
 {
  "indice": 14,
  "nomeFonte": "Bear",
  "pagina": 86,
  "geral": "Bear represents power, strength, and resources. She can speak about your personal power as an individual and your re sources, capital, or accumulations. Bear represents mother, grand mother, or matriarch, and can mean big, fat, or well-built when it comes next to a person. It shows that someone is the big boss or dominant one, a man of influence or a woman of power. Bear can also be overwhelming, mighty, or a large or powerful man who is overly protective of his wife. Bear comes up a lot when people are dieting or have food addiction issues.",
  "frasesCortadas": 2,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Strength",
   "power",
   "force",
   "benefits",
   "capital",
   "affluence"
  ],
  "adjetivos": [
   "Strong",
   "overwhelming",
   "big",
   "large",
   "fat",
   "uxorious",
   "domi nant",
   "obese",
   "well-built"
  ],
  "verbos": [
   "Protect",
   "empower",
   "resource",
   "accumulate"
  ],
  "adverbios": [
   "Strongly",
   "overwhelmingly",
   "resourcefully"
  ],
  "pessoas": [
   "Director",
   "patron or matron",
   "benefactor",
   "boss",
   "mother",
   "grand mother",
   "lawyer",
   "judge",
   "entrepreneur",
   "older woman"
  ],
  "tempo": "Not for a long time",
  "universo": "Force of Fate"
 },
 {
  "indice": 15,
  "nomeFonte": "Stars",
  "pagina": 87,
  "geral": "Stars give us precision and clarity, and they help us align with our direction through guidance and inspiration. This card generally improves things. Stars also has the signature of wireless Internet and electricity, and signifies north, an ascription that comes from the Pole Star of the Northern Hemisphere constel lations that unwaveringly points north. Stars give us clarity that brings good judgment. Stars is also the card for esoteric, other worldly, and metaphysical things, including philosophy.",
  "frasesCortadas": 4,
  "efeito": "Fortunate",
  "efeitoNota": "Stars indicate things that are clear, clean, and blessed in their intent",
  "substantivos": [
   "Inspiration",
   "wishes",
   "precision",
   "science",
   "direction",
   "hopes",
   "harmony",
   "good judgment",
   "universe",
   "prophecy",
   "dreams",
   "potential",
   "exposure",
   "divine providence",
   "creative intelligence",
   "electricity"
  ],
  "adjetivos": [
   "Clarity",
   "northern",
   "antiseptic",
   "clean",
   "wireless",
   "celestial",
   "psychic",
   "metaphysical",
   "innovative",
   "tolerant",
   "equitable",
   "visionary",
   "idealistic"
  ],
  "verbos": [
   "Guide",
   "show",
   "bless",
   "clarify",
   "improve",
   "aspire",
   "align",
   "divine",
   "envision",
   "expose"
  ],
  "adverbios": [
   "Blessedly",
   "clearly",
   "hopefully",
   "electrifyingly",
   "inspirationally",
   "intelligently"
  ],
  "pessoas": [],
  "tempo": "Night; forever",
  "universo": "Destiny"
 },
 {
  "indice": 16,
  "nomeFonte": "Stork",
  "pagina": 89,
  "geral": "Stork brings change and movement, as well as rest lessness. It often expresses itself as birth, migration, or relocation, as well as a need for spring cleaning or to make preparations for a change. The direction in which the Stork is flying may indicate the nature of the changes, so look to the card that follows. It governs things that are seasonally periodic like migrating birds or fish, or the return of the Easter fun fair or any annual festival. Stork is a court card and we can see the Queen of Hearts as a warm, sim- patico woman who likes to nurture or care for others. Stork’s appearance can welcome changes and improve things, but some times it just brings change by itself.",
  "frasesCortadas": 2,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Migrant",
   "alteration",
   "birth",
   "nurture",
   "season"
  ],
  "adjetivos": [
   "Changeable",
   "moving",
   "improving",
   "restless"
  ],
  "verbos": [
   "Alter",
   "relocate",
   "return",
   "ameliorate",
   "transfer",
   "care",
   "nurse"
  ],
  "adverbios": [
   "Periodically",
   "seasonally",
   "restlessly"
  ],
  "pessoas": [
   "Nurse",
   "foster parent",
   "midwife",
   "migrant",
   "immigrant",
   "nomad"
  ],
  "tempo": "March",
  "universo": "Destined Movement"
 },
 {
  "indice": 17,
  "nomeFonte": "Dog",
  "pagina": 90,
  "geral": "Dog is your friend, companion, or acquaintance; a faithful, reliable, instinctive helper or coworker who is supportive. A friend who acts so as to benefit you. Dog can refer to the police, in the sense of being faithfully of ser vice and a guardian of the peace. Dog represents the companion who supports and never judges you. When describing a rela tionship, the Dog could indicate a male friend who is in the vicinity of the woman, or a man who is a supporter, or it could mean that they are friends and occasional lovers.",
  "frasesCortadas": 3,
  "efeito": "Fortunate",
  "efeitoNota": "Dog is well disposed and helpful to cards near it",
  "substantivos": [
   "Friendship",
   "trust",
   "help",
   "loyalty",
   "instinct",
   "smell",
   "follower",
   "senses"
  ],
  "adjetivos": [
   "Faithful",
   "trustworthy",
   "warm",
   "dogged",
   "dependable",
   "pa tient",
   "familiar"
  ],
  "verbos": [
   "Keep faith",
   "support",
   "comply",
   "obey",
   "acquaint",
   "guard"
  ],
  "adverbios": [
   "Friendly",
   "obediently",
   "helpfully",
   "supportively",
   "instinctively"
  ],
  "pessoas": [
   "Friend",
   "intimate",
   "brother",
   "stalker",
   "pet",
   "peer",
   "companion",
   "confidant",
   "police",
   "chaperone"
  ],
  "tempo": "Not soon",
  "universo": "Loyal to Destiny"
 },
 {
  "indice": 18,
  "nomeFonte": "Tower",
  "pagina": 92,
  "geral": "Tower is anything that is official, ambitious, institutional, lofty, or tall. Tower is defined by the traditional, bureaucratic, administrative, executive, or ruling. This card is also the guardian of the rule of law, as well as the state, government, civilization, or town. The ambition or motives of an institution can appear in a reading if you are asking about the firm you work for, but it can al so describe the personal motives or ambitions of an individual. Near cards about a relationship, Tower can indicate a hardening of attitude or a separation. Because of its lofty and official stance, it can reveal loneliness, especially when it appears to the right of someone.",
  "frasesCortadas": 3,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Institution",
   "office",
   "firm",
   "business",
   "institutional building",
   "policy",
   "conventions",
   "tradition",
   "law",
   "ambition",
   "state",
   "government"
  ],
  "adjetivos": [
   "High",
   "lofty",
   "tall",
   "official",
   "ruling",
   "proud",
   "legal",
   "lonely",
   "political",
   "alone"
  ],
  "verbos": [
   "Promote",
   "retain",
   "rule",
   "certify",
   "authorize",
   "strive",
   "aim",
   "control",
   "oversee",
   "serve"
  ],
  "adverbios": [
   "Institutionally",
   "traditionally",
   "officially",
   "ambitiously"
  ],
  "pessoas": [
   "Lawyer",
   "official",
   "mayor",
   "legislator",
   "executive"
  ],
  "tempo": "Coming soon",
  "universo": "Tradition of service"
 },
 {
  "indice": 19,
  "nomeFonte": "Garden",
  "pagina": 94,
  "geral": "Garden shows us community, things that are sociable, public, open to all, or inclusive. This card can also mean obvious because Garden is open to understanding. It can also speak of countryside, suburban, open country, or the world at large. Group events, parties, festivals, or street gatherings are here too. In some decks, this card is called Park, based upon the first municipal parks and public gardens that sprang up in the mid-nineteenth century all over Europe as places of public recreation. Garden also tells us, when it’s to the right of a card, that it is expressing itself as many or plural.",
  "frasesCortadas": 4,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Event",
   "community",
   "the world",
   "venue",
   "marketplace",
   "group",
   "teamwork"
  ],
  "adjetivos": [
   "Public",
   "sociable",
   "obvious",
   "communal",
   "accessible",
   "mutual"
  ],
  "verbos": [
   "Open",
   "gather",
   "party",
   "celebrate"
  ],
  "adverbios": [
   "Openly",
   "publicly",
   "inclusively",
   "obviously",
   "commonly"
  ],
  "pessoas": [
   "Gardener",
   "party animal",
   "groupie",
   "socialite"
  ],
  "tempo": "Afternoon; in the coming month",
  "universo": "Community Service"
 },
 {
  "indice": 20,
  "nomeFonte": "Mountain",
  "pagina": 95,
  "geral": "Mountain signifies something we can’t get over easily, so it often shows itself as a blockage, obstacle, delay, or limit that we have to negotiate. It sometimes represents a pile of work you have to do or a delay for a trip you are taking. When it appears over the head of the querent, it indicates a burden that weighs heavily. Because it stands for borders, this card can also appear as border control or customs. Mountain can describe being remote or feeling alienated. It can also mean enemy. If describing a per son, Mountain is dour and gives little away.",
  "frasesCortadas": 4,
  "efeito": "Challenging",
  "efeitoNota": "",
  "substantivos": [
   "Obstacle",
   "estrangement",
   "boundary",
   "limit",
   "enemy",
   "weight",
   "introversion",
   "distance"
  ],
  "adjetivos": [
   "Remote",
   "hermetic",
   "inimical",
   "heavy",
   "national",
   "inland",
   "se questered",
   "impassive"
  ],
  "verbos": [
   "Separate",
   "remove",
   "block",
   "delay",
   "alienate",
   "rusticate",
   "border",
   "concentrate"
  ],
  "adverbios": [
   "Remotely",
   "limitedly",
   "boundaried",
   "distantly"
  ],
  "pessoas": [
   "Hermit",
   "explorer",
   "mountain climber",
   "skier",
   "solitary",
   "recluse"
  ],
  "tempo": "Delayed; far off",
  "universo": "Fateful delay"
 },
 {
  "indice": 21,
  "nomeFonte": "Paths",
  "pagina": 97,
  "geral": "Paths is also known as Crossroads in some decks. It indi cates decisions, choices, alternatives, and options, as well as pros and cons, or different possible approaches one can take. The alter native nature of Paths can, when it speaks of a person, show that they are unconventional in their lifestyle. This card can be read as “both at the same time” or “one way or another,” or indicate a substitute or understudy.",
  "frasesCortadas": 5,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Way",
   "choice",
   "option",
   "trail",
   "road",
   "division",
   "map",
   "method",
   "means",
   "route",
   "freedom",
   "unconfined",
   "adventure"
  ],
  "adjetivos": [
   "Planning",
   "specialized",
   "decisive",
   "unfaithful",
   "double dealing",
   "unconventional",
   "versatile"
  ],
  "verbos": [
   "Choose",
   "go",
   "decide",
   "approach",
   "drift",
   "wander",
   "walk",
   "track",
   "ex plore",
   "substitute"
  ],
  "adverbios": [
   "Alternatively",
   "indecisively",
   "freely"
  ],
  "pessoas": [
   "Tourist",
   "tracker",
   "roadie",
   "life coach",
   "hiker",
   "multitasker",
   "alter native person",
   "understudy"
  ],
  "tempo": "April",
  "universo": "Luck of Choice"
 },
 {
  "indice": 22,
  "nomeFonte": "Mice",
  "pagina": 99,
  "geral": "Worry, loss, and diminishment typify Mice. From the infestation of greenfly in your roses to the wear still left in your fa vorite coat, nothing lasts forever, and one person’s possession is another beast’s food. Mice are opportunistic and can take from your store of money, food, or goods. Because Mice work and think as a collective rather than as individuals, they can also stand for group consciousness.",
  "frasesCortadas": 6,
  "efeito": "Challenging",
  "efeitoNota": "",
  "substantivos": [
   "Loss",
   "theft",
   "decrease",
   "wear",
   "piecemeal",
   "decay",
   "sabotage",
   "the group mind",
   "mess"
  ],
  "adjetivos": [
   "Burgled",
   "dirty",
   "filthy",
   "insanitary",
   "infectious",
   "worn-out",
   "stolen",
   "diminished"
  ],
  "verbos": [
   "Lessen",
   "reduce",
   "undercut",
   "consume",
   "spoil",
   "infest",
   "disem- power"
  ],
  "adverbios": [
   "Reductively",
   "decreasingly",
   "infectiously"
  ],
  "pessoas": [
   "Thief",
   "depreciation inspector",
   "loss assessor",
   "economist",
   "looter",
   "saboteur"
  ],
  "tempo": "Right now; shortly",
  "universo": "Fateful Loss"
 },
 {
  "indice": 23,
  "nomeFonte": "Heart",
  "pagina": 101,
  "geral": "Heart is the universal emblem of love and so it appears here. It also stands for enthusiasm, affection, and caring, as well as a whole range of different loving connections, including those that are platonic and not just sexual. It can describe someone who is a fan or a follower, or even indicate “liking” on social net working. If you are scanning a tableau for the love interest or motivations of the heart, this is the card you examine and see what cards lie in proximity.",
  "frasesCortadas": 3,
  "efeito": "Fortunate",
  "efeitoNota": "",
  "substantivos": [
   "Love",
   "enthusiasm",
   "attraction",
   "affiliation",
   "fan",
   "empathy",
   "pas sion"
  ],
  "adjetivos": [
   "Affectionate",
   "lovesome",
   "emotional",
   "favorite",
   "romantic"
  ],
  "verbos": [
   "Flirt",
   "be passionate about",
   "attract",
   "desire",
   "emote",
   "favor"
  ],
  "adverbios": [
   "Lovingly",
   "enthusiastically",
   "attractively",
   "emotionally"
  ],
  "pessoas": [
   "Lover",
   "fan",
   "supporter of a group",
   "romantic",
   "heart specialist",
   "matchmaker"
  ],
  "tempo": "October",
  "universo": "Loving Destiny"
 },
 {
  "indice": 24,
  "nomeFonte": "Ring",
  "pagina": 102,
  "geral": "Ring speaks of bonds, connections, contracts, agree ments, and engagements. In a love reading it indicates commit ment because of its association with the marriage ring.",
  "frasesCortadas": 7,
  "efeito": "Fortunate",
  "efeitoNota": "",
  "substantivos": [
   "Contract",
   "bond",
   "union",
   "connection",
   "agreement",
   "engage ment",
   "circle",
   "phase",
   "oath",
   "vow"
  ],
  "adjetivos": [
   "Cyclic",
   "bound",
   "enclosed",
   "chained",
   "linked",
   "inclusive",
   "round and round"
  ],
  "verbos": [
   "Commit",
   "unite",
   "enclose",
   "ring-fence",
   "encircle",
   "include",
   "swear an oath",
   "promise"
  ],
  "adverbios": [
   "Cyclically",
   "connectedly",
   "bindingly",
   "inclusively"
  ],
  "pessoas": [
   "Engaged person",
   "contract worker",
   "cyclist",
   "contractor"
  ],
  "tempo": "june",
  "universo": "Contract with Fate"
 },
 {
  "indice": 25,
  "nomeFonte": "Book",
  "pagina": 104,
  "geral": "Book means secrets, mysteries, knowledge, wisdom, and education. It can stand literally for any book or body of knowledge, or the philosophy of a school of thought. It is also the unknown. Book’s pages are usually facing the right, illuminating what has been unknown to the right-hand card. When the Book’s spine is to the left, it means that something is secret to whatever lies on the left. Interestingly, both books and coffins open and shut.",
  "frasesCortadas": 3,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Secret",
   "knowledge",
   "expertise",
   "studies",
   "diary",
   "tome",
   "memory",
   "oracle cards"
  ],
  "adjetivos": [
   "Wise",
   "revealing",
   "unknown",
   "learned",
   "informed",
   "secret"
  ],
  "verbos": [
   "Educate",
   "hide",
   "obfuscate",
   "study",
   "know",
   "remember"
  ],
  "adverbios": [
   "Wisely",
   "secretly",
   "knowingly",
   "revealingly",
   "expertly"
  ],
  "pessoas": [
   "Teacher",
   "educator",
   "librarian",
   "writer",
   "bookkeeper",
   "historian",
   "curator",
   "editor",
   "researcher"
  ],
  "tempo": "Slow; not for a long time. K ) _* 1 0",
  "universo": "Mysterious Luck"
 },
 {
  "indice": 26,
  "nomeFonte": "Letter",
  "pagina": 105,
  "geral": "It stands for a newspaper, letter, flyer, manifesto, or advertisement. To check if the letter is sent or received, see where it falls and how the Letter is depicted in your spread.",
  "frasesCortadas": 7,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Message",
   "manifesto",
   "newspaper",
   "poster",
   "note",
   "letter",
   "card",
   "information",
   "schedule",
   "diploma",
   "evidence",
   "missive",
   "agenda",
   "communique"
  ],
  "adjetivos": [
   "Recorded",
   "written",
   "emailed",
   "leafleted",
   "listed"
  ],
  "verbos": [
   "Document",
   "send",
   "relate",
   "advertise",
   "communicate",
   "contact"
  ],
  "adverbios": [
   "Informationally",
   "advisedly",
   "evidently"
  ],
  "pessoas": [],
  "tempo": "Shortly",
  "universo": "Manifesto of Service"
 },
 {
  "indice": 27,
  "nomeFonte": "Man",
  "pagina": 107,
  "geral": "Man is the male Significator and so he is not a speaking card but rather one that is spoken about. The card that accom panies Man colors him.",
  "frasesCortadas": 1,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Male person",
   "potency",
   "yourself",
   "himself",
   "everyman"
  ],
  "adjetivos": [
   "Male",
   "masculine",
   "proactive"
  ],
  "verbos": [
   "Generate",
   "activate"
  ],
  "adverbios": [
   "Manfully",
   "proactively"
  ],
  "pessoas": [],
  "tempo": "july",
  "universo": "Son of Destiny"
 },
 {
  "indice": 28,
  "nomeFonte": "Woman",
  "pagina": 107,
  "geral": "Woman is the female Significator and so is not a speak ing card but rather one that is spoken about. The cards that accompany her color Woman.",
  "frasesCortadas": 0,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Female person",
   "fertility",
   "yourself",
   "herself",
   "every woman"
  ],
  "adjetivos": [
   "Female",
   "feminine",
   "sensitive"
  ],
  "verbos": [
   "Feminize",
   "conceive"
  ],
  "adverbios": [
   "Womanly",
   "sensitively"
  ],
  "pessoas": [],
  "tempo": "May",
  "universo": "Daughter of Service"
 },
 {
  "indice": 29,
  "nomeFonte": "Lily",
  "pagina": 109,
  "geral": "Lily is the card for age, peace, protection, and maturity. It can also mean the welfare of the family and, by extension, social work. Lily give us cleanliness or purity, which is why brides carry lilies and why they are the flowers most associated with funerals of those dying in the faith. Lily is the card of the father, grandfather, or older man. Some Lenormand schools see Lily as sexuality, a meaning that is derived from the erotic perfume of lily, but this would be comfortable, familiar sex or relations between faithful partners since Lily also has the meaning of constant or chaste from its reputation for purity. Lily is the protector of the family.",
  "frasesCortadas": 2,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Peace",
   "calm",
   "old age",
   "winter",
   "ice",
   "constancy",
   "discretion",
   "maturity",
   "retirement"
  ],
  "adjetivos": [
   "Cold",
   "restrained",
   "serene",
   "discreet",
   "veteran",
   "antique",
   "an cient",
   "virtuous"
  ],
  "verbos": [
   "Age",
   "bring peace",
   "protect",
   "overwinter",
   "snow"
  ],
  "adverbios": [
   "Peacefully",
   "calmly",
   "constantly",
   "serenely",
   "maturely",
   "coldly"
  ],
  "pessoas": [
   "Elder",
   "divorce",
   "grandfather",
   "father",
   "veteran",
   "social worker",
   "retired person",
   "mentor"
  ],
  "tempo": "Winter",
  "universo": "Mature Service"
 },
 {
  "indice": 30,
  "nomeFonte": "Sun",
  "pagina": 110,
  "geral": "The Sun brings vigor, energy, and vitality into the reading. It signals a welcome relief of difficult conditions and brings to the cards a light that helps you find your way. This cheery brightening up of things can come with a sense of success or achievement. Next to challenging cards it dilutes them as the Good Fairy God mother does in the case of the curse upon Sleeping Beauty; it doesn’t take the challenge entirely away, but it will limit the severity somewhat. Sun gives us day light and summer, as well as consciousness.",
  "frasesCortadas": 2,
  "efeito": "Fortunate",
  "efeitoNota": "Sun warms things up and brings happiness",
  "substantivos": [
   "Warmth",
   "light",
   "day",
   "confidence",
   "summer",
   "relief",
   "electricity",
   "conscious",
   "holiday",
   "goodwill",
   "idealism",
   "success"
  ],
  "adjetivos": [
   "Cheerful",
   "sunny",
   "ambitious",
   "south",
   "bright",
   "everyday",
   "propitious"
  ],
  "verbos": [
   "Enlighten",
   "gain",
   "warm",
   "electrify",
   "recreate",
   "heat",
   "sheer",
   "miti gate"
  ],
  "adverbios": [
   "Cheerfully",
   "warmly",
   "daily",
   "confidently"
  ],
  "pessoas": [
   "Optimist",
   "electrician",
   "comedian",
   "charismatic person"
  ],
  "tempo": "Summer",
  "universo": "Luck of Life"
 },
 {
  "indice": 31,
  "nomeFonte": "Moon",
  "pagina": 112,
  "geral": "Moon is the card of work and vocation, as well as the recognition and honor that arise from that work. It also gives us the emotional satisfaction we get from work and creativity. With the creativity to bring things to manifestation, Moon is also about dreams we have while we are asleep and the intuition that we feel about something.",
  "frasesCortadas": 4,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Reputation",
   "job",
   "talent",
   "vocation",
   "creativity",
   "emotional satisfaction",
   "career",
   "intuition",
   "celebrity"
  ],
  "adjetivos": [
   "Famous",
   "working",
   "moonlighting",
   "nightly",
   "dreamy",
   "renowned"
  ],
  "verbos": [
   "Work",
   "honor",
   "recognize",
   "acknowledge",
   "intuit",
   "manifest",
   "influence"
  ],
  "adverbios": [
   "Nightly",
   "monthly",
   "honorably",
   "reputedly",
   "famously"
  ],
  "pessoas": [
   "Celebrity",
   "famous person",
   "worker",
   "dreamer"
  ],
  "tempo": "Evening; within the month",
  "universo": "Honor of Destiny"
 },
 {
  "indice": 32,
  "nomeFonte": "Key",
  "pagina": 113,
  "geral": "Key is the opening or solution you’ve been looking for. It can provide a reason when it comes at the beginning or in the past position of a spread, where it highlights a cause. Key also stands for chief or notable. When Key appears as the last card or at the end of a line it says yes, definitely, certainly, or assuredly to whatever went before. For musicians, Key could mean in tune or tuning up, but for prisoners it might be locked up.",
  "frasesCortadas": 4,
  "efeito": "Fortunate",
  "efeitoNota": "Key opens things up",
  "substantivos": [
   "Solution",
   "answer",
   "breakthrough",
   "door",
   "discovery",
   "pass word",
   "in tune",
   "assent",
   "freedom",
   "consent",
   "original",
   "source",
   "impor tance"
  ],
  "adjetivos": [
   "Chief",
   "notable",
   "expert",
   "pivotal",
   "important",
   "impregnable",
   "subtle",
   "paramount",
   "preeminent",
   "subtle"
  ],
  "verbos": [
   "Open",
   "reveal",
   "access",
   "unlock",
   "lock",
   "brainstorm",
   "plan",
   "diag nose",
   "release"
  ],
  "adverbios": [
   "Openly",
   "revelatory",
   "certainly",
   "accessibly",
   "subtly",
   "impor tantly"
  ],
  "pessoas": [
   "Locksmith",
   "janitor",
   "decoder",
   "switchboard operator",
   "diagnostician"
  ],
  "tempo": "In the coming month",
  "universo": "Revelation of Luck"
 },
 {
  "indice": 33,
  "nomeFonte": "Fish",
  "pagina": 115,
  "geral": "Fish stands for money, flow, circulation, wages, invest ments, exchange, and business. As with all cards, the ones that are next to it will give you the right context. It also means the depths from the ocean’s deep and, by extension, it covers all bodies of water, water itself, also liquid and drink, especially alcohol.",
  "frasesCortadas": 3,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Money",
   "means",
   "cash",
   "flow",
   "business",
   "depths",
   "prosperity",
   "flux",
   "liquidity",
   "currency"
  ],
  "adjetivos": [
   "Financial",
   "fiscal",
   "watery",
   "alcoholic",
   "fluid",
   "abundant",
   "liq uid",
   "commercial. Verb",
   "Earn",
   "exchange",
   "swim",
   "trade",
   "gush",
   "transact",
   "circulate",
   "stream. Ad"
  ],
  "verbos": [
   "Financially",
   "fluidly",
   "abundantly",
   "prosperously",
   "swim mingly"
  ],
  "adverbios": [],
  "pessoas": [
   "Investor",
   "fisherman",
   "alcoholic",
   "bon viveur",
   "depth analyst",
   "accountant"
  ],
  "tempo": "January",
  "universo": "Financial Luck"
 },
 {
  "indice": 34,
  "nomeFonte": "Anchor",
  "pagina": 117,
  "geral": "Anchor is the card of stability and dependability. It is immoveable and so it talks about fixtures and things that remain unchanged. This can extend to situations staying the same, or it can signal a return to normal. There is also something about An chor that is routine and as a description of a person it can mean someone is reliable to the point of being a little dull. Some Lenor- mand schools use it as a work card, as it speaks to the hard working or persevering ethic. Traditionally, the anchor represented hope and faith, meanings that derive from the steadiness lent by the anchor to the ship in rough waters.",
  "frasesCortadas": 2,
  "efeito": "Neutral",
  "efeitoNota": "",
  "substantivos": [
   "Stability",
   "maintenance",
   "standards",
   "permanence",
   "safety",
   "standards",
   "hope",
   "livelihood",
   "routine"
  ],
  "adjetivos": [
   "Stable",
   "keeping",
   "unchanging",
   "reliable",
   "serious",
   "hard working",
   "coastal"
  ],
  "verbos": [
   "Secure",
   "ground",
   "rely",
   "anchor",
   "persevere",
   "make safe",
   "settle"
  ],
  "adverbios": [
   "Securely",
   "dependably",
   "reliably",
   "permanently",
   "hopefully"
  ],
  "pessoas": [
   "Settler",
   "founder",
   "maintenance workers",
   "security person",
   "news anchor",
   "pedant",
   "safety officer"
  ],
  "tempo": "In the next few months; very slowly",
  "universo": "Secure Service"
 },
 {
  "indice": 35,
  "nomeFonte": "Cross",
  "pagina": 118,
  "geral": "Cross is what is necessary or fateful, but it’s also your faith, conviction, or ethics. When you have to seriously consider your stance on an issue, you refer to the Cross part of yourself. Knowing what is necessary is useful but it’s not always pleasant. Cross is a grin-and-bear-it kind of card. When it shows up in a spread, you know that you have to face things and that life has be come tough. Cross is like a great big exclamation mark. Cross indicates spirituality, reli gion, and all departments of the sacred and mystical, regardless of affiliation.",
  "frasesCortadas": 5,
  "efeito": "Challenging",
  "efeitoNota": "",
  "substantivos": [
   "Crisis",
   "transition",
   "test",
   "necessity",
   "fate",
   "trial",
   "burden",
   "diffi culty",
   "challenge"
  ],
  "adjetivos": [
   "Critical",
   "testing",
   "venerable",
   "holy",
   "sacred",
   "spiritual",
   "fate ful"
  ],
  "verbos": [
   "Cross",
   "challenge",
   "consecrate",
   "ordain",
   "facing up to"
  ],
  "adverbios": [
   "Critically",
   "spiritually",
   "testingly",
   "sacredly"
  ],
  "pessoas": [
   "Priest",
   "minister",
   "examiner",
   "inquisitor",
   "initiate"
  ],
  "tempo": "Sooner than you’d like",
  "universo": "Implacable Fate"
 }
]
