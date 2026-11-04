import * as THREE from "three";
import type { Flavor } from "@/lib/flavors";
import { LOGO_CROWN, LOGO_VIEWBOX } from "@/components/brand/logoPaths";
import { BRUSH_STROKES, outlineToPath, strokeOutline, strokeToPath } from "@/components/brand/brush";
import { LABEL } from "./dimensions";

/* ---------------------------------------------------------------- utils */

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  return { c, ctx };
}

export function fontVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export async function loadCanvasFonts() {
  const display = fontVar("--font-display", "system-ui, sans-serif");
  const marker = fontVar("--font-marker", "cursive");
  try {
    await Promise.all([
      document.fonts.load(`800 64px ${display}`),
      document.fonts.load(`500 64px ${display}`),
      document.fonts.load(`400 64px ${marker}`),
    ]);
  } catch {
    /* draw with fallbacks */
  }
  return { display, marker };
}

export type CanvasFonts = Awaited<ReturnType<typeof loadCanvasFonts>>;

/** Draws the ZUNO logo with the calligraphic brush. `progress` animates a paint-on. */
function drawLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  color: string,
  crownColor: string,
  progress = 1,
  crown = true,
) {
  const s = width / LOGO_VIEWBOX.w;
  ctx.save();
  ctx.translate(x - LOGO_VIEWBOX.x * s, y - LOGO_VIEWBOX.y * s);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.lineJoin = "round";
  const n = BRUSH_STROKES.length;
  BRUSH_STROKES.forEach((stroke, i) => {
    const local = THREE.MathUtils.clamp(progress * n - i * 0.75, 0, 1);
    if (local <= 0) return;
    ctx.globalCompositeOperation = "source-over";
    const path =
      local >= 1 && stroke.closed ? new Path2D(strokeToPath(stroke)) : new Path2D(outlineToPath(strokeOutline(stroke, local)));
    ctx.fill(path);
    ctx.stroke(path);
    if (local < 1) return;
    // dry-brush bristle gaps on the exit of each stroke
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 0.9;
    const r = rng(i * 31 + 5);
    const len = stroke.pts.length;
    for (let b = 0; b < 4; b++) {
      const frac = -0.8 + (b / 3) * 1.6;
      const from = Math.floor(len * (0.62 + r() * 0.25));
      ctx.beginPath();
      let drawing = false;
      for (let k = from; k < len; k++) {
        const p = stroke.pts[k];
        const o = stroke.off[k];
        const px = p[0] + o[0] * frac;
        const py = p[1] + o[1] * frac;
        if (r() > 0.25) {
          if (!drawing) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
          drawing = true;
        } else drawing = false;
      }
      ctx.globalAlpha = 0.15 + r() * 0.25;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1.2;
  });
  ctx.globalCompositeOperation = "source-over";
  if (crown && progress > 0.85) {
    ctx.globalAlpha = THREE.MathUtils.clamp((progress - 0.85) / 0.15, 0, 1);
    ctx.fillStyle = crownColor;
    ctx.fill(new Path2D(LOGO_CROWN));
  }
  ctx.restore();
}

function drawCrown(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, color: string) {
  const s = w / 40;
  ctx.save();
  ctx.translate(cx - 47 * s, cy - 13 * s);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.fill(new Path2D(LOGO_CROWN));
  ctx.restore();
}

function withSpacing(ctx: CanvasRenderingContext2D, px: number) {
  const anyCtx = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ("letterSpacing" in anyCtx) anyCtx.letterSpacing = `${px}px`;
}

function toTexture(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

/* ---------------------------------------------------------- fruit icons */

function fruitIcon(ctx: CanvasRenderingContext2D, kind: string, x: number, y: number, r: number) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  const palettes: Record<string, [string, string]> = {
    lychee: ["#FF8FA6", "#C21F49"],
    raspberry: ["#FF5C82", "#A3123A"],
    mango: ["#FFD45A", "#F06A1E"],
    passion: ["#A8508E", "#3B1235"],
    achachairu: ["#FFC35A", "#E8730C"],
    lime: ["#B9E45C", "#3F8A1E"],
    blackberry: ["#6A3A7A", "#1C0A22"],
    blueberry: ["#7C8BD6", "#26306E"],
  };
  const [a, b] = palettes[kind] ?? ["#fff", "#999"];
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  if (kind === "raspberry" || kind === "blackberry") {
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    for (let i = 0; i < 14; i++) {
      const a2 = i * 2.4;
      const rr = r * 0.62 * Math.sqrt((i + 0.5) / 14);
      ctx.beginPath();
      ctx.arc(x + Math.cos(a2) * rr, y + Math.sin(a2) * rr, r * 0.11, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (kind === "lime" || kind === "passion" || kind === "achachairu" || kind === "lychee") {
    // cut face on the right half
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + r * 0.9, y + r * 0.25, r * 0.72, 0, Math.PI * 2);
    ctx.fillStyle =
      kind === "lime" ? "#E6F59A" : kind === "passion" ? "#FFC21A" : kind === "lychee" ? "#FFF6EC" : "#FFF8EE";
    ctx.fill();
    ctx.lineWidth = r * 0.12;
    ctx.strokeStyle = b;
    ctx.stroke();
    if (kind === "passion") {
      ctx.fillStyle = "#2A1408";
      for (let i = 0; i < 9; i++) {
        const a2 = i * 2.4;
        const rr = r * 0.45 * Math.sqrt((i + 0.5) / 9);
        ctx.beginPath();
        ctx.arc(x + r * 0.9 + Math.cos(a2) * rr, y + r * 0.25 + Math.sin(a2) * rr, r * 0.07, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (kind === "lime") {
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = r * 0.04;
      for (let i = 0; i < 8; i++) {
        const a2 = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(x + r * 0.9, y + r * 0.25);
        ctx.lineTo(x + r * 0.9 + Math.cos(a2) * r * 0.62, y + r * 0.25 + Math.sin(a2) * r * 0.62);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  // leaf
  ctx.save();
  ctx.translate(x - r * 0.2, y - r * 0.95);
  ctx.rotate(-0.6);
  ctx.fillStyle = "#3C8A3A";
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.45, r * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // highlight
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.ellipse(x - r * 0.4, y - r * 0.4, r * 0.18, r * 0.1, -0.7, 0, Math.PI * 2);
  ctx.fill();
}

/* ---------------------------------------------------------------- label */

export function createLabelTexture(flavor: Flavor, fonts: CanvasFonts) {
  const W = 2048;
  const H = Math.round(W / LABEL.aspect);
  const { c, ctx } = canvas(W, H);
  const r = rng(flavor.id.length * 977 + 13);
  const L = flavor.label;

  const grad = ctx.createLinearGradient(0, 0, W * 0.2, H);
  grad.addColorStop(0, L.top);
  grad.addColorStop(1, L.bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // painterly diagonal brush strokes
  ctx.save();
  ctx.lineCap = "round";
  for (let i = 0; i < 9; i++) {
    const x = W * (0.18 + r() * 0.64);
    ctx.save();
    ctx.translate(x, H * (0.2 + r() * 0.6));
    ctx.rotate(-0.95 + r() * 0.2);
    ctx.globalAlpha = 0.12 + r() * 0.22;
    ctx.strokeStyle = L.stroke;
    ctx.lineWidth = 30 + r() * 120;
    ctx.beginPath();
    ctx.moveTo(-H * (0.25 + r() * 0.3), 0);
    ctx.lineTo(H * (0.25 + r() * 0.3), r() * 30);
    ctx.stroke();
    // bristle marks
    ctx.globalAlpha *= 0.6;
    ctx.lineWidth = 3;
    for (let b = 0; b < 12; b++) {
      const off = (r() - 0.5) * 120;
      ctx.beginPath();
      ctx.moveTo(-H * 0.3, off);
      ctx.lineTo(H * (0.1 + r() * 0.3), off + r() * 8);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();

  // fine paper grain (small tile, repeated)
  {
    const g = canvas(128, 128);
    const img = g.ctx.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 14;
    }
    g.ctx.putImageData(img, 0, 0);
    ctx.fillStyle = ctx.createPattern(g.c, "repeat")!;
    ctx.fillRect(0, 0, W, H);
  }

  const cx = W / 2;
  const cw = W * 0.34;

  // crown + logo
  drawCrown(ctx, cx - cw * 0.02, H * 0.085, cw * 0.17, L.logo);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  drawLogo(ctx, cx - cw / 2, H * 0.12, cw, L.logo, L.logo, 1, false);
  ctx.restore();

  // flavour name in marker type
  ctx.fillStyle = L.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fs = H * 0.088;
  ctx.font = `400 ${fs}px ${fonts.marker}`;
  ctx.save();
  ctx.translate(cx, H * 0.5);
  ctx.rotate(-0.04);
  ctx.fillText(flavor.labelLines[0], 0, -fs * 0.56, cw * 1.05);
  ctx.fillText(flavor.labelLines[1], 0, fs * 0.56, cw * 1.05);
  ctx.restore();

  // fruits
  const [f1, f2] = flavor.fruits;
  fruitIcon(ctx, f1, cx - H * 0.04, H * 0.645, H * 0.045);
  fruitIcon(ctx, f2, cx + H * 0.085, H * 0.658, H * 0.031);

  // product info
  ctx.fillStyle = L.ink;
  ctx.font = `800 ${H * 0.05}px ${fonts.display}`;
  withSpacing(ctx, H * 0.006);
  ctx.fillText("HARD SELTZER", cx, H * 0.735);
  withSpacing(ctx, 0);

  // "ZERO AZÚCAR" badge: rounded pill in a deep shade of the label colour
  {
    const pw = H * 0.24;
    const ph = H * 0.1;
    const px = cx - pw / 2;
    const py = H * 0.775;
    const pill =
      flavor.ink === "light"
        ? new THREE.Color(L.top).lerp(new THREE.Color("#ffffff"), 0.15)
        : new THREE.Color(flavor.accent).multiplyScalar(0.58);
    ctx.fillStyle = `#${pill.getHexString()}`;
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, ph * 0.28);
    ctx.fill();
    ctx.fillStyle = "#FFF8F2";
    ctx.font = `800 ${H * 0.036}px ${fonts.display}`;
    withSpacing(ctx, H * 0.002);
    ctx.fillText("ZERO", cx, py + ph * 0.3);
    ctx.fillText("AZÚCAR", cx, py + ph * 0.72);
    withSpacing(ctx, 0);
  }

  ctx.fillStyle = L.ink;
  ctx.font = `500 ${H * 0.032}px ${fonts.display}`;
  ctx.fillText("4.5% Alc. Vol.", cx, H * 0.91);
  ctx.fillText("300 ml", cx, H * 0.948);

  // left side panel — slogan (vertical)
  ctx.save();
  ctx.translate(W * 0.17, H * 0.5);
  ctx.rotate(-Math.PI / 2);
  ctx.font = `800 ${H * 0.05}px ${fonts.display}`;
  withSpacing(ctx, H * 0.02);
  ctx.fillText("DRINK DIFFERENT", 0, 0);
  withSpacing(ctx, 0);
  ctx.font = `400 ${H * 0.04}px ${fonts.marker}`;
  ctx.fillText("Una vuelta más de sabor.", 0, H * 0.07);
  ctx.restore();

  // right side panel — information
  ctx.save();
  ctx.textAlign = "left";
  const px = W * 0.76;
  let py = H * 0.3;
  ctx.font = `800 ${H * 0.03}px ${fonts.display}`;
  ctx.fillText(`ZUNO ${flavor.name.toUpperCase()}`, px, py);
  ctx.font = `500 ${H * 0.024}px ${fonts.display}`;
  const lines = [
    "Bebida alcohólica gasificada",
    "sabor a fruta. Zero azúcar.",
    "Contenido neto: 300 ml",
    "Graduación objetivo: 4.5% Alc. Vol.",
    "",
    "Sírvase bien frío.",
    "Consumo responsable.",
    "Prohibida su venta a",
    "menores de 18 años.",
  ];
  py += H * 0.05;
  lines.forEach((l) => {
    ctx.fillText(l, px, py);
    py += H * 0.034;
  });
  // 18+ seal
  py += H * 0.04;
  ctx.lineWidth = 4;
  ctx.strokeStyle = L.ink;
  ctx.beginPath();
  ctx.arc(px + H * 0.045, py, H * 0.045, 0, Math.PI * 2);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.font = `800 ${H * 0.032}px ${fonts.display}`;
  ctx.fillText("18+", px + H * 0.045, py + 2);
  ctx.restore();

  // printed hairlines
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = L.stroke;
  ctx.fillRect(0, H * 0.025, W, 3);
  ctx.fillRect(0, H * 0.972, W, 3);
  ctx.globalAlpha = 1;

  return toTexture(c);
}

/* ------------------------------------------------------- condensation */

/** Tileable normal + roughness maps for cold-glass condensation. */
export function createCondensationMaps(size = 1024, seed = 7) {
  const r = rng(seed);
  const normal = new Uint8ClampedArray(size * size * 4);
  const rough = new Uint8ClampedArray(size * size * 4);
  // mist roughness background
  for (let i = 0; i < size * size; i++) {
    normal[i * 4] = 128;
    normal[i * 4 + 1] = 128;
    normal[i * 4 + 2] = 255;
    normal[i * 4 + 3] = 255;
    const v = 60 + r() * 30;
    rough[i * 4] = rough[i * 4 + 1] = rough[i * 4 + 2] = v;
    rough[i * 4 + 3] = 255;
  }

  const drop = (x0: number, y0: number, rx: number, ry: number) => {
    const xr = Math.ceil(rx);
    const yr = Math.ceil(ry);
    for (let dy = -yr; dy <= yr; dy++) {
      for (let dx = -xr; dx <= xr; dx++) {
        const nx = dx / rx;
        // drops are heavier at the bottom
        const ny = dy / (dy > 0 ? ry : ry * 0.85);
        const d2 = nx * nx + ny * ny;
        if (d2 >= 1) continue;
        const nz = Math.sqrt(1 - d2);
        const len = Math.hypot(nx, ny, nz * 0.6);
        const px = (((x0 + dx) % size) + size) % size;
        const py = (((y0 + dy) % size) + size) % size;
        const idx = (py * size + px) * 4;
        normal[idx] = (nx / len) * 127 + 128;
        normal[idx + 1] = (-ny / len) * 127 + 128;
        normal[idx + 2] = ((nz * 0.6) / len) * 127 + 128;
        rough[idx] = rough[idx + 1] = rough[idx + 2] = 4;
      }
    }
  };

  // micro mist droplets
  for (let i = 0; i < 9000; i++) {
    const rad = 1 + r() * 1.8;
    drop(Math.floor(r() * size), Math.floor(r() * size), rad, rad);
  }
  // medium droplets
  for (let i = 0; i < 900; i++) {
    const rad = 2.5 + Math.pow(r(), 2) * 8;
    drop(Math.floor(r() * size), Math.floor(r() * size), rad, rad * (1 + r() * 0.3));
  }
  // running drops with trails
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(r() * size);
    const y = Math.floor(r() * size);
    const rad = 8 + r() * 7;
    const trail = 60 + r() * 220;
    for (let t = 0; t < trail; t += 3) {
      const tx = x + Math.round(Math.sin(t * 0.05 + i) * 2);
      const w = rad * 0.32 * (1 - t / trail) + 1;
      drop(tx, y - t, w, 2.5);
    }
    drop(x, y, rad, rad * 1.25);
  }

  const mk = (data: Uint8ClampedArray, srgb: boolean) => {
    const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  };

  return { normalMap: mk(normal, false), roughnessMap: mk(rough, false) };
}

/* ---------------------------------------------------------------- cap */

export function createCapTopTexture() {
  const { c, ctx } = canvas(512, 512);
  const g = ctx.createRadialGradient(256, 256, 10, 256, 256, 256);
  g.addColorStop(0, "#2a2530");
  g.addColorStop(1, "#0b090d");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  drawCrown(ctx, 256, 256, 220, "#E9B44C");
  ctx.strokeStyle = "rgba(233,180,76,0.6)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(256, 256, 200, 0, Math.PI * 2);
  ctx.stroke();
  return toTexture(c);
}

/* ------------------------------------------------------------ wordmark */

export function createWordmarkCanvas() {
  const W = 2048;
  const H = Math.round((W * LOGO_VIEWBOX.h) / LOGO_VIEWBOX.w);
  const { c, ctx } = canvas(W, H);
  const draw = (progress: number) => {
    ctx.clearRect(0, 0, W, H);
    drawLogo(ctx, 0, 0, W, "#FFF8F2", "#FF9B42", progress, true);
  };
  return { canvas: c, draw, aspect: W / H };
}

/* ---------------------------------------------------- fruit cut faces */

export function createLimeSliceTexture() {
  const S = 1024;
  const { c, ctx } = canvas(S, S);
  const r = rng(5);
  const cx = S / 2;
  // rind → pith → flesh
  ctx.fillStyle = "#3E7F1B";
  ctx.beginPath();
  ctx.arc(cx, cx, S / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6FA82E";
  ctx.beginPath();
  ctx.arc(cx, cx, S * 0.475, 0, Math.PI * 2);
  ctx.fill();
  const pith = ctx.createRadialGradient(cx, cx, S * 0.4, cx, cx, S * 0.465);
  pith.addColorStop(0, "#F3F6D4");
  pith.addColorStop(1, "#DDE9A6");
  ctx.fillStyle = pith;
  ctx.beginPath();
  ctx.arc(cx, cx, S * 0.462, 0, Math.PI * 2);
  ctx.fill();
  const segs = 10;
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI * 2 + 0.018;
    const a1 = ((i + 1) / segs) * Math.PI * 2 - 0.018;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos((a0 + a1) / 2) * S * 0.035, cx + Math.sin((a0 + a1) / 2) * S * 0.035);
    ctx.arc(cx, cx, S * 0.415, a0, a1);
    ctx.closePath();
    const g = ctx.createRadialGradient(cx, cx, S * 0.03, cx, cx, S * 0.42);
    g.addColorStop(0, "#E9F4AE");
    g.addColorStop(0.55, "#BFE05C");
    g.addColorStop(1, "#9CCB3A");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();
    // juice vesicles: elongated, translucent teardrops pointing to the centre
    for (let v = 0; v < 120; v++) {
      const a = a0 + (a1 - a0) * r();
      const d = S * (0.07 + r() * 0.34);
      const x = cx + Math.cos(a) * d;
      const y = cx + Math.sin(a) * d;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      ctx.fillStyle = `rgba(${230 + r() * 25},255,${170 + r() * 60},${0.18 + r() * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, S * (0.025 + r() * 0.03), S * (0.006 + r() * 0.006), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.ellipse(-S * 0.006, -S * 0.002, S * 0.008, S * 0.002, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  // centre core
  ctx.fillStyle = "#F1F6D2";
  ctx.beginPath();
  ctx.arc(cx, cx, S * 0.03, 0, Math.PI * 2);
  ctx.fill();
  return toTexture(c);
}

export function createPassionPulpTexture() {
  const S = 1024;
  const { c, ctx } = canvas(S, S);
  const r = rng(42);
  const cx = S / 2;
  // white-cream pith ring, then the pulp cavity
  ctx.fillStyle = "#F2E6C9";
  ctx.beginPath();
  ctx.arc(cx, cx, S / 2, 0, Math.PI * 2);
  ctx.fill();
  const cav = ctx.createRadialGradient(cx, cx, 10, cx, cx, S * 0.44);
  cav.addColorStop(0, "#E9A20A");
  cav.addColorStop(0.8, "#C9780A");
  cav.addColorStop(1, "#9A5A12");
  ctx.fillStyle = cav;
  ctx.beginPath();
  ctx.arc(cx, cx, S * 0.43, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cx, S * 0.43, 0, Math.PI * 2);
  ctx.clip();
  // gelatinous seed sacs: translucent yellow blobs, each around a dark seed
  for (let i = 0; i < 240; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * S * 0.42;
    const x = cx + Math.cos(a) * d;
    const y = cx + Math.sin(a) * d;
    const rad = S * (0.022 + r() * 0.018);
    const g = ctx.createRadialGradient(x - rad * 0.3, y - rad * 0.3, rad * 0.1, x, y, rad);
    g.addColorStop(0, "rgba(255,236,120,0.95)");
    g.addColorStop(0.7, "rgba(250,190,30,0.85)");
    g.addColorStop(1, "rgba(200,120,10,0.0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 150; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * S * 0.4;
    const x = cx + Math.cos(a) * d;
    const y = cx + Math.sin(a) * d;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(r() * Math.PI);
    ctx.fillStyle = "#1A0D06";
    ctx.beginPath();
    ctx.ellipse(0, 0, S * 0.011, S * 0.007, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.ellipse(-S * 0.003, -S * 0.002, S * 0.003, S * 0.0015, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  return toTexture(c);
}

export function createAchachairuFleshTexture() {
  const S = 1024;
  const { c, ctx } = canvas(S, S);
  const r = rng(9);
  const cx = S / 2;
  // thin glossy orange rind with a pale inner edge
  ctx.fillStyle = "#E9780C";
  ctx.beginPath();
  ctx.arc(cx, cx, S / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#F7C77A";
  ctx.beginPath();
  ctx.arc(cx, cx, S * 0.475, 0, Math.PI * 2);
  ctx.fill();
  // translucent white, slightly fibrous flesh
  const g = ctx.createRadialGradient(cx, cx, 10, cx, cx, S * 0.46);
  g.addColorStop(0, "#FFFDF8");
  g.addColorStop(0.75, "#F8F1E4");
  g.addColorStop(1, "#EADCC2");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cx, S * 0.462, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(225,210,185,0.35)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 160; i++) {
    const a = r() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * S * 0.18, cx + Math.sin(a) * S * 0.18);
    ctx.lineTo(cx + Math.cos(a) * S * 0.45, cx + Math.sin(a) * S * 0.45);
    ctx.stroke();
  }
  // large glossy brown seed
  const seed = (x: number, y: number, rx: number, ry: number, rot: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const sg = ctx.createRadialGradient(-rx * 0.3, -ry * 0.3, 2, 0, 0, Math.max(rx, ry));
    sg.addColorStop(0, "#B8834B");
    sg.addColorStop(0.7, "#7A4B22");
    sg.addColorStop(1, "#4E2C12");
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath();
    ctx.ellipse(-rx * 0.35, -ry * 0.4, rx * 0.25, ry * 0.12, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  seed(cx - 40, cx, 95, 150, 0.15);
  seed(cx + 95, cx + 20, 50, 85, -0.35);
  return toTexture(c);
}
