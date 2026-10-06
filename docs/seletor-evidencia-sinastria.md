# Seletor determinístico de evidência da sinastria

Código: [lib/astro/selecao-sinastria.ts](../lib/astro/selecao-sinastria.ts). Testes: `npm run verify:sinastria-selecao`. Simulação: `scripts/simular-selecao-sinastria.ts`.

O seletor escolhe **quais fatos** entram na síntese e com que evidência do Davison. Não diz se a relação é boa ou ruim, não gera nota nem veredito, e **não recebe o vínculo**.

## Regra de ouro

**O modelo nunca recebe um fato astrológico sem material interpretativo correspondente.** Um fato sem glosa do livro continua existindo nos fatos brutos e no diagnóstico, mas não atravessa o seletor, e portanto não há o que o modelo completar por conhecimento próprio.

## O que ele recebe (universo)

Só o que o motor calculou e vale no intervalo inteiro das duas pessoas. As indisponibilidades passam inteiras, porque a síntese precisa saber o que falta. Da evidência do repertório entram só as frases que **não dependem de condição natal não calculada**; as que dependem de "aspectos discordantes entre os mapas" só entram quando a relação tem ao menos um aspecto discordante.

Ficam de fora, com motivo `sem_evidencia_interpretativa`:

- **aspecto com Asc ou MC que não é conjunção**: o livro só trata o ângulo dentro das casas 1 e 10. Não conta tokens, nem diversidade, nem a trava de contraponto;
- aspecto entre corpos cuja evidência inteira depende de condição natal.

A **conjunção** com Asc ou MC continua sustentada: vira a leitura do planeta na casa 1 ou 10 de quem tem o ângulo.

## A ordem (relevância), e de onde vem

Não há pontuação. A ordem é lexicográfica: cada critério só desempata o anterior.

### Aspectos (camada principal)

| # | Critério | Origem | Base |
|---|---|---|---|
| 1 | Aspecto entre dois lentos (Urano, Netuno, Plutão) por último | **fonte** | p. 30, 56 |
| 2 | Par de índice primeiro: Sol/Lua, Mercúrio/Mercúrio, Vênus/Marte | **fonte** | p. 59, 71, 74 |
| 3 | Aspecto com Sol ou Lua antes dos demais (Asc/MC só entram como conjunção, pela camada de overlays) | **fonte** (que são centrais) + **editorial** (a ordem entre eles) | p. 54, 59 |
| 4 | Orbe menor primeiro (em graus) | **fonte** | p. 56 |
| 5 | Desempate por id | editorial, neutro | |

### Overlays (secundária, orçamento próprio)

| # | Critério | Origem | Base |
|---|---|---|---|
| 1 | Planeta sobre o Asc ou o MC do outro (conjunção) primeiro | **fonte** | p. 93 |
| 2 | Mais planetas de uma pessoa na mesma casa da outra | **fonte** | p. 96 |
| 3 | Planeta que já está num aspecto selecionado | **editorial** | p. 95 manda combinar a casa com o par; a regra de ordem é nossa |
| 4 | Desempate por id | editorial | |

## O corte

**A escolha é a ordem de relevância cortada pelo orçamento: um prefixo.** Para quando a próxima dinâmica não cabe, e **não pula** para uma menos relevante que caberia. Nada menos relevante passa à frente de algo mais relevante, por nenhuma razão: nem por tamanho, nem por trazer um lado ou uma dimensão ainda não vistos.

Orçamento por camada, em tokens: aspectos 2800, overlays 1400, semelhanças 300. É alvo de custo, não regra astrológica.

## Dedup: identidade de leitura, não de par

Só viram **principal + reforços** os fatos que partilham de fato **a mesma glosa, as mesmas frases do livro** (logo a mesma valência, a mesma origem metodológica e o mesmo núcleo). Mesmo par planetário não basta.

`moon-venus` na simulação era **identidade de par apenas**: o sextil usa a leitura favorável e a quadratura usa a adversa (com leitura específica). Estavam fundidos, e agora são duas dinâmicas, `moon-venus:favoravel` e `moon-venus:adverso+especifico`. Já o sextil e o trígono do mesmo par, que usam a mesma leitura favorável, continuam um grupo com reforço.

