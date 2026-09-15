/**
 * Escalas.
 *
 * Una escala mapea el dominio de los datos al rango de píxeles del SVG.
 * Son funciones puras, sin React y sin DOM: se pueden usar tanto en el
 * render del servidor como dentro de un manejador de puntero.
 */

export type Escala = ((valor: number) => number) & {
  readonly dominio: readonly [number, number];
  readonly rango: readonly [number, number];
  /** El camino de vuelta: de píxel a valor. Lo usa el crosshair. */
  invertir(pixel: number): number;
};

export function escalaLineal(
  dominio: readonly [number, number],
  rango: readonly [number, number],
): Escala {
  const [d0, d1] = dominio;
  const [r0, r1] = rango;
  // Un dominio de ancho cero mandaría todo a Infinity; se colapsa al inicio.
  const ancho = d1 - d0 || 1;

  const fn = (v: number) => r0 + ((v - d0) / ancho) * (r1 - r0);

  return Object.assign(fn, {
    dominio,
    rango,
    invertir: (px: number) => d0 + ((px - r0) / (r1 - r0 || 1)) * ancho,
  });
}

export type EscalaBanda = ((clave: string) => number) & {
  readonly ancho: number;
  readonly paso: number;
};

/**
 * Escala de banda para ejes categóricos.
 *
 * `separacion` es la fracción del paso que se deja en blanco entre barras:
 * 0.2 significa barras del 80% del paso.
 */
export function escalaBanda(
  claves: readonly string[],
  rango: readonly [number, number],
  separacion = 0.2,
): EscalaBanda {
  const [r0, r1] = rango;
  const paso = (r1 - r0) / (claves.length || 1);
  const ancho = paso * (1 - separacion);
  const indices = new Map(claves.map((k, i) => [k, i]));

  const fn = (clave: string) => {
    const i = indices.get(clave);
    return i === undefined ? r0 : r0 + i * paso + (paso - ancho) / 2;
  };

  return Object.assign(fn, { ancho, paso });
}

/** Mínimo y máximo de una lista, en una sola pasada. */
export function extension(valores: readonly number[]): [number, number] {
  if (valores.length === 0) return [0, 1];
  let min = valores[0];
  let max = valores[0];
  for (const v of valores) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return [min, max];
}

/**
 * Ticks en números redondos.
 *
 * Dividir el dominio en partes iguales produce ejes como 0 · 3.7 · 7.4 —
 * correctos y a la vez ilegibles. El truco clásico es redondear el paso a
 * 1, 2, 5 o 10 por la magnitud correspondiente, de modo que las marcas
 * caigan siempre en cifras que la vista reconoce.
 */
export function ticksBonitos(min: number, max: number, cuenta = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return [min];
  }

  const crudo = (max - min) / cuenta;
  const magnitud = 10 ** Math.floor(Math.log10(crudo));
  const normal = crudo / magnitud;
  const paso =
    magnitud * (normal <= 1 ? 1 : normal <= 2 ? 2 : normal <= 5 ? 5 : 10);

  // Los decimales significativos del paso: con paso 0.25 son 2, con
  // paso 2500 son 0. Sirven para limpiar el residuo de punto flotante.
  const decimales = Math.max(0, -Math.floor(Math.log10(paso)));
  const inicio = Math.ceil(min / paso) * paso;
  const cuantos = Math.floor((max - inicio) / paso + 1e-9);

  const ticks: number[] = [];
  for (let i = 0; i <= cuantos; i++) {
    // Multiplicar por el índice y no acumular con t += paso: el acumulado
    // arrastra error y produce ejes con 0.30000000000000004.
    ticks.push(Number((inicio + i * paso).toFixed(decimales)));
  }

  return ticks;
}

/**
 * Índice del punto más cercano a una posición, por bisección.
 *
 * El crosshair pregunta esto en cada movimiento del puntero. Recorrer el
 * arreglo funcionaría con 120 puntos, pero la bisección lo resuelve en
 * ~7 comparaciones y deja el manejador trivialmente barato.
 */
export function indiceCercano(
  posiciones: readonly number[],
  objetivo: number,
): number {
  if (posiciones.length === 0) return -1;

  let bajo = 0;
  let alto = posiciones.length - 1;

  while (alto - bajo > 1) {
    const medio = (bajo + alto) >> 1;
    if (posiciones[medio] < objetivo) bajo = medio;
    else alto = medio;
  }

  return Math.abs(posiciones[bajo] - objetivo) <=
    Math.abs(posiciones[alto] - objetivo)
    ? bajo
    : alto;
}
