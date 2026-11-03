/**
 * Custom ZUNO letterforms — hand-drawn brush strokes, shared by the SVG logo,
 * the printed bottle label (Path2D) and the 3D wordmark texture.
 * ViewBox: 0 0 320 124
 */
/** padded so brush strokes never clip */
export const LOGO_VIEWBOX = { x: -6, y: -2, w: 334, h: 128 };
export const LOGO_STROKE = 15;

export const LOGO_LETTERS = [
  // Z
  "M17 36 C36 35 58 32 80 29 L22 100 C45 99 67 97 89 93",
  // U
  "M109 33 C108 50 106 65 107 76 C108 94 119 102 132 101 C147 100 156 90 157 72 L160 31",
  // N
  "M182 103 C181 79 182 55 184 33 L233 98 C233 76 234 52 236 29",
  // O
  "M281 30 C259 31 249 50 249 68 C249 89 261 103 279 102 C299 101 310 85 310 65 C310 44 299 30 281 30 Z",
] as const;

export const LOGO_CROWN = "M31 23 L27 7 L39 15 L47 3 L55 15 L67 7 L63 23 Z";

/** Brush underline used under slogans */
export const SWOOSH = "M4 14 C60 4 140 2 236 6";
