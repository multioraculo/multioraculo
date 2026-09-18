-- ============================================================================
-- Multioráculo — leitura coletiva do céu (a tradução simbólica do dia)
-- Migration para REVISÃO MANUAL. Não executar sem aprovação.
-- Só CRIA uma tabela nova. Não apaga nem altera nenhum dado existente.
-- Pode rodar mais de uma vez.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- sky_daily — o que o céu de hoje coloca em evidência, para todo mundo.
--
--    Os fatos do dia (posições, aspectos, orbes, fases) não entram aqui: eles
--    são recalculáveis a partir da data, e guardá-los seria manter duas
--    verdades sobre a mesma coisa. O que se guarda é o TEXTO, porque ele custa
--    uma chamada paga ao modelo.
--
--    E como o céu é o mesmo para todas as pessoas, são três gerações por dia
--    no total, uma por idioma, e não uma por visitante. Por isso a chave é
--    (dia, locale) e não tem user_id: esta camada é coletiva por definição.
--
--    `termos` guarda o rastreamento: cada termo da síntese com a origem que o
--    sustenta ("comparação" veio de Libra, "revisão profunda" veio da
--    retrogradação de Plutão). Nada disso aparece na tela; existe para
--    auditar depois por que o texto daquele dia foi aquele.
--
--    Mesmo padrão de horoscope_daily e daily_draw: conteúdo coletivo, escrito
--    e lido só pelo servidor, sem acesso pelo cliente.
-- ----------------------------------------------------------------------------
create table if not exists public.sky_daily (
  dia        date not null,
  locale     text not null check (locale in ('pt', 'en', 'es')),
  sintese    text not null,
  termos     jsonb not null default '[]'::jsonb,
  model      text not null,
  tentativas smallint not null default 1,
  created_at timestamptz not null default now(),
  primary key (dia, locale)
);

alter table public.sky_daily enable row level security;

-- Ninguém acessa pelo cliente: quem lê e escreve é a rota, com a service role.
revoke all on table public.sky_daily from anon, authenticated;
grant select, insert, update on table public.sky_daily to service_role;

-- ----------------------------------------------------------------------------
-- ai_usage: a nova operação entra na lista permitida.
-- ----------------------------------------------------------------------------
do $$
begin
  alter table public.ai_usage drop constraint if exists ai_usage_operation_type_check;
  alter table public.ai_usage add constraint ai_usage_operation_type_check
    check (operation_type in ('safety', 'oracle', 'synthesis', 'dream', 'journey', 'transcribe', 'horoscope', 'daily_draw', 'sky_daily'));
exception when undefined_table then null;
end $$;
