/**
 * Datos de Cifra.
 *
 * Este módulo no exporta un JSON: exporta un generador. Dieciocho meses de
 * historia diaria para seis sucursales y cinco categorías son ~16 mil filas,
 * más de un megabyte si viajaran serializadas. El generador pesa tres kilos
 * y produce exactamente la misma serie en el servidor y en el navegador.
 *
 * Esa igualdad no es casualidad, es el requisito: si los dos lados no
 * calcularan lo mismo, la hidratación reventaría. De ahí las dos reglas
 * duras de este archivo — nada de Math.random() y nada de new Date().
 */

export type Metrica = "ingresos" | "tickets" | "unidades" | "visitantes";
export type Rango = "30d" | "90d" | "12m" | "todo";

export type Fila = {
  /** ISO corto, "2026-08-31". */
  fecha: string;
  /** Días transcurridos desde el inicio de la serie. */
  dia: number;
  sucursal: string;
  categoria: string;
  ingresos: number;
  tickets: number;
  unidades: number;
  visitantes: number;
};

/* ── Catálogos ────────────────────────────────────────────── */

export const SUCURSALES = [
  { id: "polanco", nombre: "Polanco", ciudad: "Ciudad de México", peso: 1.32 },
  { id: "santafe", nombre: "Santa Fe", ciudad: "Ciudad de México", peso: 1.14 },
  { id: "valle", nombre: "Valle", ciudad: "Monterrey", peso: 1.05 },
  { id: "andares", nombre: "Andares", ciudad: "Guadalajara", peso: 0.96 },
  { id: "altabrisa", nombre: "Altabrisa", ciudad: "Mérida", peso: 0.74 },
  { id: "angelopolis", nombre: "Angelópolis", ciudad: "Puebla", peso: 0.81 },
] as const;

/**
 * Cada categoría tiene su propia forma de semana. Es lo que hace que el
 * cross-filtering signifique algo: al aislar "Café" la curva se aplana de
 * lunes a viernes, al aislar "Ropa" se dispara el sábado.
 *
 * `semana` va de domingo a sábado.
 */
export const CATEGORIAS = [
  {
    id: "ropa",
    nombre: "Ropa",
    peso: 1.0,
    ticket: 1180,
    piezas: 1.9,
    semana: [1.22, 0.74, 0.78, 0.86, 0.94, 1.24, 1.42],
  },
  {
    id: "calzado",
    nombre: "Calzado",
    peso: 0.72,
    ticket: 1640,
    piezas: 1.3,
    semana: [1.18, 0.78, 0.82, 0.88, 0.96, 1.2, 1.38],
  },
  {
    id: "accesorios",
    nombre: "Accesorios",
    peso: 0.48,
    ticket: 640,
    piezas: 2.4,
    semana: [1.12, 0.86, 0.9, 0.94, 1.0, 1.14, 1.24],
  },
  {
    id: "hogar",
    nombre: "Hogar",
    peso: 0.61,
    ticket: 1320,
    piezas: 2.1,
    semana: [1.3, 0.72, 0.76, 0.82, 0.9, 1.18, 1.42],
  },
  {
    id: "cafe",
    nombre: "Café",
    peso: 0.34,
    ticket: 185,
    piezas: 2.8,
    semana: [0.82, 1.14, 1.18, 1.16, 1.2, 1.12, 0.88],
  },
] as const;

export const METRICAS: { id: Metrica; nombre: string; abrev: string }[] = [
  { id: "ingresos", nombre: "Ingresos", abrev: "MXN" },
  { id: "tickets", nombre: "Tickets", abrev: "tickets" },
  { id: "unidades", nombre: "Unidades", abrev: "piezas" },
  { id: "visitantes", nombre: "Visitantes", abrev: "visitas" },
];

export const RANGOS: { id: Rango; nombre: string; dias: number }[] = [
  { id: "30d", nombre: "30 días", dias: 30 },
  { id: "90d", nombre: "90 días", dias: 90 },
  { id: "12m", nombre: "12 meses", dias: 365 },
  { id: "todo", nombre: "Todo", dias: 548 },
];

/**
 * El "hoy" de la demo, congelado.
 *
 * Con new Date() el servidor y el cliente renderizarían días distintos en
 * cuanto el reloj cruzara la medianoche entre una y otra ejecución, y la
 * demo envejecería sola. Aquí el presente es una constante.
 */
