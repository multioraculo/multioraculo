# Prompt, schema, verificadores e contrato de geração da sinastria

**Estado:** desenhado, implementado e testado com respostas escritas à mão. Nenhuma chamada paga foi feita, não há UI, a migration não foi executada e nada foi commitado. A primeira bateria real espera a sua aprovação.

Código: [payload](../lib/astro/payload-sinastria.ts) · [prompt](../lib/astro/prompt-sinastria.ts) · [verificador estrutural](../lib/astro/verificador-resposta-sinastria.ts) · [juiz semântico](../lib/astro/juiz-semantico-sinastria.ts) · [reparo, molde e pipeline](../lib/astro/pipeline-sinastria.ts) · [aplicabilidade](../lib/astro/davison/aplicabilidade.ts).
Testes no prebuild: `verify:sinastria-sintese` (1403), `verify:sinastria-geracao` (306), `verify:sinastria-aplicabilidade`. Prompt real renderizado: [exemplo-prompt-sinastria.txt](exemplo-prompt-sinastria.txt).

## 0. O fluxo

```
fatos calculados ─► evidência selecionada ─► núcleos operacionais ─► PAYLOAD ─► prompt ─► JSON
 (sinastria.ts)      (selecao-sinastria.ts)   (semelhanças)        (só isto)             │
                                                                                         ▼
                aplicabilidade por vínculo (só no payload) ─►  verificador estrutural (GATE)
                                                                         │ aprovou
                                                                         ▼
                                                  juiz semântico (SOMBRA: só registra)
                reprovou ─► [reparo ≤ 2, desligado na 1ª bateria] ─► molde determinístico
```

O prompt recebe exclusivamente o payload, e o payload sai da seleção. O repertório inteiro do Davison nunca chega ao modelo, nem os fatos que o seletor descartou (há teste). O seletor não foi alterado nesta rodada: a seleção é idêntica para os cinco vínculos (há teste, nos 18 pares).

## 1. A revisão localizada das frases que citam um tipo de relação

Detalhe de cada decisão em [revisao-aplicabilidade-sinastria.md](revisao-aplicabilidade-sinastria.md).

- **65 frases** do repertório nomeiam um tipo de relação, lidas uma a uma, sem classificar por palavra. As 93 da contagem anterior eram acertos de palavra: o resto era campo da vida ("trabalho cotidiano" na casa 6, "ambiente doméstico" na 4), terceiro ("os filhos de quem tem a casa") ou falso positivo.
- **28 `exemplo_contextual`**: o vínculo era ilustração de uma dinâmica geral. Em 21 o exemplo sai e o núcleo geral vai ao prompt, para qualquer vínculo ("Em relações de trabalho, Marte pode fornecer o impulso..." → "Marte pode fornecer o impulso..."). Em 7 a frase fica como está, porque o "tipo de relação" era um papel dito por metáfora ("atitude parental") ou uma atividade, e trocá-lo inventaria.
- **37 `dependencia_real`**: só se sustenta naquele vínculo. Vai só para os vínculos marcados: 9 de negócios e de trabalho (só `trabalho`), 23 de atração, desejo, sexualidade e romance (só `romantico`), 2 que se declaram **fora** do romance (amizade, família, trabalho), "vínculo favorece a amizade" (amizade, romântico, família), "amizade romântica" (romântico, amizade), "vínculo doméstico" (romântico, família).
- O vínculo `outro` não recebe frase de dependência real: nada autoriza supor atração, negócio ou convívio doméstico onde o vínculo diz só "outro".
- **Onde isso age:** só no `montarPayload`. Ele tira a frase que não se aplica e troca o exemplo pelo núcleo; as dimensões e os blocos elegíveis são recalculados sobre as frases que ficaram. O seletor não lê a tabela, então aspecto, ranking, orçamento e relevância não se movem.
- **Efeito nos 18 pares:** frases removidas por vínculo: romântico 17, trabalho 25, família 40, amizade 41, outro 42; textos neutralizados: 46 em todos. Nenhuma dinâmica ficou sem evidência (zero omitidas); se uma ficasse, sairia do prompt e não seria citável (há teste), em vez de ir com fato solto.
- **Semelhanças:** o núcleo operacional delas não cita tipo de relação. Nada a revisar.

## 2. O prompt final, exato

