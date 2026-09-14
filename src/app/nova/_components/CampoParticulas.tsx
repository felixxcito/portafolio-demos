"use client";

import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { liberar, useEscena } from "@/components/webgl/useEscena";

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uDpr;
  attribute float aRand;
  varying float vRand;
  varying float vProf;

  void main() {
    vec3 p = position;

    // Respiración: cada punto late con su propia fase, así el conjunto
    // ondula en vez de escalar como un bloque.
    float onda = sin(uTime * 0.55 + aRand * 6.2831);
    p *= 1.0 + onda * 0.07;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vProf = -mv.z;

    gl_Position = projectionMatrix * mv;
    // Tamaño con atenuación por distancia: los puntos del fondo se ven
    // más chicos y el volumen se lee de verdad.
    gl_PointSize = uSize * uDpr * (1.0 / max(vProf, 0.001)) * (0.55 + aRand * 0.9);

    vRand = aRand;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vRand;
  varying float vProf;

  void main() {
    // Punto circular con borde suave: sin esto se ven cuadrados.
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;

    float alfa = smoothstep(0.5, 0.08, d);
    vec3 col = mix(uColorA, uColorB, smoothstep(0.25, 1.0, vRand));

    // Los puntos lejanos se desvanecen y dan profundidad atmosférica.
    float niebla = smoothstep(16.5, 6.5, vProf);

    gl_FragColor = vec4(col, alfa * niebla * 0.92);
  }
`;

/** Distribución de Fibonacci: puntos repartidos parejo sobre la esfera. */
function esfera(n: number, radio: number) {
  const pos = new Float32Array(n * 3);
  const rand = new Float32Array(n);
  const phi = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = phi * i;
    // Un poco de grosor en la cáscara para que no parezca un cascarón.
    const rr = radio * (0.82 + Math.random() * 0.18);
    pos[i * 3] = Math.cos(th) * r * rr;
    pos[i * 3 + 1] = y * rr;
    pos[i * 3 + 2] = Math.sin(th) * r * rr;
    rand[i] = Math.random();
  }
  return { pos, rand };
}

export function CampoParticulas() {
  const raton = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  // Giro acumulado por arrastre, aparte de la rotación automática.
  const gesto = useRef({ activo: false, x: 0, y: 0, vel: 0, velY: 0, rx: 0, ry: 0 });

  const setup = useCallback(
    ({ renderer, ancho, alto, reducido }: Parameters<Parameters<typeof useEscena>[0]>[0]) => {
      const escena = new THREE.Scene();
      const camara = new THREE.PerspectiveCamera(45, ancho / alto, 0.1, 100);
      camara.position.z = 10.8;

      // En pantallas chicas se reduce el conteo: son puntos transparentes
      // y el coste está en el relleno, que es lo que ahoga a un teléfono.
      const n = ancho < 640 ? 3200 : ancho < 1100 ? 6000 : 9500;
      const { pos, rand } = esfera(n, 3.35);

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

      const mat = new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 52 },
          uDpr: { value: renderer.getPixelRatio() },
          uColorA: { value: new THREE.Color("#ccff33") },
          uColorB: { value: new THREE.Color("#f2f2f0") },
        },
      });

      const puntos = new THREE.Points(geo, mat);
      escena.add(puntos);

      let giroAuto = 0;

      return {
        render: (t: number, delta: number) => {
          mat.uniforms.uTime.value = t;

          if (!reducido) {
            const g = gesto.current;

            // El giro automático nunca se detiene; el arrastre suma encima
            // y conserva inercia al soltar.
            giroAuto += delta * 0.055;
            g.rx += g.vel;
            g.ry += g.velY;
            const freno = g.activo ? 0.84 : 0.95;
            g.vel *= freno;
            g.velY *= freno;

            // El seguimiento del cursor se amortigua: si la rotación
            // copiara la posición exacta, cada movimiento daría un tirón.
            const m = raton.current;
            m.sx += (m.x - m.sx) * 0.045;
            m.sy += (m.y - m.sy) * 0.045;

            puntos.rotation.y = giroAuto + g.rx;
            puntos.rotation.x = m.sy * 0.45 + g.ry;
            puntos.position.x = m.sx * 0.9;
          } else {
            puntos.rotation.y = 0.4;
          }

          renderer.render(escena, camara);
        },
        resize: (w: number, h: number) => {
          camara.aspect = w / h;
          camara.updateProjectionMatrix();
          mat.uniforms.uDpr.value = renderer.getPixelRatio();
        },
        dispose: () => liberar(escena),
      };
    },
    [],
  );

  const { contenedor, estado } = useEscena(setup, 1.9);

  useEffect(() => {
    // Parallax de cursor: sólo con mouse, en táctil no hay nada que seguir.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      raton.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      raton.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  /**
   * Arrastre para girar la esfera, activo también con el dedo.
   *
   * El lienzo va detrás del titular, así que el gesto se escucha en toda
   * la sección del hero y se descarta cuando empieza sobre un enlace o un
   * botón, para no robarle el clic a la navegación.
   */
  useEffect(() => {
    const zona = contenedor.current?.closest("section");
    if (!zona) return;

    const down = (e: PointerEvent) => {
      if ((e.target as Element).closest("a, button, input, textarea")) return;
      const g = gesto.current;
      g.activo = true;
      g.x = e.clientX;
      g.y = e.clientY;
    };

    const move = (e: PointerEvent) => {
      const g = gesto.current;
      if (!g.activo) return;
      g.vel = (e.clientX - g.x) * 0.0045;
      g.velY = (e.clientY - g.y) * 0.0022;
      g.x = e.clientX;
      g.y = e.clientY;
    };

    const up = () => {
      gesto.current.activo = false;
    };

    zona.addEventListener("pointerdown", down as EventListener);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      zona.removeEventListener("pointerdown", down as EventListener);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [contenedor]);

  return (
    <div
      ref={contenedor}
      aria-hidden
      data-estado={estado}
      className="absolute inset-0"
    />
  );
}
