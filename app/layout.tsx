import type React from "react"
import type { Metadata, Viewport } from "next"
import { Figtree } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Instrument_Serif } from "next/font/google"
import { Toaster } from "sonner"
import { I18nProvider } from "@/components/i18n-provider"
import BottomNav from "@/components/bottom-nav"
import { getI18n } from "@/lib/i18n/server"
import { siteUrl } from "@/lib/seo/site"
import "./globals.css"

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

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n()
  return {
    // base para canonical e Open Graph virarem URL absoluta
    metadataBase: new URL(siteUrl()),
    // o título de cada rota entra no lugar de %s; a Home usa título absoluto
    title: { default: dict.meta.title, template: "%s | Multioráculo" },
    description: dict.meta.description,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { locale } = await getI18n()

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
          {children}
          <BottomNav />
          <Toaster theme="dark" position="bottom-right" richColors duration={5000} />
        </I18nProvider>
      </body>
    </html>
  )
}
