import { createClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"

export default async function OraculosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-light text-white mb-3">O que é um oráculo</h2>
              <p className="text-white/80 leading-relaxed text-sm">
                Um oráculo é, em essência, uma tecnologia de percepção. Não é apenas superstição ou acaso, é um
                mecanismo construído por gerações para transformar padrões invisíveis em símbolos visíveis.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-light text-white mb-3">Como funciona tecnicamente</h2>
              <div className="space-y-3 text-white/80 text-sm">
                <div>
                  <h3 className="font-medium text-white mb-1 text-sm">1. Sistema fechado de símbolos</h3>
                  <p>
                    Cada oráculo tem um conjunto limitado e bem definido de signos (hexagramas, cartas, runas, conchas).
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1 text-sm">2. Aleatoriedade ritualizada</h3>
                  <p>
                    O sorteio ou lançamento cria a ponte. Ele desarma a mente racional e permite que o inconsciente e o
                    campo de sincronicidade entrem.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1 text-sm">3. Repertório interpretativo</h3>
                  <p>
                    Cada símbolo foi cultivado em uma tradição. Ele carrega camadas de sentido acumuladas ao longo de
                    séculos.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1 text-sm">4. Sincronicidade</h3>
                  <p>
                    A correspondência entre sua pergunta e o resultado não é causal, é simbólica. É como se o universo
                    mostrasse um espelho específico naquele instante.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-light text-white mb-3">Como perguntar</h2>
              <div className="space-y-3 text-white/80 text-sm">
                <p>
                  A clareza da resposta depende da clareza da pergunta. Mais do que palavras certas, importa a postura
                  interior. Perguntas feitas com abertura e atenção tendem a trazer respostas mais nítidas.
                </p>
                <div className="space-y-1">
                  <p>
                    <strong className="text-white">Pergunte por direção:</strong> "Para onde mover energia agora?"
                  </p>
                  <p>
                    <strong className="text-white">Pergunte por gesto:</strong> "Qual ação transforma este ciclo?"
                  </p>
                  <p>
                    <strong className="text-white">Pergunte por compreensão:</strong> "O que ainda não estou vendo?"
                  </p>
                </div>
                <p>
                  Evite perguntas fechadas do tipo "sim ou não". Prefira enunciados que revelam o movimento do momento.
                  O oráculo não entrega uma ordem, mas um espelho. Ele aponta para onde olhar e com que espírito agir.
                </p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-light text-white mb-3">O que o oráculo entrega</h2>
              <p className="text-white/80 leading-relaxed text-sm">
                O oráculo não prediz o futuro como uma máquina. Ele mostra a qualidade do momento. Quais forças estão
                atuando. Quais riscos e possibilidades já estão em movimento. Assim como uma bússola não te empurra, mas
                mostra o norte, o oráculo não decide, mas revela direção.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-light text-white mb-4">As cinco tradições do Multioráculo</h2>
              <p className="text-white/80 leading-relaxed text-sm mb-6">
                Para traduzir sua pergunta com precisão, reunimos um conjunto essencial de tradições: cinco linguagens
                simbólicas que compõem a leitura simultânea do Multioráculo. Cada uma ilumina um plano do momento;
                juntas, oferecem uma visão coerente e acionável.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Tarô</h3>
                  <p className="text-white/80 leading-relaxed text-sm">
                    Linguagem de 78 imagens que espelham a jornada psíquica. Na leitura junguiana, os Arcanos Maiores
                    mapeiam a individuação: por exemplo, o Louco como impulso de vida, a Morte como transformação
                    inevitável, a Torre como queda das estruturas rígidas, a Temperança como integração de opostos e o
                    Mundo como totalidade. Esses são exemplos, não uma lista completa. O Tarô não prediz; revela qual
                    arquétipo está em cena e que atitude ele pede agora. Funciona muito bem para dar nome à força
                    interna e ao conflito que moldam a pergunta.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">I Ching</h3>
                  <p className="text-white/80 leading-relaxed text-sm">
                    Clássico chinês da mudança com 64 hexagramas. Cada consulta traz Julgamento, Imagem e, quando
                    surgem, Linhas Mutáveis. Ele descreve a qualidade do tempo, orientando quando avançar, quando
                    recolher e como alinhar caráter e ação. A ética é central: clareza, modéstia, firmeza, suavidade. Em
                    vez de sim ou não, o I Ching oferece ritmo e postura. É excelente para decisões que dependem de
                    timing e de ajuste fino.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Runas</h3>
                  <p className="text-white/80 leading-relaxed text-sm">
                    Sistema do Elder Futhark em que cada runa é letra, força e princípio de natureza. Elas falam de
                    vontade em ato: iniciar, cortar, proteger, revelar, colher. São diretas e operacionais, favorecendo
                    leituras curtas que viram prática rápida. A chave é cadência: criar ciclos curtos de gesto e
                    revisão, evitando confundir velocidade com progresso. Úteis para destravar movimento e dar
                    disciplina ao impulso.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Búzios</h3>
                  <p className="text-white/80 leading-relaxed text-sm">
                    Oráculo afro-atlântico que lê a queda de conchas para indicar odus e qualidades dos Orixás, isto é,
                    princípios vivos como justiça, coragem, doçura, movimento e paz. Mostra fluxo e bloqueio do axé na
                    situação e chama responsabilidade: palavra certa, tempo certo, respeito ao limite. No app, tratamos
                    como orientação de princípios e postura. Para ritos e prescrições religiosas, sempre encaminhar a
                    uma casa de culto e liderança qualificada.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Lenormand</h3>
                  <p className="text-white/80 leading-relaxed text-sm">
                    Baralho de 36 cartas, linguagem prática do cotidiano: carta, chave, caminhos, casa, jardim, navio.
                    Lê-se em pares e cadeias como frases curtas, gerando sinais verificáveis no curto prazo. É a ponte
                    entre símbolo e agenda: confirmações, convites, obstáculos logísticos, desdobramentos de 24 a 72
                    horas. Ótimo para validar um pressentimento com evidência concreta.
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mt-6">
                  <h3 className="text-lg font-medium text-white mb-2">Por que ler os cinco juntos</h3>
                  <p className="text-white/80 leading-relaxed text-sm">
                    Cada sistema ilumina um plano do mesmo instante. O Tarô nomeia a dinâmica psíquica. O I Ching alinha
                    ao tempo. As Runas dão gesto e cadência. Os Búzios oferecem eixo ético e relação com o sagrado. O
                    Lenormand ancora tudo no sinal prático. Em conjunto, você não recebe cinco respostas soltas, mas uma
                    visão coerente que vai do arquétipo ao calendário, da intenção à ação.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}
