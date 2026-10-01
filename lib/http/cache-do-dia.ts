/**
 * Cabeçalho de cache para o conteúdo que é do DIA, e de todo mundo.
 *
 * O céu de hoje e a tiragem do dia não pertencem a ninguém: são os mesmos para
 * qualquer pessoa que abra o site naquele dia e naquele idioma. Mesmo assim
 * saíam com `no-cache`, e o servidor refazia o trabalho a cada visita para
 * entregar menos de um quilobyte — medido em produção, entre 0,84 s e 2,25 s
 * por requisição.
 *
 * TRÊS CONDIÇÕES, e todas precisam valer ao mesmo tempo:
 *
 *  1. O IDIOMA VEM DA URL. Se viesse do cookie, uma resposta em português
 *     ficaria guardada na borda sob uma chave que o pedido em espanhol também
 *     acerta, e alguém leria o dia no idioma de outro. `Vary: Cookie` resolveria
 *     no papel, mas depende de a CDN respeitar e de o cookie não variar por
 *     outro motivo. Idioma na URL faz a chave ser a própria URL, e aí não há o
 *     que misturar;
 *
 *  2. O CONTEÚDO ESTÁ COMPLETO. Guardar uma resposta com `sintese: null`
 *     congelaria o estado "ainda não ficou pronto" até a virada do dia: a
 *     primeira visita da manhã, feita enquanto o texto ainda é gerado, deixaria
 *     o site inteiro sem leitura por horas. Incompleto não entra em cache;
 *
 *  3. É CONTEÚDO PÚBLICO. Nada de sessão, nada de entitlement, nada por pessoa.
 *     Quem chama já verificou isso.
 *
 * SEM `stale-while-revalidate`, de propósito. Ele serviria conteúdo vencido por
 * alguns segundos depois da virada — e vencido aqui significa O CÉU DE ONTEM.
 * O ganho seria poupar uma geração na primeira visita do dia; o preço seria
 * dizer a data errada para quem chega à meia-noite. Não compensa.
 */
import { diaDeHoje } from "@/lib/astro/ceu"

/** Fuso em que o produto vira o dia. O mesmo de `diaDeHoje`. */
const FUSO = "America/Sao_Paulo"

/**
 * Quantos segundos faltam para a virada do dia no fuso do produto.
 *
 * Calculado pela diferença entre agora e a meia-noite seguinte DAQUELE fuso, e
 * não do servidor: a Netlify roda em UTC, e usar a meia-noite de lá deixaria o
 * cache vencer três horas antes ou depois, dependendo da época do ano.
 */
export function segundosAteAVirada(agora: Date = new Date()): number {
  const hoje = diaDeHoje()
  // meia-noite do dia seguinte, no fuso do produto, expressa em UTC
  const [ano, mes, dia] = hoje.split("-").map(Number)
  const amanha = new Date(Date.UTC(ano, mes - 1, dia + 1, 0, 0, 0))
  const deslocamento = deslocamentoDoFuso(amanha)
  const virada = amanha.getTime() - deslocamento
  const faltam = Math.floor((virada - agora.getTime()) / 1000)
  // um piso de 30 s evita TTL zero ou negativo no instante exato da virada
  return Math.max(30, faltam)
}

/** Deslocamento do fuso do produto em milissegundos, para a data dada. */
function deslocamentoDoFuso(quando: Date): number {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  const p = Object.fromEntries(f.formatToParts(quando).map((x) => [x.type, x.value]))
  const comoUtc = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour) % 24,
    Number(p.minute),
    Number(p.second),
  )
  return comoUtc - quando.getTime()
}

/**
 * O valor de `Cache-Control` para uma resposta do dia.
 *
 * `publicavel` é quem chama quem decide, e deve ser falso sempre que o conteúdo
 * estiver incompleto ou o idioma não tiver vindo explícito na URL.
 */
export function cacheDoDia(publicavel: boolean): string {
  if (!publicavel) return "private, no-cache"
  return `public, s-maxage=${segundosAteAVirada()}, max-age=0, must-revalidate`
}
