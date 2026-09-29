"use client"

import { useEffect, useState } from "react"
import { TarotCapsule } from "@/components/tarot-spread"
import { LenormandCard } from "@/components/lenormand-table"
import { RuneObject } from "@/components/runes-spread"
import { BuzioOpen, BuzioClosed } from "@/components/buzios-board"
import { useI18n } from "@/components/i18n-provider"

/**
 * Uma amostra do que uma consulta mostra: um pouco de cada oráculo, girando.
 *
 * NÃO É UMA TIRAGEM, e a diferença importa. Não há sorteio, semente, pergunta
 * nem leitura: são as peças dos cinco oráculos passando em rotação, como um
 * baralho sendo embaralhado antes de alguém cortar. Por isso nada aqui tem
 * nome, número, posição nem significado — mostrar "Seis de Espadas" ao lado da
 * chamada faria parecer resultado, e resultado só existe depois da pergunta.
 *
 * As peças são as MESMAS da consulta, pelos mesmos componentes: a lâmina do
 * tarô, a carta do lenormand, a runa gravada, o búzio e as linhas do hexagrama.
 * Nenhum desenho novo foi feito para isto.
 *
 * O giro é lento e a opacidade baixa de propósito: é pano de fundo da chamada,
 * não o assunto dela. Com `prefers-reduced-motion` ele para e fica na primeira
 * composição, que continua ilustrando a mesma coisa.
 */

/** Índices do baralho, só para a ilustração variar. Não há sorteio aqui. */
const TAROT = [
  { id: "major-01", arcana: "major", number: 1, reversed: false },
  { id: "major-07", arcana: "major", number: 7, reversed: false },
  { id: "major-17", arcana: "major", number: 17, reversed: false },
] as const

const LENORMAND = [
  { i: 1, n: "Trevo" },
  { i: 17, n: "Cegonha" },
  { i: 25, n: "Anel" },
]

const RUNAS = [
  { name: "Fehu", glyph: "ᚠ" },
  { name: "Uruz", glyph: "ᚢ" },
  { name: "Thurisaz", glyph: "ᚦ" },
]

/** Seis linhas: a forma de um hexagrama, desenhada aqui porque o componente do I Ching pede uma leitura inteira. */
function Hexagrama({ padrao }: { padrao: number[] }) {
  return (
    <div className="flex flex-col-reverse gap-[5px] w-[42px]" aria-hidden="true">
      {padrao.map((yang, i) =>
        yang ? (
          <div key={i} className="h-[4px] w-full rounded-[1px] bg-current" />
        ) : (
          <div key={i} className="flex gap-[6px]">
            <div className="h-[4px] flex-1 rounded-[1px] bg-current" />
            <div className="h-[4px] flex-1 rounded-[1px] bg-current" />
          </div>
        ),
      )}
    </div>
  )
}

const HEXAGRAMAS = [
  [1, 1, 1, 0, 0, 0],
  [0, 1, 0, 1, 0, 1],
  [1, 0, 0, 1, 1, 0],
]

const CICLO_MS = 3200

export default function AmostraOraculos({ className = "" }: { className?: string }) {
  const { dict } = useI18n()
  const o = dict.oracles as unknown as Record<string, string>
  const [passo, setPasso] = useState(0)

  useEffect(() => {
    const parado = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (parado) return
    const id = setInterval(() => setPasso((p) => (p + 1) % 3), CICLO_MS)
    return () => clearInterval(id)
  }, [])

  const tarot = TAROT[passo]
  const len = LENORMAND[passo]
  const runa = RUNAS[passo]
  const hex = HEXAGRAMAS[passo]
  const abertos = [2, 4, 3][passo]

  const peca = "transition-opacity duration-700 motion-reduce:transition-none"

  return (
    <div
      className={`flex items-center justify-center gap-3 sm:gap-4 ${className}`}
      role="img"
      aria-label={`${o.tarot} · ${o.iching} · ${o.runas} · ${o.buzios} · ${o.lenormand}`}
    >
      <div className={`${peca} opacity-70`} key={`t${passo}`}>
        <TarotCapsule card={tarot} name="" label="" width={44} />
      </div>

      <div className={`${peca} text-white/55`} key={`h${passo}`}>
        <Hexagrama padrao={hex} />
      </div>

      <div className={`${peca} opacity-65 text-white/80`} key={`r${passo}`}>
        <RuneObject name={runa.name} glyph={runa.glyph} reversed={false} index={passo} width={34} height={44} />
      </div>

      <div className={`${peca} flex gap-1 text-white/70`} key={`b${passo}`} aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (i < abertos ? <BuzioOpen key={i} size={15} /> : <BuzioClosed key={i} size={15} />))}
      </div>

      <div className={`${peca} opacity-70`} key={`l${passo}`}>
        <LenormandCard index={len.i} name={len.n} style={{ ["--ln-cw" as string]: "44px" }} />
      </div>
    </div>
  )
}
