/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["pdf-parse"],
  // Desliga o botão "N" do Next.js Dev Tools (indicador de desenvolvimento).
  // Ele só existe em `next dev`; em produção nunca é injetado.
  devIndicators: false,
  // /auth/callback é rota de redirect, sem HTML para levar <meta robots>. O
  // cabeçalho cumpre o mesmo papel. Não entra no robots.txt de propósito: o
  // rastreador precisa conseguir abrir a URL para ler o noindex.
  async headers() {
    return [
      {
        source: "/auth/callback",
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      },
    ]
  },
}

export default nextConfig
