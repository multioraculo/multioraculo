-- ============================================================================
-- Multioráculo — síntese pessoal das interconexões do dia
-- Migration para REVISÃO MANUAL. Não executar sem aprovação.
-- Só CRIA uma tabela nova. Não apaga nem altera nenhum dado existente.
-- Pode rodar mais de uma vez.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- interconexoes_daily — a leitura que cruza o mapa de uma pessoa com o céu de
--    hoje. Diferente de horoscope_daily e sky_daily, que são coletivas, esta é
--    de uma pessoa só, e por isso o user_id entra na chave.
--
--    UMA LINHA POR PESSOA, DIA E IDIOMA. A chave não inclui o mapa: se a pessoa
--    corrigir a data de nascimento no meio do dia, a síntese antiga não deve
--    conviver com a nova. O upsert substitui, e não acumula versões do mesmo
--    dia.
--
--    O QUE O mapa_hash RESOLVE. Ele é a impressão digital do que determina o
--    mapa: nascimento, hora, fuso e coordenadas. Ao reler, quem chama compara
--    o hash gravado com o do mapa atual; se diferirem, a linha é tratada como
--    ausente e a síntese é gerada de novo. Sem isso, um mapa corrigido
--    continuaria servindo a leitura do mapa errado, que é o pior tipo de erro
--    aqui: plausível, pessoal e falso.
--
--    É a mesma disciplina de lerLinhaGravada no horóscopo: linha que não
--    corresponde ao que se pede é ignorada, nunca remendada.
--
--    `fatos` guarda as interconexões que sustentaram o texto, e `diagnostico`
--    guarda como ele foi obtido (gerado, reparado ou molde), com tentativas e
--    violações. Nada disso chega ao leitor; existe para medirmos com que
--    frequência cada caminho acontece.
--
--    Conteúdo pessoal e pago: escrito e lido só pelo servidor, com a service
--    role. O cliente não alcança esta tabela em hipótese nenhuma.
-- ----------------------------------------------------------------------------
create table if not exists public.interconexoes_daily (
  user_id     uuid not null references auth.users (id) on delete cascade,
  dia         date not null,
  locale      text not null check (locale in ('pt', 'en', 'es')),
  -- impressão digital do mapa que gerou este texto
  mapa_hash   text not null check (char_length(mapa_hash) between 8 and 128),
  sintese     text not null check (char_length(sintese) between 1 and 4000),
  fatos       jsonb not null default '[]'::jsonb,
  diagnostico jsonb not null default '{}'::jsonb,
  model       text not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, dia, locale)
);

create index if not exists interconexoes_daily_dia_idx on public.interconexoes_daily (dia desc);

alter table public.interconexoes_daily enable row level security;

-- Ninguém acessa pelo cliente: quem lê e escreve é a rota, com a service role.
revoke all on table public.interconexoes_daily from anon, authenticated;
grant select, insert, update, delete on table public.interconexoes_daily to service_role;

-- ----------------------------------------------------------------------------
-- ai_usage: a nova operação entra na lista permitida.
-- ----------------------------------------------------------------------------
do $$
begin
  alter table public.ai_usage drop constraint if exists ai_usage_operation_type_check;
  alter table public.ai_usage add constraint ai_usage_operation_type_check
    check (operation_type in ('safety', 'oracle', 'synthesis', 'dream', 'journey', 'transcribe', 'horoscope', 'daily_draw', 'sky_daily', 'interconexoes'));
exception when undefined_table then null;
end $$;