export const FECHA_CORTE = "2026-08-31";
export const DIAS_TOTALES = 548;

/* ── Generador ────────────────────────────────────────────── */

/**
 * mulberry32: PRNG de 32 bits, determinista y suficientemente bueno para
 * ruido visual. Lo importante no es su calidad estadística sino que la
 * misma semilla dé la misma secuencia en cualquier motor de JavaScript.
 */
function mulberry32(semilla: number) {
  return function () {
    semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Estacionalidad del calendario comercial mexicano. */
function factorAnual(mes: number, diaMes: number): number {
  if (mes === 11) return diaMes <= 24 ? 1.52 : 1.05; // diciembre, y la caída post-Navidad
  if (mes === 10) return diaMes >= 14 && diaMes <= 20 ? 1.68 : 1.14; // Buen Fin
  if (mes === 0) return 0.81; // cuesta de enero
  if (mes === 1) return 0.92;
  if (mes === 4) return 1.16; // 10 de mayo
  if (mes === 6 || mes === 7) return 1.08; // vacaciones
  return 1;
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function generar(): Fila[] {
  const filas: Fila[] = [];
  const fin = new Date(`${FECHA_CORTE}T00:00:00Z`);
  const inicio = new Date(fin);
  inicio.setUTCDate(inicio.getUTCDate() - (DIAS_TOTALES - 1));

  for (let dia = 0; dia < DIAS_TOTALES; dia++) {
    const fecha = new Date(inicio);
    fecha.setUTCDate(inicio.getUTCDate() + dia);

    const diaSemana = fecha.getUTCDay();
    const anual = factorAnual(fecha.getUTCMonth(), fecha.getUTCDate());
    // Crecimiento compuesto suave: +38% de punta a punta en 18 meses.
    const tendencia = 1 + 0.38 * (dia / DIAS_TOTALES);

    for (let s = 0; s < SUCURSALES.length; s++) {
      const suc = SUCURSALES[s];

      for (let c = 0; c < CATEGORIAS.length; c++) {
        const cat = CATEGORIAS[c];
        // Semilla derivada de la posición: reproducible y distinta por celda.
        const rnd = mulberry32(dia * 8191 + s * 131 + c * 17 + 1);

        const ruido = 0.86 + rnd() * 0.28;
        const base = 42_000 * suc.peso * cat.peso;
        const ingresos = Math.round(
          base * tendencia * cat.semana[diaSemana] * anual * ruido,
        );

        const tickets = Math.max(1, Math.round(ingresos / cat.ticket));
        const unidades = Math.round(tickets * cat.piezas * (0.92 + rnd() * 0.16));
        // Conversión de piso: entre 18% y 26% según sucursal y día.
        const conversion = 0.18 + rnd() * 0.08;
        const visitantes = Math.round(tickets / conversion);

        filas.push({
          fecha: iso(fecha),
          dia,
          sucursal: suc.id,
          categoria: cat.id,
          ingresos,
          tickets,
          unidades,
          visitantes,
        });
      }
    }
  }

  return filas;
}

/**
 * Memoización a nivel de módulo. La generación cuesta unos milisegundos,
 * pero se consulta en cada filtro: conviene pagarla una sola vez por
 * proceso y por pestaña.
 */
let memoria: Fila[] | null = null;

export function serie(): Fila[] {
  if (memoria === null) memoria = generar();
  return memoria;
}

/* ── Conjunto de datos ───────────────────────────────────── */

export type Catalogo = { id: string; nombre: string; ciudad?: string };

/**
 * Un conjunto de datos y sus catálogos.
 *
 * El tablero no habla con el generador: habla con un Conjunto. Eso es lo
 * que permite que los mismos componentes rendericen la demo o el archivo
 * que suba un visitante, sin una sola rama de "si es demo entonces…".
 */
export type Conjunto = {
  filas: Fila[];
  sucursales: Catalogo[];
  categorias: Catalogo[];
  /** Último día con datos, en ISO corto. */
  fechaCorte: string;
  dias: number;
  /** Métricas que el conjunto trae de verdad. Un archivo ajeno puede no
      incluir tickets o visitantes, y ofrecer esas vistas mostraría ceros. */
  metricas: Metrica[];
  origen: "demo" | "archivo";
  nombreArchivo?: string;
};

let demoMemo: Conjunto | null = null;

/** El conjunto de demostración, memoizado por proceso y por pestaña. */
export function conjuntoDemo(): Conjunto {
  if (demoMemo) return demoMemo;

  demoMemo = {
    filas: serie(),
    sucursales: SUCURSALES.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      ciudad: s.ciudad,
    })),
    categorias: CATEGORIAS.map((c) => ({ id: c.id, nombre: c.nombre })),
    fechaCorte: FECHA_CORTE,
    dias: DIAS_TOTALES,
    metricas: METRICAS.map((m) => m.id),
    origen: "demo",
  };

  return demoMemo;
}

