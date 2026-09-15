import type { Metadata, Viewport } from "next";
import {
  syne,
  interTight,
  instrumentSerif,
  dmSans,
  spaceGrotesk,
  bricolage,
  jetbrainsMono,
} from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  /* Sin esto, Next no sabe contra qué origen resolver las rutas relativas
     de las imágenes de Open Graph y avisa en cada build. */
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITIO ?? "http://localhost:3000",
  ),
  title: {
    default: "Felix Arocha — Diseño y desarrollo web",
    template: "%s · Felix Arocha",
  },
  description:
    "Cuatro sitios demo construidos de cero: una agencia creativa, una inmobiliaria de lujo, un lanzamiento de producto y una plataforma de datos.",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const fontVars = [
  syne.variable,
  interTight.variable,
  instrumentSerif.variable,
  dmSans.variable,
  spaceGrotesk.variable,
  bricolage.variable,
  jetbrainsMono.variable,
].join(" ");

/**
 * Script anti-parpadeo de Cifra.
 *
 * Vive en el layout raíz y no en el de /cifra por una razón concreta: los
 * layouts raíz no se vuelven a montar al navegar, y React sólo ejecuta un
 * <script> cuando el navegador parsea el HTML —nunca al insertarlo desde el
 * cliente—. Emitirlo desde una ruta anidada provoca el aviso "Scripts
 * inside React components are never executed when rendering on the client"
 * y, peor, no corre. Desde aquí corre siempre en carga directa; la
 * navegación suave la cubre SincroniaTema.
 *
 * Escribe en <html> porque en el momento en que se ejecuta el contenedor
 * [data-site="cifra"] todavía no existe. El CSS está acotado a los
 * descendientes de ese contenedor, así que las otras tres rutas no se
 * enteran.
 */
const scriptTema = `(function(){try{if(!location.pathname.startsWith("/cifra"))return;var t=localStorage.getItem("cifra-tema");document.documentElement.dataset.tema=(t==="claro"||t==="oscuro")?t:(matchMedia("(prefers-color-scheme: dark)").matches?"oscuro":"claro")}catch(_){}})()`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* suppressHydrationWarning: el script de abajo escribe data-tema
       antes de que React hidrate, y esa diferencia es intencional. */
    <html lang="es" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
