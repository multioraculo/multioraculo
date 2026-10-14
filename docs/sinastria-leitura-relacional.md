# Sinastria: a leitura relacional

Este documento registra por que a Sinastria não tinha uma interpretação do encontro, o que foi construído para que tenha, e o que ainda falta para chamá-la de pronta.

## 1. O que existia

A cadeia vigente (congelada em [sinastria-congelamento.md](sinastria-congelamento.md)) é: fatos calculados → evidência selecionada (Davison parafraseado) → payload → prompt dos **nove blocos** → geração → verificador estrutural. Nenhuma rota a chama: `/api/sinastria` devolve só fatos, "sem modelo, sem custo". A tela mostra contatos, casas, pontos em comum, limites e, desde esta rodada, um resumo aritmético.

Os dados que chegam à interpretação são, por dinâmica: os fatos (aspecto com dono e orbe, ou overlay), as frases do repertório que o vínculo deixa passar, as dimensões que elas sustentam e a categoria. Chegam em **lista, na ordem de relevância do seletor**. Não chega nenhuma informação de que dinâmicas dizem a mesma coisa, quais se contradizem ou qual pesa mais além da posição.

## 2. A causa

Três decisões, todas tomadas para proteger contra invenção, produzem juntas o texto "correto e vazio" que as baterias mediram:

1. **O contrato manda não escolher.** A síntese final "descreve a configuração que permanece em aberto, sem escolher uma das forças"; a regra "CONTRADIÇÃO" manda não resolver o que a evidência deixa aberto. Isso é seguro para um verificador e produz, por construção, "há apoio e há atrito".
2. **Quem deveria integrar não tem com o quê.** O modelo recebe dez a quinze dinâmicas soltas. Sem um agrupamento, a única integração possível é a que ele inventa, e a regra de ouro o proíbe de completar. Sobra enumerar.
3. **Nove blocos fragmentam.** `onde_se_encontram`, `onde_ha_tensao`, `comunicacao`, `afeto_e_intimidade`... explicam sinais isolados, e a síntese final vira o último a repetir o que os anteriores disseram, agora sem poder concluir. As regras editoriais acumuladas (fechamento sem condição, sem "precisam", sem causalidade) eliminaram os defeitos graves e deixaram o texto cauteloso, repetitivo e abstrato.

Exemplo real da bateria 4 (amizade, `P-5facf1`, `gpt-4o`, aprovado nas regras de dono e fundamentação):

> **Síntese final:** A relação entre vocês é marcada por uma dualidade de tensão e cooperação. Enquanto alguns aspectos podem gerar atritos, como a incerteza e a busca por supremacia, outros oferecem oportunidades de apoio e crescimento mútuo. A presença de elementos comuns pode facilitar o entendimento, mas as diferenças significativas exigem cuidado para evitar que se tornem obstáculos. A convivência pode ser enriquecedora se as facilidades forem valorizadas sem ignorar os desafios.

Nenhuma frase aí é falsa, e nenhuma é desta relação: serve a qualquer par, não escolhe um tema, não diz o que a dualidade significa e fecha com a condição que o contrato já proibia.

## 3. A solução

Uma camada nova, **aditiva**, que não toca o cálculo, o seletor, os orçamentos, os nove blocos nem a UI antiga.

### 3.1 O mapa de eixos (`lib/astro/eixos-sinastria.ts`)

Código decide o que o modelo não pode decidir sem inventar:

- Cada dinâmica pertence a um **tema** (reconhecimento, acolhimento, troca, atração, iniciativa, expansão, segurança, autonomia, idealização, intensidade). O planeta lento dá o tema (Plutão: intensidade e poder; Netuno: idealização; Urano: autonomia; Saturno: segurança e limite; Júpiter: expansão); entre planetas pessoais, Mercúrio é troca, Vênus e Marte atração, Marte sozinho iniciativa, Lua acolhimento, Sol e ângulos reconhecimento. **Esta tabela é editorial e está rotulada como tal.** O tema é um nome para o que a dinâmica já diz; não cria evidência.
- A **polarização** (apoio, tensão, ambas) usa os mesmos critérios (`sustentaEncontro`, `sustentaTensao`) que o verificador já usava.
- O **peso** não é contagem: a melhor posição manda e as demais somam 30% do peso delas; overlays somam pouco e com teto. Três dinâmicas do fim da lista não pesam o que pesa uma do topo.
- Decide, por código, **um ou dois temas centrais**, os **secundários**, os **isolados** (um contato só, de baixa posição ou de overlay, sem força para definir o vínculo), o **perfil** (apoio, tensão, ambivalente) e a **contradição** que não pode ser escondida (dinâmica das quatro primeiras posições que vai contra o perfil do centro).

Na amostra de 18 relações, o mapa produz os três perfis (8 com pendência para o apoio, 9 ambivalentes, 1 para a tensão) e nunca elege um tema isolado como central.

### 3.2 O contrato novo (`prompt-leitura-sinastria.ts`)

Schema tipado e validável, de quatro campos em vez de nove blocos:

