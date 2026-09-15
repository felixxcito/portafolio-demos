"use client";

import { useTemaCifra } from "@/lib/hooks/useTemaCifra";

/**
 * Interruptor de tema.
 *
 * Es un botón con aria-pressed, no un checkbox disfrazado: para un lector
 * de pantalla "Tema oscuro, activado" describe exactamente lo que hace.
 */
export function InterruptorTema({ className = "" }: { className?: string }) {
  const { tema, alternar } = useTemaCifra();
  const oscuro = tema === "oscuro";

  return (
    <button
      type="button"
      onClick={alternar}
      /* Hasta hidratar no se sabe el tema; omitir el atributo es más
         honesto que afirmar un estado que puede ser el contrario. */
      aria-pressed={tema === null ? undefined : oscuro}
      aria-label="Tema oscuro"
      title={oscuro ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      className={`group relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border border-line bg-elevated px-1 transition-colors hover:border-accent/50 ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-1 left-1 flex size-7 items-center justify-center rounded-full bg-accent text-accent-fg transition-transform duration-400 ease-[var(--ease-out-expo)]"
        style={{ transform: oscuro ? "translateX(1.75rem)" : "none" }}
      >
        {/* Dos iconos, uno visible: cambiar el path haría saltar el trazo. */}
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {oscuro ? (
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" fill="currentColor" stroke="none" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </>
          )}
        </svg>
      </span>
    </button>
  );
}
