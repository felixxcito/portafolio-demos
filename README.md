# Cuatro sitios demo · Felix Arocha

Portafolio de demostración: cuatro sitios completos con identidad visual
independiente, construidos sobre un mismo proyecto Next.js.

| Ruta | Marca | Qué demuestra |
|---|---|---|
| `/` | Hub | Presentación de los cuatro proyectos |
| `/nova` | **Nova** — agencia creativa | WebGL con shader propio, scroll cinemático, cursor magnético |
| `/altura` | **Altura** — inmobiliaria | Filtros, comparador, calculadora de hipoteca, formularios validados |
| `/impulso` | **Impulso** — lanzamiento | Configurador 3D del producto, cuenta regresiva, captura de leads |
| `/cifra` | **Cifra** — plataforma de datos | Tablero con gráficas SVG propias, estado en la URL, tema claro/oscuro, carga de CSV del visitante |

## Correr en local

```bash
npm install
npm run dev
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
Three.js · GSAP + ScrollTrigger · Lenis

Cifra no añade ninguna dependencia: sus gráficas, su parser de CSV y su
búsqueda difusa están escritos a mano.

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
- **`prefers-reduced-motion` se respeta en los cuatro sitios**: las escenas
  dibujan un cuadro fijo y las apariciones se vuelven inmediatas.
- **Las gráficas de Cifra están dibujadas a mano.** Escalas, ticks en
  números redondos, curvas Catmull-Rom convertidas a Bézier y búsqueda
  binaria para el crosshair viven en `src/lib/grafica/`, sin librería de
  charts. Cada una expone además su tabla equivalente para lectores de
  pantalla.
- **El tablero de Cifra vive en la URL.** Los filtros se escriben con
  `history.replaceState`, así que un enlace reproduce la vista exacta sin
  disparar una carga del servidor. Es la única ruta que se renderiza por
  petición —lee `searchParams`—, y por eso es también la única con
  `loading.tsx` que signifique algo.
- **Cifra se puede probar con datos propios.** El visitante arrastra un
  CSV y el tablero entero se redibuja: el archivo se parsea en su
  navegador y no se sube a ningún lado. El parser detecta el separador
  del archivo, respeta los campos entrecomillados y entiende tanto
  `1.234,50` como `$2,480.00`.
- **Los datos de demostración son código, no JSON.** Un generador con
  semilla fija reconstruye 18 meses de historia idénticos en el servidor
  y en el cliente: pesa 3 KB en vez de más de un megabyte, y al ser
  determinista no hay discrepancias de hidratación.

Los formularios son demostrativos: validan de verdad, pero no envían
nada a ningún servidor. Los datos de Cifra son sintéticos y están
generados con una semilla fija.

## Créditos

Fotografías de [Unsplash](https://unsplash.com) bajo su licencia de uso
libre. Ver `public/img/CREDITS.md`.
