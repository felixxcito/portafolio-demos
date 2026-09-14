"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { casos } from "@/lib/data/casos";
import { blurs } from "@/lib/blurs";

gsap.registerPlugin(ScrollTrigger);

const clave = (src: string) => src.replace("/img/", "").replace(".webp", "");

export function Casos() {
  const seccion = useRef<HTMLElement>(null);
  const pista = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    /**
     * El recorrido horizontal existe únicamente en escritorio. En un
     * teléfono, secuestrar el scroll vertical para mover algo en
     * horizontal se siente roto: ahí las tarjetas simplemente se apilan.
     * matchMedia revierte la animación sola al cruzar el breakpoint.
     */
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const p = pista.current;
      const s = seccion.current;
      if (!p || !s) return;

      const recorrido = () => p.scrollWidth - window.innerWidth + 96;

      const tw = gsap.to(p, {
        x: () => -recorrido(),
        ease: "none",
        scrollTrigger: {
          trigger: s,
          start: "top top",
          end: () => `+=${recorrido()}`,
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tw.scrollTrigger?.kill();
        tw.kill();
        gsap.set(p, { clearProps: "x" });
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={seccion}
      id="trabajo"
      aria-label="Casos de estudio"
      className="scroll-mt-16 overflow-hidden py-20 lg:py-0"
    >
      <div className="lg:flex lg:h-screen-d lg:flex-col lg:justify-center">
        <div className="shell mb-12 lg:mb-10">
          <p className="eyebrow">Trabajo seleccionado</p>
          <h2 className="mt-3 font-display text-display font-bold text-balance">
            Seis marcas que ya no se parecen a su competencia
          </h2>
        </div>

        <ul
          ref={pista}
          className="shell grid gap-8 sm:grid-cols-2 lg:flex lg:w-max lg:gap-8 lg:pr-24"
        >
          {casos.map((c, i) => (
            <li
              key={c.id}
              className="group lg:w-[clamp(20rem,29vw,27rem)] lg:shrink-0"
            >
              <article>
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface">
                  <Image
                    src={c.imagen}
                    alt={c.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 27rem"
                    placeholder="blur"
                    blurDataURL={blurs[clave(c.imagen)]}
                    className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] motion-safe:group-hover:scale-[1.05]"
                  />
                  <span className="absolute top-4 left-4 rounded-full bg-bg/75 px-3 py-1 font-mono text-[0.68rem] tracking-wider backdrop-blur-sm">
                    {String(i + 1).padStart(2, "0")} / {c.ano}
                  </span>
                </div>

                <div className="mt-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-2xl font-bold">{c.cliente}</h3>
                    <p className="font-display text-xl text-accent tabular-nums">
                      {c.metrica}
                    </p>
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-muted text-balance">
                    {c.titulo}
                  </p>

                  <p className="mt-1 text-xs text-faint">{c.metricaEtiqueta}</p>

                  <ul className="mt-4 flex flex-wrap gap-2">
                    {c.disciplinas.map((d) => (
                      <li
                        key={d}
                        className="rounded-full border border-line px-2.5 py-1 text-[0.68rem] text-faint"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
