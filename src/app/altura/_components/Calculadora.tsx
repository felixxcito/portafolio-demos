"use client";

import { useMemo, useState } from "react";
import { formatoMXN, precioCorto, propiedades } from "@/lib/data/propiedades";

const pesos = (n: number) => formatoMXN.format(Math.round(n));

export function Calculadora() {
  const [id, setId] = useState(propiedades[0].id);
  const [engancheP, setEngancheP] = useState(20);
  const [anios, setAnios] = useState(20);
  const [tasa, setTasa] = useState(10.5);

  const precio = propiedades.find((p) => p.id === id)!.precio;

  const calculo = useMemo(() => {
    const enganche = precio * (engancheP / 100);
    const capital = precio - enganche;
    const i = tasa / 100 / 12;
    const n = anios * 12;

    // Amortización francesa. Con tasa 0 el pago es capital / plazo.
    const mensual =
      i === 0 ? capital / n : (capital * i * (1 + i) ** n) / ((1 + i) ** n - 1);

    const totalPagado = mensual * n;
    const intereses = totalPagado - capital;

    return { enganche, capital, mensual, totalPagado, intereses };
  }, [precio, engancheP, anios, tasa]);

  // Proporción capital/intereses para la barra de desglose.
  const pctCapital = (calculo.capital / calculo.totalPagado) * 100;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
      {/* Controles */}
      <div className="space-y-7">
        <div>
          <label htmlFor="residencia" className="eyebrow mb-2.5 block">
            Residencia
          </label>
          <select
            id="residencia"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="min-h-12 w-full rounded-lg border border-line bg-surface px-4 text-base text-fg"
          >
            {propiedades.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} — {precioCorto(p.precio)}
              </option>
            ))}
          </select>
        </div>

        {(
          [
            {
              id: "enganche",
              etiqueta: "Enganche",
              valor: engancheP,
              set: setEngancheP,
              min: 10,
              max: 60,
              step: 1,
              muestra: `${engancheP}% · ${pesos(calculo.enganche)}`,
            },
            {
              id: "plazo",
              etiqueta: "Plazo",
              valor: anios,
              set: setAnios,
              min: 5,
              max: 30,
              step: 1,
              muestra: `${anios} años`,
            },
            {
              id: "tasa",
              etiqueta: "Tasa anual",
              valor: tasa,
              set: setTasa,
              min: 6,
              max: 16,
              step: 0.1,
              muestra: `${tasa.toFixed(1)}%`,
            },
          ] as const
        ).map((c) => (
          <div key={c.id}>
            <label htmlFor={c.id} className="mb-2.5 flex items-baseline justify-between">
              <span className="eyebrow">{c.etiqueta}</span>
              <span className="text-sm font-medium tabular-nums">{c.muestra}</span>
            </label>
            <input
              id={c.id}
              type="range"
              min={c.min}
              max={c.max}
              step={c.step}
              value={c.valor}
              onChange={(e) => c.set(Number(e.target.value))}
              className="h-11 w-full cursor-pointer accent-[var(--site-accent)]"
            />
          </div>
        ))}
      </div>

      {/* Resultado */}
      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-9">
        <p className="eyebrow">Pago mensual estimado</p>
        <p className="mt-2 font-display text-[clamp(2.4rem,6.5vw,4rem)] leading-none tabular-nums">
          {pesos(calculo.mensual)}
        </p>

        <div
          className="mt-8 flex h-2.5 overflow-hidden rounded-full bg-elevated"
          role="img"
          aria-label={`De lo que pagarás, ${Math.round(pctCapital)} por ciento es capital y ${Math.round(100 - pctCapital)} por ciento intereses`}
        >
          <span
            className="bg-accent transition-[width] duration-500 ease-[var(--ease-out-expo)]"
            style={{ width: `${pctCapital}%` }}
          />
          <span
            className="bg-accent/30 transition-[width] duration-500 ease-[var(--ease-out-expo)]"
            style={{ width: `${100 - pctCapital}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between text-xs text-muted">
          <span>Capital {Math.round(pctCapital)}%</span>
          <span>Intereses {Math.round(100 - pctCapital)}%</span>
        </div>

        <dl className="mt-8 space-y-4 border-t border-line pt-6 text-sm">
          {[
            ["Enganche", pesos(calculo.enganche)],
            ["Monto financiado", pesos(calculo.capital)],
            ["Intereses totales", pesos(calculo.intereses)],
            ["Costo total", pesos(calculo.totalPagado + calculo.enganche)],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4">
              <dt className="text-muted">{k}</dt>
              <dd className="font-medium tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-7 text-xs leading-relaxed text-faint">
          Cálculo con amortización francesa y tasa fija. Es una estimación
          informativa: no incluye seguros, comisión por apertura ni gastos
          notariales, y no constituye una oferta de crédito.
        </p>
      </div>
    </div>
  );
}
