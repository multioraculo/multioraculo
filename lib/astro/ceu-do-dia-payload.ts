/**
 * O céu do dia, pronto para a tela, de um lugar só.
 *
 * Isto nasceu dentro de `app/api/ceu-dia/route.ts` e saiu de lá quando a Home
 * passou a precisar do mesmo conteúdo no servidor. A alternativa seria a página
 * chamar a própria API por HTTP — uma requisição de rede para falar com o
 * mesmo processo, com o custo de uma volta inteira e de um `fetch` que pode
 * falhar sozinho. Com a função extraída, página e rota leem a MESMA fonte, e
 * não existe versão da verdade que possa divergir da outra.
 *
 * O CORPO DEVOLVIDO É IDÊNTICO ao que a rota devolvia: mesmos campos, mesma
 * ordem, mesmos valores, inclusive nos dois caminhos de queda (sem chave da
 * OpenAI e erro na geração). A rota agora só embrulha isto num `NextResponse` e
 * decide o cabeçalho de cache.
 */
import OpenAI from "openai"
import type { Locale } from "@/lib/i18n/config"
import { recordAiUsage } from "@/lib/ai/usage"
import { diaDeHoje, estadoDoCeu } from "./ceu"
import { camadaFactual, fatosDoCeu } from "./ceu-do-dia"
import { leituraDoCeu, lerCeuGravado } from "./ceu-do-dia-server"

const MODELO = "gpt-4o"

export type CeuDoDiaNaTela = {
  dia: string
  factual: ReturnType<typeof camadaFactual>
  fatos: Array<{ id: string; factual: string; texto: string }>
  sintese: string | null
  cache: boolean
}

/** Só os campos que a tela usa: o resto do fato é para o prompt e o verificador. */
function paraTela(fatos: ReturnType<typeof fatosDoCeu>["escolhidos"]) {
  return fatos.map((f) => ({ id: f.id, factual: f.factual, texto: f.texto }))
}

export async function payloadDoCeuDoDia(locale: Locale): Promise<CeuDoDiaNaTela> {
  const dia = diaDeHoje()

  const semTexto = (): CeuDoDiaNaTela => {
    const ceu = estadoDoCeu(dia)
    const { escolhidos } = fatosDoCeu(ceu, locale)
    return { dia, factual: camadaFactual(ceu, escolhidos, locale), fatos: paraTela(escolhidos), sintese: null, cache: false }
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return semTexto()
  const openai = new OpenAI({ apiKey })

  try {
    const resultado = await leituraDoCeu({
      dia,
      locale,
      gerar: async ({ system, user }) => {
        const resposta = await openai.chat.completions.create({
          model: MODELO,
          temperature: 0.7,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        })
        await recordAiUsage({
          operation: "sky_daily",
          model: resposta.model ?? MODELO,
          usage: resposta.usage,
          seed: `${dia}:${locale}`,
        })
        return { conteudo: resposta.choices[0]?.message?.content ?? "{}", model: resposta.model ?? MODELO }
      },
    })
    return {
      dia: resultado.dia,
      factual: resultado.factual,
      fatos: paraTela(resultado.fatos),
      sintese: resultado.sintese,
      cache: resultado.cache,
    }
  } catch (erro) {
    // ERRO DE INFRAESTRUTURA, e não esgotamento do ciclo de qualidade. A
    // distinção é de dinheiro: aqui nada é gravado, e o próximo pedido pode
    // tentar de novo, porque as quatro respostas nunca existiram. O
    // esgotamento, que tranca o dia, é registrado em `leituraDoCeu` e só lá.
    console.error(`[ceu-dia] dia=${dia} locale=${locale} erro=infraestrutura`, erro)
    return semTexto()
  }
}

/**
 * O mesmo corpo, mas SÓ se o texto do dia já estiver gravado.
 *
 * É esta que a Home usa no servidor. A outra pode chamar a OpenAI e demorar
 * segundos; usá-la no render seguraria o HTML inteiro até a geração terminar,
 * que é exatamente o contrário do que esta mudança quer. Aqui há no máximo uma
 * consulta ao banco: se o texto existe, a Home entrega tudo junto com o HTML;
 * se não existe, devolve nulo e a página se comporta como sempre, com o cliente
 * buscando e a geração acontecendo lá.
 *
 * A camada factual é cálculo puro e não depende de rede, então ela vem junto
 * nos dois casos.
 */
export async function payloadDoCeuDoDiaSeGravado(locale: Locale): Promise<CeuDoDiaNaTela | null> {
  const dia = diaDeHoje()
  const guardado = await lerCeuGravado(dia, locale)
  if (!guardado) return null

  const ceu = estadoDoCeu(dia)
  const { escolhidos } = fatosDoCeu(ceu, locale)
  return {
    dia,
    factual: camadaFactual(ceu, escolhidos, locale),
    fatos: paraTela(escolhidos),
    sintese: guardado.sintese,
    cache: true,
  }
}
