import type { MetadataRoute } from "next"
import { urlAbsoluta } from "@/lib/seo/site"

/**
 * robots.txt: orientação de rastreamento, NÃO segurança. Nada aqui protege
 * conteúdo; quem protege é a autenticação de cada rota.
 *
 * Só /api/ fica bloqueada: são endpoints, não páginas, e alguns custam
 * geração paga. As páginas privadas NÃO são bloqueadas de propósito: elas
 * carregam `noindex`, e um rastreador proibido de abrir a página nunca lê o
 * noindex (a URL ainda poderia aparecer, só com o endereço, se alguém a
 * linkasse).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: urlAbsoluta("/sitemap.xml"),
  }
}
