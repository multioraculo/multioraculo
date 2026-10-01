/**
 * O lápis: o sinal de que aquilo ali é editável.
 *
 * Existe porque texto clicável sem marca nenhuma depende de a pessoa descobrir
 * sozinha que pode clicar, e quase ninguém descobre. Um traço fino, herdando a
 * cor de quem o contém, para ele acompanhar o estado de hover do bloco inteiro
 * em vez de brigar com ele.
 */
export default function Lapis({ tamanho = 11 }: { tamanho?: number }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M11.2 2.3a1.6 1.6 0 0 1 2.3 2.3L5.4 12.7l-3 .7.7-3z" />
    </svg>
  )
}
