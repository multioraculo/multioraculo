# Bateria 1 da sinastria: correção cirúrgica e recalibração (sem nova geração)

Continuação de [bateria-sinastria-1-diagnostico.md](bateria-sinastria-1-diagnostico.md). Não toquei no schema das 9 chaves, no seletor e no ranking, nos budgets, no cálculo, nas glosas Davison (só a camada de aplicabilidade), no número de blocos, no fallback, no banco ou em UI. Nenhuma síntese foi gerada, nada foi reparado, não houve commit nem push. Único gasto de OpenAI: a rerodada do juiz nas 20 respostas congeladas, **US$ 0,0194** (gpt-4o-mini, temperatura 0, ~5.000 tokens de entrada e ~375 de saída por resposta, 4,4 s em média).

## 1. O que mudou

| Área | Mudança |
|---|---|
| **Contrato do juiz** ([juiz-semantico-sinastria.ts](../lib/astro/juiz-semantico-sinastria.ts)) | Cada parágrafo tem um id estável (`sintese_da_relacao:0`, `onde_ha_tensao:1`, `sintese_final:0`). O pedido envia `paragraph_id` e lista os ids que a resposta tem de devolver. O leitor só aceita ids enviados, nunca casa por texto, e detecta **ausentes, duplicados e desconhecidos**; item que não é objeto, violações que não são lista, regra desconhecida e trecho ou motivo que não são texto também invalidam. Qualquer desvio vira `judge_error` (com `causa` e `problemas`), e o registro inteiro é descartado: não há julgamento parcial. O único caminho para "ok com zero violações" é devolver todos os ids com lista vazia. Falha de chamada e saída que não é JSON também são `judge_error`. Versão `juiz-2026-10-b`. As 11 regras e o texto das perguntas não mudaram |
| **Estrutural: hard fail × warning** ([verificador-sinastria.ts](../lib/astro/verificador-sinastria.ts), [verificador-resposta-sinastria.ts](../lib/astro/verificador-resposta-sinastria.ts)) | O veredito agora tem `violacoes` (hard, reprovam) e `avisos` (warning, não reprovam). Ver 1.1 |
| **Prompt** ([prompt-sinastria.ts](../lib/astro/prompt-sinastria.ts)) | Só o contrato das duas sínteses. Ver 1.2 |
| **Aplicabilidade** ([aplicabilidade.ts](../lib/astro/davison/aplicabilidade.ts)) | Um item novo (`sun-pluto#favoravel.nucleos[3]`) e um campo novo, `mantemEm`. Ver 1.3 |

### 1.1 Hard fail × warning

| HARD FAIL (reprova) | WARNING EDITORIAL (não reprova) |
|---|---|
| dono ou corpo trocado; aspecto, overlay, ângulo ou casa que não é fato | 1 a 10% acima do teto de palavras (91 a 99 por parágrafo; 701 a 770 no total) |
| evidência que não sustenta a dimensão do bloco; id inexistente; bloco liberado pelo código e escrito fora da elegibilidade; schema inválido | `beneficiar`, `benéfica`, `maléfica` (vocabulário avaliativo) |
| "compatibilidade" e veredito, porcentagem, duração | clichês herdados de outros oráculos: à tona, energia, é fundamental, um convite para, pede atenção especial, "este aspecto sugere", encontrar equilíbrio, autoconhecimento e afins |
| previsão ("vai acontecer"), sorte e azar, diagnóstico, autores, estereótipo de signo, causalidade lexical ("influenciado") | travessão |
| conselho inequívoco (deve, precisa, evite, busque...) | fechamento condicional ou prescritivo na síntese final ("desde que", "se ambos", "para que a relação", "é importante", "o caminho é", "com paciência", "exige esforço"...), medido para a próxima bateria |
| karma e vidas passadas | |
| conteúdo de bastidor: "o repertório", "fatos calculados", "o livro", "Davison", JSON | |
| limite **claramente** excedido: mais de 10% sobre 90 palavras por parágrafo (100 ou mais), mais de 10% sobre 700 no total (771 ou mais), parágrafos demais num bloco | |
| omite todas as facilidades ou todas as tensões, **medido sobre a evidência selecionada** | |

