# Sinastria (Comparar mapas): auditoria e proposta

> **Atualização:** as seções 4, 5 e 11 foram superadas por [auditoria-davison-sinastria.md](auditoria-davison-sinastria.md), depois que o Davison entrou em `candidatos`. O restante (código reaproveitável, modelo de dados, verificador, custo) continua válido como primeira rodada.

Rodada de auditoria. Nada foi implementado, a OpenAI não foi chamada e nenhum arquivo de astrologia foi alterado.
Tudo o que está marcado como **medido** foi lido no código. O que está marcado como **estimativa** é conta de cabeça com premissas declaradas.

---

## 0. Resumo executivo

1. **O motor já está pronto para a sinastria.** `mapaNatal()` aceita qualquer pessoa, calcula com `caelus` e já trata hora desconhecida por intervalo. O que falta é a camada A↔B, que não existe: hoje só há natal×céu (Interconexões) e céu×céu.
2. **O padrão de síntese também se reaproveita.** O pipeline `fatos → prompt fechado → verificador → reparo → molde` das Interconexões é a espinha certa. A sinastria é uma segunda instância desse padrão, não um sistema novo.
3. **O corpus não sustenta a sinastria, e isso é decisão sua.** Não há nenhuma fonte astrológica em `data/`. Os PDFs são de tarô, runas, Lenormand, búzios, odus, I Ching, umbanda e Jung. Os pesos e orbes de hoje são calibração editorial própria, documentada no código mas sem fonte externa. Detalhe na seção 4.
4. **Há 3 buracos no que existe** que a sinastria herdaria (seção 3.3): retrogradação com hora desconhecida, limite de 100 anos de idade, e ausência de política de privacidade e de rota de exclusão de conta no repositório.
5. **Custo estimado:** cerca de US$ 0,02 por leitura (um chamado) e no máximo cerca de US$ 0,06 no pior caso (três chamados). Cálculo é desprezível. Cache por par torna o custo único por relação.

---

## 1. Auditoria do código astrológico atual

| Arquivo | O que faz | Veredito para sinastria |
|---|---|---|
| `lib/astro/ceu.ts` | Única camada que fala com o motor (`Engine` do caelus, dados embarcados). Posições, aspectos do céu, eventos. `corposEm(jd)`. | Reaproveita o motor e `indiceDoSigno`/`grauNoSigno`. `ORBE_MAX=3` e `ORBE_MAX_LUA=1.5` são orbes de **trânsito**, não servem para sinastria. |
| `lib/astro/mapa.ts` | `mapaNatal(dados)`: 10 corpos, retrogradação, casa, Asc, MC, 12 cúspides. Sem hora: intervalo por amostragem horária (25 amostras), `whole_sign`, sem Asc/MC/casas, `signoDefinido`, `incerteza`. | **Reaproveita 100%.** É a base das duas pessoas. |
| `lib/astro/interconexoes.ts` | Todos os ângulos entre 10 corpos de hoje e cada ponto natal, com orbe, aplicativo, nota. Regra do intervalo (sem hora, o aspecto precisa valer no intervalo inteiro). Seleção gulosa com desconto de redundância. | O **padrão** é reaproveitável (nota = base × exatidão × papel × peso × fase; guloso com desconto). O código não é: ele assume "um lado é trânsito". Precisa de uma função irmã, não de uma generalização. |
| `lib/astro/relevancia.ts` | Ranking do horóscopo por signo. Repete `BASE_ASPECTO`. | Só como referência. Duplicação de `BASE_ASPECTO` já existe entre este e `interconexoes.ts`. A sinastria deve importar de um só lugar. |
| `lib/astro/fatos-interconexoes.ts` | Fatos com id (f1…), tipo, texto e nota; frases nos 3 idiomas; ordem de relevância. | Reaproveita o contrato `FatoPessoal` e `nomeDoPonto`. Precisa de texto com **dois donos** ("seu Sol" vs "o Sol de Ana"). |
| `lib/astro/verificador-interconexoes.ts` | Vocabulário fechado, fato declarado existe, cobertura do principal, previsão, conselho, genérico, manifestação, tamanho, travessão. | Reaproveita as listas de `editorial.ts` (`PREVISAO`, `CONSELHO`, `FALSA_PRECISAO`, `PROIBIDAS`, `TRACOS`). A lógica precisa de versão própria (seção 8). |
| `lib/astro/prompt-interconexoes.ts` | Prompt com fatos fechados, camada de manifestação hipotética, casas como raciocínio. | Reaproveita estrutura, `languageRule`, `CASAS`, `MARCAS_HIPOTESE`. O texto do prompt é novo. |
| `lib/astro/interconexoes-server.ts` | Cache por `(user, dia, locale)` + `mapa_hash`, reparo ×2, molde. | Reaproveita o desenho. A chave muda: o cache é por **par**, não por dia. |
| `lib/astro/simbolos.ts` e `nomes.ts` | Vocabulário em 3 idiomas: `FUNCAO_NOMES`, `GLOSA_ASPECTO`, signos, regentes. | Reaproveita, e é a única "fonte" interpretativa que o projeto tem para planeta e aspecto. Não tem nada relacional. |
| `app/api/mapa/route.ts` | CRUD do mapa do próprio usuário, via RLS. | Não serve para o outro mapa (a tabela `birth_data` tem `user_id` como chave primária: um nascimento por usuário). |
| `app/api/interconexoes/sintese/route.ts` | Ordem segurança → plano (402) → mapa → geração. `gpt-4o`, `temperature 0.7`. | Reaproveita a ordem e o gate `isPaidPlan`. |
| `scripts/verify-astro.ts` + `astro.golden.json` | 40 nascimentos, tolerância 0,1 arcsegundo, rodam no `prebuild`. | Protege o motor. Sinastria deve ter golden próprio. |
| `caelus` (biblioteca) | Já exporta `synastryAspects`, `synastryOverlays`, `compositePlacements` (`relational.d.ts`). | **Existe, mas não recomendo usar** (seção 3.1). |

