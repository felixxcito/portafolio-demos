"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type EscenaAPI = {
  /** Se llama una vez por cuadro mientras el canvas está visible. */
  render: (tiempo: number, delta: number) => void;
  resize?: (ancho: number, alto: number) => void;
  dispose?: () => void;
};

export type Setup = (args: {
  renderer: THREE.WebGLRenderer;
  ancho: number;
  alto: number;
  /** true si el sistema pidió menos movimiento: dibuja un cuadro y ya. */
  reducido: boolean;
}) => EscenaAPI;

export type Estado = "cargando" | "activo" | "estatico" | "sin-webgl";

function haySoporte() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Monta una escena de Three.js dentro de un contenedor y se encarga de
 * todo el ciclo de vida que suele olvidarse:
 *
 *  · detecta si el navegador soporta WebGL y avisa para mostrar fallback
 *  · respeta prefers-reduced-motion dibujando un solo cuadro
 *  · limita el DPR (en móvil el coste de pintar crece al cuadrado)
 *  · redimensiona con ResizeObserver, no con el evento resize de window
 *  · pausa el bucle cuando el canvas sale de pantalla
 *  · libera geometrías, materiales, el renderer y el contexto al desmontar
 */
export function useEscena(setup: Setup, dprMax = 2) {
  const contenedor = useRef<HTMLDivElement>(null);

  /**
   * El soporte de WebGL y la preferencia de movimiento no cambian durante
   * la vida del componente, así que se resuelven una sola vez al crear el
   * estado. Calcularlos aquí, y no en un efecto, evita el render extra que
   * haría parpadear el fallback antes de la escena.
   */
  const [estado] = useState<Estado>(() => {
    if (typeof window === "undefined") return "cargando";
    if (!haySoporte()) return "sin-webgl";
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "estatico"
      : "activo";
  });

  // El setup se guarda en un ref para que redefinirlo en cada render del
  // componente no vuelva a montar la escena entera. Se actualiza en un
  // efecto propio, declarado antes del de montaje para que ya esté al día
  // cuando aquel corra.
  const setupRef = useRef(setup);
  useEffect(() => {
    setupRef.current = setup;
  }, [setup]);

  useEffect(() => {
    const host = contenedor.current;
    if (!host) return;
    if (estado === "sin-webgl" || estado === "cargando") return;

    const reducido = estado === "estatico";
    const rect = host.getBoundingClientRect();
    let ancho = Math.max(1, rect.width);
    let alto = Math.max(1, rect.height);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    // En pantallas angostas se recorta más: el área de píxeles crece con
    // el cuadrado del DPR y es lo primero que tira los fps en un teléfono.
    const tope = ancho < 640 ? Math.min(dprMax, 1.75) : dprMax;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tope));
    renderer.setSize(ancho, alto, false);
    renderer.domElement.style.cssText =
      "display:block;width:100%;height:100%;touch-action:pan-y";
    host.appendChild(renderer.domElement);

    const api = setupRef.current({ renderer, ancho, alto, reducido });

    let rafId = 0;
    let visible = false;
    let ultimo = performance.now();

    const cuadro = (ahora: number) => {
      rafId = requestAnimationFrame(cuadro);
      const delta = Math.min((ahora - ultimo) / 1000, 0.05);
      ultimo = ahora;
      api.render(ahora / 1000, delta);
    };

    const arrancar = () => {
      if (rafId || reducido) return;
      ultimo = performance.now();
      rafId = requestAnimationFrame(cuadro);
    };

    const parar = () => {
      if (!rafId) return;
      cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) arrancar();
        else parar();
      },
      { threshold: 0.01 },
    );
    io.observe(host);

    const ro = new ResizeObserver(([e]) => {
      const cr = e.contentRect;
      ancho = Math.max(1, cr.width);
      alto = Math.max(1, cr.height);
      renderer.setSize(ancho, alto, false);
      api.resize?.(ancho, alto);
      // Tras un cambio de tamaño hay que repintar aunque el bucle esté
      // detenido, o el canvas se queda estirado.
      if (!rafId) api.render(performance.now() / 1000, 0);
    });
    ro.observe(host);

    // Un cuadro inicial para que nunca se vea un hueco transparente.
    api.render(performance.now() / 1000, 0);

    const onVisibilidad = () => {
      if (document.hidden) parar();
      else if (visible) arrancar();
    };
    document.addEventListener("visibilitychange", onVisibilidad);

    return () => {
      parar();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibilidad);
      api.dispose?.();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [dprMax, estado]);

  return { contenedor, estado };
}

/** Libera geometrías y materiales de todo un subárbol. */
export function liberar(raiz: THREE.Object3D) {
  raiz.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose?.();
    const mat = m.material;
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
    else mat?.dispose?.();
  });
}
