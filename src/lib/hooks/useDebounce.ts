"use client";

import { useEffect, useState } from "react";

/**
 * Valor retrasado.
 *
 * La búsqueda de la tabla filtra sobre el valor diferido mientras el input
 * sigue mostrando el inmediato: se escribe sin saltos y el filtrado corre
 * una vez al terminar de teclear, no una por letra.
 */
export function useDebounce<T>(valor: T, ms = 220): T {
  const [diferido, setDiferido] = useState(valor);

  useEffect(() => {
    const t = window.setTimeout(() => setDiferido(valor), ms);
    return () => window.clearTimeout(t);
  }, [valor, ms]);

  return diferido;
}
