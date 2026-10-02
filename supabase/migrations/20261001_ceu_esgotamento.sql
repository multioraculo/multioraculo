-- ----------------------------------------------------------------------------
-- sky_generation_exhausted — o ciclo de qualidade daquele dia e idioma já foi
-- consumido, e não se tenta de novo hoje.
--
--    POR QUE UMA TABELA NOVA, e não uma coluna em sky_daily.
--
--    `sky_daily` declara `sintese text not null` e `model text not null`, e a
--    chave é (dia, locale). Representar esgotamento ali exigiria relaxar as
--    duas restrições, e aí "existe linha" deixaria de significar "existe
--    síntese válida" em todo lugar que lê a tabela. Pior: a gravação usa
--    `on conflict do nothing`, então uma linha de esgotamento ocuparia o slot
--    do dia e BLOQUEARIA a gravação de uma síntese boa mais tarde. O
--    invariante de sky_daily fica de pé, e o estado de falha mora à parte.
--
--    O QUE ESTE ESTADO SIGNIFICA, com precisão: quatro respostas foram
--    geradas e reprovadas pelo verificador. Não é "deu erro". Falha de rede ou
--    da OpenAI levanta exceção antes de chegar aqui e NÃO escreve nada, porque
--    nessa hora o ciclo de qualidade não foi consumido e tentar de novo é
--    legítimo. Só o esgotamento real entra.
--
--    O PROBLEMA QUE ISTO RESOLVE é de dinheiro. Sem a tabela: não há linha ->
--    até 4 chamadas pagas -> todas reprovam -> nada é gravado -> o próximo
--    visitante repete as 4. Em 2026-10-01 isso aconteceu de verdade, três
--    vezes, e cada visitante em inglês que caísse no fallback repetiria.
--
--    A CHAVE É (dia, locale), igual a sky_daily: o céu é coletivo, não tem
--    user_id, e a virada do dia dá a nova chance sem nenhum trabalho de
--    limpeza. No dia seguinte a chave é outra e a geração volta a ser
--    permitida.
--
--    `regras` guarda as violações que consumiram o ciclo, cortadas, para
--    auditar depois por que aquele dia e idioma não produziram texto. Mesma
--    classe de dado que `sky_daily.termos`: estrutura de verificação, não
--    conteúdo de pessoa. Esta camada não tem pessoa.
--
--    Mesmo padrão de sky_daily: escrita e leitura só pelo servidor, com a
--    service role, sem acesso nenhum pelo cliente.
-- ----------------------------------------------------------------------------
create table if not exists public.sky_generation_exhausted (
  dia        date not null,
  locale     text not null check (locale in ('pt', 'en', 'es')),
  tentativas smallint not null check (tentativas > 0),
  regras     jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  primary key (dia, locale)
);

alter table public.sky_generation_exhausted enable row level security;

-- Ninguém acessa pelo cliente: quem lê e escreve é a rota, com a service role.
revoke all on table public.sky_generation_exhausted from anon, authenticated;
-- Sem update e sem delete de propósito: o estado vale por um dia e vence
-- sozinho na virada. Limpar antes disso é ato manual, no editor de SQL, e deve
-- continuar sendo uma decisão consciente.
grant select, insert on table public.sky_generation_exhausted to service_role;
