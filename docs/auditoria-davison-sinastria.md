# Sinastria: auditoria do Davison como fonte

Segunda rodada. Nada foi implementado, a OpenAI não foi chamada e nenhum arquivo de código foi alterado.
Esta rodada **substitui as seções 4, 5 e 11 de** [auditoria-sinastria.md](auditoria-sinastria.md): lá eu disse que o projeto não tinha fonte astrológica. Com o Davison, parte dessas lacunas fecha, e parte não.

Convenções:
- **EXP** = EXPLÍCITA NA FONTE · **INF** = INFERÍVEL COM SEGURANÇA · **NÃO** = NÃO SUSTENTADA.
- "p." é a **página do PDF** (a numeração impressa do livro não aparece no arquivo).
- Tudo que não está escrito no livro e vem do projeto aparece como **calibração editorial**.

**O que eu li, para você pesar a confiança.** Li de ponta a ponta os capítulos 3, 4, 5 (elementos) e 6 (aspectos), e do capítulo 7 as introduções, os papéis dos planetas e os pares Sol/Sol até Marte/Saturno. Do capítulo 8 li a introdução, as definições das casas, a abertura de Sol nas casas e o fim de Plutão nas casas. **Não li linha a linha** os pares de Marte/Urano até Plutão/Plutão, nem as 120 entradas de casas. Para esses trechos conferi a **estrutura** por título (55 de 55 pares e 120 de 120 casas existem) e por busca de termos. Afirmações sobre conteúdo dessas partes valem como "amostra + estrutura", não como leitura integral.

---

## 1. Diagnóstico do PDF

| Pergunta | Resposta | Como verifiquei |
|---|---|---|
| Está isolado em `candidatos`? | **Sim.** `data/pdfs/candidatos/davison-synastry.pdf`, 3,6 MB, ao lado do Marselha e das Runas. | `ls` |
| Está fora do índice ativo? | **Sim.** `pdfs.index.json` lista 7 PDFs (futhark, i_ching, búzios, jung_tarot, lenormand, odus, umbanda) e `pdfs.embeddings.json` não menciona Davison. | busca no JSON |
| Pode entrar sozinho? | **Não.** `index-pdfs.mjs` lê `data/pdfs` com `readdir` **sem recursão**: `candidatos/` aparece como pasta e é ignorada. `data/pdfs/` está no `.gitignore`, então o PDF nunca vai para o repositório. | leitura do script, `git check-ignore` |
| Edição / ano | **Não confirmável pelo arquivo.** Não há folha de rosto, ficha catalográfica nem copyright. A capa diz *Synastry: Understanding Human Relations Through Astrology, Ronald Davison* (a capa omite o "C."). O livro é de 1977, mas **a edição exata (ASI, Aurora ou outra) eu não consigo afirmar**. O PDF foi gerado em 2010 por conversão de Word 2007 e editado em 2013. | metadados, capa |
| Páginas | **210 páginas de PDF.** Página 1 é a capa (imagem). Páginas 2 a 139 têm **texto** (cerca de 90.000 palavras). Páginas 140 a 210 (**71 páginas**) são **imagens escaneadas, sem camada de texto**. | PyMuPDF |
| Qualidade da extração (2 a 139) | **Boa para extração estruturada.** 62 hifenizações de fim de linha para limpar, 2 erros de OCR "Tightness" por "rightness", 76 caracteres de substituição. Tabelas e títulos preservados. Nada que impeça regras e glosas. | contagem por regex |
| Qualidade (140 a 210) | **Inutilizável sem OCR.** Não há tesseract, easyocr nem rapidocr nesta máquina. Eu olhei páginas amostradas: são o **capítulo 9 (Relationship Horoscope, o mapa composto que você excluiu)** e o **capítulo 10 (estudos de caso: Windsor, Freud/Adler/Jung, Parent, Burton/Taylor, Hitler/Braun)**. | leitura visual |
| É o livro completo? | **Não parece.** Faltam folha de rosto, sumário, prefácio, índice e bibliografia. O **capítulo 7 não tem título** na extração (o texto "Interaction between Nativities, Part One" aparece dentro do capítulo 6, p. 54). A **última página (210) termina no meio do caso Hitler/Braun**, com uma tabela e espaço em branco, sem fechamento. Pode ser corte do arquivo. | leitura da p. 210 |
| Utilizável para extração estruturada? | **Sim, para o que interessa à sinastria natal.** Tudo o que a sinastria A↔B precisa está nas páginas **27 a 139** (capítulos 3 a 8), com texto. O que está nas imagens é composite e exemplos, fora do escopo. | |

**Duas ressalvas de uso**
1. O livro é de 1977 e **não é neutro**: textos escritos como "o homem" e "a mulher", com papéis fixos; reencarnação e karma como explicação; promessas ("garantia de casamento fértil", p. 62) e previsões ("pode terminar pela morte dele", Plutão nas casas). Isso **conflita** com `editorial.ts` (sem causalidade, sem previsão, sem promessa, sem karma, sem citar autor). A fonte serve para **o que combina com o quê**, nunca como texto a parafrasear.
2. É obra com direitos autorais. Extrair **regras e glosas curtas reescritas em estrutura de dados** é uma coisa; copiar passagens é outra. A decisão de licença é sua; eu só implementaria a primeira.

---

## 2. Cobertura metodológica

### 2.1 Interaspectos entre dois mapas

