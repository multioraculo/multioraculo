# Tarô: as cartas invertidas estão produzindo negatividade sem fundamento?

Auditoria de 25/10/2026. Zero chamadas pagas à IA: tudo abaixo sai de código
determinístico, da fonte indexada e das 14 sínteses pagas de 24/10 que já
estavam gravadas. Nenhum sorteio novo. Nenhum arquivo de produção alterado.

**Veredito curto.** Existe negatividade sem fundamento, e ela é grande: nas 14
tiragens congeladas, **70 de 70 cartas invertidas chegam à leitura individual do
Tarô sem uma única linha de referência sobre o que inversão significa.** Mas a
causa não é a inversão: é um remendo que foi aplicado na síntese e na tiragem do
dia e **não** foi aplicado na leitura individual. E remover as inversões seria o
conserto errado para esta fonte — no Ben-Dov, a dimensão difícil de 40 das 78
cartas mora **só** na reversão. Tirar as inversões não devolveria um Tarô fiel;
devolveria um Tarô sem sombra.

---

## 1. Como as inversões funcionam hoje

### O sorteio

`drawTarot`, em `lib/oracles/draw.ts:246`:

```ts
const order = rng.shuffle(TAROT_DECK.map((_, i) => i))   // 78 cartas, sem reposição
for (let i = 0; i < CELTIC_CROSS_COUNT; i++) {
  const card = order[i]
  const reversed = rng.bool()                             // 50% chapado, igual para as 78
  ...
}
```

Medido em 5.000 tiragens (50.000 cartas):

| invertidas na tiragem | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| % das tiragens | 0,2 | 0,8 | 4,5 | 11,8 | 20,1 | **24,7** | 21,5 | 11,5 | 3,9 | 0,8 | 0,2 |

Média 4,99 invertidas por tiragem de 10. Taxa por carta entre 44,8% e 55,4%:
**nenhuma carta é tratada de modo diferente** — não há lista negra nem peso por
arcano. É binomial(10; 0,5) e nada mais.

Compare com as Runas, que vieram depois e têm outra regra: `draw.ts:575` cruza
`RUNES[i].reversible` com `reversaoNaFonte`, e 9 das 24 runas **nunca** saem
invertidas porque a fonte declara que elas não têm posição invertida. O Tarô não
tem esse filtro, e precisa de um: a fonte diz "Similar." para 16 das 78 cartas.

### Onde a orientação entra na interpretação

Três consumidores, três tratamentos diferentes:

| | ficha de reversão por carta | regra geral da fonte | resultado |
|---|---|---|---|
| Tiragem do dia (`prompt-tiragem-dia.ts:148`) | sim | sim, e diz "Inversão não é 'versão negativa'" | correto |
| Síntese dos cinco (`references.ts:236,253`) | sim | sim | correto |
| **Leitura individual do Tarô** (`app/consultas/route.ts:325`) | **não** | **não** | o modelo preenche |

A leitura individual recebe `getEvidenceForOracle(...)` e nada mais. Isso é busca
lexical em `jung_tarot.pdf` — um ensaio sobre os Arcanos Maiores que **não
menciona inversão uma única vez**. O método passado no prompt é a string
`"Cruz Celta (10 posições) com leitura arquetípica"`, sem nenhuma cláusula sobre
orientação.

O arquivo `lib/oracles/tarot-referencia.ts` descreve esse problema no próprio
cabeçalho, com os números de uma auditoria de 40 leituras — e a correção que ele
construiu foi ligada só em `buildCBaseMinMaterial`. `referenciaDoTarot` **nunca é
chamada** em `app/consultas/route.ts`.

### O que a orientação faz, então, na leitura individual

Exatamente uma coisa: acrescenta a palavra "invertida" ao nome da carta.

A seleção de trechos casa por `searchTerms`, que para o Tarô são nomes de carta
sem orientação (`evidence.ts`). Então a inversão **não muda nenhum trecho de
referência** — só o rótulo. Nas 14 tiragens:

| id | seed | invertidas | cartas com algum trecho | trechos que falam de inversão |
|---|---|---|---|---|
| 1 | fase10:216 | 3 | 2/10 | 0 |
| 2 | fase10:26 | 4 | 3/10 | 0 |
| 3 | fase10:31 | 6 | 2/10 | 0 |
| 4 | fase10:11 | 6 | 3/10 | 0 |
| 5 | fase10:65 | 3 | 1/10 | 0 |
| 6 | fase10:10 | 6 | 4/10 | 0 |
| 7 | fase10:20 | 7 | 3/10 | 0 |
| 8 | fase10:256 | 7 | 3/10 | 0 |
| 9 | fase10:594 | 9 | 4/10 | 0 |
| 10 | fase10:37 | 2 | 3/10 | 0 |
| 11 | fase10:2 | 4 | 3/10 | 0 |
| 12 | fase10:52 | 3 | 3/10 | 0 |
| 13 | fase10:306 | 2 | 0/10 | 0 |
| 14 | fase10:15 | 8 | 3/10 | 0 |

Cobertura lexical média: **2,6 de 10 cartas**. Invertidas com algum suporte
textual sobre inversão: **0 de 70**.

---

## 2. Existe viés negativo? Onde ele está

Três perguntas distintas, três respostas distintas.

### 2a. O código aplica alguma fórmula do tipo "invertida = ruim"?

**Não.** `trechoDaCarta` entrega a reversão que o livro dá para aquela carta, e
para as 16 em que a fonte diz "Similar." entrega a frase "a fonte diz que
invertida o sentido permanece semelhante". Em 15 das 62 reversões próprias o
texto da fonte não traz nenhum termo de advertência. Nada no código classifica,
pontua ou escurece orientação.

### 2b. A própria fonte é assimétrica?

**Sim, e muito.** Medida sem lexicon nenhum, só contando a diferença de
vocabulário entre os dois campos das 78 fichas:

| palavra | base | reversão | | palavra | base | reversão |
|---|---|---|---|---|---|---|
| dificuldade | 0 | **12** | | novo | **9** | 0 |
| falta | 0 | **9** | | avançar | **7** | 0 |
| perder | 1 | **9** | | sucesso | **5** | 0 |
| problemas | 0 | **5** | | abundância | **4** | 0 |
| confusão | 0 | **4** | | crescimento | **4** | 0 |
| preocupação | 0 | **4** | | espiritual | **4** | 0 |

E isso com a reversão sendo **mais curta**: 714 palavras de conteúdo em 62
cartas contra 1.149 em 78.

Como esse lexicon saiu da própria assimetria, ele não pode servir de prova dela.
A medida independente é morfológica — marcas de privação, excesso e dano
(`falta de`, `sem X`, `in-/im-`, `dificuldade em`, `excessiv-`, `repress-`,
`perder`, `falha`), padrões de formação de palavra e não lista de sentimentos:

| | marcas | chars | por mil chars |
|---|---|---|---|
| base, 78 cartas | 5 | 13.350 | 0,37 |
| reversão, 62 cartas | 58 | 8.503 | **6,82** |

**A reversão concentra 18,2× mais marcas por caractere que a base.** Cartas cuja
base tem alguma marca: 4 de 78. Cartas cuja reversão tem: 43 de 62.

### 2c. Então a negatividade das invertidas é fundamentada?

**Na síntese, sim. Na leitura individual, não — por construção.**

Na síntese cada invertida chega com o texto da fonte, atribuído e paginado: se o
texto pesa, pesa porque Ben-Dov escreveu aquilo. Na leitura individual chega a
palavra "invertida" e mais nada. Tudo o que o modelo diz sobre a inversão ali é
invenção dele, não da tradição — e o senso comum disponível é "invertida = versão
ruim da carta".

