import { ImageResponse } from "next/og";
import { buscarReporte, reportes } from "@/lib/data/reportes";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Reporte de Cifra";

export function generateStaticParams() {
  return reportes.map((r) => ({ slug: r.slug }));
}

/**
 * Imagen de Open Graph por reporte.
 *
 * Sin fuente propia a propósito: cargarla obligaría a leer un binario en
 * build, y el resto del proyecto se autohospeda justamente para no depender
 * de la red. La composición y el color cargan el diseño.
 *
 * Dos límites de Satori que conviene recordar: no soporta `display: grid`
 * —todo contenedor con varios hijos necesita `display: flex` explícito— y
 * no acepta variables CSS, así que los colores van literales.
 */
export default async function Og({
  params,
}: {
  // En Next 16 params llega como promesa también en las rutas de imagen.
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const reporte = buscarReporte(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0f10",
          color: "#e9efee",
          padding: 72,
          // Malla técnica, igual que el hero del sitio.
          backgroundImage:
            "linear-gradient(rgba(233,239,238,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(233,239,238,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 4,
              background: "#2fd4bd",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 26, letterSpacing: 2, color: "#93a5a3" }}>
            CIFRA · REPORTE
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, color: "#2fd4bd", lineHeight: 1 }}>
            {reporte?.cifra.valor ?? "—"}
          </div>
          <div style={{ fontSize: 30, color: "#93a5a3", marginTop: 12 }}>
            {reporte?.cifra.pie ?? ""}
          </div>
          <div
            style={{
              fontSize: 56,
              lineHeight: 1.15,
              marginTop: 36,
              maxWidth: 940,
            }}
          >
            {reporte?.titulo ?? "Reporte no encontrado"}
          </div>
        </div>

        <div style={{ fontSize: 24, color: "#647774", display: "flex" }}>
          Inteligencia de datos para retail
        </div>
      </div>
    ),
    size,
  );
}
