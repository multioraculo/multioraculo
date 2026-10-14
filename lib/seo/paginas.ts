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

/** Pasta onde TODA página mora: o idioma é o segmento (ver app/l/[locale]/layout.tsx e middleware.ts). */
export const PASTA_DAS_PAGINAS = "app/l/[locale]"

/** Arquivo da página de um caminho em português: "/faq" → app/l/[locale]/faq/page.tsx. */
export function arquivoDaPagina(caminhoPt: string): string {
  return `${PASTA_DAS_PAGINAS}${caminhoPt === "/" ? "" : caminhoPt}/page.tsx`
}

/** Arquivos de rota que NÃO podem ser indexados (pessoais, painel). O verificador confere cada um. */
export const ARQUIVOS_NOINDEX = [
  arquivoDaPagina("/home"),
  arquivoDaPagina("/diario"),
  arquivoDaPagina("/marcos"),
  arquivoDaPagina("/sonhos-salvos"),
  arquivoDaPagina("/leituras-salvas"),
  arquivoDaPagina("/leituras-salvas/[id]"),
  arquivoDaPagina("/leitura/[seed]"),
  `${PASTA_DAS_PAGINAS}/admin/layout.tsx`,
] as const
