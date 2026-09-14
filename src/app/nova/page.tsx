import Link from "next/link";
import { servicios } from "@/lib/data/casos";
import { Reveal } from "@/components/motion/Reveal";
import { Marquee } from "@/components/motion/Marquee";
import { Titular } from "@/components/motion/Titular";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Cursor } from "@/components/motion/Cursor";
import { Casos } from "./_components/Casos";
import { Contadores } from "./_components/Contadores";
import { FondoHero } from "./_components/FondoHero";

const PROCESO = [
  {
    n: "01",
    titulo: "Escuchar",
    texto:
      "Dos semanas hablando con quien vende, quien fabrica y quien compra. Antes de eso no dibujamos nada.",
  },
  {
    n: "02",
    titulo: "Encuadrar",
    texto:
      "Una sola frase que explique por qué existe la marca. Si no cabe en una frase, todavía no la entendimos.",
  },
  {
    n: "03",
    titulo: "Construir",
    texto:
      "Identidad, sistema y piezas reales el mismo día. Nada de manuales que nadie abre después.",
  },
  {
    n: "04",
    titulo: "Soltar",
    texto:
      "Entregamos con el equipo adentro, no por correo. A los tres meses volvemos a medir.",
  },
];

export default function Nova() {
  return (
    <>
      <SmoothScroll />
      <Cursor />

      <a
        href="#trabajo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:text-accent-fg"
      >
        Saltar al contenido
      </a>

      <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <div className="shell flex h-16 items-center justify-between gap-6 sm:h-20">
          <Link href="/nova" className="font-display text-2xl font-extrabold tracking-tight text-white">
            NOVA
          </Link>
          <nav aria-label="Secciones" className="hidden gap-8 text-sm text-white md:flex">
            <a href="#trabajo" className="transition-opacity hover:opacity-60">
              Trabajo
            </a>
            <a href="#estudio" className="transition-opacity hover:opacity-60">
              Estudio
            </a>
            <a href="#contacto" className="transition-opacity hover:opacity-60">
              Contacto
            </a>
          </nav>
          <Link
            href="/"
            className="text-xs tracking-wide text-white transition-opacity hover:opacity-60"
          >
            ← Portafolio
          </Link>
        </div>
      </header>

      <main>
        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="grain relative flex min-h-screen-d flex-col justify-end overflow-hidden pb-12 sm:pb-16">
          <FondoHero />

          {/* Dos velos: uno parejo que baja el brillo general de la
              escena y otro degradado abajo, donde vive el titular. El
              contraste del texto no puede depender de dónde caiga una
              partícula. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-bg/45" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-bg via-bg/92 to-transparent"
          />

          <div className="shell relative z-[2]">
            <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <p className="eyebrow">Estudio creativo · Ciudad de México</p>
              {/* La esfera se gira con el dedo o el cursor, pero nadie lo
                  descubre si no se le dice. */}
              <p className="eyebrow flex items-center gap-2 !text-accent/70">
                <span aria-hidden>✥</span> Arrastra el fondo
              </p>
            </div>

            <Titular as="h1" className="max-w-[13ch] font-display text-hero font-extrabold">
              Marcas que se reconocen sin el logo.
            </Titular>

            <div className="mt-9 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-[46ch] text-lead text-muted">
                Somos ocho personas. Tomamos cuatro proyectos al año y los
                llevamos completos, de la estrategia al último banner.
              </p>
              <a
                href="#contacto"
                className="inline-flex min-h-13 shrink-0 items-center rounded-full bg-accent px-8 text-sm font-medium text-accent-fg transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5"
              >
                Empezar un proyecto
              </a>
            </div>
          </div>
        </section>

        {/* ── Cinta de servicios ─────────────────────────────── */}
        <div className="border-y border-line py-6">
          <Marquee duracion={34} className="[--gap:2.5rem]">
            {servicios.map((s) => (
              <span
                key={s}
                className="flex items-center gap-[2.5rem] font-display text-[clamp(1.4rem,3.5vw,2.4rem)] font-bold whitespace-nowrap"
              >
                {s}
                <span aria-hidden className="text-accent">
                  ●
                </span>
              </span>
            ))}
          </Marquee>
        </div>

        {/* ── Estudio ────────────────────────────────────────── */}
        <section id="estudio" className="shell scroll-mt-24 py-24 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <Reveal>
              <p className="eyebrow">El estudio</p>
            </Reveal>

            <div>
              <Titular
                alScroll
                className="max-w-[20ch] font-display text-display font-bold text-balance"
              >
                No hacemos más bonito lo que ya existe. Cambiamos lo que significa.
              </Titular>

              <Reveal delay={120}>
                <p className="mt-8 max-w-[56ch] text-lead text-muted">
                  La mayoría de los rediseños son maquillaje: misma promesa,
                  tipografía nueva. Nosotros empezamos por la promesa. Si no hay
                  una razón real para que alguien prefiera esa marca, el diseño
                  sólo la hace más rápida de olvidar.
                </p>
              </Reveal>

              <div className="mt-16">
                <Contadores />
              </div>
            </div>
          </div>
        </section>

        {/* ── Casos ──────────────────────────────────────────── */}
        <Casos />

        {/* ── Proceso ────────────────────────────────────────── */}
        <section className="shell border-t border-line py-24 sm:py-32">
          <Reveal>
            <div className="max-w-[40ch]">
              <p className="eyebrow">Cómo trabajamos</p>
              <h2 className="mt-3 font-display text-display font-bold text-balance">
                Cuatro etapas, sin sorpresas
              </h2>
            </div>
          </Reveal>

          <ol className="mt-16 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {PROCESO.map((p, i) => (
              <Reveal as="li" key={p.n} delay={i * 90}>
                <div className="h-full bg-bg p-7 transition-colors duration-500 hover:bg-surface">
                  <p className="font-mono text-xs text-accent">{p.n}</p>
                  <h3 className="mt-5 font-display text-2xl font-bold">
                    {p.titulo}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {p.texto}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* ── Contacto ───────────────────────────────────────── */}
        <section
          id="contacto"
          className="shell scroll-mt-24 border-t border-line py-24 sm:py-36"
        >
          <Titular
            alScroll
            className="max-w-[14ch] font-display text-hero font-extrabold text-balance"
          >
            Cuéntanos qué estás construyendo.
          </Titular>

          <Reveal delay={140}>
            <div className="mt-12 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <a
                  href="mailto:hola@nova.studio"
                  className="block font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold underline decoration-1 underline-offset-8 transition-colors hover:text-accent"
                >
                  hola@nova.studio
                </a>
                <p className="text-sm text-muted">
                  Colima 184, Roma Norte · Ciudad de México
                </p>
              </div>

              <p className="max-w-[32ch] text-sm text-faint">
                Quedan dos lugares para 2026. Contestamos en menos de 48 horas.
              </p>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-line py-10">
        <div className="shell flex flex-col gap-3 text-sm text-faint sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-lg font-extrabold text-fg">NOVA</p>
          <p>Proyecto demostrativo · Felix Rocha · 2026</p>
        </div>
      </footer>
    </>
  );
}
