"use client"

/**
 * Imagem do inconsciente: uma página de atlas simbólico, por dia.
 *
 * NÃO É LEITURA DE NINGUÉM, e a tela diz isso em voz alta. O símbolo é o mesmo
 * para todo mundo naquele dia, escolhido pela data, e serve para ser explorado.
 * Apresentá-lo como "o seu arquétipo de hoje" seria inventar uma leitura
 * pessoal a partir de um calendário.
 *
 * O RIGOR É O ASSUNTO, não o enfeite. O arquétipo não é a imagem: uma serpente
 * ou uma casa podem carregar conteúdo arquetípico e nenhuma delas equivale a um
 * arquétipo fixo. Por isso todo texto fala em "pode evocar", e por isso a fonte
 * aparece com o AUTOR DO CAPÍTULO, não com o nome do volume: "O Homem e seus
 * Símbolos" tem cinco autores, e atribuir a Jung o que von Franz escreveu seria
 * exatamente o erro que esta peça existe para não cometer.
 *
 * Os glifos são geométricos de propósito. Desenho figurativo pequeno vira
 * borrão e puxa a peça para ilustração de banco de imagens; a forma reduzida
 * fica na mesma família das runas e dos búzios, é nítida em qualquer tamanho e
 * não pesa um byte de rede.
 */
import Link from "next/link"
import { useI18n } from "@/components/i18n-provider"
import { simboloDoDia, type SimboloInconsciente } from "@/lib/oracles/simbolos-inconsciente"

