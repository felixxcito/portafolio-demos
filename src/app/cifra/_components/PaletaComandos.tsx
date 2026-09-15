"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { puntuar } from "@/lib/grafica/difuso";
import { useTemaCifra } from "@/lib/hooks/useTemaCifra";
import {
  METRICAS,
  RANGOS,
  SUCURSALES,
  CATEGORIAS,
  type Filtros,
} from "@/lib/data/cifra";
import { EVENTO_FILTRO } from "@/lib/data/eventos";

type Comando = {
  id: string;
  titulo: string;
  grupo: string;
  accion: "ir" | "tema" | "filtrar";
  destino?: string;
  filtro?: Partial<Filtros>;
};

/** Catálogo plano: la paleta sólo ordena y filtra, no decide qué existe. */
function catalogo(): Comando[] {
  return [
    { id: "ir-tablero", titulo: "Ir al tablero", grupo: "Navegar", accion: "ir", destino: "#tablero" },
    { id: "ir-como", titulo: "Ir a cómo funciona", grupo: "Navegar", accion: "ir", destino: "#como" },
    { id: "ir-simulador", titulo: "Ir al simulador de impacto", grupo: "Navegar", accion: "ir", destino: "#simulador" },
    { id: "ir-reportes", titulo: "Ir a reportes", grupo: "Navegar", accion: "ir", destino: "#reportes" },
    { id: "ir-portafolio", titulo: "Volver al portafolio", grupo: "Navegar", accion: "ir", destino: "/" },

    { id: "tema", titulo: "Cambiar tema claro u oscuro", grupo: "Ajustes", accion: "tema" },

    /*
      Los comandos de filtro no navegan: emiten un evento que el tablero
      escucha. Navegar volvería a montar la página y se llevaría por delante
      el archivo que el visitante haya subido.
    */
    ...METRICAS.map((m) => ({
      id: `m-${m.id}`,
      titulo: `Ver ${m.nombre.toLowerCase()}`,
      grupo: "Métrica",
      accion: "filtrar" as const,
      filtro: { metrica: m.id },
    })),

    ...RANGOS.map((r) => ({
      id: `r-${r.id}`,
      titulo: `Rango ${r.nombre}`,
      grupo: "Rango",
      accion: "filtrar" as const,
      filtro: { rango: r.id },
    })),

    ...SUCURSALES.map((s) => ({
      id: `s-${s.id}`,
      titulo: `Sucursal ${s.nombre} · ${s.ciudad}`,
      grupo: "Filtrar",
      accion: "filtrar" as const,
      filtro: { sucursal: s.id },
    })),

    ...CATEGORIAS.map((c) => ({
      id: `c-${c.id}`,
      titulo: `Categoría ${c.nombre}`,
      grupo: "Filtrar",
      accion: "filtrar" as const,
      filtro: { categoria: c.id },
    })),

    {
      id: "quitar-filtros",
      titulo: "Quitar todos los filtros",
      grupo: "Filtrar",
      accion: "filtrar" as const,
      filtro: { sucursal: "todas", categoria: "todas" },
    },
  ];
}

