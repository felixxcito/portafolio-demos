"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * Acompañante del script anti-parpadeo.
 *
 * El script del layout resuelve la carga directa, pero al llegar desde el
 * portafolio con <Link> no hay parseo de HTML: React inserta ese <script>
 * en el DOM y el navegador —por diseño— no ejecuta scripts insertados así.
 * El contenedor se quedaría sin data-tema y el sitio caería al
 * prefers-color-scheme, contradiciendo lo que el usuario eligió.
 *
 * useLayoutEffect y no useEffect: corre antes del pintado, así que no
 * existe un cuadro con el tema equivocado.
 */
export function SincroniaTema() {
  useLayoutEffect(() => {
    const raiz = document.documentElement;
    if (raiz.dataset.tema) return;

    try {
      const guardado = localStorage.getItem("cifra-tema");
      raiz.dataset.tema =
        guardado === "claro" || guardado === "oscuro"
          ? guardado
          : matchMedia("(prefers-color-scheme: dark)").matches
            ? "oscuro"
            : "claro";
    } catch {
      raiz.dataset.tema = "claro";
    }
  }, []);

  // Dos pestañas abiertas no deberían contradecirse.
  useEffect(() => {
    const alCambiar = (e: StorageEvent) => {
      if (e.key !== "cifra-tema" || !e.newValue) return;
      document.documentElement.dataset.tema = e.newValue;
    };

    window.addEventListener("storage", alCambiar);
    return () => window.removeEventListener("storage", alCambiar);
  }, []);

  return null;
}
