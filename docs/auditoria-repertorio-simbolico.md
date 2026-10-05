# Auditoria do repertório de "Imagem do inconsciente"

Fonte auditada: `data/fontes/o_homem_e_seus_simbolos.pdf` (557 págs., texto extraído com pdfjs). **Única fonte do repertório.**
`jung_tarot.pdf` (Nichols) não foi minerado: seus verbetes são os próprios arcanos do Tarô, o que criaria a sobreposição com a tiragem que o produto quer evitar.

**Páginas = páginas do PDF/e-book** (o código já usava essa numeração e a conferência bateu: 15 das 16 citações achadas na mesma página; a do Animus tem pontuação diferente do original, o conteúdo bate).

Autoria por capítulo (a regra que o código já declarava: autor do capítulo, não do volume):

| Cap. | Autor | Páginas |
|---|---|---|
| I | C. G. Jung | 1–158 |
| II | Joseph L. Henderson | 160–249 |
| III | M.-L. von Franz | 250–390 |
| IV | Aniela Jaffé | 391–460 |
| V | Jolande Jacobi | 461–530 |

Método e limite: varredura por ~110 termos (contagem de menções / páginas distintas, com falsos positivos de palavra comum filtrados) + leitura em contexto dos trechos em que o termo aparece junto de "símbolo / representa / significa". Não é leitura integral do livro: a classificação "frágil" pode subir com leitura mais funda.

Critério: **forte** = ≥2 passagens explícitas tratando a imagem como símbolo, ou assunto central do livro. **utilizável** = 1 passagem explícita clara, ou 2 dentro de um mesmo caso clínico. **frágil** = só menção incidental, legenda de foto, ou dependente de outra figura. **excluir** = sem tratamento no livro, conceito abstrato, personagem de mito, ou duplicata.

## A. Repertório atual (25 entradas em `lib/oracles/simbolos-inconsciente.ts`)

16 têm fonte no livro; **9 são "editorial" sem fonte nenhuma** (espelho, porta, chave, ponte, escada, labirinto, jardim, máscara, lobo).

## B. Deduplicado e classificado (28 itens bons)

