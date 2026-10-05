/**
 * GERADO POR scripts/extrair-iching.mjs — NÃO EDITAR À MÃO.
 *
 * Os 64 hexagramas e as 384 linhas de Eranos Yijing (Ritsema & Karcher), The Original I Ching Oracle.
 * Extraído em 2026-10-05.
 *
 * Os textos são TERSOS porque a fonte é tersa. Nada foi expandido, completado
 * ou traduzido: o material fica no idioma original (inglês) e só os rótulos
 * são localizados, como já acontece com as fichas do tarô (português) e das
 * runas (inglês).
 */
export type LinhaDeHexagrama = {
  /** 1 a 6, de baixo para cima */
  linha: number
  /** 9 = yang mutante, 6 = yin mutante */
  valor: 6 | 9
  texto: string
  comentario: string
  pagina: number
}

export type FichaDeHexagrama = {
  numero: number
  /** o nome como a fonte o imprime no cabeçalho do capítulo */
  nomeFonte: string
  pinyin: string
  /** a grafia da fonte, quando diverge da nossa */
  pinyinFonte?: string
  /** a seção "Image of the Situation" */
  base: string
  linhas: LinhaDeHexagrama[]
  pagina: number
}

export const ICHING_FONTE = "Eranos Yijing (Ritsema & Karcher), The Original I Ching Oracle"