| Tema | Status | O que a fonte diz | Onde |
|---|---|---|---|
| Aspectos entre planetas de dois mapas são o fator **mais importante** | **EXP** | "the interplay of the planets and angles in one nativity with the same factors in the other is the most important" | p. 54 |
| Aspectos maiores usados | **EXP** | conjunção, sextil, quadratura, trígono, oposição | p. 55, 56 |
| Aspectos menores usados | **EXP** | semi-sextil, semi-quadratura, sesquiquadratura, quincunce "should not be ignored" | p. 52, 56 |
| Quincunce | **EXP** | classificado como discordante; "karmic significance", "challenge to self-transformation" | p. 52, 56 |
| Classificação harmônico/discordante | **EXP** | trígono, sextil, semi-sextil = harmônicos; quadratura, oposição (e semi-quad., sesquiq., quincunce) = discordantes; **conjunção e oposição "variable, according to the nature of the planets"** | p. 52, 55 |
| Harmônico não é "bom", discordante não é "mau" | **EXP** | "'harmony' and 'disharmony' are not necessarily synonymous with 'desirable' and 'undesirable'"; excesso de harmonia pode ser "placid"; discórdia tem "educational value" | p. 27, 28, 53 |
| Harmônico não promete harmonia | **EXP** | "the so-called favorable aspects do not of themselves promise an harmonious combination" | p. 53 |
| A natureza dos planetas modula o aspecto | **EXP** | Marte/Saturno não combinam "even when in trine"; Sol/Júpiter em quadratura pode dar sucesso | p. 53, 55 |
| Condição natal (afligido, debilitado, dignificado) modula | **EXP** | todo par de ch. 7 tem duas valências: "favorable aspect" e "adverse aspect **or either is debilitated**" | p. 55 e pares |
| Oposição tem papel especial na parceria | **EXP** | cúspide 7 opõe o Ascendente; mesmo planeta em oposição "can prove a source of strength" | p. 55 |
| Aspectos por **signo** (sem distância) | **EXP, com hesitação** | "while it may be prudent to take into account" Saturno num signo e Marte no mesmo, "irrespective of the distance" | p. 56 |
| Aspecto conta pelo **grau**, não pelo signo | **EXP** | Sol Touro 1° × Sol Capricórnio 30° é quadratura, não trígono | p. 39, 58 |
| Ponto médio (planeta de A no ponto médio de dois de B) | **EXP** | descrito, com exemplo | p. 56 |
| Antiscia, domal analogue, zodíacos de planeta, ângulos associados, Epoch pré-natal | **EXP**, como técnicas "complementares" | descritas, sem regra de peso ou orbe | p. 34 a 38 |
| **Contagem** de favoráveis × discordantes | **EXP e conflita com o produto** | "preponderance of sextiles and trines ... makes for an harmonious partnership"; "most harmonious relationships ... large number of favorable contacts"; "estimate the relative proportion of harmony and disharmony" | p. 27, 32, 55 |

**O conflito da contagem é o ponto mais importante desta tabela.** O Davison **conta** favoráveis e discordantes. O seu princípio é "3×2 não vira votação". Não é incompatível com usar a fonte, mas precisa ficar registrado: **a fonte autoriza o conteúdo de cada aspecto e não autoriza a regra de agregação que você quer**. A agregação é decisão do produto, e a fonte tem uma frase que você pode usar a favor: "it is the total picture that must form the basis of the final judgment and not just one single item" (p. 33).

### 2.2 Orbes (a pergunta principal)

**A fonte tem uma única passagem sobre orbes, de três frases (p. 56):**

> "it is a good general rule not to allow more than about two or three degrees of orb for the conjunction, sextile, square, trine and opposition adding perhaps a degree or two more if the luminaries are involved. All other aspects should be within about a degree and a half of exactitude. The smaller the orb, the more significant and the more crucial the contact is likely to be."

| Pergunta | Status | Resposta |
|---|---|---|
| Quais orbes recomenda? | **EXP, em faixa** | cinco aspectos maiores: **no máximo "cerca de 2 a 3°"**. Demais aspectos: **"cerca de 1,5°"**. |
| Varia por aspecto? | **EXP, em dois grupos** | só a divisão maiores × menores. **Não há diferença entre conjunção, oposição, quadratura, trígono e sextil.** |
| Varia por planeta? | **EXP só para luminares** | "um ou dois graus a mais se os luminares estão envolvidos". Não distingue Sol de Lua, nem pessoais de lentos. |
| Ângulos recebem orbe maior? | **NÃO** | nenhuma menção. |
| Orbe aplicativo/separativo? | **NÃO** | só aparece em outro contexto (mapa de casamento, ch. 2, p. 21 a 27). Em sinastria natal, nada. |
| Exceções? | **EXP, uma** | contato por signo "irrespective of distance" para Saturno/Marte (p. 56). |
| Menor orbe = mais forte | **EXP** | critério explícito de intensidade, e é o único que a fonte dá. |

**O que dá para implementar com a fonte, sem inventar:**

| Grupo | Teto da fonte | Observação |
|---|---|---|
| Maiores sem luminar | "cerca de 2 a 3°" | **A faixa é de 2 a 3, não um número.** O teto é 3°. Usar 3 é o limite superior do que ele aceita; usar 2 é o inferior. A escolha dentro da faixa é **calibração editorial**, e eu recomendaria declarar 3° como "teto da fonte". |
| Maiores com Sol ou Lua | "um ou dois graus a mais" | **Faixa 4 a 5°.** Mesma observação. Teto 5°. |
| Menores | "cerca de 1,5°" | O único número sem faixa. |
| Ângulos (Asc, MC) | **sem regra** | **Falta.** Ver abaixo. |

**O que falta, exatamente:**
1. Um número dentro de "2 a 3" e de "1 a 2 a mais". O livro dá faixa, não valor.
2. Orbe para **Ascendente e MC**. O livro trata conjunção com ângulo como "particularly when it falls in conjunction with her Ascendant" (p. 96 em diante) **sem orbe**. Usar o orbe dos planetas é uma inferência, não uma regra da fonte.
3. Se "luminares envolvidos" vale para **Asc/MC** (não diz).
4. Se os orbes valem da mesma forma para **planetas exteriores** (não distingue).
5. Se o mesmo orbe vale para **semi-sextil, semi-quadratura e sesquiquadratura**, que o projeto não calcula hoje.

**Consequência direta para hora desconhecida.** Com teto de 5° e a Lua andando 11,8 a 15,4° por dia, a meia-largura do intervalo lunar é de 5,9 a 7,7°. O pior orbe possível já passa de 5° **antes de somar a distância ao alvo**. Logo, **nenhum aspecto lunar passa na regra "vale no intervalo inteiro"**, para nenhuma pessoa sem hora, sempre. Isso é uma propriedade matemática, não uma escolha. Está de acordo com a sua regra ("aspectos lunares só entram quando forem robustos"), mas vale saber que, na prática, **a regra desliga a Lua por completo**; o que sobra dela é o **signo**, quando o intervalo cabe em um signo só.

**Conflito com o código atual.** O projeto usa `ORBE_MAX=3` e `ORBE_MAX_LUA=1.5` **para trânsitos**, com a Lua mais apertada ("anda rápido demais"). O Davison faz o oposto para luminares (**mais largos**). Não há contradição, porque os contextos são diferentes (trânsito é um céu em movimento, sinastria é um mapa estático), mas os dois conjuntos de orbes **não podem ser o mesmo objeto no código**. A constante de sinastria precisa ser própria.

### 2.3 Importância relativa dos corpos

