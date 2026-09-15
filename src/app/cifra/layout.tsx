import type { Metadata, Viewport } from "next";
import { SincroniaTema } from "./_components/SincroniaTema";

export const metadata: Metadata = {
  title: "Cifra",
  description:
    "Inteligencia de datos para retail: un tablero que responde en el momento, no al día siguiente.",
};

/* Dos themeColor: con uno fijo, el cromo del navegador se quedaría claro
   sobre el tema oscuro. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f10" },
  ],
};

export default function CifraLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      data-site="cifra"
      className="bg-bg text-fg transition-colors duration-300"
    >
      <SincroniaTema />
      {children}
    </div>
  );
}
