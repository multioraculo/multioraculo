"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import React from "react";

// Carrega só no client para não dar mismatch/SSR com WebGL
const PulsingBorder = dynamic(
  async () => {
    const mod = await import("@paper-design/shaders-react");
    return mod.PulsingBorder as any;
  },
  { ssr: false }
);

type AnimatedLogoProps = {
  href?: string;
  labelTop?: string;
  labelCenter?: string;
  className?: string;
};

export default function AnimatedLogo({
  href = "/",
  labelTop = "MEU",
  labelCenter = "GURU",
  className = "",
}: AnimatedLogoProps) {
  return (
    <Link
      href={href}
      aria-label="MEUGURU"
      className={`relative z-50 inline-flex items-center justify-center ${className}`}
    >
      <div className="relative h-14 w-14">
        <div className="absolute inset-0">
          <PulsingBorder
            className="h-full w-full"
          />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
          <div className="text-[10px] leading-none text-white/90 tracking-wide">
            {labelTop}
          </div>
          <div className="text-[12px] leading-none text-white font-semibold tracking-wide">
            {labelCenter}
          </div>
        </div>
      </div>
    </Link>
  );
}
