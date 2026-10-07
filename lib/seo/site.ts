/**
 * Endereço público do site e nome da marca, em um lugar só.
 *
 * A URL vem de NEXT_PUBLIC_SITE_URL (a mesma variável que o Checkout usa) e
 * cai para o domínio de produção. Sem barra no fim: quem junta caminhos
 * sempre começa o caminho com "/".
 */
export const SITE_NAME = "Multioráculo"
const PADRAO = "https://multioraculo.com"

export function siteUrl(): string {
  const configurada = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const url = configurada && /^https?:\/\//i.test(configurada) ? configurada : PADRAO
  return url.replace(/\/+$/, "")
}

/** "/faq" vira "https://multioraculo.com/faq"; "/" vira "https://multioraculo.com/". */
export function urlAbsoluta(caminho: string): string {
  return `${siteUrl()}${caminho.startsWith("/") ? caminho : `/${caminho}`}`
}
