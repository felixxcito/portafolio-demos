"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ACABADOS } from "./VisorProducto";

// Three.js toca `window` al construir el renderer, así que el visor no
// puede renderizarse en el servidor. Cargarlo aparte también saca ~600 KB
// del bundle inicial de la ruta.
const VisorProducto = dynamic(
  () => import("./VisorProducto").then((m) => m.VisorProducto),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square w-full animate-pulse rounded-2xl bg-surface sm:aspect-[4/5]" />
    ),
  },
);

export function Configurador() {
  const [acabado, setAcabado] = useState(ACABADOS[0]);

  return (
    <div>
      <VisorProducto acabado={acabado} />

      <fieldset className="mt-6">
        <legend className="eyebrow mb-3.5">Acabado · {acabado.nombre}</legend>
        <div className="flex flex-wrap gap-3">
          {ACABADOS.map((a) => {
            const activo = a.id === acabado.id;
            return (
              <button
                key={a.id}
                onClick={() => setAcabado(a)}
                aria-pressed={activo}
                aria-label={`Acabado ${a.nombre}`}
                className={`group flex min-h-11 items-center gap-2.5 rounded-full border px-3 pr-4 text-sm transition-colors duration-300 ${
                  activo
                    ? "border-accent text-fg"
                    : "border-line text-muted hover:border-fg/40 hover:text-fg"
                }`}
              >
                <span
                  className="size-5 rounded-full ring-1 ring-white/15 ring-inset"
                  style={{ background: a.hex }}
                />
                {a.nombre}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