Revisões pedidas, pontuais:
- **"Omite facilidades":** deixou de ser lexical e estreita. Agora é hard só quando a resposta não cita **nenhuma dinâmica que sustenta apoio** (aspecto harmônico ou variável, frase de valência favorável, facilidade de overlay) e a evidência as tem; o mesmo para tensão. Uma conjunção citada conta como facilidade (era o falso positivo do L-40f3b0).
- **"A noite complementa o dia":** o artigo "a noite" não é mais lido como "à noite", e uma expressão que a própria evidência traz não é precisão inventada. "À noite" e "às 15h" inventados continuam hard.
- **Não enfraquecido:** dono, fidelidade, prescrição inequívoca, veredito e previsão continuam hard. Os limites que usei para tamanho (10% de tolerância) e a lista de expressões editoriais são minhas escolhas, e estão no código e nos testes.
- A regra de conselho continua lexical e sem exceção: "ambos precisam tomar decisões rápidas" (descrição, no L-154b91) segue sendo hard. Ver 4.

### 1.2 Prompt (só `sintese_final` e a instrução de tamanho da `sintese_da_relacao`)

- **Regra da síntese final:** "descreve a configuração que permanece em aberto; não prescreve a maneira de administrá-la. Integra as forças presentes, preserva a contradição, não decide o destino da relação e não transforma a conclusão em conselho." Seguem os fechamentos proibidos (desde que, se ambos, para que a relação, precisam, devem, é importante, o caminho é, encontrar equilíbrio, com compreensão, paciência ou esforço), **e** "nem equivalente em outras palavras (qualquer frase que diga o que as duas pessoas deveriam fazer ou de que o resultado dependeria)", **e** "termine na descrição: o que há, e o que fica em aberto". O contrato é semântico; a lista é ilustração.
- **`sintese_da_relacao`:** a descrição do bloco e uma regra curta dizem que é **resumo do padrão geral e não inventário**, que não percorre os aspectos um a um, e que o detalhe fica para os blocos. O teto de 90 palavras não mudou e nenhuma informação foi cortada para obedecê-lo.
- O prompt cresceu ~250 tokens (6.600 → 6.850 no par de exemplo; mediana dos 18 pares 6.550 → 6.810).

### 1.3 Aplicabilidade

`sun-pluto#favoravel.nucleos[3]` ("...a formação de uma amizade firme"): nos vínculos romântico, família, trabalho e outro, o prompt recebe "...a formação de um laço firme"; na amizade, a frase original fica. A glosa Davison não foi tocada. "Duradoura" não está nessa evidência e continua sendo problema de geração (há teste de que a revisão não o contém). Só esse item foi corrigido, como pedido.

## 2. Verificação sem nova geração

- Sinastria 910, referências 2152, seleção 858, síntese 1446, geração 322, aplicabilidade, astro: todos passam; `tsc` limpo nos arquivos da sinastria.
- Mutações provadas nos testes: voltar as expressões editoriais a hard, tolerância de tamanho zero, perder a regra do artigo "a noite", voltar "omite facilidades" à regra estreita, aceitar contrato inválido do juiz, ignorar id ausente.
- A seleção continua idêntica nos cinco vínculos (hash).

## 3. Estrutural revisado × avaliador (20 respostas congeladas)

**Hard: 12 de 20 (antes eram 17 reprovadas). Aprovadas: 8.** Warnings: 16 respostas têm algum (28 avisos).