| Tema | Status | O que a fonte diz | Onde |
|---|---|---|---|
| Sol e Lua (luminares) | **EXP** | contato clássico; "good aspects between the luminaries and between Venus and Mars ought to be present" | p. 59 |
| Mercúrio/Mercúrio | **EXP** | "main index of compatibility at the mental level" | p. 71 |
| Vênus/Marte | **EXP** | "primary indicator of compatibility at the physical level" | p. 74 |
| Lua/Lua | **EXP** | identidade de sentimento; "frequently occurs between married couples" | p. 66 |
| Lua/Mercúrio | **EXP, baixa** | "not a particularly important aspect in romantic partnerships" | p. 67 |
| Saturno | **EXP** | pares com Saturno tratam de duração, dever, estabilização | pares de Saturno |
| Exteriores entre contemporâneos | **EXP** | aspectos entre exteriores "not likely" significativos entre coetâneos; só importam com **grande diferença de idade** | p. 30, 56 |
| Plutão por geração | **EXP** | o contato de Plutão "depends ... on the involvement of Pluto at birth with faster moving planets" | p. 71 |
| Planetas rápidos no mesmo signo | **EXP** | "it is when the faster moving planets occupy the same signs that difficulties are likely" | p. 30 |
| Ordem numérica de importância (pesos) | **NÃO** | não existe | |

Ou seja: a fonte dá **hierarquia qualitativa** (luminares, Vênus/Marte, Mercúrio/Mercúrio, Lua/Lua no topo; exteriores entre coetâneos embaixo) e **nenhum peso numérico**. O `PAPEL_NATAL` do projeto (Sol e Lua 1,4; pessoais 1,1; exteriores 0,7) é **compatível** com essa hierarquia e **não vem do livro**.

### 2.4 Ascendente, Descendente, MC, IC, nodos

| Ponto | Status | Observação |
|---|---|---|
| Ascendente e MC como alvo de aspecto | **EXP** (pouco) | "planets and angles" são o fator principal (p. 54). Os textos só existem **dentro das entradas de casa 1 e 10**: "falls on her Ascendant ... or throws a major aspect to her ascending degree" (p. 96 em diante). **Aspecto a ângulo só é descrito para alguns corpos** (Sol, Lua, Mercúrio; para os demais só a conjunção). |
| IC | **EXP** | "conjunction with her Lower Meridian" nas entradas de casa 4 (8 ocorrências). |
| Descendente | **EXP, parcial** | "western horizon" aparece só 2 vezes (Sol e um outro). Para os demais, a casa 7 é descrita sem a menção ao ângulo. |
| Planeta no ângulo aflito de outra pessoa | **EXP** | "rising planet much afflicted in the other's horoscope ... will continually 'remind' the latter" | p. 55 |
| Planeta isolado por hemisfério, planetas angulares | **EXP** | p. 33 (usam horizonte e meridiano: **dependem de hora**) |
| Nodos lunares | **NÃO, como regra** | a fonte diz que têm "special significance with human relationships" (p. 35, 39) e **não dá nenhuma leitura nem orbe**. Não implementar. |
| Quíron, asteroides | **NÃO** | não aparecem. |

---

## 3. House overlays (house interchanges)

**Sustentados pela fonte de forma clara. É o capítulo 8, parte dois (p. 93 a 139).**

| Pergunta | Status | Resposta |
|---|---|---|
| Existe "planeta de A na casa X de B"? | **EXP** | "re-locate the planets of one horoscope in the houses of the other" (p. 34); o capítulo 8 inteiro é isso. |
| E o sentido contrário (B em A)? | **INF** | o livro escreve **um sentido por leitura**, do ponto de vista de **quem é dono da casa**, e diz que os efeitos "will be similar whether ... the same sex or when the position is reversed" (p. 95). Cada colocação é uma leitura própria. Nenhum trecho diz "some as duas direções" nem "interprete-as juntas". |
| A direção importa? | **EXP** | é um "transit" personificado: "an outside influence being brought to bear on the affairs of that house" (p. 93). Planeta de X age sobre a casa de Y. |
| Quais planetas? | **EXP** | **os dez corpos: 10 × 12 = 120 entradas, todas presentes.** Não há overlay de Ascendente, MC, nodos. |
| Todas as casas têm leitura? | **EXP** | sim, 12 por planeta (verificado por título). |
| Casas e seus significados | **EXP** | p. 94 e 95, texto de definição das 12 casas. |
| Orbes ou limites para cúspide | **NÃO, numericamente** | "the cusp is the crest of the wave", "not a sharp and absolute dividing line" (p. 93). Um planeta a poucos graus **antes** da cúspide seguinte pesa na casa seguinte. Há uma frase com "about five degrees" (p. 93), **ambígua o bastante para não virar regra**: não dá para saber se o 5° é antes ou depois da cúspide. |
| Sistema de casas | **EXP** | Placidus preferido, outros aceitos, e a fonte avisa que o limite entre casas não é rígido por causa disso (p. 93). Coincide com o projeto (Placidus, com queda automática em latitude alta). |
| Deve ser camada principal ou secundária? | **EXP** | secundária: o capítulo 8 vem **depois** dos aspectos (parte dois), diz que overlay "may not seem quite so significant" e "give quite a few pointers" (p. 93). |
| Vários planetas na mesma casa | **EXP** | "increase his involvement with the affairs denoted by that house" (p. 96). É a única regra de **repetição** que a fonte dá. |
| O overlay modifica-se pelo aspecto | **EXP** | a fonte manda **combinar** a entrada de casa com o par planeta/planeta do capítulo anterior (p. 95). |

**Decisão para o projeto:** overlays estão sustentados e **entram, como camada secundária e só quando o dono da casa tem hora** (o que a sua filosofia já exige). **Reservas:** (a) sem número para "perto da cúspide", a regra mínima e honesta é a casa **calculada** (Placidus) **sem ajuste**, e os planetas a menos de um limiar da cúspide ficam marcados como `proximoDaCuspide` **com o limiar em aberto**; (b) as 120 entradas são escritas como "planeta do homem na casa da mulher", então há que reescrever em termos de **dono da casa** e de **planeta de fora**, sem gênero.

---

## 4. Direção A→B e B→A

| Contexto | Status | O que a fonte sustenta |
|---|---|---|
| Aspectos (planeta × planeta) | **NÃO** como direção real | em dois mapas natais não há velocidade relativa, e a fonte **não define quem "aplica" sobre quem**. |
| **Papel dentro do par** | **EXP** | os textos distinguem os dois lados do par ("the Sun provides a willing listener, Mercury communicates", "the Sun is likely to play the leading role, the Moon adapting"; "Saturn ... the one who suffers most" é prescrição e não será usada). É **papel**, não direção. |
| Direção por **gênero** | **EXP e descartada** | "man's Mars / woman's Venus" em Vênus/Marte, Sol/Lua e Sol/Marte (p. 59, 61, 75). O produto não usa gênero, então **essas passagens não podem ser traduzidas sem perda**. Registro como lacuna. |
| Overlays | **EXP** | direção é o centro da leitura (seção 3). |
| Planeta no ângulo do outro | **EXP** | o planeta de quem **está no ângulo** da outra pessoa é o que "lembra" (p. 55). Direção natural: corpo → ângulo. |

