import Link from "next/link";
import { proyectos } from "@/lib/data/proyectos";

export default function Hub() {
  return (
    <main className="grain relative min-h-screen-d overflow-hidden">
      {/* Halo de fondo: da profundidad sin competir con el contenido. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[110vh] w-[110vw] -translate-x-1/2 opacity-60"
        style={{
          background:
            "radial-gradient(closest-side, rgb(124 92 255 / 0.18), transparent 70%)",
        }}
      />

      <div className="shell relative z-[2] flex min-h-screen-d flex-col">
        <header className="flex items-baseline justify-between gap-4 py-8 sm:py-10">
          <span className="text-[0.95rem] font-medium tracking-tight">
            Felix Rocha
          </span>
          <span className="eyebrow">Portafolio · 2026</span>
        </header>

        <section className="flex flex-1 flex-col justify-center py-10 sm:py-16">
          <p className="eyebrow mb-6">Diseño y desarrollo web</p>
          <h1 className="max-w-[15ch] text-display font-semibold text-balance">
            Sitios que no solo se ven bien. Venden.
          </h1>
          <p className="mt-7 max-w-[52ch] text-lead text-muted">
            Tres piezas construidas de cero para mostrar el rango: dirección de
            arte, animación en tiempo real e interfaces que de verdad funcionan.
            Todas responsivas, accesibles y listas para producción.
          </p>
        </section>

        <nav aria-label="Proyectos" className="border-t border-line pb-16">
          <ul>
            {proyectos.map((p, i) => (
              <li key={p.slug}>
                <Link
                  href={`/${p.slug}`}
                  style={
                    {
                      "--a": p.accent,
                      "--afg": p.accentFg,
                    } as React.CSSProperties
                  }
                  className="group relative block border-b border-line py-7 transition-colors duration-500 ease-[var(--ease-out-expo)] sm:py-9 hover:[--fgx:var(--afg)]"
                >
                  {/* Relleno que barre de izquierda a derecha en hover. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-[-1.5rem] inset-y-0 origin-left scale-x-0 rounded-sm bg-[var(--a)] transition-transform duration-600 ease-[var(--ease-out-expo)] motion-safe:group-hover:scale-x-100"
                  />

                  <div className="relative z-[1] flex items-start gap-4 sm:items-center sm:gap-8">
                    <span className="mt-1 font-mono text-micro text-faint transition-colors duration-400 group-hover:text-[var(--afg)]/60 sm:mt-0">
                      0{i + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <h2 className="text-title font-semibold tracking-tight transition-colors duration-400 group-hover:text-[var(--afg)]">
                          {p.marca}
                        </h2>
                        <span className="text-sm text-muted transition-colors duration-400 group-hover:text-[var(--afg)]/75">
                          {p.vertical}
                        </span>
                      </div>

                      <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-muted transition-colors duration-400 group-hover:text-[var(--afg)]/80">
                        {p.descripcion}
                      </p>

                      <ul className="mt-4 flex flex-wrap gap-2">
                        {p.tags.map((t) => (
                          <li
                            key={t}
                            className="rounded-full border border-line px-3 py-1 text-[0.7rem] tracking-wide text-faint transition-colors duration-400 group-hover:border-[var(--afg)]/25 group-hover:text-[var(--afg)]/70"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Marcador de color: en móvil es lo que identifica
                        cada proyecto, ya que no hay hover. */}
                    <span
                      aria-hidden
                      className="mt-2 size-3 shrink-0 rounded-full bg-[var(--a)] transition-all duration-400 group-hover:bg-[var(--afg)] sm:mt-0 sm:size-2.5"
                    />

                    <span
                      aria-hidden
                      className="hidden shrink-0 text-xl transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1 group-hover:text-[var(--afg)] sm:block"
                    >
                      →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <footer className="flex flex-col gap-2 border-t border-line py-8 text-sm text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>Next.js · TypeScript · Tailwind · Three.js · GSAP</p>
          <p>Construido en 2026</p>
        </footer>
      </div>
    </main>
  );
}
