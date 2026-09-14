"use client"

import dynamic from "next/dynamic"

// WebGL só no cliente
const PulsingBorder = dynamic(
  async () => {
    const mod = await import("@paper-design/shaders-react")
    return mod.PulsingBorder
  },
  { ssr: false },
)

/** Logo tipográfico, recortado sem sobra; a proporção vem do arquivo. */
const LOGO_SRC = "/brand/multioraculo.png"
const LOGO_RATIO = 741 / 425

/**
 * O círculo de luz do logo anterior, com o mesmo movimento e as cores trazidas
 * para a paleta do app: o violeta, o lilás e o índigo do fundo, e o
 * dourado-champanhe de Sonhos como único tom quente. Sem branco na lista: com
 * o brilho do shader, branco vira mancha e cobre as letras.
 */
const LUZ = {
  colors: ["#A855F7", "#818CF8", "#E0C68F", "#C084FC", "#6366F1"],
  colorBack: "#00000000",
  speed: 1.5,
  roundness: 1,
  thickness: 0.06,
  softness: 0.3,
  intensity: 2,
  spotSize: 0.1,
  pulse: 0.1,
  smoke: 0.5,
  smokeSize: 4,
  scale: 0.85,
  rotation: 0,
}

/** Proporções, em frações do lado da caixa: a luz ocupa a caixa inteira e o
 * texto 80% dela, o máximo antes que o brilho da luz lave as letras. */
const LUZ_DIAMETRO = 1
const TEXTO_LARGURA = 0.8

type Props = {
  /** lado da caixa inteira, em px */
  size?: number
  /** false congela a luz */
  animated?: boolean
  className?: string
}

/**
 * Marca do Multioráculo: o círculo de luz colorida do logo anterior e, por
 * cima, o logo tipográfico exatamente como foi desenhado.
 */
export default function BrandLogo({ size = 80, animated = true, className = "" }: Props) {
  const logoW = Math.round(size * TEXTO_LARGURA)
  const logoH = Math.round(logoW / LOGO_RATIO)
  const luz = Math.round(size * LUZ_DIAMETRO)
  return (
    <div className={`bl-root ${className}`} style={{ width: size, height: size }}>
      <div className="bl-circulo" style={{ width: luz, height: luz }} aria-hidden="true">
        <PulsingBorder {...LUZ} speed={animated ? LUZ.speed : 0} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SRC} alt="" className="bl-logo" width={logoW} height={logoH} draggable={false} />
    </div>
  )
}
