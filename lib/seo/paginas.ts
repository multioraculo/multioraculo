/**
 * Mapa de indexação das rotas públicas. É a ÚNICA fonte para o sitemap, e o
 * verificador (scripts/verify-seo.ts) confere que as rotas privadas não entram
 * aqui nem esquecem o noindex.
 *
 * As 7 páginas existem em 3 idiomas, 21 URLs ao todo; os caminhos de cada
 * idioma moram em lib/i18n/rotas.ts. `chave` aponta para dict.seo.<chave>
 * (title e description por idioma).
 */
import { ROTAS_PUBLICAS, type ChaveRota } from "@/lib/i18n/rotas"

export type ChavePagina = ChaveRota

/** As 7 páginas, com o caminho em português (a URL "base"). */
export const PAGINAS_INDEXAVEIS = ROTAS_PUBLICAS.map((r) => ({ caminho: r.pt, chave: r.chave }))

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
