"use client";

import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  /** Retraso en ms para escalonar elementos hermanos. */
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "header";
  className?: string;
};

/**
 * Aparición al entrar en viewport.
 *
 * El estado vive en una clase del DOM, no en useState: es puramente
 * visual y pasar por un render de React para cada elemento que asoma
 * sería trabajo de más. Como consecuencia, `prefers-reduced-motion` se
 * resuelve entero en CSS (ver .reveal en globals.css) y no necesita
 * ninguna rama en JavaScript.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let respondio = false;

    const io = new IntersectionObserver(
      ([entrada]) => {
        respondio = true;
        if (!entrada.isIntersecting) return;
        el.classList.add("reveal--visible");
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    io.observe(el);

    /**
     * Red de seguridad. El observer entrega una primera lectura casi de
     * inmediato, incluso para elementos fuera de pantalla; si al segundo y
     * medio no ha dicho nada, algo lo está impidiendo (pestaña en segundo
     * plano al cargar, ventana sin pintar, alguna extensión). Es preferible
     * mostrar el contenido sin animación que dejarlo invisible.
     */
    const rescate = window.setTimeout(() => {
      if (!respondio) el.classList.add("reveal--visible");
    }, 1500);

    return () => {
      window.clearTimeout(rescate);
      io.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className}`}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