O id de uma dinâmica é a glosa e a leitura. Nos overlays, a mesma glosa nas duas direções (planeta de A na casa de B e planeta de B na casa de A) continua uma dinâmica: o texto do livro é o mesmo, e a direção fica em cada fato.

## Lado e dimensão: nada disso ordena

- **Harmônico/discordante não é critério de relevância.** O ranking não o conhece.
- **Dimensões** (comunicação, afeto etc.) são só informação do diagnóstico. A "novidade de dimensão" **não foi aplicada** como critério: todos os critérios de relevância da fonte formam uma ordem total (o orbe é contínuo), então não sobra empate onde ela poderia desempatar, e promover por dimensão violaria a regra de que ela só vale depois da relevância. Se um dia houver empate real, ela pode entrar como último desempate e nunca acima de um critério de fonte.

## Trava de contraponto (anti-omissão, separada da relevância)

Depois da seleção principal: se o universo tem aspectos harmônicos **e** discordantes utilizáveis e a seleção ficou só com **um** lado, localiza-se o fato mais bem ordenado do lado ausente e ele entra como `contraponto` **somente se sobrar orçamento**. Ninguém é retirado, nada é contado, não há 50/50. Sem orçamento, registra-se `contraponto disponível mas não selecionado por orçamento`.

## Semelhanças (camada própria, e só com material do livro)

Não competem com aspectos nem com overlays: tirá-las da entrada não muda uma vírgula da seleção de aspectos e overlays (há teste). Têm orçamento próprio (~300 tokens), e a evidência de cada uma conta dentro dele.

**Calculável não é interpretável.** Uma semelhança só atravessa se o livro tem material para ela; as outras continuam fatos brutos e diagnóstico, com `sem_evidencia_interpretativa`, sem gastar orçamento e sem virar "ponto em comum" narrável.

| Semelhança calculada | O que o livro interpreta | Glosa |
|---|---|---|
| Elemento dominante de cada mapa | cada um dos 10 pares de elementos (p. 42 a 46) | `elemento:fire|water` etc. |
| Modo dominante de cada mapa | cada um dos 6 pares de modos (p. 48 a 50) | `modo:cardinal|fixed` etc. |
| Elemento do Sol | só Sóis no **mesmo** elemento (p. 39) | `elemento_do_sol` |
| Mesmo corpo no mesmo signo | só a Lua e os planetas pessoais rápidos (p. 30). Júpiter e Saturno não são nomeados: barrados. Urano, Netuno e Plutão: geracional, descartado | `signo_do_corpo` |

**Ressalva metodológica**, só com o que a fonte diz (p. 30, 39): semelhança grande demais pode fazer com que um mapa não complemente o outro e a competição substitua a cooperação; ênfase demais no mesmo elemento atrai no começo e pode levar a tédio, e é o contraste que costuma dar sabor, desde que não seja tão completo que ninguém consiga se adaptar. Essas ressalvas (`semelhanca_geral`) acompanham, uma vez só, toda semelhança **igual** selecionada. Não há "lado positivo" e "lado negativo" por simetria: o que o livro não diz fica vazio. Nenhuma glosa usa a palavra "compatibilidade".

Ordem da camada (editorial): elemento, elemento do Sol, modo, depois o mesmo signo (rápidos antes dos intermediários). Corte e orçamento são os de antes.

## Simulação (os mesmos 18 pares do corpus de validação do motor)

| Medida | Resultado |
|---|---|
| Tokens da seleção | mediana **4.038** (2.886 a 4.394) |
| Fatos sem evidência interpretativa barrados | 60 no total, mediana 3 por relação |
| Agrupamentos desfeitos por leitura diferente | 11, em 6 das 18 relações |
| Trava de contraponto acionada | 0 de 18 |
| Contraponto que não coube no orçamento | 0 |
| Relações com os dois lados no universo e na seleção | 18 de 18 |
| Reforços que a dedup agrupou | 2, em 198 dinâmicas de aspecto |
| Chaves de score, nota, pontuação ou compatibilidade nas saídas | nenhuma |

A trava existe e é testada, mas nesta amostra o prefixo da ordem já trazia os dois lados.
