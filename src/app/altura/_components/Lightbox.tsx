"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Propiedad } from "@/lib/data/propiedades";
import { blurs } from "@/lib/blurs";

const clave = (src: string) =>
  src.replace("/img/", "").replace(".webp", "");

type Props = {
  propiedad: Propiedad | null;
  /** El padre lo monta con key={propiedad.id}, así que basta el valor inicial. */
  indiceInicial?: number;
  onCerrar: () => void;
};

/**
 * Visor de galería. Navegable con teclado (←/→/Esc), atrapa el foco
 * mientras está abierto y devuelve el foco al elemento que lo abrió.
 */
export function Lightbox({ propiedad, indiceInicial = 0, onCerrar }: Props) {
  const [i, setI] = useState(indiceInicial);
  const dialogo = useRef<HTMLDivElement>(null);
  const origen = useRef<Element | null>(null);

  const total = propiedad?.imagenes.length ?? 0;
  const siguiente = useCallback(() => setI((v) => (v + 1) % total), [total]);
  const anterior = useCallback(() => setI((v) => (v - 1 + total) % total), [total]);

  useEffect(() => {
    if (!propiedad) return;

    origen.current = document.activeElement;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogo.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
      else if (e.key === "ArrowRight") siguiente();
      else if (e.key === "ArrowLeft") anterior();
      else if (e.key === "Tab") {
        // Foco atrapado: el diálogo sólo contiene sus propios controles.
        const focusables = dialogo.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled])",
        );
        if (!focusables?.length) return;
        const primero = focusables[0];
        const ultimo = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previo;
      (origen.current as HTMLElement | null)?.focus?.();
    };
  }, [propiedad, onCerrar, siguiente, anterior]);

  if (!propiedad) return null;
  const img = propiedad.imagenes[i];

  return (
    <div
      ref={dialogo}
      role="dialog"
      aria-modal="true"
      aria-label={`Galería de ${propiedad.nombre}`}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col bg-[#0d0b09]/97 backdrop-blur-sm"
    >
      <header className="flex items-center justify-between gap-4 px-5 py-4 text-[#f3efe9] sm:px-8">
        <div className="min-w-0">
          <p className="truncate font-display text-xl">{propiedad.nombre}</p>
          <p className="text-xs text-[#f3efe9]/55">
            {i + 1} de {total} · {propiedad.zona}
          </p>
        </div>
        <button
          onClick={onCerrar}
          aria-label="Cerrar galería"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-white/20 text-xl transition-colors hover:bg-white/10"
        >
          ✕
        </button>
      </header>

      <div className="relative flex-1 px-3 pb-3 sm:px-8 sm:pb-6">
        <div className="relative h-full w-full overflow-hidden rounded-lg">
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            fill
            sizes="100vw"
            placeholder="blur"
            blurDataURL={blurs[clave(img.src)]}
            className="animate-[fadein_.45s_ease] object-contain"
          />
        </div>
      </div>

      <footer className="flex items-center justify-center gap-3 px-5 pb-6 sm:pb-8">
        <button
          onClick={anterior}
          aria-label="Imagen anterior"
          className="grid size-12 place-items-center rounded-full border border-white/20 text-[#f3efe9] transition-colors hover:bg-white/10"
        >
          ←
        </button>

        <ul className="flex gap-2">
          {propiedad.imagenes.map((im, idx) => (
            <li key={im.src}>
              <button
                onClick={() => setI(idx)}
                aria-label={`Ver imagen ${idx + 1}`}
                aria-current={idx === i}
                className={`h-1.5 rounded-full transition-all duration-400 ${
                  idx === i ? "w-8 bg-[#f3efe9]" : "w-4 bg-white/30 hover:bg-white/50"
                }`}
              />
            </li>
          ))}
        </ul>

        <button
          onClick={siguiente}
          aria-label="Imagen siguiente"
          className="grid size-12 place-items-center rounded-full border border-white/20 text-[#f3efe9] transition-colors hover:bg-white/10"
        >
          →
        </button>
      </footer>
    </div>
  );
}
