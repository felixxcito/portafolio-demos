export type Imagen = { src: string; alt: string };

export type Propiedad = {
  id: string;
  nombre: string;
  zona: string;
  ciudad: string;
  precio: number;
  recamaras: number;
  banos: number;
  construccion: number;
  terreno: number;
  ano: number;
  arquitecto: string;
  resumen: string;
  amenidades: string[];
  imagenes: Imagen[];
};

export const ZONAS = [
  "Valle de Bravo",
  "Polanco",
  "Punta Mita",
  "Bosques de las Lomas",
  "San Ángel",
  "Careyes",
] as const;

export const propiedades: Propiedad[] = [
  {
    id: "lumen",
    nombre: "Casa Lumen",
    zona: "Valle de Bravo",
    ciudad: "Estado de México",
    precio: 42_800_000,
    recamaras: 4,
    banos: 5,
    construccion: 620,
    terreno: 1450,
    ano: 2023,
    arquitecto: "Taller Mena",
    resumen:
      "Una casa concebida alrededor de la luz de la tarde. Los volúmenes se abren hacia el poniente sobre el lago y la doble altura del estar convierte el atardecer en el acabado principal.",
    amenidades: ["Vista al lago", "Doble altura", "Cava", "Terraza techada", "Estudio"],
    imagenes: [
      { src: "/img/altura/lumen-01.webp", alt: "Fachada de Casa Lumen al atardecer con iluminación cálida" },
      { src: "/img/altura/lumen-02.webp", alt: "Sala de doble altura con ventanales al lago" },
      { src: "/img/altura/lumen-03.webp", alt: "Cocina integral en tonos oscuros con isla central" },
      { src: "/img/altura/lumen-04.webp", alt: "Recámara principal con vista al jardín" },
    ],
  },
  {
    id: "aral",
    nombre: "Residencia Aral",
    zona: "Polanco",
    ciudad: "Ciudad de México",
    precio: 68_500_000,
    recamaras: 3,
    banos: 4,
    construccion: 410,
    terreno: 410,
    ano: 2024,
    arquitecto: "Estudio Ruiz Barragán",
    resumen:
      "Penthouse de dos niveles sobre Campos Elíseos. Piedra caliza, nogal y un silencio acústico poco común a treinta metros de altura.",
    amenidades: ["Penthouse", "Doble terraza", "Gimnasio privado", "Seguridad 24/7", "3 cajones"],
    imagenes: [
      { src: "/img/altura/aral-01.webp", alt: "Fachada de vidrio de Residencia Aral al anochecer" },
      { src: "/img/altura/aral-02.webp", alt: "Estancia principal con mobiliario contemporáneo" },
      { src: "/img/altura/aral-03.webp", alt: "Cocina con acabados en madera y piedra" },
      { src: "/img/altura/aral-04.webp", alt: "Recámara principal con iluminación tenue" },
    ],
  },
  {
    id: "sereno",
    nombre: "Villa Sereno",
    zona: "Punta Mita",
    ciudad: "Nayarit",
    precio: 95_000_000,
    recamaras: 6,
    banos: 7,
    construccion: 940,
    terreno: 2100,
    ano: 2022,
    arquitecto: "Peral + Asociados",
    resumen:
      "Frente de playa con alberca desbordante que se funde con el Pacífico. Seis suites independientes y palapa principal de veinte metros de claro.",
    amenidades: ["Frente de playa", "Alberca infinita", "Palapa", "Casa de huéspedes", "Muelle"],
    imagenes: [
      { src: "/img/altura/sereno-01.webp", alt: "Villa Sereno con alberca frente al mar" },
      { src: "/img/altura/sereno-02.webp", alt: "Alberca desbordante hacia el océano Pacífico" },
      { src: "/img/altura/sereno-03.webp", alt: "Estancia abierta hacia la terraza" },
      { src: "/img/altura/sereno-04.webp", alt: "Suite principal con vista al mar" },
    ],
  },
  {
    id: "obsidiana",
    nombre: "Casa Obsidiana",
    zona: "Bosques de las Lomas",
    ciudad: "Ciudad de México",
    precio: 54_200_000,
    recamaras: 5,
    banos: 6,
    construccion: 730,
    terreno: 980,
    ano: 2021,
    arquitecto: "Taller Mena",
    resumen:
      "Concreto aparente y vidrio sobre una barranca arbolada. La casa se comporta distinto en cada estación: en invierno se cierra, en primavera desaparece.",
    amenidades: ["Barranca privada", "Concreto aparente", "Home theater", "Spa", "Jardín de esculturas"],
    imagenes: [
      { src: "/img/altura/obsidiana-01.webp", alt: "Volumen oscuro de Casa Obsidiana entre los árboles" },
      { src: "/img/altura/obsidiana-02.webp", alt: "Cocina minimalista en tonos grafito" },
      { src: "/img/altura/obsidiana-03.webp", alt: "Sala con chimenea y ventanal a la barranca" },
      { src: "/img/altura/obsidiana-04.webp", alt: "Recámara con acabados en madera oscura" },
    ],
  },
  {
    id: "mirador",
    nombre: "Mirador Alto",
    zona: "San Ángel",
    ciudad: "Ciudad de México",
    precio: 31_900_000,
    recamaras: 4,
    banos: 4,
    construccion: 480,
    terreno: 760,
    ano: 2020,
    arquitecto: "Colectivo Norte",
    resumen:
      "Una casa de los años cincuenta restaurada con criterio contemporáneo. Se conservó cada muro de piedra volcánica y se sustituyó todo lo demás.",
    amenidades: ["Restauración", "Piedra volcánica", "Jardín maduro", "Biblioteca", "Taller"],
    imagenes: [
      { src: "/img/altura/mirador-01.webp", alt: "Fachada de Mirador Alto con jardín maduro" },
      { src: "/img/altura/mirador-02.webp", alt: "Estancia con mobiliario de mediados de siglo" },
      { src: "/img/altura/mirador-03.webp", alt: "Cocina abierta con barra de desayuno" },
      { src: "/img/altura/mirador-04.webp", alt: "Recámara con ventanal al jardín" },
    ],
  },
  {
    id: "marea",
    nombre: "Casa Marea",
    zona: "Careyes",
    ciudad: "Jalisco",
    precio: 78_400_000,
    recamaras: 5,
    banos: 6,
    construccion: 810,
    terreno: 3400,
    ano: 2024,
    arquitecto: "Peral + Asociados",
    resumen:
      "Acantilado privado sobre la bahía. Tres plataformas escalonadas conectadas por escaleras exteriores, sin un solo pasillo interior en toda la casa.",
    amenidades: ["Acantilado privado", "Alberca infinita", "Helipuerto", "Bodega de vinos", "Gimnasio"],
    imagenes: [
      { src: "/img/altura/marea-01.webp", alt: "Casa Marea sobre el acantilado al atardecer" },
      { src: "/img/altura/marea-02.webp", alt: "Alberca infinita sobre la bahía" },
      { src: "/img/altura/marea-03.webp", alt: "Cocina con isla de mármol" },
      { src: "/img/altura/marea-04.webp", alt: "Recámara principal abierta a la terraza" },
    ],
  },
];

export const formatoMXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export const precioCorto = (n: number) =>
  `$${(n / 1_000_000).toLocaleString("es-MX", { maximumFractionDigits: 1 })} M`;
