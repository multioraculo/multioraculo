// Permite rodar scripts .ts de verificação fora do Next: resolve o alias "@/"
// e transpila TypeScript com o compilador do próprio projeto (funciona no
// Node 22 do Netlify, sem depender de flags experimentais).
import { register } from "node:module"

register("./ts-hooks.mjs", import.meta.url)
