import type { SVGProps } from "react"

/**
 * Ícones lineares da navegação principal, todos no mesmo quadro 24×24,
 * traço 1.6, cantos arredondados. Cor vem de `currentColor`.
 */
type P = SVGProps<SVGSVGElement>
const base = (p: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
  ...p,
})

/** Sonhos: lua crescente */
export function MoonIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M14.5 3.5a8.5 8.5 0 1 0 6 14.2A9.5 9.5 0 0 1 14.5 3.5z" />
    </svg>
  )
}

/** Diário: livro aberto */
export function BookIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12 6.5c-1.6-1.4-4.2-2-8-2v13c3.8 0 6.4.6 8 2 1.6-1.4 4.2-2 8-2v-13c-3.8 0-6.4.6-8 2z" />
      <path d="M12 6.5v13" />
    </svg>
  )
}

/**
 * Home: o Sol.
 *
 * O DISCO É CHEIO, e é só isso que separa um sol de um ícone de brilho de
 * tela. Anéis finos com oito raios longos são o glifo universal de
 * luminosidade, e era exatamente o que estava aqui: a 22px o anel sumia entre
 * os raios e sobrava uma estrelinha. Disco sólido com raios curtos, e a leitura
 * vira sol antes de qualquer legenda.
 *
 * Os raios começam longe da borda do disco, com folga visível, e são curtos: o
 * sol é sobretudo corpo, e o ícone de brilho é sobretudo raio. Os diagonais
 * ficam um pouco menores que os cardeais, que é como o sol sempre foi
 * desenhado.
 *
 * A figura também voltou para o centro do quadro: estava em 10,5 e agora está
 * em 12, e ocupa 18 dos 24, a mesma largura da lua ao lado.
 */
export function SolIcon(p: P) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="4.7" fill="currentColor" stroke="none" />
      <path d="M12 5.4V3M18.6 12H21M12 18.6V21M5.4 12H3" />
      <path d="M16.67 7.33l1.48-1.48M16.67 16.67l1.48 1.48M7.33 16.67l-1.48 1.48M7.33 7.33L5.85 5.85" />
    </svg>
  )
}

/** Horóscopo: a estrela de quatro pontas da marca, com um brilho menor ao lado */
export function StarIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M10.5 3c0 4.1 3.4 7.5 7.5 7.5-4.1 0-7.5 3.4-7.5 7.5 0-4.1-3.4-7.5-7.5-7.5 4.1 0 7.5-3.4 7.5-7.5z" />
      <path d="M18.5 16v4M16.5 18h4" />
    </svg>
  )
}

/**
 * Multioráculo: cinco perspectivas convergindo numa única síntese.
 * Cinco traços saem de um arco e se encontram num ponto; o ponto é a síntese.
 */
export function MultioraculoIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12 16.5 3.6 9.2" />
      <path d="M12 16.5 7.2 5.4" />
      <path d="M12 16.5V3.8" />
      <path d="M12 16.5l4.8-11.1" />
      <path d="M12 16.5l8.4-7.3" />
      <circle cx="12" cy="16.5" r="2.1" fill="currentColor" stroke="none" />
      <path d="M12 18.6v2.2" />
    </svg>
  )
}

/** Assinatura: selo simples (roseta de oito lóbulos com centro) */
export function SealIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M12 3.2l1.9 1.6 2.4-.5.9 2.3 2.3.9-.5 2.4L20.8 12l-1.6 1.9.5 2.4-2.3.9-.9 2.3-2.4-.5L12 20.8l-1.9-1.6-2.4.5-.9-2.3-2.3-.9.5-2.4L3.2 12l1.6-1.9-.5-2.4 2.3-.9.9-2.3 2.4.5z" />
      <path d="M9.4 12.2l1.8 1.8 3.6-3.8" />
    </svg>
  )
}

/** Registros: caixa de arquivo (tampa, corpo e puxador) */
export function RecordsIcon(p: P) {
  return (
    <svg {...base(p)}>
      <rect x="3.5" y="4.5" width="17" height="4" rx="1" />
      <path d="M5 8.5v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9" />
      <path d="M10 12.5h4" />
    </svg>
  )
}

/** Explorar: lupa */
export function SearchIcon(p: P) {
  return (
    <svg {...base(p)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
    </svg>
  )
}
