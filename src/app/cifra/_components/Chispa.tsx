import { escalaLineal, extension } from "@/lib/grafica/escalas";
import { rutaArea, rutaSuave, type Punto } from "@/lib/grafica/rutas";

type Props = {
  valores: readonly number[];
  color?: string;
  ancho?: number;
  alto?: number;
  relleno?: boolean;
};

/**
 * Sparkline.
 *
 * Sin ejes, sin etiquetas y sin interacción: sólo la forma de la serie,
 * para leerla de reojo junto a la cifra. Es un Server Component — no tiene
 * estado ni escucha eventos, así que no hay razón para enviarla al cliente.
 */
export function Chispa({
  valores,
  color = "var(--site-accent)",
  ancho = 120,
  alto = 34,
  relleno = true,
}: Props) {
  if (valores.length < 2) return null;

  const pad = 2;
  const [min, max] = extension(valores);
  const x = escalaLineal([0, valores.length - 1], [pad, ancho - pad]);
  // Un margen del 8% evita que el máximo toque el borde y se recorte el trazo.
  const margen = (max - min) * 0.08 || 1;
  const y = escalaLineal([min - margen, max + margen], [alto - pad, pad]);

  const puntos: Punto[] = valores.map((v, i) => ({ x: x(i), y: y(v) }));

  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      className="h-full w-full overflow-visible"
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      {relleno && (
        <path
          d={rutaArea(puntos, alto)}
          fill={color}
          opacity={0.12}
        />
      )}
      <path
        d={rutaSuave(puntos)}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
