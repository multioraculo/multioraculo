import { existsSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import ts from "typescript"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const isFile = (p) => existsSync(p) && statSync(p).isFile()
const find = (p) => [p, `${p}.ts`, `${p}.tsx`, path.join(p, "index.ts")].find(isFile) ?? null

export async function resolve(specifier, context, nextResolve) {
  let target = null
  if (specifier.startsWith("@/")) {
    target = find(path.join(ROOT, specifier.slice(2)))
  } else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
    target = find(path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier))
  }
  if (target) return { url: pathToFileURL(target).href, shortCircuit: true }
  try {
    return await nextResolve(specifier, context)
  } catch (erro) {
    // subcaminho de pacote sem extensão ("next/server"), que o Next resolve pelo bundler e o Node ESM não.
    // Só entra quando a resolução normal já falhou; nada que funcionava muda.
    if (erro?.code === "ERR_MODULE_NOT_FOUND" && /^[a-z@][^./]*(\/[^./]+)+$/i.test(specifier)) {
      return nextResolve(`${specifier}.js`, context)
    }
    throw erro
  }
}

export async function load(url, context, nextLoad) {
  if (url.startsWith("file:") && /\.tsx?$/.test(url)) {
    const fileName = fileURLToPath(url)
    const { outputText } = ts.transpileModule(readFileSync(fileName, "utf8"), {
      fileName,
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        isolatedModules: true,
      },
    })
    return { format: "module", source: outputText, shortCircuit: true }
  }
  return nextLoad(url, context)
}
