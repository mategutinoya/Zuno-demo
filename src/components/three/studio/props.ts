import * as THREE from "three";
import { rng } from "../textures";

/** Soft-focus palm silhouette (as seen out of focus behind a product). */
export function createPalmTexture(seed = 1, color = "#2B1533") {
  const W = 1024;
  const H = 2048;
  const sharp = document.createElement("canvas");
  sharp.width = W;
  sharp.height = H;
  const ctx = sharp.getContext("2d")!;
  const r = rng(seed);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = "round";
  const top: [number, number] = [W * 0.56, H * 0.3];
  // trunk: tapered with ring texture
  ctx.beginPath();
  ctx.moveTo(W * 0.36, H);
  ctx.bezierCurveTo(W * 0.34, H * 0.72, W * 0.6, H * 0.52, top[0] - 14, top[1]);
  ctx.lineTo(top[0] + 14, top[1]);
  ctx.bezierCurveTo(W * 0.64, H * 0.52, W * 0.42, H * 0.72, W * 0.48, H);
  ctx.closePath();
  ctx.fill();
  // fronds: arching spines with long tapered leaflets hanging down
  const fronds = 13;
  for (let i = 0; i < fronds; i++) {
    const a = -Math.PI + (i / (fronds - 1)) * Math.PI + (r() - 0.5) * 0.25;
    const len = 420 + r() * 200;
    const dir = Math.cos(a) >= 0 ? 1 : -1;
    const spine: [number, number][] = [top];
    let ang = a;
    for (let k = 0; k < 24; k++) {
      ang += dir * 0.035 * (0.6 + k / 24);
      const [px, py] = spine[spine.length - 1];
      spine.push([px + Math.cos(ang) * (len / 24), py + Math.sin(ang) * (len / 24) + k * 0.9]);
    }
    ctx.lineWidth = 7;
    ctx.beginPath();
    spine.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    spine.forEach(([x, y], k) => {
      if (k < 3 || k % 1) return;
      const t = k / spine.length;
      const leaf = (150 + r() * 50) * Math.sin(Math.min(1, t * 1.15) * Math.PI) + 30;
      for (const side of [-1, 1]) {
        // leaflets droop downward and outward
        const la = Math.PI / 2 + side * (0.55 + r() * 0.25) + dir * 0.25;
        const ex = x + Math.cos(la) * leaf;
        const ey = y + Math.sin(la) * leaf;
        const mx = (x + ex) / 2 - Math.sin(la) * 10 * side;
        const my = (y + ey) / 2 + Math.cos(la) * 10 * side;
        ctx.beginPath();
        ctx.moveTo(x - 4, y);
        ctx.quadraticCurveTo(mx, my, ex, ey);
        ctx.quadraticCurveTo(mx + 6, my + 4, x + 4, y + 3);
        ctx.fill();
      }
    });
  }
  // depth-of-field blur via a second pass
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const out = c.getContext("2d")!;
  out.filter = "blur(10px)";
  out.drawImage(sharp, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createMarbleTexture(seed = 4) {
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const r = rng(seed);
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, "#F6EEF1");
  g.addColorStop(1, "#E9DDE4");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  for (let v = 0; v < 14; v++) {
    ctx.strokeStyle = `rgba(${120 + r() * 60},${100 + r() * 40},${120 + r() * 50},${0.12 + r() * 0.25})`;
    ctx.lineWidth = 0.6 + r() * 2.5;
    ctx.beginPath();
    let x = r() * S;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < S) {
      x += (r() - 0.5) * 40;
      y += 8 + r() * 20;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
