"use client";

import { useState } from "react";

type Plan = {
  id: string;
  nombre: string;
  mensual: number;
  resumen: string;
  incluye: string[];
  destacado?: boolean;
};

const PLANES: Plan[] = [
  {
    id: "solo",
    nombre: "Impulso One",
    mensual: 349,
    resumen: "El altavoz y lo esencial para empezar.",
    incluye: ["Altavoz Impulso One", "Cable USB-C trenzado", "Garantía de 2 años", "Envío estándar"],
  },
  {
    id: "duo",
    nombre: "Duo",
    mensual: 599,
    resumen: "Dos unidades emparejadas en estéreo real.",
    incluye: [
      "Dos altavoces emparejados",
      "Base de carga de aluminio",
      "Garantía extendida de 4 años",
      "Envío exprés sin costo",
      "Acabados exclusivos",
    ],
    destacado: true,
  },
  {
    id: "studio",
    nombre: "Studio",
    mensual: 1149,
    resumen: "Sistema de cuatro puntos con calibración.",
    incluye: [
      "Cuatro altavoces",
      "Calibración acústica en sitio",
      "Garantía de por vida",
      "Soporte prioritario",
      "Reemplazo en 24 horas",
    ],
  },
];

const DESCUENTO_ANUAL = 0.2;

export function Planes() {
  const [anual, setAnual] = useState(true);

  const precio = (p: Plan) =>
    anual ? Math.round(p.mensual * 12 * (1 - DESCUENTO_ANUAL)) : p.mensual;

  return (
    <div>
      {/* Interruptor mensual / anual */}
      <div className="mb-12 flex justify-center">
        <div
          role="radiogroup"
          aria-label="Periodo de pago"
          className="inline-flex rounded-full border border-line bg-surface p-1"
        >
          {[
            { v: false, t: "Mensual" },
            { v: true, t: "Anual" },
          ].map(({ v, t }) => (
            <button
              key={t}
              role="radio"
              aria-checked={anual === v}
              onClick={() => setAnual(v)}
              className={`relative min-h-11 rounded-full px-6 text-sm transition-colors duration-400 ${
                anual === v ? "bg-accent text-accent-fg" : "text-muted hover:text-fg"
              }`}
            >
              {t}
              {v && (
                <span
                  className={`ml-2 text-[0.7rem] ${anual ? "text-accent-fg/75" : "text-accent"}`}
                >
                  −20%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid gap-6 lg:grid-cols-3">
        {PLANES.map((p) => (
          <li key={p.id} className="flex">
            <div
              className={`relative flex w-full flex-col rounded-2xl border p-7 transition-colors duration-400 ${
                p.destacado
                  ? "border-accent bg-accent-soft"
                  : "border-line bg-surface hover:border-fg/25"
              }`}
            >
              {p.destacado && (
                <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-1 text-[0.68rem] font-medium tracking-wide text-accent-fg">
                  Más elegido
                </span>
              )}

              <h3 className="font-display text-2xl">{p.nombre}</h3>
              <p className="mt-2 text-sm text-muted">{p.resumen}</p>

              <p className="mt-7 flex items-baseline gap-1.5">
                <span className="font-display text-5xl tabular-nums">
                  ${precio(p).toLocaleString("es-MX")}
                </span>
                <span className="text-sm text-faint">{anual ? "/año" : "/mes"}</span>
              </p>
              {anual && (
                <p className="mt-1.5 text-xs text-accent tabular-nums">
                  Ahorras ${Math.round(p.mensual * 12 * DESCUENTO_ANUAL).toLocaleString("es-MX")} al año
                </p>
              )}

              <ul className="mt-7 flex-1 space-y-3 border-t border-line pt-6 text-sm">
                {p.incluye.map((i) => (
                  <li key={i} className="flex gap-3">
                    <span aria-hidden className="text-accent">
                      ✓
                    </span>
                    <span className="text-muted">{i}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#reserva"
                className={`mt-8 flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-medium transition-opacity hover:opacity-90 ${
                  p.destacado
                    ? "bg-accent text-accent-fg"
                    : "border border-line text-fg hover:border-accent"
                }`}
              >
                Reservar {p.nombre}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
