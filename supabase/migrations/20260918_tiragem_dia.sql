-- ============================================================================
-- Multioráculo — tiragem do dia (uma dupla de cartas para todos, com síntese)
-- Migration para REVISÃO MANUAL. Não executar sem aprovação.
-- Só CRIA uma tabela nova e amplia o check de ai_usage. Não apaga nem altera
-- nenhum dado existente. Pode rodar mais de uma vez.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) daily_draw — a síntese da tiragem do dia.
--
--    A DUPLA NÃO É GUARDADA AQUI. Ela é recalculável a qualquer momento a
--    partir de sha256('dia:v1:' || dia), com o mesmo RNG das consultas, e por
--    isso vira sozinha à meia-noite sem nenhum job. O seed fica na linha
--    apenas para auditoria: permite reconstruir exatamente as cartas que
--    aquele texto interpretou.
--
--    Uma linha por dia e idioma, e não por pessoa: a tiragem é a mesma para
--    todo mundo. São três gerações por dia no total.
--
--    Esta tabela NÃO participa de cota: a tiragem do dia não consome leitura,
--    não escreve em reading_usage e não aparece em consultations. Não há
--    user_id aqui, e portanto nenhum dado pessoal.
-- ----------------------------------------------------------------------------
create table if not exists public.daily_draw (
  dia        date not null,
  locale     text not null check (locale in ('pt', 'en', 'es')),
  seed       text not null,
  eixo       jsonb not null default '[]'::jsonb,
  sintese    text not null,
  model      text not null,
  tentativas smallint not null default 1,
  created_at timestamptz not null default now(),
  primary key (dia, locale)
);

create index if not exists daily_draw_dia_idx on public.daily_draw (dia desc);

alter table public.daily_draw enable row level security;
revoke all on table public.daily_draw from anon, authenticated;
grant all on table public.daily_draw to service_role;

-- ----------------------------------------------------------------------------
-- 2) ai_usage aceita a operação nova, para o custo aparecer no painel.
-- ----------------------------------------------------------------------------
alter table public.ai_usage drop constraint if exists ai_usage_operation_type_check;

alter table public.ai_usage
  add constraint ai_usage_operation_type_check
  check (operation_type in ('safety', 'oracle', 'synthesis', 'dream', 'journey', 'transcribe', 'horoscope', 'daily_draw'));
