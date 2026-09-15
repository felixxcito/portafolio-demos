/**
 * Generadores de rutas SVG.
 *
 * Todo lo que dibuja una gráfica acaba siendo una cadena en el atributo
 * `d`. Estas funciones la construyen; nadie más en el código escribe
 * comandos de path a mano.
 */

export type Punto = { x: number; y: number };

const redondo = (n: number) => Math.round(n * 100) / 100;

/**
 * Curva suave que pasa por todos los puntos.
 *
 * Catmull-Rom interpola (pasa por los puntos, no los aproxima), pero SVG
 * sólo entiende Bézier. La conversión es directa: para el tramo p1→p2, los
 * controles se apoyan en las pendientes de los vecinos.
 *
 *   c1 = p1 + (p2 - p0) · t
 *   c2 = p2 - (p3 - p1) · t     con t = 1/6 para la curva estándar
 *
 * El detalle que casi nadie corrige: ante un pico brusco esa fórmula se
 * pasa de largo y la curva sale del rango de sus propios extremos —el área
 * llega a meterse debajo del eje. Acotar la Y de los controles al tramo
 * elimina el sobretiro sin endurecer la curva donde los datos son suaves.
 */
export function rutaSuave(puntos: readonly Punto[], tension = 1 / 6): string {
  if (puntos.length === 0) return "";
  if (puntos.length === 1) return `M ${redondo(puntos[0].x)},${redondo(puntos[0].y)}`;

  let d = `M ${redondo(puntos[0].x)},${redondo(puntos[0].y)}`;

  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[i - 1] ?? puntos[i];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[i + 2] ?? p2;

    const yMin = Math.min(p1.y, p2.y);
    const yMax = Math.max(p1.y, p2.y);
    const acotar = (y: number) => Math.min(yMax, Math.max(yMin, y));

    const c1x = p1.x + (p2.x - p0.x) * tension;
    const c1y = acotar(p1.y + (p2.y - p0.y) * tension);
    const c2x = p2.x - (p3.x - p1.x) * tension;
    const c2y = acotar(p2.y - (p3.y - p1.y) * tension);

    d += ` C ${redondo(c1x)},${redondo(c1y)} ${redondo(c2x)},${redondo(c2y)} ${redondo(p2.x)},${redondo(p2.y)}`;
  }

  return d;
}

/** La misma curva, cerrada contra una línea base para rellenarla. */
export function rutaArea(
  puntos: readonly Punto[],
  yBase: number,
  tension = 1 / 6,
): string {
  if (puntos.length === 0) return "";
  const linea = rutaSuave(puntos, tension);
  const ultimo = puntos[puntos.length - 1];
  return `${linea} L ${redondo(ultimo.x)},${redondo(yBase)} L ${redondo(puntos[0].x)},${redondo(yBase)} Z`;
}

/** Línea recta entre puntos, sin suavizado. Para sparklines diminutas. */
export function rutaRecta(puntos: readonly Punto[]): string {
  if (puntos.length === 0) return "";
  return puntos
    .map((p, i) => `${i === 0 ? "M" : "L"} ${redondo(p.x)},${redondo(p.y)}`)
    .join(" ");
}

const polar = (cx: number, cy: number, r: number, grados: number): Punto => {
  // -90° para que el cero quede arriba, que es como se lee un anillo.
  const rad = ((grados - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

/**
 * Segmento de anillo.
 *
 * Se dibuja como un arco exterior, una línea al radio interior, el arco de
 * vuelta y el cierre. `largeArcFlag` se activa pasados los 180°, que es la
 * condición que pide la especificación de SVG.
 */
export function rutaArco(
  cx: number,
  cy: number,
  radio: number,
  grosor: number,
  gradoInicio: number,
  gradoFin: number,
): string {
  const rExt = radio;
  const rInt = radio - grosor;
  // 360° exactos dejarían inicio y fin en el mismo punto y el arco
  // desaparecería; se recorta un pelo para que siempre haya recorrido.
  const fin = gradoFin - gradoInicio >= 360 ? gradoInicio + 359.99 : gradoFin;

  const e1 = polar(cx, cy, rExt, gradoInicio);
  const e2 = polar(cx, cy, rExt, fin);
  const i1 = polar(cx, cy, rInt, fin);
  const i2 = polar(cx, cy, rInt, gradoInicio);
  const largo = fin - gradoInicio > 180 ? 1 : 0;

  return [
    `M ${redondo(e1.x)},${redondo(e1.y)}`,
    `A ${rExt} ${rExt} 0 ${largo} 1 ${redondo(e2.x)},${redondo(e2.y)}`,
    `L ${redondo(i1.x)},${redondo(i1.y)}`,
    `A ${rInt} ${rInt} 0 ${largo} 0 ${redondo(i2.x)},${redondo(i2.y)}`,
    "Z",
  ].join(" ");
}
