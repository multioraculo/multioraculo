-- ============================================================================
-- Multioráculo — assinaturas e controle de tiragens
-- Migration para REVISÃO MANUAL. Nada aqui é destrutivo: só cria objetos novos.
-- Não toca nas tabelas existentes (profiles, consultations, journal_entries,
-- dreams, dream_entries, journey_analyses) nem em suas políticas.
-- Pode ser executada mais de uma vez sem efeito colateral.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Tipos (listas fechadas de valores)
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.billing_provider as enum ('stripe', 'google_play', 'apple');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_plan as enum ('free', 'essential', 'unlimited');
exception when duplicate_object then null; end $$;

-- Espelha os status da Stripe; Google Play / App Store serão mapeados para
-- estes mesmos valores pela camada de entitlement.
do $$ begin
  create type public.subscription_status as enum (
    'trialing', 'active', 'past_due', 'canceled', 'unpaid',
    'incomplete', 'incomplete_expired', 'paused'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.reading_status as enum ('started', 'completed', 'failed');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- 2) Trigger de updated_at, com nome específico desta migration para não
--    colidir com nenhuma função existente.
-- ----------------------------------------------------------------------------
create or replace function public.billing_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ----------------------------------------------------------------------------
-- 3) billing_customers — vínculo usuário ↔ cliente no provedor de pagamento.
--    Um usuário pode ter um cliente por provedor (Stripe hoje; lojas depois).
-- ----------------------------------------------------------------------------
create table if not exists public.billing_customers (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users (id) on delete cascade,
  provider             public.billing_provider not null,
  provider_customer_id text not null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (user_id, provider),
  unique (provider, provider_customer_id)
);

drop trigger if exists billing_customers_set_updated_at on public.billing_customers;
create trigger billing_customers_set_updated_at
  before update on public.billing_customers
  for each row execute function public.billing_set_updated_at();

alter table public.billing_customers enable row level security;

-- Usuário só lê o próprio vínculo. Nenhuma escrita pelo cliente: só service_role.
drop policy if exists "billing_customers: own read" on public.billing_customers;
create policy "billing_customers: own read"
  on public.billing_customers for select
  to authenticated
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4) subscriptions — UMA linha por usuário COM assinatura em algum provedor.
--    AUSÊNCIA de linha = plano Free (intencional: Free não é uma assinatura,
--    é a falta dela). O valor 'free' no enum existe só como mapeamento
--    defensivo (ex.: price desconhecido) e nunca concede acesso pago.
--    É a fonte central do entitlement, independente de onde foi comprada.
-- ----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null unique references auth.users (id) on delete cascade,
  plan                     public.subscription_plan not null default 'free',
  status                   public.subscription_status not null,
  billing_provider         public.billing_provider not null,
  provider_customer_id     text,
  provider_subscription_id text not null,
  provider_price_id        text,
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean not null default false,
  canceled_at              timestamptz,
  metadata                 jsonb not null default '{}'::jsonb,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  unique (billing_provider, provider_subscription_id)
);

create index if not exists subscriptions_provider_customer_idx
  on public.subscriptions (billing_provider, provider_customer_id);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.billing_set_updated_at();

alter table public.subscriptions enable row level security;

-- Usuário só lê a própria assinatura. Nenhuma política de insert/update/delete
-- para anon/authenticated: o frontend NUNCA consegue atribuir um plano a si
-- mesmo. Só o webhook (service_role) escreve aqui.
drop policy if exists "subscriptions: own read" on public.subscriptions;
create policy "subscriptions: own read"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 5) reading_usage — uma linha por tiragem completa (a unidade de consumo).
--    Criada em POST /consultas com status 'started', promovida a 'completed'
--    quando os cinco oráculos terminam, ou 'failed' se der erro (não conta).
--    A síntese (/consultas/sintese) só é liberada para um seed 'completed'
--    do mesmo usuário e uma única vez (synthesized_at).
--
--    Falha técnica nunca consome cota: só 'completed' conta de verdade.
--    'started' conta apenas nos primeiros minutos (janela em que a tiragem
--    pode estar em andamento), para bloquear cliques simultâneos. Linhas
--    'started' mais antigas que a janela são abandonadas (queda, timeout) e
--    são marcadas 'failed' automaticamente pela função consume_reading.
-- ----------------------------------------------------------------------------
create table if not exists public.reading_usage (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users (id) on delete set null,  -- null = visitante (só quando o plano Free não tem limite)
  seed           text not null unique,
  status         public.reading_status not null default 'started',
  locale         text,
  created_at     timestamptz not null default now(),
  completed_at   timestamptz,
  synthesized_at timestamptz
);

