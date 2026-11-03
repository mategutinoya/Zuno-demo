/**
 * Calligraphic brush engine: sweeps a flat, angled nib along the logo
 * centre-lines to create thick/thin contrast and tapered terminals.
 * Pure math — runs identically on the server (SVG) and in canvas.
 */
import { LOGO_LETTERS } from "./logoPaths";

type P = [number, number];

function sampleSvgPath(d: string, step = 1.2): { pts: P[]; closed: boolean } {
  const tokens = d.match(/[MLCZ]|-?\d*\.?\d+/g) ?? [];
  const pts: P[] = [];
  let i = 0;
  let cur: P = [0, 0];
  let start: P = [0, 0];
  let cmd = "";
  let closed = false;
  const num = () => parseFloat(tokens[i++]);
  const line = (a: P, b: P) => {
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 1; k <= n; k++) pts.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  };
  while (i < tokens.length) {
    if (/[MLCZ]/.test(tokens[i])) cmd = tokens[i++];
    if (cmd === "M") {
      cur = [num(), num()];
      start = cur;
      pts.push(cur);
      cmd = "L";
    } else if (cmd === "L") {
      const b: P = [num(), num()];
      line(cur, b);
      cur = b;
    } else if (cmd === "C") {
      const c1: P = [num(), num()];
      const c2: P = [num(), num()];
      const b: P = [num(), num()];
      const approx = Math.hypot(c1[0] - cur[0], c1[1] - cur[1]) + Math.hypot(c2[0] - c1[0], c2[1] - c1[1]) + Math.hypot(b[0] - c2[0], b[1] - c2[1]);
      const n = Math.max(2, Math.ceil(approx / step));
      for (let k = 1; k <= n; k++) {
        const t = k / n;
        const u = 1 - t;
        pts.push([
          u * u * u * cur[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * b[0],
          u * u * u * cur[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * b[1],
        ]);
      }
      cur = b;
    } else if (cmd === "Z") {
      line(cur, start);
      cur = start;
      closed = true;
      cmd = "";
    } else {
      i++;
    }
  }
  return { pts, closed };
}

export interface BrushOptions {
  halfWidth: number;
  halfThickness: number;
  angle: number;
}

export const BRUSH: BrushOptions = { halfWidth: 12.5, halfThickness: 2.6, angle: (-38 * Math.PI) / 180 };

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export interface BrushStroke {
  pts: P[];
  closed: boolean;
  /** per-sample edge offsets */
  off: P[];
}

function buildStroke(d: string, o: BrushOptions = BRUSH): BrushStroke {
  const { pts, closed } = sampleSvgPath(d);
  const n: P = [Math.cos(o.angle), Math.sin(o.angle)];
  const off: P[] = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    let tx = b[0] - a[0];
    let ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1;
    tx /= l;
    ty /= l;
    const q: P = [-ty, tx];
    const dot = n[0] * q[0] + n[1] * q[1];
    const t = i / (pts.length - 1);
    // pressure: firm landing, tapered exit
    const pressure = closed ? 0.92 + 0.08 * Math.sin(t * Math.PI * 2) : (0.78 + 0.22 * smooth(0, 0.08, t)) * (1 - 0.55 * smooth(0.82, 1, t));
    const hw = o.halfWidth * pressure;
    const s = Math.sign(dot) || 1;
    return [n[0] * hw * s + q[0] * o.halfThickness, n[1] * hw * s + q[1] * o.halfThickness];
  });
  return { pts, closed, off };
}

export const BRUSH_STROKES: BrushStroke[] = LOGO_LETTERS.map((d) => buildStroke(d));

/** Outline polygon of a stroke, optionally only up to `upTo` (0..1) for paint-on */
export function strokeOutline(s: BrushStroke, upTo = 1): P[] {
  const n = Math.max(2, Math.round(s.pts.length * Math.min(1, upTo)));
  const left: P[] = [];
  const right: P[] = [];
  for (let i = 0; i < n; i++) {
    const p = s.pts[i];
    const o = s.off[i];
    left.push([p[0] + o[0], p[1] + o[1]]);
    right.push([p[0] - o[0], p[1] - o[1]]);
  }
  return left.concat(right.reverse());
}

const f = (v: number) => Math.round(v * 10) / 10;

export function outlineToPath(poly: P[]) {
  return "M" + poly.map((p) => `${f(p[0])} ${f(p[1])}`).join("L") + "Z";
}

/** Closed shapes (the O) need the inner and outer edge as separate rings */
export function strokeToPath(s: BrushStroke) {
  if (!s.closed) return outlineToPath(strokeOutline(s));
  const outer = s.pts.map((p, i) => [p[0] + s.off[i][0], p[1] + s.off[i][1]] as P);
  const inner = s.pts.map((p, i) => [p[0] - s.off[i][0], p[1] - s.off[i][1]] as P).reverse();
  return outlineToPath(outer) + outlineToPath(inner);
}

export const BRUSH_PATHS = BRUSH_STROKES.map(strokeToPath);
