"use client";

import { useEffect, useRef } from "react";

/**
 * Barra de avance de lectura. Escribe directo en el estilo del elemento
 * en vez de pasar por el estado de React: es un valor puramente visual
 * y re-renderizar el árbol en cada scroll sería un desperdicio.
 */
export function ProgresoScroll() {
  const barra = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;

    const actualizar = () => {
      rafId = 0;
      const alcance =
        document.documentElement.scrollHeight - window.innerHeight;
      const p = alcance > 0 ? window.scrollY / alcance : 0;
      if (barra.current) {
        barra.current.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
      }
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(actualizar);
    };

    actualizar();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
    >
      <div
        ref={barra}
        className="h-full origin-left bg-accent"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
