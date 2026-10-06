# Primeira bateria da sinastria: diagnóstico (humano × estrutural × juiz)

Nada foi alterado: prompt, schema, verificador estrutural, juiz, seletor e geração são os da bateria. Nenhuma nova geração, nenhum gasto de OpenAI, nenhum reparo, fallback ou commit. Dados em `data/bateria-sinastria/` (`avaliacao-congelada.json`, `resultado/`, `lacrado/`).

## 0. Proveniência e limites do que segue

- **A avaliação congelada veio de uma IA externa (ChatGPT), não de você.** Foi o que combinamos para a ficha não depender de você, mas "humano" abaixo quer dizer "avaliador externo". Foi gerada no formato da ficha, sem hash próprio. sha256 do arquivo: `83488664730fda12…715314`; arquivo de origem gravado às 01:12 (-03:00).
- **O lacre do juiz estava íntegro:** os hashes dos 20 arquivos do juiz, gravados às 00:42 (antes da avaliação), conferem 20 de 20.
- **O avaliador dá notas apertadas:** nenhuma nota 1, quase tudo 3 ou 4 (médias: omissões 2,75; conselho 3,05; repetição 3,15; proporção 3,20; geral 3,45; dono 4,80; inventada 4,65). Marcou S5 (prescrição) em 18 das 20 respostas (25 marcas, 19 delas na síntese final). Tudo abaixo é relativo a esse avaliador.
- **Definições que usei, para você poder refazer as contas:**
  - *falha factual real* = dono < 5, ou marca S3, S8, S9 ou S10, ou "inventada" ≤ 3;
  - *humano reprovaria* = falha factual real **ou** nota geral ≤ 3.

## 1. Estrutural × humano nas 17 reprovações

| Medida | Resultado |
|---|---|
| Reprovações estruturais que um humano também reprovaria | **10 de 17** (7 com falha factual real; 9 com geral ≤ 3; 6 nos dois critérios) |
| Reprovadas só por estilo, tamanho ou falso positivo (nenhuma regra factual) | **8 de 17** |
| ...dessas 8, com falha factual real que o estrutural **não viu** | **3** (03a1dd, ee5f90, 2fa549: reprovadas por tamanho e vocabulário, e a falha real estava em outro lugar) |
| ...dessas 8, só com ressalva leve | 5 (0c8d01, 57809d, 1dd6cd, d4313b, f15c18) |
| Reprovadas com falha factual detectada pelo estrutural | **4**: dono trocado (036fca, 29d150), "compatibilidade" (d85916), citação que não sustenta a dimensão (36ec8a) |
| As 7 com falha factual real do humano que o estrutural reprovou | 7 de 7 (mas 3 delas por motivo alheio à falha) |
| Aprovadas pelo estrutural | 3, e as 3 têm S5 e S1 na síntese final no humano (gerais 4, 3, 3) |

**Resumo:** o estrutural reprovou todas as respostas que o humano considera factualmente falhas, mas só em 4 de 7 pelo motivo certo. Ele aprovou 3 respostas que o humano marca com prescrição e fidelidade na síntese final.

## 2. Cada regra estrutural, classificada

