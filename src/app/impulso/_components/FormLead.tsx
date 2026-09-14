"use client";

import { useId, useState } from "react";

const CORREO = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function FormLead() {
  const uid = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "listo">("idle");

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!CORREO.test(email.trim())) {
      setError("Necesitamos un correo válido para avisarte.");
      document.getElementById(uid)?.focus();
      return;
    }
    setError("");
    setEstado("enviando");
    // Demo sin backend: se simula la latencia de la solicitud.
    await new Promise((r) => setTimeout(r, 1000));
    setEstado("listo");
  };

  if (estado === "listo") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-accent/40 bg-accent-soft p-8 text-center"
      >
        <p className="mx-auto grid size-12 place-items-center rounded-full bg-accent text-xl text-accent-fg">
          ✓
        </p>
        <p className="mt-5 font-display text-2xl">Estás en la lista</p>
        <p className="mt-2 text-sm text-muted">
          Te escribiremos a{" "}
          <strong className="font-medium text-fg">{email}</strong> 48 horas antes
          del lanzamiento, con tu acceso anticipado.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate>
      <label htmlFor={uid} className="eyebrow mb-3 block">
        Acceso anticipado
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={uid}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          placeholder="tu@correo.com"
          autoComplete="email"
          inputMode="email"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${uid}-err` : undefined}
          className={`min-h-13 flex-1 rounded-full border bg-surface px-6 text-base text-fg transition-colors placeholder:text-faint ${
            error ? "border-red-500" : "border-line focus:border-accent"
          }`}
        />
        <button
          type="submit"
          disabled={estado === "enviando"}
          className="min-h-13 rounded-full bg-accent px-8 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {estado === "enviando" ? "Enviando…" : "Apartar mi lugar"}
        </button>
      </div>

      {error && (
        <p id={`${uid}-err`} role="alert" className="mt-2.5 text-xs text-red-400">
          {error}
        </p>
      )}

      <p className="mt-3.5 text-xs text-faint">
        Un solo correo, el del lanzamiento. Demo sin servidor: nada se guarda.
      </p>
    </form>
  );
}
