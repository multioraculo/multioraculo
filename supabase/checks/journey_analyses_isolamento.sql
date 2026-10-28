-- Isolamento por usuário de public.journey_analyses (Jornada dos Sonhos).
--
-- A tabela não tem migration neste repositório. A Parte B foi executada em
-- produção em 28/10/2026 (Supabase → SQL Editor): todas as linhas OK.
--
-- Parte A: só leitura do catálogo. Parte B: teste de comportamento que NÃO
-- deixa nada gravado (termina sempre com uma exceção proposital que desfaz
-- tudo; o resultado vem na mensagem).
--
-- O que o app faz (para comparar com o resultado):
--   * lê com  .eq("user_id", <usuário da sessão>)  usando a sessão do usuário;
--   * grava com a sessão do usuário (precisa existir política de INSERT com
--     check user_id = auth.uid(); sem ela a Jornada gera, cobra e NÃO salva);
--   * nunca atualiza nem apaga linhas desta tabela.

-- ── A1. RLS ligada? (deve ser true) ────────────────────────────────────────────
select c.relname as tabela, c.relrowsecurity as rls_ativo, c.relforcerowsecurity as rls_forcado
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public' and c.relname = 'journey_analyses';

-- ── A2. Políticas, uma linha por política ──────────────────────────────────────
select policyname, cmd, roles, permissive, qual as using_expr, with_check
  from pg_policies
 where schemaname = 'public' and tablename = 'journey_analyses'
 order by cmd, policyname;

-- ── A3. Veredito por operação (esperado: OK em select e insert; ausência de
--        update/delete é aceitável porque o app não usa) ────────────────────────
with p as (
  select cmd, qual, with_check, roles
    from pg_policies
   where schemaname = 'public' and tablename = 'journey_analyses'
),
op as (select unnest(array['SELECT','INSERT','UPDATE','DELETE']) as cmd)
select op.cmd,
       count(p.cmd) filter (where p.cmd = op.cmd or p.cmd = 'ALL') as politicas,
       case
         when op.cmd in ('SELECT','DELETE') then
           bool_or((p.cmd in (op.cmd,'ALL')) and coalesce(p.qual,'') ~* 'auth\.uid\(\)\s*=\s*user_id|user_id\s*=\s*auth\.uid\(\)|user_id\s*=\s*\(\s*select auth\.uid\(\)')
         when op.cmd = 'INSERT' then
           bool_or((p.cmd in ('INSERT','ALL')) and coalesce(p.with_check,'') ~* 'auth\.uid\(\)\s*=\s*user_id|user_id\s*=\s*auth\.uid\(\)|user_id\s*=\s*\(\s*select auth\.uid\(\)')
         else
           bool_or((p.cmd in ('UPDATE','ALL')) and coalesce(p.qual,'') ~* 'auth\.uid\(\)' and coalesce(p.with_check, p.qual, '') ~* 'auth\.uid\(\)')
       end as restringe_por_usuario,
       bool_or(coalesce(p.qual,'') in ('true','(true)') or coalesce(p.with_check,'') in ('true','(true)')) as ha_politica_aberta
  from op left join p on true
 group by op.cmd
 order by op.cmd;

-- ── A4. Permissões diretas (anon NÃO deve ter nada; authenticated só o que o app usa) ──
select grantee, privilege_type
  from information_schema.role_table_grants
 where table_schema = 'public' and table_name = 'journey_analyses'
   and grantee in ('anon', 'authenticated', 'public')
 order by grantee, privilege_type;

-- ── A5. Colunas e índices (user_id deve existir e ser obrigatório) ─────────────
select column_name, data_type, is_nullable, column_default
  from information_schema.columns
 where table_schema = 'public' and table_name = 'journey_analyses'
 order by ordinal_position;
select indexdef from pg_indexes where schemaname = 'public' and tablename = 'journey_analyses';

-- ── B. Teste de comportamento com dois usuários reais ──────────────────────────
-- 1) Usa os dois usuários mais antigos de auth.users (precisa de pelo menos
--    dois; nada fica gravado nem é lido por fora). Ids inventados não servem:
--    a chave estrangeira barra o insert antes da RLS e o teste não prova nada.
-- 2) Rode o bloco. O resultado aparece como ERRO "RESULTADO ..." (é proposital:
--    a exceção desfaz as linhas de teste). Esperado: todas as linhas com OK.
do $$
declare
  v_a uuid := (select id from auth.users order by created_at limit 1);
  v_b uuid := (select id from auth.users order by created_at offset 1 limit 1);
  v_linha uuid;
  v_n int;
  r text := '';
begin
  -- como A: grava a própria linha
  perform set_config('request.jwt.claims', json_build_object('sub', v_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  begin
    insert into public.journey_analyses (user_id, analysis_text, dreams_count)
    values (v_a, '{"teste":"A"}', 2) returning id into v_linha;
    r := r || E'\nOK   A grava a própria linha';
  exception when others then
    r := r || E'\nFALHA A não consegue gravar a própria linha (a Jornada gera, cobra e não salva): ' || sqlerrm;
  end;

  -- como A: tenta gravar uma linha em nome de B (deve ser barrado)
  begin
    insert into public.journey_analyses (user_id, analysis_text, dreams_count) values (v_b, '{"teste":"forjada"}', 2);
    r := r || E'\nFALHA A conseguiu gravar em nome de B';
  exception when others then
    r := r || E'\nOK   A não grava em nome de B';
  end;

  -- como A: enxerga a própria linha (se a gravação acima falhou, os OK de B abaixo NÃO provam nada)
  select count(*) into v_n from public.journey_analyses where id = v_linha;
  r := r || E'\n' || case when v_n = 1 then 'OK  ' else 'FALHA' end || '   A enxerga a própria linha (' || v_n || ')';

  -- como B: não enxerga a linha de A, nem por filtro explícito
  perform set_config('request.jwt.claims', json_build_object('sub', v_b, 'role', 'authenticated')::text, true);
  select count(*) into v_n from public.journey_analyses where user_id = v_a;
  r := r || E'\n' || case when v_n = 0 then 'OK  ' else 'FALHA' end || '   B lê linhas de A: ' || v_n;
  select count(*) into v_n from public.journey_analyses where id = v_linha;
  r := r || E'\n' || case when v_n = 0 then 'OK  ' else 'FALHA' end || '   B lê a linha de A pelo id: ' || v_n;

  -- como B: não altera nem apaga a linha de A
  update public.journey_analyses set analysis_text = '{"teste":"adulterada"}' where id = v_linha;
  get diagnostics v_n = row_count;
  r := r || E'\n' || case when v_n = 0 then 'OK  ' else 'FALHA' end || '   B altera linha de A: ' || v_n;
  delete from public.journey_analyses where id = v_linha;
  get diagnostics v_n = row_count;
  r := r || E'\n' || case when v_n = 0 then 'OK  ' else 'FALHA' end || '   B apaga linha de A: ' || v_n;

  -- visitante sem login: nada (0 linhas ou permission denied)
  reset role;
  perform set_config('request.jwt.claims', '', true);
  set local role anon;
  begin
    select count(*) into v_n from public.journey_analyses;
    r := r || E'\n' || case when v_n = 0 then 'OK  ' else 'FALHA' end || '   anon lê a tabela: ' || v_n || ' linhas';
  exception when insufficient_privilege then
    r := r || E'\nOK     anon sem permissão (permission denied)';
  end;
  reset role;

  raise exception E'RESULTADO (nada foi gravado):%', r;
end $$;