### Forte (16)
| id | nome | tipo | fonte (cap., pág.) | material | âncoras / palavras-chave | status no código |
|---|---|---|---|---|---|---|
| sombra | A Sombra | figura arquetípica | Jung, 90 (+ Henderson 185) | 92 / 40 | projeção · o que não se reconhece · atrito | existe |
| anima | A Anima | figura arquetípica | Jung, 33, 36; Henderson 190–198; von Franz 286–305 | 132 / 56 | o feminino interior · atração · imagem da mulher | **falta** |
| animus | O Animus | figura arquetípica | von Franz, 307 | 61 / 21 | convicção · voz interna · os dois lados | existe |
| heroi | O Herói | figura arquetípica | Henderson, 169 | 147 / 63 | subida · hybris · queda · o guardião | existe |
| trickster | O Embusteiro | figura arquetípica | Henderson, 172–182 (macaco branco = Trickster, 180) | 27 / 13 | impulso · o mais antigo · riso | existe |
| serpente | A Serpente | animal | Jung, 115 | 35 / 19 | cura · o que morde · renovação | existe |
| cavalo | O Cavalo | animal | Jung 153 (cavalo branco, "símbolo de vida"); von Franz 278 (cavalos selvagens = impulsos instintivos) | 33 / 19 | vida · impulso · o que não se doma | **falta** |
| animal | O Animal | animal (categoria) | Henderson 243–244; Jaffé 403; von Franz 303 | n/d | instinto · nem bom nem mau · integração | existe |
| casa | A Casa | lugar/objeto | Jung, 73, 116 (corpo como casa); von Franz 270 | 55 / 39 | interioridade · cômodos · antecipação | existe |
| caverna | A Caverna | lugar | Henderson, 234; Jung 79 | 47 / 20 | recolhimento · morte simbólica · passagem | existe |
| arvore | A Árvore | elemento natural | Henderson, 243; Jung 121; von Franz 303 | 50 / 28 | crescimento · raiz · tempo lento | existe |
| pedra | A Pedra (absorve cristal e pedra filosofal) | elemento natural/forma | von Franz, 342, 350 | 129 / 56 | dureza · polimento · si-mesmo | existe |
| circulo-mandala | O Círculo e a Mandala (funde 2 entradas; absorve o quadrado) | forma | von Franz 362; Jaffé 406 | 100 / 51 e 52 / 28 | totalidade · centro · redondo e quadrado | existe como 2 |
| rio | O Rio | elemento natural | von Franz, 369, 325 (atravessar curso d'água = mudança) | 26 / 16 | travessia · peso no meio · corrente | existe |
| espelho | O Espelho | objeto | von Franz, 341, 364 | 15 / 10 | reflexo · o que devolve · ver-se de fora | existe, **sem fonte**; texto atual não vem do livro |
| morte | A Morte e o Renascimento | motivo recorrente | Jung, 110; Henderson 111–112, 165–167 | 122 / 74 e 27 / 22 | iniciação · fim de uma forma · renascimento | existe |

### Utilizável (12)
| id | nome | tipo | fonte | material | observação |
|---|---|---|---|---|---|
| mae-grande | A Mãe Grande | figura arquetípica | Jung 144; Henderson 195, 198 (aspecto "devorador"); von Franz 320 | 7 / 7 | pouca ocorrência do termo, mas 3 autores |
| dragao | O Dragão | animal/criatura | Henderson 185, 191; Jung 109 | 16 / 12 | sobrepõe o Herói (o dragão é o que ele enfrenta) |
| montanha | A Montanha | elemento natural | Jacobi 468, 497 | 33 / 18 | **só no caso clínico de "Henry"**; autoria no código estava errada (Jaffé) |
| bosque | O Bosque | lugar | Jacobi 469, 476 | 18 / 16 | "área inconsciente, lugar escuro onde vivem os animais" |
| labirinto | O Labirinto | forma/lugar | von Franz 269–270; Henderson 194 | 8 / 5 | existe sem fonte; texto atual é conhecimento geral |
| mascara | A Máscara | objeto | Jung 26, 60; Henderson 198, 224 | 25 / 16 | máscara ritual / identidade com o animal; texto atual ("permite falar") não está no livro |
| casaco | O Casaco (persona) | objeto | Jacobi 484, 486–487 | 4 / 3 | substitui "Persona", que é conceito abstrato |
| sol | O Sol | imagem cósmica | Jung 20–21; Jaffé 406; Jacobi 505 (escaravelho = Sol) | 50 / 39 | boa lacuna cósmica a preencher |
| cruz | A Cruz | forma | Jung 18, 121, 138 | 29 / 19 | |
| androgino | O Andrógino | figura | Jung 36; von Franz 335 | 6 / 6 | dualidade interior; liga com Anima/Animus |
| escaravelho | O Escaravelho | animal | Jacobi 502–505 | 17 / 6 | de novo um caso clínico |
| iniciacao | A Iniciação | motivo recorrente | Jung 110; Henderson 195–225 | 59 / 36 | **não li em contexto**; confirmar antes de ingerir |

### Frágil (19) — não entram
cidade (só como símbolo da anima, 196/199), leão, lua, urso, pássaro, jardim (Éden murado 132, jardim da Fera 215), fogo, touro, sacrifício, velho sábio / figuras do self (320–321), coroa, espada, taça, cervo/corça, estrela, rei/rainha (casal régio 342), anjo/demônio, água, noite/escuridão.

### Excluir
- **Sem tratamento no livro (editoriais atuais):** porta e chave (só aparecem na discussão "símbolo sexual?", 31–35), ponte (só metáfora), escada (só em relatos de sonho), lobo (3 menções, nenhuma como símbolo).
- **Conceito abstrato:** self/si-mesmo, persona, totalidade, número, união dos opostos, alquimia.
- **Personagem de mito, não imagem:** Dionísio, Orfeu, Teseu, Perseu, a Fera, São Cristóvão.
- **Duplicata semântica:** macaco (= Embusteiro), cristal (= Pedra), quadrado (= Mandala), círculo × mandala (fundir).
- **Fora do livro:** anel (só Tolkien, 548), ouro (só uma citação de Eckhart).

## C. Amplitude

- **Fonte única, tradição única.** Os 28 vêm de um só livro da psicologia analítica. É o limite estrutural do repertório, não corrigível com este material.
- **Núcleo "totalidade/self"** está inflado: círculo, mandala, pedra, cristal, quadrado = 5 entradas para a mesma ideia. Deduplicado: 2 (Círculo-Mandala, Pedra).
- **Eixos cobertos:** integração/conflito (Sombra, Anima, Animus, Animal, Herói, Dragão, Embusteiro) e transformação/estabilidade (Rio, Serpente, Escaravelho, Iniciação / Pedra, Casa, Círculo) estão bem servidos; proteção/exposição (Casa, Casaco, Máscara, Caverna / Bosque, Espelho) razoável; ordem/caos razoável (Mandala, Labirinto / Cavalo, Dragão).
- **Eixos finos:** vínculo/separação (Anima-Animus-Andrógino-Mãe Grande, quase só vínculo) e criação/dissolução (criação só via Árvore e na frase da Morte). Não forçar categorias que o livro não sustenta.
- **Famílias:** figuras 8, animais 5, natureza 5–6, objetos 5, formas/lugares 5. Sem família dominante; a mais pesada são as figuras junguianas clássicas (~29%).
- **Água/fogo/ar/terra:** só o Rio tem sustentação. Lua e estrela ficaram frágeis.

## D. Contagem

| | itens |
|---|---|
| Entradas hoje | 25 |
| Com fonte válida hoje | 16 (15 após fundir círculo e mandala) |
| Prontas hoje (fonte + classe forte/utilizável) | **15** (13 fortes + 2 utilizáveis: mãe-grande, montanha) |
| Bons no total (forte + utilizável) | **28** |
| A ingerir | 13: anima, cavalo, espelho*, dragao, bosque, labirinto*, mascara*, casaco, sol, cruz, androgino, escaravelho, iniciacao (* já existem como editorial; precisam de texto novo a partir da fonte) |
| Remover do ar | 5: porta, chave, ponte, escada, lobo (+ jardim, que fica frágil) |

## E. Resultado da ingestão (2026-10-04) — repertório ativo: 25 estudos

A checagem de contexto durante a ingestão mudou a classificação da seção B. **Legenda de imagem não é texto do autor do capítulo** (o volume tem coordenação editorial e redação de texto próprias), então só texto corrido conta para "forte".

**Ativos (25): 19 fortes, 6 utilizáveis.**
- Fortes: sombra, anima, animus, heroi, trickster, serpente, animal, casa, arvore, pedra, circulo-mandala, espelho, morte-renascimento, iniciacao, labirinto, mae-grande, montanha, dragao, sol.
- Utilizáveis: caverna (mesmo sonho em duas páginas), rio (uma afirmação explícita + narrativa), cavalo (um texto + legendas), bosque, casaco, escaravelho (um caso clínico cada).

**Dos 13 candidatos, 10 sobreviveram:** anima, espelho, labirinto, iniciacao, escaravelho, cavalo, dragao, bosque, casaco, sol (Cavalo desceu de forte para utilizável). Montanha, que já existia, também passou na checagem e subiu a forte (três contextos de texto: Jacobi 468 e 497, Henderson 206). 15 já prontos + 10 = 25.
**Excluídos pela checagem (3):**
- **máscara**: só legendas de foto (p. 26, 60, 198) e uma menção de legenda (224). Nenhum texto do autor trata a máscara como símbolo.
- **cruz**: a p. 138 usa a cruz para argumentar que o sentido depende do contexto, e o resto é legenda. Não sustenta um estudo.
- **andrógino**: p. 36 e 335 são legendas; p. 221 é só menção a Dionísio.

**Removidos do ar (sem fonte):** porta, chave, ponte, escada, jardim, lobo.

**Correções feitas por causa da checagem:** "Morte" dizia que criação, morte e renascimento "não estão em oposição" e que a imagem toca "o fim de uma forma de viver, e não de uma vida", mas a menina do sonho de Jung (p. 110) de fato morreu; o texto agora preserva as duas leituras. "Serpente" trocou a âncora "renovação" (que não está na fonte) por "entre dois mundos / transcendência" (Henderson, p. 244).

**Tipos de passagem:** cada `fontes[]` diz `natureza: "texto" | "legenda"`; a primeira de cada item é sempre texto. `scripts/verify-simbolos.ts` confere cada trecho contra a página do PDF (quando o PDF está presente), a regra do "forte", a ausência de autor na Home e as propriedades do sorteio.
