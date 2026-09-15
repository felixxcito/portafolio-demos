"use client";

import { useMemo, useState } from "react";
import * as fmt from "@/lib/grafica/formato";
import { aCsv, descargar } from "@/lib/grafica/csv";
import { useDebounce } from "@/lib/hooks/useDebounce";
import type { Linea, Metrica } from "@/lib/data/cifra";
import { Chispa } from "./Chispa";

type Campo = "sucursal" | "categoria" | "valor" | "delta" | "ticketPromedio";
type Orden = { campo: Campo; dir: "asc" | "desc" };

const POR_PAGINA = 8;

const COLUMNAS: { campo: Campo; titulo: string; num?: boolean }[] = [
  { campo: "sucursal", titulo: "Sucursal" },
  { campo: "categoria", titulo: "Categoría" },
  { campo: "valor", titulo: "Valor", num: true },
  { campo: "delta", titulo: "Δ periodo", num: true },
  { campo: "ticketPromedio", titulo: "Ticket prom.", num: true },
];

/** Quita acentos para que "merida" encuentre "Mérida". */
function normalizar(s: string): string {
  // La clase \p{Diacritic} necesitaría target ES2018; el rango de marcas
  // combinantes hace lo mismo y compila con el ES2017 de este proyecto.
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function TablaSucursales({
  datos,
  metrica,
}: {
  datos: Linea[];
  metrica: Metrica;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<Orden>({ campo: "valor", dir: "desc" });
  const [pagina, setPagina] = useState(0);

  // El input muestra el valor inmediato; el filtro corre sobre el diferido.
  const termino = useDebounce(busqueda, 200);

  const filtradas = useMemo(() => {
    const q = normalizar(termino.trim());

    const base = q
      ? datos.filter((d) =>
          normalizar(`${d.sucursal} ${d.ciudad} ${d.categoria}`).includes(q),
        )
      : datos;

    const signo = orden.dir === "asc" ? 1 : -1;

    return [...base].sort((a, b) => {
      const x = a[orden.campo];
      const y = b[orden.campo];
      // Las columnas de texto se comparan con localeCompare para que la ñ
      // y los acentos caigan donde un lector en español los espera.
      return typeof x === "string" && typeof y === "string"
        ? signo * x.localeCompare(y, "es-MX")
        : signo * ((x as number) - (y as number));
    });
  }, [datos, termino, orden]);

  const paginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  // Al reducirse los resultados la página actual puede quedar fuera de
  // rango; acotar aquí evita una tabla vacía sin tener que sincronizar
  // dos estados.
  const actual = Math.min(pagina, paginas - 1);
  const visibles = filtradas.slice(
    actual * POR_PAGINA,
    actual * POR_PAGINA + POR_PAGINA,
  );

  const ordenarPor = (campo: Campo) => {
    setOrden((o) =>
      o.campo === campo
        ? { campo, dir: o.dir === "asc" ? "desc" : "asc" }
        : { campo, dir: campo === "sucursal" || campo === "categoria" ? "asc" : "desc" },
    );
    setPagina(0);
  };

  const exportar = () => {
    // Se exporta lo filtrado y ordenado completo, no la página visible:
    // quien descarga quiere su consulta, no lo que cabía en pantalla.
    const csv = aCsv(
      ["Sucursal", "Ciudad", "Categoría", "Valor", "Delta", "Ticket promedio"],
      filtradas.map((d) => [
        d.sucursal,
        d.ciudad,
        d.categoria,
        Math.round(d.valor),
        d.delta.toFixed(4),
        Math.round(d.ticketPromedio),
      ]),
    );
    descargar(`cifra-${metrica}-${filtradas.length}-lineas.csv`, csv);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex-1 basis-56">
          <span className="sr-only">Buscar sucursal o categoría</span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(0);
            }}
            placeholder="Buscar sucursal, ciudad o categoría…"
            className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-fg placeholder:text-faint"
          />
        </label>

        <button
          type="button"
          onClick={exportar}
          className="rounded-lg border border-line px-3 py-2 text-sm text-muted transition-colors hover:text-fg"
        >
          Exportar CSV
        </button>
      </div>

      <p aria-live="polite" className="sr-only">
        {`${filtradas.length} líneas encontradas.`}
      </p>

      <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <caption className="sr-only">
            Líneas de negocio por sucursal y categoría
          </caption>
          <thead>
            <tr className="border-b border-line">
              {COLUMNAS.map((c) => {
                const activa = orden.campo === c.campo;
                return (
                  <th
                    key={c.campo}
                    scope="col"
                    /* aria-sort es lo que permite a un lector de pantalla
                       anunciar el orden actual sin tener que inferirlo. */
                    aria-sort={
                      activa
                        ? orden.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className={`py-2 font-medium ${c.num ? "text-right" : "text-left"}`}
                  >
                    <button
                      type="button"
                      onClick={() => ordenarPor(c.campo)}
                      className={`inline-flex items-center gap-1 transition-colors hover:text-fg ${
                        activa ? "text-fg" : "text-muted"
                      }`}
                    >
                      {c.titulo}
                      <span aria-hidden className="text-[0.65rem]">
                        {activa ? (orden.dir === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </button>
                  </th>
                );
              })}
              <th scope="col" className="py-2 text-right font-medium text-muted">
                Tendencia
              </th>
            </tr>
          </thead>

          <tbody>
            {visibles.map((d) => {
              const sube = d.delta >= 0;
              return (
                <tr key={d.id} className="border-b border-line/60">
                  <th scope="row" className="py-2.5 text-left font-normal">
                    {d.sucursal}
                    <span className="block text-xs text-faint">{d.ciudad}</span>
                  </th>
                  <td className="py-2.5 text-muted">{d.categoria}</td>
                  <td className="numerico py-2.5 text-right">
                    {fmt.porMetrica(d.valor, metrica)}
                  </td>
                  <td
                    className="numerico py-2.5 text-right"
                    style={{ color: sube ? "var(--positivo)" : "var(--negativo)" }}
                  >
                    {fmt.delta(d.delta)}
                  </td>
                  <td className="numerico py-2.5 text-right text-muted">
                    {fmt.pesos(d.ticketPromedio)}
                  </td>
                  <td className="py-2.5">
                    <div className="ml-auto h-7 w-24">
                      <Chispa
                        valores={d.chispa}
                        relleno={false}
                        color={sube ? "var(--positivo)" : "var(--negativo)"}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}

            {visibles.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-muted">
                  Ninguna línea coincide con «{termino}».
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {paginas > 1 && (
        <nav
          aria-label="Paginación de la tabla"
          className="mt-4 flex items-center justify-between gap-3 text-sm"
        >
          <button
            type="button"
            onClick={() => setPagina(actual - 1)}
            disabled={actual === 0}
            className="rounded-lg border border-line px-3 py-1.5 text-muted transition-colors enabled:hover:text-fg disabled:opacity-40"
          >
            Anterior
          </button>

          <span className="numerico text-faint">
            {actual + 1} / {paginas}
          </span>

          <button
            type="button"
            onClick={() => setPagina(actual + 1)}
            disabled={actual >= paginas - 1}
            className="rounded-lg border border-line px-3 py-1.5 text-muted transition-colors enabled:hover:text-fg disabled:opacity-40"
          >
            Siguiente
          </button>
        </nav>
      )}
    </div>
  );
}
