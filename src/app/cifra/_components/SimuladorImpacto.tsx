"use client";

import { useId, useMemo, useState } from "react";
import * as fmt from "@/lib/grafica/formato";
import { escalaLineal } from "@/lib/grafica/escalas";
import { rutaArea, rutaSuave, type Punto } from "@/lib/grafica/rutas";

/** Línea base: ingresos mensuales actuales de la cadena, en MXN. */
const BASE_MENSUAL = 24_800_000;
const MESES = 12;

type Palanca = {
  id: "ticket" | "conversion" | "frecuencia";
  nombre: string;
  ayuda: string;
  max: number;
};

const PALANCAS: Palanca[] = [
  { id: "ticket", nombre: "Ticket promedio", ayuda: "Venta cruzada y surtido", max: 15 },
  { id: "conversion", nombre: "Conversión", ayuda: "Piso de venta y disponibilidad", max: 20 },
  { id: "frecuencia", nombre: "Frecuencia de visita", ayuda: "Lealtad y recompra", max: 25 },
];

/**
 * Simulador de impacto.
 *
 * Las tres palancas son multiplicativas, no aditivas: subir 5% el ticket y
 * 5% la conversión no da 10%, da 10.25%. Sumarlas es el atajo con el que
 * casi todos los calculadores de este tipo exageran su propio resultado.
 */
export function SimuladorImpacto() {
  const [valores, setValores] = useState<Record<Palanca["id"], number>>({
    ticket: 4,
    conversion: 3,
    frecuencia: 5,
  });
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  const { multiplicador, anual, incremento, curvas } = useMemo(() => {
    const multiplicador =
      (1 + valores.ticket / 100) *
      (1 + valores.conversion / 100) *
      (1 + valores.frecuencia / 100);

    // La mejora no aparece de golpe: entra de forma gradual a lo largo del
    // año, que es como se comporta cualquier iniciativa real.
    const rampa = (m: number) => 1 + (multiplicador - 1) * ((m + 1) / MESES);

    const base = Array.from({ length: MESES }, () => BASE_MENSUAL);
    const proyectado = base.map((v, m) => v * rampa(m));

    return {
      multiplicador,
      anual: proyectado.reduce((a, v) => a + v, 0),
      incremento: proyectado.reduce((a, v) => a + v, 0) - BASE_MENSUAL * MESES,
      curvas: { base, proyectado },
    };
  }, [valores]);

  const ancho = 520;
  const alto = 180;
  const techo = Math.max(...curvas.proyectado) * 1.12;
  const x = escalaLineal([0, MESES - 1], [8, ancho - 8]);
  const y = escalaLineal([0, techo], [alto - 8, 8]);

  const punto = (vals: number[]): Punto[] =>
    vals.map((v, i) => ({ x: x(i), y: y(v) }));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
      <div className="space-y-6">
        {PALANCAS.map((p) => (
          <div key={p.id}>
            <div className="flex items-baseline justify-between gap-3">
              <label
                htmlFor={`${uid}-${p.id}`}
                className="text-sm font-medium"
              >
                {p.nombre}
              </label>
              <output
                htmlFor={`${uid}-${p.id}`}
                className="numerico text-sm text-accent"
              >
                +{valores[p.id]}%
              </output>
            </div>

            <input
              id={`${uid}-${p.id}`}
              type="range"
              min={0}
              max={p.max}
              step={1}
              value={valores[p.id]}
              onChange={(e) =>
                setValores((v) => ({ ...v, [p.id]: Number(e.target.value) }))
              }
              aria-describedby={`${uid}-${p.id}-ayuda`}
              className="mt-2 w-full accent-[var(--site-accent)]"
            />
            <p id={`${uid}-${p.id}-ayuda`} className="mt-1 text-xs text-faint">
              {p.ayuda}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
        <p className="eyebrow">Proyección a doce meses</p>

        <p className="numerico mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
          {fmt.pesos(anual)}
        </p>

        <p className="mt-1.5 text-sm text-muted">
          <span style={{ color: "var(--positivo)" }} className="numerico">
            +{fmt.pesos(incremento)}
          </span>{" "}
          sobre la línea base · factor {multiplicador.toFixed(3)}×
        </p>

        <svg
          viewBox={`0 0 ${ancho} ${alto}`}
          className="mt-5 w-full"
          role="img"
          aria-label={`Proyección anual de ${fmt.pesos(anual)}, ${fmt.pesos(incremento)} sobre la línea base.`}
        >
          <defs>
            <linearGradient id={`sim-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--site-accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--site-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path
            d={rutaArea(punto(curvas.proyectado), alto - 8)}
            fill={`url(#sim-${uid})`}
          />
          <path
            d={rutaSuave(punto(curvas.base))}
            fill="none"
            stroke="var(--site-faint)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <path
            d={rutaSuave(punto(curvas.proyectado))}
            fill="none"
            stroke="var(--site-accent)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </svg>

        <p className="mt-3 flex items-center gap-4 text-xs text-faint">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-px w-5 bg-[var(--site-faint)]" />
            Sin cambios
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-0.5 w-5 bg-accent" />
            Con las palancas
          </span>
        </p>
      </div>
    </div>
  );
}