**Conclusão de reaproveitamento:** a camada de cálculo base (mapa, hora desconhecida, zona, cidades) é reaproveitada sem mudança. A camada de aspectos e a de relevância são **reaproveitadas como padrão e reescritas para A↔B**. O prompt e o verificador são **instâncias novas** do mesmo desenho.

---

## 2. Cálculos novos necessários

Todos determinísticos, todos sobre `mapaNatal` de A e de B.

1. **Aspectos A↔B.** 10 corpos de A × (10 corpos + Asc + MC de B) e o inverso. Para cada par e cada um dos 6 ângulos que o projeto já usa (`ANGULO_ASPECTO`), orbe e categoria.
2. **Direção A→B.** Quem aplica sobre quem. Sem velocidade relativa entre dois mapas natais, só há duas direções reais: a **assimetria de pontos** (o corpo de A toca o Asc de B, mas o Asc de A não está envolvido) e o **lado em que o ângulo cai**. Ver 5.
3. **Sobreposição de casas** (A em casas de B e B em casas de A). Só quando o dono das casas tem hora.
4. **Relações angulares**: planetas de A nos ângulos de B (Asc, MC, e opostos Desc, IC). Só com hora do dono do ângulo.
5. **Repetição de dinâmica**: agrupar aspectos que dizem a mesma coisa (mesma dupla de funções, ver 5.4).
6. **Pontos estruturais de cada mapa** que a síntese vai citar: Sol, Lua, Asc por signo. Já saem de `fatosPessoais`, só falta o dono.
7. **Estado de disponibilidade** por pessoa: o que está indisponível e por quê (seção 9).

**Não são necessários** (e eu não os incluiria): mapa composto, Davison, Nodos, Quíron, Parte da Fortuna. `CORPOS_MAPA` tem 10 corpos e é o que o corpus de verificação cobre.

---

## 3. Sobre o motor

### 3.1 Por que não usar `synastryAspects` do caelus

Não conferi a implementação linha a linha, só a assinatura. O que está claro:

- `DEFAULT_ORBS` do caelus: conjunção 8, sextil 4, quadratura 7, trígono 7, oposição 8. **Não há quincunx**, e o projeto usa quincunx.
- A `strength` do caelus é genérica e independe do papel dos corpos. O projeto já decidiu que relevância depende de papel.
- As Interconexões já têm a regra do intervalo, que o caelus não conhece.

Usar o caelus nesta camada criaria duas verdades sobre "o que é um aspecto". O próprio `mapa.ts` registra essa preocupação para o motor. Recomendação: **usar o caelus só para posições (como hoje) e calcular os aspectos A↔B no projeto**, com a mesma aritmética de `interconexoes.ts` (`separacao`, `ANGULO_ASPECTO`). `synastryAspects` pode servir como **verificação cruzada nos testes** (mesmo papel do `--cross` no `verify:astro`).

### 3.2 Orbes

O projeto hoje só tem orbes de **trânsito** (3° e 1,5° para a Lua), definidos em `ceu.ts` como decisão editorial ("a Lua anda rápido demais para orbes largos"). Não existe orbe de sinastria definido em lugar nenhum. É lacuna, e entra na seção 11.

### 3.3 Três buracos que a sinastria herdaria

