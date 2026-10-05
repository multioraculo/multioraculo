"use client"

/**
 * Imagem do inconsciente — "Estudo do dia".
 *
 * NÃO É LEITURA DE NINGUÉM, nem arquétipo regente, nem previsão, nem resultado
 * das outras tiragens. É uma biblioteca simbólica curada da qual UM estudo é
 * apresentado por dia, o mesmo para todos, pelo ciclo de lib/oracles. Se ele
 * combinar com o que a pessoa tirou em outro oráculo, a coincidência é dela: o
 * sistema não a fabrica.
 *
 * O card termina na paráfrase editorial. Autor, obra, página e citação NÃO
 * aparecem aqui (ficam em `fontes`, no repertório, para rastreio e para a
 * futura página /explorar/imagens/[slug]). Também não há CTA: "Aprofundar"
 * volta quando existir destino real. Nada de aviso explicando o mecanismo; se a
 * metodologia precisar de espaço, vai para um ⓘ ou "Como funciona".
 *
 * Os glifos são geométricos de propósito. Desenho figurativo pequeno vira
 * borrão e puxa a peça para ilustração de banco de imagens; a forma reduzida
 * fica na mesma família das runas e dos búzios, é nítida em qualquer tamanho e
 * não pesa um byte de rede.
 */
import { useI18n } from "@/components/i18n-provider"
import { estudoDoDia, type SimboloInconsciente } from "@/lib/oracles/simbolos-inconsciente"

/** Traço fino, sem preenchimento, herdando a cor de quem o contém. */
function Glifo({ slug, tamanho = 72 }: { slug: string; tamanho?: number }) {
  const comum = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      {slug === "circulo-mandala" && (
        <>
          <circle cx="50" cy="50" r="32" {...comum} />
          <path d="M50 22 L78 50 L50 78 L22 50 Z" {...comum} />
          <circle cx="50" cy="50" r="7" {...comum} />
        </>
      )}

      {slug === "pedra" && <path d="M26 62 L34 34 L62 26 L78 46 L70 72 L40 76 Z" {...comum} />}

      {slug === "casa" && (
        <>
          <path d="M22 50 L50 26 L78 50" {...comum} />
          <path d="M31 47 L31 76 L69 76 L69 47" {...comum} />
          <path d="M44 76 L44 58 L56 58 L56 76" {...comum} />
        </>
      )}

      {slug === "caverna" && (
        <>
          <path d="M18 78 L18 52 A32 32 0 0 1 82 52 L82 78" {...comum} />
          <path d="M38 78 L38 62 A12 12 0 0 1 62 62 L62 78" {...comum} />
        </>
      )}

      {slug === "arvore" && (
        <>
          <path d="M50 80 L50 30" {...comum} />
          <path d="M50 46 L32 32 M50 46 L68 32 M50 60 L36 50 M50 60 L64 50" {...comum} />
          <path d="M40 84 L60 84" {...comum} />
        </>
      )}

      {slug === "serpente" && (
        <>
          <path d="M24 72 C24 56, 44 58, 44 44 C44 30, 64 30, 68 40 C72 50, 60 56, 54 50" {...comum} />
          <circle cx="70" cy="43" r="1.6" fill="currentColor" stroke="none" />
        </>
      )}

      {slug === "sombra" && (
        <>
          <circle cx="42" cy="46" r="22" {...comum} />
          <circle cx="60" cy="58" r="22" {...comum} strokeDasharray="3 5" />
        </>
      )}

      {slug === "heroi" && (
        <>
          <path d="M18 78 L46 26 L62 54 L82 40" {...comum} />
          <circle cx="46" cy="26" r="4" {...comum} />
        </>
      )}

      {slug === "mae-grande" && (
        <>
          <path d="M26 38 C26 74, 74 74, 74 38" {...comum} />
          <path d="M20 34 L80 34" {...comum} />
          <circle cx="50" cy="52" r="8" {...comum} />
        </>
      )}

      {slug === "animal" && (
        <>
          <path d="M28 54 C28 42, 48 38, 62 42 L74 38 L70 50" {...comum} />
          <path d="M28 54 L28 72 M44 58 L44 72 M58 58 L58 72 M70 52 L72 70" {...comum} />
          <circle cx="70" cy="44" r="1.6" fill="currentColor" stroke="none" />
        </>
      )}

      {slug === "animus" && (
        <>
          <path d="M50 78 L50 34" {...comum} />
          <path d="M34 48 L50 32 L66 48" {...comum} />
          <path d="M34 78 L66 78" {...comum} strokeDasharray="4 5" />
        </>
      )}

      {slug === "anima" && (
        <>
          <path d="M62 24 A28 28 0 1 0 62 76 A22 22 0 1 1 62 24" {...comum} />
          <path d="M44 82 L56 82" {...comum} strokeDasharray="3 4" />
        </>
      )}

      {slug === "trickster" && (
        <>
          <circle cx="50" cy="50" r="30" {...comum} strokeDasharray="5 6" />
          <path d="M28 58 L44 42 L52 58 L72 38" {...comum} />
        </>
      )}

      {slug === "morte-renascimento" && (
        <>
          <path d="M50 20 A30 30 0 0 1 50 80" {...comum} />
          <path d="M50 20 A30 30 0 0 0 50 80" {...comum} strokeDasharray="4 6" />
          <path d="M38 50 L62 50" {...comum} />
        </>
      )}

      {slug === "iniciacao" && (
        <>
          <path d="M28 80 L28 46 A22 22 0 0 1 72 46 L72 80" {...comum} />
          <path d="M50 80 L50 54 M42 62 L50 54 L58 62" {...comum} />
        </>
      )}

      {slug === "montanha" && (
        <>
          <path d="M14 74 L38 36 L54 58 L66 44 L86 74 Z" {...comum} />
          <path d="M30 56 L46 56" {...comum} strokeDasharray="3 5" />
        </>
      )}

      {slug === "rio" && (
        <>
          <path d="M16 40 C32 30, 44 50, 60 40 C72 33, 80 40, 86 38" {...comum} />
          <path d="M16 60 C32 50, 44 70, 60 60 C72 53, 80 60, 86 58" {...comum} />
        </>
      )}

      {slug === "espelho" && (
        <>
          <rect x="30" y="18" width="40" height="56" rx="20" {...comum} />
          <path d="M40 60 L58 32" {...comum} strokeDasharray="4 5" />
          <path d="M40 82 L60 82" {...comum} />
        </>
      )}

      {slug === "labirinto" && (
        <path
          d="M50 50 A6 6 0 0 1 56 56 A14 14 0 0 1 42 70 A22 22 0 0 1 20 48 A30 30 0 0 1 50 18 A38 38 0 0 1 88 56"
          {...comum}
        />
      )}

      {slug === "cavalo" && (
        <>
          <path d="M32 80 L36 54 C38 38, 52 26, 68 30 L78 24 L76 38 C72 46, 62 48, 58 58 L58 80" {...comum} />
          <circle cx="68" cy="36" r="1.6" fill="currentColor" stroke="none" />
        </>
      )}

      {slug === "dragao" && (
        <>
          <path d="M18 68 C32 40, 48 82, 62 54 C68 42, 78 44, 84 36" {...comum} />
          <path d="M34 52 L42 34 L50 52 M54 62 L64 44 L72 60" {...comum} />
        </>
      )}

      {slug === "bosque" && (
        <>
          <path d="M26 80 L26 62 M16 66 L26 48 L36 66 Z" {...comum} />
          <path d="M50 80 L50 56 M38 62 L50 38 L62 62 Z" {...comum} />
          <path d="M74 80 L74 62 M64 66 L74 48 L84 66 Z" {...comum} />
        </>
      )}

      {slug === "casaco" && (
        <>
          <path d="M36 20 L50 30 L64 20 L82 36 L72 82 L28 82 L18 36 Z" {...comum} />
          <path d="M50 30 L50 82" {...comum} strokeDasharray="3 5" />
        </>
      )}

      {slug === "sol" && (
        <>
          <circle cx="50" cy="50" r="14" {...comum} />
          <path d="M50 18 L50 28 M50 72 L50 82 M18 50 L28 50 M72 50 L82 50 M27 27 L34 34 M66 66 L73 73 M73 27 L66 34 M34 66 L27 73" {...comum} />
        </>
      )}

      {slug === "escaravelho" && (
        <>
          <ellipse cx="50" cy="56" rx="20" ry="24" {...comum} />
          <path d="M50 32 L50 80" {...comum} />
          <circle cx="50" cy="24" r="6" {...comum} />
          <path d="M30 48 L18 42 M30 60 L16 62 M32 72 L22 82 M70 48 L82 42 M70 60 L84 62 M68 72 L78 82" {...comum} />
        </>
      )}

      {/* Um símbolo sem glifo não pode deixar buraco na placa: o repertório
          cresce por conteúdo, e o desenho pode chegar depois. A marca neutra
          ocupa o mesmo espaço e não finge ser outra coisa. */}
      {!COM_GLIFO.has(slug) && (
        <>
          <circle cx="50" cy="50" r="30" {...comum} strokeDasharray="2 6" />
          <circle cx="50" cy="50" r="5" {...comum} />
        </>
      )}
    </svg>
  )
}

