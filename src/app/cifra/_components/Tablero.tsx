"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  comprimir,
  conjuntoDemo,
  filtrar,
  FILTROS_POR_DEFECTO,
  kpis,
  lineas,
  nombreEn,
  nombreMetrica,
  porFecha,
  porMesYCategoria,
  porSucursal,
  type Conjunto,
  type Filtros,
} from "@/lib/data/cifra";
import * as fmt from "@/lib/grafica/formato";
import { ControlesTablero } from "./ControlesTablero";
import { TarjetaKpi } from "./TarjetaKpi";
import { SerieTemporal } from "./SerieTemporal";
import { BarrasApiladas } from "./BarrasApiladas";
import { MapaCalendario } from "./MapaCalendario";
import { AnilloParticipacion } from "./AnilloParticipacion";
import { TablaSucursales } from "./TablaSucursales";
import { CargarDatos } from "./CargarDatos";
import { EVENTO_FILTRO } from "@/lib/data/eventos";

/** Serializa los filtros omitiendo los que están en su valor por defecto. */
function aQuery(f: Filtros): string {
  const q = new URLSearchParams();
  if (f.rango !== FILTROS_POR_DEFECTO.rango) q.set("r", f.rango);
  if (f.sucursal !== FILTROS_POR_DEFECTO.sucursal) q.set("s", f.sucursal);
  if (f.categoria !== FILTROS_POR_DEFECTO.categoria) q.set("c", f.categoria);
  if (f.metrica !== FILTROS_POR_DEFECTO.metrica) q.set("m", f.metrica);
  return q.toString();
}

function Panel({
  titulo,
  nota,
  children,
}: {
  titulo: string;
  nota?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4 sm:p-6">
      <header className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-medium tracking-tight">{titulo}</h3>
        {nota && <p className="text-xs text-faint">{nota}</p>}
      </header>
      {children}
    </section>
  );
}

/**
 * Orquestador del tablero.
 *
 * Todo el filtrado ocurre aquí, en memoria: los datos ya están cargados,
 * así que un clic no tiene por qué ir al servidor. La URL es un espejo del
 * estado —sirve para compartir la vista y para entrar directo a ella—, no
 * la fuente de la que se renderiza.
 *
 * De ahí que se escriba con history.replaceState y no con router.replace:
 * replaceState se integra con el router de Next sin disparar una nueva
 * carga RSC. Y `replace` y no `push` porque doce clics de filtro dejarían
 * doce entradas en el historial y el botón atrás dejaría de significar
 * "atrás"; a cambio, los filtros activos se ven y se quitan en pantalla.
 */
