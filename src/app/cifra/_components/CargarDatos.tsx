"use client";

import { useCallback, useId, useRef, useState } from "react";
import {
  conjuntoDemo,
  conjuntoDesdeFilas,
  type Conjunto,
} from "@/lib/data/cifra";
import {
  construirFilas,
  detectarColumnas,
  ETIQUETAS,
  OBLIGATORIOS,
  parsearCsv,
  PLANTILLA,
  type Campo,
  type Mapeo,
} from "@/lib/data/importar";
import { descargar } from "@/lib/grafica/csv";

type Props = {
  conjunto: Conjunto;
  onConjunto: (c: Conjunto) => void;
};

const CAMPOS = Object.keys(ETIQUETAS) as Campo[];
const LIMITE_BYTES = 12 * 1024 * 1024;

/**
 * Carga de un CSV propio.
 *
 * El archivo se lee y se procesa en el navegador: nunca sale de la máquina
 * del visitante. Eso es lo que hace que se pueda probar con datos reales
 * sin firmar nada, y de paso quita del medio la única razón por la que esta
 * demo necesitaría un servidor.
 */
export function CargarDatos({ conjunto, onConjunto }: Props) {
  const [encima, setEncima] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [tabla, setTabla] = useState<string[][] | null>(null);
  const [mapeo, setMapeo] = useState<Mapeo | null>(null);
  const [ajustando, setAjustando] = useState(false);

  const entrada = useRef<HTMLInputElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  /** Rearma el conjunto con el mapeo vigente. Se reusa al corregir columnas. */
  const aplicar = useCallback(
    (t: string[][], m: Mapeo, nombre: string) => {
      const faltan = OBLIGATORIOS.filter((c) => m[c] === null);
      if (faltan.length > 0) {
        setError(
          `Falta indicar ${faltan.map((c) => ETIQUETAS[c].toLowerCase()).join(" y ")}. Ajusta las columnas abajo.`,
        );
        return;
      }

      const { filas, metricas, avisos: nuevos } = construirFilas(t, m);

      if (filas.length === 0) {
        setError(
          "No se pudo leer ninguna fila. Revisa que la columna de fecha traiga fechas y la de ingresos, números.",
        );
        return;
      }

      setError(null);
      setAvisos(nuevos);
      onConjunto(conjuntoDesdeFilas(filas, nombre, metricas));
    },
    [onConjunto],
  );

  const procesar = useCallback(
    async (archivo: File) => {
      setError(null);
      setAvisos([]);

      if (archivo.size > LIMITE_BYTES) {
        setError("El archivo pasa de 12 MB. Recórtalo a un periodo más corto.");
        return;
      }

      const texto = await archivo.text();
      const t = parsearCsv(texto);

      if (t.length < 2) {
        setError("El archivo no trae encabezados y al menos una fila de datos.");
        return;
      }

      const m = detectarColumnas(t[0]);
      setTabla(t);
      setMapeo(m);
      setAjustando(OBLIGATORIOS.some((c) => m[c] === null));
      aplicar(t, m, archivo.name);
    },
    [aplicar],
  );

  const volverALaDemo = () => {
    setTabla(null);
    setMapeo(null);
    setAvisos([]);
    setError(null);
    setAjustando(false);
    if (entrada.current) entrada.current.value = "";
    onConjunto(conjuntoDemo());
  };

  const cargado = conjunto.origen === "archivo";

  return (
    <section
      aria-label="Cargar tus propios datos"
      className="rounded-xl border border-line bg-surface p-4 sm:p-5"
    >
      {!cargado ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setEncima(true);
          }}
          onDragLeave={() => setEncima(false)}
          onDrop={(e) => {
            e.preventDefault();
            setEncima(false);
            const archivo = e.dataTransfer.files[0];
            if (archivo) void procesar(archivo);
          }}
          className={`flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-8 text-center transition-colors ${
            encima ? "border-accent bg-accent-soft" : "border-line"
          }`}
        >
          <p className="text-sm font-medium">Pruébalo con tus datos</p>
          <p className="max-w-[46ch] text-sm text-muted">
            Arrastra un CSV de ventas y el tablero completo se redibuja con tus
            números. Se procesa en tu navegador: el archivo no se sube a ningún
            lado.
          </p>

          <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
            <label
              htmlFor={`archivo-${uid}`}
              className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              Elegir archivo
            </label>
            <input
              ref={entrada}
              id={`archivo-${uid}`}
              type="file"
              accept=".csv,text/csv,text/plain"
              onChange={(e) => {
                const archivo = e.target.files?.[0];
                if (archivo) void procesar(archivo);
              }}
              className="sr-only"
            />

            <button
              type="button"
              onClick={() => descargar("plantilla-cifra.csv", PLANTILLA)}
              className="rounded-lg border border-line px-4 py-2 text-sm text-muted transition-colors hover:text-fg"
            >
              Descargar plantilla
            </button>
          </div>

          <p className="text-xs text-faint">
            Sólo hacen falta fecha e ingresos. Sucursal, categoría, tickets,
            unidades y visitantes se detectan si vienen.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">
              Tus datos ·{" "}
              <span className="text-muted">{conjunto.nombreArchivo}</span>
            </p>
            <p className="numerico mt-1 text-xs text-faint">
              {conjunto.filas.length.toLocaleString("es-MX")} filas ·{" "}
              {conjunto.dias} días · {conjunto.sucursales.length} sucursales ·{" "}
              {conjunto.categorias.length} categorías
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAjustando((a) => !a)}
              aria-expanded={ajustando}
              className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg"
            >
              Ajustar columnas
            </button>
            <button
              type="button"
              onClick={volverALaDemo}
              className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg"
            >
              Volver a la demo
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm" style={{ color: "var(--negativo)" }}>
          {error}
        </p>
      )}

      {avisos.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-faint">
          {avisos.map((a) => (
            <li key={a}>· {a}</li>
          ))}
        </ul>
      )}

      {/* Corrección manual del mapeo. La detección automática acierta casi
          siempre, pero "Total" puede ser ingresos o unidades y sólo quien
          trajo el archivo lo sabe. */}
      {ajustando && tabla && mapeo && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-sm font-medium">Qué columna es cada cosa</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CAMPOS.map((campo) => (
              <label key={campo} className="block text-sm">
                <span className="block text-xs text-muted">
                  {ETIQUETAS[campo]}
                  {OBLIGATORIOS.includes(campo) && (
                    <span className="text-accent"> *</span>
                  )}
                </span>
                <select
                  value={mapeo[campo] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    const siguiente: Mapeo = {
                      ...mapeo,
                      [campo]: v === "" ? null : Number(v),
                    };
                    setMapeo(siguiente);
                    aplicar(tabla, siguiente, conjunto.nombreArchivo ?? "datos.csv");
                  }}
                  className="mt-1 w-full rounded-lg border border-line bg-bg px-2 py-1.5 text-sm text-fg"
                >
                  <option value="">— ninguna —</option>
                  {tabla[0].map((h, i) => (
                    <option key={`${h}-${i}`} value={i}>
                      {h.trim() || `Columna ${i + 1}`}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
