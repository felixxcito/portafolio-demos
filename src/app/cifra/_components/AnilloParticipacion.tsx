"use client";

import { useMemo, useState } from "react";
import { rutaArco } from "@/lib/grafica/rutas";
import * as fmt from "@/lib/grafica/formato";
import type { Metrica, ResumenSucursal } from "@/lib/data/cifra";

type Props = {
  datos: ResumenSucursal[];
  metrica: Metrica;
  sucursalActiva: string;
  onSucursal: (id: string) => void;
};

const LADO = 220;
const RADIO = 96;
const GROSOR = 26;
const CENTRO = LADO / 2;

/**
 * Anillo de participación por sucursal.
 *
 * Los arcos se construyen con rutaArco, que convierte grados a comandos de
 * path. Cada segmento filtra el tablero al hacer clic, igual que las barras.
 */
export function AnilloParticipacion({
  datos,
  metrica,
  sucursalActiva,
  onSucursal,
}: Props) {
  const [resaltada, setResaltada] = useState<string | null>(null);

  const arcos = useMemo(() => {
    const total = datos.reduce((a, d) => a + d.valor, 0) || 1;
    const salida: (ResumenSucursal & { d: string; color: string })[] = [];

    // Bucle plano y no .map(): el acumulador de ángulos tiene que quedar
    // contenido en este cálculo y no en el closure de una devolución de
    // llamada, que es donde el compilador de React —con razón— no puede
    // garantizar cuándo se ejecuta.
    let grado = 0;
    for (let i = 0; i < datos.length; i++) {
      const d = datos[i];
      const inicio = grado;
      grado += (d.valor / total) * 360;
      salida.push({
        ...d,
        // Un grado de separación entre segmentos; el anillo se lee como
        // partes y no como una rueda continua.
        d: rutaArco(CENTRO, CENTRO, RADIO, GROSOR, inicio, grado - 1),
        color: `var(--serie-${(i % 6) + 1})`,
      });
    }

    return salida;
  }, [datos]);

  const foco = resaltada ?? (sucursalActiva !== "todas" ? sucursalActiva : null);
  const centro = foco ? datos.find((d) => d.id === foco) : null;
  const total = datos.reduce((a, d) => a + d.valor, 0);

  return (
    <figure className="m-0 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative shrink-0">
        <svg
          viewBox={`0 0 ${LADO} ${LADO}`}
          width={LADO}
          height={LADO}
          role="img"
          aria-label="Participación por sucursal. Hay una tabla equivalente a continuación."
        >
          {arcos.map((a) => {
            const hayFiltro = sucursalActiva !== "todas";
            const atenuado =
              (hayFiltro && sucursalActiva !== a.id) ||
              (resaltada !== null && resaltada !== a.id);

            return (
              <path
                key={a.id}
                d={a.d}
                fill={a.color}
                opacity={atenuado ? 0.22 : 1}
                className="cursor-pointer transition-opacity duration-200"
                onClick={() =>
                  onSucursal(sucursalActiva === a.id ? "todas" : a.id)
                }
                onPointerEnter={() => setResaltada(a.id)}
                onPointerLeave={() => setResaltada(null)}
              >
                <title>{`${a.nombre}: ${fmt.porcentaje(a.participacion)}`}</title>
              </path>
            );
          })}
        </svg>

        {/* El centro cambia según lo que se señale: total o sucursal. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[0.62rem] tracking-wide text-faint uppercase">
            {centro ? centro.nombre : "Total"}
          </span>
          <span className="numerico mt-0.5 text-lg font-medium">
            {centro
              ? fmt.porcentaje(centro.participacion)
              : fmt.porMetrica(total, metrica, true)}
          </span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-1">
        {arcos.map((a) => {
          const seleccionada = sucursalActiva === a.id;
          return (
            <li key={a.id}>
              <button
                type="button"
                aria-pressed={seleccionada}
                onClick={() => onSucursal(seleccionada ? "todas" : a.id)}
                onPointerEnter={() => setResaltada(a.id)}
                onPointerLeave={() => setResaltada(null)}
                className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                  seleccionada ? "bg-accent-soft" : "hover:bg-elevated"
                }`}
              >
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-[3px]"
                  style={{ background: a.color }}
                />
                <span className="min-w-0 flex-1 truncate">{a.nombre}</span>
                <span className="numerico shrink-0 text-muted">
                  {fmt.porcentaje(a.participacion)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <figcaption className="sr-only">
        <table>
          <caption>Participación por sucursal</caption>
          <thead>
            <tr>
              <th scope="col">Sucursal</th>
              <th scope="col">Valor</th>
              <th scope="col">Participación</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((d) => (
              <tr key={d.id}>
                <th scope="row">{d.nombre}</th>
                <td>{fmt.porMetrica(d.valor, metrica)}</td>
                <td>{fmt.porcentaje(d.participacion)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