| campo | função |
|---|---|
| `parecer` | abre com a interpretação central, em linguagem direta, apoiada no contato de maior peso do eixo central; se o perfil é ambivalente, diz onde está a ambivalência |
| `aproxima_e_tensiona` (1 a 2) | integra os sinais: o que reforça a mesma dinâmica, o que a convergência acrescenta, a contradição marcada e como ela modifica a leitura, os secundários |
| `significado` | o sentido simbólico do tema central para o vínculo, diferenciando as duas pessoas; sem rótulo de personalidade |
| `na_relacao` (ou `null`) | como pode aparecer, só no campo que a evidência sustenta, como possibilidade |

O prompt **inverte a regra de não escolher**: o modelo escreve o centro que o código decidiu, em vez de manter tudo em aberto. Continuam em vigor todas as proibições: regra de ouro, donos, o que não se sabe (com a incerteza dita no ponto em que importa, sem neutralizar o resto), conselho, previsão, causalidade, diagnóstico, nota, veredito, fechamento prescritivo. A palavra "arquétipo" continua vetada na tela (como em todo o Multioráculo); a interpretação simbólica que ela designa é exigida.

### 3.3 O verificador (`verificador-leitura-sinastria.ts`)

Reaproveita, sem enfraquecer, as regras dos nove blocos (dono trocado, aspecto e casa inexistentes, Ascendente sem fato, Lua e retrogradação indeterminadas, veredito, previsão, conselho, causalidade, bastidor, semelhança como garantia, S8, vínculo, fechamento). Para isso, `verificador-resposta-sinastria.ts` ganhou `export` em algumas constantes e a função `violacoesDeSemelhancaEVinculo`, extraída sem mudar comportamento (os testes dos nove blocos continuam iguais). O que é novo:

- **Hard:** o parecer cita dinâmica de eixo central e nomeia pelo menos um planeta ou ângulo (um parecer sem contato real serviria a qualquer casal); com centro ambivalente, cita apoio e tensão; a contradição relevante aparece fora do parecer; o significado cita o eixo central; `na_relacao` só com evidência de campo concreto; "arquétipo" em qualquer flexão; tamanho acima da tolerância de 10%.
- **Aviso:** a fórmula genérica "apoio e desafio", convergência sem citar mais de uma dinâmica, repetição entre parágrafos (≥ 50% de palavras de conteúdo em comum), travessão, tamanho até 10% acima.

### 3.4 A geração e a apresentação

`gerar-leitura-sinastria.ts`: geração, verificação, **no máximo um reparo** direcionado; sem molde (um molde seria o resumo de fatos com cara de interpretação). Falhando, devolve `indisponivel` e a tela fica como sempre foi. A tela ganhou a seção "A leitura do encontro" (parecer em corpo grande, depois "O que aproxima e o que tensiona", "O que isso significa" e, se houver, "Como pode aparecer"), que só aparece quando `mostrado.leitura` existe.

## 4. O que foi e o que não foi validado

**Validado, sem chamada paga** (`npm run verify:sinastria-leitura`, 849 conferências, dentro do `prebuild`): o mapa é determinístico, cobre toda dinâmica em exatamente um eixo, nunca elege tema isolado como central, nunca põe a contradição dentro do centro; uma leitura escrita à mão passa nas 18 relações × 5 vínculos; cerca de vinte mutações são reprovadas pelo motivo certo (chave ausente, id inventado, parecer fora do centro, parecer sem corpo, parecer de um lado só com centro ambivalente, contradição escondida, significado fora do centro, "arquétipo", compatibilidade, duração, conselho, fecho condicional, bastidor, termo de outro vínculo, tamanho); o pipeline recupera com um reparo e nunca passa de duas chamadas. Os testes dos nove blocos (`verify:sinastria-sintese`, `-geracao`) seguem verdes.

**Primeira bateria paga (autorizada, 6 gerações, `gpt-4o`, US$ 0,228; relatório local em `data/bateria-sinastria/leitura1/relatorio.md`).** As mesmas 6 entradas da bateria 4, para comparar com a síntese antiga. O verificador prova fundamentação e contrato; não prova que a leitura é boa. A avaliação editorial abaixo é minha, sobre as gerações reais, e não substitui a leitura humana.

| entrada | vínculo | perfil do centro | resultado na hora (verificador v1) | reverificado com o verificador atual |
|---|---|---|---|---|
| N-008490 | trabalho | apoio | reparo | **reprova** (usa "eixo") |
| N-e2c35a | amizade | apoio | reparo | aprova |
| N-bfa037 | família | ambivalente | indisponível | **aprova** (era falso positivo, ver abaixo) |
| N-383686 | romântico | apoio | geração | aprova |
| L-ee5f90 | amizade | tensão | geração | **reprova** ("eixo"; "você, representado por Netuno", que ainda troca o dono) |
| N-6b7f01 | família | apoio | indisponível | **reprova** (dono trocado de verdade, mais "eixo") |

Três correções saíram desta bateria, todas medidas contra as gerações reais:

