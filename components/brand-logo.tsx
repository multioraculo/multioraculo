/** A marca: o M do Multioráculo, que já traz a própria luz, em fundo transparente. */
const LOGO_SRC = "/brand/multioraculo-m.png"

type Props = {
  /** lado da caixa, em px */
  size?: number
  className?: string
}

/**
 * Marca do Multioráculo. Antes eram duas camadas — um círculo de luz animado e o
 * logo tipográfico por cima. A marca nova tem brilho próprio, então o círculo saiu:
 * os dois brilhos disputavam a mesma área.
 */
export default function BrandLogo({ size = 80, className = "" }: Props) {
  return (
    <div className={`bl-root ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SRC} alt="" className="bl-logo" width={size} height={size} draggable={false} />
    </div>
  )
}
