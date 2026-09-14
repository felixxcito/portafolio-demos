"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor personalizado: un punto que sigue al instante y un anillo que
 * llega con retraso. Sólo se monta con mouse o trackpad — en una pantalla
 * táctil sería un elemento fantasma persiguiendo toques.
 */
export function Cursor() {
  const punto = useRef<HTMLDivElement>(null);
  const anillo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const p = punto.current;
    const a = anillo.current;
    if (!p || !a) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let ax = x;
    let ay = y;
    let escala = 1;
    let escalaObjetivo = 1;
    let rafId = 0;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      p.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;

      // Cualquier elemento interactivo agranda el anillo. Se consulta con
      // closest para que también funcione sobre los hijos de un botón.
      const bajo = e.target as Element | null;
      escalaObjetivo = bajo?.closest("a, button, [data-cursor]") ? 2.6 : 1;
    };

    const bucle = () => {
      rafId = requestAnimationFrame(bucle);
      ax += (x - ax) * 0.16;
      ay += (y - ay) * 0.16;
      escala += (escalaObjetivo - escala) * 0.14;
      a.style.transform = `translate3d(${ax}px, ${ay}px, 0) translate(-50%, -50%) scale(${escala})`;
      a.style.opacity = escalaObjetivo > 1 ? "0.55" : "0.28";
    };

    document.documentElement.style.cursor = "none";
    window.addEventListener("pointermove", onMove, { passive: true });
    rafId = requestAnimationFrame(bucle);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.style.cursor = "";
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] hidden lg:block">
      <div
        ref={punto}
        className="absolute top-0 left-0 size-1.5 rounded-full bg-accent"
      />
      <div
        ref={anillo}
        className="absolute top-0 left-0 size-9 rounded-full border border-accent opacity-30 transition-opacity duration-300"
      />
    </div>
  );
}
