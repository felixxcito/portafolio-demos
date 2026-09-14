"use client";

import { useEffect, useState } from "react";

/**
 * Fecha de lanzamiento. Si ya pasó, se recorre al mismo día del año
 * siguiente: es una demo que puede enseñarse dentro de mucho tiempo y
 * un contador en ceros la haría ver abandonada.
 */
function objetivo() {
  const base = new Date("2026-11-20T10:00:00-06:00");
  const ahora = new Date();
  while (base.getTime() < ahora.getTime()) {
    base.setFullYear(base.getFullYear() + 1);
  }
  return base;
}

const UNIDADES = [
  ["dias", "Días"],
  ["horas", "Horas"],
  ["min", "Minutos"],
  ["seg", "Segundos"],
] as const;

function restante(hasta: Date) {
  const ms = Math.max(0, hasta.getTime() - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    dias: Math.floor(s / 86400),
    horas: Math.floor((s % 86400) / 3600),
    min: Math.floor((s % 3600) / 60),
    seg: s % 60,
  };
}

export function Cuenta() {
  // Sin montar no se renderiza el tiempo: el servidor y el cliente
  // calcularían valores distintos y React marcaría error de hidratación.
  const [t, setT] = useState<ReturnType<typeof restante> | null>(null);

  useEffect(() => {
    const hasta = objetivo();
    const tic = () => setT(restante(hasta));
    // El primer valor se agenda en vez de fijarse en el cuerpo del efecto:
    // así el estado siempre cambia desde un callback y no encadena renders.
    const inmediato = setTimeout(tic, 0);
    const id = setInterval(tic, 1000);
    return () => {
      clearTimeout(inmediato);
      clearInterval(id);
    };
  }, []);

  return (
    <ul className="flex gap-2.5 sm:gap-4" aria-label="Tiempo restante para el lanzamiento">
      {UNIDADES.map(([k, etiqueta]) => (
        <li
          key={k}
          className="min-w-[4.2rem] flex-1 rounded-xl border border-line bg-surface/70 px-2 py-3 text-center backdrop-blur-sm sm:min-w-20 sm:px-4 sm:py-4"
        >
          <span className="block font-display text-[clamp(1.5rem,5vw,2.25rem)] leading-none tabular-nums">
            {t ? String(t[k]).padStart(2, "0") : "––"}
          </span>
          <span className="mt-1.5 block text-[0.62rem] tracking-[0.14em] text-faint uppercase">
            {etiqueta}
          </span>
        </li>
      ))}
    </ul>
  );
}
