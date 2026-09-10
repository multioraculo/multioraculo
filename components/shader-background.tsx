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
 *   Grimório     → violeta + prata mineral
 */

export type BackgroundTone = "multioraculo" | "sonhos" | "grimorio";

const BASE_COLORS = ["#0f0f23", "#8b5cf6", "#a855f7", "#6366f1", "#4c1d95", "#1e1b4b"];

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
      />

      {/* no celular, reserva o espaço da barra de navegação fixa no rodapé */}
      <div className="relative z-10 pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] sm:pb-0">{children}</div>
    </div>
  );
}

// garante compatibilidade com import default
export default ShaderBackground;