/**
 * Arma un conjunto a partir de filas sueltas —las de un archivo subido—.
 *
 * Los catálogos se deducen de los propios datos en vez de imponerse, y el
 * índice `dia` se recalcula contra la primera fecha presente: el archivo de
 * un visitante no tiene por qué empezar donde empieza la demo.
 */
export function conjuntoDesdeFilas(
  crudas: Omit<Fila, "dia">[],
  nombreArchivo: string,
  metricas: Metrica[],
): Conjunto {
  const ordenadas = [...crudas].sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  const primera = ordenadas[0]?.fecha ?? FECHA_CORTE;
  const ultima = ordenadas[ordenadas.length - 1]?.fecha ?? FECHA_CORTE;
  const origen = Date.parse(`${primera}T00:00:00Z`);

  const filas: Fila[] = ordenadas.map((f) => ({
    ...f,
    dia: Math.round((Date.parse(`${f.fecha}T00:00:00Z`) - origen) / 86_400_000),
  }));

  const catalogo = (llave: "sucursal" | "categoria"): Catalogo[] => {
    const vistos = new Map<string, string>();
    for (const f of filas) if (!vistos.has(f[llave])) vistos.set(f[llave], f[llave]);
    return [...vistos.keys()].sort((a, b) => a.localeCompare(b, "es-MX"))
      .map((id) => ({ id, nombre: id }));
  };

  return {
    filas,
    sucursales: catalogo("sucursal"),
    categorias: catalogo("categoria"),
    fechaCorte: ultima,
    dias: filas.length ? filas[filas.length - 1].dia + 1 : 0,
    metricas: metricas.length ? metricas : ["ingresos"],
    origen: "archivo",
    nombreArchivo,
  };
}

/* ── Filtro y agregación ──────────────────────────────────── */

export type Filtros = {
  rango: Rango;
  sucursal: string; // id o "todas"
  categoria: string; // id o "todas"
  metrica: Metrica;
};

export const FILTROS_POR_DEFECTO: Filtros = {
  rango: "90d",
  sucursal: "todas",
  categoria: "todas",
  metrica: "ingresos",
};

/** Días que abarca un rango, acotado a la historia disponible. */
export function diasDe(rango: Rango, disponibles: number): number {
  const pedidos = RANGOS.find((r) => r.id === rango)?.dias ?? 90;
  return Math.min(pedidos, disponibles);
}

/**
 * Filtra el conjunto. `desplazamiento` en periodos permite pedir el tramo
 * anterior con la misma longitud, que es lo que necesita el delta de los
 * KPIs: comparar 30 días contra los 30 previos, no contra el año.
 */
export function filtrar(c: Conjunto, f: Filtros, desplazamiento = 0): Fila[] {
  const dias = diasDe(f.rango, c.dias);
  const hasta = c.dias - 1 - dias * desplazamiento;
  const desde = hasta - dias + 1;

  return c.filas.filter(
    (r) =>
      r.dia >= desde &&
      r.dia <= hasta &&
      (f.sucursal === "todas" || r.sucursal === f.sucursal) &&
      (f.categoria === "todas" || r.categoria === f.categoria),
  );
}

export function sumar(filas: Fila[], m: Metrica): number {
  let t = 0;
  for (const f of filas) t += f[m];
  return t;
}

/** Agrupa sumando una métrica por la clave que devuelva `llave`. */
export function agrupar(
  filas: Fila[],
  llave: (f: Fila) => string,
  m: Metrica,
): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const f of filas) {
    const k = llave(f);
    mapa.set(k, (mapa.get(k) ?? 0) + f[m]);
  }
  return mapa;
}

export type PuntoSerie = { fecha: string; valor: number };

