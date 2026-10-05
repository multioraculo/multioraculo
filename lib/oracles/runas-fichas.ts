/**
 * GERADO POR scripts/extrair-brekke.mjs — NÃO EDITAR À MÃO.
 *
 * Fichas das 24 runas do Elder Futhark, de Wayne Brekke, The Complete Guide to Runes (Rockridge Press, 2023).
 * Extraído em 2026-10-05.
 *
 * `reversaoNaFonte` é DOUTRINA, não geometria: diz se o livro oferece um
 * sentido invertido para aquela runa. São 15 que oferecem e 9 que declaram
 * explicitamente não ter. Não confundir com a flag `reversible` de
 * lib/oracles/draw.ts, que existe para preservar o consumo do RNG das leituras
 * já geradas — ver o comentário lá.
 *
 * A runa em branco (Wyrd) fica de fora: a fonte a trata como adição moderna e
 * "not an actual rune".
 */
export type FichaDeRuna = {
  /** índice em RUNES de lib/oracles/draw.ts */
  id: number
  /** nome como o motor o escreve */
  nome: string
  /** nome como a fonte o escreve (Gifu, Pertho e Berkana divergem) */
  nomeFonte: string
  aliases: string[]
  traducao: string
  keywords: string[]
  base: string
  /** vazio nas 9 que a fonte declara sem reversão */
  reversed: string
  reversaoNaFonte: boolean
  pagina: number
  /** preenchido quando a declaração está na ficha de OUTRA runa */
  viaOutraFicha?: string
}

export const RUNAS_FONTE = "Wayne Brekke, The Complete Guide to Runes (Rockridge Press, 2023)"