export function PaletaComandos() {
  const [abierta, setAbierta] = useState(false);
  const [consulta, setConsulta] = useState("");
  const [activo, setActivo] = useState(0);

  const router = useRouter();
  const { alternar } = useTemaCifra();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  const dialogo = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);
  /** Quién tenía el foco antes de abrir, para devolvérselo al cerrar. */
  const origen = useRef<HTMLElement | null>(null);

  const comandos = useMemo(() => catalogo(), []);

  const resultados = useMemo(() => {
    if (consulta.trim() === "") return comandos;

    return comandos
      .map((c) => ({ c, p: puntuar(`${c.titulo} ${c.grupo}`, consulta.trim()) }))
      .filter((r): r is { c: Comando; p: number } => r.p !== null)
      .sort((a, b) => b.p - a.p)
      .map((r) => r.c);
  }, [comandos, consulta]);

  const abrir = useCallback(() => {
    origen.current = document.activeElement as HTMLElement;
    setConsulta("");
    setActivo(0);
    setAbierta(true);
  }, []);

  const cerrar = useCallback(() => {
    setAbierta(false);
    origen.current?.focus();
  }, []);

  const ejecutar = useCallback(
    (c: Comando) => {
      cerrar();

      if (c.accion === "tema") {
        alternar();
        return;
      }

      if (c.accion === "filtrar") {
        window.dispatchEvent(
          new CustomEvent(EVENTO_FILTRO, { detail: c.filtro }),
        );
        document
          .querySelector("#tablero")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      if (c.destino?.startsWith("#")) {
        document
          .querySelector(c.destino)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (c.destino) router.push(c.destino);
    },
    [alternar, cerrar, router],
  );

  /* Atajo global. */
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAbierta((a) => {
          if (a) return false;
          origen.current = document.activeElement as HTMLElement;
          setConsulta("");
          setActivo(0);
          return true;
        });
      }
    };

    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, []);

  /* Foco al abrir y bloqueo del scroll de fondo. */
  useEffect(() => {
    if (!abierta) return;

    entrada.current?.focus();
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previo;
    };
  }, [abierta]);

  /**
   * Trampa de foco.
   *
   * Sin esto, tabular desde el último elemento se va a la página de atrás:
   * para quien navega con teclado el diálogo dejaría de ser modal aunque
   * visualmente lo parezca.
   */
  const alTeclearDialogo = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      cerrar();
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (resultados.length === 0) return;
      const dir = e.key === "ArrowDown" ? 1 : -1;
      setActivo((i) => (i + dir + resultados.length) % resultados.length);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const elegido = resultados[activo];
      if (elegido) ejecutar(elegido);
      return;
    }

    if (e.key !== "Tab") return;

    const enfocables = dialogo.current?.querySelectorAll<HTMLElement>(
      'input, button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    );
    if (!enfocables || enfocables.length === 0) return;

    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];

    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        aria-label="Buscar"
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 text-sm text-muted transition-colors hover:text-fg"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="hidden sm:inline">Buscar</span>
        <kbd className="numerico hidden rounded border border-line px-1 py-0.5 text-[0.65rem] text-faint sm:inline-block">
          ⌘K
        </kbd>
      </button>

      {abierta && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) cerrar();
          }}
        >
          <div
            ref={dialogo}
            role="dialog"
            aria-modal="true"
            aria-label="Paleta de comandos"
            onKeyDown={alTeclearDialogo}
            className="w-full max-w-lg overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
          >
            <input
              ref={entrada}
              type="text"
              role="combobox"
              aria-expanded
              aria-controls={`lista-${uid}`}
              aria-activedescendant={
                resultados[activo] ? `opt-${uid}-${resultados[activo].id}` : undefined
              }
              aria-autocomplete="list"
              value={consulta}
              onChange={(e) => {
                setConsulta(e.target.value);
                setActivo(0);
              }}
              placeholder="Busca una vista, un filtro o una sección…"
              className="w-full border-b border-line bg-transparent px-4 py-3.5 text-sm text-fg outline-none placeholder:text-faint"
            />

            <ul
              id={`lista-${uid}`}
              role="listbox"
              aria-label="Resultados"
              className="max-h-80 overflow-y-auto p-1.5"
            >
              {resultados.map((c, i) => (
                <li key={c.id}>
                  <button
                    type="button"
                    id={`opt-${uid}-${c.id}`}
                    role="option"
                    aria-selected={i === activo}
                    tabIndex={-1}
                    onClick={() => ejecutar(c)}
                    onPointerEnter={() => setActivo(i)}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      i === activo ? "bg-accent-soft text-fg" : "text-muted"
                    }`}
                  >
                    <span className="truncate">{c.titulo}</span>
                    <span className="shrink-0 text-[0.68rem] text-faint">
                      {c.grupo}
                    </span>
                  </button>
                </li>
              ))}

              {resultados.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-muted">
                  Nada coincide con «{consulta}».
                </li>
              )}
            </ul>

            <p className="border-t border-line px-4 py-2 text-[0.68rem] text-faint">
              ↑↓ para moverte · ↵ para elegir · Esc para cerrar
            </p>
          </div>
        </div>
      )}
    </>
  );
}