1. **Retrogradação com hora desconhecida.** `mapa.ts` calcula `retrogrado` do instante de referência (12:00 local) mesmo quando `born_at` é nulo. Se o planeta estaciona naquele dia, o valor é de um instante que não é dado real. `ceu.ts` já tem `stations()`; o intervalo de retrogradação deveria ser calculado como é o de longitude. Para Mercúrio, Vênus e Marte é raro mas existe. **Este é um defeito atual, independente da sinastria.**
2. **Limite de 100 anos.** `ANOS_ACEITOS = 100` rejeita quem nasceu antes de ~1926. Para "família" (avós) isso vai bater. O banco aceita desde 1900. O comentário diz que é a janela que o motor "tem corpus para sustentar". Preciso que você confirme se o motor é válido além disso antes de abrir a regra; o `caelus` tem `accuracy.json` e eu não o auditei.
3. **Sem política de privacidade nem rota de exclusão de conta no repositório.** Busquei por "privacidade", "lgpd" e por rotas de exclusão de usuário em `app/` e `components/`. Não achei página nem rota. O cascade `on delete cascade` de `auth.users` existe nas tabelas, mas não há fluxo de produto que o dispare. Importa mais com dados de terceiros (seção 11).

---

## 4. Fontes: o que sustenta o quê

| Necessidade | O corpus sustenta? | O que realmente existe |
|---|---|---|
| Posições, aspectos natais (matemática) | Sim | Motor `caelus`, golden de 40 mapas, `--cross` contra motores independentes. É cálculo, não interpretação. |
| Definição de planeta e de aspecto | Parcial | `FUNCAO_NOMES`, `GLOSA_ASPECTO`, `LINHA_SIGNO` em `simbolos.ts`. Texto próprio, "de inspiração junguiana" por declaração. Sem relação entre pessoas. |
| Orbes de sinastria | **Não** | Só orbes de trânsito, editoriais. |
| Pesos dos corpos e dos aspectos | **Não, no sentido de fonte** | `BASE_ASPECTO`, `PAPEL_NATAL`, `PESO_TRANSITO` são números do produto, com racional escrito no código ("a Lua faz quadratura com todo mundo toda semana"). Calibrados contra "o céu real de quatro datas" (`relevancia.ts`), não contra literatura. |
| House overlays | **Não** | `CASAS` em `prompt-interconexoes.ts` dá o sentido de cada casa como raciocínio. Não há texto sobre planeta de A na casa de B. |
| Interpretação relacional | **Não** | Nenhum texto relacional no projeto. O PDF de Jung (`o_homem_e_seus_simbolos.pdf`) é sobre símbolo e inconsciente, e `editorial.ts` proíbe citar autor. |

**Em termos claros:** o que o projeto tem é uma **gramática de relevância autoral**, não um corpus de astrologia. Isso é consistente com a filosofia do produto (os próprios arquivos dizem "o ranking tem de se explicar em uma linha"), mas significa que para sinastria **qualquer peso que eu proponha é editorial**, na mesma natureza dos atuais. Eu não vou apresentá-lo como se tivesse fonte.

**O que falta exatamente, antes de sugerir uma nova fonte:**
1. Uma tabela de orbes de sinastria, com justificativa por tipo de corpo.
2. Para cada **par de funções** (ex.: função lunar de A sobre função saturnina de B), uma glosa relacional escrita por nós, no mesmo molde de `GLOSA_ASPECTO` (definição, não interpretação). Hoje o modelo teria que inventá-la.
3. Um texto de sentido por casa **para o outro** ("o Sol de A cai na casa 7 de B").
4. Uma decisão sobre o peso dos ângulos (Asc e MC) em relação, que hoje só existe como `PAPEL_NATAL` (Asc 1,5; MC 1,15) para trânsito.

Se você preferir uma fonte externa para sustentar 1 a 3, é uma decisão de conteúdo, e o código não resolve. Minha recomendação é **começar sem fonte nova, com glosas autorais** (item 2), declarando no código que é editorial, como o resto.

---

## 5. Estrutura dos fatos de sinastria

### 5.1 Pessoa

```ts
type PessoaSinastria = {
  rotulo: string            // apelido; "Você" para o usuário
  mapa: MapaNatal           // já existente
  horaConhecida: boolean
  indisponivel: Indisponivel[]   // seção 9
}
```

### 5.2 Aspecto A↔B

```ts
type AspectoRelacional = {
  id: string                // "A.moon~B.saturn:opposition"
  a: { ponto: string; lon: number; signo: number; casaEmB: number | null }
  b: { ponto: string; lon: number; signo: number; casaEmA: number | null }
  aspecto: "conjunction" | "opposition" | "square" | "trine" | "sextile" | "quincunx"
  orbe: number
  orbeMax: number
  categoria: "facilitador" | "tensao" | "fusao" | "ajuste"   // definição, não juízo
  direcao: "A→B" | "B→A" | "mutua"
  firmeza: "firme" | "intervalo"     // vale no intervalo inteiro, ou só no meio
  nota: number
  fatores: { base; exatidao; papel; angulo; repeticao }
}
```

