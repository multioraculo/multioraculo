-- Verificação de RLS das tabelas existentes (SÓ LEITURA: não altera nada).
-- Como usar: Supabase → SQL Editor → New query → cole tudo → Run.
-- Leia a coluna "veredito": tudo deve estar "OK".
with tabelas as (
  select unnest(array['profiles','consultations','journal_entries','dreams','dream_entries','journey_analyses']) as tabela
),
rls as (
  select c.relname as tabela, c.relrowsecurity as rls_ativo
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public'
),
politicas as (
  select tablename as tabela,
         count(*) as total,
         -- política considerada "própria" quando restringe pelo usuário logado
         count(*) filter (
           where coalesce(qual, '') ilike '%auth.uid()%'
              or coalesce(with_check, '') ilike '%auth.uid()%'
         ) as proprias,
         count(*) filter (where 'anon' = any(roles) or roles = '{public}') as abertas_para_anon
    from pg_policies
   where schemaname = 'public'
   group by tablename
)
select t.tabela,
       coalesce(r.rls_ativo, false)          as rls_ativo,
       coalesce(p.total, 0)                  as politicas,
       coalesce(p.proprias, 0)               as politicas_por_usuario,
       coalesce(p.abertas_para_anon, 0)      as politicas_para_visitante,
       case
         when not coalesce(r.rls_ativo, false) then 'REVISAR: RLS desligado'
         when coalesce(p.total, 0) = 0        then 'REVISAR: sem políticas (ninguém acessa pelo app)'
         when coalesce(p.proprias, 0) < coalesce(p.total, 0)
                                              then 'REVISAR: há política que não restringe por usuário'
         else 'OK'
       end as veredito
  from tabelas t
  left join rls r on r.tabela = t.tabela
  left join politicas p on p.tabela = t.tabela
 order by t.tabela;

-- Detalhe (opcional): lista cada política com o filtro usado.
-- select tablename, policyname, cmd, roles, qual, with_check
--   from pg_policies where schemaname = 'public' order by tablename, policyname;