create index if not exists reading_usage_user_period_idx
  on public.reading_usage (user_id, created_at desc);

alter table public.reading_usage enable row level security;

-- Usuário pode ver o próprio consumo; nunca escrever (evita "zerar" a cota).
drop policy if exists "reading_usage: own read" on public.reading_usage;
create policy "reading_usage: own read"
  on public.reading_usage for select
  to authenticated
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6) webhook_events — idempotência dos eventos dos provedores de pagamento.
-- ----------------------------------------------------------------------------
create table if not exists public.webhook_events (
  id           uuid primary key default gen_random_uuid(),
  provider     public.billing_provider not null,
  event_id     text not null,
  event_type   text not null,
  received_at  timestamptz not null default now(),
  processed_at timestamptz,
  error        text,
  unique (provider, event_id)
);

alter table public.webhook_events enable row level security;
-- Sem políticas: apenas service_role acessa.

-- ----------------------------------------------------------------------------
-- 7) consume_reading — verificação de cota + registro, ATÔMICOS.
--    Trava por usuário (advisory lock) para que duas consultas simultâneas não
--    passem as duas pela checagem. Executável só pelo service_role.
--    p_limit null = ilimitado.
-- ----------------------------------------------------------------------------
create or replace function public.consume_reading(
  p_user_id      uuid,
  p_seed         text,
  p_limit        integer,
  p_period_start timestamptz,
  p_period_end   timestamptz,
  p_locale       text default null
)
returns table (allowed boolean, used integer, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used integer;
  -- tempo máximo em que uma tiragem 'started' ainda pode estar em andamento
  -- (a função de consulta tem teto de 60 s no Netlify)
  v_window constant interval := interval '10 minutes';
begin
  -- serializa por usuário dentro da transação
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  -- tiragens abandonadas (queda ou timeout antes de concluir) não contam
  update public.reading_usage
     set status = 'failed'
   where user_id = p_user_id
     and status = 'started'
     and created_at < now() - v_window;

  select count(*)::integer into v_used
    from public.reading_usage
   where user_id = p_user_id
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

  insert into public.reading_usage (user_id, seed, status, locale)
  values (p_user_id, p_seed, 'started', p_locale);

  return query select
    true,
    v_used + 1,
    case when p_limit is null then null else greatest(p_limit - v_used - 1, 0) end;
end $$;

revoke all on function public.consume_reading(uuid, text, integer, timestamptz, timestamptz, text) from public, anon, authenticated;
grant execute on function public.consume_reading(uuid, text, integer, timestamptz, timestamptz, text) to service_role;

-- ----------------------------------------------------------------------------
-- 8) Privilégios explícitos nas quatro tabelas novas.
--    Cliente do site (anon e authenticated): nada, exceto SELECT onde o
--    usuário precisa ler o próprio estado (e ainda assim filtrado pelo RLS).
--    Servidor (service_role): tudo. O webhook e a contagem usam esse papel,
--    via SUPABASE_SERVICE_ROLE_KEY (variável só de servidor, sem NEXT_PUBLIC_).
-- ----------------------------------------------------------------------------
revoke all on table public.billing_customers from anon, authenticated;
revoke all on table public.subscriptions     from anon, authenticated;
revoke all on table public.reading_usage     from anon, authenticated;
revoke all on table public.webhook_events    from anon, authenticated;

grant select on table public.subscriptions     to authenticated;
grant select on table public.reading_usage     to authenticated;
grant select on table public.billing_customers to authenticated;

grant all on table public.billing_customers to service_role;
grant all on table public.subscriptions     to service_role;
grant all on table public.reading_usage     to service_role;
grant all on table public.webhook_events    to service_role;
