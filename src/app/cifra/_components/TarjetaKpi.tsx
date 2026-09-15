import * as fmt from "@/lib/grafica/formato";
import type { Kpi } from "@/lib/data/cifra";
import { Chispa } from "./Chispa";

/**
 * Cifra de portada.
 *
 * El delta compara contra el periodo anterior de la misma longitud: 30 días
 * contra los 30 previos. Compararlo contra un año fijo haría que el número
 * dijera cosas distintas según el rango elegido.
 */
export function TarjetaKpi({ kpi }: { kpi: Kpi }) {
  const sube = kpi.delta >= 0;
  const esMoneda = kpi.id === "ingresos" || kpi.id === "ticket";

  return (
    <div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted">{kpi.nombre}</p>
        <span
          className="numerico shrink-0 rounded-full px-1.5 py-0.5 text-[0.7rem] font-medium"
          style={{
            color: sube ? "var(--positivo)" : "var(--negativo)",
            background: sube
              ? "color-mix(in srgb, var(--positivo) 12%, transparent)"
              : "color-mix(in srgb, var(--negativo) 12%, transparent)",
          }}
        >
          {fmt.delta(kpi.delta)}
        </span>
      </div>

      <p className="numerico mt-3 text-2xl font-medium tracking-tight sm:text-[1.7rem]">
        {esMoneda
          ? kpi.id === "ticket"
            ? fmt.pesos(kpi.valor)
            : fmt.pesos(kpi.valor)
          : fmt.entero(kpi.valor)}
      </p>

      <div className="mt-3 h-9">
        <Chispa
          valores={kpi.chispa}
          color={sube ? "var(--positivo)" : "var(--negativo)"}
        />
      </div>

      <p className="sr-only">
        {`${kpi.nombre}: ${esMoneda ? fmt.pesos(kpi.valor) : fmt.entero(kpi.valor)}, ${fmt.delta(kpi.delta)} contra el periodo anterior.`}
      </p>
    </div>
  );
}