export const RUNAS_FICHAS: FichaDeRuna[] = [
 {
  "id": 0,
  "nome": "Fehu",
  "nomeFonte": "Fehu",
  "aliases": [
   "Fé",
   "Feoh"
  ],
  "traducao": "cattle, fee, and wealth",
  "keywords": [
   "abundance",
   "cattle",
   "cycle of transaction",
   "financial wisdom",
   "generosity",
   "and wealth"
  ],
  "base": "abundance, cattle, cycle of transaction, financial wisdom, generosity, and wealth In ancient times, the more cattle a family had, the wealthier they were. They had enough to sustain them and others in their community. Fehu can be thought of as a personification of abundance. This abundance is enough to foster generosity, and in turn, the betterment of yourself and others, and this cycle of wealth is what powers Fehu. It’s not a mentality of hoarding, but of transaction in a way that benefits people and their communities. Whether in the past, present, or future positions, Fehu’s appearance in a reading indicates that finances are the focus. Perhaps a financial boon or opportunities to make more money are on the horizon. It may be that you are in an exciting transition period, looking at new opportunities or collaborations. Fehu asks you to evaluate your current financial situation. Is it ",
  "reversed": "If Fehu appears reversed, a period of financial struggle or the loss of something valuable, such as money, possessions, or even self-esteem, may be on the horizon. Reversed, Fehu suggests looking ahead and planning for any contingency.",
  "reversaoNaFonte": true,
  "pagina": 53
 },
 {
  "id": 1,
  "nome": "Uruz",
  "nomeFonte": "Uruz",
  "aliases": [
   "Ur",
   "Urox",
   "and Urus"
  ],
  "traducao": "aurochs (wild ox)",
  "keywords": [
   "forward movement",
   "healing",
   "health",
   "motivation",
   "power",
   "and protection"
  ],
  "base": "forward movement, healing, health, motivation, power, and protection Uruz represents the massive, prehistoric aurochs, a great ox with powerful horns and hooves. Its large stature and connection with the environment is associated with vitality and healing energy. A powerful healer, this rune offers motivation to get through tough times or help the body and mind overcome injury or trauma. Uruz in a reading may indicate that you are currently experiencing a vital time in your life. This could be in areas of health, creativity, and motivation. Forward movement with a drive toward success is in focus in your life if this rune is cast in the present. If you are struggling with issues related to motivation or health, Uruz urges you to focus on your ability to overcome them. Let the runes tell you what challenges or inspirations may be affecting you in this area. It also may indicate that healt",
  "reversed": "If Uruz is reversed in a reading, poor health or lack of motivation is the primary focus.",
  "reversaoNaFonte": true,
  "pagina": 55
 },
 {
  "id": 2,
  "nome": "Thurisaz",
  "nomeFonte": "Thurisaz",
  "aliases": [
   "Thorn",
   "Thurs"
  ],
  "traducao": "Thorn, Thor, Giant, or Giant Slayer",
  "keywords": [
   "destruction",
   "power",
   "protection",
   "and strength"
  ],
  "base": "destruction, power, protection, and strength Thurisaz is a powerful rune. It represents both protection and an aggressive attitude toward challenges. It can also represent Thor’s hammer Mjolnir, also known as the “Giant Slayer.” Thor was Odin’s son and the god of the common man, of the farmers, bakers, and blacksmiths. He represented the determination and hardiness of everyday people. Regarding protection, the look of the Thurisaz rune can represent the thorn on a stem or a rose. If Thurisaz is cast in a reading, you may be facing a phase of power and motivation. There may be large obstacles at hand, but you are facing them head- on. Hold fast, knowing that even if you can’t see the end result, you must forge ahead. In mythology, Thor charged ahead to face the giants, no matter how big they were. You can equate “giants” to obstacles that impede your daily life or path. Trust that you hav",
  "reversed": "In a reversed position, Thurisaz may indicate that you are currently facing challenges that are taking their toll on you.",
  "reversaoNaFonte": true,
  "pagina": 57
 },
 {
  "id": 3,
  "nome": "Ansuz",
  "nomeFonte": "Ansuz",
  "aliases": [
   "Aza",
   "Oss"
  ],
  "traducao": "answer or mouth",
  "keywords": [
   "air",
   "breath",
   "communication",
   "Loki",
   "knowledge",
   "mentorship",
   "Odin",
   "and wisdom"
  ],
  "base": "air, breath, communication, Loki, knowledge, mentorship, Odin, and wisdom Ansuz is the rune of communication in all its forms. It is Odin’s rune and a rune of wisdom and the attainment of knowledge. Wisdom is usually acquired through experience and learning from the world around you. Communication is key to understanding attained knowledge, and wisdom refers to how you use that knowledge. Gaining insight on a situation usually requires communication, which could include noticing what is not being said. Odin had many experiences in his quest to obtain knowledge and wisdom. Learning from mentors, elders, masters, and teachers is a core aspect of Ansuz. Ansuz is also a rune connected to Loki, a god associated with mischief and trickery. Sometimes, others lie to us or attempt to manipulate us with their words, and these forms of nefarious communication should be noticed. Communication in thi",
  "reversed": "Reversed, aspects of Loki appear with Ansuz, as miscommunication and a lack of knowledge lead to unwise decisions. In the reversed position, Ansuz indicates that words are not currently in your favor, and that you may be experiencing a lack of communication.",
  "reversaoNaFonte": true,
  "pagina": 60
 },
 {
  "id": 4,
  "nome": "Raidho",
  "nomeFonte": "Raidho",
  "aliases": [
   "Raeith",
   "Raida",
   "and Raitho"
  ],
  "traducao": "journey, riding, wagon, and wheel",
  "keywords": [
   "forward movement",
   "journey",
   "mobility",
   "and travel"
  ],
  "base": "forward movement, journey, mobility, and travel Raidho is associated with forward movement in various forms. Associated with a wagon or chariot, it invokes energies of travel, transport, and journeying. This travel can be physical or spiritual, depending on the situation. Raidho can indicate a life or spiritual transformation, vacation, movement in a career, or transition from one home to another. This rune typically indicates a pleasant journey with opportunities for growth, joy, and knowledge. Raidho in regards to forward movement could refer to selling a home or car or relocating. Activities that foster forward movement in your life and your path are all aspects of Raidho. One can imagine the Norse going “Viking” and traveling to raid or explore new lands. You may not be pillaging exactly, but rather plundering through a new path in life, exploring new destinations and experiences. As",
  "reversed": "Reversed, Raidho may indicate that you are experiencing a lack of forward movement.",
  "reversaoNaFonte": true,
  "pagina": 63
 },
 {
  "id": 5,
  "nome": "Kenaz",
  "nomeFonte": "Kenaz",
  "aliases": [
   "Chaon",
   "Kaun",
   "and Ken"
  ],
  "traducao": "knowing, torch, or ulcer",
  "keywords": [
   "courage",
   "creativity",
   "discovery",
   "hope",
   "illumination",
   "motivation",
   "and torchlight"
  ],
  "base": "courage, creativity, discovery, hope, illumination, motivation, and torchlight Kenaz is the rune of the creative passion that drives us forward. It is the torch that we carry in our lives that leads us through darker times. Kenaz can represent the hope we keep when facing difficulty, both outside and within. It imbues the spirit with a “can-do” attitude. I have found that Kenaz can be used as a focus for motivation, determination, and dedication. In readings, it can represent hope, creative breakthroughs, or a willingness to do what it takes to accomplish your goals. Imagine being an explorer, deep in a cave system. Your torch lights the way forward, allowing you to discover new details with every step. The torch offers hope to keep going even if you can’t see where you started or where you may end up. If the torch drops and goes out, you might stop in your tracks and experience sudden h",
  "reversed": "Reversed, Kenaz indicates that you may feel like you are drifting through life with no direction or motivation.",
  "reversaoNaFonte": true,
  "pagina": 65
 },
 {
  "id": 6,
  "nome": "Gebo",
  "nomeFonte": "Gifu",
  "aliases": [
   "Gefu",
   "Gebo",
   "Giba"
  ],
  "traducao": "gift",
  "keywords": [
   "equal exchange",
   "generosity",
   "gift",
   "giving",
   "offering",
   "and receiving"
  ],
  "base": "equal exchange, generosity, gift, giving, offering, and receiving Gifu is the “gift” rune—the gift of the gods and the rune of exchange. It is also the rune of generosity without expectations. The symbol of Gifu is that of an X, much like a ribbon on a wrapped package. This makes it a nice reminder of the rune’s meaning. It is a rune of balance, tempered with happiness and appreciation. Gifu embodies the act of giving without expectations. It is about generosity from the heart and the acceptance of gifts from others. These gifts can be anything, including physical presents, unexpected money, a boost in your career, or an act of kindness when truly needed. Gifu can also mean the act of mutual exchange, a win-win attitude, and a pay- it-forward spirit. It can also mean knowledge, which is considered a gift from the gods. This could be advice, a mentor, or just a needed heads-up. But Gifu i",
  "reversed": "",
  "reversaoNaFonte": false,
  "pagina": 67
 },
 {
  "id": 7,
  "nome": "Wunjo",
  "nomeFonte": "Wunjo",
  "aliases": [
   "Huun",
   "Winja",
   "and Wunio"
  ],
  "traducao": "joy",
  "keywords": [
   "accomplishment",
   "bliss",
   "joy",
   "peace",
   "success",
   "and victory"
  ],
  "base": "accomplishment, bliss, joy, peace, success, and victory Wunjo represents joy, victory, and satisfaction. Imagine a victory banner raised in the name of happiness and success. When Wunjo appears, it means that it is a time for joy and happiness. In relationships, it points to good fortune and success. It is a rune that calls upon the energies of positivity and productivity. It represents a completion of something that has forwarded your growth. Wunjo asks you to look back and appreciate the journey that got you to where you are now. Look at the lessons learned and allow yourself the pleasure of feeling happy and proud of your accomplishments. Wunjo is also associated with Odin and his powerful magic, which can manifest wishes and desires. The satisfying energy from this rune comes from the completion of a goal or desire and the wisdom gained from the experience. Being a rune associated wi",
  "reversed": "Reversed, Wunjo may indicate a current feeling of dissatisfaction and defeat.",
  "reversaoNaFonte": true,
  "pagina": 70
 },
 {
  "id": 8,
  "nome": "Hagalaz",
  "nomeFonte": "Hagalaz",
  "aliases": [
   "Haal",
   "Hagal",
   "Hagalas",
   "and Hagl"
  ],
  "traducao": "hail",
  "keywords": [
   "challenges",
   "delay",
   "disruption",
   "hail",
   "renewal",
   "and unexpected change"
  ],
  "base": "challenges, delay, disruption, hail, renewal, and unexpected change In its simplest form, Hagalaz represents hail, or the energy that hail brings. It is not a rune to be afraid of; on the contrary, it offers challenges meant to bring us insight and growth. Remember, hail comes on quickly and doesn’t last for very long. When it melts, its water flows into the earth, providing nourishment for plants to grow. Hagalaz is here to help you understand that sometimes short-term pain yields long-term gain. These challenges are not meant to break you or keep you stagnant. They are designed to stretch your critical-thinking skills, test your knowledge, and strengthen your ability to face issues rather than run from them. This rune signifies obstacles that are out of your control, challenging your need to be in control and pushing you to deal with these situations free from that feeling. Hagalaz is ",
  "reversed": "",
  "reversaoNaFonte": false,
  "pagina": 76,
  "viaOutraFicha": "declarado na ficha de Isa (p80): \"There is no reverse meaning for Isa, much like Nauthiz and Hagal.\""
 },
 {
  "id": 9,
  "nome": "Nauthiz",
  "nomeFonte": "Nauthiz",
  "aliases": [
   "Nauth",
   "Nied",
   "and Nod"
  ],
  "traducao": "need fire",
  "keywords": [
   "basic human needs",
   "constraint",
   "necessity",
   "need",
   "and restriction"
  ],
  "base": "basic human needs, constraint, necessity, need, and restriction Nauthiz represents the needed fire. The rune itself looks like two logs laid atop each other, ready to be lit. This could be a hearth or a large bonfire. Fire brought warmth and comfort to homes and villages in the ancient North. Consider how a small campfire on a cold night can be an important part of survival. It is a rune about basic human needs, such as warmth, shelter, food, companionship, love (both for self and others), family, joy, and balance. Nauthiz is not about things that are wanted for comfort, but rather for basic survival. It can be easy to get caught up in things you think you need but don’t impact your ability to survive, and Nauthiz asks you to use wisdom in all matters of budget and finance. It challenges you to make the sacrifices needed now to provide a strong foundation for life so that you can enjoy a",
  "reversed": "",
  "reversaoNaFonte": false,
  "pagina": 78
 },
 {
  "id": 10,
  "nome": "Isa",
  "nomeFonte": "Isa",
  "aliases": [
   "Eis",
   "Iss"
  ],
  "traducao": "ice",
  "keywords": [
   "calm",
   "clarity",
   "frozen",
   "halting",
   "ice",
   "icicle",
   "inner work",
   "self-care",
   "and self-examination"
  ],
  "base": "calm, clarity, frozen, halting, ice, icicle, inner work, self-care, and self-examination Isa represents ice. It’s about a halting of things and a focus inward. Picture yourself in the middle of an icicle. You are surrounded by a protective shield of ice. You have no distractions. You have nothing but yourself and the truth on which to focus. It is a place of peace and wisdom. Isa appears when you need to look deep inside, without the influences of the outside reality to distract you. In a reading, this rune could mean that Isa wants you to halt your daily routines to focus on yourself. It could be an indication of the need to stop working so hard and take time to relax. It could indicate that it is time to focus on what you really want in life. Regard Isa as a blessing, a rune that wants you to take time for you, whether you want to or not. It tells you that your higher self is calling w",
  "reversed": "",
  "reversaoNaFonte": false,
  "pagina": 80
 },
 {
  "id": 11,
  "nome": "Jera",
  "nomeFonte": "Jera",
  "aliases": [
   "Ar",
   "Gaar",
   "Jer",
   "and Jeran"
  ],
  "traducao": "year",
  "keywords": [
   "accomplishment",
   "annual cycle or seasonal cycle fertility",
   "fruition",
   "growth",
   "harvest",
   "partnership",
   "reaping the rewards of hard work",
   "and year"
  ],
  "base": "accomplishment, annual cycle or seasonal cycle fertility, fruition, growth, harvest, partnership, reaping the rewards of hard work, and year Jera is known as a rune of the harvest—a symbol of a completion of a cycle or reaping of a job well done. Looking at this rune, you can see the plow and shears, the symbols of the harvest. It is a balanced rune and can also indicate a partnership or team effort, as any successful harvest takes contributions from more than a single individual. A harvest is best cultivated when all parties involved are appreciated, such as the sun and the rain, the horses that pull the plow, and the folks that helped plant the seeds. Even when we think we are the only one responsible for our success, it is always good to remember we didn’t get there alone. Jera signifies success that is earned and not dropped onto your lap. It is a success that is borne from a time of",
  "reversed": "",
  "reversaoNaFonte": false,
  "pagina": 82
 },
 {
  "id": 12,
  "nome": "Eihwaz",
  "nomeFonte": "Eihwaz",
  "aliases": [
   "Eoh",
   "Iwaz",
   "and Yr"
  ],
  "traducao": "yew tree",
  "keywords": [
   "letting go",
   "life cycle",
   "protection",
   "regeneration",
   "regrowth",
   "spiritual growth",
   "transformation",
   "world tree",
   "and yew tree"
  ],
  "base": "letting go, life cycle, protection, regeneration, regrowth, spiritual growth, transformation, world tree, and yew tree Simply stated, Eihwaz is a symbol of the cycle of life and death, renewal, and regeneration. It is about letting go of things that don’t serve you to make room for new growth. Eihwaz also represents the yew tree and the world tree, Yggdrasil, which extends into all worlds and the universe. In ancient times, the wood from the yew tree was used for making bows, as it was strong yet flexible. Eihwaz asks us to be the same when facing obstacles. Stand strong, yet be flexible enough not to break. The yew tree contains toxins used to make poison. Yet as an evergreen, it symbolizes life. Here is another metaphor for the balance this rune offers. If there are toxins in your life, get rid of them to make room for new, healthy personal growth. The yew can live for thousands of yea",
  "reversed": "",
  "reversaoNaFonte": false,
  "pagina": 85
 },
 {
  "id": 13,
  "nome": "Perthro",
  "nomeFonte": "Pertho",
  "aliases": [
   "Pedro",
   "Perth",
   "Perthro",
   "and Perthu"
  ],
  "traducao": "dice cup",
  "keywords": [
   "chance",
   "decisions",
   "dice cup",
   "luck",
   "mystery",
   "opportunities",
   "secrets",
   "universal magic",
   "and unknowns"
  ],
  "base": "chance, decisions, dice cup, luck, mystery, opportunities, secrets, universal magic, and unknowns Pertho is one of the most mysterious runes. Its mystery derives from the various meanings of chance, secrecy, and the unknown. It is often known as the dice cup, as it has the look of a cup or bag that gaming dice are held in and poured out of. If you play dice games, you know the excitement of the mystery of randomness. You may even understand when to roll and when to pass. You may have amazing luck at first, only to end the game with a loss due to a few unfortunate dice rolls. Such losses hold lessons in strategy and how to dodge and weave out of unpleasant situations. It can teach you about patience, humility, teamwork, and positive competitiveness. Pertho indicates that unknown forces are at play. These could be positive or negative depending on the situation, but know that this rune is ",
  "reversed": "If reversed, Pertho could indicate that you don’t have the dice to roll with.",
  "reversaoNaFonte": true,
  "pagina": 88
 },
 {
  "id": 14,
  "nome": "Algiz",
  "nomeFonte": "Algiz",
  "aliases": [
   "Elhaz",
   "Eolh"
  ],
  "traducao": "elk",
  "keywords": [
   "antlers",
   "defense",
   "divine connection",
   "elk",
   "peace",
   "protection",
   "and sedge plant"
  ],
  "base": "antlers, defense, divine connection, elk, peace, protection, and sedge plant Algiz is a powerful rune of protection. It represents the great elk and its protective antlers. It is also said that Algiz represents the sedge plant, a thorny plant that elk love to eat. The shape of this rune looks a lot like a human being with its hands to the sky, seeking a divine connection for guidance and wisdom. Algiz also symbolizes protection for a group, and homes in Germany, France, and Scandinavia often have this rune built into the structure. This design is known as Fachwerk. As a protective rune, Algiz offers the energies of confidence and steadfastness. Like a shield, it can be used to ward off negative influences and anger and keep you from harm. Use Algiz with Raidho when traveling for a safe and protected journey. Licking a finger and drawing it on your forehead or carrying a talisman with Alg",
  "reversed": "If Algiz appears reversed in a reading, it can point to feelings of vulnerability, fear, and disconnection.",
  "reversaoNaFonte": true,
  "pagina": 90
 },
 {
  "id": 15,
  "nome": "Sowilo",
  "nomeFonte": "Sowilo",
  "aliases": [
   "Sigel",
   "Sol"
  ],
  "traducao": "sun",
  "keywords": [
   "energy",
   "light",
   "power",
   "sun",
   "and sunlight"
  ],
  "base": "energy, light, power, sun, and sunlight Sowilo is the rune of the sun. As the last of the runes in Hagal’s Ætt, it balances the frigid aspects of Hagal and Isa with its radiating warmth. Imagine a perfectly sunny day at the perfect temperature. The energy of Sowilo is like the warmth of the sun on your face. No matter what your situation may be, the energy of Sowilo finds its way inside, even if it’s cold outside, like sunlight shining through a window on a chilly day. The sun is a symbol of eternal power and life-giving energy. The Norse goddess Sunna is represented by Sowilo and offers warm, feminine energies that foster growth and forward movement. It is about the connection to the higher self. Sowilo is also associated with the Norse god Baldur and is a guide to help us do the right thing when striving for a positive outcome. This rune can indicate that a victory is at hand and that ",
  "reversed": "",
  "reversaoNaFonte": false,
  "pagina": 93
 },
 {
  "id": 16,
  "nome": "Tiwaz",
  "nomeFonte": "Tiwaz",
  "aliases": [
   "Tew",
   "Tiw",
   "and Tyr"
  ],
  "traducao": "Tyr",
  "keywords": [
   "duty",
   "honor",
   "justice",
   "legalities",
   "male energy",
   "responsibility",
   "and war"
  ],
  "base": "duty, honor, justice, legalities, male energy, responsibility, and war Tiwaz is represented through the Norse god Tyr. He is the god of justice, legalities, and war. He sacrificed his hand to the great wolf Fenrir to maintain the scales of balance and justice. Tiwaz also represents success, victory, and power. This rune has a male energy and can often represent a man in a relationship. It is protective, with a shape that is similar to an arrow. You can use Tiwaz when facing physical or intellectual challenges. It was said that Tyr was a leader of the gods and was a master of the strategies of war. You can call on these strategies when you need a specific plan of attack for a situation or obstacle. Tiwaz is also a rune of balance. If your issues result from an imbalance in your life, Tiwaz asks you to examine the parts of yourself that are out of balance, from your chakras to your homelif",
  "reversed": "If Tiwaz presents itself in a reversed position, it could indicate that there is an imbalance in your life.",
  "reversaoNaFonte": true,
  "pagina": 99
 },
 {
  "id": 17,
  "nome": "Berkano",
  "nomeFonte": "Berkana",
  "aliases": [
   "Beorc",
   "Berkano",
   "Bjorken",
   "and Brica"
  ],
  "traducao": "birch tree",
  "keywords": [
   "birch tree",
   "birth",
   "fertility",
   "healing",
   "mother",
   "new beginnings",
   "and new ideas"
  ],
  "base": "birch tree, birth, fertility, healing, mother, new beginnings, and new ideas Berkana signifies new beginnings, new ideas, and rebirth. Its shape is a reminder of the breasts and belly of a pregnant mother, and it is tied to the Birch Goddess Bercha or Bertha. Berkana represents fertility, both in humans and in crops and livestock. It evokes the fertility of the land and all things within it. When Berkana presents itself, it is a good sign that new things are on the horizon. These things can take time, patience, and care to come to fruition, but they are in the works. The aspect of “new” is commonly scary to some, so Berkana shows that there is nothing to be afraid of and that your ideas are valid and worth seeing through. Berkana can also point to unexpected new changes. Sometimes, a pregnancy can happen unexpectedly, and so can situations and ideas. New beginnings may not have been on y",
  "reversed": "If Berkana appears reversed in a reading, it can indicate a period of stagnation.",
  "reversaoNaFonte": true,
  "pagina": 101
 },
 {
  "id": 18,
  "nome": "Ehwaz",
  "nomeFonte": "Ehwaz",
  "aliases": [
   "Eh",
   "Exauz",
   "and Eya"
  ],
  "traducao": "horse",
  "keywords": [
   "cooperation",
   "horse",
   "loyalty",
   "movement",
   "partnership",
   "and sudden changes"
  ],
  "base": "cooperation, horse, loyalty, movement, partnership, and sudden changes Ehwaz is a rune of the horse. It represents close partnerships, loyalty, mutual respect, and trust. The symbol itself can be seen as a horse from the side, with the saddle in the middle. It can also appear to be two people holding hands, symbolizing a close relationship. This rune typically represents a partnership of sorts—one that is closer than casual friends. Imagine a horse and its rider; each doesn’t know the language of the other, yet when riding, it takes only subtle noises and movements for the horse and rider to maneuver quickly and with precision. Together, they can stop on a dime and make quick turns. They take care of each other. That said, this rune can also mean any sort of close relationship—it doesn’t have to be of a romantic nature. Regardless, it is less a group of people than a couple working for a",
  "reversed": "Reversed, Ehwaz can indicate a rift in a partnership, a loss of a loved one, or a time when companionship is desired.",
  "reversaoNaFonte": true,
  "pagina": 103
 },
 {
  "id": 19,
  "nome": "Mannaz",
  "nomeFonte": "Mannaz",
  "aliases": [
   "Man",
   "Manna",
   "and Mathr"
  ],
  "traducao": "humankind or man",
  "keywords": [
   "connection",
   "group",
   "humanity",
   "humankind",
   "and support"
  ],
  "base": "connection, group, humanity, humankind, and support Mannaz is the rune of humankind. It represents the support of a group of people. The symbol looks like two people facing each other, holding each other’s hips, or with crossed arms holding hands in a sign of mutual support. This rune can symbolize the support of a group of people, such as coworkers, family, or a circle of friends. It asks us to treat others in your life with respect and maintain a relationship that offers mutual support. A balanced rune, Mannaz represents the contributions of multiple people working in tandem to move forward. When Mannaz appears in a reading, it could point to a situation involving a group of people. This situation may involve coworkers, friends, or family members. It shows that there is support available or that you have been there for others in ways that are important. Mannaz may be asking you to look",
  "reversed": "When Mannaz appears reversed, it could indicate that there are problems with a group of people. Mannaz in a reversed position lets you know that you may not get help from others at this time and that you are to maneuver through the situation alone for a reason. Alternatively, Mannaz reversed could be asking you to actively look outside yourself for advice and support.",
  "reversaoNaFonte": true,
  "pagina": 105
 },
 {
  "id": 20,
  "nome": "Laguz",
  "nomeFonte": "Laguz",
  "aliases": [
   "Laaz",
   "Lago",
   "Lagus",
   "and Logr"
  ],
  "traducao": "lake, ocean, and water",
  "keywords": [
   "feminine energy",
   "intuition",
   "lake",
   "and water"
  ],
  "base": "feminine energy, intuition, lake, and water Laguz represents water in all its forms. As one of the four elements, water is the lifeblood of all living things. Water can be chaotic or serene and shallow or deep. It can be crystal clear or it can be dark with murk. Water is at its best when moving, and stagnant when still. It can support life as well as take it. This rune also represents feminine energy and is associated with the Norse goddess Nerthus. Laguz reminds us to be like water, flowing freely around obstacles like a bubbling brook. Sometimes, life can look like a pristine lake on a sunny day, but if you look below the surface, you might see a murky depth. Laguz is a rune of intuition. It is a reminder to trust your intuition and to explore what’s below the surface. In a reading, Laguz can represent a woman in a relationship. Depending on the surrounding runes, it can offer insight",
  "reversed": "If reversed, Laguz may indicate that there is an issue with a woman in a relationship or that you are experiencing struggles.",
  "reversaoNaFonte": true,
  "pagina": 108
 },
 {
  "id": 21,
  "nome": "Ingwaz",
  "nomeFonte": "Ingwaz",
  "aliases": [
   "Enguz",
   "Ing",
   "and Inguz"
  ],
  "traducao": "seed",
  "keywords": [
   "fertility",
   "Freyr",
   "journey",
   "male",
   "masculinity",
   "new growth",
   "relationships",
   "seed",
   "and sexuality"
  ],
  "base": "fertility, Freyr, journey, male, masculinity, new growth, relationships, seed, and sexuality Ingwaz represents new beginnings, fertility, and the Norse god Freyr. The shape of this rune is actually the diamond in the middle of the symbol, but the rune shape is often shown as dual Xs atop each other. It is a symbol of new growth and can be viewed as such. Picture the top X being the tiny leaves of a new sproutling. Then picture the bottom X as the new roots taking hold in the soil. The center is the seed. Along with fertility and new growth, Ingwaz contains aspects of the runes Gifu and Othala—ancestral roots that offer new growth to current family ties and an equal exchange between two partners. Love, sex, and fertility are all represented in Ingwaz. As Gifu represents sex, self-love, giving, and receiving, Ingwaz can represent all these things, but with a partner, much like the differen",
  "reversed": "",
  "reversaoNaFonte": false,
  "pagina": 110
 },
 {
  "id": 22,
  "nome": "Dagaz",
  "nomeFonte": "Dagaz",
  "aliases": [
   "Daaz",
   "Daeg",
   "and Dag"
  ],
  "traducao": "daybreak",
  "keywords": [
   "balance",
   "dawn",
   "day",
   "new start",
   "and sun cycle"
  ],
  "base": "balance, dawn, day, new start, and sun cycle Dagaz is the dawn rune—the rune of daybreak and the cycle of the sun. It is a very balanced rune with a shape similar to the infinity symbol. It can also appear as a set of butterfly wings, signifying a new beginning or transformation. Dagaz is tied to the winter solstice and the cycle of night to day. In the North, when winters are cold and nights are long, the sun is a welcome sight and a way to track the season. A rune of energy and sunlight, Dagaz is the power that keeps us moving; it’s the motivation that drives us and keeps us waking up each day. When Dagaz appears in a reading, it can indicate that a brighter day is ahead. Much like Kenaz and Sowilo, this is a rune of fire and light. Dagaz is about hope and determination. Better times are coming or are at hand, as Dagaz offers us a cycle of light to enjoy. Regarding new beginnings, the ",
  "reversed": "",
  "reversaoNaFonte": false,
  "pagina": 112
 },
 {
  "id": 23,
  "nome": "Othala",
  "nomeFonte": "Othala",
  "aliases": [
   "Odil",
   "Othel",
   "and Othila"
  ],
  "traducao": "ancestry",
  "keywords": [
   "ancestral roots",
   "family",
   "heritage",
   "home",
   "and legacy"
  ],
  "base": "ancestral roots, family, heritage, home, and legacy Othala is the rune of ancestral roots, of family and heritage. It can represent an inheritance of wealth, land, or legacy. It can also represent the passing down of family traits, knowledge, and ancestral history. The symbol of the rune looks a lot like the roof of a home, with the lower legs as the ancestral roots. Othala incorporates the symbols of Gifu as well as Ingwaz, runes that represent equal exchange and growth. Both of these aspects are part of a happy household and prosperous lineage. Othala can also represent the knowledge of tribal or family elders. Stories passed down from generation to generation can keep the values and histories of a family alive. Othala is also representative of a mentor or mentorship, and the attainment of knowledge through another who has more wisdom and experience. In today’s world, there are many wa",
  "reversed": "Reversed, Othala could indicate problems on the home front. Regardless, Othala in reverse is a confirmation that the family tree is getting a shakedown.",
  "reversaoNaFonte": true,
  "pagina": 114
 }
]
