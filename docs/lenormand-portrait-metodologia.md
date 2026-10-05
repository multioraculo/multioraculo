# Lenormand: o método Portrait, e o que entra na síntese

Fecha a frente metodológica do quinto oráculo. Complementa
[`lenormand-fichas-handbook.md`](lenormand-fichas-handbook.md), que documenta a
extração das 36 fichas individuais (usadas pela tiragem do dia da Home desde
`f52b1c8`) e que aqui é **reaproveitada, não refeita**.

Fonte única: Caitlín Matthews, *The Complete Lenormand Oracle Handbook* (Destiny
Books). PDF `data/pdfs/lenormand_handbook.pdf`, sha256 `a5cbdaad…c542db`.

## 1. A mesa é a do livro

O motor sorteava 9 cartas, guardava a central, exibia uma grade — e **não
calculava relação nenhuma**, embora `references.ts` prometesse "leitura por
posição e combinação". A discrepância foi fechada com o método do próprio livro.

"Spread 6: The Portrait" (p. 193-194) é a nossa mesa 3×3:

```
1 2 3
4 5 6
7 8 9
```

O que o livro prescreve, verbatim:

| o que | onde | citação |
|---|---|---|
| carta 5 = foco | p. 193-194 | "the central one becomes the main topic" · "Card 5 shows the focus of the issue" |
| carta 1 = origem | p. 194 | "Card 1 reveals what provoked or instigated the issue" |
| colunas = tempo | p. 194 | "Cards 1, 4, and 7 = the past" (idem presente 2-5-8, futuro 3-6-9) |
| cantos | p. 194 | "Make a sentence from the corners 1 + 9 + 3 + 7" |
| diamante | p. 194 | "Read the diamond of 2 + 4 + 6 + 8 to show the internal dynamic" |
| linhas e flechas | p. 194 | "Read rows 1 + 2 + 3, 4 + 5 + 6, 7 + 8 + 9 and arrows 1 + 8 + 3 and 7 + 2 + 3" |
| par com a central | p. 193 | "read every card surrounding it with it as a pair" |

**Uma correção de OCR, com evidência.** O livro imprime a segunda flecha como
`7 + 2 + 3`. O exemplo trabalhado da mesma página resolve a ambiguidade: "The
arrows: Paths + Moon + Snake" são, naquela mesa, as posições 7, 2 e **9**. A
flecha é 7-2-9.

### As 28 relações

Pares consecutivos das sequências de p. 194, mais os pares com a carta central
de p. 193, sem repetição:

```
colunas    1→4  4→7   2→5  5→8   3→6  6→9
linhas     1→2  2→3   4→5  5→6   7→8  8→9
cantos     1→9  9→3   3→7
diamante   2→4  4→6   6→8
flechas    1→8  8→3   7→2  2→9
central    5→1  5→2  5→3  5→4  5→7  5→9
```

A direção das seis últimas vai **do centro para fora**: a posição 5 é o foco e é
ela que tinge o que a rodeia. `5→6` e `5→8` já vêm das sequências e não contam
duas vezes.

### Fora do MVP: Knighting e Mirroring

O livro descreve os dois (p. 198-202) e os chama de opcionais — *"These
techniques are used to confirm or add to your findings and don't have to be used
every time."* Ficam documentados aqui para uma versão futura. A geometria foi
conferida contra o que o livro afirma e contra os exemplos dele:

| | pares | grau por posição | o livro diz | exemplos do livro |
|---|---|---|---|---|
| Knighting | 8 | `2,2,2,2,0,2,2,2,2` | "knights to two other cards except for the central card" (p. 200) | Key(1)→Coffin(6), Book(8); Stork(3)→Rod(4), Book(8) |
| Mirroring | 8 | `3,1,3,1,0,1,3,1,3` | "corner cards have three possible mirrors, and every other card has just one, except for the central card" (p. 201) | Stork(3) espelha Key(1), Paths(7), Snake(9) |