**Em resumo:** a direção A→B é **sustentada para overlays e para planeta-sobre-ângulo**, e **não é sustentada para aspecto planeta-planeta**. O campo `direcao` do aspecto fica **nulo**, com `papelA` e `papelB` vindos da tabela do par, onde a fonte distingue os lados.

---

## 5. Hora desconhecida

| Tema | Status | |
|---|---|---|
| A fonte trata de sinastria com hora desconhecida? | **NÃO** | o texto 2 a 139 supõe horas conhecidas. Só nas imagens (p. 141) há uma frase sobre horas desconhecidas, e é para o horóscopo de relação. **A filosofia de hora desconhecida é toda do projeto**, e não deve ser apresentada como da fonte. |
| Ângulos e casas indisponíveis | **projeto** | coerente com a fonte: ângulos e casas são onde ela é mais específica, e ela **assume** que se conhecem. |

**Regras adotadas (as suas, aplicadas ao que `mapa.ts` já faz):**

| Elemento | Regra |
|---|---|
| Asc, MC, IC, Desc, casas, overlays que dependem de casa, planeta no ângulo | **indisponível** (lista de ids por pessoa) |
| Lua, signo | **utilizável** quando o intervalo do dia cabe em um signo; **ambígua** quando pode trocar. Isso já existe (`signoDefinido`). A Lua é descartada **só** do cálculo de aspectos, não do mapa. |
| Lua, aspectos | só se vale no intervalo inteiro. Com teto de 5° (seção 2.2), **na prática nunca passa**; o fato de indisponibilidade é explícito. |
| Outros corpos, signo e aspectos | regra do intervalo já existente (pior orbe do intervalo, 400 passos). |
| **Retrogradação** | ver seção 9: `direto`, `retrogrado` ou `indeterminado`. |
| Contagem de elementos e modos | a fonte desempata por Ascendente, depois pelo grupo que contém o Sol, depois pelo regente do Asc (p. 39 a 40). **Sem hora**, os passos do Asc somem, e o do Sol continua. Corpo com signo indefinido (Lua) conta como `indeterminado`, e o domínio do elemento é dito **condicional**. Isto é adaptação minha. |
| Grupos de casas (angular/sucedente/cadente), hemisférios, planetas angulares | **indisponíveis** sem hora. |

Cada pessoa leva `indisponivel: Indisponivel[]` nos fatos, no formato da seção 8, e o verificador (seção 11) reprova qualquer menção.

---

## 6. Pontos em comum × dinâmica A↔B

A separação que você pede **tem sustentação na fonte**: o livro trata as duas coisas em capítulos diferentes (capítulos 4 e 5 para semelhanças de temperamento; 7 e 8 para aspectos e casas) e diz que o primeiro nível "is only a beginning" (p. 32).

| Similaridade calculável | Status | O que a fonte sustenta | Hora |
|---|---|---|---|
| **Elemento dominante** (contagem de corpos por elemento) | **EXP** | "It is the element which contains the greatest number of bodies" que importa, **e não o do Sol** (p. 32, 39). Regra de desempate (p. 40). Texto para as 10 combinações de elemento (p. 42 a 46). | Parcial (Lua) |
| **Elemento do Sol** | **EXP, com ressalva** | só "a beginning"; o Sol pode estar num elemento e a maioria dos corpos em outro | não depende |
| **Modo dominante** (cardinal, fixo, mutável) | **EXP** | contagem por maioria; "theoretically better for the Sun signs not to belong to the same Quadruplicity" (p. 46 a 47); textos para as combinações | Parcial (Lua) |
| **Mesmo signo em corpo rápido** | **EXP** | "difficulties are likely" (p. 30) | Parcial |
| **Mesmo signo em Lua** | **EXP, citando estatística** | "an identity of lunar positions often occurs when the charts of compatible couples are compared" (p. 30). **Não consigo verificar a estatística.** | Depende da hora |
| **Mesmo signo em corpo lento** | **EXP** | "less likely to interfere" (p. 30). Para coetâneos, **não é informação**. | não depende |
| Padrão planetário (Bowl, Bucket, Bundle, Locomotive, See-Saw, Splash, Splay) | **EXP como comparação, NÃO como detecção** | a fonte compara os sete tipos (p. 36 a 38) e **não define como detectar cada um** (cita M. E. Jones sem os critérios). **Sem a definição de Jones, não dá para calcular de forma auditável.** | não depende |
| Grupos de casas, hemisférios | **EXP** | p. 33, 49 a 51 | **precisa de hora** |

**Duas observações que ajudam a preservar contradição:**
- A fonte diz que **semelhança demais também é risco**: "Too great a similarity between horoscopes may mean ... competition may replace co-operation" (p. 30), e "too great an emphasis on the same element ... can ultimately produce ... boredom" (p. 39). O produto pode dizer isso **sem inventar**.
- O elemento dominante "em comum" pode ser **contradito** por aspectos entre planetas discordantes: "Two horoscopes which both have a preponderance ... in the same element will hardly blend well if Mars and Saturn in one fall on the places of Saturn and Mars" (p. 32).

---

## 7. O que a fonte sustenta, por componente

| Componente | Sustentação | Observação |
|---|---|---|
| Aspectos maiores A↔B | **EXP** | seção 2.1 |
| Quincunce | **EXP** | já no projeto |
| Semi-sextil, semi-quadratura, sesquiquadratura | **EXP** | **o projeto não os calcula**. Fora do MVP, se você quiser. |
| Orbe: teto por grupo | **EXP, em faixa** | seção 2.2; **valor dentro da faixa é editorial** |
| Orbe por planeta (não luminar) | **NÃO** | |
| Orbe para ângulos | **NÃO** | |
| Glosa por **par de planetas** (55 pares) | **EXP** | **fecha a lacuna 2 da auditoria anterior.** Cada par traz leitura **favorável** e **adversa/debilitada**, às vezes por aspecto (conjunção, oposição, quadratura, quincunce). Coberto 55 de 55. |
| Glosa por planeta em casa (120) | **EXP** | **fecha a lacuna 3.** |
| Sentido das 12 casas | **EXP** | |
| Papel dos ângulos | **EXP, parcial** | seção 2.4 |
| Relevância numérica | **NÃO** | |
| Vínculo muda a ênfase | **EXP** | "All chart comparisons ... follow the same general rules ... but with modifications according to the purpose of the partnership": casa 2 em sociedade, casa 5 e Marte/Júpiter em esporte (p. 30). Pares trazem variações por vínculo (negócio, pai e filho, professor e aluno, amizade). **Sustenta exatamente "vínculo altera ênfase, nunca o cálculo".** |
| Condição natal (aflição, dignidade) | **EXP** | o livro modula **todo** par por ela. O projeto **não** calcula aflições natais nem dignidades essenciais para sinastria. O `caelus` tem `dignity-score`, que eu **não** auditei. **Lacuna** (seção 12). |
| Mapa composto, Davison chart, progressões | fora de escopo | |

