-- ============================================================================
-- Multioráculo — preview paywall na segunda tiragem
-- Migration para REVISÃO MANUAL. Não executar sem aprovação.
-- Só ADICIONA colunas, índices e duas tabelas novas e substitui a função
-- consume_reading (mesma assinatura) para ignorar leituras em preview.
-- Não apaga nem altera nenhum dado existente. Pode rodar mais de uma vez.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) reading_usage: marca de preview, desbloqueio e expiração
--    preview = true  → tiragem gerada além da cota, guardada no servidor e
--                      mostrada só como teaser até a pessoa assinar.
--    unlocked_at     → quando a leitura foi liberada (não consome cota).
--    expired_at      → preview não desbloqueada em 30 dias; deixa de existir.
-- ----------------------------------------------------------------------------
alter table public.reading_usage
  add column if not exists preview boolean not null default false;
alter table public.reading_usage
  add column if not exists unlocked_at timestamptz;
alter table public.reading_usage
  add column if not exists expired_at timestamptz;

-- A gratuita do visitante continua única por tipo, mas a linha de preview
-- não entra nessa conta (índice recriado com "and not preview").
drop index if exists public.reading_usage_visitor_trial_idx;
create unique index if not exists reading_usage_visitor_trial_idx
  on public.reading_usage (visitor_id, kind)
  where visitor_id is not null and status <> 'failed' and not preview;

-- UMA preview pendente por pessoa (conta ou visitante), garantida pelo banco
-- mesmo com dois cliques simultâneos. Pendente = não desbloqueada, não
-- expirada, não falha.
create unique index if not exists reading_usage_preview_user_idx
  on public.reading_usage (user_id, kind)
  where preview and user_id is not null
    and unlocked_at is null and expired_at is null and status <> 'failed';

create unique index if not exists reading_usage_preview_visitor_idx
  on public.reading_usage (visitor_id, kind)
  where preview and user_id is null and visitor_id is not null
    and unlocked_at is null and expired_at is null and status <> 'failed';

create index if not exists reading_usage_preview_pending_idx
  on public.reading_usage (created_at)
  where preview and unlocked_at is null and expired_at is null;

-- ----------------------------------------------------------------------------
-- 2) reading_results: conteúdo completo das leituras em preview.
--    SÓ o servidor lê e escreve. Nenhuma política para o cliente: o texto
--    bloqueado nunca é entregue ao navegador enquanto não houver entitlement.
--    Apagada automaticamente quando a linha de uso correspondente some.
-- ----------------------------------------------------------------------------
create table if not exists public.reading_results (
  seed        text primary key references public.reading_usage (seed) on delete cascade,
  user_id     uuid references auth.users (id) on delete set null,
  visitor_id  text,
  question    text not null,
  locale      text not null default 'pt',
  oracles     jsonb not null,
  synthesis   text not null,
  created_at  timestamptz not null default now(),
  unlocked_at timestamptz
);

create index if not exists reading_results_user_idx on public.reading_results (user_id) where user_id is not null;

alter table public.reading_results enable row level security;
-- Sem políticas: apenas service_role acessa.
revoke all on table public.reading_results from anon, authenticated;
grant all on table public.reading_results to service_role;

-- ----------------------------------------------------------------------------
-- 3) product_events: eventos mínimos de funil, sem conteúdo pessoal.
--    Compartilhada com a futura área administrativa.
-- ----------------------------------------------------------------------------
create table if not exists public.product_events (
  id         uuid primary key default gen_random_uuid(),
  event_type text not null,
  user_id    uuid references auth.users (id) on delete set null,
  visitor_id text,
  seed       text,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists product_events_type_created_idx on public.product_events (event_type, created_at desc);

alter table public.product_events enable row level security;
-- Sem políticas: apenas service_role acessa.
revoke all on table public.product_events from anon, authenticated;
grant all on table public.product_events to service_role;

-- ----------------------------------------------------------------------------
-- 4) consume_reading: leituras em preview nunca contam na cota (nem antes
--    nem depois do desbloqueio). Mesma assinatura da versão anterior.
-- ----------------------------------------------------------------------------
create or replace function public.consume_reading(
  p_user_id      uuid,
  p_seed         text,
  p_limit        integer,
  p_period_start timestamptz,
  p_period_end   timestamptz,
  p_locale       text default null,
  p_kind         text default 'reading'
)
returns table (allowed boolean, used integer, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used integer;
  v_window constant interval := interval '10 minutes';
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text || ':' || p_kind));

  update public.reading_usage
     set status = 'failed'
   where user_id = p_user_id
     and kind = p_kind
     and status = 'started'
     and not preview
     and created_at < now() - v_window;

  select count(*)::integer into v_used
    from public.reading_usage
   where user_id = p_user_id
     and kind = p_kind
     and not preview
     and created_at >= p_period_start
     and created_at <  p_period_end
     and (
       status = 'completed'
       or (status = 'started' and created_at >= now() - v_window)
     );

  if p_limit is not null and v_used >= p_limit then
    return query select false, v_used, 0;
    return;
  end if;

  insert into public.reading_usage (user_id, seed, status, locale, kind)
  values (p_user_id, p_seed, 'started', p_locale, p_kind);

  return query select
    true,
    v_used + 1,
    case when p_limit is null then null else greatest(p_limit - v_used - 1, 0) end;
end $$;

revoke all on function public.consume_reading(uuid, text, integer, timestamptz, timestamptz, text, text) from public, anon, authenticated;
grant execute on function public.consume_reading(uuid, text, integer, timestamptz, timestamptz, text, text) to service_role;
