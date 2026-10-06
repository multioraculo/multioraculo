/**
 * Exporta as 20 respostas da bateria em Markdown, em partes, para avaliação
 * cega por outra IA. Sem estrutural, sem juiz, sem vínculo de hash: só o texto
 * gerado, o material de evidência e a ficha.
 *
 *   node --import ./scripts/ts-register.mjs scripts/bateria-sinastria-exportar-md.ts
 */
import fs from "fs"
import path from "path"
import type { PayloadSinastria } from "../lib/astro/payload-sinastria"

const RAIZ = path.resolve("data/bateria-sinastria")
const SAIDA = path.join(RAIZ, "para-avaliacao-externa")
fs.mkdirSync(SAIDA, { recursive: true })
const PARTES = 4
const ordem = Object.keys(JSON.parse(fs.readFileSync(path.join(RAIZ, "chave.json"), "utf8")))
const CHAVES = ["sintese_da_relacao", "pontos_em_comum", "onde_se_encontram", "onde_ha_tensao", "comunicacao", "afeto_e_intimidade", "vida_pratica_e_sustentacao", "o_que_a_relacao_mobiliza", "sintese_final"]

const INSTRUCOES = `# Avaliação cega de leituras de sinastria

Você é um avaliador humano-equivalente. Vai avaliar respostas de um sistema que escreve leituras de sinastria (comparação de dois mapas astrológicos). **Você avalia o sistema, não o casal.** Nenhuma nota é compatibilidade entre pessoas.

## Como o sistema funciona
1. Cálculos astrológicos já foram feitos por código (ninguém, nem o modelo, calcula astrologia).
2. Um seletor escolheu os fatos e as frases de um repertório (Davison, *Synastry*) que o modelo recebeu. Isso é o **MATERIAL DE EVIDÊNCIA** de cada resposta. O modelo só podia afirmar o que esse material sustenta.
3. O modelo escreveu a leitura em 9 blocos, cada parágrafo citando os ids da evidência de onde saiu.

"seu/sua X" é a primeira pessoa (A); "X da outra pessoa" é a segunda (B). Em "quem tem o Sol / quem tem a casa", a direção está dita no fato.

## Regras que o texto deveria respeitar
Descrever dinâmicas possíveis (não a verdade da relação); só dizer o que o material sustenta; integrar sem votar; preservar contradições (facilidade e tensão convivem); facilidade não é promessa e tensão não é condenação; semelhança não é compatibilidade; sem previsão, duração, destino, karma, diagnóstico, nota, porcentagem ou veredito; sem aconselhar ficar, terminar ou agir; o vínculo (romântico, amizade, família, trabalho, outro) pode mudar só a ênfase, nunca a astrologia nem o significado; concisão; sem repetir a mesma dinâmica em síntese, bloco e síntese final.

Um bloco \`null\` quer dizer que o modelo não o escreveu. **Não assuma que \`null\` é falha.** Não exija que todas as dinâmicas sejam citadas: uma leitura pode usar 5 de 12 e ser excelente se escolheu as cinco certas.

## O que avaliar em cada resposta
Para cada resposta devolva um objeto JSON com:

- \`id\`
- \`criterios\`: notas de 1 a 5 (5 = ótimo, sem problema; 1 = grave; nota alta é sempre bom) em:
  - \`fidelidade\`: cada afirmação interpretativa está no material?
  - \`nao_sustentadas\`: 5 = nenhuma afirmação sem sustentação
  - \`inventada\`: 5 = nenhuma informação inventada (fatos, cenas, significados)
  - \`dono\`: 5 = nenhuma troca de dono/corpo (de quem é o planeta, entre quais corpos é o aspecto)
  - \`proporcao\`: o central pesa mais que o secundário?
  - \`contradicoes\`: facilidade e tensão convivem sem uma apagar a outra?
  - \`sintese\`: qualidade real da integração, sem escolher lado nem concluir sobre a relação
  - \`omissoes\`: 5 = nada central ficou de fora
  - \`repeticao\`: 5 = cada bloco acrescenta
  - \`vinculo\`: ênfase legítima, sem supor o que o vínculo não é nem criar significado
  - \`naturalidade\`
  - \`determinismo\`: 5 = só possibilidade, sem tom de destino ou previsão
  - \`conselho\`: 5 = sem aconselhamento, prescrição ou diagnóstico
  - \`geral\`: nota de qualidade da resposta como produto
- \`marcas\`: para cada parágrafo com problema, \`"bloco[i]": ["S1", ...]\` (i começa em 0), usando:
  - S1 fidelidade: diz mais do que a evidência citada diz
  - S2 causalidade: atribui causa que a evidência não atribui
  - S3 fatalismo ou promessa: tensão como destino, facilidade como garantia
  - S4 veredito implícito: conclui algo sobre a relação como um todo
  - S5 prescrição implícita: instrução ou conselho disfarçado; indicação de ficar, terminar ou agir
  - S6 diagnóstico ou rótulo: traço fixo de personalidade
  - S7 tensão como defeito: culpa alguém ou trata diferença como erro
  - S8 semelhança como facilidade: ou diferença como incompatibilidade
  - S9 vínculo criando significado: o vínculo mudou o que a evidência diz ou supôs relação que ele não é
  - S10 cena inventada: episódio, fala, lugar, hora ou data fora da evidência
  - S11 contradição escolhida: escolheu um lado, ou costurou harmonia que a evidência não sustenta
  Marque só o que você vê; parágrafo sem problema não entra.
- \`nulosLiberados\`: para cada bloco listado na resposta como "liberado mas null": \`"1"\` = integrada em outro bloco, \`"2"\` = ficou realmente ausente, \`"3"\` = evidência fraca demais para bloco próprio
- \`cobertura\`: para cada dinâmica listada como "não citada": \`"sec"\` = secundária ou redundante (omissão se justifica), \`"cen"\` = central e relevante (omissão é perda)
- \`notas\`: comentário curto, só o essencial (principais problemas, com o trecho)

Seja rigoroso e independente: confira de fato cada afirmação contra o material, e confira cada "seu/sua/da outra pessoa". Devolva um único array JSON com um objeto por resposta, mais, se quiser, um parágrafo de observações gerais.

---

`