/** Traço fino, sem preenchimento, herdando a cor de quem o contém. */
function Glifo({ id, tamanho = 72 }: { id: string; tamanho?: number }) {
  const comum = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      {id === "circulo" && <circle cx="50" cy="50" r="34" {...comum} />}

      {id === "pedra" && <path d="M26 62 L34 34 L62 26 L78 46 L70 72 L40 76 Z" {...comum} />}

      {id === "casa" && (
        <>
          <path d="M22 50 L50 26 L78 50" {...comum} />
          <path d="M31 47 L31 76 L69 76 L69 47" {...comum} />
          <path d="M44 76 L44 58 L56 58 L56 76" {...comum} />
        </>
      )}

      {id === "caverna" && (
        <>
          <path d="M18 78 L18 52 A32 32 0 0 1 82 52 L82 78" {...comum} />
          <path d="M38 78 L38 62 A12 12 0 0 1 62 62 L62 78" {...comum} />
        </>
      )}

      {id === "arvore" && (
        <>
          <path d="M50 80 L50 30" {...comum} />
          <path d="M50 46 L32 32 M50 46 L68 32 M50 60 L36 50 M50 60 L64 50" {...comum} />
          <path d="M40 84 L60 84" {...comum} />
        </>
      )}

      {id === "serpente" && (
        <>
          <path d="M24 72 C24 56, 44 58, 44 44 C44 30, 64 30, 68 40 C72 50, 60 56, 54 50" {...comum} />
          <circle cx="70" cy="43" r="1.6" fill="currentColor" stroke="none" />
        </>
      )}

      {id === "sombra" && (
        <>
          <circle cx="42" cy="46" r="22" {...comum} />
          <circle cx="60" cy="58" r="22" {...comum} strokeDasharray="3 5" />
        </>
      )}

      {id === "heroi" && (
        <>
          <path d="M18 78 L46 26 L62 54 L82 40" {...comum} />
          <circle cx="46" cy="26" r="4" {...comum} />
        </>
      )}

      {id === "mae-grande" && (
        <>
          <path d="M26 38 C26 74, 74 74, 74 38" {...comum} />
          <path d="M20 34 L80 34" {...comum} />
          <circle cx="50" cy="52" r="8" {...comum} />
        </>
      )}

      {id === "animal" && (
        <>
          <path d="M28 54 C28 42, 48 38, 62 42 L74 38 L70 50" {...comum} />
          <path d="M28 54 L28 72 M44 58 L44 72 M58 58 L58 72 M70 52 L72 70" {...comum} />
          <circle cx="70" cy="44" r="1.6" fill="currentColor" stroke="none" />
        </>
      )}

      {id === "animus" && (
        <>
          <path d="M50 78 L50 34" {...comum} />
          <path d="M34 48 L50 32 L66 48" {...comum} />
          <path d="M34 78 L66 78" {...comum} strokeDasharray="4 5" />
        </>
      )}

      {id === "trickster" && (
        <>
          <circle cx="50" cy="50" r="30" {...comum} strokeDasharray="5 6" />
          <path d="M28 58 L44 42 L52 58 L72 38" {...comum} />
        </>
      )}

      {id === "morte" && (
        <>
          <path d="M50 20 A30 30 0 0 1 50 80" {...comum} />
          <path d="M50 20 A30 30 0 0 0 50 80" {...comum} strokeDasharray="4 6" />
          <path d="M38 50 L62 50" {...comum} />
        </>
      )}

      {id === "montanha" && (
        <>
          <path d="M14 74 L38 36 L54 58 L66 44 L86 74 Z" {...comum} />
          <path d="M30 56 L46 56" {...comum} strokeDasharray="3 5" />
        </>
      )}

      {id === "mandala" && (
        <>
          <circle cx="50" cy="50" r="32" {...comum} />
          <path d="M50 22 L78 50 L50 78 L22 50 Z" {...comum} />
          <circle cx="50" cy="50" r="7" {...comum} />
        </>
      )}

      {id === "rio" && (
        <>
          <path d="M16 40 C32 30, 44 50, 60 40 C72 33, 80 40, 86 38" {...comum} />
          <path d="M16 60 C32 50, 44 70, 60 60 C72 53, 80 60, 86 58" {...comum} />
        </>
      )}

      {id === "espelho" && (
        <>
          <rect x="30" y="18" width="40" height="56" rx="20" {...comum} />
          <path d="M40 60 L58 32" {...comum} strokeDasharray="4 5" />
          <path d="M40 82 L60 82" {...comum} />
        </>
      )}

      {id === "porta" && (
        <>
          <path d="M30 80 L30 28 L70 20 L70 80" {...comum} />
          <path d="M24 80 L76 80" {...comum} />
          <circle cx="62" cy="52" r="2.4" fill="currentColor" stroke="none" />
        </>
      )}

      {id === "chave" && (
        <>
          <circle cx="34" cy="38" r="13" {...comum} />
          <path d="M43 47 L72 76" {...comum} />
          <path d="M60 64 L68 56 M68 72 L76 64" {...comum} />
        </>
      )}

      {id === "ponte" && (
        <>
          <path d="M14 56 C30 32, 70 32, 86 56" {...comum} />
          <path d="M14 56 L86 56" {...comum} />
          <path d="M30 56 L30 80 M70 56 L70 80" {...comum} />
        </>
      )}

      {id === "escada" && (
        <>
          <path d="M34 82 L42 20 M62 82 L70 20" {...comum} />
          <path d="M37 64 L67 64 M40 48 L70 48 M43 32 L73 32" {...comum} />
        </>
      )}

      {id === "labirinto" && (
        <path
          d="M50 50 A6 6 0 0 1 56 56 A14 14 0 0 1 42 70 A22 22 0 0 1 20 48 A30 30 0 0 1 50 18 A38 38 0 0 1 88 56"
          {...comum}
        />
      )}

      {id === "jardim" && (
        <>
          <rect x="18" y="38" width="64" height="44" rx="4" {...comum} />
          <path d="M34 82 L34 58 M34 66 L26 58 M34 66 L42 58" {...comum} />
          <path d="M50 82 L50 52 M50 62 L42 54 M50 62 L58 54" {...comum} />
          <path d="M66 82 L66 60 M66 68 L58 60 M66 68 L74 60" {...comum} />
        </>
      )}

      {id === "mascara" && (
        <>
          <path d="M28 26 L72 26 C72 60, 62 82, 50 82 C38 82, 28 60, 28 26 Z" {...comum} />
          <path d="M36 44 C40 40, 46 40, 48 44 M52 44 C54 40, 60 40, 64 44" {...comum} />
          <path d="M44 64 L56 64" {...comum} strokeDasharray="3 4" />
        </>
      )}

      {id === "lobo" && (
        <>
          <path d="M26 36 L34 18 L44 30 M74 36 L66 18 L56 30" {...comum} />
          <path d="M26 36 C26 62, 38 80, 50 80 C62 80, 74 62, 74 36" {...comum} />
          <circle cx="40" cy="48" r="2" fill="currentColor" stroke="none" />
          <circle cx="60" cy="48" r="2" fill="currentColor" stroke="none" />
          <path d="M46 64 L50 68 L54 64" {...comum} />
        </>
      )}

      {/* Um símbolo sem glifo não pode deixar buraco na placa: o repertório
          cresce por conteúdo, e o desenho pode chegar depois. A marca neutra
          ocupa o mesmo espaço e não finge ser outra coisa. */}
      {!COM_GLIFO.has(id) && (
        <>
          <circle cx="50" cy="50" r="30" {...comum} strokeDasharray="2 6" />
          <circle cx="50" cy="50" r="5" {...comum} />
        </>
      )}
    </svg>
  )
}

