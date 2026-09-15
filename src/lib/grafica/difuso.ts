/**
 * Coincidencia difusa por subsecuencia.
 *
 * "cft" encuentra "Café en tienda" porque las letras aparecen en orden,
 * aunque no seguidas. La puntuación premia lo que un humano percibe como
 * "mejor coincidencia": letras consecutivas y letras en inicio de palabra.
 */

/** Minúsculas y sin acentos, para que "cafe" encuentre "Café". */
export function normalizar(s: string): string {
  // \p{Diacritic} exigiría target ES2018; el rango de marcas combinantes
  // hace lo mismo y compila con el ES2017 de este proyecto.
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Devuelve la puntuación, o null si no hay coincidencia.
 * Números más altos son mejores coincidencias.
 */
export function puntuar(texto: string, consulta: string): number | null {
  if (consulta === "") return 0;

  const t = normalizar(texto);
  const q = normalizar(consulta);

  let puntos = 0;
  let iTexto = 0;
  let seguidas = 0;

  for (const letra of q) {
    const encontrada = t.indexOf(letra, iTexto);
    if (encontrada === -1) return null;

    // Inicio de palabra: vale tanto como dos letras seguidas.
    const inicioPalabra =
      encontrada === 0 || t[encontrada - 1] === " " || t[encontrada - 1] === "·";

    seguidas = encontrada === iTexto ? seguidas + 1 : 0;
    puntos += 1 + seguidas * 2 + (inicioPalabra ? 3 : 0);
    iTexto = encontrada + 1;
  }

  // A igualdad de letras, gana el texto más corto: es el más específico.
  return puntos - t.length * 0.01;
}