function evidencia(p: PayloadSinastria): string {
  const din = (titulo: string, ds: PayloadSinastria["aspectos"]) =>
    ds.length === 0
      ? ""
      : `### ${titulo}\n\n` +
        ds.map((d) => `**[${d.id}]**${d.contraponto ? " (entrou como contraponto)" : ""}\n` + d.fatos.map((f) => `- fato \`${f.id}\`: ${f.texto}`).join("\n") + `\n  o que o repertório diz:\n` + d.evidencia.map((e) => `  - ${e}`).join("\n")).join("\n\n") + "\n\n"
  const sem = p.semelhancas.length
    ? `### Pontos em comum\n\n` + p.semelhancas.map((s) => `**[${s.id}]** ${s.fato}\n` + s.nucleo.map((n) => `  - ${n}`).join("\n")).join("\n\n") + (p.ressalvaDasSemelhancas ? `\n\nressalva: ${p.ressalvaDasSemelhancas}` : "") + "\n\n"
    : `### Pontos em comum\n\nnenhum com material do livro.\n\n`
  return din("Aspectos entre os dois mapas (em ordem de relevância)", p.aspectos) + din("Overlays e planetas sobre ângulos", p.overlays) + sem
}

const blocos: string[] = ordem.map((id, k) => {
  const r = JSON.parse(fs.readFileSync(path.join(RAIZ, "resultado", `${id}.json`), "utf8"))
  const p: PayloadSinastria = r.payload
  let s: Record<string, { paragrafos?: Array<{ texto: string; evidencias: string[] }> } | null> = {}
  let bruto: string | null = null
  try {
    const parsed = r.sintese ?? JSON.parse(r.geracao.texto)
    if (parsed && typeof parsed === "object") s = parsed
    else bruto = String(r.geracao?.texto ?? "")
  } catch { bruto = String(r.geracao?.texto ?? "") }
  const escritos = CHAVES.filter((c) => s[c] && Array.isArray(s[c]!.paragrafos))
  const nulosLiberados = p.blocosElegiveis.filter((b) => !escritos.includes(b))
  const citadas = new Set(escritos.flatMap((c) => s[c]!.paragrafos!.flatMap((x) => (x.evidencias ?? []).map(String))))
  const naoCitadas = [...p.aspectos, ...p.overlays].filter((d) => !citadas.has(d.id) && !d.fatos.some((f) => citadas.has(f.id))).map((d) => d.id)
  const texto = bruto
    ? `Texto bruto (fora do formato esperado):\n\n${bruto}\n`
    : CHAVES.map((c) => (s[c] && Array.isArray(s[c]!.paragrafos) ? `**${c}**\n\n` + s[c]!.paragrafos!.map((x, i) => `\`${c}[${i}]\` ${x.texto}\n   _cita: ${(x.evidencias ?? []).join(", ")}_`).join("\n\n") : `**${c}**: null`)).join("\n\n")
  return [
    `## RESPOSTA ${id}  (${k + 1} de ${ordem.length})`,
    `Vínculo declarado: **${r.vinculo}**. Blocos que o código liberou: ${p.blocosElegiveis.join(", ")}. Ênfase sugerida: ${p.enfase.join(", ") || "nenhuma"}.`,
    `O que não era conhecido: ${p.indisponibilidades.join(" · ") || "nada (as duas horas eram conhecidas)"}.`,
    `\n### TEXTO GERADO\n\n${texto}`,
    `\n### Liberados mas null (avalie cada um em \`nulosLiberados\`)\n\n${nulosLiberados.length ? nulosLiberados.map((b) => `- ${b}`).join("\n") : "nenhum"}`,
    `\n### Dinâmicas não citadas (avalie cada uma em \`cobertura\`)\n\n${naoCitadas.length ? naoCitadas.map((b) => `- ${b}`).join("\n") : "nenhuma"}`,
    `\n### MATERIAL DE EVIDÊNCIA (o que o modelo recebeu)\n\n${evidencia(p)}`,
    "\n---\n",
  ].join("\n")
})

const por = Math.ceil(blocos.length / PARTES)
for (let i = 0; i < PARTES; i++) {
  const fatia = blocos.slice(i * por, (i + 1) * por)
  const arq = path.join(SAIDA, `parte-${i + 1}-de-${PARTES}.md`)
  fs.writeFileSync(arq, INSTRUCOES + `# PARTE ${i + 1} DE ${PARTES}: ${fatia.length} respostas\n\n` + fatia.join("\n"))
  console.log(arq, Math.round(fs.statSync(arq).size / 1024), "KB")
}
