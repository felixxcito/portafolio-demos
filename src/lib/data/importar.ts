import { normalizar } from "@/lib/grafica/difuso";
import type { Fila, Metrica } from "./cifra";

/**
 * Importación de un CSV ajeno.
 *
 * Todo ocurre en el navegador: el archivo del visitante nunca sale de su
 * máquina. No es sólo una postura de privacidad, es lo que permite que la
 * demo se pruebe con datos reales sin pedirle permiso a nadie.
 */

/* ── Parser ───────────────────────────────────────────────── */

/**
 * Olfatea el separador.
 *
 * Aceptar coma, punto y coma y tabulador a la vez parece generoso y es un
 * error: en un archivo con `;` —lo normal cuando Excel corre en español— la
 * coma es el separador decimal, y tratarla como columna parte `1.234,50` en
 * dos campos. Se cuenta cada candidato en la primera línea, fuera de
 * comillas, y gana uno solo para todo el archivo.
 */
function olfatearSeparador(texto: string): string {
  const corte = texto.search(/\r|\n/);
  const cabecera = corte === -1 ? texto : texto.slice(0, corte);

  const cuenta: Record<string, number> = { ",": 0, ";": 0, "\t": 0 };
  let enComillas = false;

  for (const c of cabecera) {
    if (c === '"') enComillas = !enComillas;
    else if (!enComillas && c in cuenta) cuenta[c]++;
  }

  let mejor = ",";
  for (const cand of Object.keys(cuenta)) {
    if (cuenta[cand] > cuenta[mejor]) mejor = cand;
  }

  return mejor;
}

/**
 * Parser de CSV según RFC 4180.
 *
 * Un `split()` alcanza hasta que aparece el primer campo entrecomillado
 * —"Monterrey, N.L."— y parte la fila por la mitad. Esto es una máquina de
 * estados: dentro de comillas, el separador y el salto de línea son texto, y
 * dos comillas seguidas son una comilla literal.
 */
export function parsearCsv(texto: string): string[][] {
  // El BOM que escribe Excel acabaría pegado al primer encabezado.
  const limpio = texto.replace(/^﻿/, "");
  const sep = olfatearSeparador(limpio);

  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = "";
  let enComillas = false;

  for (let i = 0; i < limpio.length; i++) {
    const c = limpio[i];

    if (enComillas) {
      if (c === '"') {
        if (limpio[i + 1] === '"') {
          campo += '"';
          i++;
        } else {
          enComillas = false;
        }
      } else {
        campo += c;
      }
      continue;
    }

    if (c === '"') {
      enComillas = true;
    } else if (c === sep) {
      fila.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      // \r\n cuenta como un solo salto.
      if (c === "\r" && limpio[i + 1] === "\n") i++;
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = "";
    } else {
      campo += c;
    }
  }

  if (campo !== "" || fila.length > 0) {
    fila.push(campo);
    filas.push(fila);
  }

  return filas.filter((f) => f.some((v) => v.trim() !== ""));
}

/* ── Detección de columnas ────────────────────────────────── */

export type Campo =
  | "fecha"
  | "sucursal"
  | "categoria"
  | "ingresos"
  | "tickets"
  | "unidades"
  | "visitantes";

export type Mapeo = Record<Campo, number | null>;

/** Sinónimos por campo, en español y en inglés. */
const SINONIMOS: Record<Campo, string[]> = {
  fecha: ["fecha", "dia", "date", "day", "periodo", "fecha venta", "fecha_venta"],
  sucursal: ["sucursal", "tienda", "store", "branch", "punto de venta", "pdv", "local", "plaza"],
  categoria: ["categoria", "category", "linea", "familia", "departamento", "producto", "segmento"],
  ingresos: ["ingresos", "ventas", "venta", "monto", "importe", "total", "revenue", "sales", "amount", "facturacion"],
  tickets: ["tickets", "ticket", "ordenes", "orden", "transacciones", "operaciones", "orders", "pedidos"],
  unidades: ["unidades", "piezas", "cantidad", "units", "qty", "quantity"],
  visitantes: ["visitantes", "visitas", "trafico", "sesiones", "visitors", "sessions", "afluencia"],
};

/** Campos sin los que no se puede armar un tablero. */
export const OBLIGATORIOS: Campo[] = ["fecha", "ingresos"];

export const ETIQUETAS: Record<Campo, string> = {
  fecha: "Fecha",
  sucursal: "Sucursal",
  categoria: "Categoría",
  ingresos: "Ingresos",
  tickets: "Tickets",
  unidades: "Unidades",
  visitantes: "Visitantes",
};

/**
 * Empareja los encabezados del archivo con los campos que entiende el
 * tablero. Compara sin acentos y por contención en ambos sentidos, de modo
 * que "Fecha de venta" caiga en `fecha` y "store_id" en `sucursal`.
 */
export function detectarColumnas(encabezados: string[]): Mapeo {
  const limpios = encabezados.map((h) => normalizar(h.trim()));
  const mapeo = {} as Mapeo;
  const usadas = new Set<number>();

  for (const campo of Object.keys(SINONIMOS) as Campo[]) {
    let mejorIndice = -1;
    let mejorPuntaje = 0;

    for (let i = 0; i < limpios.length; i++) {
      const h = limpios[i];
      if (usadas.has(i) || h === "") continue;

      for (const sin of SINONIMOS[campo]) {
        // Coincidencia exacta primero; luego contención en cualquier
        // sentido, que es lo que rescata "fecha_venta" o "total ventas".
        const puntos =
          h === sin ? 100 : h.includes(sin) ? 60 - h.length : sin.includes(h) ? 40 : 0;

        if (puntos > mejorPuntaje) {
          mejorPuntaje = puntos;
          mejorIndice = i;
        }
      }
    }

    mapeo[campo] = mejorIndice >= 0 ? mejorIndice : null;
    if (mejorIndice >= 0) usadas.add(mejorIndice);
  }

  return mapeo;
}

