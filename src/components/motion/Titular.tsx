"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Anima al entrar en viewport en vez de al montar. */
  alScroll?: boolean;
  as?: "h1" | "h2" | "p";
};

/**
 * Titular que entra línea por línea desde abajo. SplitText corta el texto
 * respetando el salto real de línea y `mask` le da a cada una un
 * contenedor con overflow oculto: eso produce el efecto de asomarse en
 * vez de simplemente aparecer.
 *
 * Dos precauciones que aquí importan más que el efecto en sí:
 *
 *  1. Se espera a `document.fonts.ready`. SplitText mide dónde corta cada
 *     línea, y si mide con la tipografía de respaldo los cortes quedan en
 *     lugares equivocados al llegar la definitiva.
 *  2. El titular arranca oculto, así que cualquier fallo lo dejaría
 *     invisible para siempre. Si la animación no llegó a correr, un
 *     temporizador lo muestra tal cual. Más vale sin efecto que en blanco.
 */
export function Titular({
  children,
  className = "",
  alScroll = false,
  as: Tag = "h2",
}: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelado = false;

    const mostrar = () => gsap.set(el, { opacity: 1 });

    const rescate = window.setTimeout(mostrar, 2000);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.clearTimeout(rescate);
      mostrar();
      return;
    }

    let ctx: gsap.Context | undefined;

    const arrancar = () => {
      if (cancelado) return;
      window.clearTimeout(rescate);

      ctx = gsap.context(() => {
        const split = new SplitText(el, { type: "lines", mask: "lines" });
        mostrar();

        gsap.from(split.lines, {
          yPercent: 115,
          duration: 1.25,
          ease: "expo.out",
          stagger: 0.085,
          // Sin limpiar, una animación interrumpida deja la línea a medio
          // camino y recortada por su máscara.
          clearProps: "transform",
          ...(alScroll
            ? { scrollTrigger: { trigger: el, start: "top 85%", once: true } }
            : { delay: 0.1 }),
        });

        return () => split.revert();
      }, el);
    };

    // document.fonts.ready ya viene resuelto si las fuentes están en caché.
    document.fonts.ready.then(arrancar).catch(arrancar);

    return () => {
      cancelado = true;
      window.clearTimeout(rescate);
      ctx?.revert();
      // ctx.revert() restaura el opacity:0 del marcado, así que al
      // desmontar se deja el texto visible por si el nodo sobrevive.
      gsap.set(el, { opacity: 1 });
    };
  }, [alScroll]);

  return (
    <Tag ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </Tag>
  );
}