**Categoria é definição geométrica, não valor.** conjunção = fusão; sextil e trígono = facilitador; quadratura e oposição = tensão; quincunx = ajuste. É exatamente o que `GLOSA_ASPECTO` já diz ("não se contradizem, mas também não se ajustam sozinhas"). **Tensão não é "negativo"**, e isso entra nas regras do prompt.

**Sobre "direção A→B quando relevante".** Em dois mapas natais estáticos, a direção real é limitada. Proponho três usos honestos, e nenhum inventa causalidade:
- `casaEmB` / `casaEmA`: em que casa do outro o corpo cai (só com hora do dono da casa);
- `direcao` quando o **ponto receptor é um ângulo** (Asc/MC) de uma só pessoa: o corpo da outra "toca" o ângulo;
- caso contrário, `mutua`.
Não vou criar "A aplica sobre B" pelo orbe, porque isso exigiria velocidade, que não existe em mapa natal.

### 5.3 Relevância (regra proposta)

Mesmo molde de `interconexoes.ts`, com os fatores abertos e cada um explicável em uma linha:

```
nota = base(aspecto) × exatidao(orbe) × papel(a) × papel(b) × angulo × repeticao
```

| Fator | Regra | Origem |
|---|---|---|
| `base` | `BASE_ASPECTO` existente (conj. 1, opos. 0,92, quad. 0,88, trig. 0,72, sext. 0,6, quinc. 0,45) | **reaproveitado**; editorial |
| `exatidao` | `0,55 + 0,45 × (1 − orbe/orbeMax)`, a fórmula já usada | **reaproveitado** |
| `papel(a)`, `papel(b)` | `PAPEL_NATAL` existente (Sol e Lua 1,4; pessoais 1,1; Júpiter e Saturno 0,95; geracionais 0,7) | **reaproveitado**, ver ressalva abaixo |
| `angulo` | 1,0 sem ângulo; ×1,25 quando envolve Asc ou MC (já pesam 1,5 e 1,15 em `PAPEL_NATAL`, então a proposta é **não somar** e deixar só o `PAPEL_NATAL`) | decisão a confirmar |
| `repeticao` | desconto guloso, como em `selecionar` (0,45 a cada reuso do mesmo corpo ou ponto) | **reaproveitado** |
| `geracional` | aspecto entre dois lentos (Urano, Netuno, Plutão) com orbe largo pesa pouco, como `coletivo` em `relevancia.ts` (0,3 a 0,55) | **reaproveitado como ideia** |

**Ressalva importante sobre `papel`.** `PAPEL_NATAL` foi calibrado para "o que a pessoa é", não para "o que a relação é". Em sinastria, Vênus e Marte pesam mais no afeto e Saturno e Mercúrio mais no cotidiano, mas isso é **dependente do vínculo**, e você disse que o vínculo não altera cálculo. Portanto: **a nota é a mesma para qualquer vínculo.** O vínculo escolhe apenas quais **blocos** da leitura recebem destaque, nunca a nota nem a seleção dos fatos.

### 5.4 Repetição de dinâmica

A mesma dinâmica pode aparecer em vários aspectos (Lua A em Saturno B, Lua B em Saturno A, Sol A em Saturno B). Em vez de contar, agrupo por **par de funções** (`FUNCAO_NOMES`) e conto o grupo como **uma dinâmica** com `nota = máx do grupo + 0,25 × resto`. Isso é o que impede a votação 3×2: **contagem nunca entra, só a nota máxima e um bônus limitado por recorrência.**

---

## 6. Arquitetura de interpretação

```
birth_data (A) ─┐
                ├─ mapaNatal ×2 ─ sinastria() ─ fatosRelacionais() ─ prompt ─ gpt-4o
other_person ───┘                    │                │                  │
                                 recusadas        fatos fechados     JSON + afirmações
                                                                         │
                                          verificarSinastria ◄───────────┘
                                                │ ok
                                                ▼
                                       cache por par (hash)
                                                │ falha → reparo ×2 → molde determinístico
```

