# Bateria 3 da sinastria (última curta): exemplo correto/incorreto e fechamento como hard fail

As mesmas 10 entradas da bateria 2, uma geração cada, gpt-4o (temperatura 0,7, JSON), **sem juiz, retry, reparo nem fallback**. Sem commit, sem push. Dados em `data/bateria-sinastria/bateria3/` (`resultado/`, `tabela-tecnica.md`, `estrutural.json`); a reaplicação do estrutural às baterias 1 e 2 está em `data/bateria-sinastria/reaplicacao-fechamento-hard.json`.

## 1. O que mudou (e só isso)

- **Prompt, só o contrato de `sintese_final`:** além da regra semântica, a explicação em uma linha ("correto = descreve o que existe e deixa a dinâmica aberta; incorreto = prescreve como administrar a relação ou condiciona o seu sucesso a uma ação"), o exemplo correto, o incorreto e "os exemplos mostram a diferença funcional e não são texto para copiar". Sem obrigar duas frases nem estrutura lexical; nenhuma outra parte do prompt cresceu.
- **Estrutural:** o detector de fechamento prescritivo virou **hard fail somente na `sintese_final`**. São hard as construções inequívocas: `desde que`, `contanto que`, `se ambos`, `para que a relação`, `é importante`, `o caminho é`, `encontrar equilíbrio`, `com paciência/esforço/cuidado/compreensão...`, `exige esforço/paciência/cuidado`, `exige atenção ... para` ("exige atenção para que", "pedem atenção para evitar"), `depende de como`. "Precisam", "devem" e "é necessário" já eram hard em qualquer bloco. Duas formas ambíguas ficaram como aviso: "exigem atenção" sem objetivo e "pode se beneficiar", porque descrevem tanto quanto prescrevem. Fora da `sintese_final`, nada disso reprova (há teste em três blocos).

## 2. Verificação determinística antes de gastar

- Sinastria 910, referências 2152, seleção 858, **síntese 1485**, geração 324, aplicabilidade e astro: todos verdes; `tsc` limpo. Mutação provada (voltar o fechamento a aviso quebra 14 testes).
- Testes novos: 13 construções que viram hard, 3 que reprovam por conselho, o ambíguo que segue aviso, o exemplo **correto do prompt passa limpo** e o **incorreto do prompt é hard** (o prompt e o verificador dizem a mesma coisa), a mesma construção em `sintese_da_relacao`, `onde_se_encontram` e `onde_ha_tensao` não reprova por esta regra.
- **Reaplicação às 30 respostas congeladas (20 da bateria 1 e 10 da 2):**
  - **17 de 30 `sintese_final` passam a hard fail** (13 de 20 na bateria 1, 4 de 10 na 2): ex.: L-af3ef6, M-bb7802 ("desde que"), L-1dd6cd ("se ambos"), M-ba975a ("pedem atenção para evitar"), M-295d49 ("exige atenção para que"), L-0c8d01 ("exigir mais esforço"), L-ee5f90 ("encontrar um equilíbrio").
  - **8 respostas mudam de status** (aprovada → HARD: L-0c8d01, L-ee5f90, L-af3ef6, L-57809d, L-2fa549, M-295d49, M-bb7802, M-ba975a). Nenhuma voltou de hard para aprovada.
  - **Nenhum outro bloco muda de status por esta alteração:** dos 17 hard novos, 16 são `fecha com condição ou prescrição`; o único outro é o do L-2fa549, a proteção S8 já aprovada na rodada anterior ("garantem uma afinidade natural"). Nenhum aviso alterado fora do fechamento, e nenhum hard sumiu.

## 3. Resultado da bateria 3

| Medida | Resultado |
|---|---|
| Custo real | **US$ 0,2305** (≈ US$ 0,023 por geração); juiz desligado |
| Entrada / saída | 3.741 a 7.035 / 550 a 783 tokens; latência 4,1 a 18,4 s |
| Estrutural | **5 aprovadas, 5 hard** (bateria 2: 8 e 2; ver abaixo por quê) |
| `sintese_da_relacao` | 52 a 78 palavras, **0 acima de 90**, resumo |
| Palavras totais | 212 a 363 |
| Dono | **0 trocas** (estrutural e leitura) |
| S8 (semelhança → compatibilidade/promessa) | **0** (proteção não disparou; leitura dos 8 blocos de pontos em comum) |

