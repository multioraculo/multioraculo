# Bateria 2 da sinastria (curta): novo contrato de fechamento

Dez gerações, uma por caso, gpt-4o (temperatura 0,7, JSON), **sem retry, reparo, fallback nem juiz**. Não toquei no prompt, no schema, no seletor, no juiz ou na aplicabilidade depois de fechar os testes; não comparo mais nada além do que foi pedido. Sem commit nem push. Dados em `data/bateria-sinastria/bateria2/` (`resultado/`, `tabela-tecnica.md`, `estrutural-recalculado.json`).

## 0. Antes das gerações

- **Juiz desligado, confirmado:** só `pipeline-sinastria.ts` o referencia; nenhuma rota o chama; `executarPipeline` só o chama se receber `chamarJuiz`, e sem ele o registro é `null` e nenhuma chamada paga acontece. Dois testes novos provam isso (geração válida e geração reprovada). O código e os testes de contrato (`paragraph_id`, `judge_error`) ficam.
- **Tolerância de tamanho aprovada:** 91 a 99 e 701 a 770 são aviso, mais que isso é hard. Nenhuma exceção para o "precisam" descritivo.
- **Proteção contra semelhança → facilidade ou promessa** (hard, estreita, em `promessaDeSemelhanca`): só age nos parágrafos que citam um ponto em comum (ids `elemento`, `elemento_do_sol`, `modo`, `signo:*`) e no bloco `pontos_em_comum`. Pega garantia ou asseguramento de afinidade, compreensão, facilidade ou harmonia; "facilidade natural" e "naturalmente fácil"; semelhança que "implica", "significa" ou "resulta em" afinidade; diferença que "impede" ou "torna incompatível". Aceita a negação ("a semelhança não garante facilidade"; "nem sempre garante") e a descrição sustentada e cautelosa ("afinidade teórica", "pode trazer uma compreensão instintiva", "afinidade natural" com "pode").
  - **Regressão com o caso real:** o L-2fa549 ("as semelhanças nos elementos e signos garantem uma afinidade natural") é pego. Nos 120 parágrafos da bateria 1 a regra tem **um acerto e zero falso positivo**.
  - **O outro caso congelado (L-ee5f90) não é pegável deterministicamente.** "Mercúrio no mesmo signo de Peixes pode trazer uma compreensão mútua das ideias" tem exatamente a forma da descrição sustentada que você pediu para permitir; o defeito é de fidelidade (a evidência só diz "podem trazer dificuldades"), e isso é trabalho de juiz, não de expressão regular. Parei aí, como pedido, e deixei o caso registrado em teste como limitação conhecida.
- Verificadores: sinastria 910, referências 2152, seleção 858, síntese 1469, geração 324, aplicabilidade e astro: todos verdes; `tsc` limpo. Mutação provada (desligar a regra quebra os testes).

## 1. Execução e custo

| Medida | Resultado |
|---|---|
| Casos | 5 do par de controle (cinco vínculos) + 5 entradas já usadas na bateria 1: L-036fca (troca de dono), L-d4313b (síntese da relação de 105 palavras), L-2fa549 (S8), L-f64a03 (pouca evidência, sem hora), L-03a1dd (tensão e facilidade fortes) |
| Tokens de entrada | 3.625 a 6.919, mediana ≈ 6.600 (o caso sem hora é o de 3.625) |
| Tokens de saída | 555 a 843 (bateria 1: 547 a 1.458) |
| Latência | 3,8 a 5,9 s |
| **Custo real** | **US$ 0,2242** (≈ US$ 0,022 por geração; bateria 1: ≈ US$ 0,024). Juiz desligado: US$ 0 |

## 2. Resultado por critério

**Estrutural:** 8 de 10 aprovadas; 2 hard, ambos prescrição real ("desafios que **precisam** ser reconhecidos", "é **necessário** um trabalho mais consciente"). Avisos: fechamento prescritivo em 6, vocabulário avaliativo 3, estilo 1. Nenhum hard de dono, de semelhança, de tamanho ou de bastidor.

Comparação nas **mesmas dez entradas** da bateria 1 (estrutural revisado):

| | Bateria 1 | Bateria 2 |
|---|---|---|
| Hard | 6 de 10 | **2 de 10** |
| Aviso de fechamento prescritivo (lexical, subestima) | 9 de 10 | 6 de 10 |
| Palavras totais (média) | 407 | **302** |
| Síntese da relação: mediana, máximo, acima de 90 | 80, 106, 5 de 27 parágrafos (bateria inteira) | **62, 84, 0** |
| Aspectos nomeados na síntese da relação (mediana) | 3 | **1** |

