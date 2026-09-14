"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll suave con Lenis, conectado al ticker de GSAP.
 *
 * Dos detalles importantes: Lenis y ScrollTrigger tienen que compartir
 * un solo bucle (si cada uno corre el suyo, los disparadores se
 * desfasan medio cuadro y las animaciones tiemblan), y en móvil se deja
 * el scroll nativo — el momentum del sistema se siente mejor que
 * cualquier interpolación y no pelea con el gesto de "pull to refresh".
 */
export function SmoothScroll() {
  useEffect(() => {
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tactil = !window.matchMedia("(pointer: fine)").matches;
    if (reducido || tactil) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (tiempo: number) => lenis.raf(tiempo * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
    };
  }, []);

  return null;
}
