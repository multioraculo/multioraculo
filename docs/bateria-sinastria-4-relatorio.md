# Bateria 4 da sinastria (última): flexões do fechamento, causalidade, duração, signo

Seis gerações, uma por caso, gpt-4o (temperatura 0,7, JSON), **sem juiz, retry, reparo nem fallback**. Sem commit, sem push. Dados em `data/bateria-sinastria/bateria4/` (`resultado/`, `tabela-tecnica.md`, `estrutural.json`); reaplicação às baterias congeladas em `data/bateria-sinastria/reaplicacao-bateria4.json`.

## 1. O que mudou

- **Fechamento (hard só na `sintese_final`):** o detector cobre as flexões `requer/requerem/requerer/requerendo`, `demanda/demandam/demandar/demandando`, `exige/exigem/exigir/exigindo` em construção prescritiva: com objeto prescritivo (paciência, compreensão, esforço, cuidado, equilíbrio) ou "atenção/cuidado ... para". "Exigem atenção" sem objetivo e "pode se beneficiar" seguem como aviso; nada é hard globalmente.
- **Prompt:** removido o exemplo positivo literal. Ficam a regra funcional, o exemplo incorreto e a explicação abstrata (o correto descreve a configuração existente e deixa a tensão em aberto, sem ensinar a administrá-la; pode mostrar coexistência, contraste, tensão não resolvida ou áreas que funcionam de modos diferentes; "não há frase pronta para imitar"). Mais uma regra curta: para `signo:*`, elemento e modo, não inferir características, personalidade ou estilo próprios, salvo se estiverem no material; não completar astrologia de memória. Sem lista de adjetivos.
- **Causalidade:** saiu a regra lexical `influenci*/impact*`. Agora é hard a **forma da afirmação**: verbo no indicativo ("Saturno influencia o humor dela", "o Marte dela impacta..."), passiva ("você é influenciado/impactado por...") e "por causa de X acontece Y"; "X causa Y" continua em `PROIBIDAS`. Não reprova "pode influenciar a dinâmica", "tende a influenciar", "um impacto maior", "amortecer o impacto".
- **Duração (hard, em qualquer bloco):** `duradoura/duradouro`, `durabilidade`, `perdura*`, `permanente`, `de/a/em/no longo prazo`, `para toda a vida`; EN (`lasting`, `long-term`, `permanent`, `enduring`, `durable`...) e ES (`duradero/a`, `permanente`, `a largo plazo`...). Vale para o texto final, e a evidência de origem mencionar continuidade não o autoriza (há teste com um par cuja evidência traz "duradouro").

## 2. Verificação determinística

Sinastria 910, referências 2152, seleção 858, **síntese 1543**, geração 324, aplicabilidade e astro: verdes; `tsc` limpo. Quatro mutações provadas (causalidade lexical de volta, duração desligada, sem `requerer/requerendo`, causalidade afirmada desligada).

Reaplicação às 40 respostas congeladas (20 + 10 + 10), diferença contra o veredito anterior:

| Mudança | Resultado |
|---|---|
| Os dois fechamentos prescritivos da bateria 3 | **N-e2c35a passa a hard** ("requerer paciência"); N-008490 continua hard |
| Os 3 falsos positivos de causalidade | **saem**: N-94628b e N-c3503b passam a aprovadas; N-e2c35a deixa de ter o hard de "impacto" |
| Causalidade realmente inventada | **continua hard**: L-03a1dd ("você é influenciado por terra") agora como "atribui causa que a evidência não sustenta" |
| Duração indevida | **11 detectadas** (L-0c8d01, L-036fca, L-f15c18, M-582a36, M-0922ac, M-10cce4, M-295d49, M-bb7802, N-383686, N-8c7f98, N-008490) |
| Mudança lateral | **nenhuma**: nenhum hard novo fora de duração, fechamento e causalidade afirmada |

## 3. Resultado da bateria 4

Custo real **US$ 0,1476** (≈ US$ 0,025 por geração). Entrada 6.340 a 7.106, saída 622 a 904 tokens, 5,1 a 9,7 s.

