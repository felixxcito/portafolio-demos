import Image from "next/image";
import Link from "next/link";
import { blurs } from "@/lib/blurs";
import { Reveal } from "@/components/motion/Reveal";
import { Coleccion } from "./_components/Coleccion";
import { Calculadora } from "./_components/Calculadora";
import { FormVisita } from "./_components/FormVisita";

const NAV = [
  { href: "#coleccion", texto: "Colección" },
  { href: "#calculadora", texto: "Financiamiento" },
  { href: "#visita", texto: "Agendar visita" },
];

export default function Altura() {
  return (
    <>
      <a
        href="#coleccion"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:text-accent-fg"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="shell flex h-16 items-center justify-between gap-6 sm:h-[4.5rem]">
          <Link href="/altura" className="font-display text-2xl tracking-tight">
            Altura
          </Link>

          <nav aria-label="Secciones" className="hidden gap-8 text-sm md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-muted transition-colors hover:text-accent"
              >
                {n.texto}
              </a>
            ))}
          </nav>

          <Link
            href="/"
            className="min-h-11 rounded-full border border-line px-4 py-2 text-xs tracking-wide text-muted transition-colors hover:border-accent hover:text-accent"
          >
            ← Portafolio
          </Link>
        </div>
      </header>

      <main>
        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="relative flex min-h-[82svh] items-end overflow-hidden">
          <Image
            src="/img/altura/hero.webp"
            alt="Residencia contemporánea con alberca al atardecer"
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL={blurs["altura/hero"]}
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#12100d]/85 via-[#12100d]/25 to-transparent"
          />

          <div className="shell relative z-[2] pb-14 text-[#faf8f4] sm:pb-20">
            <p className="eyebrow !text-[#faf8f4]/70">
              Residencias de autor · México
            </p>
            <h1 className="mt-5 max-w-[16ch] font-display text-hero">
              Pocas casas. Elegidas una por una.
            </h1>
            <p className="mt-6 max-w-[50ch] text-lead text-[#faf8f4]/85">
              Trabajamos con seis residencias a la vez. Cada una se visita, se
              fotografía y se documenta antes de publicarse.
            </p>
            <a
              href="#coleccion"
              className="mt-9 inline-flex min-h-13 items-center rounded-full bg-[#faf8f4] px-8 py-3.5 text-sm font-medium text-[#1a1714] transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5"
            >
              Ver la colección
            </a>
          </div>
        </section>

        {/* ── Manifiesto ─────────────────────────────────────── */}
        <section className="shell border-b border-line py-20 sm:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <Reveal>
              <p className="eyebrow">Cómo trabajamos</p>
            </Reveal>
            <div className="space-y-7">
              <Reveal delay={80}>
                <p className="font-display text-title text-balance">
                  Una casa no se vende con adjetivos. Se vende con información
                  completa y luz honesta.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <p className="max-w-[58ch] text-lead text-muted">
                  Publicamos metros reales, año de construcción, nombre del
                  despacho y precio por metro cuadrado. Si algo de una propiedad
                  no nos convence, no entra al catálogo.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <dl className="grid grid-cols-2 gap-8 border-t border-line pt-8 sm:grid-cols-3">
                  {[
                    ["6", "residencias activas"],
                    ["4", "despachos aliados"],
                    ["21", "días promedio de cierre"],
                  ].map(([n, t]) => (
                    <div key={t}>
                      <dt className="font-display text-4xl tabular-nums">{n}</dt>
                      <dd className="mt-1.5 text-sm text-muted">{t}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Colección ──────────────────────────────────────── */}
        <section id="coleccion" className="shell scroll-mt-20 py-20 sm:py-28">
          <Reveal>
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">La colección</p>
                <h2 className="mt-3 font-display text-display">
                  Seis residencias
                </h2>
              </div>
              <p className="max-w-[42ch] text-sm leading-relaxed text-muted">
                Filtra por zona, recámaras o presupuesto. Selecciona hasta tres
                para compararlas lado a lado.
              </p>
            </div>
          </Reveal>

          <Coleccion />
        </section>

        {/* ── Calculadora ────────────────────────────────────── */}
        <section
          id="calculadora"
          className="scroll-mt-20 border-y border-line bg-elevated py-20 sm:py-28"
        >
          <div className="shell">
            <Reveal>
              <div className="mb-12 max-w-[46ch]">
                <p className="eyebrow">Financiamiento</p>
                <h2 className="mt-3 font-display text-display">
                  Cuánto costaría al mes
                </h2>
                <p className="mt-5 text-lead text-muted">
                  Mueve el enganche, el plazo y la tasa. El desglose se recalcula
                  mientras arrastras.
                </p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <Calculadora />
            </Reveal>
          </div>
        </section>

        {/* ── Visita ─────────────────────────────────────────── */}
        <section id="visita" className="shell scroll-mt-20 py-20 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <Reveal>
              <div>
                <p className="eyebrow">Agendar</p>
                <h2 className="mt-3 font-display text-display text-balance">
                  Conócela en persona
                </h2>
                <p className="mt-5 max-w-[40ch] text-lead text-muted">
                  Las visitas son con cita y sin traslape: una familia por
                  horario, para que puedan recorrer la casa con calma.
                </p>
                <dl className="mt-10 space-y-5 border-t border-line pt-8 text-sm">
                  {[
                    ["Horario", "Lunes a sábado, 9:00 a 19:00"],
                    ["Duración", "Aproximadamente 90 minutos"],
                    ["Contacto", "hola@altura.mx · 55 4000 1200"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6">
                      <dt className="text-faint">{k}</dt>
                      <dd className="text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <FormVisita />
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-12">
        <div className="shell flex flex-col gap-4 text-sm text-faint sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-2xl text-fg">Altura</p>
          <p>Proyecto demostrativo · Felix Rocha · 2026</p>
        </div>
      </footer>
    </>
  );
}
