import { ImageResponse } from "next/og"

/**
 * Imagem de compartilhamento (Open Graph e Twitter). Uma só para o site:
 * marca e os cinco nomes, em fundo escuro igual ao do produto. Não carrega
 * texto de leitura nem dado de ninguém. Os nomes são os mesmos nos três
 * idiomas, então a imagem não precisa de variante por idioma.
 */
export const alt = "Multioráculo"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0f23 0%, #1e1b4b 55%, #4c1d95 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 112, fontWeight: 300, fontStyle: "italic", letterSpacing: -2 }}>Multioráculo</div>
        <div style={{ marginTop: 28, fontSize: 36, color: "rgba(255,255,255,0.72)" }}>
          Tarô · I Ching · Runas · Búzios · Lenormand
        </div>
      </div>
    ),
    size,
  )
}
