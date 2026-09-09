"use client";

import React from "react";
import { MeshGradient } from "@paper-design/shaders-react";

type ShaderBackgroundProps = {
  className?: string;
  children?: React.ReactNode;
};

export function ShaderBackground({ className, children }: ShaderBackgroundProps) {
  return (
    <div className={`relative min-h-screen overflow-hidden ${className ?? ""}`}>
      <div className="absolute inset-0 bg-[#0f0f23]" />

      <MeshGradient
        className="absolute inset-0 h-full w-full"
        colors={["#0f0f23", "#8b5cf6", "#a855f7", "#6366f1", "#4c1d95", "#1e1b4b"]}
        speed={0.5}
      />

      {/* no celular, reserva o espaço da barra de navegação fixa no rodapé */}
      <div className="relative z-10 pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] sm:pb-0">{children}</div>
    </div>
  );
}

// garante compatibilidade com import default
export default ShaderBackground;