---

## 8. Modelo de fatos (proposta, sem pesos)

**Sem `forca` numérica.** O campo existe e fica `null` até a calibração. O que entra no lugar são **medidas** (que não são pesos).

```ts
type Fonte = { regra: string; pdfPagina: number }   // metadado interno, nunca vai ao leitor

type Pessoa = "A" | "B"

type Indisponivel =
  | "asc" | "mc" | "ic" | "desc" | "casas" | "overlays"
  | "lua_signo" | "lua_aspectos"
  | `retrogradacao:${string}`      // por corpo
  | "grupos_de_casa" | "hemisferios"

type Disponibilidade = {
  dependeDeHora: boolean
  robustez: "firme" | "indeterminado"    // firme = vale no intervalo inteiro de ambas as pessoas
}

type FatoAspecto = {
  tipo: "aspecto"
  id: string                       // "A.venus~B.mars:trine"
  corpoA: string; corpoB: string   // inclui "asc" | "mc" só com hora de quem os tem
  aspecto: "conjunction" | "opposition" | "square" | "trine" | "sextile" | "quincunx"
  orbe: number
  orbeLimite: number               // vem da tabela de orbes (seção 2.2)
  grupoDeOrbe: "maior" | "maior_com_luminar" | "menor"
  categoria: "harmonico" | "discordante" | "variavel"   // as três da fonte, p. 55
  papelA: string; papelB: string   // lados do par, como a fonte os distingue
  direcao: null                    // não sustentada para aspecto
  forca: null                      // pendente de calibração
  exatidao: number                 // orbe / orbeLimite: medida, não peso
  disponibilidade: Disponibilidade
  fonte: Fonte
}

type FatoOverlay = {
  tipo: "overlay"
  id: string                       // "A.mars@B.casa7"
  corpoA: string; casaB: number    // planeta de A na casa de B
  direcao: "A_em_B" | "B_em_A"     // quem é o planeta, quem é o dono da casa
  proximoDaCuspide: { cuspide: number; distancia: number } | null   // sem limiar definido
  sistemaDeCasas: string           // "placidus" ou o que o motor usou
  disponibilidade: Disponibilidade
  fonte: Fonte
}

type FatoSemelhanca = {
  tipo: "semelhanca"
  id: string
  dimensao: "elemento" | "modo" | "signo_do_corpo"
  padraoA: string; padraoB: string
  tipoDeSemelhanca: "igual" | "complementar" | "oposto" | "diferente"
  contagensA?: Record<string, number>; contagensB?: Record<string, number>
  condicional: boolean             // true quando a Lua está indeterminada na contagem
  fonte: Fonte
}

type FatoIndisponibilidade = { tipo: "indisponivel"; pessoa: Pessoa; item: Indisponivel; motivo: "hora_desconhecida" | "intervalo_cruza_signo" | "estacao_no_dia" }
```

**Relevância sem votação, em duas camadas separadas:**

| Camada | Conteúdo | Origem |
|---|---|---|
| **Regra da fonte** | (1) orbe menor = contato mais significativo; (2) planetas e ângulos são o principal; (3) pares com papel de "índice" (luminares, Vênus/Marte, Mercúrio/Mercúrio, Lua/Lua) acima de pares marcados como secundários (Lua/Mercúrio); (4) exteriores entre coetâneos abaixo; (5) overlay é camada secundária; (6) vários planetas numa mesma casa aumentam o envolvimento; (7) a condição natal modula o par. | Davison |
| **Calibração editorial necessária** | **os números**: o quanto cada item pesa. O projeto já tem `base × exatidão × papel` em `interconexoes.ts`, compatível com 1 a 4 e **sem origem no livro**. A agregação sem contagem (nota máxima, bônus de recorrência limitado) também. | produto |

**A repetição de dinâmica** (a mesma ideia dita por vários aspectos) é regra do **produto**: o Davison não a trata. Só tem a regra de casa (item 6).

---

## 9. O que do código atual serve (revisão com a fonte na mão)

### 9.1 Reaproveita sem alterar
| Peça | Por quê |
|---|---|
| `mapaNatal()`, `DadosNascimento`, `MapaNatal` | todo o necessário para A e para B, com `horaConhecida`, `incerteza`, `signoDefinido`, `cuspides`, `asc`, `mc`. |
| `ceu.ts` (`motor`, `indiceDoSigno`, `grauNoSigno`, `corposEm`) | camada única do motor. |
| `separacao()`, `casaDe()`, `ANGULO_ASPECTO` de `interconexoes.ts` / `simbolos.ts` | aritmética de ângulo e casa, já testada. |
| Regra do intervalo (400 passos) | generaliza para dois intervalos. |
| `cidades.ts`, `/api/cidades`, `resolverZona()` | cadastro de local da segunda pessoa. |
| `hashDoMapa()` | impressão digital do mapa de cada pessoa. |
| `editorial.ts` (`PREVISAO`, `CONSELHO`, `FALSA_PRECISAO`, `PROIBIDAS`, `TRACOS`) | verificador. |
| `getUserEntitlement` + `isPaidPlan` | gate; ordem segurança → plano → mapa → geração da rota de Interconexões. |
| `recordAiUsage` | só ganha `'sinastria'` na lista (e na constraint do banco). |
| `verify-astro` e golden | protegem o motor. |

### 9.2 Reaproveita com adaptação
| Peça | Adaptação |
|---|---|
| `interconexoes.ts` | função **irmã** para A↔B. O código atual assume "um lado é trânsito" (`PESO_TRANSITO`, `aplicativo`). |
| `fatosPessoais` | texto com **dois donos**. |
| `verificarSintesePessoal` | versão própria (seção 11). |
| `interconexoes-server.ts` | cache por **par**, não por dia. |
| `ORBE_MAX`, `ORBE_MAX_LUA` | **não reutilizar**: são de trânsito (seção 2.2). |

