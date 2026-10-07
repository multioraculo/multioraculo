# SEO, fase 1: fundação (sem mudar URLs)

Decisões aprovadas: `/` é a entrada pública; `/home` é painel (`noindex, follow`);
arquitetura futura PT na raiz, EN em `/en`, ES em `/es`, **não implementada**
nesta fase (por isso não há `hreflang`, nem alternates no sitemap).

## Ordem executada

1. `noindex, follow` explícito: `/home`, `/diario`, `/marcos`, `/sonhos-salvos`,
   `/leituras-salvas`, `/leituras-salvas/[id]`, `/leitura/[seed]`, `/admin/*`
   (via `app/admin/layout.tsx`) e `/auth/callback` (cabeçalho `X-Robots-Tag`
   em `next.config.mjs`, porque é redirect sem HTML).
2. Title e description próprios por rota, nos três idiomas (`dict.seo`).
3. Canonical limpo por rota (caminho sem parâmetros).
4. Trava de custo do `/api/horoscopo` (`lib/astro/horoscopo-guarda.ts`).
5. `robots.txt`.
6. `sitemap.xml` só com as páginas indexáveis.
7. H1 em `/oraculos` e `/faq`.
8. Open Graph e Twitter (imagem `opengraph-image.tsx`).
9. `alt` das imagens de carta (nome da carta).
10. Manifest, `favicon.ico`, `theme-color`.
11. JSON-LD na Home: `Organization` e `WebSite`.

## Por que o robots.txt só bloqueia `/api/`

`Disallow` impede o rastreador de abrir a página, e então ele nunca lê o
`noindex`. As rotas privadas ficam abertas ao rastreamento, com `noindex`; quem
protege o conteúdo é a autenticação de cada rota (nada disto é segurança).

## Autorização e RLS (verificado antes de editar)

- Todas as rotas de `dreams`, `journal`, `marcos`, `consultations`, `mapa`,
  `sinastria` exigem sessão (401) e filtram por `user_id`. As páginas
  `/leituras-salvas/[id]`, `/diario`, `/sonhos-salvos` idem.
- `/leitura/[seed]` só abre para o dono (usuário ou visitante) e responde 404
  para os demais.
- Leitura anônima via PostgREST com a chave pública: `consultations`,
  `journal_entries`, `dreams`, `dream_entries`, `journey_analyses` e `profiles`
  devolvem `[]`; `milestones`, `reading_usage`, `reading_results`,
  `birth_data`, `saved_people`, `product_events` e `horoscope_daily` devolvem
  401 (permission denied). `[]` é compatível com RLS ligada, mas não prova
  sozinho que as políticas filtram por usuário: as tabelas
  `consultations`, `journal_entries`, `dreams`, `dream_entries`,
  `journey_analyses` e `profiles` não têm migration neste repositório.
  **Pendente (precisa do SQL Editor do Supabase):** rodar
  `supabase/checks/rls_check.sql` e confirmar que todas as linhas dizem `OK`.

## `/api/horoscopo`: custo

Teto de gerações bem-sucedidas: 12 signos × 3 idiomas = 36 por dia (depois
todo mundo lê do banco). Repetições possíveis antes da guarda: (1) leitura que
falha no verificador não é gravada, então cada pedido pagava nova rodada;
(2) pedidos simultâneos antes da primeira gravação geravam todos.

Guarda por instância: pedido igual em andamento é compartilhado; chave que
tentou e falhou esfria 5 minutos (devolve o céu calculado sem texto, o mesmo
que a rota já devolvia na falha). Falha sem gasto (cache fora do ar, sem chave)
não esfria. Limite: a memória é da instância serverless; um teto global exigiria
estado no banco (migration + service role), decisão à parte.

## Arquivos

Novos: `lib/seo/{site,paginas,metadata,rota,json-ld}.ts`,
`components/json-ld.tsx`, `app/{robots,sitemap,manifest}.ts`,
`app/opengraph-image.tsx`, `public/favicon.ico`,
`lib/astro/horoscopo-guarda.ts`, `scripts/verify-seo.ts`, este documento.

Alterados: `app/layout.tsx`, `app/page.tsx`, `app/{oraculos,faq,sonhos,horoscopo,assinatura,interconexoes}/page.tsx`,
as 8 rotas privadas, `app/api/horoscopo/route.ts`, `middleware.ts`,
`next.config.mjs`, `lib/i18n/dictionaries/{pt,en,es}.ts`,
`components/{tarot-spread,lenormand-table}.tsx`, `package.json` (script
`verify:seo` no prebuild).

## Testes

`npm run verify:seo` (também no prebuild): noindex em cada rota privada e
ausente nas públicas; robots sem bloquear páginas com noindex; sitemap igual à
lista de indexáveis, sem alternates; title/description nos 3 idiomas dentro dos
limites; canonical limpo, `og:*` absolutos, sem `hreflang`; JSON-LD sem
propriedade inventada; middleware não toca em robots/sitemap/manifest/OG;
guarda de custo (simultâneos, falha paga, falha sem gasto, erro, janela).

## Fora desta fase

Prefixos `/en` e `/es`, `hreflang`, páginas dos oráculos, `FAQPage`,
`BreadcrumbList`, `WebApplication` (exige oferta e avaliação que o produto não
pode declarar com verdade), cache de CDN das páginas públicas, `viewport` que
bloqueia zoom.
