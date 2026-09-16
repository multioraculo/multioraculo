-- ============================================================================
-- Multioráculo — horóscopo diário (leitura gerada sob demanda e reaproveitada)
-- Migration para REVISÃO MANUAL. Não executar sem aprovação.
-- Só CRIA uma tabela nova e amplia o check de ai_usage. Não apaga nem altera
-- nenhum dado existente. Pode rodar mais de uma vez.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) horoscope_daily — a leitura do dia. Uma linha por (dia, signo, idioma),
--    servida a todo mundo daquele signo: o horóscopo geral não tem dono, e
--    por isso não há user_id aqui nem dado pessoal nenhum.
--
--    Gerada SOB DEMANDA: só o signo que alguém abriu é gerado, uma vez por
--    dia e por idioma. Signo que ninguém abriu não custa chamada nenhuma.
--
--    leitura    = o que o modelo escreveu (foco, polaridades, explicações,
--                 tendências), já aprovado pelo verificador
--    cards      = os movimentos selecionados, já com nomes e traduções no
--                 idioma da linha, exatamente como foram mostrados ao modelo
--    movimentos = os ids dos movimentos, para auditar a tiragem sem abrir o
--                 JSON inteiro
--
--    Só entra linha que passou no verificador; leitura reprovada não é gravada.
-- ----------------------------------------------------------------------------
create table if not exists public.horoscope_daily (
  dia        date not null,
  signo      smallint not null check (signo between 0 and 11),
  locale     text not null check (locale in ('pt', 'en', 'es')),
  leitura    jsonb not null,
  cards      jsonb not null default '[]'::jsonb,
  movimentos jsonb not null default '[]'::jsonb,
  model      text not null,
  tentativas smallint not null default 1,
  created_at timestamptz not null default now(),
  primary key (dia, signo, locale)
);

create index if not exists horoscope_daily_dia_idx on public.horoscope_daily (dia desc);

alter table public.horoscope_daily enable row level security;
revoke all on table public.horoscope_daily from anon, authenticated;
grant all on table public.horoscope_daily to service_role;

-- ----------------------------------------------------------------------------
-- 2) ai_usage aceita a operação nova. Mesma forma da migration do transcribe.
-- ----------------------------------------------------------------------------
alter table public.ai_usage drop constraint if exists ai_usage_operation_type_check;

alter table public.ai_usage
  add constraint ai_usage_operation_type_check
  check (operation_type in ('safety', 'oracle', 'synthesis', 'dream', 'journey', 'transcribe', 'horoscope'));