| Regra | Vezes | Confirmada pelo humano? | Classificação |
|---|---|---|---|
| Dono trocado | 2 | sim, nas duas (dono = 3 e a nota explica: seu Marte × Sol dela, escrito como seu Sol × Marte dela) | **verdadeiro problema; problema de geração** |
| "compatibilidade" | 1 | sim (S3, S5, S8) | **verdadeiro problema; geração** (era o que o prompt proibia) |
| Citação não sustenta a dimensão (afeto) | 1 | sim (S1, S5 no mesmo parágrafo) | verdadeiro problema; geração |
| Conselho ("precisam" ×4, "busque") | 5 | 4 de 5. "ambos precisam tomar decisões rápidas" é descrição, e o humano não marcou | 4 verdadeiros, **1 falso positivo**; regra lexical |
| Omite todas as facilidades | 1 | não: o texto fala de apoio e afeto, citando conjunções (categoria variável); as favoráveis harmônicas (Lua–Marte, Lua–Mercúrio) foram omitidas, mas esse não é o defeito que a regra descreve | **falso positivo na forma**; **regra estreita** (só conta aspecto harmônico, ignora conjunção); a omissão real existe e o humano a registra como "central" |
| Parágrafo acima de 90 palavras | 6 (91, 92, 96, 98, 105, 106) | nenhuma marca humana; 5 de 6 em `sintese_da_relacao` | 91 e 92: **regra editorial rígida**; 96 a 106: **problema de geração**, e a concentração em `sintese_da_relacao` aponta para o **desenho do prompt** (a síntese pede panorama, o teto é 90, o modelo escreve um parágrafo só) |
| Total acima de 700 (796) | 1 | não marcado | problema de geração |
| Expressão proibida ("à tona", "influenciado", "pedem atenção especial", "energia", "Este aspecto sugere") | 5 | não marcado | **editorial**; lista herdada de `editorial.ts`, não específica da sinastria |
| Vocabulário que o produto não usa ("beneficiar" ×3, "benéfica" ×2) | 5 | não marcado | **editorial excessivamente rígida** ("beneficiar" é verbo comum) |
| "A noite" como precisão que nenhum cálculo produziu | 1 | o humano diz que a metáfora vem da evidência | **falso positivo**; a regra confunde figura de linguagem com horário |

**Falhas do humano que o estrutural não tem como ver (falsos negativos):**

- **Prescrição implícita (S5):** 18 respostas, 25 marcas, 19 delas na síntese final. A regra de conselho pegou 4 dessas 18. Fórmulas como "desde que ambos estejam dispostos", "exige atenção e esforço", "pode se beneficiar de" e "com esforço e compreensão" passam.
- **Semelhança como facilidade ou promessa:** S8 em 4 respostas (ee5f90, 036fca, 2fa549, d85916) e S3 em 2 ("garantem uma afinidade natural"). O estrutural só pegou a palavra "compatibilidade".
- **Cena inventada (S10):** 154b91.
- **Vínculo criando significado (S9):** 03a1dd.

## 3. Juiz semântico

- **Rodou em 3 respostas**, as aprovadas pelo estrutural. É pouca base para qualquer taxa.
- **Defeito de contrato, documentado e não corrigido.** Em 3 de 3 o juiz devolveu `"bloco"` com o **texto do parágrafo** (no lugar do id) e `"indice"` sequencial. O leitor da saída (`lerSaidaDoJuiz`) não casou nenhum item e **descartou todos** (`descartadas` = número de parágrafos), mas o registro saiu com `status: "ok"` e **zero violações**. O registro parece limpo e perdeu o julgamento: um "ok" mentiroso. Causa: o pedido rotula o parágrafo como `--- bloco[indice]` seguido de `texto:`, e o modelo trocou os campos.
- **Recuperei as violações do JSON bruto casando pelo texto do parágrafo**, só para esta análise (o código do juiz não mudou):

  | Resposta | Juiz (por parágrafo) | Humano |
  |---|---|---|
  | 3f1caf (romântico) | S4 na síntese da relação; S8 em pontos em comum; S4 na síntese final | S1 e S5 na síntese final |
  | 87ce21 (trabalho) | S1 na síntese (2 parágrafos), nos pontos em comum e na síntese final | S1 em "onde se encontram"; S1 e S5 na síntese final |
  | af3ef6 (romântico) | S4 na síntese, S8 em pontos em comum, S4 em "onde há tensão", S4 na síntese final | S1 e S5 na síntese final |

