/**
 * Mapa de indexação das rotas públicas. É a ÚNICA fonte para o sitemap, e o
 * verificador (scripts/verify-seo.ts) confere que as rotas privadas não entram
 * aqui nem esquecem o noindex.
 *
 * `chave` aponta para dict.seo.<chave> (title e description por idioma).
 *
 * Não há nada de /en ou /es aqui: o idioma ainda é escolhido por cookie e a
 * mesma URL serve os três. Ver docs/seo-fase-1.md.
 */
export const PAGINAS_INDEXAVEIS = [
  { caminho: "/", chave: "home" },
  { caminho: "/oraculos", chave: "oraculos" },
  { caminho: "/faq", chave: "faq" },
  { caminho: "/sonhos", chave: "sonhos" },
  { caminho: "/horoscopo", chave: "horoscopo" },
  { caminho: "/assinatura", chave: "assinatura" },
  { caminho: "/interconexoes", chave: "interconexoes" },
] as const

export type ChavePagina = (typeof PAGINAS_INDEXAVEIS)[number]["chave"]

/** Arquivos de rota que NÃO podem ser indexados (pessoais, painel). O verificador confere cada um. */
export const ARQUIVOS_NOINDEX = [
  "app/home/page.tsx",
  "app/diario/page.tsx",
  "app/marcos/page.tsx",
  "app/sonhos-salvos/page.tsx",
  "app/leituras-salvas/page.tsx",
  "app/leituras-salvas/[id]/page.tsx",
  "app/leitura/[seed]/page.tsx",
  "app/admin/layout.tsx",
] as const
