"use client";

import dynamic from "next/dynamic";

/**
 * Envoltura de cliente para el campo de partículas.
 *
 * `ssr: false` sólo puede usarse dentro de un Client Component, y la
 * escena lo necesita porque Three.js toca `window` al crear el renderer.
 * Aislarla aquí además saca el peso de WebGL del bundle inicial: la
 * página se pinta y la escena llega después.
 */
const CampoParticulas = dynamic(
  () => import("./CampoParticulas").then((m) => m.CampoParticulas),
  { ssr: false },
);

export function FondoHero() {
  return <CampoParticulas />;
}
