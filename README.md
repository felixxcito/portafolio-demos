# Tres sitios demo · Felix Arocha

Portafolio de demostración: tres sitios completos con identidad visual
independiente, construidos sobre un mismo proyecto Next.js.

| Ruta | Marca | Qué demuestra |
|---|---|---|
| `/` | Hub | Presentación de los tres proyectos |
| `/nova` | **Nova** — agencia creativa | WebGL con shader propio, scroll cinemático, cursor magnético |
| `/altura` | **Altura** — inmobiliaria | Filtros, comparador, calculadora de hipoteca, formularios validados |
| `/impulso` | **Impulso** — lanzamiento | Configurador 3D del producto, cuenta regresiva, captura de leads |

## Correr en local

```bash
npm install
npm run dev
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
Three.js · GSAP + ScrollTrigger · Lenis

## Decisiones que vale la pena conocer

- **Un proyecto, tres identidades.** Los tokens semánticos (`--site-*`) se
  redefinen por ruta con `[data-site]`, así que `bg-bg` o `text-accent`
  significan cosas distintas en cada sitio sin duplicar una sola clase.
- **Todo funciona sin conexión.** Las fuentes se autohospedan con
  `next/font` y las fotos viven en `public/img` ya optimizadas a WebP.
  No hay una sola llamada a un CDN externo en tiempo de ejecución.
- **Móvil no es un ajuste final.** El recorrido horizontal de Nova sólo
  se registra en pantallas grandes (`gsap.matchMedia`), el cursor
  personalizado no se monta en táctil y las escenas WebGL bajan su
  resolución y su número de partículas según el ancho.
- **Las escenas 3D se apagan solas** cuando salen de pantalla, y liberan
  geometrías, materiales y el contexto WebGL al desmontarse.
- **`prefers-reduced-motion` se respeta en los tres sitios**: las escenas
  dibujan un cuadro fijo y las apariciones se vuelven inmediatas.

Los formularios son demostrativos: validan de verdad, pero no envían
nada a ningún servidor.

## Créditos

Fotografías de [Unsplash](https://unsplash.com) bajo su licencia de uso
libre. Ver `public/img/CREDITS.md`.
