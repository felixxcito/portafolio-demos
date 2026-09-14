"use client";

import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { liberar, useEscena } from "@/components/webgl/useEscena";

/**
 * Silueta de un cilindro con cantos redondeados, para revolucionarla con
 * LatheGeometry. Se dibuja de abajo hacia arriba: base plana, arco,
 * costado recto, arco y tapa. Da un contorno continuo, sin las aristas
 * duras que delatan a un cubo redondeado.
 */
function perfilRedondeado(radio: number, alto: number, canto: number, pasos = 10) {
  const p: THREE.Vector2[] = [];
  const y0 = -alto / 2;
  const y1 = alto / 2;

  p.push(new THREE.Vector2(0, y0));
  p.push(new THREE.Vector2(radio - canto, y0));
  for (let i = 1; i <= pasos; i++) {
    const a = (i / pasos) * (Math.PI / 2);
    p.push(
      new THREE.Vector2(
        radio - canto + Math.sin(a) * canto,
        y0 + canto - Math.cos(a) * canto,
      ),
    );
  }
  p.push(new THREE.Vector2(radio, y1 - canto));
  for (let i = 1; i <= pasos; i++) {
    const a = (i / pasos) * (Math.PI / 2);
    p.push(
      new THREE.Vector2(
        radio - canto + Math.cos(a) * canto,
        y1 - canto + Math.sin(a) * canto,
      ),
    );
  }
  p.push(new THREE.Vector2(0, y1));
  return p;
}

/**
 * Logotipo dibujado en un canvas y proyectado sobre la rejilla.
 * Un cuerpo de revolución es idéntico desde cualquier ángulo: sin una
 * marca al frente y un puerto atrás, girarlo no comunica nada y el
 * visor parece estar trabado.
 */
