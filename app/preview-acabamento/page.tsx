import ShaderBackground from "@/components/shader-background"

// TEMPORÁRIO: compara o acabamento do Tarô com o do Lenormand, com o CSS real das lâminas. Não commitar.
export const dynamic = "force-dynamic"

const TAROT = [
  { id: "major-01", num: "I", nome: "O Mago" },
  { id: "wands-08", num: "VIII", nome: "Oito de Paus" },
  { id: "coins-07", num: "VII", nome: "Sete de Ouros" },
]
const LEN = [
  { id: "child", num: 13, nome: "Criança" },
  { id: "bouquet", num: 9, nome: "Buquê" },
  { id: "book", num: 26, nome: "Livro" },
]

function Tarot({ src, num, nome, w }: { src: string; num: string; nome: string; w: number }) {
  return (
    <div className="tk-card" style={{ width: w, ["--tk-cw" as string]: `${w}px` }}>
      {num ? <span className="tk-num">{num}</span> : null}
      <span className="tk-rule tk-rule-top" />
      <div className="tk-art">
        <img src={src} alt="" width={600} height={992} draggable={false} />
      </div>
      <span className="tk-rule tk-rule-bot" />
      <span className="tk-nome">{nome}</span>
    </div>
  )
}

function Len({ id, num, nome, w }: { id: string; num: number; nome: string; w: number }) {
  return (
    <div className="ln-card" style={{ ["--ln-cw" as string]: `${w}px` }}>
      <span className="ln-num">{num}</span>
      <div className="ln-art">
        <img src={`/lenormand/${id}.png`} alt="" draggable={false} />
      </div>
      <span className="ln-name">{nome}</span>
    </div>
  )
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-center text-[11px] uppercase tracking-[0.14em] text-white/60">{children}</p>
}

const ROTULOS: Record<string, string> = {
  atual: "Tarô original",
  v2: "Tarô ajustado atual",
  v3: "Tarô · 2ª correção",
  v4: "Refinamento (preto travado)",
  v5a: "Pretos +3,5",
  v5b: "Pretos +6,5",
  v6a: "Azuis viram fundo",
  v6b: "Azuis com 28% de tinta",
}
const srcDe = (pasta: string, id: string, r: number) =>
  pasta === "atual" ? `/tarot/art/${id}.png?r=${r}` : `/tarot-acab-preview/${pasta}/${id}.png?r=${r}`

export default async function PreviewAcabamento({ searchParams }: { searchParams: Promise<{ a?: string; b?: string; c?: string; w?: string }> }) {
  const { a = "v4", b = "v5a", c = "v5b", w } = await searchParams
  const versoes = [a, b, c].filter((v) => v && v !== "-")
  const tw = Number(w ?? 150), lw = Math.round((tw * 178) / 92 * 0.62)
  const r = Date.now()
  return (
    <ShaderBackground>
      <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16 pt-10">
        {TAROT.map((t, i) => (
          <div key={t.id} className="flex flex-wrap items-end justify-center gap-6">
            <div>
              <Rotulo>Lenormand</Rotulo>
              <Len {...LEN[i]} w={lw} />
            </div>
            {versoes.map((pasta) => (
              <div key={pasta}>
                <Rotulo>{ROTULOS[pasta] ?? pasta}</Rotulo>
                <Tarot src={srcDe(pasta, t.id, r)} num={t.num} nome={t.nome} w={tw} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </ShaderBackground>
  )
}
