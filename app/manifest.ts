import type { MetadataRoute } from "next"

/**
 * Manifesto do app. Só descreve o que já existe: nome, cor do fundo (a mesma
 * do ShaderBackground) e os ícones que o projeto já publica. Não registra
 * service worker nem promete uso offline.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Multioráculo",
    short_name: "Multioráculo",
    description: "Uma pergunta, cinco oráculos, uma síntese.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0f23",
    theme_color: "#0f0f23",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  }
}
