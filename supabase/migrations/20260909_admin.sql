-- ============================================================================
-- Multioráculo — área administrativa, papéis, acessos especiais e custo de IA
-- Migration para REVISÃO MANUAL. Não executar sem aprovação.
--
-- O que faz (só cria objetos novos; não apaga nem altera dados existentes;
-- pode rodar mais de uma vez):
--   1) user_roles        — papel de cada usuário (admin | user)
--   2) access_overrides  — acesso especial sem Stripe (admin, beta tester…)
--   3) ai_usage          — tokens e custo estimado de cada chamada à OpenAI
--   4) primeiro admin    — multioraculo@gmail.com (papel + override permanente)
--   5) funções de leitura agregada para o dashboard (só service_role)
--
-- Nenhuma tabela nova tem política para anon/authenticated: só o servidor
-- (service_role) lê e escreve. O navegador nunca consegue conceder papel
-- ou override a si mesmo.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) user_roles
-- ----------------------------------------------------------------------------
create table if not exists public.user_roles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists user_roles_set_updated_at on public.user_roles;
create trigger user_roles_set_updated_at
  before update on public.user_roles
  for each row execute function public.billing_set_updated_at();

alter table public.user_roles enable row level security;
revoke all on table public.user_roles from anon, authenticated;
grant all on table public.user_roles to service_role;

-- ----------------------------------------------------------------------------
-- 2) access_overrides — acesso concedido internamente, sem passar pela Stripe.
--    Identificado por e-mail (minúsculo) para funcionar antes de a pessoa
--    criar a conta; user_id é preenchido no primeiro login (get_user_access).
--    Revogar = preencher revoked_at (a linha fica no histórico).
-- ----------------------------------------------------------------------------
create table if not exists public.access_overrides (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users (id) on delete set null,
  email         text not null check (email = lower(btrim(email)) and position('@' in email) > 1),
  plan_override public.subscription_plan not null default 'unlimited',
  reason        text not null default 'beta_tester' check (length(reason) between 1 and 80),
  expires_at    timestamptz,
  revoked_at    timestamptz,
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Um único acesso vigente por e-mail (revogados não bloqueiam um novo).
create unique index if not exists access_overrides_active_email_idx
  on public.access_overrides (email)
  where revoked_at is null;

create index if not exists access_overrides_user_idx
  on public.access_overrides (user_id)
  where user_id is not null;

drop trigger if exists access_overrides_set_updated_at on public.access_overrides;
create trigger access_overrides_set_updated_at
  before update on public.access_overrides
  for each row execute function public.billing_set_updated_at();

alter table public.access_overrides enable row level security;
revoke all on table public.access_overrides from anon, authenticated;
grant all on table public.access_overrides to service_role;

-- ----------------------------------------------------------------------------
-- 3) ai_usage — uma linha por chamada ao modelo. Sem prompt e sem resposta.
--    estimated_cost_usd é calculado no momento da chamada com a tabela de
--    preços vigente (pricing_version registra qual), para o histórico não
--    ser recalculado quando o preço mudar.
-- ----------------------------------------------------------------------------
create table if not exists public.ai_usage (
  id                 uuid primary key default gen_random_uuid(),
  operation_type     text not null check (operation_type in ('safety', 'oracle', 'synthesis', 'dream', 'journey')),
  model              text not null,
  input_tokens       integer not null default 0,
  output_tokens      integer not null default 0,
  total_tokens       integer not null default 0,
  estimated_cost_usd numeric(12, 6) not null default 0,
  pricing_version    text,
  seed               text,
  user_id            uuid references auth.users (id) on delete set null,
  created_at         timestamptz not null default now()
);

create index if not exists ai_usage_created_idx on public.ai_usage (created_at desc);
create index if not exists ai_usage_seed_idx on public.ai_usage (seed) where seed is not null;

alter table public.ai_usage enable row level security;
revoke all on table public.ai_usage from anon, authenticated;
grant all on table public.ai_usage to service_role;

-- ----------------------------------------------------------------------------
-- 4) Primeiro admin. Se a conta já existir, recebe o papel agora; o override
--    por e-mail garante o reconhecimento no primeiro login caso ainda não
--    exista. Sem cliente, assinatura ou receita na Stripe.
-- ----------------------------------------------------------------------------
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where lower(email) = 'multioraculo@gmail.com'
on conflict (user_id) do update set role = 'admin', updated_at = now();

