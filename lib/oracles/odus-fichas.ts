/**
 * GERADO POR scripts/extrair-odus.mjs — NÃO EDITAR À MÃO.
 *
 * Fichas dos Odus do jogo de búzios, uma por número de búzios abertos, da
 * tabela "OS PRÓS & CONTRAS DE CADA ODÚ" de odus_afro_brasileiros.pdf. O nome do
 * Odu e o Orixá vêm da segunda tabela da mesma fonte, chaveada por número de
 * búzios — que é o resultado que o sorteio produz.
 *
 * Extraído em 2026-10-04.
 * Os campos positivo/negativo são os dois polos da fonte, sem acréscimo.
 */
export type FichaDeOdu = {
  /** número de búzios abertos, 0..16 — a chave do sorteio */
  abertos: number
  odu: string
  orixa: string
  positivo: string
  negativo: string
}

export const ODUS_FONTE = "Jogo de Búzios Merindinlogun, tabela dos prós e contras de cada Odú"
export const ODUS_FONTE_ARQUIVO = "odus_afro_brasileiros.pdf"

export const ODUS_FICHAS: FichaDeOdu[] = [
 {
  "abertos": 1,
  "odu": "Òkànràn",
  "orixa": "Exú",
  "positivo": "Vivacidade, energia, ação, comunicação e mensagem.",
  "negativo": "Intriga, irritabilidade, calunia mentira"
 },
 {
  "abertos": 2,
  "odu": "Éji Òkò",
  "orixa": "Ibeji e Ogum",
  "positivo": "Pureza, alegria, sociedade, curiosidade e criatividade.",
  "negativo": "Mudança de humor, dependência de outro, falta de preparo."
 },
 {
  "abertos": 3,
  "odu": "Étá Ògúnda",
  "orixa": "Obaluaiê, Ogun e Obá",
  "positivo": "Expressão, liderança, cautela, recuperação rápida da saúde.",
  "negativo": "Nervosismo. Falta de autoestima e coragem, não assume erros, pessimismo."
 },
 {
  "abertos": 4,
  "odu": "Ìròsùn",
  "orixa": "Yemanjá - Ogum",
  "positivo": "Responsabilidade, comprometimento, verdade, família.",
  "negativo": "Culpa nas costas alheias, responsabilidade excessiva, problemas de família."
 },
 {
  "abertos": 5,
  "odu": "Òsé",
  "orixa": "Oxum",
  "positivo": "Simpatia, fertilidade, intuição, deve-se fazer o que ama, brilho.",
  "negativo": "Mágoa, ressentimento, magia negra, escravidão, preguiça, vaidade."
 },
 {
  "abertos": 6,
  "odu": "Òbàrà",
  "orixa": "Oxossi, Xangô, Logun-Edé, Ossaim",
  "positivo": "Prosperidade, observação, necessita estar só, determinação.",
  "negativo": "Insegurança, dúvida, solidão, falta de vontade."
 },
 {
  "abertos": 7,
  "odu": "Òdi",
  "orixa": "Exu, Omulu e Eguns",
  "positivo": "Resistência nas dificuldades, segredo, política, persuasão.",
  "negativo": "Feitiço, traição, interesseiro, saúde frágil, perdas."
 },
 {
  "abertos": 8,
  "odu": "Éji Onílè",
  "orixa": "Oxaguiã e Xangô",
  "positivo": "Boa sorte, confiança, vitalidade, capacidade para convencer.",
  "negativo": "Imaturidade, perde oportunidade, extremista, erros nas responsabilidades."
 },
 {
  "abertos": 9,
  "odu": "Òsá",
  "orixa": "Yemanjá e Yansã – Logun - Edé",
  "positivo": "Liberdade, viagens, mudanças, idealismo.",
  "negativo": "Falta de responsabilidade, tagarela, exagero, futilidade, paixão."
 },
 {
  "abertos": 10,
  "odu": "Òfún",
  "orixa": "Oxalá – Oxum - Yemanjá",
  "positivo": "Respeito obtido, prudência, estudos, posto elevado.",
  "negativo": "Lentidão, teimosia, mente cansada, corpo cansado."
 },
 {
  "abertos": 11,
  "odu": "Òwórín",
  "orixa": "Yansã, Exu e Eguns",
  "positivo": "Poderes psíquicos, líder carismático, saber ousar, coragem.",
  "negativo": "Magia negra, opositores, espíritos perdidos ou ruins, rebeldia."
 },
 {
  "abertos": 12,
  "odu": "Éjìlá Seborà",
  "orixa": "Xangô",
  "positivo": "Senso de justiça, boa capacidade para negócios, bon vivant.",
  "negativo": "Gastos desnecessários, traição conjugal, julgar erroneamente."
 },
 {
  "abertos": 13,
  "odu": "Éji Ológbon",
  "orixa": "Nanã e Obaluaiê",
  "positivo": "Poupança, aprender com o passado, transição, herança.",
  "negativo": "Vingança, frieza, calculista, resignação extrema, morte, eguns."
 },
 {
  "abertos": 14,
  "odu": "Ìka",
  "orixa": "Oxumarê e Ossaim",
  "positivo": "Mudanças positivas, vontade de prosperar, mistério, dinheiro.",
  "negativo": "Ambição extremista, paixão brusca, conflitos psíquicos, desconfiança."
 },
 {
  "abertos": 15,
  "odu": "Ogbègúndá",
  "orixa": "Oba e Ewa",
  "positivo": "Pureza, silêncio, imparcialidade, valoroso na virtude, fé.",
  "negativo": "Revolta, carência, falta de malicia, agressividade."
 },
 {
  "abertos": 16,
  "odu": "Àlàáfia",
  "orixa": "Orunmilá ou todos.",
  "positivo": "Domínio das emoções, esclarecimento, sucesso, benção.",
  "negativo": "Contar demais com a sorte, perda de interesse por ter algo muito fácil."
 }
]
