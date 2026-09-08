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
}

export default nextConfig