- **Uma chamada, blocos no mesmo JSON** (síntese da relação, pontos em comum, onde vocês se encontram, onde há tensão, comunicação, afeto e intimidade, vida prática, o que mobiliza, síntese final). Nove chamadas inflariam custo e fragmentariam a coerência. Cada bloco é um campo `{ texto, fatos: ["f3","f7"] }`.
- **Blocos condicionais (`somente quando sustentado`):** o código decide, antes do prompt, quais blocos **existem** (seção 7 do verificador). O modelo não escolhe se há comunicação. Comunicação só abre se houver ao menos um fato com Mercúrio de qualquer lado ou casa 3; afeto com Vênus, Lua ou casas 5, 7, 8; vida prática com Saturno, casas 2, 6, 10. **São regras de mapeamento função→bloco, editoriais**, e ficam em uma tabela única, legível, no código.
- **Vínculo:** entra no prompt como uma linha ("vínculo declarado: trabalho") e **reordena a ênfase dos blocos**. Não muda fatos, notas, nem quais blocos existem. Isso responde ao seu "apenas contextualiza".
- **Contradição preservada** por regra de prompt e por regra de verificador: quando existem fatos `facilitador` e `tensao` de nota comparável, a síntese final **precisa** citar os dois (seção 8, regra 6).
- **Manifestação hipotética:** reaproveita `MARCAS_HIPOTESE`. Casas como domínio só com hora, senão não há exemplo ancorado.
- **Sem índice, sem nota, sem "combinam":** entram em `PROIBIDAS` de sinastria (`compatibilidade`, `match`, `alma gêmea`, `combinam`, `não combinam`, porcentagem).

Modelo: manter `gpt-4o` por consistência com Interconexões, que é o que o `pricing.ts` já cobre. Decisão adiada: usar um modelo mais caro só se o verificador mostrar muito reparo.

---

## 7. Modelo de dados

**Reuso máximo, tabela única nova, sem duplicar nascimento.**

```sql
-- pessoas cadastradas pelo usuário (nunca têm conta)
create table public.saved_people (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  nickname    text not null check (char_length(trim(nickname)) between 1 and 40),
  relation    text not null check (relation in ('romantic','friend','family','work','other')),
  born_on     date not null,
  born_at     time,                 -- nulo = hora desconhecida, igual a birth_data
  tz          text not null,
  tz_status   text not null default 'ok',
  lat         double precision not null,
  lon         double precision not null,
  place_label text not null,
  created_at  timestamptz not null default now()
);
-- RLS: só o dono lê, escreve e apaga (mesmo molde de birth_data)
```

- **O vínculo fica na pessoa salva**, não no par. Se o usuário quiser comparar a mesma pessoa em dois contextos, a alternativa é mover `relation` para a leitura. Recomendo **na leitura**: `relation` na tabela abaixo e só um default na pessoa. (Decisão sua.)
- **A leitura gerada é cache, igual a `interconexoes_daily`**: service role, RLS fechada.

```sql
create table public.synastry_readings (
  owner_id   uuid not null references auth.users (id) on delete cascade,
  person_id  uuid not null references public.saved_people (id) on delete cascade,
  locale     text not null check (locale in ('pt','en','es')),
  relation   text not null,
  pair_hash  text not null,          -- hash dos 2 mapas (como mapa_hash)
  version    text not null,          -- versão das regras de relevância e do prompt
  sintese    jsonb not null,         -- blocos
  fatos      jsonb not null,
  diagnostico jsonb not null default '{}',
  model      text not null,
  created_at timestamptz not null default now(),
  primary key (owner_id, person_id, locale, relation)
);
```

- `pair_hash` = hash de `hashDoMapa(A)` e `hashDoMapa(B)` mais `version`. Mudou o nascimento de qualquer um, ou a regra de relevância, o cache é tratado como ausente (mesma disciplina de `lerCache`).
- **Não se grava mapa nem aspectos** como verdade separada; `fatos` fica só como registro do que sustentou o texto, como em `interconexoes_daily`.
- **Pessoa não salva** (comparação avulsa): o fluxo calcula e gera sem gravar a pessoa, e o cache fica sem `person_id`. Recomendo **v1 sempre salvar** (mais simples) com botão "esquecer esta pessoa", porque cache sem identidade estável não tem chave.
- `ai_usage.operation_type` ganha `'sinastria'` (mesmo `alter` de `20260929`).
- Migration **para revisão manual**, como todas as suas.

---

## 8. Verificador específico de sinastria

Mesmo princípio do atual: "deliberadamente pequeno", só o que o texto pode errar de pior. Regras:

1. **Aspectos fechados, por par.** Qualquer menção a combinação `ponto de A + aspecto + ponto de B` precisa existir em `fatos`. O caso do seu exemplo ("Vênus A trígono Marte B" inexistente) é **o erro mais grave** e reprova direto. Implementação: o texto não tem o id, então a checagem usa o vocabulário (`corpo` + `aspecto` + `corpo`) dentro da mesma frase, contra o conjunto de pares presentes. É a extensão natural da regra 1 atual, que hoje confere só termos isolados.
2. **Dono correto.** Cada fato diz de quem é cada corpo. O texto só pode atribuir "a Lua de A" a A. Exige que a frase que nomeia um corpo traga o dono (rótulo ou "você"/"ele/ela" definido pelo prompt) quando houver o mesmo corpo nos dois lados.
3. **Afirmação declara fato existente**, e o fato citado precisa sustentar o bloco (mapeamento função→bloco da seção 6). "Comunicação" sustentada só por Vênus reprova.
4. **Cobertura do que mais pesa:** os 3 fatos de maior nota (por **dinâmica**, não por aspecto) precisam aparecer.
5. **Indisponibilidade respeitada.** Se `indisponivel` contém Asc, MC, casas, ou a Lua, qualquer menção reprova (seção 9). É a regra que impede "ascendente" aparecer para quem não sabe a hora.
6. **Contradição preservada.** Se existe ao menos um `facilitador` e um `tensao` com nota ≥ 60% da maior, a síntese final precisa citar ao menos um de cada. Se só um lado existe, a síntese **não pode inventar o outro**.
7. **Proporcionalidade.** O fato minoritário não pode ser o tema da síntese final: o 1º fato citado na síntese final precisa estar entre os 2 de maior nota. Sem contagem 3×2.
8. **Sem causalidade, previsão, conselho, índice, veredito** (`PREVISAO`, `CONSELHO`, mais lista nova de veredito: "combinam", "compatível", "alma gêmea", "match", porcentagem, "vai durar").
9. **Sem tensão tratada como defeito, nem facilidade como promessa:** lista de expressões (`problema`, `incompatível`, `garantia`, `sorte`…) sobre frases que citam aspecto tenso ou facilitador.
10. **Tamanho e registro** (travessão, expressões vetadas, `FALSA_PRECISAO`) herdados.

**O que não faz:** julgar se a leitura é boa. Mesmo limite honesto do atual.

---

## 9. Hora desconhecida, tratada estruturalmente

### 9.1 O que o código já faz (medido)

`mapaNatal` com `born_at = null`: `horaConhecida=false`, `asc/mc/cuspides = null`, casa `null`, aspectos internos `[]`, longitude = meio do intervalo diário (25 amostras), `incerteza` = amplitude, `signoDefinido`. `interconexoes.ts` só aceita um aspecto se ele vale **no intervalo inteiro** (400 passos). Nunca inventa 12:00 como dado: usa 12:00 só para o instante de referência do `Engine` e descarta o que depende dele.

### 9.2 O que fica ambíguo naquele dia (auditado)

| Elemento | Situação sem hora | Representação proposta |
|---|---|---|
| Ascendente, MC, Descendente, IC | Giram 360° em 24h | **Indisponível** |
| Casas e cúspides | Dependem do Asc | **Indisponível** |
| Overlays ("corpo de X na casa de Y") | Exigem as casas de Y e a longitude firme do corpo de X | **Indisponível quando Y não tem hora.** Quando Y tem hora, o overlay vale se o corpo de X cai inteiro dentro de uma casa no intervalo de X (a Lua de X sem hora quase nunca cabe). Cada sentido (A em B, B em A) é decidido separadamente. |
| **Lua** | ~13°/dia. Orbe de sinastria dentro do intervalo quase nunca fecha | `lua: "intervalo"`. Aspecto de Lua **só entra se valer no intervalo inteiro**, o que com orbes de 6° praticamente só acontece em conjunção larga. O fato `lua_indisponivel` é explícito e vai para o verificador. |
| **Signo da Lua** | Troca de signo em ~44% dos dias (13,2°/30°) | `signoDefinido=false`. Só se afirma quando o intervalo cabe em um signo. O motor já faz isso. |
| Mercúrio, Vênus, Sol, Marte | 0,8 a 2,2°/dia | Aspectos firmes com orbe razoável. O intervalo reduz o orbe efetivo: preciso decidir se a nota usa o **pior orbe** do intervalo (conservador, como as Interconexões) ou o do meio. Recomendo o pior. |
| **Retrogradação** | O código usa o valor do meio-dia | **Defeito atual (3.3, item 1).** Deve ser `retrogrado: boolean \| "muda"` quando há estação no dia. |
| Sol em signo na virada | Sol muda de signo 1 dia por mês | Já coberto por `signoDefinido`. |
| Fase lunar natal (distância Sol–Lua) | Depende da Lua | **Indisponível.** Não está hoje no sistema. |
| Planetas lentos | Estáveis | Sem restrição |

**Se as duas pessoas não têm hora:** aspectos Sol/Mercúrio/Vênus/Marte/lentos continuam. Lua só se firme nos dois intervalos (o pior caso dos dois). Sem ângulos, sem casas.

### 9.3 Como a síntese sabe

