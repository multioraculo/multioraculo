/**
 * Layout determinístico da queda dos 16 búzios para a visualização.
 *
 * Só desenha: quem decide quantos búzios estão abertos é o motor da tiragem
 * (lib/oracles/draw.ts). Este módulo recebe a quantidade já calculada e um
 * seed persistente da leitura e devolve posições, rotações e quais conchas
 * ficam abertas, sempre iguais para o mesmo seed. Não usa Math.random.
 *
 * Sem dependências de Node: pode rodar no navegador.
 */

export type ShellState = {
  id: number
  /** posição em % do lado da mesa (0–100) */
  x: number
  y: number
  /** rotação em graus */
  rotation: number
  open: boolean
  scale: number
}

export const BUZIOS_TOTAL = 16

// hash de string → 32 bits (FNV-1a) para semear o PRNG
function hash32(s: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// mulberry32: PRNG pequeno e determinístico, suficiente para layout
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateBuziosLayout(input: {
  seed: string
  openCount: number
  total?: number
}): ShellState[] {
  const total = input.total ?? BUZIOS_TOTAL
  const openCount = Math.max(0, Math.min(total, Math.round(input.openCount)))
  const rand = mulberry32(hash32(input.seed))

  // área útil: círculo com raio 38% do lado, centrado em (50, 50), e uma
  // distância mínima entre centros para não amontoar
  const CENTER = 50
  const RADIUS = 38
  const MIN_DIST = 12.5

  const shells: ShellState[] = []
  let attempts = 0
  let minDist = MIN_DIST
  while (shells.length < total) {
    attempts++
    // se o espaço apertar, relaxa a distância mínima aos poucos (determinístico)
    if (attempts % 400 === 0) minDist = Math.max(8, minDist - 0.5)

    // ponto uniforme no disco (sqrt para não concentrar no centro)
    const r = RADIUS * Math.sqrt(rand())
    const theta = rand() * Math.PI * 2
    const x = CENTER + r * Math.cos(theta)
    const y = CENTER + r * Math.sin(theta)

    let ok = true
    for (const s of shells) {
      const dx = s.x - x
      const dy = s.y - y
      if (Math.hypot(dx, dy) < minDist) {
        ok = false
        break
      }
    }
    if (!ok) continue

    shells.push({
      id: shells.length,
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      rotation: Math.round(rand() * 360),
      open: false,
      scale: Math.round((0.92 + rand() * 0.16) * 100) / 100,
    })
  }

  // quais ficam abertos: embaralhamento determinístico, respeitando openCount
  const order = shells.map((s) => s.id)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  for (let i = 0; i < openCount; i++) shells[order[i]].open = true

  return shells
}

/**
 * Extrai a quantidade de abertos do texto do item quando o payload não traz
 * o número (leituras antigas). O texto começa pelo número em todos os
 * idiomas: "9 búzios abertos — Ossá", "9 open shells — Ossá".
 */
export function openCountFromLabel(label: string | undefined | null): number | null {
  if (!label) return null
  const m = label.trim().match(/^(\d{1,2})\b/)
  if (!m) return null
  const n = Number(m[1])
  return n >= 0 && n <= BUZIOS_TOTAL ? n : null
}

/** Nome do Odù no texto do item: parte após o travessão. */
export function oduFromLabel(label: string | undefined | null): string {
  if (!label) return ""
  const parts = label.split("—")
  return (parts.length > 1 ? parts[parts.length - 1] : "").trim()
}
