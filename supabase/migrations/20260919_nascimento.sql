-- ============================================================================
-- Multioráculo — dados de nascimento (a base do mapa natal)
-- Migration para REVISÃO MANUAL. Não executar sem aprovação.
-- Só CRIA uma tabela nova. Não apaga nem altera nenhum dado existente.
-- Pode rodar mais de uma vez.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- birth_data — data, hora e lugar do nascimento, uma linha por pessoa.
--
--    É o dado mais pessoal que o produto guarda, e o único que não pode ser
--    recalculado a partir de mais nada. Por isso a chave primária é o próprio
--    user_id (ninguém tem dois nascimentos), o delete da conta leva a linha
--    junto, e a RLS é a mesma do Diário e dos marcos: só a própria pessoa lê
--    e escreve.
--
--    Não se guarda mapa nem interpretação aqui. O mapa é determinístico: os
--    mesmos cinco campos abaixo produzem sempre o mesmo céu, então guardar o
--    resultado seria guardar duas verdades sobre a mesma coisa.
--
--    born_at NULO significa hora desconhecida, e não meia-noite. É uma
--    diferença que o produto inteiro respeita: sem hora não existem
--    Ascendente, Meio-do-Céu nem casas, e a posição de cada corpo vira um
--    intervalo, não um ponto.
--
--    tz, lat e lon ficam gravados junto com o rótulo do lugar para o registro
--    não depender da base de cidades: se a base mudar de versão amanhã, o
--    mapa de quem já cadastrou continua sendo exatamente o mesmo.
-- ----------------------------------------------------------------------------
create table if not exists public.birth_data (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  born_on     date not null check (born_on > date '1900-01-01'),
  -- nulo = hora desconhecida
  born_at     time,
  -- zona IANA resolvida pelas coordenadas no momento do cadastro
  tz          text not null check (char_length(tz) between 3 and 64),
  -- "ok", "ambiguous" (hora que acontece duas vezes) ou "nonexistent" (hora
  -- que não existe, no salto do horário de verão)
  tz_status   text not null default 'ok' check (tz_status in ('ok', 'ambiguous', 'nonexistent')),
  lat         double precision not null check (lat between -90 and 90),
  lon         double precision not null check (lon between -180 and 180),
  place_label text not null check (char_length(trim(place_label)) between 1 and 120),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.birth_data enable row level security;

do $$ begin
  create policy "birth_data_select_own" on public.birth_data
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "birth_data_insert_own" on public.birth_data
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "birth_data_update_own" on public.birth_data
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "birth_data_delete_own" on public.birth_data
    for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

revoke all on table public.birth_data from anon;
grant select, insert, update, delete on table public.birth_data to authenticated;