O prompt é um par (system, user). O user é o payload renderizado (ver [exemplo](exemplo-prompt-sinastria.txt) com um par real) emoldurado pelas partes fixas abaixo.

**System (pt):**

```
Responda apenas com JSON válido, sem Markdown. Todo texto destinado ao leitor é escrito em português do Brasil. Nenhum campo pode conter travessão, meia risca, qualquer flexão de "arquétipo", nem estas expressões: "à tona", "destaca a importância", "ressalta a necessidade", "é fundamental", "um convite para", "pede atenção especial", "o dia pede", "trata-se de um momento", "paz interior", "autoconhecimento", "jornada interior", "configuração celeste", "energia", "busca por harmonia", "encontrar equilíbrio", "novas conexões", "típico de", "este aspecto pede", "sorte", "felizmente".
```

**User, abertura:**

```
Escreva a leitura de uma RELAÇÃO entre duas pessoas, a partir dos fatos astrológicos já calculados abaixo. O texto é para a primeira pessoa (você); a outra é 'a outra pessoa'.

VÍNCULO DECLARADO: amizade. Ênfase sugerida, se houver lastro: pontos_em_comum, onde_se_encontram, comunicacao. O vínculo não muda nenhum fato abaixo.
```

**User, depois do payload** (`ASPECTOS ENTRE OS DOIS MAPAS`, `OVERLAYS E PLANETAS SOBRE ÂNGULOS`, `PONTOS EM COMUM`, `O QUE NÃO É CONHECIDO`, `BLOCOS QUE VOCÊ PODE ESCREVER` e `BLOCOS QUE TÊM DE SER null`):