1. **Síntese final prescritiva: caiu, mas não sumiu.** Na minha leitura dos dez fechamentos, **5 são claramente prescritivos** (M-aa502c, M-0922ac, M-295d49, M-bb7802, M-ba975a), 3 têm só um resíduo de exigência ("exigem atenção", "não podem ser ignoradas") e **2 fecham exatamente como o contrato manda** (M-10cce4: "deixa em aberto a possibilidade ..., sem um desfecho predeterminado"; M-b87c3d: "se mantém em um equilíbrio dinâmico"). Na bateria 1, o avaliador marcou S5 na síntese final de 9 das mesmas 10 entradas. (Leitores diferentes: o avaliador era a IA externa; é indicação, não medida comparável.)
   - **As fórmulas proibidas no prompt ainda aparecem:** "desde que" (M-aa502c, M-bb7802), "precisam" (M-aa502c), "é necessário" (M-0922ac), "exige atenção **para que** a relação se desenvolva" (M-295d49), "pedem atenção **para evitar** que tensões se tornem obstáculos" (M-ba975a), "requer atenção contínua" (M-0922ac). **O contrato semântico foi parcialmente obedecido; a lista explícita não foi.**
2. **Fechamento descrevendo a configuração aberta:** em 5 de 10 o fechamento termina na descrição; nos outros 5 volta a dizer como administrar a relação.
3. **Síntese da relação:** de 50 a 84 palavras (nenhum estouro), 1 aspecto nomeado em mediana. Continua resumo; só M-587259 e M-0922ac listam 2 ou 3 aspectos. **Resolvido.**
4. **Dono: 0 trocas.** O estrutural não acusou nenhuma e as menções a Sol–Marte e Sol–Saturno que li estão na direção certa. As duas entradas que trocaram o dono na bateria 1 (L-036fca e L-29d150) não repetiram.
5. **S8 (semelhança → compatibilidade/promessa): 0.** A proteção nova não disparou e a leitura dos 6 blocos de pontos em comum escritos confirma: descrevem sem prometer, e dois trazem a cautela da própria evidência ("não garanta a ausência de tensões", "risco de ambos tomarem o outro por garantido"). **Uma ressalva de fidelidade que a regra não vê:** no M-b87c3d, "Mercúrio no mesmo signo ... lidam com o mundo de forma semelhante, valorizando a lógica e a organização" vai além da evidência (que diz só "fatores pessoais, e podem trazer dificuldades"). É o mesmo defeito do L-ee5f90 e do L-2fa549: **Mercúrio no mesmo signo ganha um viés positivo que a fonte não dá** (três ocorrências em 30 respostas).
6. **Vínculo:** só ênfase. Trabalho ganha trabalho ("no ambiente de trabalho", "colaboração produtiva", "manejo de recursos"), o que não acontecia na bateria 1 (nota de vínculo 2); romântico não sexualizou; família não inventou história familiar (a única menção a "contexto romântico" vem da frase da fonte "fora do romance"); amizade não apagou tensão; "outro" ficou neutro. **O vazamento "amizade firme" sumiu** (0 menções a amizade fora do vínculo amizade; a evidência de não amizade traz "laço firme").
7. **Hard e warnings:** ver acima.

## 3. Padrões novos ou persistentes (observação, sem reabrir nada)

- **Persistente, e é o achado desta bateria:** o fechamento ainda prescreve em cerca de metade das leituras, apesar do contrato explícito. Isso é padrão repetido: a lista de proibições sozinha não basta, e a instrução semântica ajudou, mas não zerou.
- **Possível padrão novo (n pequeno):** `pontos_em_comum` ficou `null` com semelhança disponível em **3 de 9** (M-aa502c, M-582a36, M-587259); nas mesmas entradas da bateria 1 foi 0 de 9 (1 de 18 na bateria toda). Pode ser o efeito da regra de concisão e de não repetição, ou ruído de temperatura 0,7. Vale olhar na próxima rodada.
- **"Duradoura":** aparece em 4 de 10 (cooperação duradoura, relação duradoura e responsável) contra 2 de 20 na bateria 1, quase sempre em cima de Saturno ("continuidade" na evidência). Tratado como fidelidade de geração, como combinado; só observo que subiu.
- Nenhum novo padrão de distorção factual: sem dono trocado, sem promessa de semelhança, sem vazamento de vínculo, sem bastidor.

## 4. Critérios de encerramento

| Critério | Resultado |
|---|---|
| 0 trocas de dono | **atendido** (0 de 10) |
| 0 semelhança → compatibilidade ou promessa | **atendido** na forma que a regra e a leitura enxergam; o viés positivo em "Mercúrio no mesmo signo" é um defeito de fidelidade, não de promessa, e não é pegável por regra |
| Queda clara do padrão prescritivo na síntese final | **parcial**: hard 6 → 2, aviso 9 → 6, fechamentos claramente prescritivos 5 de 10 (antes 9 de 10 marcados pelo avaliador); ainda há padrão repetido |
| Nenhum padrão novo causado pelo novo prompt | **quase**: nenhum factual; um sinal fraco em `pontos_em_comum` `null` |

Pela sua regra ("só reabrir se houver padrão repetido ou falha factual"), **o fechamento prescritivo da síntese final reabre o contrato do prompt**, e só ele. Opções para a decisão, nenhuma tomada: (a) reforçar o contrato com um exemplo de fechamento correto e um de fechamento errado; (b) dar ao modelo a forma obrigatória de duas frases (o que converge, o que fica em aberto) para a síntese final; (c) tratar o aviso de fechamento como hard fail, que já existe pronto e custaria uma linha; (d) aceitar o resíduo e medir de novo.
