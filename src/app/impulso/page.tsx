import Image from "next/image";
import Link from "next/link";
import { blurs } from "@/lib/blurs";
import { Reveal } from "@/components/motion/Reveal";
import { Marquee } from "@/components/motion/Marquee";
import { ProgresoScroll } from "@/components/motion/ProgresoScroll";
import { Cuenta } from "./_components/Cuenta";
import { Configurador } from "./_components/Configurador";
import { Planes } from "./_components/Planes";
import { FormLead } from "./_components/FormLead";
import { CtaFijo } from "./_components/CtaFijo";

const ESPECIFICACIONES = [
  {
    titulo: "Sala completa, un solo punto",
    texto:
      "Seis transductores en arreglo circular y corrección de fase en tiempo real. El sonido deja de tener una dirección evidente.",
    dato: "6",
    unidad: "transductores",
  },
  {
    titulo: "Se calibra al cuarto",
    texto:
      "Un micrófono interno mide el rebote de tus paredes cada vez que lo mueves y reescribe la ecualización en segundos.",
    dato: "12 s",
    unidad: "de calibración",
  },
  {
    titulo: "Batería que aguanta el fin de semana",
    texto:
      "Treinta horas reales a volumen de reunión. Carga completa en poco más de una hora por USB-C.",
    dato: "30 h",
    unidad: "de reproducción",
  },
  {
    titulo: "Aluminio reciclado",
    texto:
      "Cuerpo maquinado en una sola pieza de aluminio de origen reciclado, reparable y con refacciones a diez años.",
    dato: "100%",
    unidad: "aluminio reciclado",
  },
];

const TESTIMONIOS = [
  {
    cita: "Llevaba años persiguiendo este sonido con equipos cuatro veces más caros.",
    nombre: "Valeria Ontiveros",
    rol: "Productora musical",
    foto: "/img/impulso/t-01.webp",
  },
  {
    cita: "Lo conecté, se calibró solo y no volví a tocar un ajuste. Eso es diseño.",
    nombre: "Rodrigo Anaya",
    rol: "Director de arte",
    foto: "/img/impulso/t-02.webp",
  },
  {
    cita: "Cabe en una mano y llena una terraza entera. Todavía no me lo explico.",
    nombre: "Daniela Sepúlveda",
    rol: "Arquitecta",
    foto: "/img/impulso/t-03.webp",
  },
];

const CINTA = [
  "Estéreo real",
  "30 h de batería",
  "Calibración automática",
  "USB-C",
  "Aluminio reciclado",
  "Sin suscripciones",
];