**Fechamento prescritivo (critério principal), na minha leitura dos dez:**

- **1 claramente prescritivo, pego pelo hard:** N-008490 (trabalho), "exigindo atenção **para que** cada uma possa se manifestar de forma produtiva".
- **1 claramente prescritivo, NÃO pego:** N-e2c35a (amizade), "obstáculos que podem **requerer paciência e compreensão** contínuas". O detector tem "requer/requerem", não "requerer".
- **2 resíduos leves, só aviso:** N-383686 ("tensão que exigem atenção") e N-bfa037 ("demandando atenção às diferenças"; "demandando" também não está na lista).
- **6 fecham como o contrato manda** (descrevem o que existe e deixam em aberto).

Evolução na mesma amostra: 9 de 10 marcados (bateria 1, avaliador externo) → 5 claros de 10 (bateria 2) → **2 claros de 10 (bateria 3)**.

**Hard fails (5):** 1 fechamento (N-008490, verdadeiro positivo); 1 "precisam ser consideradas" na `sintese_da_relacao` do N-8c7f98 (verdadeiro positivo, conselho); e **3 falsos positivos da regra lexical antiga de causalidade** ("impacto" ×2: "podem ter um impacto maior", "amortecer o impacto"; "influenciar": "podem influenciar a dinâmica"). Não são distorção factual.

## 4. Padrões novos ou persistentes

- **Novo, e causado por esta mudança:** **10 de 10 fechamentos reproduzem a fórmula do exemplo correto** ("as duas tendências permanecem/coexistem", "ambas as forças presentes"); na bateria 2 eram 0 de 10. O exemplo foi usado como molde, apesar de "não são texto para copiar". Não é erro factual nem prescritivo, mas é homogeneização: as dez sínteses finais ficam intercambiáveis.
- **Detector com buracos de forma verbal:** "requerer paciência" e "demandando atenção" escapam (infinitivo e gerúndio). A mesma construção funcional já cobre "requer/requerem/demandam".
- **Falsos positivos lexicais de "influenci*/impact*":** 3 de 10 hard. Regra antiga de causalidade herdada, sem relação com esta rodada, mas que agora pesa na taxa de hard (5 de 10).
- **Persistente, fidelidade:** Mercúrio no mesmo signo ganha leitura própria que a evidência não dá (N-bfa037: "abordagem direta e assertiva"; antes: L-ee5f90, L-2fa549, M-b87c3d). A evidência diz só "fatores pessoais, e podem trazer dificuldades". Não é pegável por regra.
- **Melhorou:** `pontos_em_comum` `null` com semelhança disponível caiu de 3 de 9 para 1 de 9; blocos temáticos escritos de 27 para 31; "duradoura" não reapareceu como padrão.
- **Nenhuma regressão factual nova:** sem dono trocado, sem promessa de semelhança, sem bastidor, sem vazamento de vínculo.

## 5. Critérios de encerramento

| Critério | Resultado |
|---|---|
| 0 fechamentos claramente prescritivos | **não atendido**: 2 de 10 (1 pego pelo hard, 1 que o detector não vê) |
| 0 trocas de dono | atendido |
| 0 semelhança → compatibilidade/promessa | atendido |
| Nenhuma regressão factual nova | atendido (a homogeneização do fechamento e os falsos positivos lexicais não são factuais) |

Não considero a sinastria metodologicamente encerrada, porque o primeiro critério não passou. A frequência caiu de 9 para 5 para 2 em dez, e em produção o hard gate já barraria 1 dos 2. Falta pouco, e é detector, não arquitetura.

## 6. Decisões em aberto (nenhuma tomada, nenhuma exceção criada)

1. **Fechar o buraco de forma verbal** do detector (requerer, demandando, exigir/exigindo atenção + paciência): uma linha, sem lista nova de palavras, só as formas que a regra já cobre. Cobre o N-e2c35a e o N-bfa037.
2. **Os 3 falsos positivos de "impacto/influenciar":** reclassificar como aviso quando não são afirmação causal sobre a pessoa, ou aceitar o ruído de hard.
3. **A fórmula copiada do exemplo:** trocar o exemplo correto por dois exemplos curtos e diferentes, ou aceitar a homogeneização como custo de um fechamento seguro. Qualquer das duas mexe no prompt, então só com a sua aprovação.