O caso pior é mensurável: **18 das 70 invertidas** nas 14 tiragens são cartas em
que a fonte diz **"Similar."** — a inversão não muda nada. Na leitura individual
o modelo é informado de que a carta está invertida e não tem como saber disso.
Em 26% das invertidas, o rótulo é ativamente enganoso.

**Exemplo concreto, seed `fase10:306`** ("Devo publicar meu aplicativo na loja
ainda este mês ou esperar o próximo?"):

```
10. Resultado final: Dez de Paus invertida
```

Dez de Paus no Ben-Dov:

- base: *"Lealdade. Uma parceria ou aliança vence dificuldades, conseguindo
  superá-las. Intenções puras e perseverança levam ao sucesso. Honrar os
  princípios, apesar de todas as dificuldades."*
- invertida: **"Similar."**

A carta de Resultado Final dessa tiragem é, na fonte, perseverança que vence
dificuldade e leva ao sucesso, e a inversão não altera isso. A leitura individual
viu "Dez de Paus invertida", zero referência, na casa do desfecho.

*(Este seed é o caso sintético que criei em 24/10 com a sua pergunta, não a
leitura real de produção — essa tinha outro sorteio, I Ching 44→58. Não tenho o
seed dela.)*

---

## 3. Comparação concreta: as mesmas tiragens com e sem inversão

Mesmas 10 cartas, mesmas posições, mesma pergunta. B derruba só a flag
`reversed` dos mesmos itens — nenhum sorteio novo, nenhum arquivo de produção
tocado.

### Na leitura individual

A diferença entre A e B é **a palavra "invertida", de 2 a 20 vezes por prompt**,
e nada mais. Nenhum trecho muda. É um A/B degenerado: a variável em teste não
tem suporte textual de nenhum lado.

### Na síntese

| id | inv | (similar/própria) | neg A | neg B | pos A | pos B | chars A | chars B |
|---|---|---|---|---|---|---|---|---|
| 1 | 3 | 1/2 | 4 | 1 | 6 | 5 | 1.993 | 1.660 |
| 2 | 4 | 2/2 | 5 | 2 | 10 | 10 | 2.134 | 1.844 |
| 3 | 6 | 2/4 | 6 | 1 | 4 | 4 | 2.368 | 1.758 |
| 4 | 6 | 2/4 | 8 | 3 | 6 | 6 | 1.997 | 1.475 |
| 5 | 3 | 0/3 | 5 | 3 | 5 | 5 | 2.023 | 1.781 |
| 6 | 6 | 1/5 | 9 | 1 | 9 | 8 | 2.378 | 1.706 |
| 7 | 7 | 2/5 | 7 | 1 | 8 | 8 | 2.436 | 1.758 |
| 8 | 7 | 2/5 | 9 | 2 | 6 | 5 | 2.487 | 1.924 |
| 9 | 9 | 4/5 | 13 | 4 | 13 | 13 | 2.513 | 1.814 |
| 10 | 2 | 0/2 | 3 | 1 | 5 | 5 | 1.863 | 1.667 |
| 11 | 4 | 0/4 | 9 | 4 | 9 | 9 | 2.224 | 1.714 |
| 12 | 3 | 0/3 | 6 | 1 | 6 | 8 | 2.061 | 1.900 |
| 13 | 2 | 1/1 | 4 | 3 | 7 | 7 | 1.779 | 1.545 |
| 14 | 8 | 1/7 | 5 | 1 | 11 | 12 | 2.402 | 1.586 |
| **soma** | **70** | **18/52** | **93** | **28** | **105** | **105** | **30.658** | **24.132** |

- **65 dos 93 termos de advertência (70%) entram no material do Tarô só pela
  orientação.** Razão neg/pos: 0,89 → 0,27.
- Os termos favoráveis ficam em 105 nos dois lados. Em dois casos B tem **mais**
  (12: 6→8; 14: 11→12): quando há reversão, o orçamento de 320 caracteres é
  repartido e **parte da base é cortada**. A inversão não só acrescenta
  advertência: ela desloca sentido favorável que já estava lá.
- O material do Tarô encolhe 21% sem as reversões.

---

## 4. A influência na síntese, medida na saída que já existe

Nas 14 sínteses pagas de 24/10, contei quantos termos **exclusivos** da reversão
e quantos **exclusivos** da base reaparecem no texto final:

| | termos disponíveis | reapareceram | taxa |
|---|---|---|---|
| exclusivos da reversão | 417 | 29 | **7,0%** |
| exclusivos da base | 1.564 | 145 | **9,3%** |

**A síntese não está super-pesando as invertidas.** Ela usa o texto de reversão
um pouco *menos* que o da base, por termo disponível. Nos casos 7 (7 invertidas),
10, 13 e 14 (8 invertidas) o texto final não puxou **nenhum** termo exclusivo de
reversão.

E há um fato de arquitetura que corrige a hipótese do briefing:
`buildCBaseMinMaterial(question, seed, locale)` recebe pergunta e seed, refaz o
sorteio e lê as referências. **A síntese nunca lê a leitura individual do Tarô.**
Nenhuma interpretação entra. Então o texto negativo do Tarô individual não é
amplificado pela síntese — ele não chega lá. O que a pessoa sente como excesso
vem de duas fontes independentes que ela lê na mesma página.

### Peso de cada oráculo no material da síntese (14 seeds)

| oráculo | teto | vagas usadas | % das vagas | % dos chars |
|---|---|---|---|---|
| tarot | 16 | 177 | 33,5% | **34,0%** |
| runas | 10 | 140 | 26,5% | 28,2% |
| lenormand | 10 | 138 | 26,1% | 27,1% |
| iching | 10 | 48 | 9,1% | **6,7%** |
| buzios | 10 | 26 | 4,9% | **3,9%** |

O Tarô ocupa um terço do material. O teto de 16 tem justificação escrita em
`synthesis-cbase-min.ts:60` — é o único oráculo com 10 itens sorteados. Mas o
efeito é que o I Ching, cujo Julgamento é a fórmula de veredito do Yijing, entra
com 6,7%, e os búzios com 3,9%. **Isso é da outra frente; aqui fica só medido.**

Sem as inversões o Tarô cairia de 34,0% para 30,4% — não é por aí que se
reequilibra.

---

## 5. A tradição, e por que remover as inversões é o conserto errado AQUI

Ler Marselha só com cartas de pé é legítimo. O problema é específico desta fonte.

Ben-Dov organiza cada carta em dois campos: a base, onde ele põe os sentidos
**construtivos e abertos**, e a reversão, onde ele põe a **sombra**. Medido pela
régua morfológica:

- cartas em que a dimensão difícil aparece **só na reversão**: **40 de 78**
- cartas em que a base já a carrega: **3 de 78**

Veja o que acontece com as cartas que você nomeou:

| carta | base (de pé) | marcas: base / reversão |
|---|---|---|
| A Torre | *"Romper estruturas sólidas. Livrar-se de um confinamento. Progresso repentino após longas preparações. (...) O sucesso está na simplicidade e na modéstia."* | 0 / 6 |
| A Morte | *"O fim de algo cuja hora chegou. Romper influências do passado (...) Desistir do supérfluo e manter apenas o essencial."* | 0 / 6 |
| O Diabo | *"Uma explosão de criatividade. Paradoxos e contradições. Ironia e zombaria de normas comuns."* | 0 / 1 |
| A Lua | *"Emoções profundas (...) Uma experiência diferente da realidade. Ansiar por algo inacessível."* | 0 / 2 |
| Nove de Espadas | *"Coragem. Vencer uma luta contra uma força superior. Intenções puras."* | 0 / 1 |
| Dez de Espadas | *"Exaustão. Uma situação complexa com muitos interesses conflitantes. Uma longa batalha sem um resultado claro."* | 1 / 0 |

A Torre, nesta fonte, **de pé é libertação e progresso repentino**; é a reversão
que traz "Choque. Colapso de projetos ou estruturas confiáveis." Se as inversões
saírem, A Torre deixa de ter dimensão catastrófica — e o mesmo vale para A Morte,
O Diabo e outras 37 cartas.

Você escreveu no briefing: *"Preserve as dimensões difíceis de cartas como A
Torre, A Lua, Cinco de Copas, Dez de Espadas"* e *"Uma tiragem realmente
desfavorável deve continuar sendo interpretada como desfavorável."* **Com esta
fonte, remover as inversões viola as duas coisas.** A versão B não é mais fiel —
é mais positiva, que é exatamente o que você disse não querer.

Uma leitura Marselha sem inversões tira a polaridade da posição, das relações
entre cartas e do contexto. O motor **não tem** nenhuma dessas referências para o
Tarô hoje: não há camada de polaridade por posição nem de relação entre cartas
(o Lenormand tem — `RELACOES_DA_MESA`, 28 pares; o Tarô não). Sem elas, B faria
o modelo inventar a sombra em vez de inventar a inversão. Mesma falha, sinal
trocado.

---

## 6. Consequências técnicas

### Se as inversões fossem removidas (o que eu não recomendo)

Medido, não estimado:

- **O sorteio não muda.** `rng.shuffle` roda antes do laço e nada depois do laço
  consome o rng. Em 500 seeds testados, as **mesmas 10 cartas na mesma ordem**,
  com e sem o `rng.bool()`. E cada oráculo tem fluxo próprio
  (`makeRng("<seed>:tarot")`), então os outros quatro não se mexem.
- **Leituras antigas não mudam retroativamente.** `tarotCardRef` grava
  `reversed` por carta no payload, e `tarot-spread.tsx:174,216` roda a arte a
  partir desse campo. Leitura antiga reabre com as invertidas que teve.
- **A camada de referência fica.** `referenciaDoTarot`, `trechoDaCarta` e
  `REVERSAO_METODO` continuam necessários: para as leituras antigas, para a
  tiragem do dia e para o `verify:tarot`.
- **Quebra o golden.** Os digests `itens` de `scripts/cbase-min.golden.json`
  incluem os nomes renderizados, que perdem a palavra "invertida".
  `verify:synthesis` falha e o `prebuild` para. Esse arquivo é da frente da
  síntese: reaprovação coordenada, nunca edição silenciosa.
- **Nada na UI precisa mudar.** `renderSym` só acrescenta o rótulo quando
  `reversed`; a arte só rotaciona quando `reversed`.

### Buraco de verificação, independente da decisão

Nenhum dos 29 verificadores do `prebuild` cobre a leitura individual: nenhum
importa `app/consultas/route.ts`, `oraclePrompt` ou `SYSTEM_GUIDES`. Foi por isso
que o remendo da reversão pôde ser ligado em dois dos três consumidores e ninguém
notar.

---

## 7. Recomendação

**Não remover as inversões. Corrigir a interpretação delas — que hoje não existe
na leitura individual.**

A menor mudança possível, e ela é pequena porque todas as peças já existem,
já estão escritas e já têm verificador:

1. **`app/consultas/route.ts`, no laço de `interpretAll`:** para `k === "tarot"`,
   passar `[...referenciaDoTarot(draws.tarot.items, locale), ...lexical]` como
   evidência e `` `${meta.method}. ${REVERSAO_METODO[locale]}` `` como método.
   São as duas linhas que `references.ts:236,253` já faz para a síntese.
   Efeito medido no prompt: 2,6 → 10 cartas com referência, e as 70 invertidas
   passam a ter o texto da fonte em vez de nada.
2. **`SYSTEM_GUIDES.tarot`:** trocar `(invertida quando indicado)` por uma linha
   no espírito do `I5` da tiragem do dia — a inversão desloca o peso **nesta**
   carta segundo o material, e quando o material diz que o sentido permanece
   semelhante, dizer isso. A tiragem do dia já tem essa frase pronta e validada.
3. **`drawTarot`:** parar de sortear inversão para as 16 cartas em que a fonte
   diz "Similar.", do mesmo jeito que as Runas já fazem com as 9 sem reversão.
   Isso tira 26% das invertidas enganosas na origem. **Custo:** muda os digests
   `itens` do golden → precisa da frente da síntese.
4. **Verificador novo, `verify:consulta-taro`:** cobrar que a leitura individual
   receba as 10 fichas e a regra de reversão. É o que faltava para o buraco do
   item 6 não se repetir.

Itens 1, 2 e 4 não tocam o sorteio, não mudam nenhum digest, não afetam leitura
salva nenhuma e não mexem nos outros quatro oráculos. O item 3 muda o sorteio e
precisa de coordenação.

### O que ainda falta para decidir com a saída, não só com a entrada

A bateria está escrita e guardada, e **não foi executada**. Ela compara três
versões da mesma tiragem — A (hoje), B (tudo de pé), C (inversões + ficha +
regra, isto é, a recomendação) — nas 14 tiragens congeladas, com a configuração
de produção (gpt-4o-mini, temperature 0,6, max_tokens 1600). O prompt não é
reescrito: é extraído de `app/consultas/route.ts` em tempo de execução, com
guarda de sha256 (`c3f3d2e8…`) que aborta se o arquivo de produção mudar.

42 chamadas, **cerca de US$ 0,04**. Precisa de autorização.

### Riscos interpretativos da própria recomendação

- Dar a ficha de reversão à leitura individual vai fazer o Tarô individual soar
  **mais** carregado em algumas tiragens, não menos: hoje o modelo inventa a
  inversão e às vezes inventa leve. A diferença é que passaria a ser fiel.
  Quem decide se isso é melhor é a bateria, não o argumento.
- A ficha ocupa espaço: na síntese ela já usa 10 das 16 vagas. Na leitura
  individual o prompt sobe de ~7.400 para ~10.700 caracteres (medido). Sem teto
  novo, o trecho do ensaio junguiano continua entrando; com 10 itens, não há
  vaga sobrando se o teto virar 10.
- O item 3 é o único que mexe em sorteio, e tem um efeito colateral justo:
  tiragens novas passam a ter em média 4,0 invertidas em vez de 5,0, porque 16
  cartas deixam de poder sair invertidas.

---

# Parte II — A bateria de saída, executada em 25/10

Autorizada com teto de US$ 0,10. **56 chamadas, US$ 0,0496.** Mesmas 14 perguntas,
mesmos seeds, mesmas cartas, mesmas posições, configuração de produção
(gpt-4o-mini, temperature 0,6, max_tokens 1600, json_object, maxRetries 0).
Nenhum sorteio novo. Produção não foi alterada durante a bateria: o prompt foi
extraído de `app/consultas/route.ts` em tempo de execução com guarda de sha256,
e a correção 2 entrou por substituição de texto no prompt já montado, com
asserção de que casava exatamente uma vez.

## As quatro versões

| | orientação | ficha do Ben-Dov | regra de reversão | guia do sistema |
|---|---|---|---|---|
| A | sorteada | — | — | de hoje |
| B | tudo de pé | — | — | de hoje |
| C | sorteada | sim, **sem rótulo** | sim | correção 2 |
| C2 | sorteada | sim, **com rótulo** | sim | correção 2 |

**Por que existe um C2.** O C da primeira rodada tinha um defeito meu, não de
produção, e a bateria o expôs: `oraclePrompt` rotula cada trecho com `about`
(`Fonte N — sobre "X"`), mas `referenciaDoTarot` preenche `itemIndex`, que é o
campo que a **síntese** usa (`[item N]`). As 10 fichas chegaram anônimas, e a
regra 6 do próprio prompt afirmava ao modelo que cada trecho diz a que símbolo
pertence. C2 corrige só isso. A diferença entre C e C2 é toda a diferença.

## Resultado

### Ancoragem na fonte
Palavras da ficha daquela carta reaparecendo no `meanings[i]` correspondente:

| versão | por carta | contra A |
|---|---|---|
| A | 0,56 | — |
| B | 0,74 | +32% |
| C | 1,11 | +98% |
| **C2** | **3,12** | **+457%** |

### Critério 5 contra critério 2 — a prova de que não é só positividade

A advertência separada em duas: a que a ficha daquela carta sustenta
(dificuldade preservada) e a que não sustenta (advertência inventada). Uma
versão mais positiva teria menos das duas. Uma versão mais fiel tem **mais da
primeira e menos da segunda**.

| versão | dificuldade **com** amparo | advertência **sem** amparo | % com amparo |
|---|---|---|---|
| A | 11 | 130 | 7,8% |
| B | **1** | 63 | **1,6%** |
| C | 30 | 113 | 21,0% |
| **C2** | **59** | **69** | **46,1%** |

- **C2 tem 5,4× mais dificuldade fundamentada que A** e 47% menos advertência
  inventada. Não ficou mais positiva: ficou difícil onde a fonte é difícil.
- **B é a pior em fidelidade de todas**: 1 termo de dificuldade com amparo em
  140 cartas. B não leu o baralho de pé — apagou a sombra, exatamente como a
  estrutura da fonte (Parte I, seção 5) previa. B é mais positiva e menos fiel.

### Inversões "Similar." (18 das 70)

| versão | tratadas com advertência que a base não tem |
|---|---|
| A | 16 de 18 (89%) |
| B | 6 de 18 (33%) — trivial: não há inversão para errar |
| C | 17 de 18 (94%) |
| **C2** | **11 de 18 (61%)** |

Lido caso a caso, e não pela régua: **C2 acerta 9 das 18 de forma clara**,
melhora 3 parcialmente e **falha em 6**. A acertava praticamente nenhuma.

### Critério 4 — resposta à pergunta

Eco de palavras de conteúdo da pergunta no campo `reading`: A 31,3%, B 21,9%,
C 25,0%, **C2 31,3%**. C2 não perde a pergunta; B e C perdem.

## O caso que originou tudo

`fase10:306`, "Devo publicar meu aplicativo na loja ainda este mês ou esperar o
próximo?". Posição 10, **Resultado final**: Dez de Paus invertida. Na fonte,
base = *"Lealdade. Uma parceria ou aliança vence dificuldades, conseguindo
superá-las. Intenções puras e perseverança levam ao sucesso."*, invertida =
**"Similar."**

> **A:** *"o resultado final do Dez de Paus invertido sugere que a pressa pode
> levar a um acúmulo de estresse, indicando que pode ser mais sábio avaliar se
> você está realmente preparado antes de publicar."*

> **C2:** *"o resultado final com o Dez de Paus invertido sugere que, se você não
> agir de maneira decidida, pode enfrentar dificuldades, mas a lealdade e a
> perseverança podem levar ao sucesso, mesmo em tempos desafiadores."*

A de A é Rider-Waite (Ten of Wands = sobrecarga) mais prescrição. **Não tem
nenhum amparo na fonte do produto.** A de C2 é o texto do Ben-Dov. O veredito da
casa do desfecho se inverte, e se inverte por fidelidade.

## O que a bateria também revelou, e é maior que a questão da inversão

Nas três versões o modelo lê **Rider-Waite, não o Marselha do Ben-Dov**, com
força nas cartas menores. A ficha corrige mais da metade dos casos e perde nos
que têm prior muito fixo:

| carta | Ben-Dov (base) | o que o modelo escreve, em A e em C2 |
|---|---|---|
| Oito de Ouros | Uniformidade, trabalho de rotina, avanço lento e paciente | "falta de dedicação", "estagnação" |
| Dez de Ouros | Abundância, sucesso material e realizações | "instabilidade financeira e familiar" |
| Dois de Espadas | Limites que protegem, visão clara | "confusão e conflito interno" |
| Nove de Ouros | Motivação, encontrar um nicho, frutos a longo prazo | "insegurança financeira" |
| Seis de Ouros | Expansão, abundância, perspectiva positiva, sucesso | "desequilíbrio nas trocas" |

São os cinco casos em que C2 não melhorou. **Ficha presente, rotulada,
ignorada.** Isso é prior de modelo, não falta de material, e não se resolve com
as correções 1 e 2 — pediria uma instrução dizendo que a ficha é a fonte e que
significados de outro baralho não entram. Fica registrado, não implementado.

## Regressão honesta

Prescrição no campo `reading` ("você deve..."), que a regra 10 do prompt proíbe:
**A tinha 1 em 14 leituras, C2 tem 3**. Casos 1, 6 e 10. Não é causada pela
ficha, mas piorou com ela. Não foi remediada.

## O que foi implementado

Correções **1, 2 e 4**. A 3 não, por decisão sua: o sorteio fica como está, com
50% chapado para as 78 cartas.

| arquivo | mudança |
|---|---|
| `app/consultas/route.ts` | ficha do Ben-Dov com `about` entra na evidência do tarô; método carrega `REVERSAO_METODO`; `SYSTEM_GUIDES.tarot` reescrito |
| `scripts/verify-consulta-taro.ts` | novo, 561 conferências |
| `package.json` | `verify:consulta-taro` no `prebuild`, depois de `verify:tarot` |

**O `about` faz parte da correção 1, não é correção nova.** Sem ele a correção 1
não funciona: é a diferença medida entre C (1,11) e C2 (3,12).

### Prova de que o medido é o implementado

Os 14 prompts que produção monta agora são **idênticos byte a byte** aos 14 que
a variante C2 enviou. Conferido depois da implementação.

### Guarda

As 561 conferências de `verify:consulta-taro` cobrem o dado (ficha nas 10
cartas, reversão rotulada, 70 invertidas e 18 "Similar." nos 14 seeds, em
pt/en/es) e a ligação em `app/consultas/route.ts`. Cinco sabotagens deliberadas
foram aplicadas e **todas as cinco derrubaram o verificador**: remover a ficha
da evidência, remover o `about`, voltar o método para `meta.method`, voltar o
parentético `(invertida quando indicado)` no guia, e mudar o cabeçalho de
`oraclePrompt` de modo a parar de ler o `about`. O arquivo foi restaurado e o
verificador voltou a verde.

### Nada da síntese foi tocado

`verify:synthesis` passa com as mesmas **222 conferências** e os digests `itens`
inalterados: o sorteio, a renderização e a seleção de evidência da síntese estão
intactos. `lib/oracles/synthesis.ts`, `synthesis-cbase-min.ts`,
`cbase-min.golden.json` e `verify-cbase-min.ts` não foram abertos para escrita.
Chain de prebuild 30/30 verde, `next build` completo, typecheck 0 erros.
Nenhuma leitura salva muda. As alterações paralelas do cadastro, dos ícones, dos
dicionários e da jornada de sonhos foram preservadas. Sem commit e sem push.

---

# Parte III — Interferência Rider-Waite, "Similar." e prescrição (25/10)

Rodada de correção dos três defeitos que a Parte II deixou medidos. **Zero
chamadas pagas nesta rodada**: validação dirigida sobre os dados que a bateria
já tinha, mudança de método, e verificador. A bateria curta está escrita e
**não foi executada**.

## O exame dirigido, antes de mexer em nada

### Os seis casos "Similar." que falharam

| caso | posição | carta | ficha (base) | o que C2 escreveu |
|---|---|---|---|---|
| 2 | Situação central | Oito de Ouros inv. | Uniformidade. Trabalho de rotina. Um avanço lento e paciente | "falta de progresso… estagnação… desmotivação" |
| 2 | Resultado final | Dez de Ouros inv. | Abundância. Sucesso material e realizações | "desafios em segurança e estabilidade material" |
| 3 | Futuro próximo | Dois de Espadas inv. | Limites que protegem. Uma visão clara abrangendo a situação | "dificuldades em tomar decisões… conflitos internos" |
| 4 | Futuro próximo | Nove de Ouros inv. | Motivação. Encontrar um nicho. Frutos a longo prazo | "falta de satisfação… não se sentir realizado" |
| 9 | Esperanças ou medos | Seis de Ouros inv. | Expansão. Perspectiva positiva, sucesso. Bom equilíbrio | "mantém a ideia de um desequilíbrio" |
| 14 | Situação central | Seis de Ouros inv. | (idem) | "falta de equilíbrio nas trocas" |

**Todas as seis são cartas invertidas que a fonte marca "Similar."** E a mesma
carta lida DE PÉ é fiel: Oito de Ouros caiu 5 vezes, 1 invertida e 4 de pé, e
nas quatro de pé C2 escreveu "trabalho metódico e paciente", "esforço contínuo,
embora possa parecer repetitivo" — a ficha. Só na invertida virou "falta de
progresso".

### Mas a hipótese estreita estava errada

Eu quase concluí que a causa era só a inversão. Fui ler as cartas DE PÉ em que
os dois baralhos mais divergem, que eu não tinha auditado, e achei:

| caso | carta (de pé) | ficha | C2 |
|---|---|---|---|
| 3 | Cinco de Copas | **Conexões. Popularidade, relações com muitas pessoas** | "tristeza e arrependimento… emoções negativas" |
| 11 | Dez de Paus | Lealdade. Perseverança levam ao sucesso | "uma carga pesada e dificuldades que podem estar pesando" |

Cinco de Copas é falha limpa, com a carta de pé: o modelo escreveu o Five of
Cups do Rider-Waite. Dos 12 aparecimentos de carta divergente de pé que li, 9
fiéis, 1 falha clara, 2 com deriva parcial.

**Conclusão:** a interferência do Rider-Waite é independente da orientação. Ela
só é mais destrutiva nas "Similar." porque ali o modelo não tem material da
fonte para diferenciar e importa o prior inteiro. As duas regras eram
necessárias, como o briefing dizia.

### As três prescrições são forma, não conteúdo inventado

| caso | frase | ficha da carta citada |
|---|---|---|
| 1 | "A Justiça indica que **você deve considerar** as implicações éticas e racionais" | "Julgamento justo e equilibrado… Racionalidade. Argumentar com base em regras claras" |
| 6 | "a Roda da Fortuna… **você deve estar aberto** para se adaptar" | "Mudança nas circunstâncias… **Adaptação** para a rotina da vida cotidiana" |
| 10 | "O Rei de Espadas sugere que **você deve utilizar** sua clareza mental" | "Força de vontade… Sabedoria e maturidade intelectual" |

Nas três, o **conteúdo é sustentado pela ficha** e só a forma é ordem. Não é
conselho inventado: é tendência sustentada dita no imperativo. Então a correção
é de forma, e não pode cortar conteúdo — nem tornar o tarô evasivo.

## O que mudou no método

Três regras no `SYSTEM_GUIDES.tarot`, que é o bloco só do tarô e já era o
arquivo desta frente. **Nada mais foi tocado.** Em particular `REVERSAO_METODO`
não foi alterado, porque ele é compartilhado com a síntese e com a tiragem do
dia.

- **T1 — a ficha desta carta manda, e ela é do Marselha.** Onde a associação de
  outro baralho divergir da ficha, vale a ficha; nome igual não é significado
  igual; não atribuir bloqueio, escassez, perda ou fracasso por associação
  externa — "se o sentido não está na ficha, não está na carta". Nomeia o
  Rider-Waite, porque é de lá que vêm as associações medidas, e cita três
  exemplos medidos. Mantém explicitamente o relacionamento entre cartas e proíbe
  transcrever a ficha.
- **T2 — invertida não é pedido de contraste.** Quando a ficha diz que o sentido
  permanece semelhante, ler o sentido-base e dizer que a inversão não o desloca.
  A carta continua podendo pesar se a base ou o contexto sustentam; a inversão
  sozinha nunca é a razão para acrescentar bloqueio, atraso, escassez ou
  fracasso. "Não invente diferença para justificar o rótulo."
- **T3 — tendência sustentada, não ordem.** Responder o que foi perguntado
  "sem evasão e sem empatar de propósito", como tendência da situação e não como
  instrução. Proíbe as formas que vazaram, "você deve" à frente. Separa
  possibilidade condicional sustentada pelo símbolo de condição acrescentada
  pelo modelo. A regra 10 do prompt comum continua de pé: T3 reforça, não
  substitui.

Custo: o guia do tarô vai de 721 para 2.581 caracteres, e o prompt da leitura de
tarô de ~10.700 para ~13.300 — cerca de +800 tokens de entrada por leitura,
US$ 0,00012.

## Verificadores: 705 conferências, de 561

Duas partes novas em `scripts/verify-consulta-taro.ts`.

**F — a tabela de divergência.** 15 cartas em que o Marselha do Ben-Dov e o
Rider-Waite divergem de verdade, as 6 medidas falhando entre elas, 8 delas
"Similar.". Para cada uma: a ficha existe, contém as palavras do Marselha, e
esse sentido **sobrevive ao orçamento do trecho nas duas orientações** — é o
texto que chega ao modelo, não o campo bruto. Nas "Similar.", o trecho tem de
trazer base e a frase de semelhança juntas.

A coluna `riderWaite` da tabela é **documentação da divergência e não é testada
contra nada**. Nenhuma lista de palavras negativas entra: a fidelidade é afirmada
pelo que tem de estar presente, nunca pelo que não pode aparecer.

**G — as três regras.** Cobra T1, T2 e T3 no prompt, item por item, incluindo que
T3 não torne o tarô evasivo e que a lista de formas de ordem não perca itens. E
cobra que **os exemplos que T1 cita continuem verdadeiros**: se alguém editar a
ficha de Cinco de Copas, o exemplo do prompt passa a mentir para o modelo, e
isso cai aqui.

### O que estes testes NÃO detectam

Eles garantem que o sentido do Marselha chega ao modelo e que as regras estão no
prompt. **Não conseguem detectar o modelo ignorando a ficha** — para isso é
preciso saída de modelo, ou seja, bateria paga. Dito claramente para não haver
ilusão de cobertura.

### A guarda cai

Nove sabotagens deliberadas, **todas as nove derrubaram o verificador**: apagar
T1, T2 ou T3; tirar o Rider-Waite de T1; tirar de T2 a preservação da
dificuldade; tirar o "sem evasão" de T3; remover uma forma da lista de ordens;
tornar falso o exemplo de Cinco de Copas; e apertar `TETO_DO_TRECHO` de 320 para
40, que fez 44 conferências de F caírem ao comer o sentido do Marselha. Arquivos
restaurados, verificador verde.

### Uma correção de número, dita porque mudou uma expectativa

Eu escrevi na tabela de divergência que 7 das 15 cartas eram "Similar.", e o
verificador reprovou: são **8**. Conferi contando as fichas antes de corrigir —
Oito de Ouros, Dez de Ouros, Seis de Ouros, Nove de Ouros, Dois de Espadas, Dez
de Paus, Cinco de Ouros e Oito de Espadas. A expectativa foi corrigida para o
número medido, não para o número que aprovava.

## Estado

`verify:consulta-taro` 705 conferências · `verify:synthesis` as mesmas 222, com
os digests `itens` inalterados · `verify:tarot` 183 · typecheck 0 erros ·
prebuild 31/31 · `next build` completo.

Sorteio e inversões como estavam. Nenhuma leitura salva muda. Nada da síntese
aberto para escrita. As frentes paralelas preservadas. Sem commit, sem push.

Houve um acidente de processo que precisou de conserto: o script de sabotagem
reescreveu `app/consultas/route.ts` com quebras CRLF, o que inflou o diff para
789/751 linhas. Convertido de volta para LF; o diff voltou a ser de **42 linhas**
e `lib/oracles/tarot-referencia.ts` ficou idêntico ao HEAD.

## Bateria curta proposta, não executada

Nove tiragens — os 6 casos "Similar.", os 2 de Rider-Waite com carta de pé e os
3 de prescrição, nos seeds 1, 2, 3, 4, 6, 9, 10, 11 e 14 — com o prompt de
produção já com T1/T2/T3. Mesmos seeds, mesmas cartas, configuração de produção,
nenhum sorteio novo.

**9 chamadas, ~4.000 tokens de entrada cada, estimativa US$ 0,011, teto US$ 0,03.**

O que ela decide, e que nenhum verificador decide:

1. se Oito/Dez/Seis/Nove de Ouros e Dois de Espadas invertidas passam a ser
   lidas pelo sentido-base, com T2;
2. se Cinco de Copas de pé deixa de ser luto, com T1;
3. se as três prescrições viram tendência sem o tarô ficar evasivo — e aqui a
   régua tem de olhar as duas coisas, porque "sem prescrição" é fácil de obter
   fugindo da pergunta, e isso seria uma piora.

---

# Parte IV — A bateria curta de T1/T2/T3 (25/10)

9 chamadas, **US$ 0,0097**, teto US$ 0,03. Total pago em toda a frente:
US$ 0,0593. Mesmos 9 seeds, mesmas cartas, mesmas posições, configuração de
produção, nenhum sorteio novo, nenhum caso adaptado. A variante é chamada **D**.

Antes de rodar, um conserto necessário: o módulo que extrai o prompt de
produção tinha sido gerado da versão CRLF do `route.ts`, e carregava 105
sequências `\r\n` dentro do template. Teria medido um prompt com bytes
diferentes do de produção. Regerado da versão LF antes da primeira chamada.

## Critério por critério

| critério | C2 | D |
|---|---|---|
| 1 · ancoragem na base da ficha | 1,31 palavras/carta | **3,10** |
| 4 · formas de ordem no `reading` | 3 | **4** |
| 5 · eco da pergunta | 32,6% | **39,5%** |
| novo · `meanings` copiando a ficha (≥8 palavras seguidas) | 1 de 90 | **11 de 90** |

(a ancoragem de C2 aqui é 1,31 e não 2,77 porque estes 9 casos são justamente
os que falhavam)

## 1 · Fidelidade ao Marselha — melhorou, e o caso principal foi corrigido

**Cinco de Copas, de pé, caso 3** — era a falha mais limpa de Rider-Waite:

> ficha: *"Conexões. Popularidade, relações com muitas pessoas."*
> **C2:** "A carta indica **tristeza e arrependimento**, sugerindo que as emoções negativas podem estar ofuscando as oportunidades do seu projeto."
> **D:** "Cinco de Copas: **Conexões e popularidade.** A carta indica a importância das relações e como elas influenciam a situação atual."

**Dois de Espadas invertida, caso 3** — corrigida, e com T2 explícito no texto:

> ficha: *"Limites. Limites que protegem e definem algo que está em desenvolvimento."* · reversão **"Similar."**
> **C2:** "revela **dificuldades em tomar decisões** e a necessidade de enfrentar conflitos internos"
> **D:** "**Limites que definem algo em desenvolvimento. A inversão mantém a ideia de proteção**, mas pode indicar confusão."

**Dez de Ouros invertida, caso 2** — conteúdo agora é o da ficha:

> ficha: *"Abundância. Sucesso material e realizações. Alguns podem estar recebendo mais que outros."* · **"Similar."**
> **C2:** "desafios em questões de segurança e estabilidade material… problemas em manter a harmonia familiar"
> **D:** "apesar de haver potencial para **sucesso material e realizações**, a inversão indica que pode haver **desigualdades**… no contexto familiar"

**Oito de Ouros invertida, caso 2** — melhorou pela metade:

> ficha: *"Uniformidade. Estrutura mecânica… Trabalho de rotina. Um avanço lento e paciente."*
> **C2:** "falta de progresso e uma sensação de estagnação… desmotivação"
> **D:** "a falta de progresso e a **repetição de padrões**… preso em uma **rotina** que não traz satisfação… dificuldade em encontrar um sentido mais profundo no trabalho"

"rotina" e "repetição de padrões" são da ficha, e "não traz satisfação" traduz
"carecem de um toque humano". Mas ainda abre com "falta de progresso", que
contradiz "um avanço lento e paciente". **Parcial.**

**Duas não foram corrigidas:**

- **Seis de Ouros invertida, caso 14**: D diz "falta de equilíbrio nas trocas e
  nas relações de ajuda, a generosidade pode não ser recíproca" — isto é o Six
  of Pentacles do Rider-Waite, e a ficha diz "Expansão. Abundância de recursos.
  Uma perspectiva positiva, sucesso. Um bom equilíbrio". Igual a C2.
- **Dez de Paus de pé, caso 11**: D ainda abre com "dificuldades externas que
  podem estar pesando", o fardo do Rider-Waite, em vez de "uma parceria ou
  aliança vence dificuldades".

Placar das 8 cartas-alvo: **4 corrigidas, 2 parciais, 2 inalteradas.**

## 2 · Inversões "Similar." — 4 de 6 melhoraram

Duas passaram a dizer explicitamente que a inversão não desloca o sentido
(Dois de Espadas; Seis de Ouros do caso 9). Duas melhoraram o conteúdo mas
ainda atribuem a dificuldade *à inversão* quando a fonte diz que ela não muda
nada — o conteúdo virou o da ficha, só a atribuição ficou errada. Uma ficou
igual (caso 14). Nos controles, as "Similar." que C2 já acertava continuaram
certas: Quatro de Paus ficou melhor ("paralisação ou uma **pausa temporária**…
tensões que podem impedir avanços **no momento**", que é a ficha inteira).

## 3 · Dificuldade fundamentada — preservada, e melhor aplicada

| carta | D |
|---|---|
| Dez de Espadas, de pé | "exaustão provocada por conflitos familiares complexos… muitos interesses em jogo… como se a luta não tivesse trazido uma resolução clara" |
| A Torre, de pé | "romper com estruturas que já não servem… transformação abrupta que pode ser libertadora, mas também desestabilizadora" |

Nenhuma suavização. Nos dois casos D aplica a ficha à pergunta melhor que C2,
que ficara mais genérico. **Critério 3 aprovado.**

## 4 · Prescrição — falhou, e concentrada em um caso

| caso | C2 | D |
|---|---|---|
| 1 | "A Justiça indica que **você deve considerar**…" | **limpo** |
| 6 | "…**você deve estar aberto** para se adaptar" | **limpo**, e o conteúdo sobreviveu: "mudanças significativas estão a caminho, **dependendo de como você se adapta**" — possibilidade condicional sustentada, que é exatamente o que T3 pedia |
| 10 | 1 ocorrência | **4 ocorrências** |

Dois dos três casos foram limpos, e o caso 6 virou o exemplo do que T3 queria.
O caso 10 piorou de 1 para 4: *"você deve usar sua determinação"*, *"você deve
estar atento a ideias fixas"*, *"você deve estar preparado para se adaptar"*,
*"desde que mantenha o foco e a disciplina"*. A pergunta dele é
**"O que preciso considerar?"** — formulada como pedido de conselho, e é ali que
a regra cede. Nos outros 8 casos: zero.

## 5 · Resposta direta — melhorou, não ficou evasivo

Eco da pergunta 32,6% → 39,5%. Nenhuma leitura ficou em cima do muro nem
artificialmente equilibrada. **Critério 5 aprovado.**

## O defeito novo: transcrição literal da ficha

| caso | invertidas | cartas cujo `meanings` copia ≥8 palavras seguidas da ficha | maior trecho |
|---|---|---|---|
| 1, 2, 3, 4, 6, 11, 14 | 3 a 8 | **0** | 4 a 7 palavras |
| 10 | 2 | 1 | 8 palavras |
| **9** | **9** | **10 de 10** | **26 palavras seguidas** |

Não é regressão geral: é uma **falha no extremo da densidade de inversão**. No
caso 9, com 9 das 10 cartas invertidas, o campo `meanings` virou cópia da fonte
nas dez posições — e `meanings` é o que a pessoa lê em cada carta na tela
(`components/tarot-spread.tsx:228`). O campo `reading` do mesmo caso está bom:
aplica as cartas à pergunta normalmente. É só a legenda por carta que colapsou.

Dois agravantes: a cópia perde a informação de orientação (nas cartas com
reversão própria ela dumpou o texto da reversão sem dizer que era reversão), e é
reprodução literal de um livro protegido no texto que a pessoa recebe. A regra 4
do prompt comum já manda "reescreva com sua voz" e foi violada.

Pela distribuição de inversões medida na Parte I, 9 ou 10 invertidas ocorrem em
**cerca de 1% das tiragens**. C2 já tinha 1 ocorrência neste mesmo caso 9, então
o caso era frágil antes; T1 e T2 o empurraram para o colapso ao encher o prompt
de ficha.

## Veredito

**A frente de fidelidade pode ser encerrada.** O Tarô passou a interpretar o
Marselha: ancoragem na fonte 0,56 → 3,10 palavras por carta desde o começo da
frente, a falha mais clara de Rider-Waite corrigida, as "Similar." majoritariamente
corrigidas, a dificuldade fundamentada preservada e a resposta à pergunta mais
direta, não mais evasiva.

**Há um defeito que eu considero bloqueador**, e não é de fidelidade: a
transcrição literal no `meanings`, em ~1% das tiragens, entrega texto cru da
fonte como se fosse interpretação e perde a orientação da carta.

**Não é bloqueador**, na minha leitura: a prescrição residual. São 4 ocorrências
em uma leitura, cuja pergunta pede conselho, e nas outras oito não há nenhuma —
contra 1 em 14 antes de toda esta frente começar. E as duas cartas que ainda
leem Rider-Waite (Seis de Ouros, Dez de Paus) são 2 em 90.

## As correções estritamente necessárias, identificadas e não aplicadas

**C1 — proibir a transcrição, em frase própria.** Hoje "transcrever a ficha,
não" é uma oração subordinada no fim de T1, e não resistiu. A tiragem do dia já
tem a versão validada disto, em `prompt-tiragem-dia.ts:147`: *"reescreva com as
suas palavras, no idioma pedido. Não copie listas, não cite autor, não
transcreva."* Promover isso a regra própria no guia do tarô, dizendo que vale
para `meanings` carta por carta e que o `meanings` é a leitura daquela carta
NAQUELA posição e não a ficha dela. Uma frase.

**C2 — dizer a qual campo T3 se aplica, e nomear a armadilha.** As quatro ordens
do caso 10 estão no `reading`. Acrescentar que a proibição vale para `meanings` e
`reading`, e que pergunta formulada como "o que preciso considerar" se responde
nomeando o que pesa, não dizendo à pessoa que considere. Uma frase.

As duas são texto de prompt, sem código, sem efeito em sorteio, golden, síntese
ou leitura salva. Verificar se funcionam exige bateria paga; não há mais chamada
autorizada, e nenhuma foi feita além das nove.

---

# Parte V — C1, C2 e a proteção contra reprodução literal (25/10)

Zero chamadas pagas. Nada além das nove autorizadas na Parte IV foi gasto.

## O que já existia (inspeção pedida)

Nada protegia contra cópia da referência:

- `validateEvidence` (`app/consultas/route.ts:126`) faz o **oposto**: exige que
  cada citação do campo `evidence` **seja** uma cópia literal dos trechos
  fornecidos, e descarta a que não for. É um detector de invenção, não de cópia.
- A regra 4 do prompt comum já dizia *"Seja fiel ao sentido, mas reescreva com
  sua voz"* — e foi violada: existia, e foi ignorada.
- Nenhum dos 31 verificadores olhava `meanings`. Busca por `meanings` em
  `scripts/*.ts`: zero.

A tiragem do dia tem a versão explícita (`prompt-tiragem-dia.ts:147`), mas é
outro prompt e não alcança esta rota.

## C1 e C2 — implementadas no prompt

Duas adições ao `SYSTEM_GUIDES.tarot`, preservando T1, T2 e T3 intactos.

**T1b** (nova regra própria, porque "transcrever a ficha, não" como oração
subordinada de T1 não resistiu): cada `meanings[i]` é a interpretação daquela
carta **naquela posição** e em relação à pergunta, com as palavras do modelo;
fiel ao sentido, sem copiar trechos extensos, sem enfileirar as frases da ficha,
sem citar autor ou título. Preserva explicitamente o uso do termo próprio da
tradição — que a regra 9 manda usar — e avisa que a cópia será descartada.

**T3, duas frases acrescentadas**: a proibição de ordem vale em `meanings` **e**
em `reading`, nos dois, e a armadilha é nomeada — pergunta que já vem como
pedido de conselho ("o que preciso considerar", "o que devo fazer") se responde
**nomeando os fatores que pesam**, não dizendo à pessoa que os considere.

## A proteção objetiva: `lib/oracles/transcricao.ts`

Módulo puro, novo, sem rede e sem estado. Mede **quanto** de um texto é cópia,
não se há cópia — porque a regra 9 do prompt manda usar o termo próprio da
tradição, e a leitura ideal de A Torre é *"a ruptura de estruturas sólidas e um
progresso repentino após longas preparações"*, que empresta da ficha de
propósito.

`medeCopia(texto, fonte)` marca cada palavra que pertence a uma sequência de ≥5
palavras literal na fonte e devolve a fração marcada. `eTranscricao` acusa acima
de 40% de cobertura, e nunca acusa texto com menos de 8 palavras.

### O limiar é medido, não escolhido

370 `meanings` de tarô já produzidos (A, C2 e D das baterias de 24 e 25/10):

| cobertura | amostras | o que são |
|---|---|---|
| 0% | 336 | nenhuma sequência de 5 palavras em comum |
| 1–20% | 4 | |
| 20–40% | 17 | **interpretação fiel** que empresta o termo da tradição |
| 40–60% | 3 | cópia com o nome da carta na frente |
| 60–80% | **0** | ← a fronteira é vazia |
| 80–100% | 10 | o despejo da ficha |

Lidas uma a uma: as 13 acima de 40% são cópia; nenhuma abaixo é. A faixa 20–40%
é exatamente o que se quer manter — *"A Torre representa a ruptura de estruturas
sólidas e um progresso repentino após longas preparações"* (33%),
*"Cinco de Espadas invertida: Um impulso para frente que supera limites. A
inversão pode indicar..."* (26%). E não há nada entre 60% e 80%, então o corte
não cai em cima de um aglomerado.

### O tratamento: descarte por carta, leitura preservada

Em `app/consultas/route.ts`, só para `k === "tarot"`, depois do parsing: se o
`meanings[i]` for transcrição, ele vira `undefined` e o nome da carta vai para
um log de servidor. O que isso **não** faz:

- **não dispara chamada nova.** O detector não entra em `isUsable`, que é o que
  governa a segunda tentativa paga. O verificador cobra isso explicitamente, e a
  sabotagem que liga os dois derruba a conferência.
- **não descarta a leitura.** O descarte é por carta; o campo `reading`
  sobrevive intacto — e na tiragem que motivou tudo isto ele estava correto.
- **não inventa nada** para ocupar o lugar. A carta fica sem legenda, estado que
  a interface já tratava antes desta mudança: `FocusCard` lê
  `item.meaning?.trim()` e mostra o texto de ausência do dicionário.

A fonte comparável é a base da ficha mais a reversão **só** quando a carta saiu
invertida e a fonte dá reversão própria. Quando a fonte diz "Similar.", o que
vai no trecho é uma frase nossa dizendo que o sentido permanece semelhante, e o
prompt quer que o modelo a repasse — ela não pode contar como texto a evitar.

### O detector contra as 370 saídas reais

| variante | descartados |
|---|---|
| A (140 cartas) | **0** |
| C2 (140 cartas) | 1 — Rainha de Copas, caso 13, 42%, que é cópia |
| D (90 cartas) | 12 — as 10 do caso 9 (100% cada) e 2 do caso 10 (58% e 47%) |

Zero falso positivo em 370. No caso 9, as dez cartas perderiam a legenda e a
leitura narrativa sobreviveria inteira. Nas outras oito tiragens de D: 2 de 80.

## Verificações

| verificação | resultado |
|---|---|
| `verify:consulta-taro` | **750 conferências** (eram 705) |
| `verify:synthesis` | 222, digests `itens` inalterados |
| `verify:tarot` | 183 |
| `verify:astro` | 1.280 |
| `tsc --noEmit` | 0 erros |
| `prebuild` | 31/31 |
| `next build` | completo |

As partes novas do verificador: **H** exercita o detector contra as 78 fichas
(cada base e cada reversão julgável, copiada inteira, tem de ser pega, com e sem
o nome da carta na frente), contra seis interpretações fiéis **copiadas
literalmente das baterias** e contra as cópias reais do caso 9/10, mais as
bordas. **I** cobra que o descarte esteja ligado, seja por carta, registre no
log, preserve o `reading`, não gere texto e não toque o `isUsable`.

**Onze sabotagens deliberadas, onze quedas**: afrouxar a cobertura para 90%,
baixar o piso para 3 palavras, exigir sequência de 12, remover o descarte, trocar
o oráculo da condição, fazer a reversão de "Similar." contar como fonte, ligar o
detector ao `isUsable`, apagar T1b, tirar de T1b o uso do termo da tradição,
tirar de T3 o alcance aos dois campos e tirar a armadilha da pergunta-conselho.
Arquivos restaurados byte a byte, com LF preservado.

### Duas expectativas corrigidas, e por quê

Nenhuma foi afrouxada para aprovar:

1. Escrevi que as 62 reversões copiadas seriam todas detectadas. **Uma escapa**:
   *"Conservadorismo. Seguir padrões antigos e ultrapassados."*, de Quatro de
   Ouros, tem 6 palavras, abaixo do piso de 8. Baixar o piso passaria a acusar
   interpretação curta legítima, então a isenção fica — **nomeada no teste**, com
   a contagem, para que mudar o piso ou a ficha caia ali.
2. Embuti a amostra de O Louco reconstruída de memória em vez de copiada do
   arquivo da bateria; ela mediu 41% em vez dos 36% reais e o verificador
   reprovou, corretamente. Troquei pelas seis strings exatas, extraídas dos
   JSONs das baterias.

## O que ainda não está tratado

O detector age sobre `meanings`. O campo `reading` não é verificado contra cópia
— nas 370 amostras o problema nunca apareceu lá (no caso 9, o `reading` estava
correto justamente enquanto os dez `meanings` eram cópia), então não há defeito
medido para tratar. Fica registrado como lacuna conhecida, não como pendência.

E a eficácia de T1b e T3 no texto produzido **não foi medida**: exigiria chamada
paga, e nenhuma foi autorizada nesta etapa. O que está garantido é a detecção e
o descarte, que não dependem de o modelo obedecer.

---

# Parte VI — A verificação de interface do descarte (25/10)

Zero chamadas pagas. Bancada temporária com o caso 9 (`fase10:594`, 9 das 10
cartas invertidas) e os dez significados ausentes, olhada no desktop e no
mobile, depois removida.

## O que a pessoa vê

**Não fica vazio nem quebrado.** O verso da carta traz posição, nome em serifa,
orientação e uma linha discreta em itálico a 50% de opacidade
(`.fc-meaning.is-empty`, que já existia). Desktop e mobile a 375px: legível,
sem transbordo, sem layout partido. A mesa continua completa — as dez cartas com
arte e numeração — e o texto da tiragem, que o descarte preserva, segue abaixo.

## O defeito que a bancada revelou

Numa **leitura ao vivo**, as dez cartas diziam:

> *"O significado desta carta aparece aqui assim que o oráculo terminar de
> escrever."*

Uma promessa que não se cumpre mais. A causa não era o texto: era qual booleano
chegava ao `FocusCard`.

`live` existe para uma janela real — o evento `draw` entrega o sorteio ao
navegador **antes** das cinco interpretações (`app/consultas/route.ts:769` manda
`rendered[k].items`, sem `meaning`), e enquanto ela dura a promessa é verdadeira.
O evento `oracles` a fecha. Mas `tarot-spread.tsx` passava `live={animate}`, e
`animate` é a flag da distribuição das cartas: continua ligada depois. Sem
descarte isso nunca aparecia, porque toda carta acabava com significado.

## A correção, no componente existente

Nenhuma string nova, nenhum dicionário tocado, nada acrescentado ao
`focus-card.tsx`:

- `components/tarot-spread.tsx`: prop `pending` própria, separada de `animate`,
  e `live={pending}`.
- `components/hero-content.tsx`: `pending={!oracle?.reading}` — a promessa vale
  enquanto a interpretação não chegou, e só então.
- As páginas de leitura salva não passam nada: `pending` é `false` por padrão.

Conferido na bancada, nos três estados:

| estado | o verso diz |
|---|---|
| leitura salva | *"Esta leitura não guardou um significado para este símbolo."* |
| ao vivo, janela do sorteio | *"…aparece aqui assim que o oráculo terminar de escrever."* |
| consulta concluída | *"Esta leitura não guardou um significado para este símbolo."* |

O terceiro é o que estava errado.

## Verificações

`verify:consulta-taro` **754 conferências** (eram 750) · `verify:synthesis` 222,
digests `itens` inalterados · `verify:tarot` 183 · `verify:astro` 1.280 ·
`tsc --noEmit` 0 erros · prebuild 31/31 · `next build` completo.

As quatro novas estão na parte I e guardam exatamente este defeito: `live` não
pode voltar a sair de `animate`, `pending` tem de existir separada, e a leitura
ao vivo tem de passar `pending={!oracle?.reading}`. **Três sabotagens, três
quedas**; arquivos restaurados byte a byte.

`draw.ts`, `tarot-referencia.ts`, `bendov-cartas.ts`, `synthesis.ts`,
`synthesis-cbase-min.ts`, o golden e o `verify-cbase-min.ts` continuam idênticos
ao HEAD. Os três dicionários estão modificados pela frente dos sonhos, com zero
linhas minhas. A bancada foi removida e o `.next` limpo antes do build.

**Frente do Tarô encerrada.**
