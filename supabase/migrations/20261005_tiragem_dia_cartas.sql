-- ============================================================================
-- Multioráculo — interpretação INDIVIDUAL de cada carta da tiragem do dia
-- Migration para REVISÃO MANUAL. Não executar sem aprovação.
-- ADITIVA: só acrescenta UMA coluna anulável a daily_draw. Não apaga, não
-- altera e não reescreve nenhuma linha existente. Pode rodar mais de uma vez.
-- ============================================================================

-- O verso de cada carta da Home é a interpretação daquela carta no seu próprio
-- oráculo, e não a síntese cruzada. Forma gravada:
--
--   { "tarot":     { "interpretation": "..." | null },
--     "lenormand": { "interpretation": "..." | null } }
--
-- NULL (e o é em toda linha já existente) quer dizer "sem interpretação
-- individual": o verso mostra só nome e orientação, e a síntese antiga segue
-- abaixo da tiragem. O histórico NÃO é regerado.
--
-- O código tolera a coluna ainda não existir: sem ela, lê e grava como antes.
alter table public.daily_draw
  add column if not exists cartas jsonb;

comment on column public.daily_draw.cartas is
  'Interpretação individual de cada carta do dia ({tarot,lenormand}.interpretation). NULL em linhas anteriores à coluna; a síntese cruzada continua em `sintese`.';