export const ICHING_FICHAS: FichaDeHexagrama[] = [
 {
  "numero": 1,
  "nomeFonte": "ENERGY",
  "pinyin": "Qian",
  "base": "Energy. Spring, Growing, Harvesting, Trial.",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Immersed dragon, no availing of.",
    "comentario": "Immersed dragon, no availing of. Yang located below indeed.",
    "pagina": 86
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Viewing a dragon located in the fields . Harvesting : viewing the great in the person .",
    "comentario": "Viewing a dragon located in the fields . Actualizing-dao spreading throughout indeed.",
    "pagina": 87
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "A jun zi completing the day: energy parching. At nightfall awe like in adversity. Without fault.",
    "comentario": "Completing the day : energy parching . Reversing : returning to dao indeed .",
    "pagina": 87
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Maybe capering located at the abyss. Without fault.",
    "comentario": "Maybe capering located at the abyss. Advancing: without fault indeed.",
    "pagina": 88
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Flying dragon located in heaven. Harvesting: viewing the great in the person.",
    "comentario": "Flying dragon located in heaven. The great in the person creative indeed.",
    "pagina": 89
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Overbearing dragon possesses repenting .",
    "comentario": "Overbearing dragon possesses repenting. Overfilling not permitting to last indeed.",
    "pagina": 90
   }
  ],
  "pagina": 84
 },
 {
  "numero": 2,
  "nomeFonte": "SPACE",
  "pinyin": "Kun",
  "base": "Space. Spring, Growing, Harvesting, female horse’s Trial. A jun zi possesses directed going. Beforehand delusion, afterwards acquiring. A lord Harvesting. Western South: acquiring partnering. Eastern North: losing partnering. Peaceful Trial, significant.",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Treading frost , hard ice as culmination .",
    "comentario": "Treading frost , hard ice . Yin beginning solidification indeed . Docile involvement in one’s dao . Culmination : hard ice indeed .",
    "pagina": 98
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Straightening on all sides : the great . Not repeating : without not Harvesting .",
    "comentario": "Six at second’s stirring-up . Straightening used on all sides indeed . Not repeating : without not Harvesting . Earth ’s dao shines indeed .",
    "pagina": 99
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Containing composition permits Trial . Maybe adhering to kingly affairs . Without accomplishing , possessing completion .",
    "comentario": "Containing composition permits Trial . Using the season to shoot-forth indeed . Maybe adhering to kingly affairs . Knowing the shine of the great indeed .",
    "pagina": 100
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Bundled in the bag . Without fault , without praise .",
    "comentario": "Bundled in the bag , without fault . Considering not harmful indeed .",
    "pagina": 101
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "A yellow apron . Spring , significant .",
    "comentario": "A yellow apron: Spring, significant. Pattern located in the center indeed.",
    "pagina": 101
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Dragons struggle tending-towards the countryside . Their blood indigo and yellow .",
    "comentario": "Dragons struggle tending-towards the countryside . Their dao exhausted indeed .",
    "pagina": 102
   }
  ],
  "pagina": 95
 },
 {
  "numero": 3,
  "nomeFonte": "SPROUTING",
  "pinyin": "Zhun",
  "base": "Sprouting. Spring, Growing, Harvesting, Trial. No availing of possessing directed going. Harvesting: installing feudatories.",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "A stone pillar . Harvesting : residing in Trial . Harvesting : installing feudatories .",
    "comentario": "Although a stone pillar , purpose moving correctly indeed . Using valuing the below and the mean . The great acquires the commoners indeed .",
    "pagina": 110
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Sprouting thus , hindered thus . Riding a horse , arraying thus . In-no-way illegality , matrimonial alliance . Woman and son ’s Trial : not nursing . Ten years , thereupon nursing .",
    "comentario": "Six at second’s heaviness . Riding a solid indeed . Ten years , thereupon nursing . Reversing constancy indeed .",
    "pagina": 111
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Approaching a stag : lacking precaution . Thinking of entering tending-towards the forest ’s center . A jun zi : hint not thus stowed away. Going , abashment .",
    "comentario": "Approaching a stag without precaution . Using adhering to wildfowl indeed . A jun zi stowing it : going , abashment , exhaustion indeed .",
    "pagina": 113
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Riding a horse , arraying thus . Seeking matrimonial alliance . Going , significant . Without not Harvesting .",
    "comentario": "Seeking and-also going . Brightness indeed .",
    "pagina": 114
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Sprouting : one’s juice . The small : Trial , significant . The great : Trial , pitfall .",
    "comentario": "Sprouting : one’s juice . Spreading , not-yet shining indeed .",
    "pagina": 115
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Riding a horse , arraying thus . Weeping , blood flowing thus .",
    "comentario": "Weeping , blood flowing thus . Is it permitted long-living indeed?",
    "pagina": 116
   }
  ],
  "pagina": 107
 },
 {
  "numero": 4,
  "nomeFonte": "ENVELOPING",
  "pinyin": "Meng",
  "base": "Enveloping. Growing. In-no-way I seek the youthful enveloping. The youthful enveloping seeks me. The initial oracle-consulting notifies. Twice, thrice: obscuring. Obscuring, by consequence not notifying. Harvesting, Trial.",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Shooting-forth enveloping . Harvesting: availing of punishing people. Availing of stimulating shackles to fetter. Using going: abashment.",
    "comentario": "Harvesting: availing of punishing people. Using correcting by law indeed.",
    "pagina": 122
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Enwrapping enveloping, significant. Letting-in the wife, significant. The son controls the household.",
    "comentario": "The son controls the household. Solid and supple articulated indeed .",
    "pagina": 122
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "No availing of grasping womanhood. Viewing a metallic husband. Not possessing body. Without direction Harvesting.",
    "comentario": "No availing of grasping womanhood. Moving, not yielding indeed.",
    "pagina": 123
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Confining enveloping. Abashment.",
    "comentario": "Confining envelopment’s abashment. Solitude distancing substance indeed.",
    "pagina": 124
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Youthful enveloping. Significant.",
    "comentario": "Youthful envelopment’s significance. Yielding uses the root indeed.",
    "pagina": 125
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Smiting enveloping. Not Harvesting: activating illegality. Harvesting: resisting illegality.",
    "comentario": "Harvesting: availing of resisting illegality. Above and below yielding indeed.",
    "pagina": 125
   }
  ],
  "pagina": 118
 },
 {
  "numero": 5,
  "nomeFonte": "ATTENDING",
  "pinyin": "Xu",
  "base": "Attending . Possessing conformity . Shining Growing , Trial , significant . Harvesting : wading the great river .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Attending tending-towards the suburbs . Harvesting : availing of perseverance . Without fault .",
    "comentario": "Attending tending-towards the suburbs . Not opposing heaviness in movement . Harvesting : availing of perseverance , without fault . Not-yet letting-go constancy indeed .",
    "pagina": 131
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Attending tending-towards the sands . The small possesses words . Completing , significant .",
    "comentario": "Attending tending-towards the sands . Inundation located in the center indeed . Although the small possesses words , using completing significant indeed .",
    "pagina": 132
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Attending tending-towards the bogs . Involvement in illegality culminating .",
    "comentario": "Attending tending-towards the bogs . Calamity located outside indeed . Originating from my involvement in illegality . Respectful consideration , not destroying indeed .",
    "pagina": 133
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Attending tending-towards blood . Emerging originating from the cave .",
    "comentario": "Attending tending-towards blood . Yielding uses hearkening indeed .",
    "pagina": 134
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Attending tending-towards taking-in liquor . Trial , significant .",
    "comentario": "Taking-in liquor : Trial , significant . Using the center ’s correctness indeed .",
    "pagina": 135
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Entering tending-towards the cave . Possessing not invited visitors : three people come . Respecting’s completion , significant .",
    "comentario": "Not invited visitors come . Respecting’s completion , significant . Although not an appropriate position , not-yet the great letting-go indeed .",
    "pagina": 135
   }
  ],
  "pagina": 128
 },
 {
  "numero": 6,
  "nomeFonte": "ARGUING",
  "pinyin": "Song",
  "base": "Arguing . Possessing conformity . Blocking awe . The center , significant . Completing , pitfall . Harvesting : viewing the great in the person . Not harvesting : wading the great river .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Not a perpetual place , affairs . The small possesses words . Completing significant .",
    "comentario": "Not a perpetual place , affairs . Arguing not permitting long-living indeed . Although the small possesses words , one’s differentiation brightening indeed .",
    "pagina": 142
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Not controlling arguing . Converting and-also escaping from one’s capital . People , three hundred doors . Without blunder .",
    "comentario": "Not controlling arguing . Converting , escaping : skulking indeed . Origin below , arguing above . Distress culminating reaping indeed .",
    "pagina": 143
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Taking-in the ancients ’ actualizing-dao . Trial . Adversity : completing , significant . Maybe adhering to kingly affairs . Without accomplishment .",
    "comentario": "Taking-in the ancients ’ actualizing-dao . Adhering to the above , significant indeed .",
    "pagina": 144
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Not controlling arguing . Returning , approaching fate . Retracting , peaceful Trial . Significant .",
    "comentario": "Returning : approaching fate . Retracting , peaceful Trial . Not letting-go indeed .",
    "pagina": 145
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Arguing . Spring significant .",
    "comentario": "Arguing . Spring significant . Using the center ’s correctness indeed .",
    "pagina": 146
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Maybe a pouched belt’s bestowing . Completing dawn thrice depriving of it .",
    "comentario": "Using arguing acquiesces in submitting . Truly not standing respectfully indeed .",
    "pagina": 147
   }
  ],
  "pagina": 139
 },
 {
  "numero": 7,
  "nomeFonte": "THE LEGIONS",
  "pinyin": "Shi",
  "base": "The legions . Trial . The respectable person , significant . Without fault .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "The legions emerging using ordinance . Obstructing virtue : pitfall .",
    "comentario": "The legions emerging using ordinance . Letting-go the ordinance : pitfall indeed .",
    "pagina": 153
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Locating the legions in the center , significant . Without fault . The king thrice bestows fate.",
    "comentario": "Locating the legions in the center , significant . Receiving heavenly favor indeed . The king thrice bestows fate . Cherishing the myriad fiefdoms indeed .",
    "pagina": 153
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "The legions maybe carting corpses . Pitfall .",
    "comentario": "The legions maybe carting corpses . The great without achievement indeed .",
    "pagina": 154
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "The legions ’ left camp . Without fault .",
    "comentario": "The left camp , without fault . Not-yet letting-go constancy indeed .",
    "pagina": 155
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "The fields possess wildfowl . Harvesting : holding-on to words . Without fault . The long-living son conducts the legions . The junior son carts corpses . Trial , pitfall .",
    "comentario": "The long-living son conducts the legions . Using the center moving indeed . The junior son carts corpses . Commissioning not appropriate indeed .",
    "pagina": 156
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "The great in the chief possesses fate . Disclosing the city , receiving a household . The small in the person , no availing of.",
    "comentario": "The great in the chief possesses fate . Using correct achievement indeed . The small in the person , no availing of. Necessarily disarraying the fiefdoms indeed .",
    "pagina": 157
   }
  ],
  "pagina": 150
 },
 {
  "numero": 8,
  "nomeFonte": "GROUPING",
  "pinyin": "Bi",
  "base": "Grouping . Significant . Retracing the oracle-consulting : Spring , perpetual Trial . Without fault . Not soothing , on all sides coming . Afterwards husbanding : pitfall .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Possessing conformity : grouping it . Without fault . Possessing conformity : overfilling the jar . Completion coming , possessing more , significant .",
    "comentario": "Grouping’s initial six . Possessing more , significant indeed .",
    "pagina": 163
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Grouping’s origin inside . Trial , significant .",
    "comentario": "Grouping’s origin inside . Not the origin letting-go indeed .",
    "pagina": 164
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Grouping of in-no-way people .",
    "comentario": "Grouping of in-no-way people . Not truly injuring reached .",
    "pagina": 165
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Outside grouping it . Trial , significant .",
    "comentario": "Outside grouping with-respect-to eminence . Using adhering to the above indeed .",
    "pagina": 165
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Manifest grouping . The king avails of three beaters . Letting-go the preceding wildfowl . The capital ’s people not admonished . Significant .",
    "comentario": "Manifest grouping’s significance . Position correct in the center indeed . Stowing away revolt , grasping yielding . Letting-go the preceding wildfowl . The capital ’s people not admonished . Above commissioning in the center indeed .",
    "pagina": 166
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Grouping without a head . Pitfall .",
    "comentario": "Grouping without a head . Without a place to complete indeed .",
    "pagina": 167
   }
  ],
  "pagina": 160
 },
 {
  "numero": 9,
  "nomeFonte": "THE SMALL ACCUMULATING X",
  "pinyin": "Xiao Chu",
  "base": "The small accumulating . Growing . Shrouding clouds , not raining . Originating from my Western suburbs .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Returning to the origin ’s dao . Is it one’s fault? Significant .",
    "comentario": "Returning to the origin ’s dao . One’s righteousness , significant indeed .",
    "pagina": 173
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Hauling-along returning . Significant .",
    "comentario": "Hauling-along returning located in the center . Truly not the origin letting-go indeed .",
    "pagina": 174
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Carting : stimulating the spokes . Husband and consort reversing the eyes .",
    "comentario": "Husband and consort reversing the eyes . Not able to correct the home indeed .",
    "pagina": 175
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Possessing conformity . Blood departing , awe emerging . Without fault .",
    "comentario": "Possessing conformity , awe emerging . Above uniting purposes indeed .",
    "pagina": 176
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Possessing conformity , binding thus . Affluence : using one’s neighbor .",
    "comentario": "Possessing conformity , binding thus . Not solitary affluence indeed .",
    "pagina": 176
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Already rain , already abiding . Honoring actualizing-dao : carrying . The wife ’s Trial : adversity . The moon almost full . A jun zi disciplining , pitfall .",
    "comentario": "Already rain , already abiding . Actualizing-dao amassing : carrying indeed . A jun zi disciplining , pitfall . Possessing a place to doubt indeed .",
    "pagina": 177
   }
  ],
  "pagina": 170
 },
 {
  "numero": 10,
  "nomeFonte": "TREADING",
  "pinyin": "Lü",
  "base": "Treading on a tiger ’s tail . Not snapping at people . Growing .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Sheer treading : going . Without fault .",
    "comentario": "Sheer treading’s going . Solitarily moving desire indeed .",
    "pagina": 184
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Treading in dao : smoothing , smoothing . Shady people : Trial , significant .",
    "comentario": "Shady people : Trial , significant . The center not the origin of disarray indeed .",
    "pagina": 184
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Squinting enables observing . Halting enables treading . Treading on a tiger ’s tail . Snapping at people : pitfall . Martial people activate tending-towards the great in the chief .",
    "comentario": "Squinting enables observing . Not the stand to use possessing brightness indeed . Halting enables treading . Not the stand to use associating with movement indeed . Snapping at people’s pitfall . Position not appropriate indeed . Martial people activate tending-towards the great in the chief . Purpose solid indeed .",
    "pagina": 185
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Treading on a tiger ’s tail . Watch-out ! Watch-out ! Completing significant .",
    "comentario": "Watch-out ! Watch-out ! Completing significant . Purpose moving indeed .",
    "pagina": 187
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Parting , treading . Trial , adversity .",
    "comentario": "Parting , treading : Trial , adversity . Position correct and appropriate indeed .",
    "pagina": 187
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Observing treading : predecessors auspicious . One’s recurring Spring , significant .",
    "comentario": "Spring : significance located above . The great possesses reward indeed .",
    "pagina": 188
   }
  ],
  "pagina": 180
 },
 {
  "numero": 11,
  "nomeFonte": "COMPENETRATION T",
  "pinyin": "Tai",
  "base": "Compenetration . The small going , the great coming . Significance Growing .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Eradicating thatch-grass intertwisted . Using one’s classification . Disciplining , significant .",
    "comentario": "Eradicating thatch-grass: disciplining, significant. Purpose located outside indeed.",
    "pagina": 195
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Enwrapped in wasteland. Availing of crossing the watercourse. Not putting-off abandoning. Partnering extinguished. Acquiring honor tending-towards the center : movement .",
    "comentario": "Enwrapped in wasteland , acquiring honor tendingtowards the center : movement. Using the shining great indeed .",
    "pagina": 195
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Without evening , not unevening. Without going , not returning. Drudgery : Trial , without fault. No cares : one’s conformity . Tending-towards taking-in possesses blessing .",
    "comentario": "Without going , not returning . Heaven and earth ’s border indeed .",
    "pagina": 196
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Fluttering , fluttering. Not affluence : using one’s neighbor . Not warning : using conformity .",
    "comentario": "Fluttering , fluttering , not affluence . Altogether letting-go the substance indeed . Not warning : using conformity . In the center the heart ’s desire indeed .",
    "pagina": 197
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Supreme Burgeoning converting maidenhood . Using satisfaction : Spring , significant .",
    "comentario": "Using satisfaction : Spring , significant . In the center using the movement of desire indeed .",
    "pagina": 198
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "The bulwark returns tending-towards the moat . No availing of legions. Originating from the capital , notifying fate . Trial , abashment .",
    "comentario": "The bulwark returns tending-towards the moat . One’s fate disarrayed indeed .",
    "pagina": 199
   }
  ],
  "pagina": 191
 },
 {
  "numero": 12,
  "nomeFonte": "OBSTRUCTION",
  "pinyin": "Pi",
  "base": "Obstruction’s in-no-way people . Not harvesting : a jun zi ’s Trial . The great going , the small coming .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Eradicating thatch-grass intertwisted . Using one’s classification. Trial , significant. Growing .",
    "comentario": "Eradicating thatch-grass : Trial , significant . Purpose located in a chief indeed .",
    "pagina": 205
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Enwrapped in receiving . The small in the person significant . The great in the person obstructed . Growing .",
    "comentario": "The great in the person obstructed . Growing. Not disarraying the flock indeed .",
    "pagina": 206
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Enwrapped in embarrassment .",
    "comentario": "Enwrapped in embarrassment . Position not appropriate indeed .",
    "pagina": 207
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Possessing fate , without fault . Cultivating radiant satisfaction .",
    "comentario": "Possessing fate , without fault . Purpose moving indeed .",
    "pagina": 208
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Relaxing the obstruction . The great in the person’s significance. Its extinction , its extinction. Attachment tending-towards a grove of mulberry-trees .",
    "comentario": "The great in the person’s significance . Position correct and appropriate indeed .",
    "pagina": 208
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Subverting the obstruction . Beforehand obstruction , afterwards joy .",
    "comentario": "Obstruction completed , by consequence subverting . Is it permitted long-living indeed?",
    "pagina": 209
   }
  ],
  "pagina": 202
 },
 {
  "numero": 13,
  "nomeFonte": "CONCORDING PEOPLE",
  "pinyin": "Tong Ren",
  "base": "Concording people tend-towards the countryside. Growing. Harvesting: wading the great river. Harvesting : a jun zi ’s Trial .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Concording people tend-towards the gate . Without fault .",
    "comentario": "Emerging from the gate concording people . Furthermore whose fault indeed?",
    "pagina": 215
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Concording people tend-towards the ancestors . Abashment .",
    "comentario": "Concording people tend-towards the ancestors . Abashment : dao indeed .",
    "pagina": 216
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Hiding-away weapons tending-towards the thickets . Ascending one’s high mound. Three year’s-time not rising .",
    "comentario": "Hiding-away weapons tending-towards the thickets . Antagonistic solid indeed. Three year’s-time not rising. Peaceful movement indeed .",
    "pagina": 216
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Riding one’s rampart. Nowhere controlling aggression . Significant .",
    "comentario": "Riding one’s rampart. Righteousness nowhere controlling indeed . One’s significance . By consequence confinement and-also reversal by consequence indeed .",
    "pagina": 217
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Concording people beforehand cry-out and sob andalso afterwards laugh. Great legions control the reciprocal meeting .",
    "comentario": "Concording people’s before. Using the center : straightening indeed . Great legions control the reciprocal meeting . Words reciprocally controlling indeed .",
    "pagina": 218
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Concording people tend-towards the suburbs . Without repenting .",
    "comentario": "Concording people tend-towards the suburbs . Purpose not-yet acquired indeed .",
    "pagina": 219
   }
  ],
  "pagina": 212
 },
 {
  "numero": 14,
  "nomeFonte": "THE GREAT POSSESSING",
  "pinyin": "Da You",
  "base": "The great possessing . Spring , Growing .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Without mingling with harm . In-no-way faulty. Drudgery by consequence without fault .",
    "comentario": "The great possessing , initial nine . Without mingling with harm indeed .",
    "pagina": 226
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "The great chariot used to carry . Possessing directed going . Without fault .",
    "comentario": "The great chariot used to carry. Amassing in the center , not destroying indeed .",
    "pagina": 227
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "A prince avails of Growing tending-towards heavenly sonhood . The small in the person nowhere controlling .",
    "comentario": "A prince avails of Growing tending-towards heavenly sonhood . The small in the person harmful indeed .",
    "pagina": 228
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "In-no-way one’s preponderance . Without fault .",
    "comentario": "In-no-way one’s preponderance . Without fault. Brightness differentiates clearly indeed .",
    "pagina": 229
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Your conforming : mingling thus . Impressing thus . Significant .",
    "comentario": "Your conforming : mingling thus. Trustworthiness uses shooting-forth purpose indeed . Impressing thus’ significance. Versatility and-also without preparing indeed .",
    "pagina": 229
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "The origin in heaven shields it . Significant , without not Harvesting .",
    "comentario": "The great possessing , above : significant . The origin in heaven shields indeed .",
    "pagina": 230
   }
  ],
  "pagina": 223
 },
 {
  "numero": 15,
  "nomeFonte": "HUMBLING",
  "pinyin": "Qian",
  "base": "Humbling. Growing . A jun zi possesses completing .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Humbling , humbling : jun zi . Availing of wading the great river . Significant .",
    "comentario": "Humbling , humbling : jun zi. Lowliness uses originating herding indeed .",
    "pagina": 237
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "The call of humbling . Trial , significant .",
    "comentario": "The call of humbling. Trial , significant . In the center the heart acquiring indeed .",
    "pagina": 237
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "The toil of humbling : jun zi . Possessing completion , significant .",
    "comentario": "The toil of humbling : jun zi . The myriad commoners submit indeed .",
    "pagina": 238
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Without not harvesting : showing humbleness .",
    "comentario": "Without not harvesting : showing humbleness . Not contradicting by consequence indeed .",
    "pagina": 239
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Not affluence : using one’s neighbor. Harvesting : availing of encroaching and subjugating . Without not harvesting .",
    "comentario": "Harvesting : availing of encroaching and subjugating . Disciplining , not submitting indeed .",
    "pagina": 239
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "The call of humbling. Harvesting : availing of moving legions . Disciplining the capital city .",
    "comentario": "The call of humbling. Purpose not-yet acquired indeed . Permitted availing of moving legions . Disciplining the capital city indeed .",
    "pagina": 240
   }
  ],
  "pagina": 233
 },
 {
  "numero": 16,
  "nomeFonte": "PROVIDING",
  "pinyin": "Yu",
  "base": "Providing. Harvesting : installing feudatories , moving legions .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "The call of providing . Pitfall .",
    "comentario": "Initial six : the call of providing . Purpose exhausted , pitfall indeed .",
    "pagina": 247
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "The cuirass tends-towards petrification . Not completing the day. Trial , significant .",
    "comentario": "Not completing the day , Trial , significant . Using the center ’s correctness indeed .",
    "pagina": 247
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Skeptical providing : repenting . Procrastinating possesses repenting .",
    "comentario": "Skeptical providing possesses repenting . Position not appropriate indeed .",
    "pagina": 248
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Antecedent providing . The great possesses acquiring . No doubt. Partners join-together suddenly .",
    "comentario": "Antecedent providing , the great possesses acquiring . Purpose : the great moving indeed .",
    "pagina": 249
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Trial , affliction . Persevering , not dying .",
    "comentario": "Six at fifth : Trial , affliction. Riding a solid indeed. Persevering , not dying . The center not-yet extinguished indeed .",
    "pagina": 250
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Dim providing. Accomplishment possesses retraction . Without fault .",
    "comentario": "Dim providing located above. Is it permitted long-living indeed?",
    "pagina": 250
   }
  ],
  "pagina": 243
 },
 {
  "numero": 17,
  "nomeFonte": "FOLLOWING",
  "pinyin": "Sui",
  "base": "Following. Spring , Growing , Harvesting , Trial . Without fault .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "An official possesses retraction. Trial , significant. Emerging from the gate , mingling possesses achievement .",
    "comentario": "An official possesses retraction. Adhering to correctness , significant indeed . Emerging from the gate , mingling possesses achievement. Not letting-go indeed .",
    "pagina": 257
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Tied to the small son. Letting-go the respectable husband .",
    "comentario": "Tied to the small son. Nowhere joining in association indeed .",
    "pagina": 258
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Tied to the respectable husband . Letting-go the small son. Following possesses seeking and acquiring . Harvesting : residing in Trial .",
    "comentario": "Tied to the respectable husband . Purpose : stowing away the below indeed .",
    "pagina": 259
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Following possesses capture. Trial , pitfall. Possessing conformity , locating in dao , using brightness. Is it faulty ?",
    "comentario": "Following possesses capture. One’s righteousness : pitfall indeed . Possessing conformity , locating in dao . Brightness achieving indeed .",
    "pagina": 260
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Conformity tends-towards excellence . Significant .",
    "comentario": "Conformity tends-towards excellence , significant . Position correct in the center indeed .",
    "pagina": 261
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Grappling ties to it. Thereupon adhering : holding-fast to it . The king avails of Growing tending-towards the Western mountain .",
    "comentario": "Grappling ties to it . Above exhausted indeed .",
    "pagina": 261
   }
  ],
  "pagina": 254
 },
 {
  "numero": 18,
  "nomeFonte": "DECAY",
  "pinyin": "Gu",
  "base": "Decay. Spring , Growing. Harvesting : wading the great river . Before seedburst three days. After seedburst three days .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Managing the father’s decay . Possessing sonhood . Predecessors without fault . Adversity ’s completion , significant .",
    "comentario": "Managing the father’s decay. Intention received from the predecessors indeed .",
    "pagina": 267
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Managing the mother ‘s decay. Not permitting Trial .",
    "comentario": "Managing the mother ‘s decay . Acquiring the center : dao indeed .",
    "pagina": 268
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Managing the father’s decay . The small possesses repenting . Without the great , faulty .",
    "comentario": "Managing the father’s decay . Completing without fault indeed .",
    "pagina": 269
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Enriching the father’s decay . Going , viewing abashment .",
    "comentario": "Enriching the father’s decay . Going , not-yet acquiring indeed .",
    "pagina": 270
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Managing the father’s decay . Availing of praise .",
    "comentario": "Managing the father avails of praise . Receiving uses actualizing-dao indeed .",
    "pagina": 271
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Not affairs , a king ’s feudatory . Honoring highness : one’s affair .",
    "comentario": "Not affairs , a king ’s feudatory. Purpose permitted by consequence indeed .",
    "pagina": 271
   }
  ],
  "pagina": 264
 },
 {
  "numero": 19,
  "nomeFonte": "NEARING",
  "pinyin": "Lin",
  "base": "Nearing. Spring , Growing , Harvesting , Trial . Culminating tending-towards the eighth moon possesses a pitfall .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Conjunction nearing : Trial , significant .",
    "comentario": "Conjunction nearing : Trial , significant . Purpose moving correctly indeed .",
    "pagina": 277
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Conjunction nearing , significant . Without not Harvesting .",
    "comentario": "Conjunction nearing , significant . Without not Harvesting. Not-yet yielding to fate indeed .",
    "pagina": 278
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Sweetness nearing. Without direction Harvesting . Already grieving over it . Without fault .",
    "comentario": "Sweetness nearing. Position not appropriate indeed . Already grieving over it. Fault not long-living indeed .",
    "pagina": 279
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Culmination nearing . Without fault .",
    "comentario": "Culmination nearing , without fault . Position appropriate indeed .",
    "pagina": 280
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Knowledge nearing . The great chief’s propriety . Significant .",
    "comentario": "The great chief’s propriety. Moving the center’s designating indeed .",
    "pagina": 280
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Magnanimity nearing . Significant. Without fault .",
    "comentario": "Magnanimity nearing’s significance . Purpose located inside indeed .",
    "pagina": 281
   }
  ],
  "pagina": 274
 },
 {
  "numero": 20,
  "nomeFonte": "OVERSEEING G",
  "pinyin": "Guan",
  "base": "Overseeing. Hand-washing and-also not worshipping . Possessing conformity like a presence .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Youthful overseeing . The small in the person : without fault . A jun zi : abashment .",
    "comentario": "Initial six , youthful overseeing . The small in the person ’s dao indeed .",
    "pagina": 287
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Peeping overseeing . Harvesting : woman ’s Trial .",
    "comentario": "Peeping overseeing : woman ’s Trial . Truly permitting the demoniac indeed .",
    "pagina": 288
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Overseeing my generation : advancing , withdrawing .",
    "comentario": "Overseeing my generation : advancing , withdrawing . Not-yet letting-go dao indeed .",
    "pagina": 288
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Overseeing the city’s shine. Harvesting : availing of hospitality tending-towards the king .",
    "comentario": "Overseeing the city’s shine . Honoring hospitality indeed .",
    "pagina": 289
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Overseeing my generation . A jun zi : without fault .",
    "comentario": "Overseeing my generation . Overseeing the commoners indeed .",
    "pagina": 290
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Overseeing one’s generation . A jun zi : without fault .",
    "comentario": "Overseeing one’s generation . Purpose not-yet evened indeed .",
    "pagina": 290
   }
  ],
  "pagina": 284
 },
 {
  "numero": 21,
  "nomeFonte": "GNAWING AND BITING",
  "pinyin": "Shi He",
  "base": "Gnawing and biting. Growing. Harvesting: availing of litigating.",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Shoes locked-up , submerged feet . Without fault .",
    "comentario": "Shoes locked-up , submerged feet . Not moving indeed .",
    "pagina": 296
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Gnawing flesh , submerging the nose . Without fault .",
    "comentario": "Gnawing flesh , submerging the nose . Riding a solid indeed .",
    "pagina": 297
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Gnawing seasoned meat . Meeting poison . The small : abashment . Without fault .",
    "comentario": "Meeting poison. Position not appropriate indeed .",
    "pagina": 297
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Gnawing parched meat-bones . Acquiring a metallic arrow . Harvesting drudgery , Trial . Significant .",
    "comentario": "Harvesting drudgery , Trial : significant . Not-yet shining indeed .",
    "pagina": 298
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Gnawing parched meat . Acquiring yellow metal . Trial , adversity . Without fault .",
    "comentario": "Trial , adversity without fault . Acquiring : appropriate indeed .",
    "pagina": 299
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Is not locking-up submerging the ears ? Pitfall .",
    "comentario": "Is not locking-up submerging the ears ? Understanding not bright indeed .",
    "pagina": 300
   }
  ],
  "pagina": 293
 },
 {
  "numero": 22,
  "nomeFonte": "ADORNING",
  "pinyin": "Bi",
  "base": "Adorning, Growing . The small. Harvesting : possessing directed going .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Adorning one’s feet. Stowing the chariot and-also afoot .",
    "comentario": "Stowing the chariot and-also afoot . Righteously nothing to ride indeed .",
    "pagina": 305
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Adorning : one’s hair-growing .",
    "comentario": "Adorning : one’s hair-growing . Associating above , rising indeed .",
    "pagina": 306
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Adorned thus , soaked thus . Perpetual Trial , significant .",
    "comentario": "Perpetual Trial’s significance . Completing abstention’s mound indeed .",
    "pagina": 306
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Adorned thus , hoary thus . A white horse soaring thus. In-no-way illegality , matrimonial alliance .",
    "comentario": "Six at fourth . An appropriate position to doubt indeed . In-no-way illegality , matrimonial alliance . Completing without surpassing indeed .",
    "pagina": 307
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Adorning tends-towards a hill-top garden . A roll of plain-silk : petty , petty . Abashment. Completing significant .",
    "comentario": "Six at fifth’s significance . Possessing joy indeed .",
    "pagina": 308
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "White adorning . Without fault .",
    "comentario": "White adorning , without fault . Above acquiring purpose indeed .",
    "pagina": 309
   }
  ],
  "pagina": 302
 },
 {
  "numero": 23,
  "nomeFonte": "STRIPPING",
  "pinyin": "Bo",
  "base": "Stripping. Not Harvesting : possessing directed going .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Stripping the bed , using the stand . Discarding Trial , pitfall .",
    "comentario": "Stripping the bed , using the stand . Using submerging below indeed .",
    "pagina": 315
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Stripping the bed , using marking-off . Discarding Trial , pitfall .",
    "comentario": "Stripping the bed , using marking-off . Not-yet possessing association indeed .",
    "pagina": 315
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Stripping’s without fault .",
    "comentario": "To stripping belongs without fault . Letting-go above and below indeed .",
    "pagina": 316
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Stripping the bed , using the flesh . Pitfall .",
    "comentario": "Stripping the bed , using the flesh . Slicing close to calamity indeed .",
    "pagina": 317
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Threading fish . Using house people ’s favor . Without not Harvesting .",
    "comentario": "Using house people ’s favor . Completing without surpassing indeed .",
    "pagina": 317
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "The ripe fruit not taken-in . A jun zi acquires a cart . The small in the person strips the hut .",
    "comentario": "A jun zi acquires a cart. Commoners acquire a place to carry indeed . The small in the person strips the hut . Completing not permitted availing of indeed .",
    "pagina": 318
   }
  ],
  "pagina": 312
 },
 {
  "numero": 24,
  "nomeFonte": "RETURN",
  "pinyin": "Fu",
  "base": "Return. Growing. Emerging, entering, without affliction. Partners come, without fault. Reversing: returning to one’s dao . The seventh day comes return. Harvesting: possessing directed going .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Not distancing return . Without merely repenting . Spring , significant .",
    "comentario": "Not distancing’s return . Using adjusting individuality indeed .",
    "pagina": 325
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Relaxing return. Significant .",
    "comentario": "Relaxing return’s significance. Below using humanity indeed .",
    "pagina": 326
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Imminent return. Adversity. Without fault .",
    "comentario": "Imminent return’s adversity. Righteous, without fault indeed .",
    "pagina": 327
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "The center moving , solitary return .",
    "comentario": "The center moving, solitary return. Using adhering to dao indeed .",
    "pagina": 327
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Magnanimous return. Without repenting .",
    "comentario": "Magnanimous return, without repenting . The center uses the origin from the predecessors indeed .",
    "pagina": 328
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Deluding return. Pitfall. Possessing calamity and blunder . Availing of moving legions . Completing possesses great destruction. Using one’s city’s chief: pitfall. Culminating tending-towards ten years not controlling disciplining.",
    "comentario": "Deluding return’s pitfall . Reversing the chief ’s dao indeed .",
    "pagina": 328
   }
  ],
  "pagina": 321
 },
 {
  "numero": 25,
  "nomeFonte": "WITHOUT ENTANGLEMENT W",
  "pinyin": "Wu Wang",
  "base": "Without entanglement. Spring, Growing, Harvesting, Trial. One’s in-no-way correcting possesses blunder . Not Harvesting: possessing directed going.",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Without entanglement. Going, significant.",
    "comentario": "Without entanglement’s going . Acquiring purpose indeed .",
    "pagina": 335
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Not tilling the crop . Not clearing the plow-land . By consequence , Harvesting : possessing directed going .",
    "comentario": "Not tilling the crop . Not-yet affluence indeed .",
    "pagina": 336
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Without entanglement’s calamity . Maybe attaching’s cattle . Moving people’s acquiring . Capital people’s calamity .",
    "comentario": "Moving people acquire cattle . Capital ’s people , calamity indeed .",
    "pagina": 337
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Permitting Trial . Without fault .",
    "comentario": "Permitting Trial , without fault . Firmly possessing it indeed .",
    "pagina": 337
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Without entanglement’s affliction . No simple possesses joy .",
    "comentario": "Without entanglement’s simples . Not permitted testing indeed .",
    "pagina": 338
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Without entanglement . Moving possesses blunder . Without direction Harvesting .",
    "comentario": "Without entanglement’s movement . Exhaustion’s calamity indeed .",
    "pagina": 339
   }
  ],
  "pagina": 332
 },
 {
  "numero": 26,
  "nomeFonte": "THE GREAT ACCUMULATING D",
  "pinyin": "Da Chu",
  "base": "The great accumulating . Harvesting , Trial . Not in the household taking-in . Significant . Harvesting : wading the great river .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Possessing adversity. Harvesting: climaxing.",
    "comentario": "Possessing adversity , Harvesting , climaxing . Not opposing calamity indeed .",
    "pagina": 346
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Carting : stimulating the axle-bearing .",
    "comentario": "Carting : stimulating the axle-bearing . The center , without surpassing indeed .",
    "pagina": 346
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "A fine horse , pursuing . Harvesting drudgery , Trial . Named : enclosing the cart , escorting . Harvesting : possessing directed going .",
    "comentario": "Harvesting : possessing directed going . Above uniting purposes indeed .",
    "pagina": 347
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Youthful cattle’s stable . Spring , significant .",
    "comentario": "Six at fourth : Spring , significant . Possessing joy indeed .",
    "pagina": 347
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "A gelded pig’s tusks . Significant .",
    "comentario": "Six at fifth’s significance . Possessing reward indeed .",
    "pagina": 348
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Is it not heaven’s highway? Growing .",
    "comentario": "Is it not heaven’s highway? Dao : the great moving indeed .",
    "pagina": 349
   }
  ],
  "pagina": 342
 },
 {
  "numero": 27,
  "nomeFonte": "THE JAWS",
  "pinyin": "Yi",
  "base": "The jaws . Trial , significant . Overseeing the jaws . The origin of seeking mouth ’s substance .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Stowing simply the magic tortoise. Overseeing my pendent jaw. Pitfall.",
    "comentario": "Overseeing my pendent jaw . Truly not a stand for valuing indeed .",
    "pagina": 355
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Toppling jaws . Rejecting the canons , tending-towards the hill-top . The jaws disciplined , pitfall .",
    "comentario": "Six at second : disciplining , pitfall . Movement letting-go sorting indeed .",
    "pagina": 356
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Rejecting the jaws . Trial , pitfall . Ten years , no availing of. Without direction Harvesting .",
    "comentario": "Ten years , no availing of. Dao : the great rebels indeed .",
    "pagina": 357
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Toppling jaws . Significant . A tiger observing : glaring , glaring . Its appetites : pursuing , pursuing . Without fault .",
    "comentario": "Toppling jaws’ significance . Above spreading shine indeed .",
    "pagina": 357
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Rejecting the canons . Residing in Trial , significant . Not permitted to wade the great river .",
    "comentario": "Residing in Trial’s significance . Yielding uses adhering to the above indeed .",
    "pagina": 358
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Antecedent jaws . Adversity , significant . Harvesting : wading the great river .",
    "comentario": "Antecedent jaws , adversity , significant . The great possesses reward indeed .",
    "pagina": 359
   }
  ],
  "pagina": 352
 },
 {
  "numero": 28,
  "nomeFonte": "THE GREAT EXCEEDING",
  "pinyin": "Da Guo",
  "base": "The great exceeding . The ridgepole sagging . Harvesting : possessing directed going . Growing .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Sacrificing avails of white thatch-grass . Without fault .",
    "comentario": "Sacrificing avails of white thatch-grass . The supple located below indeed .",
    "pagina": 365
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "A withered willow generates a sprig . A venerable husband acquires his woman consort . Without not Harvesting .",
    "comentario": "A venerable husband and a woman consort . Exceeding uses reciprocal association indeed .",
    "pagina": 366
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "The ridgepole buckling . Pitfall .",
    "comentario": "The ridgepole buckling’s pitfall . Not permitted to use the possession of bracing indeed .",
    "pagina": 367
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "The ridgepole crowning . Significant . Possessing more : abashment .",
    "comentario": "The ridgepole crowning’s significance . Not sagging , reaching the below indeed .",
    "pagina": 367
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "A withered willow generates flowers . A venerable wife acquires her scholarly husband . Without fault , without praise .",
    "comentario": "A withered willow generates flowers . Is it permitted to last indeed ? A venerable wife and a scholarly husband . Truly permitting the demoniac indeed .",
    "pagina": 368
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Exceeding wading , submerging the peak . Pitfall . Without fault .",
    "comentario": "Exceeding wading’s pitfall . Not permitted fault indeed .",
    "pagina": 369
   }
  ],
  "pagina": 362
 },
 {
  "numero": 29,
  "nomeFonte": "THE GORGE K",
  "pinyin": "Kan",
  "base": "Repeated gorge . Possessing conformity . Holding-fast the heart , Growing . Movement possesses honor .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Repeated gorge . Entering tending-towards the gorge ’s recess . Pitfall .",
    "comentario": "Repeated gorge : entering the gorge . Letting-go dao : pitfall indeed .",
    "pagina": 375
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "The gorge possesses venturing . Seeking the small : acquiring .",
    "comentario": "Seeking the small : acquiring . Not-yet emerging from the center indeed .",
    "pagina": 375
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Coming’s gorge, gorge . Venturing , moreover reclining . Entering tending-towards the gorge ’s recess . No availing of.",
    "comentario": "Coming’s gorge, gorge . Completing without achieving indeed .",
    "pagina": 376
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "A cup of liquor , a platter added . Availing of a jar . Letting-in bonds originating from the window . Completing , without fault .",
    "comentario": "A cup of liquor , a platter added . Solid and supple ’s border indeed .",
    "pagina": 377
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "The gorge not overfilled . Merely already evened . Without fault .",
    "comentario": "The gorge not overfilled . In the center not-yet the great indeed .",
    "pagina": 378
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Tied availing of stranded ropes . Dismissing tending-towards dense jujube-trees . Three year’s-time , not acquiring . Pitfall .",
    "comentario": "Six above , letting-go dao . Pitfall , three year’s-time indeed .",
    "pagina": 379
   }
  ],
  "pagina": 372
 },
 {
  "numero": 30,
  "nomeFonte": "THE RADIANCE L",
  "pinyin": "Li",
  "base": "The radiance . Harvesting , Trial . Growing . Accumulating female cattle . Significant .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Treading, polishing, therefore respecting it. Without fault.",
    "comentario": "Treading and polishing’s respect . Using expelling fault indeed .",
    "pagina": 385
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Yellow radiance . Spring , significant .",
    "comentario": "Yellow radiance , Spring , significant . Acquiring the center : dao indeed .",
    "pagina": 386
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Setting sun’s radiance . Not drumbeating a jar and-also singing . By consequence great old-age’s lamenting . Pitfall .",
    "comentario": "Setting sun’s radiance . Is it permitted to last indeed ?",
    "pagina": 386
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Assailing thus , its coming thus . Burning thus . Dying thus . Thrown-out thus .",
    "comentario": "Assailing thus , its coming thus . Without a place of tolerance indeed .",
    "pagina": 387
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Emerging tears like gushing . Sadness like lamenting . Significant .",
    "comentario": "Six at fifth’s significance . Radiance : king and princes indeed .",
    "pagina": 388
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "The king avails of emerging to discipline . Possessing excellence . Severing the head . Capturing in-no-way its demons . Without fault .",
    "comentario": "The king avails of emerging to discipline . Using correcting the fiefdoms indeed .",
    "pagina": 389
   }
  ],
  "pagina": 382
 },
 {
  "numero": 31,
  "nomeFonte": "CONJUNCTION X",
  "pinyin": "Xian",
  "base": "Conjunction . Growing , Harvesting , Trial . Grasping womanhood , significant .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Conjunction of one’s big-toes .",
    "comentario": "Conjunction of one’s big-toes . Purpose located outside indeed .",
    "pagina": 396
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Conjunction of one’s calves . Pitfall . Residing , significant .",
    "comentario": "Although a pitfall , residing significant . Yielding not harmful indeed .",
    "pagina": 396
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Conjunction of one’s thighs . Holding-on to one’s following . Going , abashment .",
    "comentario": "Conjunction of one’s thighs . Truly not abiding indeed . Purpose located in following people . A place for holding-on to the below indeed .",
    "pagina": 397
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Trial , significant . Repenting extinguished . Wavering , wavering : going , coming . Partners adhere to simply pondering .",
    "comentario": "Trial , significant . Repenting extinguished . Not-yet influencing harmful indeed . Wavering , wavering : going , coming . Not-yet the shining great indeed .",
    "pagina": 398
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Conjunction of one’s neck . Without repenting .",
    "comentario": "Conjunction of one’s neck . The purpose ’s tip indeed .",
    "pagina": 399
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Conjunction of one’s jawbones , cheeks and tongue .",
    "comentario": "Conjunction of one’s jawbones , cheeks and tongue . The spouting mouth stimulating indeed .",
    "pagina": 399
   }
  ],
  "pagina": 392
 },
 {
  "numero": 32,
  "nomeFonte": "PERSEVERING H",
  "pinyin": "Heng",
  "base": "Persevering . Growing . Without fault . Harvesting , Trial . Harvesting : possessing directed going .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Diving persevering : Trial , pitfall . Without direction Harvesting .",
    "comentario": "Diving persevering’s pitfall . Beginning seeking depth indeed .",
    "pagina": 406
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Repenting extinguished .",
    "comentario": "Nine at second , repenting extinguished . Able to last in the center indeed .",
    "pagina": 407
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Not persevering in one’s actualizing-dao . Maybe receiving’s embarassment . Trial , abashment .",
    "comentario": "Not persevering in one’s actualizing-dao . Without a place to tolerate indeed .",
    "pagina": 408
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "The fields without wildfowl .",
    "comentario": "No lasting whatever in one’s position . Peacefully acquiring wildfowl indeed .",
    "pagina": 408
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Persevering in one’s actualizing-dao , Trial . The wife ’s people , significant . The husband and the son , pitfall .",
    "comentario": "The wife ’s people : Trial , significant . Adhering to the one and-also completing indeed . The husband and the son , paring righteously . Adhering to the wife , pitfall indeed .",
    "pagina": 409
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Rousing persevering , pitfall .",
    "comentario": "Rousing persevering located above . The great without achievement indeed .",
    "pagina": 410
   }
  ],
  "pagina": 403
 },
 {
  "numero": 33,
  "nomeFonte": "RETIRING",
  "pinyin": "Dun",
  "base": "Retiring . Growing . The small , Harvesting , Trial .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Retiring tail, adversity . No availing of possessing directed going .",
    "comentario": "Retiring tail’s adversity . Not going , is it a calamity indeed?",
    "pagina": 417
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Holding-on avails of yellow cattle’s skin . From abstaining derives mastering stimulation .",
    "comentario": "Holding-on avails of yellow cattle . Firm purpose indeed .",
    "pagina": 418
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Tied retiring . Possessing affliction , adversity . Accumulating servants , concubines , significant .",
    "comentario": "Tied retiring’s adversity . Possessing affliction , weariness indeed . Accumulating servants , concubines , significant . Not permitted the great in affairs indeed .",
    "pagina": 419
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Loving retiring . A jun zi , significant . The small in the person obstructing .",
    "comentario": "A jun zi lovingly retiring . The small in the person obstructing indeed .",
    "pagina": 420
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Excellent retiring , Trial , significant .",
    "comentario": "Excellent retiring , Trial , significant . Using the correct purpose indeed .",
    "pagina": 420
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Rich retiring , without not Harvesting .",
    "comentario": "Rich retiring , without not Harvesting . Without a place to doubt indeed .",
    "pagina": 421
   }
  ],
  "pagina": 414
 },
 {
  "numero": 34,
  "nomeFonte": "THE GREAT",
  "pinyin": "Da Zhuang",
  "base": "The great ’s vigor . Harvesting , Trial .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Vigor tends-towards the feet . Disciplining, pitfall . Possessing conformity .",
    "comentario": "Vigor tends-towards the feet . One’s conformity exhausted indeed .",
    "pagina": 426
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Trial , significant .",
    "comentario": "Nine at second : Trial , significant . Using the center indeed .",
    "pagina": 427
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "The small in the person avails of vigor . A jun zi avails of absence . Trial , adversity . The he-goat butts a hedge . Ruins its horns .",
    "comentario": "The small in the person avails of vigor . A jun zi of absence indeed .",
    "pagina": 427
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Trial , significant . Repenting extinguished . The hedge broken-up , not ruined . Vigor tends-towards the great cart’s axle-bearings .",
    "comentario": "The hedge broken-up , not ruined . Honoring going indeed .",
    "pagina": 428
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Losing the goat , tending-towards versatility . Without repenting .",
    "comentario": "Losing the goat , tending-towards versatility . Position not appropriate indeed .",
    "pagina": 429
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "The he-goat butts a hedge . Not able to withdraw , not able to release . Without direction Harvesting . Drudgery , by consequence significant .",
    "comentario": "Not able to withdraw , not able to release . Not ruminating indeed . Drudgery , by consequence significant . Fault not long-living indeed .",
    "pagina": 430
   }
  ],
  "pagina": 423
 },
 {
  "numero": 35,
  "nomeFonte": "PROSPERING",
  "pinyin": "Jin",
  "base": "Prospering . A content feudatory avails of bestowing horses to enhance the multitudes . Day-time sun thrice reflected .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Prospering thus , arresting thus . Trial , significant . Absence : conforming . Enriching , without fault .",
    "comentario": "Prospering thus , arresting thus . Solitary movement : correcting indeed . Enriching , without fault . Not-yet acquiescing in fate indeed .",
    "pagina": 435
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Prospering thus , apprehensive thus . Trial , significant . Acquiescing in a compact cuirass : blessing . Tending-towards one’s kingly mother .",
    "comentario": "Acquiescing in a compact cuirass : blessing . Using the center ’s correctness indeed .",
    "pagina": 436
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Crowds : sincerity , repenting extinguished .",
    "comentario": "Crowds : sincerity’s purpose . Above moving indeed .",
    "pagina": 437
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Prospering , thus bushy-tailed rodents . Trial , adversity .",
    "comentario": "Bushy-tailed rodents : Trial , adversity . Position not appropriate indeed .",
    "pagina": 438
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Repenting extinguished . Letting-go , acquiring : no cares . Going significant , without not Harvesting .",
    "comentario": "Letting-go , acquiring : no cares . Going possesses reward indeed .",
    "pagina": 438
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Prospering : one’s horns . Holding-fast avails of subjugating the capital . Adversity , significant . Without fault . Trial , abashment .",
    "comentario": "Holding-fast avails of subjugating the capital . Dao not-yet shining indeed .",
    "pagina": 439
   }
  ],
  "pagina": 432
 },
 {
  "numero": 36,
  "nomeFonte": "BRIGHTNESS HIDDEN",
  "pinyin": "Ming Yi",
  "base": "Brightness hidden . Harvesting : drudgery , Trial .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Brightness hidden tends-towards flying. Drooping one’s wings. A jun zi tends-towards moving . Three days not taking-in . Possessing directed going . A lordly person possesses words .",
    "comentario": "A jun zi tends-towards moving . Righteously not taking-in indeed .",
    "pagina": 445
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Brightness hidden . Hiding tending-towards the left thigh . Availing of a rescuing horse ’s vigor , significant .",
    "comentario": "Six at second’s significance . Yielding used by consequence indeed .",
    "pagina": 446
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Brightness hidden tends-towards the Southern hounding . Acquiring one’s great ’s head . Not permitted affliction , Trial .",
    "comentario": "Southern hounding’s purpose . Thereupon acquiring the great indeed .",
    "pagina": 447
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Entering tending-towards the left of the belly . Capturing brightness hidden’s heart . Tending-towards emerging from the gate chambers .",
    "comentario": "Entering tending-towards the left of the belly . Capturing the heart : intention indeed .",
    "pagina": 448
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "The Winnowing Son’s brightness hidden . Harvesting , Trial .",
    "comentario": "The Winnowing Son’s Trial . Brightness not permitted to pause indeed .",
    "pagina": 449
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Not brightness , darkness . Initially mounting tending-towards heaven . Afterwards entering tending-towards earth .",
    "comentario": "Initially mounting tending-towards heaven . Illuminating the four cities indeed . Afterwards entering tending-towards earth . Letting-go by consequence indeed .",
    "pagina": 449
   }
  ],
  "pagina": 442
 },
 {
  "numero": 37,
  "nomeFonte": "HOUSEHOLD PEOPLE",
  "pinyin": "Jia Ren",
  "base": "Household people . Harvesting : woman ’s Trial .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Enclosure : possessing household . Repenting extinguished .",
    "comentario": "Enclosure : possessing household . Purpose not-yet transformed indeed .",
    "pagina": 456
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Without direction releasing . Located in the center , feeding . Trial , significant .",
    "comentario": "Six at second’s significance . Yielding uses the root indeed .",
    "pagina": 457
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Household people , scolding , scolding . Repenting , adversity , significant . The wife , the son , giggling , giggling . Completing , abashment .",
    "comentario": "Household people, scolding, scolding. Not-yet letting-go indeed. The wife, the son, giggling, giggling. Letting-go the household’s articulation indeed.",
    "pagina": 457
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Affluent household : the great , significant .",
    "comentario": "Affluent household: the great, significant. Yielding located in the position indeed.",
    "pagina": 458
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "The king imagines possessing a household . Beings ’ care , significant .",
    "comentario": "The king imagines possessing a household . Mingling : reciprocal affection indeed .",
    "pagina": 459
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Possessing conformity , impressing thus . Completing , significant .",
    "comentario": "Impressing thus’ significance . Reversing individuality’s designation indeed .",
    "pagina": 460
   }
  ],
  "pagina": 453
 },
 {
  "numero": 38,
  "nomeFonte": "POLARIZING",
  "pinyin": "Kui",
  "base": "Polarizing . The small ’s affairs , significant .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Repenting extinguished . Losing the horse , no pursuing : originating from returning . Viewing hatred in the person . Without fault .",
    "comentario": "Viewing hatred in the person . Using expelling fault indeed .",
    "pagina": 466
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Meeting a lord tending-towards the street . Without fault .",
    "comentario": "Meeting a lord tending-towards the street . Not-yet letting-go dao indeed .",
    "pagina": 467
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Viewing the cart pulled-back . One’s cattle hampered . One’s person stricken , moreover nose-cut . Without initially possessing completion .",
    "comentario": "Viewing the cart pulled-back . Position not appropriate indeed . Without initially possessing completion . Meeting a solid indeed .",
    "pagina": 467
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Polarizing alone . Meeting Spring , husbanding . Mingling , conforming . Adversity , without fault .",
    "comentario": "Mingling , conforming , without fault . Purpose moving indeed .",
    "pagina": 468
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Repenting extinguished . Your ancestor gnawing flesh . Going , is it faulty?",
    "comentario": "Your ancestor gnawing flesh . Going possesses reward indeed .",
    "pagina": 469
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Polarizing alone . Viewing a pig bearing mire . Carrying souls : the one chariot . Beforehand the bow’s stretching . Afterwards the bow’s stimulating . In-no-way illegality , matrimonial alliance . Going meets rain , by consequence significant .",
    "comentario": "Meeting rain’s significance . The flock , doubt extinguished indeed .",
    "pagina": 470
   }
  ],
  "pagina": 463
 },
 {
  "numero": 39,
  "nomeFonte": "LIMPING",
  "pinyin": "Jian",
  "base": "Limping . Harvesting : Western South . Not Harvesting : Eastern North . Harvesting : viewing the great in the person . Trial , significant .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Going limping , coming praise .",
    "comentario": "Going limping , coming praise . Proper to await indeed .",
    "pagina": 477
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "A king , a servant : limping , limping . In-no-way the body’s anteriority .",
    "comentario": "A king , a servant : limping , limping . Completing without surpassing indeed .",
    "pagina": 478
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Going limping , coming reversal .",
    "comentario": "Going limping , coming reversal . Inside rejoicing in it indeed .",
    "pagina": 478
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Going limping , coming continuity .",
    "comentario": "Going limping , coming continuity . Appropriate position : substance indeed .",
    "pagina": 479
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "The great ’s limping , partners coming .",
    "comentario": "The great ’s limping , partners coming . Using the center articulating indeed .",
    "pagina": 480
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Going limping , coming ripeness . Significant . Harvesting : viewing the great in the person .",
    "comentario": "Going limping , coming ripeness . Purpose located inside indeed . Harvesting : viewing the great in the person . Using adhering to value indeed .",
    "pagina": 480
   }
  ],
  "pagina": 474
 },
 {
  "numero": 40,
  "nomeFonte": "UNRAVELING",
  "pinyin": "Jie",
  "pinyinFonte": "Xie",
  "base": "Unraveling . Harvesting : Western South . Without a place to go : one’s coming return , significant . Possessing directed going : daybreak , significant .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Without fault .",
    "comentario": "The solid and supple’s border . Righteous , without fault indeed .",
    "pagina": 487
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "The fields , capturing three foxes . Acquiring a yellow arrow . Trial , significant .",
    "comentario": "Nine at second : Trial , significant . Acquiring the center : dao indeed .",
    "pagina": 488
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Bearing , moreover riding . Involvement in illegality culminating . Trial , abashment .",
    "comentario": "Bearing , moreover riding . Truly permitting the demoniac indeed . Originating from my involvement with weapons . Furthermore whose fault indeed?",
    "pagina": 488
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Unraveling and-also the thumbs . Partnering culminating , splitting-off conforming .",
    "comentario": "Unraveling and-also the thumbs . Not-yet an appropriate position indeed .",
    "pagina": 490
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "A jun zi holding-fast possesses unraveling . Significant . Possessing conformity tending-towards the small in the person .",
    "comentario": "A jun zi possesses unraveling . The small in the person withdraws indeed .",
    "pagina": 490
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "A prince avails of shooting a hawk tending-towards the high rampart’s above . Capturing it , without not Harvesting .",
    "comentario": "A prince avails of shooting a hawk . Using unraveling rebellion indeed .",
    "pagina": 491
   }
  ],
  "pagina": 484
 },
 {
  "numero": 41,
  "nomeFonte": "DIMINISHING",
  "pinyin": "Sun",
  "base": "Diminishing . Possessing conformity . Spring , significant . Without fault , permitting Trial . Harvesting : possessing directed going . Availing of what? Two platters permit availing of presenting .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Climaxing affairs , swiftly going . Without fault . Discussing diminishing it .",
    "comentario": "Climaxing affairs , swiftly going . Honoring uniting purposes indeed .",
    "pagina": 499
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Harvesting , Trial . Disciplining , pitfall . Nowhere diminishing , augmenting it .",
    "comentario": "Nine at second : Harvesting , Trial . In the center using activating purpose indeed .",
    "pagina": 500
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Three people moving . By consequence diminishing by one person . One person moving . By consequence acquiring one’s friend .",
    "comentario": "One person moving . Three by consequence doubtful indeed .",
    "pagina": 501
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Diminishing one’s affliction . Commissioning swiftly possesses joy . Without fault .",
    "comentario": "Diminishing one’s affliction . Truly permitting joy indeed .",
    "pagina": 501
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Maybe augmenting it tenfold . The tortoise’s partnering . Nowhere controlling contradiction . Spring , significant .",
    "comentario": "Six at fifth : Spring , significant . The origin above shielding indeed .",
    "pagina": 502
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Nowhere diminishing , augmenting it . Without fault . Trial , significant . Harvesting : possesing directed going . Acquiring a servant without a household .",
    "comentario": "Nowhere diminishing , augmenting it . The great acquires purpose indeed .",
    "pagina": 503
   }
  ],
  "pagina": 495
 },
 {
  "numero": 42,
  "nomeFonte": "AUGMENTING",
  "pinyin": "Yi",
  "base": "Augmenting . Harvesting : possessing directed going . Harvesting : wading the great river .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Harvesting : availing of activating the great , arousing . Spring , significant . Without fault .",
    "comentario": "Spring , significant , without fault . Below not munificent affairs indeed .",
    "pagina": 509
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Maybe augmenting it tenfold . The tortoise’s partnering . Nowhere controlling the contradiction . Perpetual Trial , significant . The king avails of presenting tending-towards the supreme , significant .",
    "comentario": "Maybe augmenting it . Origin outside , coming indeed .",
    "pagina": 510
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Availing of pitfall affairs’ augmenting . Without fault . Possessing conformity , the center moving . Notifying the prince , availing of the scepter .",
    "comentario": "Augmenting : availing of pitfall affairs . Firmly possessing it indeed .",
    "pagina": 511
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "The center moving . Notifying the prince , adhering . Harvesting: availing of activating depends on shifting the city .",
    "comentario": "Notifying the prince , adhering . Using augmenting ’s purpose .",
    "pagina": 512
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Possessing conformity , a benevolent heart . No question , Spring significant . Possessing conformity , benevolence : my actualizingdao .",
    "comentario": "Possessing conformity , a benevolent heart . No questioning it actually . Benevolence : my actualizing-dao . The great acquires purpose indeed .",
    "pagina": 513
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Abstaining from augmenting it . Maybe smiting it . Establishing the heart , no persevering . Pitfall .",
    "comentario": "Abstaining from augmenting it . One-sided evidence indeed . Maybe smiting it . Origin outside , coming indeed .",
    "pagina": 514
   }
  ],
  "pagina": 506
 },
 {
  "numero": 43,
  "nomeFonte": "PARTING",
  "pinyin": "Guai",
  "base": "Parting . Displaying tending-towards the king ’s chambers . Conformity crying-out possesses adversity . Notifying originates from the capital . Not Harvesting : approaching weapons . Harvesting : possessing directed going .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "The vigor tends-towards the preceding foot . Going , not mastering : activating fault .",
    "comentario": "Not mastering and-also going . Fault indeed .",
    "pagina": 522
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Awe : an outcry , absolutely-nothing . At night possessing weapons . No cares .",
    "comentario": "Possessing weapons , no cares . Acquiring the center , dao indeed .",
    "pagina": 522
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "The vigor tends-towards the cheek-bones . Possessing pitfall . A jun zi : parting , parting . Solitary going , meeting rain . Like soaked , possessing indignation . Without fault .",
    "comentario": "A jun zi : parting , parting . Completing without fault indeed .",
    "pagina": 523
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "The sacrum without flesh . One’s moving the camp moreover . Hauling-along the goat , repenting extinguished . Hearing words not trustworthy .",
    "comentario": "One’s moving the camp moreover . Position not appropriate indeed . Hearing words not trustworthy . Understanding not bright indeed .",
    "pagina": 524
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "The reeds , the highlands : parting , parting . The center moves , without fault .",
    "comentario": "The center moves , without fault . The center not-yet shining indeed .",
    "pagina": 525
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Without crying-out . Completing possesses pitfall .",
    "comentario": "Without crying-out’s pitfall . Completing not permitting long-living indeed .",
    "pagina": 526
   }
  ],
  "pagina": 518
 },
 {
  "numero": 44,
  "nomeFonte": "COUPLING",
  "pinyin": "Gou",
  "base": "Coupling . Woman ’s vigor . No availing of grasping womanhood .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Attachment tending-towards a metallic chock . Trial , significant . Possessing directed going . Viewing pitfall . Ruined the pig ’s conformity : hoof dragging .",
    "comentario": "Attachment tending-towards a metallic chock . The supple ’s dao hauling-along indeed .",
    "pagina": 532
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Enwrapping possesses fish . Without fault . Not Harvesting : hospitality .",
    "comentario": "Enwrapping possesses fish . Righteously not extending hospitality indeed .",
    "pagina": 533
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "The sacrum without flesh . One’s moving the camp moreover . Adversity . Without the great : faulty .",
    "comentario": "One’s moving the camp moreover . Moving , not-yet hauling-along indeed .",
    "pagina": 534
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Enwrapping without fish . Rising-up , pitfall .",
    "comentario": "Without fish’s pitfall . Distancing the commoners indeed .",
    "pagina": 535
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Using osier to enwrap melons . Containing composition . Possessing tumbling originating from heaven .",
    "comentario": "Nine at fifth : containing composition . The center correct indeed . Possessing tumbling originating from heaven . Purpose : not stowing away fate indeed .",
    "pagina": 535
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Coupling : one’s horns . Abashment . Without fault .",
    "comentario": "Coupling : one’s horns . Above exhausting abashment indeed .",
    "pagina": 536
   }
  ],
  "pagina": 529
 },
 {
  "numero": 45,
  "nomeFonte": "CLUSTERING",
  "pinyin": "Cui",
  "base": "Clustering . Growing . The king imagines possessing a temple . Harvesting : viewing the great in the person . Growing , Harvesting , Trial . Availing of the great ’s sacrificial-victims , significant . Harvesting : possessing directed going .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Possessing conformity , not completing . Thereupon disarraying , thereupon clustering . Like an outcry , one handful activates laughter . No cares . Going , without fault .",
    "comentario": "Thereupon disarraying , thereupon clustering . One’s purpose disarrayed indeed .",
    "pagina": 543
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Protracting : significant , without fault . Conforming , thereupon Harvesting : availing of dedicating .",
    "comentario": "Protracting : significant , without fault . The center not-yet transformed indeed .",
    "pagina": 544
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Clustering thus , lamenting thus . Without direction Harvesting . Going , without fault . The small abashed .",
    "comentario": "Going , without fault . Above the root indeed .",
    "pagina": 544
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "The great : significant , without fault .",
    "comentario": "The great : significant , without fault . Position not appropriate indeed .",
    "pagina": 545
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Clustering possesses the position . Without fault . In-no-way conforming . Spring , perpetual Trial . Repenting extinguished .",
    "comentario": "Clustering possesses the position . Purpose not-yet shining indeed .",
    "pagina": 546
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Paying-tribute : sighs , tears , snot . Without fault .",
    "comentario": "Paying-tribute : sighs , tears , snot . Not-yet peaceful above indeed .",
    "pagina": 546
   }
  ],
  "pagina": 539
 },
 {
  "numero": 46,
  "nomeFonte": "ASCENDING",
  "pinyin": "Sheng",
  "base": "Ascending . Spring , Growing . Availing of viewing the great in the person . No cares . The South : disciplining , significant .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Sincere ascending : the great , significant .",
    "comentario": "Sincere ascending : the great , significant . Above uniting purposes indeed .",
    "pagina": 553
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Conforming , thereupon Harvesting : availing of dedicating . Without fault .",
    "comentario": "Nine at second’s conforming . Possessing joy indeed .",
    "pagina": 554
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Ascending an empty capital .",
    "comentario": "Ascending an empty capital . Without a place to doubt indeed .",
    "pagina": 555
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "The king avails of Growing tending-towards the twinpeaked mountain . Significant , without fault .",
    "comentario": "The king avails of Growing tending-towards the twinpeaked mountain . Yielding affairs indeed .",
    "pagina": 555
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Trial , significant : ascending steps .",
    "comentario": "Trial , significant : ascending steps . The great acquires purpose indeed .",
    "pagina": 556
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Dim ascending . Harvesting: tending-towards not pausing’s Trial .",
    "comentario": "Dim ascending located above . Dissolving , not affluence indeed .",
    "pagina": 556
   }
  ],
  "pagina": 550
 },
 {
  "numero": 47,
  "nomeFonte": "CONFINEMENT",
  "pinyin": "Kun",
  "base": "Confinement . Growing . Trial : the great in the person , significant . Without fault . Possessing words not trustworthy .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "The sacrum confined tending-towards a wooden stump . Entering tending-towards a shady gully . Three year’s-time not encountering .",
    "comentario": "Entering tending-towards a shady gully . Shady , not bright indeed .",
    "pagina": 563
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Confinement tending-towards liquor taking-in . Scarlet sashes on all sides coming . Harvesting : availing of presenting oblations . Disciplining , pitfall . Without fault .",
    "comentario": "Confinement tending-towards liquor taking-in . The center possesses reward indeed .",
    "pagina": 564
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Confinement tending-towards petrification . Seizing tending-towards star thistles . Entering tending-towards one’s house . Not viewing one’s consort . Pitfall .",
    "comentario": "Seizing tending-towards star thistles . Riding a solid indeed . Entering tending-towards one’s house . Not viewing one’s consort . Not auspicious indeed .",
    "pagina": 565
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Coming : ambling , ambling . Confinement tending-towards a metallic chariot . Abashment . Possessing completion .",
    "comentario": "Coming : ambling , ambling . Purpose located below indeed . Although not an appropriate position , possessing associates indeed .",
    "pagina": 566
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Nose-cut , foot-cut . Confinement tending-towards a crimson sash . Thereupon ambling possesses stimulating . Harvesting : availing of offering oblations .",
    "comentario": "Nose-cut , foot-cut . Purpose not-yet acquired indeed . Thereupon ambling possesses stimulating . Using the center : straightening indeed . Harvesting : availing of offering oblations . Acquiescing in blessing indeed .",
    "pagina": 567
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Confinement tending-towards trailing creepers . Tending-towards the unsteady and unsettled . Named : stirring-up repenting possesses repenting . Disciplining , significant .",
    "comentario": "Confinement tending-towards trailing creepers . Not-yet appropriate indeed . Stirring-up repenting possesses repenting . Significant , moving indeed .",
    "pagina": 568
   }
  ],
  "pagina": 559
 },
 {
  "numero": 48,
  "nomeFonte": "THE WELL",
  "pinyin": "Jing",
  "base": "The well . Amending the capital , not amending the well . Without losing , without acquiring . Going , coming : welling , welling . Muddy culmination : truly not-yet the well-rope in the well . Ruining one’s pitcher : pitfall .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "The well : a bog , not taking-in . The ancient well without wildfowl .",
    "comentario": "The well : a bog , not taking-in . Below indeed . The ancient well without wildfowl . The season stowed away indeed .",
    "pagina": 575
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "The well : a gully , shooting bass . The jug cracked , leaking .",
    "comentario": "The well : a gully , shooting bass . Without associates indeed .",
    "pagina": 576
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "The well : oozing , not taking-in . Activating my heart ’s ache . Permitting availing of drawing-water . Kingly brightness . Together acquiescing in one’s blessing .",
    "comentario": "The well : oozing , not taking-in . Moving , aching indeed . Seeking kingly brightness . Acquiescing in blessing indeed .",
    "pagina": 576
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "The well : lining , without fault .",
    "comentario": "The well : lining , without fault . Adjusting the well indeed .",
    "pagina": 577
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "The well : limpid . Cold springwater taken-in .",
    "comentario": "Cold springwater’s taking-in . The center correct indeed .",
    "pagina": 578
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "The well : collecting , no cover . Possessing conformity : Spring , significant .",
    "comentario": "Spring , significance located above . The great accomplishes indeed .",
    "pagina": 578
   }
  ],
  "pagina": 571
 },
 {
  "numero": 49,
  "nomeFonte": "SKINNING",
  "pinyin": "Ge",
  "base": "Skinning . Before-zenith sun , thereupon conforming . Spring , Growing , Harvesting , Trial . Repenting extinguished .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Thonging avails of yellow cattle’s skin .",
    "comentario": "Thonging avails of yellow cattle . Not permitted to use possessing activity indeed .",
    "pagina": 584
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Before-zenith sun , thereupon skinning it . Disciplining significant , without fault .",
    "comentario": "Before-zenith sun skinning it . Moving possesses excellence indeed .",
    "pagina": 585
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Disciplining : pitfall . Trial , adversity . Skinning word thrice drawing-near . Possessing conformity .",
    "comentario": "Skinning word thrice drawing-near . Furthermore is it actually?",
    "pagina": 585
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Repenting extinguished , possessing conformity . Amending fate , significant .",
    "comentario": "Amending fate’s significance . Trustworthy purpose indeed .",
    "pagina": 586
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "The great in the person : a tiger transforming . Not-yet an augury , possessing conformity .",
    "comentario": "The great in the person : a tiger transforming . One’s pattern luminous indeed .",
    "pagina": 587
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "A jun zi : a leopard transforming . The small in the person skins the face . Disciplining , pitfall . Residing in Trial , significant .",
    "comentario": "A jun zi : a leopard transforming . One’s pattern beautiful indeed . The small in the person skins the face . Yielding uses adhering to a chief indeed .",
    "pagina": 588
   }
  ],
  "pagina": 581
 },
 {
  "numero": 50,
  "nomeFonte": "THE VESSEL",
  "pinyin": "Ding",
  "base": "The vessel . Spring , significant . Growing .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "The vessel : toppling the foot . Harvesting : emerging from obstruction . Acquiring a concubine , using one’s son . Without fault .",
    "comentario": "The vessel : toppling the foot . Not-yet rebelling indeed . Harvesting : emerging from obstruction . Using adhering to value indeed .",
    "pagina": 596
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "The vessel possesses substance . My companion possesses affliction . Not me able to approach . Significant .",
    "comentario": "The vessel possesses substance . Considering the place of it indeed . My companion possesses affliction . Completing without surpassing indeed .",
    "pagina": 597
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "The vessel ’s ears skinned . Its movement impeded . The pheasant ’s juice not taken-in . On all sides rain lessens repenting . Completing significant .",
    "comentario": "The vessel ’s ears skinned . Letting-go one’s righteousness indeed .",
    "pagina": 598
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "The vessel ’s severed stand . Overthrowing a princely stew . One’s form soiled , pitfall .",
    "comentario": "Overthrowing a princely stew . Is it trustworthy thus indeed?",
    "pagina": 599
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "The vessel ’s yellow ears , metallic rings . Harvesting , Trial .",
    "comentario": "The vessel ’s yellow ears . The center uses activating substance indeed .",
    "pagina": 600
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "The vessel ’s jade rings . The great , significant . Without not Harvesting .",
    "comentario": "Jade rings located above . Solid and supple articulated indeed .",
    "pagina": 601
   }
  ],
  "pagina": 593
 },
 {
  "numero": 51,
  "nomeFonte": "THE SHAKE",
  "pinyin": "Zhen",
  "base": "The shake . Growing . The shake coming : frightening , frightening . Laughing words , shrieking , shrieking . The shake scares a hundred miles . Not losing the ladle and the libation .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "The shake coming: frightening, frightening. After laughing words, shrieking, shrieking. Significant .",
    "comentario": "The shake coming : frightening , frightening . Anxiety involves blessing indeed . Laughing words , shrieking , shrieking . Afterwards possessing by consequence indeed .",
    "pagina": 607
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "The shake coming , adversity . A hundred-thousand coins lost . Climbing tending-towards the ninth mound . No pursuit . The seventh day acquiring .",
    "comentario": "The shake coming , adversity . Riding a solid indeed .",
    "pagina": 608
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "The shake reviving , reviving . The shake moving : without blunder .",
    "comentario": "The shake reviving , reviving . Position not appropriate indeed .",
    "pagina": 609
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "The shake releases the bog .",
    "comentario": "The shake releases the bog . Not-yet shining indeed .",
    "pagina": 609
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "The shake going and coming , adversity . Hundred-thousand without loss , possessing affairs .",
    "comentario": "The shake going and coming , adversity . Exposing movement indeed . One’s affairs located in the center . The great without loss indeed.",
    "pagina": 610
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "The shake twining , twining . Observing : terror , terror . Disciplining : pitfall . The shake not tending-towards one’s body . Tending-towards one’s neighbor . Without fault . Matrimonial alliance possesses words .",
    "comentario": "The shake twining , twining . The center not-yet acquired indeed . Although a pitfall , without fault . The dreading neighbor , a warning indeed .",
    "pagina": 611
   }
  ],
  "pagina": 604
 },
 {
  "numero": 52,
  "nomeFonte": "THE BOUND",
  "pinyin": "Gen",
  "base": "The bound : one’s back . Not capturing one’s individuality . Moving one’s chambers . Not viewing one’s people . Without fault .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "The bound : one’s feet . Without fault . Harvesting : perpetual Trial .",
    "comentario": "The bound : one’s feet . Not-yet letting-go correcting indeed .",
    "pagina": 617
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "The bound : one’s calves . Not rescuing one’s following . One’s heart not keen .",
    "comentario": "Not rescuing one’s following . Not-yet withdrawing from hearkening indeed .",
    "pagina": 617
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "The bound : one’s limit . Attributed to one’s loins . Adversity smothers the heart .",
    "comentario": "The bound : one’s limit . Exposure smothers the heart indeed .",
    "pagina": 618
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "The bound : one’s individuality . Without fault .",
    "comentario": "The bound : one’s individuality . Stopping relates to the body indeed .",
    "pagina": 619
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "The bound : one’s jawbones . Words possess sequence . Repenting extinguished .",
    "comentario": "The bound : one’s jawbones . Using the center , correcting indeed .",
    "pagina": 619
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Magnanimous bound , significant .",
    "comentario": "Magnanimous bound’s significance . Using munificence to complete indeed .",
    "pagina": 620
   }
  ],
  "pagina": 614
 },
 {
  "numero": 53,
  "nomeFonte": "INFILTRATING J",
  "pinyin": "Jian",
  "base": "Infiltrating . Womanhood converting , significant . Harvesting , Trial .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "The swan infiltrating tending-towards the barrier . The small son , adversity . Possessing words . Lacking fault .",
    "comentario": "The small son’s adversity . Righteous , without fault indeed .",
    "pagina": 626
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "The swan infiltrating tending-towards the stone . Drinking and taking-in : feasting , feasting . Significant .",
    "comentario": "Drinking and taking-in : feasting , feasting . Not sheer satiation indeed .",
    "pagina": 626
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "The swan infiltrating tending-towards the highlands . The husband disciplined , not returning . The wife pregnant , not nurturing . Pitfall . Harvesting : resisting illegality .",
    "comentario": "The husband disciplined , not returning . Radiating a flock of demons indeed . The wife pregnant , not nurturing . Letting-go one’s dao indeed . Harvesting : availing of resisting illegality . Yielding : reciprocal protection indeed .",
    "pagina": 627
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "The swan infiltrating tending-towards the trees . Maybe acquiring one’s rafter . Without fault .",
    "comentario": "May be acquiring one’s rafter . Yielding uses the root indeed .",
    "pagina": 628
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "The swan infiltrating tending-towards the mound . The wife , three year’s-time not pregnant . Completing abstention’s mastering . Significant .",
    "comentario": "Completing abstention’s mastering , significant . Acquiring the place desired indeed .",
    "pagina": 629
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "The swan infiltrating tending-towards the highlands . Its feathers permit availing of activating the fundamentals . Significant .",
    "comentario": "Its feathers permit availing of activating the fundamentals , significant . Not permitting disarray indeed .",
    "pagina": 630
   }
  ],
  "pagina": 623
 },
 {
  "numero": 54,
  "nomeFonte": "CONVERTING MAIDENHOOD",
  "pinyin": "Gui Mei",
  "base": "Converting maidenhood . Disciplining , pitfall . Without direction Harvesting .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Converting maidenhood uses the junior-sister . Halting enables treading. Disciplining , significant .",
    "comentario": "Converting maidenhood uses the junior-sister . Using perseverance indeed . Halting enables treading , significant . Reciprocal receiving indeed .",
    "pagina": 637
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Squinting enables observing . Harvesting : shady people’s Trial .",
    "comentario": "Harvesting : shady people’s Trial . Not-yet transforming constancy indeed .",
    "pagina": 638
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Converting maidenhood uses hair-growing . Reversed converting uses the junior-sister .",
    "comentario": "Converting maidenhood uses hair-growing . Not-yet appropriate indeed .",
    "pagina": 639
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Converting maidenhood overruns the term . Procrastinating converting possesses the season .",
    "comentario": "Overrunning the term’s purpose . Possessing awaiting and-also moving indeed .",
    "pagina": 639
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "The supreme burgeoning converting maidenhood . One’s chief’s sleeves, not thus fine one’s junior-sister’s sleeves . The moon almost full , significant .",
    "comentario": "The supreme burgeoning converting maidenhood . Not thus fine one’s junior-sister’s sleeves . One’s position located in the center . Using valuing movement indeed .",
    "pagina": 640
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "A woman receives a basket without substance . A scholar disembowels a goat without blood . Without direction Harvesting .",
    "comentario": "Six above : without substance . Receiving an empty basket indeed .",
    "pagina": 641
   }
  ],
  "pagina": 634
 },
 {
  "numero": 55,
  "nomeFonte": "ABOUNDING",
  "pinyin": "Feng",
  "base": "Abounding . Growing . The king imagines it . No grief . Properly the sun in the center .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Meeting one’s equal lord. Although a decade, without fault. Going possesses honor.",
    "comentario": "Although a decade , without fault . Exceeding a decade : calamity indeed .",
    "pagina": 647
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Abounding : one’s screen . The sun in the center : viewing the Great-Bear . Going acquires doubt , affliction . Possessing conformity , like shooting-forth . Significant .",
    "comentario": "Possessing conformity , like shooting-forth . Trustworthiness uses shooting-forth purpose indeed .",
    "pagina": 648
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Abounding : one’s overflowing . The sun in the center : viewing froth . Severing one’s right arm . Without fault .",
    "comentario": "Abounding : one’s overflowing . Not permitted the great in affairs indeed . Severing one’s right arm . Completing , not permitted availing of indeed .",
    "pagina": 649
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Abounding : one’s screen . The sun in the center : viewing the Great-Bear . Meeting one’s hidden lord . Significant .",
    "comentario": "Abounding : one’s screen . Position not appropriate indeed . The sun in the center : viewing the Great-Bear . Shade , not brightness indeed . Meeting one’s hidden lord . Significant movement indeed .",
    "pagina": 650
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Coming composition . Possessing reward and praise , significant .",
    "comentario": "Six at fifth’s significance . Possessing reward indeed .",
    "pagina": 651
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Abounding : one’s roof . Screening one’s household . Peeping through one’s door . Living-alone , one without people . Three year’s-time not encountering . Pitfall .",
    "comentario": "Abounding : one’s roof . The heavenly border , hovering indeed . Peeping through one’s door . Living-alone , one without people . Originating from concealment indeed .",
    "pagina": 652
   }
  ],
  "pagina": 644
 },
 {
  "numero": 56,
  "nomeFonte": "SOJOURNING",
  "pinyin": "Lü",
  "base": "Sojourning . The small , growing . Sojourning : Trial , significant .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Sojourning : fragmenting , fragmenting . Splitting-off one’s place : grasping calamity .",
    "comentario": "Sojourning : fragmenting , fragmenting . Purpose exhausted : calamity indeed .",
    "pagina": 659
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Sojourning : approaching a camp . Cherishing one’s own . Acquiring a youthful vassal , Trial .",
    "comentario": "Acquiring a youthful vassal , Trial . Completing without surpassing indeed .",
    "pagina": 660
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Sojourning : burning one’s camp . Losing one’s youthful vassal . Trial , adversity .",
    "comentario": "Sojourning : burning one’s camp . Truly using injury actually . Using sojourning to associate below . One’s righteousness lost indeed .",
    "pagina": 661
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Sojourning : tending-towards abiding . Acquiring one’s own emblem-ax . My heart not keen .",
    "comentario": "Sojourning : tending-towards abiding . Not-yet acquiring the position indeed . Acquiring one’s own emblem-ax . The heart not-yet keen indeed .",
    "pagina": 662
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Shooting a pheasant . One arrow extinguishing . Completion uses praising fate .",
    "comentario": "Completion uses praising fate . Reaching-up to the above indeed .",
    "pagina": 662
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "A bird burns its nest . Sojourning people beforehand laugh , afterwards cry-out sobbing . Losing the cattle , tending-towards versatility . Pitfall .",
    "comentario": "Using sojourning located above . One’s righteousness burnt indeed . Losing the cattle , tending-towards versatility . Completing absolutely-nothing’s hearing indeed .",
    "pagina": 663
   }
  ],
  "pagina": 656
 },
 {
  "numero": 57,
  "nomeFonte": "THE ROOT",
  "pinyin": "Xun",
  "pinyinFonte": "Sun",
  "base": "The root . The small , Growing . Harvesting : possessing directed going . Harvesting : viewing the great in the person .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Advancing , withdrawing . Harvesting : martial people’s Trial .",
    "comentario": "Advancing , withdrawing . Purpose doubtful indeed . Harvesting : martial people’s Trial . Purpose regulating indeed .",
    "pagina": 669
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "The root located below the bed . Availing of chroniclers and shamans . Disorder like , significant . Without fault .",
    "comentario": "Disorder like’s significance . Acquiring the center indeed .",
    "pagina": 670
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Imminent root , abashment .",
    "comentario": "Imminent root’s abashment . Purpose exhausted indeed .",
    "pagina": 671
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Repenting extinguished . The fields : capturing three kinds .",
    "comentario": "The fields : capturing three kinds . Possessing achievement indeed .",
    "pagina": 672
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Trial , significant . Repenting extinguished . Without not harvesting . Without initially possessing completion . Before husking , three days . After husking , three days . Significant .",
    "comentario": "Nine at fifth’s significance . Position correct in the center indeed .",
    "pagina": 672
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "The root located below the bed . Losing one’s own emblem-ax . Trial , pitfall .",
    "comentario": "The root located below the bed . Above exhaustion indeed . Losing one’s own emblem-ax . Correcting reaches a pitfall indeed .",
    "pagina": 674
   }
  ],
  "pagina": 666
 },
 {
  "numero": 58,
  "nomeFonte": "THE OPEN",
  "pinyin": "Dui",
  "base": "The open . Growing , Harvesting , Trial .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Harmonious opening, significant.",
    "comentario": "Harmonious opening’s significance . Moving , not-yet doubting indeed .",
    "pagina": 679
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Conforming opening , significant . Repenting extinguished .",
    "comentario": "Conforming opening’s significance . Trustworthy purpose indeed .",
    "pagina": 679
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Coming opening , pitfall .",
    "comentario": "Coming opening’s pitfall . Position not appropriate indeed .",
    "pagina": 680
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Bargaining opening , not-yet soothing . The cuirass ’ affliction possesses joy .",
    "comentario": "Nine at fourth’s joy . Possessing reward indeed .",
    "pagina": 681
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Conformity tending-towards stripping . Possessing adversity .",
    "comentario": "Conformity tending-towards stripping . Position correct and appropriate indeed .",
    "pagina": 682
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Protracted opening .",
    "comentario": "Six above : protracted opening . Not-yet shining indeed .",
    "pagina": 682
   }
  ],
  "pagina": 676
 },
 {
  "numero": 59,
  "nomeFonte": "DISPERSING",
  "pinyin": "Huan",
  "base": "Dispersing . Growing . The king imagines possessing a temple . Harvesting : wading the great river . Harvesting , Trial .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Availing of a rescuing horse ’s vigor , significant .",
    "comentario": "Initial six’s significance . Yielding indeed .",
    "pagina": 688
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Dispersing : fleeing one’s bench . Repenting extinguished .",
    "comentario": "Dispersing : fleeing one’s bench . Acquiring the desired indeed .",
    "pagina": 689
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Dispersing one’s body . Without repenting .",
    "comentario": "Dispersing one’s body . Purpose located outside indeed .",
    "pagina": 690
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Dispersing one’s flock : Spring , significant . Dispersing possesses the hill-top . In-no-way hidden , a place to ponder .",
    "comentario": "Dispersing one’s flock : Spring , significant . The shining great indeed .",
    "pagina": 690
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Dispersing sweat : one’s great cries-out . Dispersing . The king ’s residing , without fault .",
    "comentario": "The king ’s residing , without fault . Correct position indeed .",
    "pagina": 691
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Dispersing one’s blood . Departing far-away . Emerging , without fault .",
    "comentario": "Dispersing one’s blood . Distancing harm indeed .",
    "pagina": 692
   }
  ],
  "pagina": 685
 },
 {
  "numero": 60,
  "nomeFonte": "ARTICULATING J",
  "pinyin": "Jie",
  "base": "Articulating . Growing . Bitter articulating not permitting Trial .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Not emerging from the door chambers . Without fault .",
    "comentario": "Not emerging from the door chambers . Knowing interpenetration impeded indeed .",
    "pagina": 698
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Not emerging from the gate chambers . Pitfall .",
    "comentario": "Not emerging from the gate chambers , pitfall . Letting-go the season : end indeed .",
    "pagina": 699
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Not like articulating , by consequence like lamenting . Without fault .",
    "comentario": "Not articulating’s lamenting . Furthermore whose fault indeed?",
    "pagina": 699
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "Peaceful articulating , Growing .",
    "comentario": "Peaceful articulating’s Growing . Receiving dao above indeed .",
    "pagina": 700
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Sweet articulating , significant . Going possesses honor .",
    "comentario": "Sweet articulating’s significance . Residing in the position at the center indeed .",
    "pagina": 701
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Bitter articulating : Trial , pitfall . Repenting extinguished .",
    "comentario": "Bitter articulating : Trial , pitfall . One’s dao exhausted indeed .",
    "pagina": 702
   }
  ],
  "pagina": 695
 },
 {
  "numero": 61,
  "nomeFonte": "THE CENTER CONFORMING",
  "pinyin": "Zhong Fu",
  "base": "The center conforming : hog fish , significant . Harvesting : wading the great river . Harvesting , Trial .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Precaution significant . Possessing a burden, not a swallow .",
    "comentario": "Initial nine : precaution significant . Purpose not-yet transformed indeed .",
    "pagina": 708
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Calling crane located in Yin . One’s sonhood harmonizing with it . I possess a loved wine-cup . Myself associating : simply spilling it .",
    "comentario": "One’s sonhood harmonizing with it . In the center the heart ’s desire indeed .",
    "pagina": 709
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Acquiring antagonist . Maybe drumbeating , maybe desisting . Maybe weeping , maybe singing .",
    "comentario": "Maybe drumbeating , maybe desisting . Position not appropriate indeed .",
    "pagina": 710
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "The moon almost full . The horse team extinguished . Without fault .",
    "comentario": "The horse team extinguished . Cutting-off , sorting above indeed .",
    "pagina": 711
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "Possessing conformity , binding thus . Without fault .",
    "comentario": "Possessing conformity , binding thus . Position correct and appropriate indeed .",
    "pagina": 711
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "A soaring sound mounts tending-towards heaven . Trial , pitfall .",
    "comentario": "A soaring sound mounts tending-towards heaven . Is it permitted long-living indeed?",
    "pagina": 712
   }
  ],
  "pagina": 705
 },
 {
  "numero": 62,
  "nomeFonte": "THE SMALL EXCEEDING",
  "pinyin": "Xiao Guo",
  "base": "The small exceeding . Growing . Harvesting , Trial . Permitted the small in affairs . Not permitted the great in affairs . The flying bird abandoning’s sound . Not proper above , proper below . The great , significant .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "The flying bird : using a pitfall .",
    "comentario": "The flying bird : using a pitfall . Not permitted thus , is it indeed?",
    "pagina": 719
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "Exceeding one’s grandfather . Meeting one’s grandmother . Not extending to one’s chief . Meeting one’s servant . Without fault .",
    "comentario": "Not extending to one’s chief . A servant not permitted exceeding indeed .",
    "pagina": 719
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "Nowhere exceeding , defending-against it . Adhering maybe kills it . Pitfall .",
    "comentario": "Adhering maybe kills it . Pitfall thus , is it not indeed?",
    "pagina": 720
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Without fault . Nowhere exceeding , meeting it . Going : adversity necessarily a warning . No availing of perpetual Trial .",
    "comentario": "Nowhere exceeding , meeting it . Position not appropriate indeed . Going : adversity necessarily a warning . Completion not permitted long-living indeed .",
    "pagina": 721
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Shrouding clouds , not raining . Originating from my Western suburbs . A prince ’s string-arrow grasps someone located in a cave .",
    "comentario": "Shrouding clouds , not raining . Climaxing above indeed .",
    "pagina": 722
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Nowhere meeting , exceeding it . The flying bird radiance’s pitfall . That designates calamity and blunder .",
    "comentario": "Nowhere meeting , exceeding it . Climaxing overbearing indeed .",
    "pagina": 723
   }
  ],
  "pagina": 715
 },
 {
  "numero": 63,
  "nomeFonte": "ALREADY FORDING",
  "pinyin": "Ji Ji",
  "base": "Already fording . Growing , the small . Harvesting , Trial . Initially : significant . Completing : disarray .",
  "linhas": [
   {
    "linha": 1,
    "valor": 9,
    "texto": "Pulling-back one’s wheels . Soaking one’s tail . Without fault .",
    "comentario": "Pulling-back one’s wheels . Righteous , without fault indeed .",
    "pagina": 729
   },
   {
    "linha": 2,
    "valor": 6,
    "texto": "A wife loses her veil . No pursuing . The seventh day acquiring .",
    "comentario": "The seventh day acquiring . Using the center ’s dao indeed .",
    "pagina": 730
   },
   {
    "linha": 3,
    "valor": 9,
    "texto": "The High Ancestor subjugates souls on all sides . Three years controlling it . The small in the person , no availing of.",
    "comentario": "Three years controlling it . Weariness indeed .",
    "pagina": 731
   },
   {
    "linha": 4,
    "valor": 6,
    "texto": "A token : possessing clothes in tatters . Completing the day : a warning .",
    "comentario": "Completing the day : a warning . Possessing a place to doubt indeed .",
    "pagina": 732
   },
   {
    "linha": 5,
    "valor": 9,
    "texto": "The Eastern neighbor slaughters cattle . Not thus the Western neighbor’s dedicated offering . Substance : acquiescing in one’s blessing .",
    "comentario": "The Eastern neighbor slaughters cattle . Not thus the Western neighbor’s season . Substance : acquiescing in one’s blessing . Significant . The great coming indeed .",
    "pagina": 732
   },
   {
    "linha": 6,
    "valor": 6,
    "texto": "Soaking one’s head . Adversity .",
    "comentario": "Soaking one’s head , adversity . Is it permitted to last indeed?",
    "pagina": 734
   }
  ],
  "pagina": 726
 },
 {
  "numero": 64,
  "nomeFonte": "NOT YET FORDING",
  "pinyin": "Wei Ji",
  "base": "Not-yet fording . Growing . The small fox in a muddy ford . Soaking its tail . Without direction Harvesting .",
  "linhas": [
   {
    "linha": 1,
    "valor": 6,
    "texto": "Soaking one’s tail . Abashment .",
    "comentario": "Soaking one’s tail . Truly not knowing the end indeed .",
    "pagina": 739
   },
   {
    "linha": 2,
    "valor": 9,
    "texto": "Pulling-back one’s wheels . Trial , significant .",
    "comentario": "Nine at second : Trial , significant . In the center using movement to correct indeed .",
    "pagina": 740
   },
   {
    "linha": 3,
    "valor": 6,
    "texto": "Not-yet fording : disciplining , pitfall . Harvesting : wading the great river .",
    "comentario": "Not-yet fording : disciplining , pitfall . Position not appropriate indeed .",
    "pagina": 741
   },
   {
    "linha": 4,
    "valor": 9,
    "texto": "Trial , significant , repenting extinguished . The shake avails of subjugating souls on all sides . Three years , possessing a donation tending-towards the great city .",
    "comentario": "Trial , significant , repenting extinguished . Purpose moving indeed .",
    "pagina": 741
   },
   {
    "linha": 5,
    "valor": 6,
    "texto": "Trial , significant , without repenting . A jun zi’s shine . Possessing conformity , significant .",
    "comentario": "A jun zi’s shine . One’s brilliance significant indeed .",
    "pagina": 743
   },
   {
    "linha": 6,
    "valor": 9,
    "texto": "Possessing conformity tending-towards drinking liquor . Without fault . Soaking one’s head . Possessing conformity : letting-go that .",
    "comentario": "Drinking liquor , soaking the head . Truly not knowing articulation indeed .",
    "pagina": 743
   }
  ],
  "pagina": 736
 }
]
