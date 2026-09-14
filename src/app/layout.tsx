import type { Metadata, Viewport } from "next";
import {
  syne,
  interTight,
  instrumentSerif,
  dmSans,
  spaceGrotesk,
} from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Felix Arocha — Diseño y desarrollo web",
    template: "%s · Felix Arocha",
  },
  description:
    "Tres sitios demo construidos de cero: una agencia creativa, una inmobiliaria de lujo y un lanzamiento de producto.",
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
].join(" ");

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
