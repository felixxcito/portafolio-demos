"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Frontera de error del tablero.
 *
 * El prop `retry` es de Next 16.3 —antes había que llamarlo `reset`— y
 * vuelve a pedir y renderizar el segmento sin recargar la página. Para un
 * fallo transitorio eso es todo lo que hace falta; para uno persistente,
 * el enlace de abajo saca al usuario a una vista limpia.
 */
export default function ErrorCifra({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // En producción esto iría al servicio de errores; aquí basta la consola.
    console.error("Cifra:", error);
  }, [error]);

  return (
    <div className="shell flex min-h-[70svh] flex-col justify-center py-24">
      <p className="eyebrow">Algo falló</p>

      <h1 className="font-display mt-4 max-w-[18ch] text-title font-semibold">
        No pudimos armar el tablero.
      </h1>

      <p className="mt-4 max-w-[52ch] text-muted">
        El cálculo se interrumpió antes de terminar. Casi siempre es
        temporal: vuelve a intentarlo y debería responder.
      </p>

      {error.digest && (
        <p className="numerico mt-3 text-xs text-faint">
          Referencia {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={retry}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
        >
          Reintentar
        </button>
        <Link
          href="/cifra"
          replace
          className="rounded-lg border border-line px-5 py-2.5 text-sm transition-colors hover:border-accent/50"
        >
          Empezar de cero
        </Link>
      </div>
    </div>
  );
}
