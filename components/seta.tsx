/**
 * As setas do Multioráculo, desenhadas e não escritas.
 *
 * POR QUE NÃO O CARACTERE. "↗" é um emoji em Unicode: no iPhone e em vários
 * Androids ele vira um quadradinho colorido, do sistema, que não tem nada da
 * identidade da página (e o traço do "→", do "↓" e do "▾" muda de peso a cada
 * fonte). Aqui é um traço fino, de ponta redonda, que herda a cor e o tamanho
 * de quem o contém (1em) e fica igual em qualquer aparelho.
 *
 * Uso: <Seta /> (diagonal, "sair desta página"), <Seta tipo="direita" />,
 * <Seta tipo="baixo" /> (a seta cheia) e <Seta tipo="chevron" /> (o ▾ de abrir/fechar).
 */
export type TipoDeSeta = "diagonal" | "direita" | "baixo" | "chevron"

const TRACOS: Record<TipoDeSeta, string> = {
  diagonal: "M7 17 L17 7 M9 7 H17 V15",
  direita: "M5 12 H19 M13 6 L19 12 L13 18",
  baixo: "M12 5 V19 M6 13 L12 19 L18 13",
  chevron: "M6 9.5 L12 15.5 L18 9.5",
}

export default function Seta({ tipo = "diagonal", className = "" }: { tipo?: TipoDeSeta; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
      className={`inline-block shrink-0 align-[-0.14em] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={TRACOS[tipo]} />
    </svg>
  )
}