O verificador rejeita hoje qualquer uma dessas 12 relações: parte B,
`FORA_DO_MVP`.

## 2. Duas camadas de evidência

```
LENORMAND
  cartas individuais   9 fichas, uma por carta sorteada     (sempre 9/9)
  relações da mesa     1 bloco com os pares dirigidos que
                       a fonte glosa para as 28 relações    (0 a 9 por leitura)
```

A ficha é a **base**; a combinação é **evidência relacional adicional**. As
combinações não substituem a ficha e não ganham peso por existirem.

`Timing` e `Lenormand Universe` continuam fora da síntese, como já estavam no
verso da Home: o primeiro é previsão de data, o segundo é, nas palavras da
autora, "a nontraditional, mythic title … from my own practice".

## 3. A ordem é o sentido

A fonte afirma, na ficha da Raposa:

> "When Fox comes before a card, it will affect what follows more severely, so
> Fox + Fish means that something is seriously up with your money, whereas Fish +
> Fox is saying you received the wrong change."

E prova por construção: **21 pares aparecem nas duas direções e, em 21, o texto
difere.** Nenhum repete.

Por isso, regra absoluta e travada no verificador: procura-se só a direção que a
mesa produz; a ausência de A→B **não** é suprida por B→A; não há simetrização nem
fuzzy match. A sabotagem registrada na parte G mostra o custo de violá-la — um
fallback simétrico colocaria 126 pares que a fonte não glosa naquela direção.

## 4. O catálogo é esparso, e isso não é hierarquia

| recorte | nº |
|---|---|
| entradas glosadas nas 36 seções `Combinations` | 224 |
| pares (duas cartas) | 182 |
| entradas de três ou mais cartas (guardadas, **não** servidas) | 42 |
| pares dirigidos servíveis para a nossa arte | 172 |
| espaço total de pares dirigidos possíveis (36×35) | 1.260 |

Densidade: **13,7%**. Medido nos 40 seeds, **14,9%** das 28 relações têm glosa —
4,2 por leitura, e 2 das 40 mesas não têm nenhuma.

Isso é natureza da fonte, não sinal. `METODO_LENORMAND` diz ao modelo, nos três
idiomas, que *"uma relação ter combinação documentada não a torna mais importante
que as outras, apenas mais documentada"*.

O "≈560 combinações" de auditorias anteriores era contagem de **menções** de
`A + B` no livro inteiro (535 pares distintos, 758 ocorrências), a maioria dentro
de exemplos de capítulo e exercícios, sem glosa própria.

## 5. Nuvens e Foice: a direção da arte

Duas cartas têm, no livro, sentido que depende do lado para onde a arte aponta:

- **Nuvens**, p. 71: *"I shall be placing an L or R after each definition to
  indicate that the dark clouds are on the left or right side."*
- **Foice**, p. 159: *"I have put Scythe L for when it faces left and Scythe R for
  the blade facing right."*

Não foi adotada convenção genérica: **a nossa arte foi medida**, e o verificador
remede os PNGs a cada build (parte F).

| carta | medição em `public/lenormand/` | leitura | decisão |
|---|---|---|---|
| `clouds.png` | 64,5% da tinta na metade esquerda contra 35,5% na direita | a massa escura, com o rosto, está à esquerda | **L** |
| `scythe.png` | centro horizontal da tinta a 0,572 no terço superior (lâmina) contra 0,382 no inferior (cabo) | a lâmina sai para a direita | **R** |

Controles da mesma medição: `sun.png` dá 0,506/0,494 (simétrico) e banda
superior −0,004 da inferior; `fox.png` dá 0,544/0,456 e −0,078. As duas margens
acima são muito maiores.

Consequência: das 25 entradas com qualificador, ficam as de `Clouds L` e
`Scythe R`; as de `Clouds R` e `Scythe L` descrevem outro baralho e são
descartadas. Isto **não** é inversão de carta e não toca o sorteio.

## 6. O que ficou fora, e por quê

