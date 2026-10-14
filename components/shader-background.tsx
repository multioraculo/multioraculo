"use client";

import React from "react";
import { MeshGradient } from "@paper-design/shaders-react";

/**
 * Fundo do produto: um único mesh violeta, igual em toda parte.
 *
 * A única coisa que muda por área é UM tom secundário: a massa de luz que
 * atravessa o quadro (o violeta claro do gradiente original). Trocá-la muda a
 * temperatura da luz sem tocar na estrutura do mesh, nas posições das massas
 * de cor, na profundidade, no blur ou na velocidade. As três áreas continuam
 * da mesma família:
 *
 *   Multioráculo → violeta puro (tom original)
 *   Sonhos       → violeta + dourado lunar
 *   Diário     → violeta + prata mineral
 */

export type BackgroundTone = "multioraculo" | "sonhos" | "grimorio";

const BASE_COLORS = ["#0f0f23", "#8b5cf6", "#a855f7", "#6366f1", "#4c1d95", "#1e1b4b"];

/** teto de pixels desenhados por quadro: 1/8 do padrão da biblioteca (ver o uso) */
const MAX_PIXELS_DO_FUNDO = 1036800;

/** posição, no array, da massa de luz que muda de temperatura por área */
const ACCENT_INDEX = 2;

const ACCENT: Record<BackgroundTone, string> = {
  multioraculo: BASE_COLORS[ACCENT_INDEX],
  // dourado-champagne apagado: luz quente dentro do violeta, nunca fundo amarelo
  sonhos: "#E0C68F",
  // prata mineral com um resto de azul: sóbrio, translúcido, nunca fundo cinza
  grimorio: "#AEB7C4",
};

function colorsFor(tone: BackgroundTone): string[] {
  const colors = BASE_COLORS.slice();
  colors[ACCENT_INDEX] = ACCENT[tone];
  return colors;
}

type ShaderBackgroundProps = {
  className?: string;
  children?: React.ReactNode;
  /** temperatura da luz da área; o gradiente é o mesmo em todas */
  tone?: BackgroundTone;
};

export function ShaderBackground({ className, children, tone = "multioraculo" }: ShaderBackgroundProps) {
  return (
    <div className={`relative min-h-screen overflow-hidden ${className ?? ""}`}>
      <div className="absolute inset-0 bg-[#0f0f23]" />

      <MeshGradient
        className="absolute inset-0 h-full w-full"
        colors={colorsFor(tone)}
        speed={0.5}
        // RESOLUÇÃO DE RENDERIZAÇÃO, não aparência. O shader, as cores, a
        // velocidade e a área coberta ficam exatamente como eram.
        //
        // O padrão da biblioteca desenha o fundo com piso de 2 pixels por pixel
        // CSS e teto de 8,3 milhões de pixels por quadro. Como o canvas cobre a
        // página inteira (e é assim que o gradiente acompanha a rolagem), num
        // celular de densidade 3 a Home chegava a 901×9209 = 8,3 Mpx desenhados
        // a cada quadro, quase todos fora da tela.
        //
        // Um gradiente desfocado não precisa dessa resolução. Medido com a
        // mesma imagem congelada, em 375×812 CSS: com 1/8 do teto a diferença
        // máxima por canal foi 1 em 255, em 0% dos pixels. Tempo de GPU por
        // quadro numa Intel integrada: 10,3 ms no padrão, 2,1 ms com este teto.
        // Em celular a proporção é a mesma, e é lá que o fundo disputava a GPU
        // com o toque.
        //
        // minPixelRatio={1}: em tela de densidade 1 não há por que desenhar a 2×.
        // Em tela densa o teto abaixo manda de qualquer jeito.
        maxPixelCount={MAX_PIXELS_DO_FUNDO}
        minPixelRatio={1}
      />

      {/* no celular, reserva o espaço da barra de navegação fixa no rodapé */}
      <div className="relative z-10 pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] sm:pb-0">{children}</div>
    </div>
  );
}

// garante compatibilidade com import default
export default ShaderBackground;
