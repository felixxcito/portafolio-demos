"use client";

import { useRef } from "react";
import {
  METRICAS,
  RANGOS,
  type Conjunto,
  type Filtros,
} from "@/lib/data/cifra";

type Props = {
  conjunto: Conjunto;
  filtros: Filtros;
  onCambio: (parcial: Partial<Filtros>) => void;
  onLimpiar: () => void;
  hayFiltro: boolean;
};

type Opcion = { id: string; nombre: string };

/**
 * Grupo segmentado con el patrón ARIA de radiogroup.
 *
 * Eso implica tabindex móvil: sólo la opción seleccionada entra en el
 * recorrido del tabulador, y dentro del grupo se navega con las flechas.
 * Es lo que distingue un grupo de opciones de una fila de botones sueltos
 * para quien no usa ratón.
 */
function Segmentado({
  etiqueta,
  opciones,
  valor,
  onElegir,
}: {
  etiqueta: string;
  opciones: readonly Opcion[];
  valor: string;
  onElegir: (id: string) => void;
}) {
  const grupo = useRef<HTMLDivElement>(null);

  const alTeclear = (e: React.KeyboardEvent) => {
    const dir =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (dir === 0) return;

    e.preventDefault();
    const i = opciones.findIndex((o) => o.id === valor);
    const siguiente = opciones[(i + dir + opciones.length) % opciones.length];
    onElegir(siguiente.id);

    // El foco sigue a la selección, como manda el patrón.
    grupo.current
      ?.querySelectorAll<HTMLButtonElement>("button")
      [opciones.indexOf(siguiente)]?.focus();
  };

  return (
    <div
      ref={grupo}
      role="radiogroup"
      aria-label={etiqueta}
      onKeyDown={alTeclear}
      className="inline-flex rounded-lg border border-line bg-surface p-0.5"
    >
      {opciones.map((o) => {
        const activa = o.id === valor;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={activa}
            tabIndex={activa ? 0 : -1}
            onClick={() => onElegir(o.id)}
            className={`rounded-[0.4rem] px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
              activa
                ? "bg-accent text-accent-fg"
                : "text-muted hover:text-fg"
            }`}
          >
            {o.nombre}
          </button>
        );
      })}
    </div>
  );
}

function Selector({
  etiqueta,
  opciones,
  valor,
  onElegir,
}: {
  etiqueta: string;
  opciones: readonly Opcion[];
  valor: string;
  onElegir: (id: string) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-muted">{etiqueta}</span>
      {/* Select nativo a propósito: en móvil abre la rueda del sistema y
          trae el teclado y el lector de pantalla resueltos de fábrica. */}
      <select
        value={valor}
        onChange={(e) => onElegir(e.target.value)}
        className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-fg"
      >
        <option value="todas">Todas</option>
        {opciones.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ControlesTablero({
  conjunto,
  filtros,
  onCambio,
  onLimpiar,
  hayFiltro,
}: Props) {
  // Sólo se ofrecen las métricas que el conjunto trae de verdad: un archivo
  // sin columna de visitantes no debería poder pedir esa vista y ver ceros.
  const metricas = METRICAS.filter((m) => conjunto.metricas.includes(m.id));

  // Tampoco tiene sentido ofrecer "12 meses" sobre un archivo de seis
  // semanas; el rango se recorta a lo que hay.
  const rangos = RANGOS.filter(
    (r, i) => i === 0 || RANGOS[i - 1].dias < conjunto.dias,
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Segmentado
        etiqueta="Rango de fechas"
        opciones={rangos}
        valor={filtros.rango}
        onElegir={(rango) => onCambio({ rango: rango as Filtros["rango"] })}
      />
      <Segmentado
        etiqueta="Métrica"
        opciones={metricas}
        valor={filtros.metrica}
        onElegir={(metrica) =>
          onCambio({ metrica: metrica as Filtros["metrica"] })
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Selector
          etiqueta="Sucursal"
          opciones={conjunto.sucursales}
          valor={filtros.sucursal}
          onElegir={(sucursal) => onCambio({ sucursal })}
        />
        <Selector
          etiqueta="Categoría"
          opciones={conjunto.categorias}
          valor={filtros.categoria}
          onElegir={(categoria) => onCambio({ categoria })}
        />
      </div>

      {hayFiltro && (
        <button
          type="button"
          onClick={onLimpiar}
          className="rounded-lg px-2.5 py-1.5 text-sm text-accent underline-offset-4 hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
