import { createClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"

export default async function AssinaturaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 pt-24 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="max-w-lg mb-12">
            <h1 className="text-5xl md:text-6xl md:leading-16 tracking-tight font-light text-white mb-4">
              <span className="font-medium italic instrument">Multioráculo</span> assine
              <br />
              <span className="font-light tracking-tight text-white">clareza, não ruído.</span>
            </h1>

            <p className="text-xs font-light text-white/70 leading-relaxed">
              Cinco vozes, uma visão. A cada pergunta, o Multioráculo traduz a sincronicidade em síntese unificada
              (Tarô, I Ching, Runas, Búzios e Lenormand) sem generalidades.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Essencial Plan */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
              <div className="mb-6">
                <h2 className="text-xl font-light text-white mb-2">Essencial</h2>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-light text-white">R$ 9,99</span>
                  <span className="text-white/60">/mês</span>
                </div>
                <p className="text-white/80 font-medium mb-4">Cadência e foco.</p>
                <p className="text-white/70 text-sm">
                  Duas tiragens por semana (8 por mês), para manter o rumo sem ansiedade.
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-white/80 text-sm">
                  <span className="text-green-400 mt-1">✓</span>
                  Leitura simultânea dos 5 oráculos + resumo unificado
                </li>
                <li className="flex items-start gap-3 text-white/80 text-sm">
                  <span className="text-green-400 mt-1">✓</span>
                  Oráculos em abas para checagem profunda
                </li>
                <li className="flex items-start gap-3 text-white/80 text-sm">
                  <span className="text-green-400 mt-1">✓</span>
                  Salvar e revisitar leituras (carimbo de momento)
                </li>
                <li className="flex items-start gap-3 text-white/80 text-sm">
                  <span className="text-green-400 mt-1">✓</span>
                  Sinais verificáveis no cotidiano
                </li>
              </ul>

              <div className="mb-6">
                <p className="text-white/60 text-xs mb-2">Para quem:</p>
                <p className="text-white/80 text-sm">prefere uma pergunta boa por vez, semana após semana.</p>
              </div>

              <button className="w-full py-3 px-6 backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-full font-medium text-sm hover:bg-white/15 hover:scale-105 transition-all duration-200">
                Começar com Essencial
              </button>
            </div>

            {/* Ilimitado Plan */}
            <div className="backdrop-blur-md bg-white/15 border border-white/30 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="backdrop-blur-md bg-gradient-to-r from-purple-400/80 to-pink-400/80 border border-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                  Mais Popular
                </span>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-light text-white mb-2">Ilimitado</h2>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-light text-white">R$ 13,99</span>
                  <span className="text-white/60">/mês</span>
                </div>
                <p className="text-white/80 font-medium mb-4">Decisão em ritmo vivo.</p>
                <p className="text-white/70 text-sm">
                  Tiragens ilimitadas (uso pessoal) para transformar símbolo em gesto, todos os dias.
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-white/80 text-sm">
                  <span className="text-green-400 mt-1">✓</span>
                  Tudo do Essencial
                </li>
                <li className="flex items-start gap-3 text-white/80 text-sm">
                  <span className="text-green-400 mt-1">✓</span>
                  Histórico completo e favoritos
                </li>
                <li className="flex items-start gap-3 text-white/80 text-sm">
                  <span className="text-green-400 mt-1">✓</span>
                  Lembretes para os sinais práticos
                </li>
                <li className="flex items-start gap-3 text-white/80 text-sm">
                  <span className="text-green-400 mt-1">✓</span>
                  Suporte prioritário
                </li>
              </ul>

              <div className="mb-6">
                <p className="text-white/60 text-xs mb-2">Para quem:</p>
                <p className="text-white/80 text-sm">cria, lidera ou ajusta rota com frequência e quer fricção zero.</p>
              </div>

              <button className="w-full py-3 px-6 backdrop-blur-md bg-white/15 border border-white/30 text-white rounded-full font-medium text-sm hover:bg-white/20 hover:scale-105 transition-all duration-200">
                Assinar Ilimitado
              </button>
            </div>
          </div>

          {/* Terms */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 mb-16">
            <h3 className="text-white font-medium mb-4">Observações</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>
                • Conta como 1 tiragem quando você faz uma pergunta nova e recebe a leitura completa; reabrir a mesma
                leitura não consome.
              </li>
              <li>• Cancelamento a qualquer momento; cobrança mensal recorrente (BRL).</li>
              <li>• "Ilimitado" sujeito a uso pessoal razoável (não permite automação/massa)</li>
            </ul>
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}
