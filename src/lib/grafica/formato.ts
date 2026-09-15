/**
 * Formato de cifras, en es-MX y en un solo lugar.
 *
 * Los formateadores de Intl son caros de construir y baratos de reusar, así
 * que se crean una vez a nivel de módulo en vez de dentro del render.
 */

const MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const MXN_CENTAVOS = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
});

const ENTERO = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 });

const UN_DECIMAL = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
});

const PORCENTAJE = new Intl.NumberFormat("es-MX", {
  style: "percent",
  maximumFractionDigits: 1,
});

const PORCENTAJE_FIRMADO = new Intl.NumberFormat("es-MX", {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

export const pesos = (n: number) => MXN.format(n);
export const pesosExactos = (n: number) => MXN_CENTAVOS.format(n);
export const entero = (n: number) => ENTERO.format(n);
/**
 * Notación compacta, escrita a mano.
 *
 * Intl con notation:"compact" parece la opción obvia, pero las unidades y
 * el espacio que las separa dependen de la versión de ICU: Node y el
 * navegador pueden devolver cadenas distintas para el mismo número —con
 * espacio fino en uno y normal en el otro—. En las etiquetas de un eje que
 * se renderiza en ambos lados, eso es una discrepancia de hidratación.
 * El formato decimal simple, en cambio, sí es estable.
 */
export function compacto(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${UN_DECIMAL.format(n / 1e9)} MM`;
  if (abs >= 1e6) return `${UN_DECIMAL.format(n / 1e6)} M`;
  if (abs >= 1e3) return `${UN_DECIMAL.format(n / 1e3)} k`;
  return ENTERO.format(n);
}
export const porcentaje = (n: number) => PORCENTAJE.format(n);
export const delta = (n: number) => PORCENTAJE_FIRMADO.format(n);

/** Formatea según la métrica: los pesos llevan símbolo, el resto no. */
export function porMetrica(n: number, metrica: string, corto = false): string {
  if (metrica === "ingresos" || metrica === "ticket") {
    return corto ? `$${compacto(n)}` : pesos(n);
  }
  return corto ? compacto(n) : entero(n);
}

/**
 * Las fechas se parsean como UTC a propósito.
 *
 * `new Date("2026-08-31")` ya es UTC, pero al formatear con la zona local
 * del navegador un usuario al oeste de Greenwich vería el día anterior. Fijar
 * timeZone: "UTC" hace que la etiqueta coincida con el dato en cualquier
 * huso, y que servidor y cliente impriman lo mismo.
 */
const DIA_CORTO = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const DIA_LARGO = new Intl.DateTimeFormat("es-MX", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const MES = new Intl.DateTimeFormat("es-MX", {
  month: "short",
  timeZone: "UTC",
});

const MES_ANIO = new Intl.DateTimeFormat("es-MX", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const fecha = (iso: string) => new Date(`${iso}T00:00:00Z`);

export const diaCorto = (iso: string) => DIA_CORTO.format(fecha(iso));
export const diaLargo = (iso: string) => DIA_LARGO.format(fecha(iso));
export const mesCorto = (iso: string) => MES.format(fecha(`${iso.slice(0, 7)}-01`));
export const mesLargo = (iso: string) =>
  MES_ANIO.format(fecha(`${iso.slice(0, 7)}-01`));

/** Capitaliza la inicial: Intl devuelve los meses en minúscula en es-MX. */
export const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
