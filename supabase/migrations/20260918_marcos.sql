-- ============================================================================
-- Multioráculo — marcos pessoais (contagens que a própria pessoa define)
-- Migration para REVISÃO MANUAL. Não executar sem aprovação.
-- Só CRIA uma tabela nova. Não apaga nem altera nenhum dado existente.
-- Pode rodar mais de uma vez.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- milestones — "42 dias sem fumar", "18 dias meditando".
--
--    Não é streak de uso do aplicativo e não mede engajamento: é o tempo da
--    pessoa, contado a partir de uma data que ela escolhe. Por isso a tabela
--    guarda só o começo, e nunca um placar: o número de dias é calculado na
--    leitura. Reiniciar é mudar a data, não perder pontos.
--
--    Diferente das tabelas do horóscopo e da tiragem do dia, esta é dado
--    pessoal, e segue o padrão das outras tabelas do usuário: RLS ligado e
--    toda política restrita a auth.uid().
-- ----------------------------------------------------------------------------
create table if not exists public.milestones (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null check (char_length(trim(name)) between 1 and 80),
  started_on date not null,
  note       text check (note is null or char_length(note) <= 280),
  archived   boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists milestones_user_idx on public.milestones (user_id, archived, started_on desc);

alter table public.milestones enable row level security;

do $$ begin
  create policy "milestones_select_own" on public.milestones
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "milestones_insert_own" on public.milestones
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "milestones_update_own" on public.milestones
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "milestones_delete_own" on public.milestones
    for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

revoke all on table public.milestones from anon;
grant select, insert, update, delete on table public.milestones to authenticated;