```
O QUE CADA BLOCO É:
  sintese_da_relacao: panorama integrado da relação, a partir das evidências mais relevantes
  pontos_em_comum: similaridades entre os dois mapas (elemento, modo, mesmo signo), SOMENTE se houver pontos em comum na lista
  onde_se_encontram: complementaridades, reconhecimento, apoio e facilidades que as evidências sustentam
  onde_ha_tensao: diferenças, atritos e pressões que as evidências sustentam, sem tratar tensão como defeito
  comunicacao: só se a evidência fala de troca de ideias, linguagem, escuta ou mal-entendido
  afeto_e_intimidade: só se a evidência fala de afeição, atração, intimidade ou vida emocional
  vida_pratica_e_sustentacao: só se a evidência fala de rotina, recursos, trabalho, dever, estabilidade ou permanência
  o_que_a_relacao_mobiliza: só se a evidência fala de intensidade, crise, revelação ou transformação recorrentes
  sintese_final: integra convergências e divergências sem escolher uma delas

REGRAS:
1. REGRA DE OURO: tudo o que você afirma sai da lista acima. Você não calcula, não corrige e não completa astrologia, e não usa o que sabe de astrologia por conta própria para preencher lacunas. Planeta, aspecto, casa, signo, ângulo, elemento ou modo que não está na lista não existe para este texto. Toda afirmação interpretativa tem de poder apontar para um id em `evidencias`.
2. CITAÇÃO: cada parágrafo declara em `evidencias` os ids (de dinâmica, de fato ou de ponto em comum) de onde saiu, pelo menos um, e só ids que existem na lista. Um parágrafo sem lastro não é escrito.
3. NATUREZA DO TEXTO: você descreve dinâmicas possíveis entre dois mapas, e não a verdade factual da relação. Fale em possibilidade e tendência ('pode', 'tende'), no tempo presente, e nunca como relato do que acontece entre as duas pessoas.
4. DONOS: 'seu/sua X' é de você, e 'X da outra pessoa' é da outra pessoa. Nunca troque os donos nem diga um aspecto entre corpos que a lista não liga.
5. O QUE NÃO SE SABE: o que consta em 'O QUE NÃO É CONHECIDO' não pode ser afirmado nem estimado: nem o signo, nem a retrogradação, nem o Ascendente, o Meio do Céu ou as casas dessa pessoa.
6. INTEGRE, NÃO VOTE: a ordem das dinâmicas é a de relevância. As primeiras pesam mais, e um fato secundário nunca vira o tema do texto. Não conte e não faça placar: três facilidades e duas tensões não são um resultado.
7. CONTRADIÇÃO: facilidade e tensão podem existir na mesma relação, e quando a lista traz as duas, as duas aparecem. Não se costura uma harmonia que a evidência não sustenta, e não se resolve uma contradição que ela deixa em aberto.
8. FACILIDADE NÃO É PROMESSA, TENSÃO NÃO É CONDENAÇÃO: uma facilidade descreve um apoio possível, e não garante afeto, durabilidade nem êxito; uma tensão descreve um atrito possível, e não é defeito de alguém nem sentença sobre a relação.
9. PONTOS EM COMUM: semelhança não é compatibilidade, e diferença não é incompatibilidade. Escreva a semelhança só no bloco `pontos_em_comum`, só com o que a lista diz, e use a ressalva quando houver. Se a lista não tem pontos em comum, esse bloco é null: não invente um.
10. DESCREVA, NÃO PRESCREVA: nada de conselho, instrução ou 'o ideal seria', e nenhuma indicação de ficar, terminar ou agir. Nada de previsão de acontecimento, duração, desfecho ou destino. Karma e destino não são fatos. Nada de diagnóstico nem rótulo de personalidade. Nada de causalidade ('por causa disso ele faz'), de nota, porcentagem ou veredito de compatibilidade ('combinam', 'não combinam', 'alma gêmea').
11. SEM CENA INVENTADA: não escreva episódios, falas, lugares, horas ou datas.
12. BLOCOS: escreva só os blocos que você PODE escrever e deixe null todos os outros. Nenhum bloco existe à força, nem para manter simetria: se um bloco ficaria só repetindo outro, ou se a evidência dele é fina, deixe null. `sintese_da_relacao` e `sintese_final` sempre existem.
13. VÍNCULO: ele pode orientar a ordem em que você apresenta, a atenção relativa, a escolha entre os blocos que você pode escrever e o espaço dado a uma dimensão. Ele não altera nenhum fato, não cria evidência, não transforma o que a evidência diz e não autoriza apagar uma dinâmica central porque ela destoa do vínculo. Não presuma uma relação que o vínculo não é: se não é romântico, não suponha namoro nem intimidade sexual.
14. CONCISÃO: 2 parágrafos por bloco (3 nas duas sínteses), 90 palavras por parágrafo e 700 palavras no total são TETOS, não metas. Prefira o curto: se a evidência sustenta 350 palavras, escreva 350, e não expanda para chegar perto do teto.
15. SEM REPETIÇÃO: a síntese da relação apresenta o padrão geral, os blocos temáticos o desenvolvem e a síntese final integra as contradições e encerra. Não repita a mesma dinâmica nos três só para preencher espaço: cada uma aparece onde tem o que acrescentar.
16. SÍNTESE FINAL: integra o que converge e o que diverge sem escolher um lado, e sem fechar a relação com uma conclusão sobre ela.
17. ESTILO: fale com você em segunda pessoa e chame a outra pessoa de 'a outra pessoa'. Pode nomear planetas, signos e aspectos, e não ensine a técnica: nada de explicar o que é orbe, aspecto ou casa. Registro adulto, preciso, pouco adjetivado.

IDIOMA: escreva em português do Brasil. A evidência já está em português: use-a normalmente.

Devolva JSON, com TODAS as nove chaves; as que não existem valem null:
{"sintese_da_relacao": {"paragrafos": [{"texto": "...", "evidencias": ["id"]}]}, "pontos_em_comum": null, "onde_se_encontram": {"paragrafos": [...]}, "onde_ha_tensao": {"paragrafos": [...]}, "comunicacao": null, "afeto_e_intimidade": null, "vida_pratica_e_sustentacao": null, "o_que_a_relacao_mobiliza": null, "sintese_final": {"paragrafos": [...]}}
```

**Idioma.** Regra própria da sinastria, sem nada herdado de Tarô ou de outro oráculo (há teste de que nenhum desses termos aparece no prompt). Em `en` e `es` a regra diz: a evidência está em português; diga o que ela diz no idioma de saída, sem ampliar o sentido, sem acrescentar o que ela não diz e sem terminologia de fora; as chaves do JSON e os ids em `evidencias` não mudam. O verificador confere os fatos pelo id.

## 3. O schema final

```ts
type Paragrafo = { texto: string; evidencias: string[] }   // ids de dinâmica, de fato ou de ponto em comum; ao menos 1
type Bloco = { paragrafos: Paragrafo[] }
type SinteseSinastria = Record<
  | "sintese_da_relacao" | "pontos_em_comum" | "onde_se_encontram" | "onde_ha_tensao"
  | "comunicacao" | "afeto_e_intimidade" | "vida_pratica_e_sustentacao"
  | "o_que_a_relacao_mobiliza" | "sintese_final",
  Bloco | null
>
```