### 9.3 É novo
Tabela de orbes de sinastria; cálculo A↔B; overlays; semelhanças; glosas por par e por casa; mapeamento função→bloco; indisponibilidades; verificador; tabelas `saved_people` e `synastry_readings`.

### 9.4 Funções do `caelus`
`synastryAspects`, `synastryOverlays` e `compositePlacements` existem (`relational.d.ts`). `synastryAspects` usa `DEFAULT_ORBS` do caelus (conjunção 8, sextil 4, quadratura 7, trígono 7, oposição 8), que **o Davison não sustenta** (seção 2.2). **Não usar nos cálculos de produção.** Usar `synastryAspects` e `synastryOverlays` **só como verificação cruzada nos testes**, passando orbes iguais aos nossos. `compositePlacements` é composite: fora de escopo.

---

## 10. Retrogradação: o defeito é real

**Reproduzido**, não só lido. Rodei `mapaNatal` com a hora desconhecida em dois dias em que um planeta estaciona (consulta ao `stations()` do caelus em 2000 a 2003):

| Dia | Corpo | 00:01 | 23:59 | **sem hora (hoje)** |
|---|---|---|---|---|
| 2000-02-21 | Mercúrio | direto | **retrógrado** | **retrógrado** (valor de 12:00) |
| 2001-05-11 | Marte | direto | **retrógrado** | **direto** (valor de 12:00) |

Nos dois dias o planeta **muda de estado**, e o mapa sem hora devolve um único valor sem aviso (Mercúrio, retrógrado; Marte, direto). Para Marte, o valor devolvido (direto) **deixa de valer no fim do dia**, e o código não diz. Para Mercúrio, o valor (retrógrado) **não valia no começo do dia**.

**Origem:** `mapa.ts` guarda `retrogrado: Boolean(bruto[corpo].retrograde)` do instante de referência (12:00), enquanto a **longitude** é tratada por intervalo.

**Correção proposta** (não implementada):
- calcular o estado nas 25 amostras que a função `intervalos()` **já faz** (custo zero extra);
- `retrogrado: "direto" | "retrogrado" | "indeterminado"`, com `indeterminado` se as amostras divergirem;
- com hora conhecida, o valor continua booleano (compatível).

**Por que não implemento agora.** O campo `retrogrado: boolean` é lido em outros lugares (`interconexoes.ts`: `retrogrado` de `PontoNatal`; `apresentar.ts`; fatos). Mudar o tipo atravessa essas peças e a tela de Interconexões. A mudança segura é **aditiva**: manter `retrogrado: boolean` como está e **acrescentar** `retrogradoEstado: "direto" | "retrogrado" | "indeterminado"`, que a sinastria passa a usar. Isso não toca nada existente. **Preciso do seu sim para isso**, e eu o faria com teste (as duas datas acima viram fixtures).

---

## 11. Verificador de sinastria

### 11.1 O que o código **pode garantir** (determinístico)

| # | Regra | Como |
|---|---|---|
| 1 | **Aspecto inexistente.** "Vênus de A em trígono com Marte de B" sem esse fato. | Duas leituras: (a) co-ocorrência `corpo + aspecto + corpo` na mesma frase contra o conjunto de ids de fato; (b) **exigir que cada afirmação declare o id do fato** e conferir que o id existe e que os dois corpos citados na frase **são** os do fato. (b) é o que dá garantia; (a) pega a omissão. |
| 2 | **Trocar A e B.** | Cada corpo é nomeado com o dono. O verificador procura "corpo + dono" e confere o dono no fato. Onde o mesmo corpo existe nos dois lados, a frase **sem dono** reprova. |
| 3 | **Overlay inventado.** | Mesma lógica: `corpo + casa + dono` contra os `FatoOverlay`. |
| 4 | **Casa, Asc, MC com hora desconhecida.** | Vocabulário fechado por pessoa a partir de `indisponivel`: qualquer menção reprova. |
| 5 | **Lua como certa quando é ambígua.** | `lua_signo` indisponível: o signo da Lua daquela pessoa **não pode aparecer**; só "a Lua dele" sem signo. Aspecto lunar de pessoa sem hora: reprova. |
| 6 | **Retrogradação indeterminada dita como fato.** | "retrógrado" ou "direto" para corpo com `retrogradoEstado = indeterminado` reprova. |
| 7 | **Omitir todas as tensões ou todas as facilidades quando ambas existem.** | Contagem **só de existência**: se há ao menos um fato `discordante` e um `harmonico` entre os de maior relevância, a síntese final precisa **citar pelo menos um id de cada**. É checagem de presença, **não de votação**. |
| 8 | **Contradição apagada.** | Se só existe um dos lados, **nenhuma frase pode afirmar o outro** (o lado ausente não tem id para citar). |
| 9 | **Proporcionalidade (fato menor virando tema).** | O primeiro fato citado na síntese final precisa estar entre os de maior relevância. **Depende do limiar de relevância, que ainda não está calibrado.** |
| 10 | **Previsão, conselho, índice, veredito.** | listas de expressões (`PREVISAO`, `CONSELHO`) mais lista nova: *compatível, compatibilidade, combinam, não combinam, match, alma gêmea, porcentagem, vai durar, para sempre*. |
| 11 | **Tamanho, travessão, expressões vetadas, hora, data.** | herdados. |
| 12 | **Karma, encarnação, benéfico/maléfico.** | lista nova (a fonte usa essas palavras; o produto não). |

### 11.2 O que **só se verifica semanticamente** (não garantido por código)

| Risco | Por que o código não pega |
|---|---|
| **Aspecto tenso transformado em previsão fatalista** ("essa quadratura vai desgastar vocês") | a lista de expressões pega as formas conhecidas, mas fatalismo se escreve de infinitas maneiras sem verbo no futuro ("essa relação carrega um atrito de base"). |
| **Aspecto harmônico transformado em promessa** ("o trígono garante harmonia") | idem. |
| **Causalidade** ("porque a Lua dela quadra Saturno dele, ele a faz se sentir criticada") | a causalidade se constrói com "porque", "faz", "leva a", que a lista cobre em parte; a **forma sem marca** não. |
| **Afirmar compatibilidade global** | pega-se "combinam", "compatíveis"; a forma "é uma relação que funciona" passa. |
| **Qualidade da interpretação** | não verificável, como no verificador atual. |

**Para o semântico:** a única ferramenta é a **segunda leitura por modelo** (verificador por LLM), que tem custo e que eu **não proponho no MVP**. Recomendo medir primeiro o que escapa, em pares reais, e decidir depois.

