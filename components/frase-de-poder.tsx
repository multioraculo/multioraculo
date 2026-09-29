"use client"

import { useEffect, useRef, useState } from "react"
import { useI18n } from "@/components/i18n-provider"

/**
 * A frase que a pessoa escolhe repetir todos os dias.
 *
 * É o único lugar da Home em que o texto não vem de cálculo nem de modelo: vem
 * de quem está lendo. Tudo o mais na página informa; esta placa existe para
 * devolver à pessoa uma coisa que ela mesma escreveu, e é por isso que ela é
 * escrita em serifada grande, no corpo de uma citação, e não em campo de
 * formulário.
 *
 * MORA NO NAVEGADOR, e essa é uma limitação consciente. Guardar na conta
 * exigiria tabela, rota e RLS, que é mexer em back-end no meio de uma tarefa
 * de composição. Em localStorage ela funciona para quem tem conta e para quem
 * não tem, aparece na hora, e não depende de nada estar no ar. O custo é real:
 * a frase é daquele aparelho, e trocar de telefone a perde. A migração para a
 * conta está proposta e não foi escrita.
 *
 * Em navegação privada `localStorage` lança, então toda leitura e toda escrita
 * estão em try/catch: sem isso a placa quebraria a Home inteira num modo que
 * ninguém testa.
 */
const CHAVE = "multioraculo:frase-de-poder"
const LIMITE = 160

export default function FraseDePoder() {
  const { dict } = useI18n()
  const t = dict.home as unknown as Record<string, string>
  const c = dict.common as unknown as Record<string, string>

  // `undefined` = ainda não lemos o navegador. Sem essa diferença a placa
  // piscaria o convite de escrever para quem já tem frase guardada
  const [frase, setFrase] = useState<string | undefined>(undefined)
  const [editando, setEditando] = useState(false)
  const [rascunho, setRascunho] = useState("")
  const campo = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try {
      setFrase(localStorage.getItem(CHAVE) ?? "")
    } catch {
      setFrase("")
    }
  }, [])

  useEffect(() => {
    if (editando) campo.current?.focus()
  }, [editando])

  const abrir = () => {
    setRascunho(frase ?? "")
    setEditando(true)
  }

  const guardar = () => {
    const limpa = rascunho.trim().slice(0, LIMITE)
    setFrase(limpa)
    setEditando(false)
    try {
      if (limpa) localStorage.setItem(CHAVE, limpa)
      else localStorage.removeItem(CHAVE)
    } catch {
      // navegação privada: vale para esta visita
    }
  }

  const rotulo = <p className="text-white/25 text-[9px] uppercase tracking-[0.22em] font-light">{t.powerTitle}</p>

  // Sugestões são PONTO DE PARTIDA, não catálogo: a frase é para ser dela, e
  // encarar uma caixa vazia trava. Clicar numa sugestão abre o editor com o
  // texto dentro, editável, em vez de salvar direto: quase ninguém quer a
  // frase exatamente como veio.
  const sugestoes = ((dict.home as unknown as { powerSuggestions?: string[] }).powerSuggestions ?? []).slice(0, 3)
  const comecarCom = (frase: string) => {
    setRascunho(frase)
    setEditando(true)
  }

  // enquanto não se sabe, não se afirma nada
  if (frase === undefined) {
    return (
      <div>
        {rotulo}
        <div
          className="h-[1.6em] w-3/4 rounded-[3px] bg-white/[0.055] animate-pulse motion-reduce:animate-none mt-4"
          aria-hidden="true"
        />
      </div>
    )
  }

  if (editando) {
    return (
      <div>
        {rotulo}
        <textarea
          ref={campo}
          value={rascunho}
          maxLength={LIMITE}
          rows={3}
          onChange={(e) => setRascunho(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              guardar()
            }
            if (e.key === "Escape") setEditando(false)
          }}
          placeholder={t.powerPlaceholder}
          className="w-full mt-4 bg-white/[0.06] border border-white/15 focus:border-white/35 rounded-xl px-4 py-3 text-white/90 instrument italic text-[19px] leading-snug placeholder:not-italic placeholder:text-white/25 placeholder:text-[14px] focus:outline-none transition-colors resize-none"
        />
        <div className="flex items-center gap-5 mt-3">
          <button onClick={guardar} className="text-white/85 hover:text-white text-[13.5px] font-light transition-colors cursor-pointer">
            {c.save}
          </button>
          <button
            onClick={() => setEditando(false)}
            className="text-white/35 hover:text-white/60 text-[12.5px] font-light transition-colors cursor-pointer"
          >
            {c.cancel}
          </button>
          <span className="ml-auto text-white/25 text-[11px] tabular-nums">
            {rascunho.length}/{LIMITE}
          </span>
        </div>
      </div>
    )
  }

  // sem frase ainda: convite mais sugestões, e cada uma abre o editor já com o
  // texto. Não pode ser um <button> dentro de outro, então o vazio tem forma
  // própria em vez de reaproveitar a placa clicável
  if (!frase) {
    return (
      <div>
        {rotulo}
        <p className="text-white/55 text-[14px] leading-relaxed font-light mt-4">{t.powerEmpty}</p>
        <button
          onClick={abrir}
          className="block text-white/85 hover:text-white text-[14px] font-light mt-4 transition-colors cursor-pointer"
        >
          {t.powerPlaceholder} +
        </button>

        {sugestoes.length > 0 && (
          <>
            <p className="text-white/25 text-[10.5px] font-light mt-5">{t.powerSuggest}</p>
            <div className="mt-2.5 space-y-2">
              {sugestoes.map((f) => (
                <button
                  key={f}
                  onClick={() => comecarCom(f)}
                  className="block w-full text-left text-white/55 hover:text-white/85 instrument italic text-[14.5px] leading-snug transition-colors cursor-pointer"
                >
                  {f}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <button onClick={abrir} className="group block w-full text-left cursor-pointer">
      {rotulo}
      {frase ? (
        <>
          <p className="text-white/90 group-hover:text-white instrument italic text-[20px] sm:text-[22px] leading-snug mt-4 transition-colors">
            {frase}
          </p>
          <span className="block text-white/25 group-hover:text-white/50 text-[11px] font-light mt-4 transition-colors">
            {c.edit}
          </span>
        </>
      ) : (
        <>
          <p className="text-white/55 text-[14px] leading-relaxed font-light mt-4">{t.powerEmpty}</p>
          <span className="block text-white/85 group-hover:text-white text-[14px] font-light mt-4 transition-colors">
            {t.powerPlaceholder} +
          </span>
        </>
      )}
    </button>
  )
}