As nove chaves estão sempre presentes e o que não é sustentado vale `null` (renomeei `o_que_mobiliza` para `o_que_a_relacao_mobiliza`, como no seu texto). Tetos, não metas: 2 parágrafos por bloco, 3 nas duas sínteses, 90 palavras por parágrafo, 700 no total.

## 4. O que cada tipo de evidência pode liberar

Quem libera é o código, sobre a evidência **como o vínculo a recebe** (depois da revisão de aplicabilidade). O verificador recusa o bloco que o código não liberou. Liberar não obriga: o modelo pode deixar `null` um bloco de evidência fina.

| Bloco | Liberado quando |
|---|---|
| `sintese_da_relacao`, `sintese_final` | há ao menos uma dinâmica (aspecto ou overlay) com evidência. Sempre existem |
| `pontos_em_comum` | há semelhança selecionada com núcleo operacional. Sem ela, `null` |
| `onde_se_encontram` | alguma dinâmica tem aspecto harmônico ou variável, ou frase de valência favorável, ou (overlay) frase de facilidade |
| `onde_ha_tensao` | alguma dinâmica tem aspecto discordante ou frase de tensão |
| `comunicacao` | alguma frase mantida sustenta a dimensão **comunicação** |
| `afeto_e_intimidade` | dimensão **afeto e intimidade** ou **emocional** |
| `vida_pratica_e_sustentacao` | dimensão **vida prática** ou **sustentação e compromisso** |
| `o_que_a_relacao_mobiliza` | dimensão **transformação** |

As dimensões ação e desejo, expansão, limites e identidade alimentam as sínteses, o encontro e a tensão, mas não abrem bloco próprio. Dimensões só valem se o conteúdo da glosa as sustenta (nunca "Mercúrio é comunicação").

## 5. A tabela de ênfase por vínculo

O vínculo orienta ordem de apresentação, atenção relativa, a escolha entre blocos já liberados e o espaço de uma dimensão. Só entra no prompt a ênfase, restrita aos blocos liberados.

| Vínculo | Ênfase sugerida (nesta ordem) |
|---|---|
| romântico | afeto e intimidade, comunicação, o que a relação mobiliza |
| amizade | pontos em comum, onde se encontram, comunicação |
| família | vida prática e sustentação, o que a relação mobiliza, afeto e intimidade |
| trabalho | comunicação, vida prática e sustentação, onde há tensão |
| outro | nenhuma |

O vínculo **não** pode: alterar fatos, orbes ou o ranking do seletor; criar evidência; transformar uma glosa; apagar dinâmica central. Isto está no prompt (regra 13) e nos testes: seleção idêntica nos 5 vínculos, ordem das dinâmicas preservada, só saem frases de dependência real e só mudam textos de exemplo.

## 6. O verificador estrutural (gate, determinístico)

Forma (nove chaves, nulo ou parágrafos com texto e ids); nenhum bloco à força (obrigatórios existem, os não liberados são `null`, `pontos_em_comum` só com ponto em comum); toda afirmação cita evidência, e só id recebido; o bloco cita o que o sustenta (tensão cita tensão, encontro cita facilidade, cada bloco temático cita evidência da dimensão dele); a síntese da relação cita uma das duas dinâmicas mais relevantes; vocabulário fechado **sobre o que o modelo recebeu** (aspecto inexistente, dono trocado, Ascendente/MC/casa sem fato, signo da Lua ambíguo, retrogradação indeterminada, condição natal); elemento, modo e mesmo signo só com o ponto em comum e o valor certo; contradição (harmônico e discordante, quando existem, aparecem); vocabulário vetado (veredito, porcentagem, duração, karma, previsão, conselho, diagnóstico, travessão); termo de outro vínculo que nem o vínculo declarado nem a evidência trazem; tamanho.

## 7. O juiz semântico: as 11 regras (modo sombra)

Roda **depois** do estrutural, sobre a resposta que ele aprovou, com uma chamada só, temperatura 0, modelo menor que o do gerador. Vê cada parágrafo e **somente a evidência que ele citou** (os fatos, as frases do repertório que o payload trouxe e, nos pontos em comum, a ressalva). Registra as violações por regra, com o trecho e o motivo.

