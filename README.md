# ZUNO — Immersive 3D Brand Experience

Web oficial de **ZUNO**, hard seltzer frutal en botella de vidrio de 300 ml.
_DRINK DIFFERENT. Una vuelta más de sabor._

## Ejecutar en local

Requisitos: **Node.js 20+** y npm.

```bash
npm install
npm run dev          # http://localhost:3000 (desarrollo)

# producción
npm run build
npm start            # http://localhost:3000
```

Otros comandos:

```bash
npm run typecheck    # TypeScript sin emitir
npm run render:shots # regenera las imágenes de /public/experience (ver abajo)
```

> Al entrar aparece la verificación de mayoría de edad (18+). La respuesta se guarda en
> `localStorage` (`zuno-age-verified`) si se marca "Recordar". Bórrala para volver a ver el gate.

## Stack

| Área | Tecnología |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Estilos | Tailwind CSS 4 |
| 3D | Three.js, React Three Fiber 9, Drei 10 |
| Motion | GSAP 3 + ScrollTrigger, Framer Motion 12, Lenis (smooth scroll) |
| Iconos | Lucide React |

## Arquitectura

```
src/
  app/                      rutas (home, legales, consumo responsable, /studio interno)
  components/
    brand/                  logotipo ZUNO: trazos centrales + motor de pincel caligráfico
    layout/                 Navbar, AgeGate, SmoothScroll, Footer, Marquee
    sections/               Hero, OurDrink, Flavors, Experience, Story
    three/                  escena WebGL
      Scene.tsx             Canvas único (sticky) detrás de Hero → Our Drink → Flavors
      director.ts           convierte "anclas" DOM en posiciones 3D y mezcla colores por scroll
      LiveBottle.tsx        botella: pose por scroll, flotación, cursor, intro, giro al cambiar sabor
      BottleModel.tsx       geometría + materiales (vidrio con transmisión, líquido, etiqueta, tapa, gotas, burbujas)
      textures.ts           texturas procedurales: etiquetas por sabor, condensación, tapa, wordmark, frutas
      Fruits.tsx            frutas 3D procedurales por sabor
      studio/               estudio de render para las fotos de Experience
  lib/                      sabores, stores, estado de escena, config del sitio
```

### Cómo funciona la experiencia 3D

- **Un solo contexto WebGL.** El canvas es `sticky` y vive detrás de las tres primeras secciones.
  Cada sección coloca un `<SceneAnchor>` invisible donde debe estar la botella; el _director_
  proyecta esas cajas DOM al mundo 3D cada frame y mezcla pose y colores de fondo según el scroll.
  Así la botella "viaja" entre secciones y el layout sigue siendo 100% responsive.
- **Botella procedural, sin imágenes falsas:** perfil por torno (`LatheGeometry`), vidrio
  `MeshPhysicalMaterial` con transmisión/refracción, mapas de normales y rugosidad de condensación
  generados, ~170 gotas instanciadas, burbujas que suben, tapa corona con estrías y etiqueta
  dibujada en canvas con el logotipo y tipografía de marca.
- **El wordmark gigante del Hero está dentro de la escena**, detrás de la botella, por eso el vidrio lo refracta.
- **Reflejos de estudio** con `Lightformer` (sin descargar HDRIs).
- **Rendimiento:** el canvas deja de renderizar fuera de viewport, DPR adaptativo (`PerformanceMonitor`),
  menos gotas/burbujas/frutas/partículas y transmisión a menor resolución en móvil; three.js se carga
  de forma diferida tras la verificación de edad.
- **Fallback:** sin WebGL se muestra una botella SVG ligera y los fondos pasan a CSS.
- **Accesibilidad:** `prefers-reduced-motion` desactiva smooth scroll, flotación, giros y parallax;
  selector de sabores con roles `tablist` y navegación por teclado (← →); swipe en móvil.

### Imágenes de Experience

Las imágenes de `/public/experience` son **renders del propio modelo 3D** compuestos en `/studio`
(atardecer, fruta fresca, condensación, lineup). Para regenerarlas:

```bash
npm run build && npm start              # en otra terminal
npx playwright install chromium         # solo la primera vez
STUDIO_URL=http://localhost:3000 npm run render:shots
```

Cuando exista fotografía oficial, basta con reemplazar esos archivos manteniendo los nombres.

## Antes de publicar

- Reemplazar handles y correos en `src/lib/site.ts` (Instagram, TikTok, contacto comercial, distribución).
- Validar la graduación (la web la indica como objetivo de formulación: 4.5% Alc. Vol.*).
- Revisar textos legales (`/legal/*`) con asesoría legal.