---

## 12. Lacunas ainda não cobertas pela fonte

1. **Valor do orbe** dentro de "2 a 3" e "1 a 2 a mais" (a fonte dá faixa).
2. **Orbe para Asc/MC**, e se luminares ampliam para ângulos.
3. **Orbe diferenciado por planeta** (pessoais × lentos): não existe.
4. **Aplicativo/separativo** em sinastria natal: não existe.
5. **Relevância numérica**: não existe.
6. **Limiar de proximidade da cúspide** (a frase "about five degrees" é ambígua).
7. **Detecção dos padrões de Jones**: a fonte compara, não define.
8. **Hora desconhecida em sinastria**: a fonte supõe horas conhecidas.
9. **Condição natal e dignidades** como modulador do par: a fonte exige; o projeto não calcula para sinastria. Sem isso, **todo par de ch. 7 fica sem a metade "adverso ou debilitado"**, e a glosa vira só "aspecto favorável/adverso". **É a maior lacuna prática.**
10. **Passagens dependentes de gênero** (Vênus/Marte, Sol/Lua, Sol/Marte): sem tradução neutra, perdem conteúdo.
11. **Passagens com prescrição, previsão, karma** (muitas): não usáveis. Uma parte relevante de cada glosa será **descartada**.
12. **Sem leitura** para Asc/MC como corpo (só como alvo, dentro de casa 1 e 10), nodos, Quíron, semi-sextil e afins.
13. **Edição do livro** não confirmada.
14. **Capítulos 9 e 10** (71 páginas, imagem): não lidos; fora de escopo, mas o PDF está **truncado** em 10.

---

## 13. Limite de 100 anos (somente documentação)

| Pergunta | Resposta |
|---|---|
| Por que existe? | `ANOS_ACEITOS = 100` entrou no commit `e1729f1` (As Interconexões). O comentário diz "janela de nascimentos que o motor tem corpus para sustentar". O corpus de regressão (`astro-fixtures.ts`) cobre **1926 a 2026**. Ou seja: **100 anos é a janela do golden do projeto**, não do motor. |
| Até onde o motor é confiável? | O `accuracy.json` do caelus mede **1000 a 3000**, com erros máximos de **0,5″ a 1,0″** para Sol e planetas pessoais, **2,5″ a 9,6″** na Lua (série embutida) e **até 4,6″** em Netuno. Contra um limiar de orbe de **1° = 3600″**, isso é irrelevante. **O motor astronômico não é o limite.** |
| O que **é** o limite real? | **Fuso e hora local.** `caelus-birth` aplica as regras históricas do tzdb (horário de verão, meio período, guerra, "pre-1970 rules"). A **zona vem das coordenadas atuais** (mapa embutido, `tz-lookup`), então fronteiras que mudaram são um risco que **não consigo quantificar**. Antes da hora-padrão, a hora local é solar. |
| Impede casos familiares relevantes? | Sim, **na borda**: quem nasceu antes de 1926 tem hoje **mais de 100 anos**. Avós, no vínculo família, ficam de fora **só se tiverem mais de 100 anos hoje**, o que é raro mas existe (e **bisavós falecidos** que o usuário queira comparar). O banco aceita desde 1900. |
| O que fazer? | **Nada no MVP.** A abertura depende de estender o golden (fixtures de 1900 a 1925, incluindo zonas com regras antigas), não do motor. |

---

## 14. Privacidade: inventário técnico (segunda pessoa)

| Item | Estado proposto |
|---|---|
| **Campos armazenados** | `nickname` (1 a 40), `born_on`, `born_at` (nulo = desconhecida), `tz`, `tz_status`, `lat`, `lon`, `place_label`, `created_at`, `owner_id`. **Não armazena:** e-mail, telefone, nome completo, foto, vínculo (fica na leitura). |
| **Onde** | Postgres do Supabase, tabela `saved_people`, RLS só do dono (mesmo molde de `birth_data`). |
| **Por quanto tempo** | até o usuário apagar, ou até a conta ser apagada (`on delete cascade`). **Hoje o repositório não tem rota nem tela de exclusão de conta** (busca em `app/` e `components/`), então o "ou" da conta **não está fechado**. |
| **Cache** | `synastry_readings` (service role, sem acesso do cliente): texto + fatos + diagnóstico. Chave por dono + pessoa + idioma + vínculo. `pair_hash` com **HMAC com segredo do servidor**, não hash simples: data e cidade têm pouca entropia e um hash simples pode ser invertido por força bruta. |
| **Logs** | as rotas atuais registram só `dia`, `locale`, `modo`, `tentativas`, `ms`. A nova **não registra** data, local nem apelido. `ai_usage` guarda `user_id`, `model`, tokens e `seed`: o `seed` **não pode conter** nada da pessoa (usar `${locale}` fixo ou um id opaco). |
| **O que vai ao modelo** | apenas **fatos**: posições, ângulos, orbes, casas, indisponibilidades, vínculo. **Não vai:** nome, apelido, data, hora, cidade. As pessoas entram como "você" e "a outra pessoa". **Posição planetária é dado derivado do nascimento**; a política de retenção da OpenAI para chamadas de API **não foi verificada aqui**. |
| **Como apagar** | por pessoa (`delete` com cascata para as leituras) e "apagar todas". Conta apagada leva tudo. |
| **Apelido basta?** | **Sim.** `nickname` livre; aviso na tela para não usar nome completo. |
| **É possível não guardar o mapa secundário sem o usuário pedir?** | **Sim**, em "comparação avulsa": calcula, gera, devolve, e **não grava** pessoa nem leitura. **Custo:** perde o cache, então cada reabertura gera de novo (cerca de US$ 0,02). Recomendo **avulsa como padrão e "salvar esta pessoa" como ato explícito**, porque responde ao seu "sem o usuário pedir". Tem um efeito colateral de produto: a leitura some se a página fechar, a menos que o usuário salve. |
| **Política de privacidade** | **não existe no repositório.** Precisa de texto: o usuário informa dados de terceiros, o terceiro não é notificado, o que é guardado, por quanto tempo, como apagar. **Não redijo juridicamente.** |

---

## 15. Custo estimado

Estimativa, sem medição (`ai_usage` real não está acessível: `.env.local` sem service role). Preços do `pricing.ts`: `gpt-4o`, US$ 2,50 / M entrada e US$ 10,00 / M saída.

O que muda em relação à primeira estimativa: **as glosas do Davison viram dados que entram no prompt** (a leitura de cada par deixa de depender do modelo).

