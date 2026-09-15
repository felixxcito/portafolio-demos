export type Proyecto = {
  slug: string;
  marca: string;
  vertical: string;
  descripcion: string;
  accent: string;
  accentFg: string;
  tags: string[];
};

export const proyectos: Proyecto[] = [
  {
    slug: "nova",
    marca: "Nova",
    vertical: "Agencia creativa",
    descripcion:
      "Identidad digital para un estudio creativo. WebGL en tiempo real, scroll cinemático y tipografía a escala de cartel.",
    accent: "#ccff33",
    accentFg: "#08080a",
    tags: ["WebGL", "GSAP", "Art direction"],
  },
  {
    slug: "altura",
    marca: "Altura",
    vertical: "Inmobiliaria de lujo",
    descripcion:
      "Catálogo de residencias con búsqueda real: filtros, comparador, calculadora de hipoteca y agenda de visitas.",
    accent: "#9a7b4f",
    accentFg: "#ffffff",
    tags: ["Filtros", "Calculadora", "Formularios"],
  },
  {
    slug: "impulso",
    marca: "Impulso",
    vertical: "Lanzamiento de producto",
    descripcion:
      "Landing de conversión con configurador 3D del producto, cuenta regresiva y captura de leads validada.",
    accent: "#7c5cff",
    accentFg: "#ffffff",
    tags: ["Three.js", "Conversión", "Countdown"],
  },
  {
    slug: "cifra",
    marca: "Cifra",
    vertical: "Plataforma de datos",
    descripcion:
      "Tablero de retail en vivo: gráficas dibujadas a mano en SVG, filtros que viven en la URL y tema claro u oscuro. Sube tu propio CSV y se redibuja con tus números. Sin una sola librería de charts.",
    accent: "#0a7d72",
    accentFg: "#ffffff",
    tags: ["Data-viz", "Estado en URL", "Sube tu CSV"],
  },
];