| | por quê |
|---|---|
| entradas `X on House of Y` (33 no léxico) | casas do **Grand Tableau**, outra mesa e outro método |
| entradas de 3+ cartas (42) | decidir quando uma sequência de três posições corresponde a uma delas é metodologia nova; ficam guardadas no módulo |
| Knighting e Mirroring | o livro os chama de opcionais |
| `Timing`, `Lenormand Universe` | previsão de data; título não tradicional da autora |
| índice lexical (`pdfs.index.json`) | 79% dos trechos citavam carta não sorteada; deixa de ser fonte operacional do Lenormand **na síntese** |

O índice lexical **continua** alimentando a aba individual do Lenormand em
`app/consultas/route.ts`, exatamente como continua alimentando as dos outros
quatro oráculos: as fichas estruturadas das cinco frentes foram ligadas à síntese
C-base-min, não ao prompt por oráculo. É assimetria conhecida e igual para todos.

## 7. Arquitetura do bloco relacional (e por que C-base-min não foi tocado)

`synthesis-cbase-min.ts` corta em **10 entradas por oráculo** e **320 caracteres
por trecho**. Nove fichas ocupariam nove das dez vagas e as combinações cairiam
no corte.

A solução ficou na camada de referência: **um bloco só**, com todas as relações
documentadas daquela mesa. 9 + 1 = 10, no teto, sem tocar o prompt congelado.

Duas decisões de orçamento:

1. o rótulo explicativo vai no `source`, que o prompt **não** corta — assim os
   320 caracteres ficam todos para o que a fonte diz;
2. o prefixo é só o par de posições (`2→5 `), porque o nome das cartas já está na
   lista de itens do prompt.

Medido nos 40 seeds: **167 de 167 relações entregues, nenhuma descartada**; bloco
com 213 caracteres em média e 305 no máximo. O que se perde é texto, não relação:
108 das 167 glosas vão inteiras, 59 são podadas, **todas em fim de locução**,
nunca no meio de palavra — 403 das 478 locuções da fonte (84%).

## 8. Medições, antes e depois

| | antes (índice lexical) | depois (ficha + bloco) |
|---|---|---|
| entradas por leitura | 9,0 | 9,9 (teto 10) |
| chars de referência por leitura | 2.880 | 2.419 |
| cartas sorteadas cobertas | 336/360 (93%) | **360/360 (100%)** |
| trechos citando carta não sorteada | **284/360 (79%)** | **0/398** |
| ocorrências de carta não sorteada | **1.156** | **0** |
| prompt C-base-min | 28.344 chars · ~7.489 tokens | 29.276 chars · ~7.736 tokens (+3,3%) |

## 9. Sorteio intocado

`drawLenormand` não foi alterado: 36 cartas, 9 sem reposição, sem inversões,
`makeRng(\`${seed}:lenormand\`)` em fluxo próprio. O diff de `draw.ts` nesta
rodada tem **zero** linhas que mencionem lenormand. Impressão digital das 360
cartas dos 40 seeds: `2af40b5fde68919f29a98340e5681360736fd03602f6d0d3e07eb20bd02779d2`.

## 10. Arquivos

| arquivo | estado |
|---|---|
| `scripts/extrair-lenormand.mjs` | estendido: passa a gerar também as combinações. As 36 fichas saem **byte a byte iguais** |
| `lib/oracles/lenormand-combinacoes.ts` | novo, gerado |
| `lib/oracles/lenormand-referencia.ts` | novo |
| `lib/oracles/references.ts` | Lenormand passa a usar a referência estruturada e `METODO_LENORMAND` |
| `lib/oracles/localize.ts` | rótulos de posição e texto da mesa em pt/en/es |
| `scripts/verify-lenormand.ts` | novo, 2.530 conferências |
| `package.json` | `verify:lenormand`, encadeado no `prebuild` |
| `lib/oracles/lenormand-fichas.ts` | **inalterado** |
| `lib/oracles/cartas-individuais.ts`, Home | **inalterados** |