/** Quais estudos já têm desenho próprio. */
const COM_GLIFO = new Set([
  "circulo-mandala", "pedra", "casa", "caverna", "arvore", "serpente", "sombra", "heroi", "mae-grande", "animal",
  "animus", "anima", "trickster", "morte-renascimento", "iniciacao", "montanha", "rio", "espelho", "labirinto",
  "cavalo", "dragao", "bosque", "casaco", "sol", "escaravelho",
])

export default function ImagemDoInconsciente({ dia }: { dia: string }) {
  const { dict, locale } = useI18n()
  const t = dict.home as unknown as Record<string, string>
  const estudo: SimboloInconsciente = estudoDoDia(dia)
  const texto = estudo.texto[locale]

  return (
    <div>
      <p className="text-white/25 text-[12px] uppercase tracking-[0.22em] font-light">{t.symbolTitle}</p>
      <p className="text-white/40 text-[13px] font-light mt-1.5">{t.symbolStudy}</p>

      <div className="flex items-start gap-5 mt-5 sm:gap-6">
        <span className="shrink-0 text-white/55">
          <Glifo slug={estudo.slug} />
        </span>
        <div className="min-w-0">
          <h2 className="text-white instrument italic text-[25px] sm:text-[29px] leading-snug">{texto.nome}</h2>
          <p className="text-white/40 text-[14px] font-light mt-2">{texto.ancoras.join(" · ")}</p>
        </div>
      </div>

      <p className="text-white/75 text-[16px] leading-[1.75] font-light mt-5 max-w-xl">{texto.leitura}</p>
    </div>
  )
}
