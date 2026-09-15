import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  comprimir,
  conjuntoDemo,
  filtrar,
  nombreMetrica,
  porFecha,
  type Filtros,
} from "@/lib/data/cifra";
import { buscarReporte, reportes } from "@/lib/data/reportes";
import * as fmt from "@/lib/grafica/formato";
import { SerieTemporal } from "../../_components/SerieTemporal";
import { InterruptorTema } from "../../_components/InterruptorTema";

/**
 * A diferencia de /cifra —que lee searchParams y por eso es dinámica—
 * estas rutas se prerrenderizan en build. El contraste entre ambas es
 * parte de lo que la demo enseña.
 */
export function generateStaticParams() {
  return reportes.map((r) => ({ slug: r.slug }));
}

/** Sin slugs fuera del catálogo: cualquier otro da 404 directo. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // En Next 16 params es una promesa incluso aquí; el acceso síncrono
  // desapareció del todo.
  const { slug } = await params;
  const reporte = buscarReporte(slug);

  if (!reporte) return { title: "Reporte no encontrado" };

  return {
    title: reporte.titulo,
    description: reporte.entradilla,
    openGraph: {
      title: reporte.titulo,
      description: reporte.entradilla,
      type: "article",
      publishedTime: reporte.fecha,
    },
  };
}

export default async function ReporteCifra({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const reporte = buscarReporte(slug);

  if (!reporte) notFound();

  const filtros: Filtros = {
    rango: reporte.vista.rango,
    metrica: reporte.vista.metrica,
    sucursal: reporte.vista.sucursal ?? "todas",
    categoria: reporte.vista.categoria ?? "todas",
  };

  const serie = comprimir(
    porFecha(filtrar(conjuntoDemo(), filtros), filtros.metrica),
    110,
  );

  // Enlace al tablero con la misma vista que sostiene el reporte.
  const query = new URLSearchParams({
    r: filtros.rango,
    m: filtros.metrica,
    ...(filtros.sucursal !== "todas" && { s: filtros.sucursal }),
    ...(filtros.categoria !== "todas" && { c: filtros.categoria }),
  });

  const otros = reportes.filter((r) => r.slug !== reporte.slug).slice(0, 2);

  return (
    <main className="min-h-screen-d">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
        <div className="shell flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <Link
              href="/cifra#reportes"
              className="flex items-center gap-1.5 text-sm whitespace-nowrap text-faint transition-colors hover:text-fg"
            >
              <span aria-hidden>←</span>
              <span className="hidden sm:inline">Reportes</span>
              <span className="sr-only sm:hidden">Reportes</span>
            </Link>
            <span aria-hidden className="h-4 w-px bg-[var(--site-line)]" />
            <Link
              href="/cifra"
              className="font-display truncate text-lg font-semibold tracking-tight"
            >
              Cifra
            </Link>
          </div>
          <InterruptorTema />
        </div>
      </header>

      <article className="shell py-16 sm:py-24">
        <div className="mx-auto max-w-[44rem]">
          <p className="eyebrow">
            {fmt.mayuscula(fmt.diaLargo(reporte.fecha))} · {reporte.lectura} min
          </p>

          <h1 className="font-display mt-5 text-title font-semibold text-balance">
            {reporte.titulo}
          </h1>

          <p className="mt-5 text-lead text-muted">{reporte.entradilla}</p>

          <div className="mt-8 flex items-baseline gap-4 border-y border-line py-6">
            <p className="numerico text-4xl font-medium text-accent">
              {reporte.cifra.valor}
            </p>
            <p className="text-sm text-muted">{reporte.cifra.pie}</p>
          </div>
        </div>

        <section className="mt-12 rounded-xl border border-line bg-surface p-4 sm:p-6">
          <header className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-medium tracking-tight">
              {nombreMetrica(filtros.metrica)} · la vista que sostiene el reporte
            </h2>
            <Link
              href={`/cifra?${query.toString()}#tablero`}
              className="text-sm text-accent underline-offset-4 hover:underline"
            >
              Abrir en el tablero →
            </Link>
          </header>

          <SerieTemporal
            puntos={serie}
            metrica={filtros.metrica}
            etiqueta={`${nombreMetrica(filtros.metrica)} en el periodo del reporte`}
          />
        </section>

        <div className="mx-auto mt-14 max-w-[44rem]">
          {reporte.secciones.map((s) => (
            <section key={s.titulo} className="mt-10 first:mt-0">
              <h2 className="font-display text-xl font-semibold">{s.titulo}</h2>
              {s.parrafos.map((p, i) => (
                <p key={i} className="mt-4 leading-[1.75] text-muted">
                  {p}
                </p>
              ))}
            </section>
          ))}

          <p className="mt-12 border-t border-line pt-6 text-sm text-faint">
            {reporte.autor} · Datos sintéticos generados con semilla fija.
          </p>
        </div>
      </article>

      <section className="border-t border-line py-14">
        <div className="shell">
          <h2 className="eyebrow">Seguir leyendo</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {otros.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/cifra/reportes/${r.slug}`}
                  className="group block rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent/50"
                >
                  <p className="numerico text-xl font-medium text-accent">
                    {r.cifra.valor}
                  </p>
                  <h3 className="mt-3 font-medium leading-snug text-balance">
                    {r.titulo}
                  </h3>
                  <p className="mt-3 text-xs text-faint transition-transform group-hover:translate-x-1">
                    {r.lectura} min →
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
