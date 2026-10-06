/**
 * Lista as frases operacionais do repertório que citam um tipo de relação, para
 * revisão humana. A busca por palavra só LOCALIZA candidatos; quem decide se é
 * exemplo contextual ou dependência real é a revisão, em `aplicabilidade.ts`.
 *
 *   node --import ./scripts/ts-register.mjs scripts/listar-frases-de-vinculo.ts [saida.json]
 */
import fs from "fs"
import { INTERASPECTOS, OVERLAYS, itensDe } from "../lib/astro/davison"

const RE = /(?<![\p{L}])(rom[âa]nti\w*|namor\w*|amante\w*|amor\w*|sexual\w*|sexo|apaixon\w*|paquera|atra[çc][ãa]o|casal|casais|conjug\w*|irm[ãa]\w*|filh\w*|famil\w*|parent\w*|trabalh\w*|profission\w*|emprego|empregad\w*|empregador\w*|patr[ãa]o|colega\w*|s[óo]ci\w*|neg[óo]ci\w*|chefe\w*|m[ée]dic\w*|pacient\w*|professor\w*|alun\w*|cliente\w*|empresa\w*|comercial\w*|parceri\w*|am(i|iz)\w*|intimidade|dom[ée]stic\w*|lar|casa)(?![\p{L}])/iu

const achados: Array<{ id: string; ref: string; texto: string }> = []
for (const g of INTERASPECTOS) for (const i of itensDe(g)) if (RE.test(i.texto)) achados.push({ id: g.id, ref: i.ref, texto: i.texto })
for (const g of OVERLAYS) for (const i of itensDe(g)) if (RE.test(i.texto)) achados.push({ id: g.id, ref: i.ref, texto: i.texto })
const saida = process.argv[2]
if (saida) fs.writeFileSync(saida, JSON.stringify(achados, null, 1))
console.log(achados.length)
