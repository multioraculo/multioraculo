import { SITE_NAME, urlAbsoluta } from "./site"

/**
 * Dados estruturados da Home. SÓ o que é verdadeiro e está no produto.
 *
 * O que NÃO entra, de propósito:
 *  - aggregateRating, review, author, offers/preço: não existem, e inventar
 *    para satisfazer validador é o caminho para penalidade manual;
 *  - sameAs, contactPoint: não há perfis nem contato público definidos;
 *  - SearchAction: o site não tem busca;
 *  - WebApplication: o rich result exige oferta e avaliação, que o produto
 *    não pode declarar com verdade hoje. Sem elas, seria marcação sem uso.
 *
 * `inLanguage` lista os três idiomas do site. O `description` do WebSite
 * acompanha o idioma da página (PT em /, EN em /en, ES em /es). Organization e
 * WebSite têm um @id só, o do site, nas três versões da Home.
 */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": urlAbsoluta("/#organization"),
    name: SITE_NAME,
    url: urlAbsoluta("/"),
    logo: urlAbsoluta("/brand/multioraculo-m.png"),
  }
}

/** `descricao` vem do dicionário, no idioma da página que está sendo lida. */
export function websiteLd(descricao?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": urlAbsoluta("/#website"),
    name: SITE_NAME,
    url: urlAbsoluta("/"),
    ...(descricao ? { description: descricao } : {}),
    inLanguage: ["pt-BR", "en", "es"],
    publisher: { "@id": urlAbsoluta("/#organization") },
  }
}

/**
 * JSON seguro para dentro de <script>: o "<" vira <, então nenhum valor
 * consegue fechar a tag nem abrir outra.
 */
export function serializarLd(dados: unknown): string {
  return JSON.stringify(dados).replace(/</g, "\\u003c")
}