- **Matriz por regra (16 parágrafos × 11 regras):**

  | Regra | VP | FP | FN | VN |
  |---|---|---|---|---|
  | S1 | 1 | 3 | 3 | 9 |
  | S4 | 0 | 5 | 0 | 11 |
  | S5 | 0 | 0 | 3 | 13 |
  | S8 | 0 | 2 | 0 | 14 |
  | S2, S3, S6, S7, S9, S10, S11 | 0 | 0 | 0 | 16 |

  O juiz **não viu nenhuma das 3 prescrições (S5)** e concordou em 1 de 4 marcas S1. Dispara S4 com frequência (5 vezes, 0 confirmadas), e S8 em "afinidade natural", que o humano não marcou (a evidência diz "afinidade teórica", e "natural" é o acréscimo do modelo: o juiz pode ter razão e o avaliador ter deixado passar). Com 16 parágrafos não há como separar defeito do juiz de ruído.

## 4. Os pontos pedidos

**4.1 Os blocos temáticos `null` representam perda de informação?** De 137 blocos temáticos liberados, 76 (55%) ficaram `null`. Avaliação humana desses 76:

| | Integrada em outro bloco | Realmente ausente | Evidência fraca |
|---|---|---|---|
| Total | 40 (53%) | 22 (29%) | 14 (18%) |
| Comunicação (20) | 16 | 4 | 0 |
| Afeto e intimidade (18) | 13 | 2 | 3 |
| Vida prática e sustentação (18) | 5 | **8** | 5 |
| O que a relação mobiliza (19) | 6 | **7** | 6 |

Nos cinco do controle, comunicação e afeto foram integrados em 5 de 5; vida prática ficou **ausente** em 4 de 5 e mobilização em 3 de 5. **Conclusão:** `null` em comunicação e afeto não é perda (a dimensão está nas sínteses e nos blocos de encontro e tensão); em vida prática e mobilização há perda real em cerca de 40% dos casos, e nos demais a evidência era fraca. Perda de informação: sim, localizada nesses dois blocos, e não nos quatro.

**4.2 A seleção de 5 dinâmicas (no controle, 4 a 7 de 18) preservou as mais centrais?** O modelo cita as de maior ranking: dos 5 primeiros aspectos de cada resposta, cita 2 a 5 (mediana 4). As omissões que o avaliador chama de centrais ficam, em mediana, na posição 10 do ranking (as secundárias, na 12): o avaliador e o seletor discordam sobre o que é central, não o modelo sobre o ranking. No controle:

| Vínculo | Citadas | Centrais omitidas (posição no ranking) |
|---|---|---|
| romântico | 5/18 | sun-pluto (11), mars-pluto (12) |
| amizade | 5/18 | moon-pluto (5), mercury@casa3 (17) |
| família | 5/18 | mars-pluto (12), jupiter@casa4 (13), mars@casa4 (16) |
| trabalho | 4/18 | sun-mars (7), sun-jupiter (8), mars-pluto (12), jupiter@casa6 (14), mars@casa2 (15), mercury@casa3 (17) |
| outro | 7/18 | moon-pluto (5), mars-pluto (12) |

`mars-pluto:adverso` é marcada central e omitida em 4 de 5 (só a amizade a cita), e é a **única tensão forte** da lista: o modelo ficou com duas tensões leves (Mercúrio–Lua, Lua–Vênus). A leitura central preservou apoio e comunicação; perdeu a profundidade. Em trabalho, a preservação foi pior (6 omissões centrais, nota de vínculo 2).

**4.3 O vínculo mudou só a ênfase?** Os cinco textos têm o mesmo conteúdo factual (mesmas 3 a 4 dinâmicas de abertura, mesmas tensões) e 4 dos 9 blocos `null` em todos. Resultado por preocupação:

- **Romântico não sexualiza evidência neutra:** confirmado. Também não ganha tom romântico específico.
- **Amizade não apaga tensão:** confirmado (o bloco de tensão está inteiro, incluindo Marte–Plutão).
- **Família não inventa história familiar:** confirmado, **mas** a resposta de família diz "formando uma amizade firme e duradoura". "Amizade firme" vem da frase do repertório de Sol–Plutão ("pode favorecer a formação de uma amizade firme") e "duradoura" é acréscimo do modelo. É um **vazamento de significado** pela evidência, que a revisão de aplicabilidade não cobriu (só tratamos tipos romântico, família e trabalho).
- **Trabalho não converte tudo em carreira:** o oposto. Quase não há trabalho no texto (só "cooperação harmoniosa" na última frase). O avaliador deu vínculo = 2. Ignorou Sol–Marte, Sol–Júpiter, casa 6, casa 2: a ênfase sugerida (comunicação, vida prática, tensão) praticamente não agiu.
- **Outro não vira texto vazio:** confirmado (nota 5), mas tem o dono trocado em Sol–Marte.

