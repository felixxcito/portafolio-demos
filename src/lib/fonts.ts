import {
  Syne,
  Inter_Tight,
  Instrument_Serif,
  DM_Sans,
  Space_Grotesk,
} from "next/font/google";

/**
 * Cada sitio tiene su propio par tipográfico. Se autohospedan en build:
 * ni una llamada a Google en runtime, así los demos funcionan sin internet.
 */

// NOVA — display geométrico con personalidad
export const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

// ALTURA — serif editorial
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

// IMPULSO — grotesca técnica
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

// Cuerpos de texto
export const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
});