insert into public.access_overrides (user_id, email, plan_override, reason)
select u.id, 'multioraculo@gmail.com', 'unlimited', 'admin'
  from (select 1) as one
  left join lateral (select id from auth.users where lower(email) = 'multioraculo@gmail.com' limit 1) u on true
 where not exists (
   select 1 from public.access_overrides where email = 'multioraculo@gmail.com' and revoked_at is null
 );

-- ----------------------------------------------------------------------------
-- 5) Funções (security definer, só service_role)
-- ----------------------------------------------------------------------------

-- Início do dia/mês no fuso do produto, como timestamptz.
create or replace function public.admin_period_start(p_unit text)
returns timestamptz
language sql
stable
set search_path = public
as $$
  select (date_trunc(p_unit, now() at time zone 'America/Sao_Paulo')) at time zone 'America/Sao_Paulo';
$$;

-- Acesso especial de um usuário: 'admin' ou 'override' vigente. Sem linha =
-- segue a assinatura ou o Free. Liga o override por e-mail à conta no
-- primeiro uso e concede o papel admin quando o motivo do override é 'admin'.
create or replace function public.get_user_access(p_user_id uuid)
returns table (source text, plan text, reason text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_role  text;
  r       public.access_overrides%rowtype;
begin
  select lower(u.email) into v_email from auth.users u where u.id = p_user_id;
  select ur.role into v_role from public.user_roles ur where ur.user_id = p_user_id;

  select o.* into r
    from public.access_overrides o
   where o.revoked_at is null
     and (o.expires_at is null or o.expires_at > now())
     and (o.user_id = p_user_id or (o.user_id is null and v_email is not null and o.email = v_email))
   order by (o.user_id = p_user_id) desc, o.created_at desc
   limit 1;

  if r.id is not null and r.user_id is null then
    update public.access_overrides set user_id = p_user_id where id = r.id;
  end if;

  if r.id is not null and r.reason = 'admin' and coalesce(v_role, '') <> 'admin' then
    insert into public.user_roles (user_id, role) values (p_user_id, 'admin')
    on conflict (user_id) do update set role = 'admin', updated_at = now();
    v_role := 'admin';
  end if;

  if v_role = 'admin' then
    return query select 'admin'::text, 'unlimited'::text, coalesce(r.reason, 'admin')::text, null::timestamptz;
    return;
  end if;

  if r.id is not null then
    return query select 'override'::text, r.plan_override::text, r.reason, r.expires_at;
    return;
  end if;

  return;
end $$;

-- Resumo geral (contagens atuais). Só números; nenhum conteúdo.
create or replace function public.admin_overview()
returns jsonb
language sql
security definer
set search_path = public
as $$
  with d as (select public.admin_period_start('day') as day, public.admin_period_start('month') as month)
  select jsonb_build_object(
    'users_total',        (select count(*) from auth.users),
    'users_new_month',    (select count(*) from auth.users, d where created_at >= d.month),
    'users_active_month', (select count(distinct user_id) from public.reading_usage, d
                            where user_id is not null and status = 'completed' and not preview and created_at >= d.month),
    'readings_today',     (select count(*) from public.reading_usage, d where kind = 'reading' and status = 'completed' and not preview and created_at >= d.day),
    'readings_month',     (select count(*) from public.reading_usage, d where kind = 'reading' and status = 'completed' and not preview and created_at >= d.month),
    'readings_total',     (select count(*) from public.reading_usage where kind = 'reading' and status = 'completed' and not preview),
    'reading_users_total',(select count(distinct coalesce(user_id::text, visitor_id)) from public.reading_usage where kind = 'reading' and status = 'completed' and not preview),
    'previews_month',     (select count(*) from public.reading_usage, d where preview and status = 'completed' and created_at >= d.month),
    'previews_total',     (select count(*) from public.reading_usage where preview and status = 'completed'),
    'previews_unlocked',  (select count(*) from public.reading_usage where preview and unlocked_at is not null),
    'dreams_today',       (select count(*) from public.reading_usage, d where kind = 'dream' and status = 'completed' and created_at >= d.day),
    'dreams_month',       (select count(*) from public.reading_usage, d where kind = 'dream' and status = 'completed' and created_at >= d.month),
    'dreams_total',       (select count(*) from public.reading_usage where kind = 'dream' and status = 'completed'),
    'dream_users_total',  (select count(distinct coalesce(user_id::text, visitor_id)) from public.reading_usage where kind = 'dream' and status = 'completed'),
    'dream_users_month',  (select count(distinct coalesce(user_id::text, visitor_id)) from public.reading_usage, d where kind = 'dream' and status = 'completed' and created_at >= d.month),
    'dream_repeat_users', (select count(*) from (select user_id from public.reading_usage where kind = 'dream' and status = 'completed' and user_id is not null group by user_id having count(*) > 1) x),
    'journeys_month',     (select count(*) from public.reading_usage, d where kind = 'journey' and status = 'completed' and created_at >= d.month),
    'journeys_total',     (select count(*) from public.reading_usage where kind = 'journey' and status = 'completed'),
    'saved_readings_total', (select count(*) from public.consultations),
    'saved_dreams_total',   (select count(*) from public.dreams),
    'saved_journeys_total', (select count(*) from public.journey_analyses),
    'subs_active',        (select count(*) from public.subscriptions where status in ('active','trialing','past_due') and plan <> 'free'),
    'subs_essential',     (select count(*) from public.subscriptions where status in ('active','trialing','past_due') and plan = 'essential'),
    'subs_unlimited',     (select count(*) from public.subscriptions where status in ('active','trialing','past_due') and plan = 'unlimited'),
    'subs_past_due',      (select count(*) from public.subscriptions where status = 'past_due'),
    'subs_cancel_scheduled', (select count(*) from public.subscriptions where status in ('active','trialing','past_due') and cancel_at_period_end),
    'subs_canceled',      (select count(*) from public.subscriptions where status in ('canceled','unpaid','incomplete_expired')),
    'subs_new_month',     (select count(*) from public.subscriptions, d where created_at >= d.month and plan <> 'free'),
    'subs_canceled_month',(select count(*) from public.subscriptions, d where canceled_at >= d.month),
    'overrides_active',   (select count(*) from public.access_overrides where revoked_at is null and (expires_at is null or expires_at > now()) and reason <> 'admin'),
    'admins',             (select count(*) from public.user_roles where role = 'admin'),
    'ai_cost_today',      (select coalesce(sum(estimated_cost_usd), 0) from public.ai_usage, d where created_at >= d.day),
    'ai_cost_month',      (select coalesce(sum(estimated_cost_usd), 0) from public.ai_usage, d where created_at >= d.month),
    'ai_cost_total',      (select coalesce(sum(estimated_cost_usd), 0) from public.ai_usage),
    'ai_calls_month',     (select count(*) from public.ai_usage, d where created_at >= d.month),
    'ai_input_month',     (select coalesce(sum(input_tokens), 0) from public.ai_usage, d where created_at >= d.month),
    'ai_output_month',    (select coalesce(sum(output_tokens), 0) from public.ai_usage, d where created_at >= d.month),
    'ai_since',           (select min(created_at) from public.ai_usage),
    'usage_since',        (select min(created_at) from public.reading_usage),
    'events_since',       (select min(created_at) from public.product_events)
  );
$$;

-- Histórico mês a mês, do primeiro mês com dados até o atual.
create or replace function public.admin_monthly()
returns table (
  month date,
  readings bigint, previews bigint, dreams bigint, journeys bigint,
  active_users bigint, new_users bigint,
  saved_readings bigint, saved_dreams bigint, saved_users bigint,
  ai_cost numeric, ai_calls bigint, ai_input bigint, ai_output bigint,
  new_subs bigint, canceled_subs bigint
)
language sql
security definer
set search_path = public
as $$
  with bounds as (
    select least(
             (select min(created_at) from auth.users),
             (select min(created_at) from public.reading_usage),
             (select min(created_at) from public.consultations),
             (select min(created_at) from public.dreams)
           ) as first
  ),
  months as (
    select generate_series(
             date_trunc('month', (select first from bounds) at time zone 'America/Sao_Paulo')::date,
             date_trunc('month', now() at time zone 'America/Sao_Paulo')::date,
             interval '1 month'
           )::date as month
  )
  select m.month,
    (select count(*) from public.reading_usage r where r.kind = 'reading' and r.status = 'completed' and not r.preview
       and date_trunc('month', r.created_at at time zone 'America/Sao_Paulo')::date = m.month),
    (select count(*) from public.reading_usage r where r.preview and r.status = 'completed'
       and date_trunc('month', r.created_at at time zone 'America/Sao_Paulo')::date = m.month),
    (select count(*) from public.reading_usage r where r.kind = 'dream' and r.status = 'completed'
       and date_trunc('month', r.created_at at time zone 'America/Sao_Paulo')::date = m.month),
    (select count(*) from public.reading_usage r where r.kind = 'journey' and r.status = 'completed'
       and date_trunc('month', r.created_at at time zone 'America/Sao_Paulo')::date = m.month),
    (select count(distinct r.user_id) from public.reading_usage r where r.user_id is not null and r.status = 'completed' and not r.preview
       and date_trunc('month', r.created_at at time zone 'America/Sao_Paulo')::date = m.month),
    (select count(*) from auth.users u where date_trunc('month', u.created_at at time zone 'America/Sao_Paulo')::date = m.month),
    (select count(*) from public.consultations c where date_trunc('month', c.created_at at time zone 'America/Sao_Paulo')::date = m.month),
    (select count(*) from public.dreams dd where date_trunc('month', dd.created_at at time zone 'America/Sao_Paulo')::date = m.month),
    (select count(distinct x.user_id) from (
        select user_id, created_at from public.consultations
        union all
        select user_id, created_at from public.dreams
     ) x where date_trunc('month', x.created_at at time zone 'America/Sao_Paulo')::date = m.month),
    (select coalesce(sum(a.estimated_cost_usd), 0) from public.ai_usage a where date_trunc('month', a.created_at at time zone 'America/Sao_Paulo')::date = m.month),
    (select count(*) from public.ai_usage a where date_trunc('month', a.created_at at time zone 'America/Sao_Paulo')::date = m.month),
    (select coalesce(sum(a.input_tokens), 0) from public.ai_usage a where date_trunc('month', a.created_at at time zone 'America/Sao_Paulo')::date = m.month),
    (select coalesce(sum(a.output_tokens), 0) from public.ai_usage a where date_trunc('month', a.created_at at time zone 'America/Sao_Paulo')::date = m.month),
    (select count(*) from public.subscriptions s where s.plan <> 'free' and date_trunc('month', s.created_at at time zone 'America/Sao_Paulo')::date = m.month),
    (select count(*) from public.subscriptions s where s.canceled_at is not null and date_trunc('month', s.canceled_at at time zone 'America/Sao_Paulo')::date = m.month)
  from months m
  order by m.month;
$$;

-- Custo de IA por mês e tipo de operação.
create or replace function public.admin_ai_monthly()
returns table (month date, operation_type text, calls bigint, input_tokens bigint, output_tokens bigint, cost numeric)
language sql
security definer
set search_path = public
as $$
  select date_trunc('month', created_at at time zone 'America/Sao_Paulo')::date,
         operation_type,
         count(*),
         coalesce(sum(input_tokens), 0),
         coalesce(sum(output_tokens), 0),
         coalesce(sum(estimated_cost_usd), 0)
    from public.ai_usage
   group by 1, 2
   order by 1, 2;
$$;

-- Eventos de produto por mês e tipo (pessoas = contas ou visitantes distintos).
create or replace function public.admin_events_monthly()
returns table (month date, event_type text, total bigint, people bigint)
language sql
security definer
set search_path = public
as $$
  select date_trunc('month', created_at at time zone 'America/Sao_Paulo')::date,
         event_type,
         count(*),
         count(distinct coalesce(user_id::text, visitor_id))
    from public.product_events
   group by 1, 2
   order by 1, 2;
$$;

-- Aberturas do cartão de cada oráculo na tela de resultado, por mês.
create or replace function public.admin_oracle_opens()
returns table (month date, oracle text, total bigint, people bigint)
language sql
security definer
set search_path = public
as $$
  select date_trunc('month', created_at at time zone 'America/Sao_Paulo')::date,
         meta->>'oracle',
         count(*),
         count(distinct coalesce(user_id::text, visitor_id))
    from public.product_events
   where event_type = 'oracle_opened' and meta ? 'oracle'
   group by 1, 2
   order by 1, 2;
$$;

-- Funil (pessoas distintas em cada etapa, desde que a medição existe).
create or replace function public.admin_funnel()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'anonymous_first_reading', (select count(distinct visitor_id) from public.reading_usage
                                 where visitor_id is not null and kind = 'reading' and status = 'completed' and not preview),
    'second_attempt',          (select count(distinct coalesce(user_id::text, visitor_id)) from public.product_events
                                 where event_type in ('preview_created', 'preview_reopened')),
    'login_after_reading',     (select count(distinct user_id) from public.product_events where event_type = 'login_after_preview'),
    'plans_viewed',            (select count(distinct coalesce(user_id::text, visitor_id)) from public.product_events where event_type = 'plans_viewed'),
    'checkout_started',        (select count(distinct user_id) from public.product_events where event_type = 'checkout_started'),
    'subscribed',              (select count(distinct user_id) from public.subscriptions where plan <> 'free'),
    'since',                   (select min(created_at) from public.product_events)
  );