export default function Impulso() {
  return (
    <>
      <ProgresoScroll />

      <a
        href="#producto"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:text-accent-fg"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
        <div className="shell flex h-16 items-center justify-between gap-6">
          <Link href="/impulso" className="font-display text-xl font-bold tracking-tight">
            IMPULSO
          </Link>
          <nav aria-label="Secciones" className="hidden gap-8 text-sm md:flex">
            <a href="#producto" className="text-muted transition-colors hover:text-accent">
              Producto
            </a>
            <a href="#planes" className="text-muted transition-colors hover:text-accent">
              Planes
            </a>
            <a href="#reserva" className="text-muted transition-colors hover:text-accent">
              Reservar
            </a>
          </nav>
          <Link
            href="/"
            className="min-h-11 rounded-full border border-line px-4 py-2 text-xs tracking-wide text-muted transition-colors hover:border-accent hover:text-accent"
          >
            ← Portafolio
          </Link>
        </div>
      </header>

      <main className="pb-24 md:pb-0">
        {/* ── Hero ───────────────────────────────────────────── */}
        <section id="producto" className="relative scroll-mt-16 overflow-hidden">
          {/* Degradado de malla: dos halos suaves dan profundidad sin
              costar una sola textura. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 55% at 78% 18%, rgb(124 92 255 / 0.3), transparent 70%), radial-gradient(50% 50% at 12% 82%, rgb(34 211 238 / 0.16), transparent 70%)",
            }}
          />

          <div className="shell relative grid gap-14 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-1.5 text-xs tracking-wide text-muted backdrop-blur-sm">
                <span className="size-1.5 animate-pulse rounded-full bg-accent" />
                Preventa abierta · edición limitada
              </p>

              <h1 className="mt-7 font-display text-hero font-bold text-balance">
                El cuarto entero.<br />
                <span className="text-accent">Un solo altavoz.</span>
              </h1>

              <p className="mt-6 max-w-[48ch] text-lead text-muted">
                Impulso One mide tu habitación y reescribe su ecualización cada
                vez que lo mueves. Sin app obligatoria, sin suscripción, sin
                configurar nada.
              </p>

              <div className="mt-10">
                <p className="eyebrow mb-3.5">Lanzamiento en</p>
                <Cuenta />
              </div>

              <div className="mt-10 max-w-lg">
                <FormLead />
              </div>
            </div>

            <Configurador />
          </div>

          <div className="border-y border-line py-4">
            <Marquee duracion={38} className="[--gap:3.5rem] text-sm text-faint">
              {CINTA.map((t) => (
                <span key={t} className="flex items-center gap-[3.5rem] whitespace-nowrap">
                  {t}
                  <span aria-hidden className="text-accent">
                    ✦
                  </span>
                </span>
              ))}
            </Marquee>
          </div>
        </section>

        {/* ── Especificaciones ───────────────────────────────── */}
        <section className="shell py-20 sm:py-28">
          <Reveal>
            <div className="max-w-[44ch]">
              <p className="eyebrow">Por dentro</p>
              <h2 className="mt-3 font-display text-display font-bold text-balance">
                Ingeniería que no pide atención
              </h2>
            </div>
          </Reveal>

          <ul className="mt-14 grid gap-6 sm:grid-cols-2">
            {ESPECIFICACIONES.map((e, i) => (
              <Reveal as="li" key={e.titulo} delay={i * 80}>
                <div className="h-full rounded-2xl border border-line bg-surface p-7 transition-colors duration-500 hover:border-accent/45">
                  <p className="font-display text-4xl font-bold text-accent tabular-nums">
                    {e.dato}
                  </p>
                  <p className="mt-1 text-xs tracking-wide text-faint uppercase">
                    {e.unidad}
                  </p>
                  <h3 className="mt-6 text-lg font-medium">{e.titulo}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">
                    {e.texto}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* ── Imagen ambiente ────────────────────────────────── */}
        <section className="relative h-[52svh] min-h-80 overflow-hidden sm:h-[62svh]">
          <Image
            src="/img/impulso/amb-01.webp"
            alt="Composición abstracta en tonos violeta"
            fill
            sizes="100vw"
            placeholder="blur"
            blurDataURL={blurs["impulso/amb-01"]}
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-bg/55" />
          <div className="shell relative flex h-full items-center">
            <Reveal>
              <p className="max-w-[22ch] font-display text-display font-bold text-balance">
                Se escucha como si no hubiera aparato.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Planes ─────────────────────────────────────────── */}
        <section id="planes" className="shell scroll-mt-16 py-20 sm:py-28">
          <Reveal>
            <div className="mx-auto max-w-[42ch] text-center">
              <p className="eyebrow">Planes</p>
              <h2 className="mt-3 font-display text-display font-bold text-balance">
                Uno, dos o toda la casa
              </h2>
              <p className="mt-5 text-lead text-muted">
                Paga por año y te ahorras el equivalente a dos meses y medio.
              </p>
            </div>
          </Reveal>

          <div className="mt-14">
            <Planes />
          </div>
        </section>

        {/* ── Testimonios ────────────────────────────────────── */}
        <section className="overflow-hidden border-y border-line bg-surface py-20 sm:py-24">
          <div className="shell mb-12">
            <p className="eyebrow">Quienes ya lo tienen</p>
          </div>

          <Marquee duracion={48} className="[--gap:1.5rem]">
            {TESTIMONIOS.map((t) => (
              <figure
                key={t.nombre}
                className="w-[19rem] shrink-0 rounded-2xl border border-line bg-bg p-7 sm:w-[24rem]"
              >
                <blockquote className="text-lg leading-relaxed text-balance">
                  “{t.cita}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3.5">
                  <Image
                    src={t.foto}
                    alt=""
                    width={44}
                    height={44}
                    placeholder="blur"
                    blurDataURL={blurs[t.foto.replace("/img/", "").replace(".webp", "")]}
                    className="size-11 rounded-full object-cover"
                  />
                  <span>
                    <span className="block text-sm font-medium">{t.nombre}</span>
                    <span className="block text-xs text-faint">{t.rol}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </Marquee>
        </section>

        {/* ── Reserva ────────────────────────────────────────── */}
        <section id="reserva" className="shell scroll-mt-16 py-20 sm:py-28">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-line p-8 sm:p-14">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(70% 80% at 85% 10%, rgb(124 92 255 / 0.26), transparent 70%)",
                }}
              />
              <div className="relative max-w-[54ch]">
                <h2 className="font-display text-display font-bold text-balance">
                  Las primeras 500 unidades salen numeradas
                </h2>
                <p className="mt-5 text-lead text-muted">
                  Quienes aparten su lugar ahora eligen acabado antes que nadie y
                  reciben el suyo dos semanas antes del lanzamiento público.
                </p>
                <div className="mt-10 max-w-lg">
                  <FormLead />
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <CtaFijo />

      <footer className="border-t border-line py-12">
        <div className="shell flex flex-col gap-4 text-sm text-faint sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-lg font-bold text-fg">IMPULSO</p>
          <p>Proyecto demostrativo · Felix Arocha · 2026</p>
        </div>
      </footer>
    </>
  );
}
