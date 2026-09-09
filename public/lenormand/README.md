# Arte das cartas do Lenormand

Gravuras marfim com fundo transparente, uma por carta (`<id>.png`), ingeridas
das imagens de referência do baralho com `scripts/lenormand-ingest.mjs`.
Cada PNG é a janela x 8–92 %, y 14–85 % da carta original; o componente
`components/lenormand-table.tsx` posiciona a arte na mesma janela da lâmina
em CSS, por isso escala e posição batem com a referência. Número e nome não
vêm da imagem: são do motor, no idioma da pessoa.

Comandos usados (folhas em `CartasLenormand_a…h.png`):

```
node scripts/lenormand-ingest.mjs CartasLenormand_a.png book,letter,man,woman,lily,sun,anchor,cross --cols 4 --rows 2 --sheet 100,30,1350,1040
node scripts/lenormand-ingest.mjs CartasLenormand_b.png clouds
node scripts/lenormand-ingest.mjs CartasLenormand_c.png fox,bear,stork --cols 3
node scripts/lenormand-ingest.mjs CartasLenormand_d.png stars,tower,garden --cols 3
node scripts/lenormand-ingest.mjs CartasLenormand_e.png ship,key --cols 2
node scripts/lenormand-ingest.mjs CartasLenormand_f.png coffin,clover,mountain --cols 3
node scripts/lenormand-ingest.mjs CartasLenormand_g.png house,snake,bouquet --cols 3 --sheet 100,45,1000,485
node scripts/lenormand-ingest.mjs CartasLenormand_g.png scythe,whip,child --cols 3 --sheet 100,485,1000,915
node scripts/lenormand-ingest.mjs CartasLenormand_g.png crossroads,mice,heart --cols 3 --sheet 100,915,1000,1330
node scripts/lenormand-ingest.mjs CartasLenormand_h.png birds
```

Ainda sem arte (a lâmina mostra só número e nome): rider (1), tree (5),
dog (18), ring (25), moon (32), fish (34).