O objeto `Indisponivel` é uma lista fechada de ids (`asc`, `mc`, `casas`, `overlays`, `lua`, `fase_lunar`, `retrogradacao:<corpo>`) por pessoa, e entra de três formas:
- **no prompt**, como fatos de contexto do tipo `indisponivel`, com o texto já dito ("a hora de nascimento de Ana não é conhecida, então não há Ascendente, Meio do Céu, casas, nem leitura firme da Lua dela");
- **no verificador**, regra 5, como vocabulário proibido por pessoa;
- **na tela**, como linha discreta sob a síntese.

O texto da síntese **pode** dizer que há limites ("esta leitura não alcança a Lua de Ana"). Isso é honestidade, não falha, e conta como proporcionalidade.

---

## 10. Estimativa de custo (estimativa, não medição)

Não consegui ler `ai_usage` real: `.env.local` não tem service role (já registrado na memória do projeto), então não há tokens reais das Interconexões para calibrar. Os números abaixo partem do desenho dos prompts.

**Premissas**
- Preço `gpt-4o` da tabela `lib/ai/pricing.ts`: US$ 2,50 / M entrada, US$ 10,00 / M saída.
- Tokens contados a ~4 caracteres por token (pt-BR tende a mais, uso 3,5).

| Peça | Tokens (entrada) |
|---|---|
| Regras e prompt fixo (sistema, CASAS, manifestação, linguagem) | ~1.600 |
| Fatos: 14 aspectos selecionados + 8 contexto (signos Sol/Lua/Asc ×2, indisponíveis) × ~45 | ~1.000 |
| Glosas relacionais por dinâmica presente (proposta, seção 4 item 2) | ~600 |
| **Total entrada** | **~3.200** |
| **Saída**: ~9 blocos × ~90 palavras + afirmações com ids em JSON | **~1.300** |

| Cenário | Entrada | Saída | Custo |
|---|---|---|---|
| 1 chamada (caso comum) | 3.200 | 1.300 | **US$ 0,021** |
| 1 chamada + 1 reparo (reparo reenvia texto reprovado: +1.300 de entrada) | 7.700 | 2.600 | **US$ 0,045** |
| 3 chamadas (pior caso antes do molde) | 12.200 | 3.900 | **US$ 0,070** |
| Molde determinístico | 0 | 0 | US$ 0 |

- **Cálculo:** `mapaNatal` sem hora faz 25 cartas; com hora, 1. Sinastria = 2 mapas + ~240 pares × 6 ângulos. Milissegundos. Custo marginal desprezível.
- **Cache:** custo é **único por (par, idioma, vínculo, versão)**. Reler não gasta.
- **Ponto de atenção real:** `FRASES.max=10` e `PALAVRAS_MAX=210` do atual não servem. A leitura de nove blocos precisa de teto próprio (~450 a 600 palavras). Isso é o que mais move a saída.
- **Risco de custo:** o primeiro dado que o projeto já registrou sobre reparo foi "toda geração gastava uma chamada de reparo" por um prompt mal dito. Em sinastria o verificador tem mais regras, então a taxa de reparo no começo pode ser alta. Medir antes de decidir cota.

---

## 11. Lacunas metodológicas (lista exata)

1. **Orbes de sinastria:** não existem no projeto. Decisão editorial a fazer e documentar. Sugiro partir de orbes **próprios menores que os do caelus** e justificar por tipo de corpo, não copiar.
2. **Glosa relacional por par de funções:** não existe. Sem ela, o modelo inventa o sentido relacional.
3. **Sentido de overlay por casa:** só existe o sentido da casa em si.
4. **Mapeamento função→bloco** (comunicação, afeto, vida prática, o que mobiliza): não existe e é o coração da regra "somente quando sustentada". Editorial.
5. **Peso de ângulos em relação** e **peso de assimetria** (A toca o Asc de B).
6. **Retrogradação com hora desconhecida:** defeito atual.
7. **Limite de 100 anos** vs. família.
8. **Hora aproximada:** o usuário vai querer dizer "de manhã" para outra pessoa. v1 só tem duas opções, como você pediu. Se um dia houver `±N horas`, o modelo de intervalo já suporta, é só trocar o intervalo diário por um intervalo menor.
9. **Política de privacidade e exclusão de conta:** inexistentes no repositório.
10. **Calibração do "60% da maior nota"** (regras 6 e 7 do verificador): é um número meu, não uma medida. Precisa de fixtures reais, como o golden de 40 mapas, antes de virar regra.
11. **Fixtures de sinastria:** não há nenhum. O golden deve cobrir, no mínimo, dois mapas com hora, A sem hora, B sem hora, os dois sem hora, hora ambígua e inexistente (horário de verão), e alta latitude (Placidus cai para outro sistema; `sistemaCasas` precisa entrar nos fatos de overlay).

---

## 12. Privacidade

