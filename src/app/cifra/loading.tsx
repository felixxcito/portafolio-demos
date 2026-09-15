/**
 * Esqueleto del tablero.
 *
 * Esta ruta lee searchParams, así que se renderiza por petición y hay una
 * espera real que llenar. El esqueleto copia la silueta del tablero —cuatro
 * tarjetas, una gráfica ancha, dos paneles— para que al llegar el contenido
 * nada se mueva de sitio.
 */
export default function Cargando() {
  return (
    <div className="shell py-24" aria-busy="true" aria-label="Cargando el tablero">
      <div className="esqueleto h-4 w-40" />
      <div className="esqueleto mt-4 h-9 w-72" />

      <div className="mt-10 flex flex-wrap gap-3">
        <div className="esqueleto h-10 w-64" />
        <div className="esqueleto h-10 w-72" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="esqueleto h-36" />
        ))}
      </div>

      <div className="esqueleto mt-4 h-[26rem]" />

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="esqueleto h-[24rem]" />
        <div className="esqueleto h-[24rem]" />
      </div>

      <p className="sr-only">Cargando el tablero…</p>
    </div>
  );
}