export function Tablero({ inicial }: { inicial: Filtros }) {
  const [conjunto, setConjunto] = useState<Conjunto>(conjuntoDemo);
  const [filtros, setFiltros] = useState<Filtros>(inicial);
  const [copiado, setCopiado] = useState(false);

  const cambiar = useCallback((parcial: Partial<Filtros>) => {
    setFiltros((previos) => {
      const siguiente = { ...previos, ...parcial };
      return siguiente;
    });
  }, []);

  // El espejo en la URL se escribe como efecto del estado, no dentro del
  // manejador: así una sola ruta lleva a la dirección, venga el cambio de
  // un control, de un clic en la gráfica o de la paleta de comandos.
  useEffect(() => {
    if (conjunto.origen !== "demo") return;
    const q = aQuery(filtros);
    window.history.replaceState(null, "", q ? `/cifra?${q}` : "/cifra");
  }, [filtros, conjunto.origen]);

  /**
   * La paleta de comandos vive en la cabecera, fuera de este árbol. Un
   * evento del documento las comunica sin levantar el estado a un proveedor
   * ni obligar a navegar —navegar perdería los datos que subió el visitante.
   */
  useEffect(() => {
    const alFiltrar = (e: Event) => {
      const detalle = (e as CustomEvent<Partial<Filtros>>).detail;
      if (detalle) cambiar(detalle);
    };

    window.addEventListener(EVENTO_FILTRO, alFiltrar);
    return () => window.removeEventListener(EVENTO_FILTRO, alFiltrar);
  }, [cambiar]);

  /**
   * Al cambiar de conjunto, los filtros pueden apuntar a catálogos que ya
   * no existen: "Polanco" no significa nada en el archivo de otra empresa.
   * Se sanean aquí en vez de dejar el tablero en blanco.
   */
  const recibirConjunto = useCallback((c: Conjunto) => {
    setConjunto(c);
    setFiltros((previos) => ({
      rango: previos.rango,
      metrica: c.metricas.includes(previos.metrica) ? previos.metrica : c.metricas[0],
      sucursal: c.sucursales.some((s) => s.id === previos.sucursal)
        ? previos.sucursal
        : "todas",
      categoria: c.categorias.some((k) => k.id === previos.categoria)
        ? previos.categoria
        : "todas",
    }));
  }, []);

  const limpiar = useCallback(() => {
    setFiltros((p) => ({ ...FILTROS_POR_DEFECTO, rango: p.rango, metrica: p.metrica }));
  }, []);

  const copiarEnlace = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1800);
    } catch {
      // Sin permiso de portapapeles no hay nada que hacer; la URL de la
      // barra de direcciones ya es la correcta, que es lo que importa.
    }
  }, []);

  const datos = useMemo(() => {
    const filas = filtrar(conjunto, filtros);

    return {
      kpis: kpis(conjunto, filtros),
      serie: comprimir(porFecha(filas, filtros.metrica)),
      calendario: porFecha(filas, filtros.metrica),
      /**
       * Las barras y el anillo se calculan ignorando su propia dimensión:
       * si al filtrar por "Calzado" las barras sólo mostraran calzado, el
       * usuario perdería de vista qué proporción eligió. Así el filtro se
       * lee como un resalte sobre el total, no como una amputación.
       */
      apilado: porMesYCategoria(
        conjunto,
        filtrar(conjunto, { ...filtros, categoria: "todas" }),
        filtros.metrica,
      ),
      sucursales: porSucursal(conjunto, { ...filtros, sucursal: "todas" }),
      tabla: lineas(conjunto, filtros),
    };
  }, [conjunto, filtros]);

  const hayFiltro =
    filtros.sucursal !== "todas" || filtros.categoria !== "todas";

  const descripcion = [
    nombreMetrica(filtros.metrica),
    filtros.sucursal !== "todas" &&
      `sucursal ${nombreEn(conjunto.sucursales, filtros.sucursal)}`,
    filtros.categoria !== "todas" &&
      `categoría ${nombreEn(conjunto.categorias, filtros.categoria)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-4">
      <CargarDatos conjunto={conjunto} onConjunto={recibirConjunto} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ControlesTablero
          conjunto={conjunto}
          filtros={filtros}
          onCambio={cambiar}
          onLimpiar={limpiar}
          hayFiltro={hayFiltro}
        />

        {conjunto.origen === "demo" && (
          <button
            type="button"
            onClick={copiarEnlace}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg"
          >
            {copiado ? "Enlace copiado" : "Copiar enlace de esta vista"}
          </button>
        )}
      </div>

      {/* El estado del tablero, dicho en palabras. Es lo que anuncia el
          cambio a quien no ve las gráficas moverse. */}
      <p aria-live="polite" className="text-xs text-faint">
        Mostrando {descripcion}. Corte al {fmt.diaLargo(conjunto.fechaCorte)}.
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {datos.kpis.map((k) => (
          <TarjetaKpi key={k.id} kpi={k} />
        ))}
      </div>

      <Panel
        titulo={nombreMetrica(filtros.metrica)}
        nota={
          datos.serie.length < datos.calendario.length
            ? `${datos.calendario.length} días agrupados en ${datos.serie.length} puntos`
            : `${datos.serie.length} días`
        }
      >
        <SerieTemporal
          puntos={datos.serie}
          metrica={filtros.metrica}
          etiqueta={`${nombreMetrica(filtros.metrica)} por día`}
        />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel titulo="Composición por categoría" nota="Clic para filtrar">
          <BarrasApiladas
            conjunto={conjunto}
            datos={datos.apilado}
            metrica={filtros.metrica}
            categoriaActiva={filtros.categoria}
            onCategoria={(categoria) => cambiar({ categoria })}
          />
        </Panel>

        <Panel titulo="Participación por sucursal" nota="Clic para filtrar">
          <AnilloParticipacion
            datos={datos.sucursales}
            metrica={filtros.metrica}
            sucursalActiva={filtros.sucursal}
            onSucursal={(sucursal) => cambiar({ sucursal })}
          />
        </Panel>
      </div>

      <Panel titulo="Intensidad por día" nota="Cuartiles de la distribución">
        <MapaCalendario puntos={datos.calendario} metrica={filtros.metrica} />
      </Panel>

      <Panel titulo="Líneas de negocio" nota="Ordena, busca y exporta">
        <TablaSucursales datos={datos.tabla} metrica={filtros.metrica} />
      </Panel>
    </div>
  );
}
