import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Marquee } from "@/components/motion/Marquee";
import {
  comprimir,
  conjuntoDemo,
  filtrar,
  FILTROS_POR_DEFECTO,
  leerFiltros,
  porFecha,
  DIAS_TOTALES,
  FECHA_CORTE,
} from "@/lib/data/cifra";
import { reportes } from "@/lib/data/reportes";
import * as fmt from "@/lib/grafica/formato";
import { Tablero } from "./_components/Tablero";
import { Chispa } from "./_components/Chispa";
import { DiagramaFlujo } from "./_components/DiagramaFlujo";
import { SimuladorImpacto } from "./_components/SimuladorImpacto";
import { PaletaComandos } from "./_components/PaletaComandos";
import { InterruptorTema } from "./_components/InterruptorTema";

const FUENTES = [
  "Punto de venta",
  "E-commerce",
  "Almacén",
  "Lealtad",
  "Conteo de piso",
  "Marketplace",
  "Devoluciones",
];

const SECCIONES = [
  { href: "#tablero", texto: "Tablero" },
  { href: "#como", texto: "Cómo funciona" },
  { href: "#simulador", texto: "Simulador" },
  { href: "#reportes", texto: "Reportes" },
];

/**
 * Portada de Cifra.
 *
 * Server Component. Lee los filtros de la query —que en Next 16 llega como
 * promesa y hay que esperar— y se los pasa al tablero como estado inicial.
 * Eso es lo que hace que un enlace compartido abra ya filtrado.
 *
 * Consecuencia conocida: usar searchParams vuelve esta ruta dinámica. No es
 * un costo accidental, es lo que le da sentido a loading.tsx.
 */
