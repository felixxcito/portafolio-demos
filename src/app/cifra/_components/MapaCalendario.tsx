"use client";

import { useMemo } from "react";
import * as fmt from "@/lib/grafica/formato";
import type { Metrica, PuntoSerie } from "@/lib/data/cifra";

type Props = { puntos: PuntoSerie[]; metrica: Metrica };

const CELDA = 12;
const HUECO = 3;
const PASO = CELDA + HUECO;
const IZQ = 22;
const ARRIBA = 18;

/**
 * Mapa de calor por día.
 *
 * Una columna por semana, una fila por día de la semana. Es la vista que
 * revela lo que una línea esconde: qué días de la semana cargan el negocio
 * y dónde cayeron los picos de temporada.
 */
export function MapaCalendario({ puntos, metrica }: Props) {
  const { celdas, semanas, cortes, meses } = useMemo(() => {
    if (puntos.length === 0) {
      return { celdas: [], semanas: 0, cortes: [] as number[], meses: [] };
    }

    /**
     * Los cortes son cuartiles de la distribución, no fracciones del
     * máximo. Con datos sesgados —y las ventas siempre lo están— repartir
     * el color linealmente deja casi todo en el tono más pálido y sólo la
     * Navidad encendida. Por cuartiles cada tono cubre un cuarto de los
     * días y el mapa vuelve a tener contraste.
     */
    const ordenados = [...puntos.map((p) => p.valor)].sort((a, b) => a - b);
    const q = (f: number) => ordenados[Math.floor((ordenados.length - 1) * f)];
    const cortes = [q(0.25), q(0.5), q(0.75), q(0.9)];

    const primero = new Date(`${puntos[0].fecha}T00:00:00Z`);
    // Se retrocede al domingo previo para que la primera columna esté
    // completa y las filas siempre signifiquen el mismo día.
    const origen = new Date(primero);
    origen.setUTCDate(origen.getUTCDate() - origen.getUTCDay());

    const celdas = puntos.map((p) => {
      const d = new Date(`${p.fecha}T00:00:00Z`);
      const dias = Math.round((+d - +origen) / 86_400_000);
      return {
        fecha: p.fecha,
        valor: p.valor,
        semana: Math.floor(dias / 7),
        diaSemana: d.getUTCDay(),
        nivel:
          p.valor <= cortes[0]
            ? 1
            : p.valor <= cortes[1]
              ? 2
              : p.valor <= cortes[2]
                ? 3
                : 4,
      };
    });

    const semanas = Math.max(...celdas.map((c) => c.semana)) + 1;

    // Etiqueta de mes en la columna donde empieza cada uno.
    const meses: { semana: number; texto: string }[] = [];
    let ultimo = "";
    for (const c of celdas) {
      const mes = c.fecha.slice(0, 7);
      if (mes !== ultimo) {
        meses.push({ semana: c.semana, texto: fmt.mesCorto(c.fecha) });
        ultimo = mes;
      }
    }

    return { celdas, semanas, cortes, meses };
  }, [puntos]);

  if (celdas.length === 0) return null;

  const ancho = IZQ + semanas * PASO;
  const alto = ARRIBA + 7 * PASO;

  return (
    <figure className="m-0">
      <div className="no-scrollbar overflow-x-auto">
        <svg
          viewBox={`0 0 ${ancho} ${alto}`}
          width={ancho}
          height={alto}
          role="img"
          aria-label="Mapa de calor: intensidad por día. Hay una tabla equivalente a continuación."
          className="max-w-none"
        >
          {meses.map((m, i) => (
            <text
              key={`${m.texto}-${i}`}
              x={IZQ + m.semana * PASO}
              y={10}
              className="fill-[var(--site-faint)] text-[0.62rem]"
            >
              {m.texto}
            </text>
          ))}

          {["L", "M", "V"].map((d, i) => (
            <text
              key={d}
              x={0}
              y={ARRIBA + (i * 2 + 1) * PASO + CELDA / 2}
              dominantBaseline="middle"
              className="fill-[var(--site-faint)] text-[0.6rem]"
            >
              {d}
            </text>
          ))}

          {celdas.map((c) => (
            <rect
              key={c.fecha}
              x={IZQ + c.semana * PASO}
              y={ARRIBA + c.diaSemana * PASO}
              width={CELDA}
              height={CELDA}
              rx={2.5}
              fill={`var(--rampa-${c.nivel})`}
            >
              <title>
                {`${fmt.mayuscula(fmt.diaLargo(c.fecha))}: ${fmt.porMetrica(c.valor, metrica)}`}
              </title>
            </rect>
          ))}
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[0.7rem] text-faint">
        <span>Menos</span>
        {[0, 1, 2, 3, 4].map((n) => (
          <span
            key={n}
            aria-hidden
            className="size-3 rounded-[3px]"
            style={{ background: `var(--rampa-${n})` }}
          />
        ))}
        <span>Más</span>
        <span className="numerico ml-auto">
          Mediana {fmt.porMetrica(cortes[1], metrica, true)}
        </span>
      </div>

      <figcaption className="sr-only">
        <table>
          <caption>Intensidad diaria</caption>
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              <th scope="col">Valor</th>
            </tr>
          </thead>
          <tbody>
            {celdas.map((c) => (
              <tr key={c.fecha}>
                <th scope="row">{fmt.diaLargo(c.fecha)}</th>
                <td>{fmt.porMetrica(c.valor, metrica)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
