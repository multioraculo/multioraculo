-- ============================================================================
-- Multioráculo — créditos comprados na OpenAI (o dinheiro que entrou)
-- Migration para REVISÃO MANUAL. Não executar sem aprovação.
-- Só CRIA uma tabela nova. Não apaga nem altera nenhum dado existente.
-- Pode rodar mais de uma vez.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- openai_credits — cada recarga feita na conta da OpenAI, uma linha por vez.
--
--    POR QUE ISTO PRECISA SER DIGITADO, e não lido de algum lugar. A API da
--    OpenAI não expõe saldo restante para uma chave comum: o que existe é a
--    API de custos da organização, que precisa de uma chave de administração
--    (sk-admin-...) e ainda assim informa QUANTO FOI GASTO, nunca quanto
--    sobrou. Quanto foi colocado é uma informação que só quem pagou tem.
--
--    Então o saldo aqui é uma subtração honesta: soma do que foi depositado,
--    menos o gasto medido em ai_usage. O gasto é estimativa calculada por
--    tokens no momento de cada chamada, e a tela diz isso com todas as letras.
--
--    É um LIVRO DE ENTRADAS, não um saldo guardado. Ninguém atualiza um campo
--    "saldo atual": acrescenta-se a recarga, e o restante é sempre recalculado.
--    Saldo guardado desanda em silêncio; uma soma não tem como divergir dela
--    mesma.
--
--    occurred_on é a data da recarga, que pode ser anterior ao dia em que
--    alguém registrou. created_at é quando a linha foi escrita. Servem para
--    coisas diferentes e por isso são duas.
--
--    Mesmo padrão de sky_daily e horoscope_daily: conteúdo administrativo,
--    escrito e lido só pelo servidor, sem acesso nenhum pelo cliente. Quem
--    pode mexer é a rota /api/admin/openai-creditos, atrás de currentAdmin().
-- ----------------------------------------------------------------------------
create table if not exists public.openai_credits (
  id          uuid primary key default gen_random_uuid(),
  -- em dólares, que é a moeda da OpenAI; nunca em centavos, para o valor
  -- digitado ser igual ao valor do recibo
  amount_usd  numeric(12, 2) not null check (amount_usd > 0 and amount_usd <= 1000000),
  -- quando o dinheiro entrou na OpenAI
  occurred_on date not null default current_date check (occurred_on > date '2020-01-01'),
  note        text check (note is null or char_length(note) <= 200),
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists openai_credits_occurred_idx on public.openai_credits (occurred_on desc);

alter table public.openai_credits enable row level security;

-- Ninguém acessa pelo cliente: quem lê e escreve é a rota, com a service role.
revoke all on table public.openai_credits from anon, authenticated;
grant select, insert, delete on table public.openai_credits to service_role;
