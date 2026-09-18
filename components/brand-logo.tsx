/** A marca: o M do Multioráculo, em fundo transparente e borda limpa. */
const LOGO_SRC = "/brand/multioraculo-m.png"

type Props = {
  /** lado da caixa, em px */
  size?: number
  className?: string
}

/**
 * Marca do Multioráculo, em duas camadas.
 *
 * A primeira é o arquivo, que é a marca e nada mais. A segunda é luz, e ela
 * usa o alfa do próprio arquivo como máscara: por isso a claridade não
 * escapa para fora do desenho, nem vira aura. Onde a fita é opaca a luz
 * acende; onde ela é translúcida, a luz atravessa junto com o fundo.
 *
 * É o contrário do que havia antes: o brilho do arquivo antigo era um glow
 * violeta pintado ao redor, que recortava a marca contra o gradiente. Aqui a
 * presença luminosa vem de dentro, e o contorno continua limpo.
 */
export default function BrandLogo({ size = 80, className = "" }: Props) {
  return (
    <div className={`bl-root ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SRC} alt="" className="bl-logo" width={size} height={size} draggable={false} />
      <span className="bl-luz" aria-hidden="true" />
    </div>
  )
}