/* ── Conversión de valores ────────────────────────────────── */

/**
 * Convierte texto a número tolerando cómo lo escribe la gente.
 *
 * "$1,234.50", "1.234,50", "1 234" y "(500)" —el negativo contable— tienen
 * que llegar todos a un número. La ambigüedad real es el separador: se
 * resuelve mirando cuál aparece más a la derecha, que es siempre el decimal.
 */
export function aNumero(bruto: string): number | null {
  let s = bruto.trim();
  if (s === "") return null;

  const negativo = /^\(.*\)$/.test(s);
  s = s.replace(/[()]/g, "").replace(/[^\d.,-]/g, "");
  if (s === "" || s === "-") return null;

  const ultimaComa = s.lastIndexOf(",");
  const ultimoPunto = s.lastIndexOf(".");

  if (ultimaComa > ultimoPunto) {
    // Estilo europeo: el punto agrupa millares y la coma decide decimales.
    s = s.replace(/\./g, "").replace(",", ".");
  } else {
    s = s.replace(/,/g, "");
  }

  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return negativo ? -n : n;
}

/**
 * Normaliza una fecha a ISO corto.
 *
 * Acepta ISO y los formatos con separador que se usan en México. Ante
 * `03/04/2026` asume día primero, que es la convención local; los meses
 * mayores a 12 desambiguan solos.
 */
export function aFecha(bruto: string): string | null {
  const s = bruto.trim();
  if (s === "") return null;

  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  }

  const partes = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/);
  if (partes) {
    const [, p1, p2, anio] = partes;
    // Si el segundo número no puede ser mes, el archivo viene mes/día.
    const [dia, mes] = Number(p2) > 12 && Number(p1) <= 12 ? [p2, p1] : [p1, p2];
    const completo = anio.length === 2 ? `20${anio}` : anio;
    return `${completo}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }

  return null;
}

/* ── Construcción ─────────────────────────────────────────── */

export type Resultado = {
  filas: Omit<Fila, "dia">[];
  /** Métricas que el archivo trae de verdad; el resto no se ofrece. */
  metricas: Metrica[];
  descartadas: number;
  avisos: string[];
};

const LIMITE_FILAS = 60_000;

export function construirFilas(tabla: string[][], mapeo: Mapeo): Resultado {
  const avisos: string[] = [];
  const cuerpo = tabla.slice(1);

  const col = (fila: string[], campo: Campo): string => {
    const i = mapeo[campo];
    return i === null ? "" : (fila[i] ?? "");
  };

  const filas: Omit<Fila, "dia">[] = [];
  let descartadas = 0;
  const presentes = new Set<Metrica>();

  for (const cruda of cuerpo.slice(0, LIMITE_FILAS)) {
    const fecha = aFecha(col(cruda, "fecha"));
    const ingresos = aNumero(col(cruda, "ingresos"));

    // Una fila sin fecha o sin importe no es un dato incompleto: no es un
    // dato. Se cuenta y se informa, en vez de colarse como un cero.
    if (fecha === null || ingresos === null) {
      descartadas++;
      continue;
    }

    const tickets = aNumero(col(cruda, "tickets"));
    const unidades = aNumero(col(cruda, "unidades"));
    const visitantes = aNumero(col(cruda, "visitantes"));

    presentes.add("ingresos");
    if (tickets !== null) presentes.add("tickets");
    if (unidades !== null) presentes.add("unidades");
    if (visitantes !== null) presentes.add("visitantes");

    filas.push({
      fecha,
      sucursal: col(cruda, "sucursal").trim() || "General",
      categoria: col(cruda, "categoria").trim() || "General",
      ingresos,
      tickets: tickets ?? 0,
      unidades: unidades ?? 0,
      visitantes: visitantes ?? 0,
    });
  }

  if (cuerpo.length > LIMITE_FILAS) {
    avisos.push(
      `El archivo trae ${cuerpo.length.toLocaleString("es-MX")} filas; se usaron las primeras ${LIMITE_FILAS.toLocaleString("es-MX")}.`,
    );
  }
  if (descartadas > 0) {
    avisos.push(
      `${descartadas.toLocaleString("es-MX")} ${descartadas === 1 ? "fila quedó fuera" : "filas quedaron fuera"} por no traer fecha o importe legible.`,
    );
  }
  if (mapeo.sucursal === null) {
    avisos.push("Sin columna de sucursal: todo se agrupó como «General».");
  }
  if (mapeo.categoria === null) {
    avisos.push("Sin columna de categoría: todo se agrupó como «General».");
  }

  const orden: Metrica[] = ["ingresos", "tickets", "unidades", "visitantes"];

  return {
    filas,
    metricas: orden.filter((m) => presentes.has(m)),
    descartadas,
    avisos,
  };
}

/** Plantilla de ejemplo, para quien no sepa qué columnas mandar. */
export const PLANTILLA = [
  "fecha,sucursal,categoria,ingresos,tickets,unidades,visitantes",
  "2026-08-29,Polanco,Ropa,184320,156,296,742",
  "2026-08-29,Polanco,Calzado,142880,87,113,742",
  '2026-08-29,"Monterrey, N.L.",Ropa,131400,118,224,610',
  "2026-08-30,Polanco,Ropa,196540,168,319,812",
  '2026-08-30,"Monterrey, N.L.",Ropa,142900,127,241,655',
].join("\r\n");