| Peça | Entrada (tokens) |
|---|---|
| Regras e prompt fixo | ~1.600 |
| Fatos: ~12 aspectos, ~6 overlays, 3 a 4 semelhanças, indisponibilidades | ~1.200 |
| **Glosas do par** (uma por aspecto, ~50 a 80 tokens cada, já limpas de prescrição e gênero) | ~800 |
| **Total de entrada** | **~3.600** |
| **Saída** (nove blocos + afirmações com id) | **~1.300** |

| Cenário | Entrada | Saída | Custo |
|---|---|---|---|
| 1 chamada | 3.600 | 1.300 | **~US$ 0,022** |
| 1 chamada + 1 reparo | ~8.500 | ~2.600 | **~US$ 0,047** |
| 3 chamadas | ~13.500 | ~3.900 | **~US$ 0,073** |
| Molde determinístico | 0 | 0 | US$ 0 |

**Cálculo.** Dois mapas (1 carta cada com hora, 25 sem hora) + 2 × 10 × 12 pares × 6 ângulos: milissegundos. O custo é o modelo.

**Cache por par e reaproveitamento do cálculo.**
- O cálculo é **puro**: mesmo par de entradas, mesma saída. **Não é preciso guardá-lo**; recalcular custa menos que ler do banco. Só o **texto** é cacheado.
- Chave do cache: `HMAC(owner, mapaHashA, mapaHashB) + vínculo + idioma + versão`. A **versão** cobre a tabela de orbes, as glosas e o prompt: mudou qualquer um, o cache é tratado como ausente.
- O **vínculo** muda só a ênfase; são **leituras distintas** (uma por vínculo), cada uma com custo próprio. Se o usuário alternar vínculos, paga cada um. Alternativa de produto: gerar uma vez e **reordenar blocos no cliente** conforme o vínculo (sem custo), perdendo a ênfase redigida.
- Reabrir a mesma leitura não gasta.
- **Não** decidi cota (Essencial, própria ou ilimitada), conforme pedido.

---

## 16. Plano mínimo de implementação

| # | Etapa | OpenAI | Pré-requisito |
|---|---|---|---|
| 0 | Decidir os valores dentro das faixas de orbe (seção 2.2) e a regra de ângulos | não | **você** |
| 1 | `retrogradoEstado` aditivo em `mapa.ts`, com as duas datas como fixtures | não | seu sim (seção 10) |
| 2 | `lib/astro/sinastria.ts`: aspectos A↔B (orbes da seção 2.2), `indisponivel`, regra do intervalo para duas pessoas | não | 0 |
| 3 | Overlays (dono da casa, sistema usado, `proximoDaCuspide` sem limiar) | não | 0 |
| 4 | Semelhanças: elemento, modo, signo do corpo (sem padrões de Jones) | não | 0 |
| 5 | `verify:sinastria`: golden com ao menos 2 mapas com hora, A sem hora, B sem hora, os dois sem, hora ambígua, hora inexistente, latitude alta; verificação cruzada contra `synastryAspects` do caelus **com os nossos orbes** | não | 2 a 4 |
| 6 | Migration `saved_people`, `synastry_readings`, `ai_usage` (para sua revisão) | não | 0 |
| 7 | Entitlement e rota de cálculo (retorna **fatos**, sem texto) atrás de `isPaidPlan` | não | 2 a 6 |
| 8 | Verificador estrutural (regras 1 a 8 e 10 a 12 da seção 11.1) | não | 2 a 4 |
| 9 | Extração das glosas por par e por casa, **reescritas** (sem prescrição, sem gênero, sem karma), com `fonte` | não | **a decisão da lacuna 9** (condição natal) |
| 10 | Prompt, síntese, pesos, copy, chamada OpenAI | **sim** | 0 a 9 e sua autorização |

---

## 17. O que pode ser implementado **agora**, sem OpenAI

**Pode, porque a fonte sustenta e o resultado é puramente determinístico:**
1. Modelo de dados da segunda pessoa e a migration (etapa 6).
2. Cálculo dos dois mapas (já existe).
3. Aspectos A↔B **com os orbes da fonte** (etapa 2), **assim que você fixar o valor dentro da faixa**. Sem isso eu teria que escolher 2 ou 3.
4. `indisponivel` por pessoa.
5. Overlays como **posição** (casa calculada), sem ajuste de cúspide.
6. Semelhanças por elemento, modo e signo.
7. Cache e entitlement (esqueleto da rota, sem gerar texto).
8. Verificador estrutural.
9. `retrogradoEstado` (com seu sim).

**Não deve ser implementado agora, e por quê:**
| Item | Motivo |
|---|---|
| Orbe de Asc/MC | a fonte não dá |
| Orbe por planeta, aplicativo/separativo | a fonte não dá |
| Qualquer valor de `forca` | a fonte não dá |
| Limiar de cúspide | a frase é ambígua |
| Padrões de Jones | a fonte não define a detecção |
| Semi-sextil, semi-quadratura, sesquiquadratura | sustentados, mas **o projeto não os calcula** e a faixa do orbe é a de "outros aspectos" (1,5°); é decisão sua incluí-los |
| Nodos, Quíron | não sustentados |
| Glosas por par (completas) | falta decidir como tratar a **condição natal**, que a fonte usa para toda glosa |
| Prompt, síntese, copy, OpenAI | fora do combinado |

---

## 18. Decisões que preciso de você

1. **Orbe dentro da faixa.** Maiores sem luminar: **2, 2,5 ou 3°**? Com luminar: **4, 4,5 ou 5°**? Menores: 1,5°. Minha sugestão: o **teto** (3° e 5°), declarado como "teto da fonte", porque é o que ela chama de limite ("not more than").
2. **Ângulos (Asc/MC).** Aceita usar o mesmo orbe dos planetas, marcado no código como **inferência** e não como regra da fonte?
3. **Aspectos menores.** Entram (sextil-e-meio, semi-quadratura, sesquiquadratura) ou fica nos seis do projeto?
4. **Condição natal.** O par do Davison tem sempre duas valências (favorável, adverso ou debilitado). Quer que a sinastria calcule dignidades e aflições naturais **ou** que a glosa use só a valência pelo aspecto, **dizendo isso**?
5. **Retrogradação.** Posso fazer `retrogradoEstado` aditivo, com as duas datas como teste?
6. **Comparação avulsa como padrão**, e salvar como ato explícito?
7. **Edição do livro.** Se você tem a edição, vale registrar para a rastreabilidade.
8. **Implementar já** as etapas 2 a 8 (sem OpenAI)? Eu esperaria sua resposta às perguntas 1 a 4.
