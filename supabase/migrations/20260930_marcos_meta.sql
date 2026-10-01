-- ----------------------------------------------------------------------------
-- Multioráculo — meta opcional nos marcos.
--
-- O marco sempre contou dias desde uma data, e isso continua: "42 dias sem
-- fumar" não tem fim, e não deveria ter. O que faltava era o outro tipo de
-- contagem, a que existe justamente por ter um horizonte — "21 dias meditando"
-- é uma experiência com data para terminar, e ver 12 de 21 é diferente de ver
-- 12 soltos.
--
-- Por isso a coluna é NULA por padrão, e não zero: nulo significa "esta
-- contagem não tem fim", que é o comportamento de todos os marcos que já
-- existem. Nenhuma linha antiga muda de sentido.
--
-- O teto de 3650 é dez anos. Não é regra de produto, é sanidade: meta maior
-- que isso é erro de digitação, e uma barra de progresso de trinta mil dias
-- não informa ninguém.
-- ----------------------------------------------------------------------------
alter table public.milestones
  add column if not exists target integer;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'milestones_target_range'
  ) then
    alter table public.milestones
      add constraint milestones_target_range
      check (target is null or (target >= 1 and target <= 3650));
  end if;
end $$;
