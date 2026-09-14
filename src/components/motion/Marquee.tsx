"use client";

type Props = {
  children: React.ReactNode;
  /** Segundos por vuelta completa. Más alto = más lento. */
  duracion?: number;
  invertido?: boolean;
  className?: string;
};

/**
 * Cinta infinita. El contenido se duplica y se desplaza un 50%: al
 * terminar, la copia está exactamente donde estaba el original, así que
 * el salto es invisible. Todo en CSS, sin JavaScript por cuadro.
 */
export function Marquee({
  children,
  duracion = 32,
  invertido = false,
  className = "",
}: Props) {
  return (
    <div
      className={`group relative flex overflow-hidden ${className}`}
      // La copia es decorativa: los lectores de pantalla leen sólo una.
      style={{ ["--dur" as string]: `${duracion}s` }}
    >
      <div
        className={`flex shrink-0 items-center gap-[var(--gap,3rem)] pr-[var(--gap,3rem)] ${
          invertido ? "animate-[marquee-rev_var(--dur)_linear_infinite]" : "animate-[marquee_var(--dur)_linear_infinite]"
        } motion-reduce:animate-none group-hover:[animation-play-state:paused]`}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={`flex shrink-0 items-center gap-[var(--gap,3rem)] pr-[var(--gap,3rem)] ${
          invertido ? "animate-[marquee-rev_var(--dur)_linear_infinite]" : "animate-[marquee_var(--dur)_linear_infinite]"
        } motion-reduce:animate-none group-hover:[animation-play-state:paused]`}
      >
        {children}
      </div>
    </div>
  );
}