| Resposta | Antes | Agora | Falha factual (avaliador) | S5 (avaliador) | Hard fail atual |
|---|---|---|---|---|---|
| 154b91 | reprov | **HARD** | sim (S1, S10) | não | conselho "precisam" |
| 03a1dd | reprov | **HARD** | sim | sim | 796 palavras no total; "influenciado" |
| 036fca | reprov | **HARD** | sim (dono) | sim | dono trocado |
| d85916 | reprov | **HARD** | sim (S3, S8) | sim | "compatibilidade" |
| 29d150 | reprov | **HARD** | sim (dono) | sim | dono trocado |
| 4c6363 | reprov | HARD | não | sim | conselho "precisam" |
| 40f3b0 | reprov | HARD | não | sim | conselho "precisam" |
| f64a03 | reprov | HARD | não | sim | conselho "precisam" |
| a7c5c1 | reprov | HARD | não | sim | conselho "busque" |
| 36ec8a | reprov | HARD | não | sim | citação que não sustenta a dimensão |
| 1dd6cd | reprov | HARD | não | sim | parágrafo de 106 palavras |
| d4313b | reprov | HARD | não | sim | parágrafo de 105 palavras |
| **ee5f90** | reprov | **aprovada** | **sim (S1, S8)** | sim | nenhum |
| **2fa549** | reprov | **aprovada** | **sim (S3, S8)** | sim | nenhum |
| 0c8d01, 57809d, f15c18 | reprov | aprovada | não | f15c18 e 57809d sim | nenhum |
| 3f1caf, 87ce21, af3ef6 | ok | aprovada | não | sim | nenhum |

- **Dos 12 hard, 10 são confirmados pelo avaliador no mesmo parágrafo ou como falha factual** (5 factuais + 4 prescrições S5 no parágrafo do "precisam/busque" + 1 citação com S1 e S5). O L-154b91 acerta pelo motivo errado (o "precisam" é descritivo, a falha real é S10). Duas reprovações são só de tamanho (106 e 105 palavras), sem marca humana: é o "limite claramente excedido" que você pediu como hard.
- **Dos 7 com falha factual do avaliador, 5 estão em hard** e 2 passam (ee5f90 e 2fa549): são semelhança tratada como facilidade ou promessa ("garantem uma afinidade natural"), que o estrutural não consegue ver. Antes passavam por acidente (reprovadas por tamanho e vocabulário); agora aparecem como o que são, um buraco do estrutural.
- **Prescrição implícita:** 7 das 18 respostas com S5 estão aprovadas. O aviso de fechamento prescritivo apareceu em 14 respostas e cobre 13 das 18 com S5, sem reprovar nenhuma: o sinal de frequência para a próxima bateria existe.
- **Avisos que apareceram** (28): fechamento prescritivo 15, vocabulário avaliativo 5, tamanho 4, estilo 4, travessão 0.

## 4. Juiz corrigido × avaliador

**O contrato funcionou:** nas 20 respostas o juiz devolveu todos os ids, sem ausentes, duplicados nem desconhecidos (`judge_error` = 0). Foram avaliados todos os 120 parágrafos, e não só os das 3 aprovadas (rodou nas 20, inclusive nas reprovadas pelo gate antigo).

**Matriz de confusão por regra (120 parágrafos × 11 regras; avaliador como referência):**

| Regra | VP | FP | FN | VN | Precisão | Recall |
|---|---|---|---|---|---|---|
| S1 fidelidade | 0 | 1 | 22 | 97 | 0,00 | 0,00 |
| S2 causalidade | 0 | 0 | 0 | 120 | n/a | n/a |
| S3 fatalismo ou promessa | 0 | 1 | 2 | 117 | 0,00 | 0,00 |
| S4 veredito implícito | 3 | **71** | 0 | 46 | 0,04 | 1,00 |
| S5 prescrição implícita | 0 | 0 | **25** | 95 | n/a | 0,00 |
| S6 diagnóstico ou rótulo | 0 | 0 | 0 | 120 | n/a | n/a |
| S7 tensão como defeito | 0 | 0 | 0 | 120 | n/a | n/a |
| S8 semelhança como facilidade | 3 | 14 | 2 | 101 | 0,18 | 0,60 |
| S9 vínculo criando significado | 0 | 0 | 1 | 119 | n/a | 0,00 |
| S10 cena inventada | 0 | 0 | 1 | 119 | n/a | 0,00 |
| S11 contradição escolhida | 0 | 0 | 0 | 120 | n/a | n/a |
| **Total** | 6 | 87 | 53 | 1174 | **0,06** | **0,10** |

