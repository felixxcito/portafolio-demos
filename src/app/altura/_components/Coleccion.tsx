"use client";

import { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import {
  ZONAS,
  formatoMXN,
  precioCorto,
  propiedades,
  type Propiedad,
} from "@/lib/data/propiedades";
import { TarjetaPropiedad } from "./TarjetaPropiedad";
import { Lightbox } from "./Lightbox";

type Orden = "destacado" | "precio-asc" | "precio-desc" | "superficie";

const ORDENES: { valor: Orden; etiqueta: string }[] = [
  { valor: "destacado", etiqueta: "Destacadas" },
  { valor: "precio-asc", etiqueta: "Menor precio" },
  { valor: "precio-desc", etiqueta: "Mayor precio" },
  { valor: "superficie", etiqueta: "Más superficie" },
];

const TOPE = 100_000_000;
const PISO = 25_000_000;
const MAX_COMPARAR = 3;

export function Coleccion() {
  const [zona, setZona] = useState<string>("todas");
  const [recamaras, setRecamaras] = useState(0);
  const [precioMax, setPrecioMax] = useState(TOPE);
  const [orden, setOrden] = useState<Orden>("destacado");
  const [comparar, setComparar] = useState<string[]>([]);
  const [galeria, setGaleria] = useState<Propiedad | null>(null);

  /**
   * Envuelve el cambio de estado en una View Transition para que el
   * grid se reacomode con una animación de morfeo en vez de saltar.
   * Donde la API no existe, el filtro simplemente se aplica directo.
   */
  const transicionar = (fn: () => void) => {
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (doc.startViewTransition && !reducido) {
      doc.startViewTransition(() => flushSync(fn));
    } else {
      fn();
    }
  };

  const resultados = useMemo(() => {
    const lista = propiedades.filter(
      (p) =>
        (zona === "todas" || p.zona === zona) &&
        p.recamaras >= recamaras &&
        p.precio <= precioMax,
    );

    const ordenada = [...lista];
    if (orden === "precio-asc") ordenada.sort((a, b) => a.precio - b.precio);
    if (orden === "precio-desc") ordenada.sort((a, b) => b.precio - a.precio);
    if (orden === "superficie")
      ordenada.sort((a, b) => b.construccion - a.construccion);
    return ordenada;
  }, [zona, recamaras, precioMax, orden]);

  const limpiar = () =>
    transicionar(() => {
      setZona("todas");
      setRecamaras(0);
      setPrecioMax(TOPE);
      setOrden("destacado");
    });

  const hayFiltros =
    zona !== "todas" || recamaras > 0 || precioMax < TOPE || orden !== "destacado";

  const alternarComparar = (id: string) =>
    setComparar((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= MAX_COMPARAR
          ? prev
          : [...prev, id],
    );

  const comparadas = propiedades.filter((p) => comparar.includes(p.id));

  return (
    <>
      {/* ── Filtros ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_auto_auto] lg:items-end lg:gap-8">
          <fieldset>
            <legend className="eyebrow mb-3">Zona</legend>
            <div className="flex flex-wrap gap-2">
              {["todas", ...ZONAS].map((z) => (
                <button
                  key={z}
                  onClick={() => transicionar(() => setZona(z))}
                  aria-pressed={zona === z}
                  className={`min-h-11 rounded-full border px-4 text-sm transition-colors duration-300 ${
                    zona === z
                      ? "border-accent bg-accent text-accent-fg"
                      : "border-line text-muted hover:border-fg/40 hover:text-fg"
                  }`}
                >
                  {z === "todas" ? "Todas" : z}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="eyebrow mb-3">Recámaras</legend>
            <div className="flex gap-2">
              {[0, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => transicionar(() => setRecamaras(n))}
                  aria-pressed={recamaras === n}
                  className={`min-h-11 min-w-11 rounded-full border px-4 text-sm tabular-nums transition-colors duration-300 ${
                    recamaras === n
                      ? "border-accent bg-accent text-accent-fg"
                      : "border-line text-muted hover:border-fg/40 hover:text-fg"
                  }`}
                >
                  {n === 0 ? "Todas" : `${n}+`}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="lg:min-w-56">
            <label htmlFor="precio" className="eyebrow mb-3 block">
              Hasta {precioCorto(precioMax)}
            </label>
            <input
              id="precio"
              type="range"
              min={PISO}
              max={TOPE}
              step={1_000_000}
              value={precioMax}
              onChange={(e) => setPrecioMax(Number(e.target.value))}
              className="h-11 w-full cursor-pointer accent-[var(--site-accent)]"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
          <p className="text-sm text-muted" aria-live="polite">
            <span className="font-medium text-fg tabular-nums">
              {resultados.length}
            </span>{" "}
            {resultados.length === 1 ? "residencia" : "residencias"}
            {hayFiltros && (
              <button
                onClick={limpiar}
                className="ml-3 underline underline-offset-4 transition-colors hover:text-accent"
              >
                Limpiar filtros
              </button>
            )}
          </p>

          <div className="flex items-center gap-2">
            <label htmlFor="orden" className="text-sm text-faint">
              Ordenar
            </label>
            <select
              id="orden"
              value={orden}
              onChange={(e) => transicionar(() => setOrden(e.target.value as Orden))}
              className="min-h-11 rounded-full border border-line bg-bg px-4 text-sm text-fg"
            >
              {ORDENES.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Resultados ──────────────────────────────────────── */}
      {resultados.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-20 text-center">
          <p className="font-display text-2xl">Ninguna residencia coincide</p>
          <p className="mt-2 text-sm text-muted">
            Prueba ampliando el rango de precio o cambiando de zona.
          </p>
          <button
            onClick={limpiar}
            className="mt-6 min-h-11 rounded-full bg-accent px-6 text-sm text-accent-fg transition-opacity hover:opacity-90"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resultados.map((p) => (
            <li key={p.id} className="flex">
              <div className="w-full">
                <TarjetaPropiedad
                  p={p}
                  onVerGaleria={() => setGaleria(p)}
                  comparando={comparar.includes(p.id)}
                  onComparar={() => alternarComparar(p.id)}
                  comparadorLleno={comparar.length >= MAX_COMPARAR}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ── Comparador ──────────────────────────────────────── */}
      {comparadas.length > 0 && (
        <section
          aria-label="Comparador de residencias"
          className="mt-14 overflow-hidden rounded-2xl border border-line bg-surface"
        >
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-7">
            <h3 className="font-display text-xl">
              Comparando {comparadas.length} de {MAX_COMPARAR}
            </h3>
            <button
              onClick={() => setComparar([])}
              className="min-h-11 text-sm text-muted underline underline-offset-4 transition-colors hover:text-accent"
            >
              Vaciar comparador
            </button>
          </header>

          {/* En móvil se desplaza en horizontal con anclaje: una
              columna por residencia, siempre legible. */}
          <div className="no-scrollbar overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <thead>
                <tr>
                  <th scope="col" className="sr-only">
                    Característica
                  </th>
                  {comparadas.map((p) => (
                    <th
                      key={p.id}
                      scope="col"
                      className="border-b border-line px-4 py-4 text-left align-bottom"
                    >
                      <span className="eyebrow block">{p.zona}</span>
                      <span className="mt-1 block font-display text-lg font-normal">
                        {p.nombre}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["Precio", (p: Propiedad) => formatoMXN.format(p.precio)],
                    ["Recámaras", (p: Propiedad) => String(p.recamaras)],
                    ["Baños", (p: Propiedad) => String(p.banos)],
                    ["Construcción", (p: Propiedad) => `${p.construccion} m²`],
                    ["Terreno", (p: Propiedad) => `${p.terreno} m²`],
                    [
                      "Precio por m²",
                      (p: Propiedad) =>
                        formatoMXN.format(Math.round(p.precio / p.construccion)),
                    ],
                    ["Año", (p: Propiedad) => String(p.ano)],
                    ["Arquitecto", (p: Propiedad) => p.arquitecto],
                  ] as const
                ).map(([etiqueta, valor]) => (
                  <tr key={etiqueta} className="border-b border-line/60 last:border-0">
                    <th
                      scope="row"
                      className="w-32 px-4 py-3 text-left text-[0.72rem] font-normal tracking-wide text-faint uppercase"
                    >
                      {etiqueta}
                    </th>
                    {comparadas.map((p) => (
                      <td key={p.id} className="px-4 py-3 tabular-nums">
                        {valor(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* key por propiedad: al abrir otra galería el visor se remonta y
          el índice arranca en cero sin sincronizar estado a mano. */}
      <Lightbox
        key={galeria?.id ?? "cerrado"}
        propiedad={galeria}
        onCerrar={() => setGaleria(null)}
      />
    </>
  );
}