**Veredito:** o vínculo alterou **só a ênfase, e pouco**; um vazamento de significado (amizade em leitura de família) e uma ênfase que não pegou (trabalho). Não houve mudança de astrologia.

## 5. Padrões que atravessam as 20 respostas

- **A síntese final é um molde.** As 20 contrapõem apoio e desafio, e 16 de 20 trazem uma fórmula de esforço, atenção ou condição ("desde que ambos estejam dispostos", "com esforço e compreensão", "exige atenção"). É onde estão 19 das 25 marcas S5, 9 das 22 S1, 3 S4 e as 2 S3. Os dois blocos de síntese têm uma regra que manda "não fechar com conclusão", e o modelo a descumpre quase sempre.
- **A síntese da relação** estoura o teto de 90 palavras em 5 das 6 ocorrências, porque o modelo escreve um parágrafo só.
- **Os dois erros de dono são do mesmo tipo:** o fato diz "seu Marte × Sol da outra pessoa" e o texto diz "seu Sol × Marte dela". Troca a ordem planeta-primeiro.
- **A ressalva dos pontos em comum** ("semelhança grande demais...", "o Sol tem papel pequeno") praticamente nunca aparece no texto; S1 e S8 em pontos em comum (4 e 3 marcas) vêm daí.

## 6. Onde cada problema mora (sem corrigir)

| Problema | Onde parece morar |
|---|---|
| Prescrição na síntese final (19 marcas) e o molde de fechamento | **prompt** (regra de síntese final e de descrever, não prescrever, não bastam como estão); **verificador** (lista lexical não vê a prescrição implícita) |
| Tamanho da síntese da relação | **prompt/schema** (um parágrafo de panorama contra um teto de 90) |
| Troca de dono planeta-primeiro | **geração**; possivelmente a forma como o fato é dito no payload |
| Semelhança como facilidade, ressalva ausente | **prompt** (a ressalva é um dado do payload que o modelo não usa) |
| Vínculo trabalho sem ênfase; vazamento "amizade" | **prompt** (peso da ênfase) e **repertório** (frase com "amizade" em evidência de outro vínculo) |
| Omissões centrais em vida prática e mobilização | **geração**, com 55% dos blocos temáticos nulos, mais a **liberação de blocos** (permissiva) |
| "A noite", "beneficiar", "energia", lista herdada, "omite facilidades" só com harmônico | **verificador estrutural** (rígido ou estreito) |
| Registro do juiz com `status: ok` e todas as violações descartadas; S4 em excesso; S5 invisível | **juiz** (contrato do pedido e do leitor; rubrica) |
| Tendência a 15 a 20 dinâmicas no material, 4 a 8 usadas | seleção (já fechada; só observação) |

Não há achado que aponte para o **schema** das nove chaves. O que chama atenção é que quase tudo cai em três lugares: prompt, verificador e contrato do juiz.

## 7. Decisão

Fica com você: ajustar no prompt, no verificador, no juiz, em todos ou em nenhum. A leitura que faço do diagnóstico, para discussão e sem agir:

1. **O juiz tem um defeito de contrato que invalida os dados dele.** Isso é anterior a qualquer calibração, e é o único item em que o resultado atual é enganoso (registro "ok" com tudo descartado).
2. **O estrutural reprova muito e acerta pouco no que importa:** 17 de 20 reprovações, só 4 por falha factual detectada, e 18 prescrições passando.
3. **O maior defeito de qualidade é um só e é de geração:** o fechamento da síntese final.