export default async function Cifra({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filtros = leerFiltros(await searchParams);

  // Serie ambiental del hero: dieciocho meses completos, sin filtrar.
  const ambiente = comprimir(
    porFecha(
      filtrar(conjuntoDemo(), { ...FILTROS_POR_DEFECTO, rango: "todo" }),
      "ingresos",
    ),
    64,
  ).map((p) => p.valor);

  return (
    <main className="min-h-screen-d">
      <a
        href="#tablero"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
      >
        Saltar al tablero
      </a>

      {/* ── Cabecera ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
        <div className="shell flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm whitespace-nowrap text-faint transition-colors hover:text-fg"
            >
              <span aria-hidden>←</span>
              <span className="hidden sm:inline">Portafolio</span>
              <span className="sr-only sm:hidden">Portafolio</span>
            </Link>
            <span aria-hidden className="h-4 w-px bg-[var(--site-line)]" />
            <span className="font-display truncate text-lg font-semibold tracking-tight">
              Cifra
            </span>
          </div>

          <nav aria-label="Secciones" className="hidden md:block">
            <ul className="flex items-center gap-6 text-sm text-muted">
              {SECCIONES.map((s) => (
                <li key={s.href}>
                  <a href={s.href} className="transition-colors hover:text-fg">
                    {s.texto}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <PaletaComandos />
            <InterruptorTema />
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line">
        {/* Malla técnica: da profundidad sin competir con el texto. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(var(--site-line) 1px, transparent 1px), linear-gradient(90deg, var(--site-line) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)",
          }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-56 opacity-30"
        >
          <Chispa valores={ambiente} ancho={1400} alto={220} />
        </div>

        <div className="shell relative py-20 sm:py-28">
          <p className="eyebrow">Inteligencia de datos para retail</p>

          <h1 className="font-display mt-6 max-w-[16ch] text-display font-semibold text-balance">
            Tus números, cuando todavía sirven de algo.
          </h1>

          <p className="mt-7 max-w-[54ch] text-lead text-muted">
            Cifra une punto de venta, e-commerce y almacén en un solo modelo
            diario. Sin exportar a hojas de cálculo, sin esperar al lunes y sin
            que dos áreas lleguen a la junta con cifras distintas. Y no hace
            falta creernos: sube tu CSV y velo con tus propios números.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#tablero"
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              Probar con mis datos
            </a>
            <a
              href="#reportes"
              className="rounded-lg border border-line px-5 py-2.5 text-sm transition-colors hover:border-accent/50"
            >
              Leer un reporte
            </a>
          </div>

          <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            {[
              { k: "Sucursales", v: "6" },
              { k: "Días de historia", v: String(DIAS_TOTALES) },
              { k: "Actualización", v: "15 min" },
              { k: "Fuentes", v: String(FUENTES.length) },
            ].map((i) => (
              <div key={i.k}>
                <dt className="text-xs text-faint">{i.k}</dt>
                <dd className="numerico mt-1 text-xl font-medium">{i.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Cinta de fuentes ───────────────────────────────────── */}
      <section
        aria-label="Fuentes conectadas"
        className="border-b border-line py-5"
      >
        <Marquee duracion={38}>
          <ul className="flex items-center gap-10 pr-10 text-sm text-faint">
            {FUENTES.map((f) => (
              <li key={f} className="flex items-center gap-10 whitespace-nowrap">
                {f}
                <span aria-hidden className="size-1 rounded-full bg-[var(--site-faint)]" />
              </li>
            ))}
          </ul>
        </Marquee>
      </section>

      {/* ── Tablero ────────────────────────────────────────────── */}
      <section id="tablero" className="shell scroll-mt-20 py-16 sm:py-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">El producto</p>
            <h2 className="font-display mt-3 text-title font-semibold">
              Tablero en vivo
            </h2>
            <p className="mt-3 max-w-[60ch] text-muted">
              Filtra, cruza y comparte: cada cambio queda en la dirección de la
              página, así que el enlace que copias abre exactamente esta vista.
              Y si arrastras tu propio CSV, el tablero entero se redibuja con
              tus números sin que el archivo salga de tu navegador.
            </p>
          </div>
          <p className="numerico text-xs text-faint">
            Corte al {fmt.diaLargo(FECHA_CORTE)}
          </p>
        </div>

        {/*
          key con los filtros del servidor: si alguien llega desde la paleta
          de comandos a /cifra?m=tickets, el servidor vuelve a renderizar con
          otro estado inicial, y sin la key el useState del tablero se
          quedaría con el anterior.
        */}
        <Tablero key={JSON.stringify(filtros)} inicial={filtros} />
      </section>

      {/* ── Cómo funciona ──────────────────────────────────────── */}
      <section
        id="como"
        className="border-y border-line bg-surface/40 py-16 scroll-mt-20 sm:py-24"
      >
        <div className="shell">
          <Reveal>
            <p className="eyebrow">Cómo funciona</p>
            <h2 className="font-display mt-3 max-w-[20ch] text-title font-semibold">
              Un solo modelo, cuatro pasos y ninguna hoja de cálculo.
            </h2>
          </Reveal>

          <Reveal delay={120} className="mt-12">
            <DiagramaFlujo />
          </Reveal>
        </div>
      </section>

      {/* ── Simulador ──────────────────────────────────────────── */}
      <section id="simulador" className="shell scroll-mt-20 py-16 sm:py-24">
        <Reveal>
          <p className="eyebrow">Simulador</p>
          <h2 className="font-display mt-3 max-w-[22ch] text-title font-semibold">
            Qué pasa si mueves tres palancas.
          </h2>
          <p className="mt-3 max-w-[56ch] text-muted">
            Las tres se multiplican entre sí, no se suman. Por eso mejoras
            pequeñas en varias a la vez rinden más que una grande sola.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-10">
          <SimuladorImpacto />
        </Reveal>
      </section>

      {/* ── Reportes ───────────────────────────────────────────── */}
      <section
        id="reportes"
        className="border-t border-line py-16 scroll-mt-20 sm:py-24"
      >
        <div className="shell">
          <Reveal>
            <p className="eyebrow">Reportes</p>
            <h2 className="font-display mt-3 text-title font-semibold">
              Lo que encontramos en los datos
            </h2>
          </Reveal>

          <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportes.map((r, i) => (
              <Reveal as="li" key={r.slug} delay={i * 70}>
                <Link
                  href={`/cifra/reportes/${r.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent/50"
                >
                  <p className="numerico text-2xl font-medium text-accent">
                    {r.cifra.valor}
                  </p>
                  <p className="mt-1 text-xs text-faint">{r.cifra.pie}</p>

                  <h3 className="mt-5 font-medium leading-snug text-balance">
                    {r.titulo}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    {r.entradilla}
                  </p>

                  <p className="mt-5 flex items-center justify-between text-xs text-faint">
                    <span>{fmt.mayuscula(fmt.mesLargo(r.fecha))}</span>
                    <span className="transition-transform group-hover:translate-x-1">
                      {r.lectura} min →
                    </span>
                  </p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Pie ────────────────────────────────────────────────── */}
      <footer className="border-t border-line py-12">
        <div className="shell flex flex-col gap-4 text-sm text-faint sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-base font-semibold text-fg">Cifra</p>
            <p className="mt-2 max-w-[46ch]">
              Demo del portafolio de Felix Arocha. Las gráficas están dibujadas
              a mano en SVG: ni una librería de charts.
            </p>
          </div>
          <p className="max-w-[34ch] sm:text-right">
            Datos sintéticos generados con semilla fija. Ventana de{" "}
            {DIAS_TOTALES} días al {fmt.diaLargo(FECHA_CORTE)}.
          </p>
        </div>
      </footer>
    </main>
  );
}
