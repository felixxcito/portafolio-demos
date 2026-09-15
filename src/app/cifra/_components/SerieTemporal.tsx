"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import {
  escalaLineal,
  extension,
  indiceCercano,
  ticksBonitos,
} from "@/lib/grafica/escalas";
import { rutaArea, rutaSuave, type Punto } from "@/lib/grafica/rutas";
import * as fmt from "@/lib/grafica/formato";
import type { Metrica, PuntoSerie } from "@/lib/data/cifra";
import { useAncho } from "@/lib/hooks/useAncho";

type Props = {
  puntos: PuntoSerie[];
  metrica: Metrica;
  etiqueta: string;
};

/**
 * Ancho supuesto para el primer render.
 *
 * El servidor no puede medir el contenedor, así que dibuja a este ancho y
 * el SVG se escala al 100% mientras tanto. Cliente y servidor arrancan con
 * el mismo número —requisito para que la hidratación cuadre— y en cuanto
 * el ResizeObserver responde, el viewBox pasa al ancho real y el trazo
 * queda nítido.
 */
const ANCHO_BASE = 880;
const ALTO = 320;
const M = { arriba: 18, derecha: 18, abajo: 30, izquierda: 62 };

export function SerieTemporal({ puntos, metrica, etiqueta }: Props) {
  const [contenedor, medido] = useAncho<HTMLDivElement>();
  const [indice, setIndice] = useState<number | null>(null);
  /**
   * Anuncio separado del índice, y escrito sólo desde el teclado.
   *
   * Si la región viva siguiera al puntero, un lector de pantalla leería
   * sesenta valores por segundo al pasar el ratón por encima. El tooltip
   * visual sí sigue al puntero; la voz, no.
   */
  const [anuncio, setAnuncio] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  // Los ids de SVG son globales al documento: dos gráficas con el mismo
  // id de degradado se pisan y la segunda hereda el relleno de la primera.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  const ancho = medido || ANCHO_BASE;

  const geo = useMemo(() => {
    const valores = puntos.map((p) => p.valor);
    const [, max] = extension(valores);
    // El eje arranca en cero: truncarlo exageraría las diferencias, que es
    // la forma más común de mentir con una gráfica de área.
    const techo = max * 1.08 || 1;

    const x = escalaLineal(
      [0, Math.max(1, puntos.length - 1)],
      [M.izquierda, ancho - M.derecha],
    );
    const y = escalaLineal([0, techo], [ALTO - M.abajo, M.arriba]);

    const coords: Punto[] = puntos.map((p, i) => ({ x: x(i), y: y(p.valor) }));

    return {
      x,
      y,
      coords,
      posicionesX: coords.map((c) => c.x),
      ticks: ticksBonitos(0, techo, 4),
      linea: rutaSuave(coords),
      area: rutaArea(coords, ALTO - M.abajo),
    };
  }, [puntos, ancho]);

  /** Etiquetas del eje X: unas pocas, repartidas y sin encimarse. */
  const marcasX = useMemo(() => {
    if (puntos.length === 0) return [];
    const cuantas = ancho < 560 ? 3 : ancho < 900 ? 5 : 7;
    const salto = Math.max(1, Math.floor((puntos.length - 1) / (cuantas - 1)));
    const idx: number[] = [];
    for (let i = 0; i < puntos.length; i += salto) idx.push(i);

    const ultimo = puntos.length - 1;
    if (idx[idx.length - 1] !== ultimo) {
      // La última marca del reparto puede caer pegada al final —con 90
      // puntos y salto 44 quedan el 88 y el 89 juntos— y las dos etiquetas
      // se encimarían. Si están demasiado cerca, gana la del extremo.
      if (ultimo - idx[idx.length - 1] < salto * 0.6) idx.pop();
      idx.push(ultimo);
    }

    return idx;
  }, [puntos.length, ancho]);

  const alMover = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const caja = svgRef.current?.getBoundingClientRect();
      if (!caja) return;
      // El SVG puede estar escalado si el ResizeObserver aún no responde;
      // la regla de tres devuelve la coordenada al sistema del viewBox.
      const px = ((e.clientX - caja.left) / caja.width) * ancho;
      setIndice(indiceCercano(geo.posicionesX, px));
    },
    [geo.posicionesX, ancho],
  );

  const alTeclear = useCallback(
    (e: React.KeyboardEvent) => {
      const ultimo = puntos.length - 1;
      const actual = indice ?? ultimo;
      let siguiente: number | null = null;

      if (e.key === "ArrowRight") siguiente = Math.min(ultimo, actual + 1);
      else if (e.key === "ArrowLeft") siguiente = Math.max(0, actual - 1);
      else if (e.key === "Home") siguiente = 0;
      else if (e.key === "End") siguiente = ultimo;
      else if (e.key === "Escape") {
        setIndice(null);
        setAnuncio("");
        return;
      }

      if (siguiente === null) return;

      e.preventDefault();
      setIndice(siguiente);

      const p = puntos[siguiente];
      setAnuncio(
        `${fmt.diaLargo(p.fecha)}: ${fmt.porMetrica(p.valor, metrica)}`,
      );
    },
    [indice, puntos, metrica],
  );

  const activo = indice !== null ? puntos[indice] : null;
  const coordActiva = indice !== null ? geo.coords[indice] : null;

  return (
    <figure className="m-0">
      <div ref={contenedor} className="relative" style={{ height: ALTO }}>
        {/*
          El foco y el teclado viven en este div, no en el <svg>.
          role="img" convierte el subárbol en una sola imagen para la
          tecnología asistiva, así que un svg con role="img" y tabIndex a la
          vez se contradice: sería un objeto enfocable sin nada dentro.
        */}
        <div
          tabIndex={0}
          role="group"
          aria-label={`${etiqueta}. Serie de ${puntos.length} puntos. Recórrela con las flechas; hay una tabla equivalente a continuación.`}
          onKeyDown={alTeclear}
          onBlur={() => {
            setIndice(null);
            setAnuncio("");
          }}
          className="rounded-lg outline-offset-4"
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${ancho} ${ALTO}`}
            width="100%"
            height={ALTO}
            role="img"
            aria-label={etiqueta}
            onPointerMove={alMover}
            onPointerLeave={() => setIndice(null)}
            className="touch-none"
          >
            <defs>
              <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--site-accent)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--site-accent)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Rejilla y eje Y */}
            {geo.ticks.map((t) => (
              <g key={t}>
                <line
                  x1={M.izquierda}
                  x2={ancho - M.derecha}
                  y1={geo.y(t)}
                  y2={geo.y(t)}
                  stroke="var(--site-line)"
                  strokeWidth={1}
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

            {/* Eje X */}
            {marcasX.map((i) => (
              <text
                key={i}
                x={geo.coords[i].x}
                y={ALTO - 8}
                textAnchor={
                  i === 0 ? "start" : i === puntos.length - 1 ? "end" : "middle"
                }
                className="fill-[var(--site-faint)] text-[0.68rem]"
              >
                {fmt.diaCorto(puntos[i].fecha)}
              </text>
            ))}

            <path d={geo.area} fill={`url(#grad-${uid})`} />
            <path
              key={geo.linea.length}
              d={geo.linea}
              pathLength={100}
              style={{ "--largo": 100 } as React.CSSProperties}
              fill="none"
              stroke="var(--site-accent)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="trazo-anim"
            />

            {/* Crosshair: un solo par de nodos que se reposicionan. */}
            {coordActiva && (
              <g pointerEvents="none">
                <line
                  x1={coordActiva.x}
                  x2={coordActiva.x}
                  y1={M.arriba}
                  y2={ALTO - M.abajo}
                  stroke="var(--site-accent)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.6}
                />
                <circle
                  cx={coordActiva.x}
                  cy={coordActiva.y}
                  r={5}
                  fill="var(--site-bg)"
                  stroke="var(--site-accent)"
                  strokeWidth={2.5}
                />
              </g>
            )}
          </svg>
        </div>

        {activo && coordActiva && (
          <div
            className="pointer-events-none absolute top-2 z-10 min-w-40 -translate-x-1/2 rounded-lg border border-line bg-surface/95 px-3 py-2 shadow-lg backdrop-blur"
            style={{
              // Acotado a los bordes para que no se salga del contenedor.
              left: `${Math.min(88, Math.max(12, (coordActiva.x / ancho) * 100))}%`,
            }}
          >
            <p className="text-[0.7rem] text-faint">
              {fmt.mayuscula(fmt.diaLargo(activo.fecha))}
            </p>
            <p className="numerico mt-0.5 text-base font-medium">
              {fmt.porMetrica(activo.valor, metrica)}
            </p>
          </div>
        )}
      </div>

      <p aria-live="polite" className="sr-only">
        {anuncio}
      </p>

      {/* La gráfica es una representación; esto es el dato. */}
      <figcaption className="sr-only">
        <table>
          <caption>{etiqueta}</caption>
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              <th scope="col">Valor</th>
            </tr>
          </thead>
          <tbody>
            {puntos.map((p) => (
              <tr key={p.fecha}>
                <th scope="row">{fmt.diaLargo(p.fecha)}</th>
                <td>{fmt.porMetrica(p.valor, metrica)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