$$;

-- Tabela de usuários (sem conteúdo): plano, acesso, consumo no mês civil,
-- última atividade. Busca por e-mail, paginação por limit/offset.
create or replace function public.admin_users(p_search text default null, p_limit integer default 50, p_offset integer default 0)
returns table (
  user_id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz,
  role text,
  plan text, sub_status text, provider text, cancel_at_period_end boolean, current_period_end timestamptz,
  override_plan text, override_reason text, override_expires_at timestamptz,
  readings_month bigint, dreams_month bigint, journeys_month bigint, readings_total bigint,
  last_activity timestamptz
)
language sql
security definer
set search_path = public
as $$
  with d as (select public.admin_period_start('month') as month)
  select u.id, u.email::text, u.created_at, u.last_sign_in_at,
         coalesce(ur.role, 'user'),
         s.plan::text, s.status::text, s.billing_provider::text, s.cancel_at_period_end, s.current_period_end,
         o.plan_override::text, o.reason, o.expires_at,
         (select count(*) from public.reading_usage r, d where r.user_id = u.id and r.kind = 'reading' and r.status = 'completed' and not r.preview and r.created_at >= d.month),
         (select count(*) from public.reading_usage r, d where r.user_id = u.id and r.kind = 'dream' and r.status = 'completed' and r.created_at >= d.month),
         (select count(*) from public.reading_usage r, d where r.user_id = u.id and r.kind = 'journey' and r.status = 'completed' and r.created_at >= d.month),
         (select count(*) from public.reading_usage r where r.user_id = u.id and r.kind = 'reading' and r.status = 'completed' and not r.preview),
         greatest(
           (select max(r.created_at) from public.reading_usage r where r.user_id = u.id),
           u.last_sign_in_at
         )
    from auth.users u
    left join public.user_roles ur on ur.user_id = u.id
    left join public.subscriptions s on s.user_id = u.id
    left join lateral (
      select * from public.access_overrides ao
       where ao.revoked_at is null and (ao.expires_at is null or ao.expires_at > now())
         and (ao.user_id = u.id or (ao.user_id is null and ao.email = lower(u.email)))
       order by ao.created_at desc limit 1
    ) o on true
   where p_search is null or p_search = '' or u.email ilike '%' || p_search || '%'
   order by u.created_at desc
   limit greatest(1, least(p_limit, 200)) offset greatest(0, p_offset);