/** Serie diaria ordenada, lista para escalar. */
export function porFecha(filas: Fila[], m: Metrica): PuntoSerie[] {
  const mapa = agrupar(filas, (f) => f.fecha, m);
  return [...mapa.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([fecha, valor]) => ({ fecha, valor }));
}

/**
 * Reduce la serie a bloques cuando hay demasiados puntos.
 *
 * Con 548 días el trazo se convierte en una mancha: hay más puntos que
 * píxeles de ancho útil, así que el detalle no se ve y sólo cuesta. Por
 * encima del umbral se promedia por bloques.
 */
export function comprimir(puntos: PuntoSerie[], maximo = 120): PuntoSerie[] {
  if (puntos.length <= maximo) return puntos;

  const bloque = Math.ceil(puntos.length / maximo);
  const salida: PuntoSerie[] = [];

  for (let i = 0; i < puntos.length; i += bloque) {
    const trozo = puntos.slice(i, i + bloque);
    const suma = trozo.reduce((a, p) => a + p.valor, 0);
    salida.push({
      // La fecha del bloque es la del primer día: así el eje sigue
      // leyéndose como un calendario y no como "semana 7".
      fecha: trozo[0].fecha,
      valor: Math.round(suma / trozo.length),
    });
  }

  return salida;
}

export type Apilado = { periodo: string; partes: { id: string; valor: number }[] };

/** Serie apilada por mes y categoría, para las barras. */
export function porMesYCategoria(
  c: Conjunto,
  filas: Fila[],
  m: Metrica,
): Apilado[] {
  const meses = new Map<string, Map<string, number>>();

  for (const f of filas) {
    const mes = f.fecha.slice(0, 7);
    let fila = meses.get(mes);
    if (!fila) {
      fila = new Map();
      meses.set(mes, fila);
    }
    fila.set(f.categoria, (fila.get(f.categoria) ?? 0) + f[m]);
  }

  return [...meses.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([periodo, fila]) => ({
      periodo,
      partes: c.categorias.map((k) => ({ id: k.id, valor: fila.get(k.id) ?? 0 })),
    }));
}

export type ResumenSucursal = {
  id: string;
  nombre: string;
  ciudad: string;
  valor: number;
  participacion: number;
  delta: number;
  ticketPromedio: number;
  chispa: number[];
};

/** Resumen por sucursal, con su tramo anterior para el delta. */
export function porSucursal(c: Conjunto, f: Filtros): ResumenSucursal[] {
  const actual = filtrar(c, f);
  const previo = filtrar(c, f, 1);
  const total = sumar(actual, f.metrica) || 1;

  const hoy = agrupar(actual, (r) => r.sucursal, f.metrica);
  const antes = agrupar(previo, (r) => r.sucursal, f.metrica);
  const ingresosPorSuc = agrupar(actual, (r) => r.sucursal, "ingresos");
  const ticketsPorSuc = agrupar(actual, (r) => r.sucursal, "tickets");

  return c.sucursales
    .map((s) => {
      const valor = hoy.get(s.id) ?? 0;
      const anterior = antes.get(s.id) ?? 0;
      const chispa = comprimir(
        porFecha(
          actual.filter((r) => r.sucursal === s.id),
          f.metrica,
        ),
        24,
      ).map((p) => p.valor);

      return {
        id: s.id,
        nombre: s.nombre,
        ciudad: s.ciudad ?? "",
        valor,
        participacion: valor / total,
        delta: anterior === 0 ? 0 : (valor - anterior) / anterior,
        ticketPromedio:
          (ingresosPorSuc.get(s.id) ?? 0) / (ticketsPorSuc.get(s.id) || 1),
        chispa,
      };
    })
    .sort((a, b) => b.valor - a.valor);
}

export type Kpi = {
  id: Metrica | "ticket";
  nombre: string;
  valor: number;
  delta: number;
  chispa: number[];
};