**Mínimo necessário:** apelido (até 40 caracteres), data, hora (ou nulo), lat/lon/tz do lugar, vínculo. Não guardar nome completo, email, telefone, nem foto. Já é o que o desenho da seção 7 faz.

**Recomendações**
- **Apelido livre, com aviso na tela**: "use um apelido, não o nome completo". Sem validação que tente detectar nome (falsos positivos).
- **Excluir:** `delete` da pessoa salva apaga a leitura em cascata (`on delete cascade` em `synastry_readings`). Botão por pessoa e "apagar todas".
- **Não indexar nem logar** nascimento do outro. Os `console.log` das rotas atuais não imprimem dados de nascimento; a nova rota deve manter isso.
- **Diagnóstico e `fatos` em `synastry_readings`** contêm posições derivadas do nascimento de uma terceira pessoa. Isso é dado pessoal derivado e deve cair junto com a exclusão (a cascata cobre).
- **Cidade com rótulo:** `place_label` pode revelar o local de nascimento. É o que `birth_data` já guarda para o próprio usuário. Para terceiros, avaliar guardar só lat/lon e tz (o rótulo é conveniência de UI).
- **Base legal e política:** como o repositório não tem política de privacidade, o texto precisa nascer junto, e eu **não vou redigir juridicamente**. O que ela precisa dizer, tecnicamente: que o usuário pode cadastrar dados de terceiros, que o usuário é quem informa, que o terceiro não é notificado, o que é guardado, por quanto tempo, e como apagar. Recomendo validar com assessoria jurídica (LGPD).
- **Retenção:** sem prazo hoje. Proponho decidir um (ex.: apagar leituras e pessoas de contas canceladas após N dias), mas isso é decisão de produto.

---

## 13. Fluxo (sem UI)

```
Seu mapa  (birth_data)  +  Outro mapa  (saved_people: escolher ou criar)
                │
         vínculo (romântico, amizade, família, trabalho, outro)
                │
        [ Comparar mapas ]      ← paywall: 402 antes de qualquer custo
                │
   síntese primeiro (blocos)  →  "ver os fatos" expansível (aspectos com orbe, overlays)
                │
   rodapé: "o que esta leitura não alcança" (hora desconhecida, Lua incerta)
```

Contrato com a identidade do produto: sem número, sem selo, sem barra de progresso. Os detalhes técnicos reaproveitam a lógica de `preview-interconexoes` (fatos como lista, expansível).

---

## 14. Plano mínimo de implementação

Ordem pensada para que cada etapa seja verificável sozinha e para que nada gaste dinheiro antes do verificador existir.

| # | Etapa | Entrega | Custo OpenAI |
|---|---|---|---|
| 0 | **Decisões** da seção 11 (orbes, glosas, blocos, 100 anos, privacidade) | Documento curto | 0 |
| 1 | Corrigir retrogradação com hora desconhecida em `mapa.ts` (defeito atual) | Fixture + golden | 0 |
| 2 | `lib/astro/sinastria.ts`: aspectos A↔B, overlays, `indisponivel`, relevância | `verify:sinastria` com golden e `--cross` contra `synastryAspects` do caelus | 0 |
| 3 | `fatosRelacionais()` com frases nos 3 idiomas + molde determinístico | Fatos + molde passando no verificador | 0 |
| 4 | `verificarSinastria()` | Testes adversariais: aspecto inventado, dono trocado, Asc sem hora, tensão como defeito, veredito, 3×2 | 0 |
| 5 | Migration (`saved_people`, `synastry_readings`, `ai_usage`), para sua revisão | SQL | 0 |
| 6 | Prompt + servidor com cache por par + rota POST (gate `isPaidPlan` antes de tudo) | Rota atrás do paywall | **só aqui** |
| 7 | Medição em ~20 pares reais: taxa de reparo, molde, tokens reais | Relatório | pequeno, com sua autorização |
| 8 | UI, privacidade, decisão de cota | | |

As etapas 1 a 5 não chamam a OpenAI. O `prebuild` ganha `verify:sinastria`, no mesmo molde dos outros.

---

## 15. Decisões que preciso de você

1. **Orbes:** partimos de uma tabela própria editorial (minha recomendação) ou você prefere definir uma fonte?
2. **Vínculo:** fica na pessoa salva ou na leitura? (recomendo na leitura)
3. **Limite de 100 anos:** quer abrir para família? Preciso conferir a validade do motor antes.
4. **v1 salva sempre a pessoa**, ou também comparação avulsa sem gravar? (recomendo sempre salvar)
5. **Retrogradação com hora desconhecida:** posso corrigir `mapa.ts` na etapa 1, sendo defeito atual? É a única mudança fora da pasta nova.
6. **Privacidade:** quem redige a política? Eu preparo a lista técnica do que ela precisa cobrir.