| Regra | Pergunta |
|---|---|
| S1 fidelidade | Alguma afirmação interpretativa do parágrafo diz mais do que as frases da evidência citada dizem, ou algo que elas não dizem? |
| S2 causalidade | Alguma frase atribui causa ('faz com que', 'por causa de', 'é por isso que') que a evidência não atribui? |
| S3 fatalismo ou promessa | Uma tensão foi apresentada como destino ou sentença, ou uma facilidade como garantia (de afeto, de durabilidade, de êxito)? |
| S4 veredito implícito | O parágrafo conclui algo sobre a relação como um todo (que funciona, que é difícil, que é boa), mesmo sem usar nota, porcentagem ou 'combinam'? |
| S5 prescrição implícita | Há instrução ou conselho disfarçado ('vale observar', 'convém atenção', 'o desafio é aprender a...'), ou indicação de ficar, terminar ou agir? |
| S6 diagnóstico ou rótulo | Alguém foi diagnosticado ou recebeu um traço fixo de personalidade ('é controlador', 'é ansiosa') em vez de uma dinâmica possível? |
| S7 tensão como defeito | Uma pessoa foi culpada, ou a diferença foi tratada como erro ou falta de alguém? |
| S8 semelhança como facilidade | Um ponto em comum foi apresentado como facilidade, afinidade garantida ou compatibilidade, ou uma diferença como incompatibilidade? |
| S9 vínculo criando significado | O vínculo declarado mudou o que a evidência diz, ou o texto supôs uma relação que o vínculo não é (namoro, intimidade sexual, sociedade)? |
| S10 cena inventada | Há episódio, fala, lugar, hora ou data que não está na evidência? |
| S11 contradição escolhida | Numa síntese, o parágrafo escolheu um lado de uma contradição que a evidência deixa aberta, ou costurou uma harmonia que ela não sustenta? |

**Em sombra ele não bloqueia a resposta, não dispara reparo e não muda nenhum resultado.** Um juiz que falha, devolve lixo ou aponta tudo vira só um registro (há teste de cada caso). Nunca absolve: o que o estrutural reprovou continua reprovado. O registro traz versão, status (`ok`, `saida_invalida`, `falhou`), violações e quantas foram descartadas por regra desconhecida ou parágrafo inexistente.

**Calibração** (já implementada, só conta): `calibrar()` compara o registro do juiz com as marcas humanas por (parágrafo, regra) e devolve verdadeiro positivo, falso positivo, falso negativo, precisão e recall por regra. Não altera nenhuma nota humana. O juiz só vira gate depois dessa comparação, e a decisão é sua.

## 8. Reparo e fallback

Contrato pronto e testado, **desligado** na primeira bateria (`reparoAtivo: false`): a saída bruta reprovada é devolvida como `bruta_reprovada`, com as violações, para observação.

```
geração → verificador estrutural ─ aprovou ─► (juiz em sombra) ─► entrega
                    │ reprovou
                    ▼
        reparo direcionado, no máximo 2 ─► verificador estrutural ─ aprovou ─► entrega
                    │ ainda reprova
                    ▼
        molde determinístico ─► verificador estrutural ─ aprovou ─► entrega
                    │ não existe (en, es) ou reprova
                    ▼
        indisponível (a tela mostra o aviso padrão; nunca entrega texto não verificado)
```

- **Sem laço:** um `for` com limite fixo de 2 chamadas e nada mais; sem recursão, sem "tente até passar". Teste: um reparador que nunca corrige é chamado exatamente 2 vezes, e a mutação do limite é detectada.
- **Repara só o apontado:** o pedido de reparo traz o mesmo prompt, a resposta anterior e as violações, e manda corrigir somente o apontado, preservar o resto palavra por palavra, não acrescentar evidência e não refazer cálculo. O código confere: se o verificador localizou a violação (`bloco[i]:`) e o reparo mexeu em outro parágrafo, o reparo é **recusado** (conta como tentativa). Violação sem localização (o total de palavras, uma regra sobre a síntese inteira) libera o texto todo.
- **Nunca refaz cálculo nem acrescenta evidência:** o payload é o mesmo, e a resposta reparada só pode citar o que ele traz (o estrutural confere de novo).
- **O molde** é só para `pt` (o idioma da evidência): a síntese da relação e a síntese final, cada parágrafo um fato calculado seguido das frases do repertório que o payload trouxe, sem interpretar. Nos 18 pares × 5 vínculos o molde passa no verificador (90 de 90). Em `en` e `es` não há molde, e o fim da linha é "indisponível".
- O juiz nunca roda sobre molde nem sobre resposta reprovada.

