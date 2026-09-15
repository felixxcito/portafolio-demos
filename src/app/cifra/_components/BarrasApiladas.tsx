"use client";

import { useMemo, useState } from "react";
import { escalaBanda, escalaLineal, ticksBonitos } from "@/lib/grafica/escalas";
import * as fmt from "@/lib/grafica/formato";
import {
  colorPorIndice,
  nombreEn,
  type Apilado,
  type Conjunto,
  type Metrica,
} from "@/lib/data/cifra";
import { useAncho } from "@/lib/hooks/useAncho";

type Props = {
  conjunto: Conjunto;
  datos: Apilado[];
  metrica: Metrica;
  categoriaActiva: string;
  onCategoria: (id: string) => void;
};

const ANCHO_BASE = 620;
const ALTO = 300;
const M = { arriba: 16, derecha: 12, abajo: 30, izquierda: 56 };

/**
 * Barras apiladas por mes y categoría.
 *
 * Cada segmento es un botón: al hacer clic filtra el tablero entero por esa
 * categoría, y volver a hacer clic lo quita. Es el cross-filtering de toda
 * la vida — la gráfica no sólo muestra el dato, también lo interroga.
 */
export function BarrasApiladas({
  conjunto,
  datos,
  metrica,
  categoriaActiva,
  onCategoria,
}: Props) {
  const [contenedor, medido] = useAncho<HTMLDivElement>();
  const color = (id: string) =>
    colorPorIndice(conjunto.categorias.findIndex((k) => k.id === id));
  const [resaltada, setResaltada] = useState<string | null>(null);
  const ancho = medido || ANCHO_BASE;

  const geo = useMemo(() => {
    const totales = datos.map((d) => d.partes.reduce((a, p) => a + p.valor, 0));
    const techo = Math.max(...totales, 1) * 1.06;

    const x = escalaBanda(
      datos.map((d) => d.periodo),
      [M.izquierda, ancho - M.derecha],
      datos.length > 12 ? 0.18 : 0.34,
    );
    const y = escalaLineal([0, techo], [ALTO - M.abajo, M.arriba]);

    return { x, y, ticks: ticksBonitos(0, techo, 4), totales };
  }, [datos, ancho]);

  // Con muchos meses las etiquetas se encinan; se muestra una de cada dos.
  const saltoEtiqueta = datos.length > (ancho < 520 ? 6 : 13) ? 2 : 1;

  return (
    <figure className="m-0">
      <div ref={contenedor} style={{ height: ALTO }}>
        <svg
          viewBox={`0 0 ${ancho} ${ALTO}`}
          width="100%"
          height={ALTO}
          role="img"
          aria-label={`Composición por categoría y mes. Hay una tabla equivalente a continuación.`}
        >
          {geo.ticks.map((t) => (
            <g key={t}>
              <line
                x1={M.izquierda}
                x2={ancho - M.derecha}
                y1={geo.y(t)}
                y2={geo.y(t)}
                stroke="var(--site-line)"
              />
              <text
                x={M.izquierda - 10}
                y={geo.y(t)}
                textAnchor="end"
                dominantBaseline="middle"
                className="numerico fill-[var(--site-faint)] text-[0.68rem]"
              >
                {fmt.porMetrica(t, metrica, true)}
              </text>
            </g>
          ))}

          {datos.map((d, iMes) => {
            let acumulado = 0;

            return (
              <g key={d.periodo}>
                {d.partes.map((parte, i) => {
                  const y0 = geo.y(acumulado);
                  acumulado += parte.valor;
                  const y1 = geo.y(acumulado);
                  const alto = Math.max(0, y0 - y1);

                  const seleccionada = categoriaActiva === parte.id;
                  const hayFiltro = categoriaActiva !== "todas";
                  const atenuada =
                    (hayFiltro && !seleccionada) ||
                    (resaltada !== null && resaltada !== parte.id);

                  return (
                    <rect
                      key={parte.id}
                      x={geo.x(d.periodo)}
                      y={y1}
                      width={geo.x.ancho}
                      height={alto}
                      fill={color(parte.id)}
                      opacity={atenuada ? 0.2 : 1}
                      className="crece-anim cursor-pointer transition-opacity duration-200"
                      style={{ animationDelay: `${iMes * 24 + i * 8}ms` }}
                      onClick={() =>
                        onCategoria(seleccionada ? "todas" : parte.id)
                      }
                      onPointerEnter={() => setResaltada(parte.id)}
                      onPointerLeave={() => setResaltada(null)}
                    >
                      <title>
                        {`${nombreEn(conjunto.categorias, parte.id)} · ${fmt.mayuscula(fmt.mesLargo(d.periodo))}: ${fmt.porMetrica(parte.valor, metrica)}`}
                      </title>
                    </rect>
                  );
                })}
              </g>
            );
          })}

          {datos.map((d, i) =>
            i % saltoEtiqueta === 0 ? (
              <text
                key={d.periodo}
                x={geo.x(d.periodo) + geo.x.ancho / 2}
                y={ALTO - 8}
                textAnchor="middle"
                className="fill-[var(--site-faint)] text-[0.68rem]"
              >
                {fmt.mesCorto(d.periodo)}
              </text>
            ) : null,
          )}
        </svg>
      </div>

      {/* Leyenda: mismos botones que los segmentos, pero alcanzables con
          teclado. Los rects del SVG son un atajo con el ratón, no la única
          vía para filtrar. */}
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {conjunto.categorias.map((c) => {
          const seleccionada = categoriaActiva === c.id;
          return (
            <li key={c.id}>
              <button
                type="button"
                aria-pressed={seleccionada}
                onClick={() => onCategoria(seleccionada ? "todas" : c.id)}
                onPointerEnter={() => setResaltada(c.id)}
                onPointerLeave={() => setResaltada(null)}
                className={`flex items-center gap-2 rounded-full px-2 py-1 text-xs transition-colors ${
                  seleccionada
                    ? "bg-accent-soft text-fg"
                    : "text-muted hover:text-fg"
                }`}
              >
                <span
                  aria-hidden
                  className="size-2.5 rounded-[3px]"
                  style={{ background: color(c.id) }}
                />
                {c.nombre}
              </button>
            </li>
          );
        })}
      </ul>

      <figcaption className="sr-only">
        <table>
          <caption>Composición por categoría y mes</caption>
          <thead>
            <tr>
              <th scope="col">Mes</th>
              {conjunto.categorias.map((c) => (
                <th key={c.id} scope="col">
                  {c.nombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.map((d) => (
              <tr key={d.periodo}>
                <th scope="row">{fmt.mesLargo(d.periodo)}</th>
                {d.partes.map((p) => (
                  <td key={p.id}>{fmt.porMetrica(p.valor, metrica)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