O juiz emitiu 93 violações (S4 74, S8 17, S3 1, S1 1); em 79 delas o trecho citado está no parágrafo.

**O que a matriz diz, sem ajustar nada:**
- **S4 dispara em 74 dos 120 parágrafos**, em qualquer bloco (27 só em `sintese_da_relacao`, 18 em `sintese_final`, 16 em `onde_ha_tensao`, 9 em `onde_se_encontram`). O padrão é o mesmo: a frase de abertura de qualquer parágrafo ("A relação é marcada por uma mistura de apoio e desafios") é lida como "conclui sobre a relação como um todo". A regra, como está escrita, não separa resumo de veredito. Não distingue nada.
- **S5 tem recall zero**: das 25 marcas (19 na síntese final), o juiz não viu nenhuma. Nem "desde que ambos queiram" nem "exige esforço".
- **S1 tem recall zero** (0 de 22): fidelidade fina, como "o texto acrescenta crescimento mútuo", o juiz de modelo pequeno não pega.
- **S8** é a única regra com algum sinal: 3 de 5 pegos, mas 14 FP (14 em `pontos_em_comum`). Nas amostras que li, o juiz aponta frases como "afinidade teórica ... pode criar compreensão mútua" e "o elemento fogo pode impulsionar a ação", que o avaliador não marcou. Pelo menos parte desses FP é discordância sobre o texto, não erro do juiz; o avaliador é mais permissivo em S8 do que a regra.
- S2, S6, S7, S9, S10 e S11 quase não têm marcas humanas e o juiz também não marcou: com 120 parágrafos não dá para dizer nada sobre elas.

**Casos em que o estrutural e o juiz ainda divergem do avaliador:**

| Caso | Estrutural | Juiz | Avaliador |
|---|---|---|---|
| ee5f90, 2fa549 (S8, S3 em pontos em comum e na síntese) | aprovada | S8 sim; S3 não | falha factual |
| Prescrição na síntese final (18 respostas) | hard em 4 (conselho), aviso em 13 | nenhuma | S5 em 18 |
| 154b91 (S10, cena de "decisões rápidas") | hard por "precisam" (motivo errado) | não vê S10 | falha factual |
| 1dd6cd, d4313b (105 e 106 palavras) | hard | só S4 | S5 na síntese final, sem marca de tamanho |
| 03a1dd (S9, S4, S5 no vínculo trabalho) | hard por tamanho e "influenciado" | S4 | falha factual |
| S4 em 74 parágrafos | não tem regra equivalente | dispara | 3 marcas S4 no total |

## 5. Leitura e decisões em aberto

1. **O contrato do juiz está consertado.** Mas o juiz **não está calibrado** e, tal como está (rubrica atual, modelo pequeno), não deve virar gate: precisão 0,06 e recall 0,10, S4 sem poder de discriminação e S5 cego. Não toquei nas regras nem no prompt do juiz, como pedido.
2. **O estrutural agora separa o que é segurança do que é estilo**, e o que reprova (12) é majoritariamente confirmado pelo avaliador. A sobra é de falsos negativos de prescrição implícita e de semelhança como promessa.
3. **O novo fechamento da síntese final só pode ser avaliado numa geração nova.** A bateria curta decidida por você deve medir: frequência de S5 e do aviso de fechamento na síntese final, estouro da síntese da relação, e se "dono trocado planeta-primeiro" persiste.
4. **Pontos para você decidir** (nenhum feito): (a) a regra de conselho continua sem exceção para "precisam" descritivo (um caso em 20); (b) o juiz: reescrever S4 (resumo não é veredito) e dar ao S5 exemplos, ou trocar o modelo do juiz, antes de qualquer gate; (c) a tolerância de 10% no tamanho.

Arquivos: `data/bateria-sinastria/recalibracao/` (um JSON por resposta: estrutural revisado e registro do juiz), `scripts/bateria-sinastria-recalibra.ts`.
