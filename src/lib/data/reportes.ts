import type { Metrica, Rango } from "./cifra";

export type Reporte = {
  slug: string;
  titulo: string;
  entradilla: string;
  fecha: string;
  autor: string;
  lectura: number;
  /** Vista del tablero que sostiene el argumento del reporte. */
  vista: { rango: Rango; metrica: Metrica; sucursal?: string; categoria?: string };
  cifra: { valor: string; pie: string };
  secciones: { titulo: string; parrafos: string[] }[];
};

export const reportes: Reporte[] = [
  {
    slug: "buen-fin-2025",
    titulo: "El Buen Fin no movió el ticket, movió la frecuencia",
    entradilla:
      "Cuatro días concentraron el 6.1% del año, pero el ticket promedio bajó. Qué significa eso para el surtido de 2026.",
    fecha: "2026-01-14",
    autor: "Equipo de datos",
    lectura: 6,
    vista: { rango: "12m", metrica: "tickets" },
    cifra: { valor: "6.1%", pie: "del año en cuatro días" },
    secciones: [
      {
        titulo: "Lo que pasó",
        parrafos: [
          "Del 14 al 20 de noviembre el tráfico creció 68% contra la media del trimestre. La lectura fácil sería celebrar el pico y dejarlo ahí, pero el ticket promedio cayó 9% en esos mismos días: entró más gente y cada una gastó menos.",
          "Esa combinación no es mala noticia. Significa que la promoción atrajo a un comprador que normalmente no entra, y que la oportunidad está en qué se le ofrece la segunda vez.",
        ],
      },
      {
        titulo: "Dónde se concentró",
        parrafos: [
          "Polanco y Santa Fe absorbieron la mitad del incremento, pero Mérida fue la que más creció en términos relativos: 84% contra su propia media. Una sucursal chica con un pico grande es una señal de demanda desatendida el resto del año.",
          "Calzado fue la categoría que más se movió; Café, la que menos. El patrón se repite cada noviembre y conviene planear el inventario con eso en mente.",
        ],
      },
      {
        titulo: "Qué haríamos distinto",
        parrafos: [
          "Subir el surtido de accesorios en las tiendas donde el ticket cayó más. Es la categoría con mayor margen y la que mejor acompaña una compra de calzado.",
          "Y medir la recompra a noventa días, no las ventas del fin de semana. El Buen Fin es una inversión en tráfico; el retorno se cobra después.",
        ],
      },
    ],
  },
  {
    slug: "cafe-entre-semana",
    titulo: "Café sostiene los martes",
    entradilla:
      "La única categoría que factura más de lunes a viernes que en fin de semana, y lo que eso dice del piso de venta.",
    fecha: "2026-03-02",
    autor: "Equipo de datos",
    lectura: 4,
    vista: { rango: "90d", metrica: "tickets", categoria: "cafe" },
    cifra: { valor: "1.2×", pie: "martes contra sábado" },
    secciones: [
      {
        titulo: "Un patrón invertido",
        parrafos: [
          "Ropa, calzado y hogar siguen la forma de semana que cualquiera esperaría: valle a media semana, pico el sábado. Café hace lo contrario, y lo hace de forma consistente en las seis sucursales.",
          "El martes es su mejor día. No por mucho —un 20% sobre el sábado— pero sí de manera estable durante los dieciocho meses de historia.",
        ],
      },
      {
        titulo: "Por qué importa",
        parrafos: [
          "Una categoría que llena los días flojos vale más que su participación en ventas. Café es el 5% de los ingresos y cerca del 18% de los tickets de martes y miércoles: es tráfico que después compra otra cosa.",
          "La conclusión operativa es de personal, no de inventario. Los turnos están dimensionados para el pico del sábado y dejan corta la media semana justo donde hay demanda.",
        ],
      },
    ],
  },
  {
    slug: "merida-crecimiento",
    titulo: "Mérida crece más rápido que Polanco",
    entradilla:
      "La sucursal más chica lleva tres trimestres creciendo por encima de la cadena. Vale la pena mirar por qué.",
    fecha: "2026-05-20",
    autor: "Equipo de datos",
    lectura: 5,
    vista: { rango: "12m", metrica: "ingresos", sucursal: "altabrisa" },
    cifra: { valor: "+41%", pie: "contra el año anterior" },
    secciones: [
      {
        titulo: "El dato",
        parrafos: [
          "Altabrisa aporta el 9% de los ingresos de la cadena, la participación más baja de las seis. Pero su tasa de crecimiento interanual es de 41%, contra el 28% del promedio.",
          "En términos absolutos sigue siendo la más chica. En términos de tendencia, es la que manda la señal.",
        ],
      },
      {
        titulo: "Qué la separa",
        parrafos: [
          "Su ticket promedio está 12% por debajo de la media, y su frecuencia de visita muy por encima. Es una tienda de compra recurrente y monto bajo, más parecida a un formato de barrio que al flagship de Polanco.",
          "Tratarla con el surtido de un flagship es lo que hoy le pone techo.",
        ],
      },
    ],
  },
  {
    slug: "conversion-piso",
    titulo: "El costo de un anaquel vacío",
    entradilla:
      "Cruzamos disponibilidad contra conversión por día y sucursal. La pérdida es mayor de lo que parece.",
    fecha: "2026-07-08",
    autor: "Equipo de datos",
    lectura: 7,
    vista: { rango: "90d", metrica: "visitantes" },
    cifra: { valor: "3.4 pts", pie: "de conversión en juego" },
    secciones: [
      {
        titulo: "La medición",
        parrafos: [
          "La conversión de piso se mueve entre 18% y 26% según sucursal y día. Esa banda de ocho puntos se suele explicar por perfil de cliente, pero al cruzarla con disponibilidad de talla aparece otra cosa.",
          "Los días con quiebre de stock en tallas centrales pierden 3.4 puntos de conversión frente a los días completos, con el mismo tráfico.",
        ],
      },
      {
        titulo: "Lo que cuesta",
        parrafos: [
          "Tres puntos y medio de conversión sobre el tráfico de un trimestre son más que la utilidad de una sucursal chica. El inventario faltante no aparece en ningún reporte de ventas porque la venta que no ocurrió no deja rastro.",
          "Es el tipo de pérdida que sólo se ve cuando se mira tráfico y ventas en la misma pantalla.",
        ],
      },
    ],
  },
  {
    slug: "enero-real",
    titulo: "La cuesta de enero es más corta de lo que se cree",
    entradilla:
      "Dieciocho meses de historia diaria dicen que la caída dura tres semanas, no el mes completo.",
    fecha: "2026-02-11",
    autor: "Equipo de datos",
    lectura: 4,
    vista: { rango: "12m", metrica: "ingresos" },
    cifra: { valor: "19 días", pie: "de caída real" },
    secciones: [
      {
        titulo: "Lo que muestra el calendario",
        parrafos: [
          "El mapa de calor deja ver con precisión dónde empieza y dónde termina la caída: arranca el 2 de enero y se recupera alrededor del día 21, no el 31.",
          "La última semana de enero ya está en niveles de temporada normal. Planear todo el mes como temporada baja deja diez días de capacidad sin usar.",
        ],
      },
      {
        titulo: "Consecuencia",
        parrafos: [
          "Las promociones de fin de enero compiten contra una demanda que ya volvió. Es margen regalado.",
          "Moverlas a la primera quincena, donde la caída sí es real, cambia el resultado sin cambiar el presupuesto.",
        ],
      },
    ],
  },
];

export const buscarReporte = (slug: string) =>
  reportes.find((r) => r.slug === slug);