function texturaMarca() {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 160;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, c.width, c.height);
  g.fillStyle = "#cdc8e8";
  g.font = "700 64px ui-sans-serif, system-ui, -apple-system, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  if ("letterSpacing" in g) (g as CanvasRenderingContext2D).letterSpacing = "14px";
  g.fillText("IMPULSO", c.width / 2, c.height / 2 + 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Sombra de contacto pintada en un canvas: más barata que un shadow map. */
function texturaSombra() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const rad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  rad.addColorStop(0, "rgba(0,0,0,0.55)");
  rad.addColorStop(0.55, "rgba(0,0,0,0.2)");
  rad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = rad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export type Acabado = { id: string; nombre: string; hex: string; metal: number };

export const ACABADOS: Acabado[] = [
  { id: "medianoche", nombre: "Medianoche", hex: "#191d2e", metal: 0.15 },
  { id: "violeta", nombre: "Violeta", hex: "#7c5cff", metal: 0.1 },
  { id: "arena", nombre: "Arena", hex: "#d9c5a8", metal: 0.12 },
  { id: "titanio", nombre: "Titanio", hex: "#9aa3ad", metal: 0.92 },
];

export function VisorProducto({ acabado }: { acabado: Acabado }) {
  // El color vive en un ref para poder animarlo en el bucle de render
  // sin volver a construir la escena en cada cambio de acabado.
  const objetivo = useRef(acabado);
  useEffect(() => {
    objetivo.current = acabado;
  }, [acabado]);

  const cuerpoMat = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const arrastre = useRef({
    activo: false,
    x: 0,
    y: 0,
    vel: 0,
    velY: 0,
    rot: 0,
    incl: 0,
    auto: true,
  });

  const setup = useCallback(
    ({ renderer, ancho, alto, reducido }: Parameters<Parameters<typeof useEscena>[0]>[0]) => {
      const escena = new THREE.Scene();

      const camara = new THREE.PerspectiveCamera(32, ancho / alto, 0.1, 100);
      // Un poco por encima del producto: de frente la tapa y el anillo
      // luminoso quedarían escondidos por el propio cuerpo.
      camara.position.set(0, 2.1, 9.4);
      camara.lookAt(0, -0.12, 0);

      // Iluminación de estudio real: sin un environment map los
      // materiales físicos se ven de plástico plano.
      const pmrem = new THREE.PMREMGenerator(renderer);
      const entorno = pmrem.fromScene(new RoomEnvironment(), 0.04);
      escena.environment = entorno.texture;

      const grupo = new THREE.Group();
      escena.add(grupo);

      // ── Cuerpo ────────────────────────────────────────────
      const matCuerpo = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(acabado.hex),
        metalness: acabado.metal,
        roughness: 0.34,
        clearcoat: 0.85,
        clearcoatRoughness: 0.2,
      });
      cuerpoMat.current = matCuerpo;

      const cuerpo = new THREE.Mesh(
        new THREE.LatheGeometry(perfilRedondeado(0.88, 3.15, 0.33), 80),
        matCuerpo,
      );
      grupo.add(cuerpo);

      // ── Rejilla acústica ──────────────────────────────────
      // Un cilindro mate ligeramente más angosto: el cambio de material
      // es lo que hace que el objeto se lea como altavoz y no como jarra.
      const rejilla = new THREE.Mesh(
        new THREE.CylinderGeometry(0.886, 0.886, 1.25, 80, 1, true),
        new THREE.MeshPhysicalMaterial({
          color: 0x15161e,
          metalness: 0.05,
          roughness: 0.98,
          side: THREE.DoubleSide,
        }),
      );
      rejilla.position.y = -0.5;
      grupo.add(rejilla);

      // ── Costilla metálica que separa rejilla y tapa ───────
      const matMetal = new THREE.MeshPhysicalMaterial({
        color: 0xcfd3da,
        metalness: 1,
        roughness: 0.16,
      });
      const costilla = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 0.9, 0.028, 80),
        matMetal,
      );
      costilla.position.y = 0.17;
      grupo.add(costilla);

      // ── Tapa superior hundida ─────────────────────────────
      const tapa = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.035, 72),
        new THREE.MeshPhysicalMaterial({
          color: 0x0d0e16,
          metalness: 0.35,
          roughness: 0.55,
        }),
      );
      tapa.position.y = 1.578;
      grupo.add(tapa);

      // ── Anillo luminoso ───────────────────────────────────
      const anillo = new THREE.Mesh(
        new THREE.TorusGeometry(0.385, 0.015, 16, 80),
        new THREE.MeshBasicMaterial({ color: 0x9d86ff }),
      );
      anillo.rotation.x = Math.PI / 2;
      anillo.position.y = 1.6;
      grupo.add(anillo);

      // ── Frente: logotipo sobre la rejilla ─────────────────
      const marcaTex = texturaMarca();
      const marca = new THREE.Mesh(
        new THREE.PlaneGeometry(0.92, 0.23),
        new THREE.MeshStandardMaterial({
          map: marcaTex,
          transparent: true,
          roughness: 0.8,
          metalness: 0,
        }),
      );
      marca.position.set(0, -0.42, 0.9);
      grupo.add(marca);

      // ── Espalda: puerto de carga y botón de encendido ─────
      const matPuerto = new THREE.MeshPhysicalMaterial({
        color: 0x07080c,
        metalness: 0.6,
        roughness: 0.4,
      });
      const puerto = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.2, 24),
        matPuerto,
      );
      puerto.rotation.z = Math.PI / 2;
      puerto.scale.set(1, 1, 0.42);
      puerto.position.set(0, -0.72, -0.9);
      grupo.add(puerto);

      const boton = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.085, 0.03, 32),
        matMetal,
      );
      boton.rotation.x = Math.PI / 2;
      boton.position.set(0, -0.2, -0.905);
      grupo.add(boton);

      // ── Sombra de contacto ────────────────────────────────
      const sombraTex = texturaSombra();
      const sombra = new THREE.Mesh(
        new THREE.PlaneGeometry(4.2, 4.2),
        new THREE.MeshBasicMaterial({
          map: sombraTex,
          transparent: true,
          depthWrite: false,
        }),
      );
      sombra.rotation.x = -Math.PI / 2;
      sombra.position.y = -1.62;
      escena.add(sombra);

      // Un toque de luz direccional para marcar los cantos redondeados.
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(3.5, 5, 4);
      escena.add(key);
      // Contraluz frío: recorta el contorno contra el fondo oscuro.
      const relleno = new THREE.DirectionalLight(0x9d86ff, 0.9);
      relleno.position.set(-4, 1.5, -3);
      escena.add(relleno);
      escena.add(new THREE.AmbientLight(0xffffff, 0.3));

      const colorActual = new THREE.Color(acabado.hex);

      return {
        render: (t: number, delta: number) => {
          const a = arrastre.current;

          if (!reducido) {
            if (a.activo) {
              a.rot += a.vel;
              a.vel *= 0.82;
              a.velY *= 0.82;
            } else {
              // Inercia tras soltar, y regreso suave al giro automático.
              a.rot += a.vel;
              a.vel *= 0.94;
              a.velY *= 0.9;
              if (Math.abs(a.vel) < 0.0006 && a.auto) a.rot += delta * 0.35;
              // La inclinación siempre vuelve al reposo: así el producto
              // no se queda cabeceando en una pose rara.
              a.incl += (0 - a.incl) * (a.auto ? 0.03 : 0.0);
            }

            a.incl += a.velY;
            // Tope de inclinación: deja ver la tapa y la base sin voltearlo.
            a.incl = Math.max(-0.5, Math.min(0.62, a.incl));

            grupo.rotation.y = a.rot;
            grupo.rotation.x = a.incl;
            grupo.position.y = Math.sin(t * 0.9) * 0.055;
            grupo.rotation.z = Math.sin(t * 0.6) * 0.022;
          } else {
            grupo.rotation.y = -0.5;
          }

          // Transición suave entre acabados.
          const destino = objetivo.current;
          colorActual.lerp(new THREE.Color(destino.hex), 0.09);
          matCuerpo.color.copy(colorActual);
          matCuerpo.metalness += (destino.metal - matCuerpo.metalness) * 0.09;

          renderer.render(escena, camara);
        },
        resize: (w: number, h: number) => {
          camara.aspect = w / h;
          camara.updateProjectionMatrix();
        },
        dispose: () => {
          liberar(escena);
          marcaTex.dispose();
          sombraTex.dispose();
          entorno.texture.dispose();
          pmrem.dispose();
        },
      };
    },
    // El acabado inicial sólo importa al construir; después se anima.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { contenedor, estado } = useEscena(setup);

  // Arrastre con mouse y con el dedo, vía Pointer Events.
  useEffect(() => {
    const host = contenedor.current;
    if (!host) return;

    const down = (e: PointerEvent) => {
      arrastre.current.activo = true;
      arrastre.current.auto = false;
      arrastre.current.x = e.clientX;
      arrastre.current.y = e.clientY;
      host.setPointerCapture(e.pointerId);
      host.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!arrastre.current.activo) return;
      const dx = e.clientX - arrastre.current.x;
      const dy = e.clientY - arrastre.current.y;
      arrastre.current.x = e.clientX;
      arrastre.current.y = e.clientY;
      arrastre.current.vel = dx * 0.009;
      arrastre.current.velY = dy * 0.005;
    };
    const up = (e: PointerEvent) => {
      arrastre.current.activo = false;
      // releasePointerCapture lanza si el puntero ya se liberó solo
      // (por ejemplo al salir de la ventana), y eso abortaría el resto.
      try {
        host.releasePointerCapture(e.pointerId);
      } catch {
        /* la captura ya no existía */
      }
      host.style.cursor = "grab";
      // Si se quedó quieto, retoma el giro lento por su cuenta.
      window.setTimeout(() => (arrastre.current.auto = true), 2200);
    };

    host.addEventListener("pointerdown", down);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerup", up);
    host.addEventListener("pointercancel", up);
    return () => {
      host.removeEventListener("pointerdown", down);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerup", up);
      host.removeEventListener("pointercancel", up);
    };
  }, [contenedor]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg sm:aspect-[4/5] lg:max-w-none">
      <div
        ref={contenedor}
        className="h-full w-full cursor-grab touch-pan-y select-none"
        role="img"
        aria-label={`Vista tridimensional del altavoz Impulso One en acabado ${acabado.nombre}. Arrástralo en cualquier dirección para girarlo y ver el producto completo.`}
      />

      {estado === "sin-webgl" && (
        <div className="absolute inset-0 grid place-items-center rounded-2xl border border-line bg-surface p-8 text-center">
          <p className="text-sm text-muted">
            Tu navegador no soporta WebGL, así que el visor 3D no puede
            mostrarse. Todo lo demás funciona con normalidad.
          </p>
        </div>
      )}

      {estado === "activo" && (
        <p className="pointer-events-none absolute inset-x-0 bottom-1 text-center text-xs text-faint">
          Arrastra para girar en cualquier dirección
        </p>
      )}
    </div>
  );
}
