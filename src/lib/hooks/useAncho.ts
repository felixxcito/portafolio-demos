"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ancho real de un elemento.
 *
 * Las gráficas se dibujan en coordenadas de píxel, no escaladas por
 * viewBox: así el texto de los ejes mide lo mismo a 375 px que a 1440, en
 * vez de encogerse con el resto del dibujo.
 *
 * Devuelve 0 hasta la primera medición. Quien lo use debe partir de un
 * ancho supuesto para que el servidor pinte algo — ver ANCHO_BASE en las
 * gráficas.
 */
export function useAncho<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [ancho, setAncho] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(([entrada]) => {
      setAncho(entrada.contentRect.width);
    });

    ro.observe(el);
    setAncho(el.getBoundingClientRect().width);

    return () => ro.disconnect();
  }, []);

  return [ref, ancho] as const;
}