1. **Falso positivo do verificador de dono.** "O sextil entre seu Marte e a Vênus da outra pessoa sugere X, mas a quadratura entre sua Vênus e Marte dela indica Y" estava certo e era reprovado: com dois aspectos e quatro corpos na mesma frase, o verificador não sabia qual liga com qual. `verificarSinastria` ganhou a opção `porOracao` (divide só nos conectivos adversativos "mas", "porém", "contudo", "todavia", "enquanto"), usada só pela leitura; o quadrado que não existe continua reprovado (teste), e os nove blocos não mudam.
2. **Vazamento do andaime.** 3 das 6 leituras escreveram "o eixo do reconhecimento" ou "o eixo central do vínculo": o modelo repetiu o vocabulário do bastidor. "Eixo", "mapa de eixos" e "perfil do centro" agora são violação, e o prompt tem a regra SEM ANDAIME.
3. **Dono trocado ao narrar papéis.** Em 2 das 6, o modelo trocou quem tem o Sol e quem tem a Lua ao escrever "você ilumina, ela estrutura" ("seu Sol em sextil com a Lua da outra pessoa" quando o fato é "sua Lua com o Sol da outra pessoa"), e uma vez escreveu "você, representado por Netuno" (o Netuno era da outra pessoa). Os nove blocos tinham 0 troca de dono em 46 gerações porque descreviam o contato; a leitura narra papéis, e é aí que o dono escapa. O prompt ganhou o QUADRO DE DONOS e a regra de manter ordem e donos do fato; o verificador reprova "representado por <planeta>"; o reparo agora leva os contatos exatos quando a violação é de dono. **Essas mudanças de prompt NÃO foram medidas com modelo**: a bateria autorizada já foi gasta.

**O que a leitura melhorou, comparada à síntese antiga** (as 3 que aprovam sob o verificador atual): abre com um parecer que nomeia o tema e o contato ("O encontro entre vocês gira em torno de reconhecimento e complementaridade, com forte apoio entre sua Lua e o Sol da outra pessoa"); trata do contato mais pesado antes dos demais; leva a contradição marcada pelo mapa para dentro do texto (em N-383686, o Mercúrio em oposição à Lua e a Lua em quadratura com Vênus aparecem, ainda como um "no entanto" e não como complicação do tema); nunca fecha com a fórmula "equilíbrio entre apoio e desafios".

**O que ainda não está bom** (e é o critério que importa):

- **O significado é, na maior parte, paráfrase do repertório.** "Sua Lua se adapta à busca de autoexpressão do Sol da outra pessoa, criando um espaço onde ambos se sentem vistos e valorizados" é correto e é o que o livro diz, com um fecho genérico. Não há a pergunta que o vínculo põe a cada um, nem a explicação de como o tema estrutura a relação. A regra do prompt foi reforçada (construir pelo papel de cada corpo e formular a pergunta), mas isso não foi testado.
- **Homogeneização.** "Reconhecimento e complementaridade" foi o tema central em 3 das 6 relações, porque Sol e Lua estão quase sempre no topo. É correto e pouco diferenciador.
- **Repetição.** O tema aparece no parecer, de novo no meio e de novo no significado.
- **Palavras que o verificador não pega:** "harmonia natural" (R-88b622), "impactando a relação" (R-9330af), "uma tela onde cada um projeta suas fantasias e medos" (L-ee5f90, que passa dos limites da evidência). Seguem como limitações lexicais.

Ou seja: a estrutura funciona (parecer primeiro, centro decidido por código, contradição integrada), e a interpretação arquetípica de verdade ainda não aparece nas gerações. **Não considero a leitura pronta.**

## 5. O que ainda impede considerar pronta

1. **O significado ainda não é interpretação arquetípica de verdade** e as correções de prompt desta rodada não foram testadas com modelo (acima). Falta uma segunda bateria curta (as mesmas 6 entradas, cerca de US$ 0,23).
2. **A rota não existe.** A leitura é um módulo e uma seção de tela; falta `POST /api/sinastria/leitura`, que gasta chamada paga por clique. Isso exige decisão de produto (quando gerar, se cacheia) e uma migration (a tabela `ai_usage` tem `check` em `operation_type` que não aceita um valor novo; hoje a geração teria de registrar com um valor existente ou a constraint ser ampliada). Nenhuma das duas foi feita.
3. **A tabela de temas é editorial.** O livro (Davison) sustenta o que cada dinâmica diz; o nome do tema e a "pergunta" do eixo são do Multioráculo. Vale revisão humana, planeta a planeta.
4. **O verificador não julga o significado.** Um significado vago, ou um parecer que nomeia um planeta e ainda assim é genérico, passa. A cobertura disso é a leitura humana das gerações.
5. **Só português foi exercitado** nos testes do verificador; en/es usam a mesma regra de idioma dos nove blocos, e as glosas do repertório continuam só em português.
6. **Limitações herdadas:** Mercúrio no mesmo signo ganha efeito positivo que a evidência não dá (sem regra, por ser fidelidade fina); a regra de conselho é lexical.
