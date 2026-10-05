# Lenormand: fichas individuais no handbook (correção de auditoria)

**A auditoria anterior estava errada.** Ela concluiu que não existia ficha estruturada por carta de Lenormand, porque o índice lexical (`data/pdfs_index/pdfs.index.json`) é fatiado em trechos soltos e majoritariamente relacionais (só a Raposa aparece em 125 trechos, quase todos combinações). Esse diagnóstico vale para o ÍNDICE, não para o LIVRO.

**O que o livro tem.** *The Complete Lenormand Oracle Handbook* (Caitlín Matthews, Destiny Books), capítulo 2 ("Lenormand Lexicon"): **36 de 36 entradas individuais**, uma por carta, todas com a mesma estrutura, e as combinações vêm **separadas**, depois do rótulo `Combinations:`:

`General` · `Effect` · `Nouns` · `Adjectives` · `Verbs` · `Adverbs` · `People` · `Timing` · `Lenormand Universe` · `Combinations`

(PDF `data/pdfs/lenormand_handbook.pdf`, sha256 `a5cbdaad…c542db`; as 36 entradas ocupam as págs. 62–118 do PDF.)

**Como foi extraído.** `scripts/extrair-lenormand.mjs` → `lib/oracles/lenormand-fichas.ts` (gerado, não editar). Sem OpenAI. Duas decisões deliberadas:
- tudo depois de `Combinations:` fica de fora (é relação entre cartas, não significado isolado);
- do `General` saem as frases que citam outra carta ou outro sistema ("Fox + Moon…", "não leia a Lua do Lenormand como a do Tarot"): 130 frases cortadas nas 36 fichas, com o menor `General` ainda com 89+ caracteres.

**Uso atual (escopo desta frente).** Só a interpretação individual da carta de Lenormand no verso da tiragem do dia da Home. Não altera `references.ts` nem a síntese geral do Lenormand.

**Para a frente metodológica completa de Lenormand.** Reaproveitar estas fichas como base. Pontos a decidir lá: a hifenização de fim de linha do PDF (`momen tary`), que a ficha preserva por ser evidência interna; o uso de `Effect`, `People` e `Adverbs`; `Timing` e `Lenormand Universe` (este último, nas palavras da autora, "a nontraditional, mythic title … from my own practice") ficaram na ficha mas nunca vão ao modelo; e as `Combinations`, que são o material certo para a camada relacional e não para o significado isolado.