/** Las cuatro cifras de portada, cada una contra su periodo anterior. */
export function kpis(c: Conjunto, f: Filtros): Kpi[] {
  const actual = filtrar(c, f);
  const previo = filtrar(c, f, 1);

  const arma = (m: Metrica, nombre: string): Kpi => {
    const valor = sumar(actual, m);
    const anterior = sumar(previo, m);
    return {
      id: m,
      nombre,
      valor,
      delta: anterior === 0 ? 0 : (valor - anterior) / anterior,
      chispa: comprimir(porFecha(actual, m), 28).map((p) => p.valor),
    };
  };

  const ingresos = arma("ingresos", "Ingresos");
  const tickets = arma("tickets", "Tickets");

  /**
   * El ticket promedio es Σingresos / Σtickets, no el promedio de los
   * tickets promedio. Promediar promedios es el error clásico de todo
   * tablero: da un número plausible y equivocado.
   */
  const ticketActual = ingresos.valor / (tickets.valor || 1);
  const ticketPrevio =
    sumar(previo, "ingresos") / (sumar(previo, "tickets") || 1);

  return [
    ingresos,
    tickets,
    {
      id: "ticket",
      nombre: "Ticket promedio",
      valor: ticketActual,
      delta: ticketPrevio === 0 ? 0 : (ticketActual - ticketPrevio) / ticketPrevio,
      chispa: ingresos.chispa.map((v, i) => v / (tickets.chispa[i] || 1)),
    },
    arma("visitantes", "Visitantes"),
  ];
}

export type Linea = {
  id: string;
  sucursal: string;
  ciudad: string;
  categoria: string;
  valor: number;
  delta: number;
  ticketPromedio: number;
  chispa: number[];
};

/**
 * Líneas de negocio: cada cruce de sucursal y categoría.
 *
 * Es el grano al que de verdad se toman decisiones ("Café en Mérida viene
 * cayendo"), y da decenas de filas, que es donde ordenar, buscar y paginar
 * dejan de ser adorno.
 */
export function lineas(c: Conjunto, f: Filtros): Linea[] {
  const actual = filtrar(c, f);
  const previo = filtrar(c, f, 1);
  const clave = (r: Fila) => `${r.sucursal}|${r.categoria}`;

  const hoy = agrupar(actual, clave, f.metrica);
  const antes = agrupar(previo, clave, f.metrica);
  const ingresos = agrupar(actual, clave, "ingresos");
  const tickets = agrupar(actual, clave, "tickets");

  const salida: Linea[] = [];

  for (const s of c.sucursales) {
    for (const k of c.categorias) {
      const llave = `${s.id}|${k.id}`;
      const valor = hoy.get(llave) ?? 0;
      if (valor === 0) continue;

      const anterior = antes.get(llave) ?? 0;

      salida.push({
        id: llave,
        sucursal: s.nombre,
        ciudad: s.ciudad ?? "",
        categoria: k.nombre,
        valor,
        delta: anterior === 0 ? 0 : (valor - anterior) / anterior,
        ticketPromedio: (ingresos.get(llave) ?? 0) / (tickets.get(llave) || 1),
        chispa: comprimir(
          porFecha(
            actual.filter((r) => r.sucursal === s.id && r.categoria === k.id),
            f.metrica,
          ),
          20,
        ).map((p) => p.valor),
      });
    }
  }

  return salida;
}

/* ── Utilidades de catálogo ───────────────────────────────── */

export const nombreEn = (catalogo: Catalogo[], id: string) =>
  catalogo.find((x) => x.id === id)?.nombre ?? "Todas";

export const nombreMetrica = (id: Metrica) =>
  METRICAS.find((m) => m.id === id)?.nombre ?? "Ingresos";

/** Color de serie por posición en el catálogo, 1-based como los tokens CSS. */
export const colorPorIndice = (i: number) => `var(--serie-${(i % 6) + 1})`;

/**
 * Lee los filtros desde la query.
 *
 * Nunca lanza: la URL es entrada de usuario y alguien la va a editar a
 * mano. Cualquier valor que no esté en el catálogo se ignora en silencio y
 * cae al valor por defecto.
 */
export function leerFiltros(
  sp: Record<string, string | string[] | undefined>,
): Filtros {
  const uno = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const rango = RANGOS.find((r) => r.id === uno("r"))?.id;
  const metrica = METRICAS.find((m) => m.id === uno("m"))?.id;
  const sucursal = SUCURSALES.find((s) => s.id === uno("s"))?.id;
  const categoria = CATEGORIAS.find((k) => k.id === uno("c"))?.id;

  return {
    rango: rango ?? FILTROS_POR_DEFECTO.rango,
    metrica: metrica ?? FILTROS_POR_DEFECTO.metrica,
    sucursal: sucursal ?? FILTROS_POR_DEFECTO.sucursal,
    categoria: categoria ?? FILTROS_POR_DEFECTO.categoria,
  };
}
