import { createClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"

export default async function FAQPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const faqs = [
    {
      question: "O Multioráculo prevê o futuro?",
      answer:
        "Não. Ele revela a qualidade do momento e a postura eficaz agora. Você continua no comando das suas escolhas.",
    },
    {
      question: "O que recebo em cada tiragem?",
      answer:
        "Uma leitura simultânea de Tarô, I Ching, Runas, Búzios e Lenormand com síntese unificada e os cinco oráculos em abas para consulta completa. Inclui um sinal prático para as próximas 24 a 72 horas.",
    },
    {
      question: "Quantas tiragens tenho em cada plano?",
      answer: "Essencial: duas por semana, total de 8 por mês.\nIlimitado: tiragens ilimitadas para uso pessoal.",
    },
    {
      question: "O que conta como uma tiragem?",
      answer: "Fazer uma pergunta nova e gerar a leitura completa. Reabrir a mesma leitura não consome nova tiragem.",
    },
    {
      question: "Posso cancelar quando quiser?",
      answer: "Sim. Cancelamento a qualquer momento. O acesso permanece até o fim do ciclo já pago.",
    },
    {
      question: "Há período de teste gratuito?",
      answer:
        "Podemos fazer campanhas promocionais com uma tiragem gratuita. Quando estiver ativo, avisaremos dentro do app.",
    },
    {
      question: "O que faço se as respostas parecerem se contradizer?",
      answer:
        "Use a síntese unificada como referência principal. Ela alinha os cinco ângulos em uma orientação coerente. Depois, aprofunde nas abas para ver nuances de timing, atitude e verificação prática.",
    },
    {
      question: "Com que frequência devo perguntar?",
      answer:
        "Qualidade vence quantidade. Uma boa pergunta por semana costuma produzir mais clareza do que muitas perguntas por dia. No Essencial, siga a cadência de duas por semana. No Ilimitado, mantenha intenção clara para não gerar ruído.",
    },
    {
      question: "O app armazena minhas perguntas e leituras?",
      answer:
        "O histórico fica no seu dispositivo para que você possa revisar. Se ativarmos sincronização em nuvem, avisaremos com transparência e opção de controle.",
    },
    {
      question: "As leituras substituem aconselhamento médico, jurídico ou financeiro?",
      answer:
        "Não. O Multioráculo é uma ferramenta de reflexão e direção. Para decisões clínicas, legais ou financeiras, procure profissionais qualificados.",
    },
    {
      question: "Como o Búzios é tratado no app?",
      answer:
        "Com respeito à tradição afro-brasileira. Usamos linguagem de princípios e postura. Para ritos, prescrições específicas e orientação religiosa, procure uma casa e um sacerdote qualificado.",
    },
    {
      question: "O que significa sinal prático de 24 a 72 horas?",
      answer:
        "É um indicador verificável no cotidiano, como mensagem, convite, confirmação ou limiar concreto. Se o sinal vier, avance. Se não vier, refine a pergunta e ajuste a postura.",
    },
    {
      question: "Como tornar minhas perguntas mais claras?",
      answer:
        "Prefira perguntas abertas e situadas no presente. Exemplos: Qual gesto destrava este ciclo? O que preciso deixar para trás agora? Onde está o fio guia desta decisão?",
    },
    {
      question: "O Ilimitado tem algum limite oculto?",
      answer:
        "É ilimitado para uso pessoal humano. Não permitimos automações, uso em massa ou redistribuição comercial das tiragens.",
    },
    {
      question: "Funciona no celular?",
      answer: "Sim. A experiência é desenhada para mobile primeiro.",
    },
    {
      question: "Qual é o suporte disponível?",
      answer:
        "Suporte por e-mail no Essencial. Suporte prioritário no Ilimitado. O contato aparece dentro do app em Ajuda.",
    },
  ]

  return (
    <ShaderBackground>
      <Header initialUser={user} />

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-light text-white mb-3">{faq.question}</h3>
                <p className="text-white/80 leading-relaxed text-sm whitespace-pre-line">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ShaderBackground>
  )
}
