"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CIFRAS = [
  { valor: 38, sufijo: "", etiqueta: "marcas construidas" },
  { valor: 12, sufijo: "", etiqueta: "premios internacionales" },
  { valor: 9, sufijo: "", etiqueta: "años de estudio" },
  { valor: 96, sufijo: "%", etiqueta: "clientes que repiten" },
];

export function Contadores() {
  const raiz = useRef<HTMLDListElement>(null);

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-cifra]").forEach((nodo) => {
        const destino = Number(nodo.dataset.cifra);
        const sufijo = nodo.dataset.sufijo ?? "";
        const obj = { n: 0 };

        gsap.to(obj, {
          n: destino,
          duration: 1.7,
          ease: "power2.out",
          scrollTrigger: { trigger: nodo, start: "top 88%", once: true },
          onUpdate: () => {
            nodo.textContent = Math.round(obj.n) + sufijo;
          },
        });
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <dl
      ref={raiz}
      className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-12 lg:grid-cols-4"
    >
      {CIFRAS.map((c) => (
        <div key={c.etiqueta}>
          <dt className="sr-only">{c.etiqueta}</dt>
          <dd>
            <span
              data-cifra={c.valor}
              data-sufijo={c.sufijo}
              className="block font-display text-[clamp(2.75rem,7vw,4.5rem)] leading-none font-bold tabular-nums"
            >
              0{c.sufijo}
            </span>
            <span className="mt-3 block text-sm text-muted">{c.etiqueta}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
