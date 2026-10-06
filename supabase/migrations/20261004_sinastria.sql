-- ============================================================================
-- Multioráculo — sinastria: pessoas guardadas
-- Migration para REVISÃO MANUAL. Não executar sem aprovação.
-- Só CRIA tabelas novas. Não apaga nem altera nenhum dado existente.
-- Pode rodar mais de uma vez.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- saved_people — uma pessoa que o usuário ESCOLHEU guardar para comparar de
--    novo. A comparação em si não grava ninguém: esta tabela só recebe linhas
--    quando o usuário aperta "Salvar esta pessoa".
--
--    O mínimo que o cálculo precisa, e nada além: um apelido (nunca nome
--    completo, nunca e-mail), o nascimento e o lugar. Não há telefone, foto,
--    e-mail nem conta da outra pessoa, que não precisa ter nenhuma.
--
--    O VÍNCULO NÃO MORA AQUI. Romântico, amizade, família, trabalho: é uma
--    propriedade da leitura, e a mesma pessoa pode ser lida de dois jeitos.
--
--    born_at NULO significa hora desconhecida, e não meia-noite, como em
--    birth_data. tz, lat e lon ficam gravados junto, para a leitura não
--    depender da base de cidades.
--
--    Dado de terceiros, então a RLS é só do dono, e apagar a conta leva tudo.
--    O dono pode apagar uma pessoa a qualquer momento, mesmo sem plano pago.
-- ----------------------------------------------------------------------------
create table if not exists public.saved_people (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  nickname    text not null check (char_length(trim(nickname)) between 1 and 40 and position('@' in nickname) = 0),
  born_on     date not null check (born_on > date '1900-01-01'),
  born_at     time,
  tz          text not null check (char_length(tz) between 3 and 64),
  tz_status   text not null default 'ok' check (tz_status in ('ok', 'ambiguous', 'nonexistent')),
  lat         double precision not null check (lat between -90 and 90),
  lon         double precision not null check (lon between -180 and 180),
  place_label text not null check (char_length(trim(place_label)) between 1 and 120),
  created_at  timestamptz not null default now()
);

create index if not exists saved_people_owner_idx on public.saved_people (owner_id, created_at desc);

alter table public.saved_people enable row level security;

do $$ begin
  create policy "saved_people_select_own" on public.saved_people
    for select using (auth.uid() = owner_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "saved_people_insert_own" on public.saved_people
    for insert with check (auth.uid() = owner_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "saved_people_delete_own" on public.saved_people
    for delete using (auth.uid() = owner_id);
exception when duplicate_object then null; end $$;

-- sem UPDATE: corrigir um nascimento é apagar e salvar de novo. Assim nada que
-- um dia seja derivado desta linha (uma leitura, um cache) pode apontar para
-- dados que mudaram debaixo dele
revoke all on table public.saved_people from anon;
grant select, insert, delete on table public.saved_people to authenticated;
