/**
 * Serialización y descarga de CSV, sin dependencias.
 */

/**
 * Escapa una celda según RFC 4180: si contiene comilla, coma o salto de
 * línea, se envuelve en comillas y las comillas internas se duplican.
 * Saltarse esto es lo que hace que un nombre con coma parta la columna.
 */
function celda(valor: string | number): string {
  const s = String(valor);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function aCsv(
  encabezados: readonly string[],
  filas: readonly (string | number)[][],
): string {
  return [encabezados, ...filas].map((f) => f.map(celda).join(",")).join("\r\n");
}

/**
 * Dispara la descarga.
 *
 * El BOM inicial es para Excel: sin él abre el archivo en la codificación
 * del sistema y los acentos de "Mérida" o "Angelópolis" salen rotos.
 */
export function descargar(nombre: string, csv: string): void {
  const blob = new Blob([`﻿${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Liberar el objeto en el siguiente tick: revocarlo de inmediato cancela
  // la descarga en algunos navegadores.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
