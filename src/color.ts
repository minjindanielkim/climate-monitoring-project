// Color-scale helpers — same approach as the original heatmaps.html:
// interpolate a value t in [0,1] across a multi-stop hex palette.

export type Rgb = [number, number, number];

function hexToRgb(h: string): Rgb {
  return [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

/** t in [0,1] mapped across the palette stops -> "rgb(r,g,b)" string. */
export function colorFor(t: number, palette: string[]): string {
  const segs = palette.length - 1;
  const x = Math.max(0, Math.min(1, t)) * segs;
  const i = Math.min(segs - 1, Math.floor(x));
  const f = x - i;
  const c1 = hexToRgb(palette[i]);
  const c2 = hexToRgb(palette[i + 1]);
  return `rgb(${lerp(c1[0], c2[0], f)},${lerp(c1[1], c2[1], f)},${lerp(c1[2], c2[2], f)})`;
}

/** Pick dark or light ink for readable text over a given rgb() background. */
export function inkFor(rgb: string): string {
  const m = (rgb.match(/\d+/g) ?? ["0", "0", "0"]).map(Number);
  const lum = 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2];
  return lum > 150 ? "#0b0d10" : "#f2f4f7";
}

/** CSS linear-gradient string for a legend bar built from a palette. */
export function gradientFor(palette: string[]): string {
  const stops = palette
    .map((c, i) => `${c} ${(i / (palette.length - 1)) * 100}%`)
    .join(", ");
  return `linear-gradient(90deg, ${stops})`;
}
