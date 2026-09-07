# Multioráculo

A mesma pergunta vista por cinco oráculos: Tarô, I Ching, Runas, Búzios e Lenormand. Next.js 15 (App Router), Supabase para autenticação e leituras salvas, OpenAI para interpretação.

## Como a consulta funciona

1. **Sorteio em código** (`lib/oracles/draw.ts`). As cinco tiragens são feitas ao mesmo tempo com um seed criptográfico, sem nenhuma participação do modelo de linguagem nem da pergunta. O seed fica salvo em cada leitura e permite reproduzir a tiragem.
2. **Interpretação** (`POST /consultas`). Cada oráculo vai ao modelo separadamente, com os símbolos já fixados e trechos de referência dos PDFs buscados pelos nomes dos símbolos. O modelo devolve só significados, notas, leitura e citações; as citações são validadas contra os trechos fornecidos.
3. **Síntese** (`POST /consultas/sintese`). O cliente envia os oráculos interpretados e recebe a síntese em streaming.

As duas rotas são separadas para caber no limite de 60 segundos por função do Netlify.

## Desenvolvimento

```bash
cp .env.example .env.local   # preencha as chaves
npm install
npm run dev
```

Os PDFs e o índice de trechos ficam em `data/` e não vão para o git. Sem eles, o app baixa o índice da release `v1-data` no GitHub para o diretório temporário do sistema. Para regenerar o índice a partir dos PDFs: `node scripts/index-pdfs.mjs`.

Teste estatístico do sorteio (Node 22+ roda TypeScript direto):

```bash
node --experimental-strip-types lib/oracles/draw.ts
```

## Assinaturas e limites

- **Entitlement central** em `lib/billing/entitlement.ts`: `getUserEntitlement(userId)` lê só a tabela `subscriptions` e responde plano, limite e período. Stripe, Google Play e App Store são apenas provedores que alimentam essa tabela (`billing_provider`).
- **Planos** em `lib/billing/plans.ts`, com cota por tipo de consumo (`reading` tiragem, `dream` interpretação de sonho, `journey` Jornada onírica): Free 1/1/0 por mês civil (a primeira tiragem e o primeiro sonho valem sem login, por cookie de visitante `mo_visitor`), Essencial 8/3/1 por ciclo de cobrança, Ilimitado sem limite. Sonhos salvos, Grimório e leituras salvas só exigem login. Uma tiragem completa = cinco oráculos + síntese, contada uma vez. Ao entrar, os consumos feitos sem login são atribuídos à conta (`attributeVisitorReadings`). Requer a migration `20260907_visitor_readings.sql`.
- **Consumo** em `lib/billing/usage.ts`: `POST /consultas` chama a função SQL `consume_reading` (checagem + registro atômicos, por usuário) antes do sorteio; a linha vira `completed` quando os cinco oráculos terminam ou `failed` se der erro. `POST /consultas/sintese` só roda para um seed concluído do mesmo usuário, uma vez. Nada é contado duas vezes.
- **Stripe**: Checkout (`POST /api/billing/checkout`) vincula a sessão ao `user.id` do Supabase por `client_reference_id` e metadata; Customer Portal (`POST /api/billing/portal`) para ver, trocar cartão e cancelar; webhook (`POST /api/billing/webhook`) é a única fonte de verdade do status, idempotente por `event.id`.
- **Schema**: `supabase/migrations/20260906_billing.sql` (tabelas `billing_customers`, `subscriptions`, `reading_usage`, `webhook_events`; RLS só de leitura própria; escrita apenas via service role).

## Deploy no Netlify

1. Crie um site novo no Netlify apontando para este repositório. O `netlify.toml` já define build, plugin do Next.js e Node 22.
2. Em **Site configuration → Environment variables**, defina `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. `PDFS_INDEX_URL` é opcional.
3. No Supabase, em **Authentication → URL Configuration**, adicione a URL do site Netlify em *Site URL* e *Redirect URLs*.
4. Faça o deploy. O middleware do Supabase roda como Edge Function; as rotas de API rodam como funções com streaming.

Limites do Netlify que importam aqui: 60 s por função (não configurável) e 20 MB por resposta em streaming. Nenhuma rota do app se aproxima do segundo; a primeira é o motivo de a consulta ser dividida em duas rotas.
