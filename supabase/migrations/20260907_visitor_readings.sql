-- ============================================================================
-- Multioráculo — gratuita sem login (visitante) + cota por tipo de consumo
-- Migration para REVISÃO MANUAL. Não executar sem aprovação.
-- Só ADICIONA colunas opcionais e índices em reading_usage e substitui a
-- função consume_reading por uma versão com o parâmetro p_kind.
-- Não apaga nem altera nenhum dado. Linhas existentes ficam com
-- visitor_id nulo e kind = 'reading'. Pode rodar mais de uma vez.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Tipo de consumo: tiragem, interpretação de sonho ou jornada onírica.
--    Cada um tem a própria cota no plano; todos usam a mesma tabela e regra.
-- ----------------------------------------------------------------------------
alter table public.reading_usage
  add column if not exists kind text not null default 'reading';

do $$ begin
  alter table public.reading_usage
    add constraint reading_usage_kind_check check (kind in ('reading', 'dream', 'journey'));
exception when duplicate_object then null; end $$;

create index if not exists reading_usage_user_kind_period_idx
  on public.reading_usage (user_id, kind, created_at desc);

-- ----------------------------------------------------------------------------
-- 2) Identificador do visitante (cookie httpOnly gerado pelo site). Preenchido
--    apenas em consumos feitos sem login. Quando a pessoa entra, essas linhas
--    recebem user_id (atribuição) e passam a contar na cota da conta.
-- ----------------------------------------------------------------------------
alter table public.reading_usage
  add column if not exists visitor_id text;

create index if not exists reading_usage_visitor_idx
  on public.reading_usage (visitor_id)
  where visitor_id is not null;

-- Um visitante tem UMA gratuita de cada tipo (uma tiragem, um sonho): no
-- máximo uma linha não-falha por (visitor_id, kind). O banco garante isso
-- mesmo com dois cliques simultâneos. Linhas 'failed' não contam nem
-- bloqueiam. A linha continua bloqueando depois de atribuída a uma conta,
-- para que sair da conta não devolva a gratuita.
drop index if exists public.reading_usage_visitor_trial_idx;
create unique index if not exists reading_usage_visitor_trial_idx
  on public.reading_usage (visitor_id, kind)
  where visitor_id is not null and status <> 'failed';

-- ----------------------------------------------------------------------------
-- 3) consume_reading com tipo de consumo. A assinatura anterior (6 parâmetros)
--    é removida para não haver duas versões; nenhum dado é afetado.
--    Regra igual à anterior: só 'completed' conta de verdade; 'started' conta
--    apenas nos primeiros minutos; abandonadas viram 'failed'.
-- ----------------------------------------------------------------------------
drop function if exists public.consume_reading(uuid, text, integer, timestamptz, timestamptz, text);

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
     and created_at < now() - v_window;

  select count(*)::integer into v_used
    from public.reading_usage
   where user_id = p_user_id
     and kind = p_kind
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
