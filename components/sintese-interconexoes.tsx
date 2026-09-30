"use client"

/**
 * A síntese pessoal do dia: o encontro entre o céu de agora e um mapa.
 *
 * ELA SÓ EXISTE SE ALGUÉM PEDIR. É a única coisa desta página que custa
 * dinheiro, e custa por pessoa e por dia: gerar na abertura seria pagar pela
 * leitura de quem passou pela página sem querer ler. O botão é a porta, e é a
 * pessoa que abre.
 *
 * SÃO CINCO ESTADOS, e nenhum deles é ambíguo. O defeito que este componente
 * existe para não repetir é o estado nulo fazendo papel de ausência: "não
 * pedi ainda", "estou escrevendo", "está escrita", "já estava escrita de
 * antes" e "não deu" são cinco coisas diferentes, e a tela diz qual é.
 *
 * `jaEraDeHoje` vem do cache do servidor. Dizer isso em voz baixa importa:
 * quem clica de novo no mesmo dia recebe o MESMO texto, e tem que ficar claro
 * que não houve nova escrita — a síntese do dia é uma só.
 *
 * A BARRA NÃO MENTE. Não há streaming aqui: entre o clique e a resposta não
 * existe sinal intermediário nenhum. Então a barra caminha sozinha em direção
 * a um teto e vai desacelerando, sem nunca chegar nele, e só fecha em 100%
 * quando o texto de verdade chegou. Ela informa que a coisa está viva, não
 * quanto falta — e é por isso que o rótulo ao lado diz o que está acontecendo.
 */
import { useState } from "react"
import Link from "next/link"
import ReadingProgress, { useReadingProgress } from "@/components/reading-progress"

type Estado =
  | { fase: "inicial" }
  | { fase: "gerando" }
  | { fase: "pronta"; texto: string; jaEraDeHoje: boolean }
  | { fase: "falha" }
  | { fase: "bloqueada" }

export default function SinteseInterconexoes({
  t,
  temPlano,
}: {
  t: Record<string, string>
  temPlano: boolean
}) {
  const [estado, setEstado] = useState<Estado>({ fase: temPlano ? "inicial" : "bloqueada" })
  const progresso = useReadingProgress()

  const pedir = async () => {
    setEstado({ fase: "gerando" })
    progresso.iniciar()
    // o pedido saiu: é o único evento real que existe antes da resposta
    progresso.marcar("conexao", "sorteio")
    try {
      const res = await fetch("/api/interconexoes/sintese", { method: "POST" })
      const corpo = await res.json().catch(() => null)

      // o paywall pode ter mudado desde que a página abriu
      if (res.status === 402) {
        progresso.cancelar()
        setEstado({ fase: "bloqueada" })
        return
      }
      if (!res.ok || !corpo?.sintese) {
        progresso.cancelar()
        setEstado({ fase: "falha" })
        return
      }
      progresso.concluir()
      setEstado({ fase: "pronta", texto: String(corpo.sintese), jaEraDeHoje: corpo.cache === true })
    } catch {
      progresso.cancelar()
      setEstado({ fase: "falha" })
    }
  }

  return (
    <>
      <p className="text-white/25 text-[9px] uppercase tracking-[0.22em] font-light">{t.sinteseTitle}</p>

      {/* o corpo ocupa o vão que sobra e fica centrado nele: a placa estica até
          a altura da roda ao lado, e conteúdo encostado no topo de uma placa
          alta parece placa vazia */}
      <div className="flex-1 flex flex-col justify-center">
      {estado.fase === "pronta" ? (
        <>
          <p className="text-white/85 text-[15px] sm:text-[15.5px] leading-[1.8] font-light mt-4 max-w-xl">
            {estado.texto}
          </p>
          {estado.jaEraDeHoje && (
            <p className="text-white/25 text-[11px] font-light mt-4">{t.sinteseAlready}</p>
          )}
        </>
      ) : (
        <>
          <h3 className="text-white/95 instrument italic text-[21px] sm:text-[23px] leading-snug mt-3">
            {t.sinteseLead}
          </h3>

          {estado.fase === "inicial" && (
            <button
              onClick={pedir}
              className="group flex items-center gap-2 mt-5 py-3 cursor-pointer"
            >
              <span className="text-white/85 group-hover:text-white text-[14.5px] font-light transition-colors">
                {t.sinteseCta}
              </span>
              <span className="text-white/45 group-hover:text-white/85 text-[13px] transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </button>
          )}

          {estado.fase === "gerando" && (
            <div className="mt-6 max-w-xl">
              <ReadingProgress progresso={progresso} />
              <p className="text-white/45 text-[12.5px] font-light mt-3">{t.sinteseWriting}</p>
              <div className="space-y-2.5 mt-5" aria-hidden="true">
                {["100%", "94%", "76%"].map((largura) => (
                  <div
                    key={largura}
                    className="h-[0.85em] rounded-[3px] bg-white/[0.055] animate-pulse motion-reduce:animate-none"
                    style={{ width: largura }}
                  />
                ))}
              </div>
            </div>
          )}

          {estado.fase === "falha" && (
            <div className="mt-5">
              <p className="text-white/55 text-[13px] leading-relaxed font-light">{t.sinteseFailed}</p>
              <button
                onClick={pedir}
                className="text-white/80 hover:text-white text-[13.5px] font-light mt-3 py-2 cursor-pointer transition-colors"
              >
                {t.sinteseRetry}
              </button>
            </div>
          )}

          {estado.fase === "bloqueada" && (
            <div className="mt-5">
              <p className="text-white/50 text-[13px] leading-relaxed font-light max-w-lg">{t.readingPaid}</p>
              <p className="text-white/30 text-[12.5px] leading-relaxed font-light mt-1.5 max-w-lg">{t.factsYours}</p>
              <Link
                href="/assinatura"
                className="group inline-flex items-center gap-2 mt-4 py-2 text-white/80 hover:text-white text-[13.5px] font-light transition-colors"
              >
                {t.sinteseLocked}
                <span className="text-[12px] text-white/45 group-hover:text-white/80 transition-transform duration-200 group-hover:translate-x-0.5">
                  ↗
                </span>
              </Link>
            </div>
          )}
        </>
      )}
      </div>
    </>
  )
}
