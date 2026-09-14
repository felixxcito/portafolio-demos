"use client";

import Image from "next/image";
import { useRef } from "react";
import { blurs } from "@/lib/blurs";
import { precioCorto, type Propiedad } from "@/lib/data/propiedades";
import { usePointerFine } from "@/lib/hooks/useMedia";

const clave = (src: string) => src.replace("/img/", "").replace(".webp", "");

type Props = {
  p: Propiedad;
  onVerGaleria: () => void;
  comparando: boolean;
  onComparar: () => void;
  comparadorLleno: boolean;
};

export function TarjetaPropiedad({
  p,
  onVerGaleria,
  comparando,
  onComparar,
  comparadorLleno,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const puntero = usePointerFine();

  /**
   * Inclinación 3D siguiendo el cursor. Sólo con mouse: en táctil el
   * efecto no aporta nada y encarece cada scroll.
   */
  const onMove = (e: React.MouseEvent) => {
    if (!puntero || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.setProperty("--rx", `${-y * 5}deg`);
    ref.current.style.setProperty("--ry", `${x * 6}deg`);
  };

  const onLeave = () => {
    if (!ref.current) return;
    ref.current.style.setProperty("--rx", "0deg");
    ref.current.style.setProperty("--ry", "0deg");
  };

  const bloqueada = comparadorLleno && !comparando;

  return (
    <article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ viewTransitionName: `prop-${p.id}` }}
      className="group [transform-style:preserve-3d] [perspective:1200px]"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] [transform:rotateX(var(--rx,0))_rotateY(var(--ry,0))] group-hover:shadow-[0_28px_60px_-24px_rgb(26_23_20/0.35)]">
        <button
          onClick={onVerGaleria}
          className="relative aspect-[3/2] w-full overflow-hidden"
          aria-label={`Ver galería de ${p.nombre}, ${p.imagenes.length} fotos`}
        >
          <Image
            src={p.imagenes[0].src}
            alt={p.imagenes[0].alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL={blurs[clave(p.imagenes[0].src)]}
            className="object-cover transition-transform duration-[1.1s] ease-[var(--ease-out-expo)] motion-safe:group-hover:scale-[1.06]"
          />
          <span className="absolute bottom-3 left-3 rounded-full bg-bg/85 px-3 py-1.5 text-[0.7rem] font-medium tracking-wide backdrop-blur-sm">
            {p.imagenes.length} fotos
          </span>
        </button>

        <div className="flex flex-1 flex-col p-5">
          <p className="eyebrow">{p.zona}</p>
          <h3 className="mt-1.5 font-display text-2xl leading-tight">{p.nombre}</h3>

          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
            {p.resumen}
          </p>

          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 text-sm">
            <div>
              <dt className="text-[0.7rem] text-faint">Recámaras</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{p.recamaras}</dd>
            </div>
            <div>
              <dt className="text-[0.7rem] text-faint">Baños</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{p.banos}</dd>
            </div>
            <div>
              <dt className="text-[0.7rem] text-faint">Construcción</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{p.construccion} m²</dd>
            </div>
          </dl>

          <div className="mt-5 flex items-end justify-between gap-3 pt-1">
            <p className="font-display text-2xl tabular-nums">{precioCorto(p.precio)}</p>

            <label
              className={`flex min-h-11 cursor-pointer select-none items-center gap-2 rounded-full border px-3 text-xs transition-colors ${
                comparando
                  ? "border-accent bg-accent text-accent-fg"
                  : bloqueada
                    ? "cursor-not-allowed border-line text-faint opacity-50"
                    : "border-line text-muted hover:border-accent hover:text-accent"
              }`}
            >
              <input
                type="checkbox"
                checked={comparando}
                disabled={bloqueada}
                onChange={onComparar}
                className="sr-only"
              />
              {comparando ? "✓ Comparando" : "Comparar"}
            </label>
          </div>
        </div>
      </div>
    </article>
  );
}