/** Quais símbolos já têm desenho próprio. */
const COM_GLIFO = new Set([
  "circulo", "pedra", "casa", "caverna", "arvore", "serpente", "sombra", "heroi", "mae-grande", "animal",
  "animus", "trickster", "morte", "montanha", "mandala", "rio", "espelho", "porta", "chave", "ponte",
  "escada", "labirinto", "jardim", "mascara", "lobo",
])

export default function ImagemDoInconsciente({ dia }: { dia: string }) {
  const { dict, locale } = useI18n()
  const t = dict.home as unknown as Record<string, string>
  const simbolo: SimboloInconsciente = simboloDoDia(dia)
  const texto = simbolo.texto[locale]

  return (
    <div>
      <p className="text-white/25 text-[12px] uppercase tracking-[0.22em] font-light">{t.symbolTitle}</p>

      <div className="flex items-start gap-5 mt-4 sm:gap-6">
        <span className="shrink-0 text-white/55">
          <Glifo id={simbolo.id} />
        </span>
        <div className="min-w-0">
          <h2 className="text-white instrument italic text-[25px] sm:text-[29px] leading-snug">{texto.nome}</h2>
          <p className="text-white/40 text-[14px] font-light mt-2">{texto.ancoras.join(" · ")}</p>
        </div>
      </div>

      <p className="text-white/75 text-[16px] leading-[1.75] font-light mt-5 max-w-xl">{texto.leitura}</p>

      {/* A citação só existe no idioma da edição que temos. Traduzi-la aqui
          seria pôr na boca de alguém uma frase que aquela pessoa não escreveu
          naquele idioma, e a fonte deixaria de ser fonte. */}
      {simbolo.fonte && locale === "pt" && (
        <figure className="mt-5 max-w-xl">
          <blockquote className="text-white/60 instrument italic text-[15px] leading-relaxed border-l border-white/15 pl-4">
            {simbolo.fonte.trecho}
          </blockquote>
          <figcaption className="text-white/30 text-[13px] font-light mt-2.5 pl-4">
            {simbolo.fonte.autor} · {simbolo.fonte.obra} · p. {simbolo.fonte.pagina}
          </figcaption>
        </figure>
      )}

      {simbolo.fonte && locale !== "pt" && (
        <p className="text-white/30 text-[13px] font-light mt-4">
          {simbolo.fonte.autor} · {simbolo.fonte.obra} · p. {simbolo.fonte.pagina}
        </p>
      )}

      {!simbolo.fonte && <p className="text-white/30 text-[13px] font-light mt-4">{t.symbolEditorial}</p>}

      <div className="h-px bg-white/[0.06] my-6" />

      <p className="text-white/55 text-[15px] leading-relaxed font-light">{t.symbolAsk}</p>

      {/* o símbolo viaja como CONTEXTO de navegação, e não como parte do relato:
          quem decide o que sonhou é quem sonhou */}
      <Link href={`/sonhos?imagem=${simbolo.id}`} className="group block mt-3 py-3">
        <span className="flex items-center gap-2">
          <span className="text-white/85 group-hover:text-white text-[16px] font-light transition-colors">
            {t.symbolCta}
          </span>
          <span className="text-white/45 group-hover:text-white/85 text-[15px] transition-transform duration-200 group-hover:translate-x-0.5">
            ↗
          </span>
        </span>
      </Link>

      <p className="text-white/25 text-[13px] leading-relaxed font-light mt-3">{t.symbolNote}</p>
    </div>
  )
}
