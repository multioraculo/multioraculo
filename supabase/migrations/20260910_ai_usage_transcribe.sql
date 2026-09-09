-- ============================================================================
-- Multioráculo — registro de custo da transcrição de voz em ai_usage
-- Migration para REVISÃO MANUAL. Não executar sem aprovação.
-- Só amplia a lista de operações aceitas em ai_usage (acrescenta
-- 'transcribe'). Não apaga nem altera nenhum dado. Pode rodar mais de uma vez.
-- ============================================================================
alter table public.ai_usage drop constraint if exists ai_usage_operation_type_check;
alter table public.ai_usage
  add constraint ai_usage_operation_type_check
  check (operation_type in ('safety', 'oracle', 'synthesis', 'dream', 'journey', 'transcribe'));