## 9. Tamanho de um prompt real (pt)

| | tokens |
|---|---|
| system | 163 |
| user, par 0×7, amizade | ~6.430 |
| **total, par 0×7** | **~6.600** |
| 18 pares, amizade: mediana / mínimo / máximo | 6.550 / 5.600 / 7.200 |

Subiu cerca de 200 tokens em relação à versão anterior por causa das regras novas (natureza do texto, facilidade não é promessa, concisão, sem repetição). A seleção em si não mudou. O pedido do juiz, com uma resposta de 9 blocos, fica na casa de 4 a 7 mil tokens (o molde de 2 parágrafos já dá 1,2 a 2,5 mil).

## 10. Custo estimado por geração (sem medição real)

Preços de referência do gpt-4o (US$ 2,50 entrada / 10 saída por milhão) e do gpt-4o-mini (US$ 0,15 / 0,60). Saída estimada em 0,9 a 1,3 mil tokens (a concisão deve ficar na parte baixa).

| Peça | Custo |
|---|---|
| Geração (6,6 mil entrada + ~1,1 mil saída), gpt-4o | ~US$ 0,027 |
| Juiz em sombra (~5 mil entrada + ~0,4 mil saída), modelo pequeno | ~US$ 0,001 |
| **Geração + juiz** | **~US$ 0,03** |
| Geração + juiz com o juiz também no gpt-4o | ~US$ 0,05 |
| Pior caso com reparo ligado (geração + 2 reparos + juiz) | ~US$ 0,09 |

Bateria pequena de calibração: 20 leituras ≈ US$ 0,60 com juiz pequeno, ≈ US$ 1,00 com juiz grande.

## 11. Conflitos e pontos que precisam do seu olho

1. **93 virou 65.** Das 93 frases da contagem anterior, 65 nomeiam de fato um tipo de relação; as outras eram campo da vida, terceiro ou idioma. Se você quiser que alguma delas também seja tratada, diga qual.
2. **Venus/Marte fica magro para amizade e trabalho.** As frases de atração, desejo e devoção saem, e ficam as que se declaram fora do romance e as de colaboração. É o efeito pedido, mas vale a leitura: o par mais "físico" do livro vira, fora do romântico, quase só complementaridade entre iniciativa e acabamento.
3. **`outro` recebe só o neutro.** Mesmo as frases de negócios, que seriam válidas para uma relação profissional, não vão ao `outro`. Se você prefere o contrário, é uma linha por frase.
4. **"Ordem de apresentação."** O schema tem as nove chaves numa ordem fixa. O vínculo orienta a ordem **dentro do texto** e a atenção relativa, via ênfase sugerida; não reordena as chaves.
5. **Juiz só sobre o que o estrutural aprovou.** Isso poupa custo e evita avaliar JSON quebrado, mas a calibração não verá as respostas que o estrutural reprovou. Se você quer o juiz também sobre a saída bruta reprovada, é uma mudança de um `if`, e o efeito é medir mais.
6. **Reparo sem localização.** As violações que o verificador não localiza liberam o texto todo no reparo. É a única brecha do "preservar o que estava válido", e é inerente a regras que olham a síntese inteira.
7. **Molde só em português.** Em `en`/`es` o fim da linha é "indisponível". Traduzir o molde exigiria texto fixo traduzido, que ainda não existe.
8. **Glosas só em português.** O modelo traduz a evidência em `en`/`es`; a regra proíbe ampliar o sentido, e só os ids são conferidos com certeza.
9. **Tabelas de blocos e de ênfase são editoriais** (o livro não divide a leitura em blocos). Aprovadas por você, e registradas como tais.
10. **A margem do prompt cresceu ~200 tokens.** Aceitável, mas é o custo das regras de concisão e de não repetição.

## 12. Para a bateria de calibração (depois da sua aprovação)

20 leituras (os 18 pares do corpus + 2 sem hora), vínculos variados, gerador no modelo de produção, reparo desligado, juiz em sombra. O que sai: a resposta bruta, o veredito estrutural, o registro do juiz e a planilha para a marcação humana por (parágrafo, regra). A comparação usa `calibrar()`.