$$;

create or replace function public.admin_users_count(p_search text default null)
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*) from auth.users u
   where p_search is null or p_search = '' or u.email ilike '%' || p_search || '%';
$$;

-- Privilégios: nenhuma dessas funções é chamável pelo navegador.
revoke all on function public.admin_period_start(text) from public, anon, authenticated;
revoke all on function public.get_user_access(uuid) from public, anon, authenticated;
revoke all on function public.admin_overview() from public, anon, authenticated;
revoke all on function public.admin_monthly() from public, anon, authenticated;
revoke all on function public.admin_ai_monthly() from public, anon, authenticated;
revoke all on function public.admin_events_monthly() from public, anon, authenticated;
revoke all on function public.admin_oracle_opens() from public, anon, authenticated;
revoke all on function public.admin_funnel() from public, anon, authenticated;
revoke all on function public.admin_users(text, integer, integer) from public, anon, authenticated;
revoke all on function public.admin_users_count(text) from public, anon, authenticated;

grant execute on function public.admin_period_start(text) to service_role;
grant execute on function public.get_user_access(uuid) to service_role;
grant execute on function public.admin_overview() to service_role;
grant execute on function public.admin_monthly() to service_role;
grant execute on function public.admin_ai_monthly() to service_role;
grant execute on function public.admin_events_monthly() to service_role;
grant execute on function public.admin_oracle_opens() to service_role;
grant execute on function public.admin_funnel() to service_role;
grant execute on function public.admin_users(text, integer, integer) to service_role;
grant execute on function public.admin_users_count(text) to service_role;
