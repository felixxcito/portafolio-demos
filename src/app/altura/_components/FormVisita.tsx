"use client";

import { useId, useState } from "react";
import { propiedades } from "@/lib/data/propiedades";

type Campos = {
  nombre: string;
  email: string;
  telefono: string;
  residencia: string;
  fecha: string;
  mensaje: string;
};

type Errores = Partial<Record<keyof Campos, string>>;

const VACIO: Campos = {
  nombre: "",
  email: "",
  telefono: "",
  residencia: propiedades[0].id,
  fecha: "",
  mensaje: "",
};

const hoy = () => new Date().toISOString().slice(0, 10);

function validar(c: Campos): Errores {
  const e: Errores = {};

  if (c.nombre.trim().length < 3) e.nombre = "Escribe tu nombre completo.";

  // Suficiente para atrapar errores de dedo sin rechazar correos válidos.
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(c.email.trim()))
    e.email = "Ese correo no parece válido.";

  const digitos = c.telefono.replace(/\D/g, "");
  if (digitos.length < 10) e.telefono = "Necesitamos 10 dígitos.";

  if (!c.fecha) e.fecha = "Elige una fecha.";
  else if (c.fecha < hoy()) e.fecha = "La fecha ya pasó.";

  return e;
}

export function FormVisita() {
  const uid = useId();
  const [campos, setCampos] = useState<Campos>(VACIO);
  const [errores, setErrores] = useState<Errores>({});
  const [tocados, setTocados] = useState<Set<keyof Campos>>(new Set());
  const [estado, setEstado] = useState<"idle" | "enviando" | "listo">("idle");

  const set = (k: keyof Campos) => (v: string) => {
    const nuevos = { ...campos, [k]: v };
    setCampos(nuevos);
    // Sólo re-valida los campos que el usuario ya tocó: nadie quiere
    // ver errores en rojo antes de terminar de escribir.
    if (tocados.has(k)) setErrores(validar(nuevos));
  };

  const marcarTocado = (k: keyof Campos) => () => {
    setTocados((prev) => new Set(prev).add(k));
    setErrores(validar(campos));
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validar(campos);
    setErrores(errs);
    setTocados(new Set(Object.keys(campos) as (keyof Campos)[]));

    if (Object.keys(errs).length) {
      document
        .getElementById(`${uid}-${Object.keys(errs)[0]}`)
        ?.focus();
      return;
    }

    setEstado("enviando");
    // Demo sin backend: se simula la latencia de una solicitud real.
    await new Promise((r) => setTimeout(r, 1100));
    setEstado("listo");
  };

  if (estado === "listo") {
    const prop = propiedades.find((p) => p.id === campos.residencia)!;
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent-soft p-8 text-center sm:p-12">
        <p className="mx-auto grid size-14 place-items-center rounded-full bg-accent text-2xl text-accent-fg">
          ✓
        </p>
        <h3 className="mt-6 font-display text-3xl">Visita solicitada</h3>
        <p className="mx-auto mt-3 max-w-[46ch] text-muted">
          Gracias, {campos.nombre.split(" ")[0]}. Un asesor te confirmará por
          correo la visita a <strong className="font-medium text-fg">{prop.nombre}</strong>{" "}
          el{" "}
          {new Date(`${campos.fecha}T12:00:00`).toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
          })}
          .
        </p>
        <button
          onClick={() => {
            setCampos(VACIO);
            setErrores({});
            setTocados(new Set());
            setEstado("idle");
          }}
          className="mt-8 min-h-12 rounded-full border border-line px-7 text-sm transition-colors hover:border-accent hover:text-accent"
        >
          Agendar otra visita
        </button>
      </div>
    );
  }

  const campo = (
    k: keyof Campos,
    etiqueta: string,
    extra: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => {
    const err = errores[k];
    const mostrar = err && tocados.has(k);
    return (
      <div>
        <label htmlFor={`${uid}-${k}`} className="eyebrow mb-2 block">
          {etiqueta}
        </label>
        <input
          id={`${uid}-${k}`}
          value={campos[k]}
          onChange={(e) => set(k)(e.target.value)}
          onBlur={marcarTocado(k)}
          aria-invalid={mostrar ? true : undefined}
          aria-describedby={mostrar ? `${uid}-${k}-err` : undefined}
          className={`min-h-12 w-full rounded-lg border bg-surface px-4 text-base text-fg transition-colors placeholder:text-faint ${
            mostrar ? "border-red-600" : "border-line focus:border-accent"
          }`}
          {...extra}
        />
        {mostrar && (
          <p
            id={`${uid}-${k}-err`}
            role="alert"
            className="mt-1.5 text-xs text-red-700"
          >
            {err}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={enviar} noValidate className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {campo("nombre", "Nombre completo", {
          placeholder: "Ana Martínez",
          autoComplete: "name",
        })}
        {campo("email", "Correo", {
          type: "email",
          placeholder: "ana@correo.com",
          autoComplete: "email",
          inputMode: "email",
        })}
        {campo("telefono", "Teléfono", {
          type: "tel",
          placeholder: "55 1234 5678",
          autoComplete: "tel",
          inputMode: "tel",
        })}
        {campo("fecha", "Fecha preferida", { type: "date", min: hoy() })}
      </div>

      <div>
        <label htmlFor={`${uid}-residencia`} className="eyebrow mb-2 block">
          Residencia de interés
        </label>
        <select
          id={`${uid}-residencia`}
          value={campos.residencia}
          onChange={(e) => set("residencia")(e.target.value)}
          className="min-h-12 w-full rounded-lg border border-line bg-surface px-4 text-base text-fg"
        >
          {propiedades.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} — {p.zona}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${uid}-mensaje`} className="eyebrow mb-2 block">
          Mensaje <span className="normal-case">(opcional)</span>
        </label>
        <textarea
          id={`${uid}-mensaje`}
          rows={4}
          value={campos.mensaje}
          onChange={(e) => set("mensaje")(e.target.value)}
          placeholder="Cuéntanos qué estás buscando."
          className="w-full resize-y rounded-lg border border-line bg-surface px-4 py-3 text-base text-fg transition-colors placeholder:text-faint focus:border-accent"
        />
      </div>

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="min-h-13 w-full rounded-full bg-accent px-8 py-3.5 text-sm font-medium tracking-wide text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {estado === "enviando" ? "Enviando…" : "Solicitar visita"}
      </button>

      <p className="text-xs text-faint">
        Demo sin servidor: los datos no se envían a ningún lado ni se guardan.
      </p>
    </form>
  );
}
