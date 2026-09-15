"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Tema = "claro" | "oscuro";

const LLAVE = "cifra-tema";

/**
 * El tema no es estado de React: es un atributo del DOM que el script del
 * layout raíz ya escribió antes del primer pintado. useSyncExternalStore
 * es justo la API para leer de una fuente externa al árbol —la misma que
 * usa useMedia para las media queries— y evita el ciclo
 * "useEffect + setState" que provoca un render en cascada.
 *
 * El MutationObserver cierra el círculo: si el tema cambia desde otra
 * pestaña o desde la paleta de comandos, el interruptor se entera solo.
 */
function suscribir(avisar: () => void) {
  const mo = new MutationObserver(avisar);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-tema"],
  });
  return () => mo.disconnect();
}

function leer(): Tema | null {
  const t = document.documentElement.dataset.tema;
  return t === "claro" || t === "oscuro" ? t : null;
}

/**
 * En el servidor no hay forma de saber qué tema verá el usuario. Devolver
 * null deja que el interruptor se pinte en un estado neutro en vez de
 * adivinar y corregirse a medio camino.
 */
const leerEnServidor = (): Tema | null => null;

export function useTemaCifra() {
  const tema = useSyncExternalStore(suscribir, leer, leerEnServidor);

  const cambiar = useCallback((siguiente: Tema) => {
    document.documentElement.dataset.tema = siguiente;
    try {
      localStorage.setItem(LLAVE, siguiente);
    } catch {
      // Modo privado o almacenamiento bloqueado: el tema vive lo que dure
      // la sesión. Preferible a romper el clic.
    }
  }, []);

  const alternar = useCallback(() => {
    cambiar(tema === "oscuro" ? "claro" : "oscuro");
  }, [tema, cambiar]);

  return { tema, cambiar, alternar };
}
