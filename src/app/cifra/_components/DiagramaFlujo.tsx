const PASOS = [
  { id: "ingesta", titulo: "Ingesta", detalle: "Punto de venta, e-commerce y almacén, cada quince minutos." },
  { id: "normaliza", titulo: "Normalización", detalle: "Catálogos unificados, devoluciones netas, moneda y huso." },
  { id: "modelo", titulo: "Modelo", detalle: "Un solo grano diario del que cuelgan todas las métricas." },
  { id: "tablero", titulo: "Tablero", detalle: "La pregunta y la respuesta en la misma pantalla." },
];

/**
 * Diagrama del pipeline.
 *
 * Server Component: es un dibujo fijo, no tiene por qué costar JavaScript.
 * El trazo que conecta los pasos se anima con la misma clase que las
 * gráficas, así que bajo prefers-reduced-motion aparece completo.
 */
export function DiagramaFlujo() {
  return (
    <div>
      <svg
        viewBox="0 0 880 90"
        className="hidden h-24 w-full md:block"
        role="img"
        aria-label="Flujo: ingesta, normalización, modelo y tablero."
      >
        <path
          d="M 48 45 L 832 45"
          pathLength={100}
          style={{ "--largo": 100 } as React.CSSProperties}
          fill="none"
          stroke="var(--site-line)"
          strokeWidth={1.5}
          strokeDasharray="none"
        />
        <path
          d="M 48 45 L 832 45"
          pathLength={100}
          style={{ "--largo": 100 } as React.CSSProperties}
          fill="none"
          stroke="var(--site-accent)"
          strokeWidth={1.5}
          className="trazo-anim"
        />

        {PASOS.map((p, i) => {
          const x = 48 + (i * (832 - 48)) / (PASOS.length - 1);
          return (
            <g key={p.id}>
              <circle cx={x} cy={45} r={13} fill="var(--site-bg)" />
              <circle
                cx={x}
                cy={45}
                r={6}
                fill="var(--site-accent)"
              />
              <text
                x={x}
                y={22}
                textAnchor="middle"
                className="numerico fill-[var(--site-faint)] text-[0.62rem]"
              >
                {`0${i + 1}`}
              </text>
              <text
                x={x}
                y={76}
                textAnchor="middle"
                className="fill-[var(--site-fg)] text-[0.8rem] font-medium"
              >
                {p.titulo}
              </text>
            </g>
          );
        })}
      </svg>

      <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PASOS.map((p, i) => (
          <li key={p.id}>
            <span className="numerico text-xs text-accent">0{i + 1}</span>
            <h3 className="mt-1.5 font-medium md:sr-only">{p.titulo}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {p.detalle}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