| Caso (entrada de) | Estrutural | Fechamento | Duração | Signo / Mercúrio | Dono | S8 | Causalidade |
|---|---|---|---|---|---|---|---|
| P-a2b1d4 (N-008490) | aprovada | descreve: ok | 0 | sem traço | 0 | 0 | 0 |
| P-66bdb2 (N-e2c35a) | aprovada | "exigem atenção" (leve), resto descritivo | 0 | **Mercúrio no mesmo signo "reforça essa ligação ... abordagem mental semelhante"** (sem base) | 0 | **"Vocês dois têm uma afinidade natural" (afirmada)**, borderline | 0 |
| P-c5f436 (N-bfa037) | aprovada (aviso de 91 palavras e "à tona") | "exigir ajustes contínuos ... em aberto" (leve) | 0 | **sumiu** o "assertiva" | 0 | 0 | 0 |
| P-30b6f3 (N-383686) | **hard** | **"O desafio está em lidar com os atritos ... para fortalecer o vínculo"**: prescritivo, não detectado | **"durabilidade"** | sem traço | 0 | 0 | 0 |
| P-5facf1 (L-ee5f90) | **hard** | **"exigem cuidado para evitar..." e "pode ser enriquecedora se as facilidades forem valorizadas"**: prescritivo, pego | 0 | "base comum de entendimento" (leve, sem base) | 0 | 0 | 0 |
| P-335cc5 (N-6b7f01) | **hard (falso positivo)** | "permanece em aberto": ok | 0 | sem traço | 0 | 0 | 0 |

- **Hard:** P-30b6f3 ("precisam ser reconhecidos" e "durabilidade"), P-5facf1 (fechamento) e **P-335cc5 por "fortalecida"**: "A relação é fortalecida por um entendimento mútuo" foi lida pela regra antiga de condição natal ("Sol fortalecido"). Falso positivo, da regra de condição natal que não toquei.
- **Molde copiado em massa:** não reapareceu. A fórmula "duas tendências permanecem presentes" sumiu (0 de 6); "coexistem/em aberto" aparece em 3 de 6, em frases diferentes, vindo da descrição abstrata do prompt. Todas abrem com "A relação entre vocês", como antes.
- **Distorção factual nova:** nenhuma. Dono, S8 explícito e causalidade: 0.

## 4. Critério final

| Critério | Resultado |
|---|---|
| 0 fechamentos claramente prescritivos | **não atendido: 2 de 6** (P-5facf1, pego pelo hard; P-30b6f3, que o detector não vê) |
| 0 previsão de duração | **não atendido: 1 de 6** ("durabilidade ao vínculo", P-30b6f3; pego pelo hard) |
| 0 inferência de traço de signo sem evidência | parcial: 0 traços de personalidade do signo ("assertiva" não voltou); **2 de 6 ainda dão a Mercúrio no mesmo signo um efeito positivo sem base** (P-66bdb2, P-5facf1) |
| 0 trocas de dono | atendido |
| 0 S8 | atendido para a proteção (não disparou); **P-66bdb2 afirma "afinidade natural" a partir de elemento sem verbo de promessa**, borderline |
| 0 causalidade inventada | atendido |
| Nenhum molde copiado em massa | atendido |

**Os critérios não passaram integralmente, então não posso declarar a metodologia encerrada.** O que pesa: um fechamento prescritivo que o detector lexical não vê ("o desafio está em lidar com...") e uma ocorrência de "durabilidade". O que melhorou: dono, causalidade e S8 explícito seguem em zero; o molde sumiu; o "assertiva" sumiu; os falsos positivos de causalidade foram eliminados e o hard barra 2 dos 3 casos ruins desta bateria. O que sobra são o limite de um detector lexical para prescrição reescrita ("o desafio está em"), um falso positivo antigo ("fortalecida") e a variação natural de uma amostra de seis a temperatura 0,7.

Nada além do pedido foi alterado. A decisão de aceitar este resíduo, tratar "o desafio está em..." e "fortalecida" ou parar aqui é sua.
