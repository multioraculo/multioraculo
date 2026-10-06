# Sinastria: estado congelado ao fim da calibração paga

A fase de calibração paga da metodologia (quatro ciclos de geração, 46 respostas) está encerrada. Este documento é o resumo do que ficou fechado; o detalhe está em [bateria-sinastria-1-diagnostico.md](bateria-sinastria-1-diagnostico.md), [bateria-sinastria-1-pos-correcao.md](bateria-sinastria-1-pos-correcao.md) e nos relatórios das baterias [2](bateria-sinastria-2-relatorio.md), [3](bateria-sinastria-3-relatorio.md) e [4](bateria-sinastria-4-relatorio.md). O desenho original do prompt e do verificador está em [sinastria-prompt-e-verificador.md](sinastria-prompt-e-verificador.md) (o prompt vigente é o de `lib/astro/prompt-sinastria.ts`; um exemplo renderizado está em [exemplo-prompt-sinastria.txt](exemplo-prompt-sinastria.txt)).

## O que está em vigor

- **Cadeia:** fatos calculados → evidência selecionada → payload (com a aplicabilidade por vínculo) → prompt → geração → verificador estrutural. O reparo e o molde existem como contrato, desligados. O **juiz semântico fica fora do fluxo**: o contrato (`paragraph_id`, `judge_error`) está correto e testado, mas na calibração ele teve precisão 0,06 e recall 0,10, e só roda se alguém passar `chamarJuiz`.
- **Estrutural, hard fail (`violacoes`):** dono e corpo trocados, evidência que não sustenta, "compatibilidade" e veredito, previsão, conselho inequívoco, diagnóstico, bastidor, condição natal técnica de um corpo, causalidade afirmada (indicativo, passiva, "por causa de X acontece Y"), previsão de duração ou permanência, semelhança tratada como garantia, facilidade natural, "afinidade natural" afirmada diretamente em parágrafo apoiado só em pontos em comum, diferença como incompatibilidade, **fechamento prescritivo da `sintese_final`** (condições, "o desafio está em lidar com...", "requerer paciência", "exigir atenção para...") e limite claramente excedido de tamanho.
- **Estrutural, warning (`avisos`):** 91 a 99 palavras por parágrafo e 701 a 770 no total, vocabulário avaliativo, clichês herdados, travessão, "exigem atenção" e "pode se beneficiar" na síntese final.
- **Prompt:** contratos próprios de `sintese_da_relacao` (resumo, não inventário) e de `sintese_final` (descreve a configuração em aberto, com um exemplo incorreto e uma explicação abstrata do correto, sem frase pronta para imitar), mais a regra de signo, elemento e modo (não completar astrologia de memória).

## Limitação semântica conhecida (não resolvida de propósito)

Para evidências de **Mercúrio no mesmo signo** (`signo:mercury`), o modelo às vezes dá à semelhança um efeito positivo que a evidência não dá (a fonte diz só "fatores pessoais, e podem trazer dificuldades"): "reforça essa ligação", "abordagem mental semelhante", "base comum de entendimento". Apareceu em cinco respostas ao longo das baterias. É fidelidade fina, e não é pegável por expressão regular sem falsos positivos; fica registrada, sem regra.

Outras limitações conhecidas: a regra de conselho é lexical e sem exceção ("precisam" descritivo reprova); o detector de fechamento prescritivo é lexical e cobre as formas demonstradas; as glosas do repertório estão só em português.

## O que não mudou nesta fase

Schema das nove chaves, seletor e ranking, budgets, cálculo astrológico, glosas Davison (exceto a camada de aplicabilidade), regra de dono, fallback e UI.
