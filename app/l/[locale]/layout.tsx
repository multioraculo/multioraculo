import type React from "react"
import type { Metadata, Viewport } from "next"
import { Figtree } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Instrument_Serif } from "next/font/google"
import { notFound } from "next/navigation"
import { Toaster } from "sonner"
import { I18nProvider } from "@/components/i18n-provider"
import BottomNav from "@/components/bottom-nav"
import { NavPendingProvider } from "@/components/nav-pending"
import { LOCALES, isLocale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n"
import { siteUrl } from "@/lib/seo/site"
import "@/app/globals.css"

/**
 * LAYOUT RAIZ, com o idioma no caminho.
 *
 * Toda página do site mora em app/l/[locale]/... e NENHUMA URL pública mostra
 * isso: o middleware reescreve (nunca redireciona) /oraculos para /l/pt/oraculos,
 * /en/oracles para /l/en/oraculos, /home para /l/<idioma do cookie>/home, e
 * assim por diante. Quem pedir /l/... diretamente recebe 404 (middleware.ts).
 *
 * POR QUE O IDIOMA VIROU SEGMENTO. Antes ele chegava por cabeçalho interno e
 * este layout o lia com headers()/cookies(). Ler a requisição no layout raiz
 * torna TODA página dinâmica, mesmo a que é só texto: era por isso que /faq e
 * /oraculos acordavam a função da Netlify a cada visita (0,9 s aquecida, até
 * 10 s fria). Com o idioma em `params`, este layout não lê a requisição, e cada
 * página decide: a que não lê cookies nem cabeçalhos é gerada estática no build,
 * nos três idiomas, e sai do CDN; a que lê continua dinâmica, como sempre.
 *
 * O <html lang> continua certo no HTML inicial dos três idiomas, que é o que o
 * smoke de SEO confere. A barra inferior, os provedores e o Toaster seguem num
 * layout único, então a navegação entre páginas estáticas e dinâmicas continua
 * suave, sem recarga e sem remontar a barra.
 */

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0f23",
}

type Params = Promise<{ locale: string }>

/** Os três idiomas, gerados no build; qualquer outro valor em /l/<x>/ é 404. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}
export const dynamicParams = false

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  return {
    // base para canonical e Open Graph virarem URL absoluta
    metadataBase: new URL(siteUrl()),
    // o título de cada rota entra no lugar de %s; a Home usa título absoluto
    title: { default: dict.meta.title, template: "%s | Multioráculo" },
    description: dict.meta.description,
  }
}

export default async function RootLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Params }>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <html lang={locale}>
      <head>
        <style>{`
html {
  font-family: ${figtree.style.fontFamily};
  --font-sans: ${figtree.variable};
  --font-mono: ${GeistMono.variable};
  --font-instrument-serif: ${instrumentSerif.variable};
}
        `}</style>
      </head>
      <body className={`${figtree.variable} ${instrumentSerif.variable}`}>
        <I18nProvider initialLocale={locale}>
          {/* estado pendente de navegação (barra inferior, cabeçalho e menus): ver components/nav-pending.tsx */}
          <NavPendingProvider>
            {children}
            <BottomNav />
            <Toaster theme="dark" position="bottom-right" richColors duration={5000} />
          </NavPendingProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
