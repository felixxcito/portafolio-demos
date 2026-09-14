"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Suscripción a una media query.
 *
 * useSyncExternalStore es justo la API para leer de una fuente externa al
 * árbol de React: evita el render en cascada de "useState + useEffect" y
 * deja explícito qué se devuelve en el servidor, donde matchMedia no existe.
 */
export function useMedia(query: string, enServidor = false) {
  const suscribir = useCallback(
    (avisar: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", avisar);
      return () => mql.removeEventListener("change", avisar);
    },
    [query],
  );

  const leer = useCallback(() => window.matchMedia(query).matches, [query]);
  const leerEnServidor = useCallback(() => enServidor, [enServidor]);

  return useSyncExternalStore(suscribir, leer, leerEnServidor);
}

/** true si el usuario pidió menos movimiento en su sistema. */
export const useReducedMotion = () =>
  useMedia("(prefers-reduced-motion: reduce)");

/** true sólo con mouse o trackpad — nunca en pantallas táctiles. */
export const usePointerFine = () => useMedia("(pointer: fine)");
