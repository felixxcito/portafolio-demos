export type Caso = {
  id: string;
  cliente: string;
  titulo: string;
  disciplinas: string[];
  ano: number;
  metrica: string;
  metricaEtiqueta: string;
  imagen: string;
  alt: string;
};

export const casos: Caso[] = [
  {
    id: "aurora",
    cliente: "Aurora",
    titulo: "Una marca de cosmética que dejó de pedir permiso",
    disciplinas: ["Identidad", "Campaña", "Dirección de arte"],
    ano: 2025,
    metrica: "+218%",
    metricaEtiqueta: "recordación de marca",
    imagen: "/img/nova/caso-aurora.webp",
    alt: "Retrato de campaña sobre fondo cian con vestuario rojo",
  },
  {
    id: "polen",
    cliente: "Polen",
    titulo: "Cuidado de la piel contado como botánica, no como química",
    disciplinas: ["Naming", "Empaque", "Fotografía"],
    ano: 2025,
    metrica: "3.4x",
    metricaEtiqueta: "rotación en punto de venta",
    imagen: "/img/nova/caso-polen.webp",
    alt: "Retrato de belleza con flores amarillas",
  },
  {
    id: "helio",
    cliente: "Helio",
    titulo: "Una energética que se ve como infraestructura, no como app",
    disciplinas: ["Identidad", "Sistema visual", "Motion"],
    ano: 2024,
    metrica: "+46%",
    metricaEtiqueta: "intención de contratación",
    imagen: "/img/nova/caso-helio.webp",
    alt: "Estructura arquitectónica en espiral con luz cobriza",
  },
  {
    id: "marea",
    cliente: "Marea",
    titulo: "Un festival que cabía en un cartel y terminó en un idioma",
    disciplinas: ["Identidad", "Ambientación", "Digital"],
    ano: 2024,
    metrica: "28k",
    metricaEtiqueta: "asistentes en tres días",
    imagen: "/img/nova/caso-marea.webp",
    alt: "Formas abstractas azules en movimiento",
  },
  {
    id: "vector",
    cliente: "Vector",
    titulo: "Fintech sin un solo gradiente morado",
    disciplinas: ["Rebranding", "Producto", "Sistema"],
    ano: 2023,
    metrica: "−31%",
    metricaEtiqueta: "abandono en registro",
    imagen: "/img/nova/caso-vector.webp",
    alt: "Composición geométrica con luz neón violeta",
  },
  {
    id: "colectivo",
    cliente: "Colectivo Norte",
    titulo: "Seis talleres, una sola voz, cero manuales de 200 páginas",
    disciplinas: ["Estrategia", "Identidad", "Editorial"],
    ano: 2023,
    metrica: "6",
    metricaEtiqueta: "estudios unificados",
    imagen: "/img/nova/caso-colectivo.webp",
    alt: "Grupo de personas en composición editorial de color",
  },
];

export const servicios = [
  "Identidad de marca",
  "Dirección de arte",
  "Campañas",
  "Diseño digital",
  "Motion",
  "Empaque",
  "Editorial",
  "Estrategia",
];
