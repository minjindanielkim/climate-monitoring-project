// Metric definitions — mirror the rows used in heatmaps.html.
// `domain` (if present) is a FIXED absolute color scale so values are
// comparable across locations. Otherwise the scale is computed from the data.

export interface Metric {
  key: string;
  label: string;
  unit: string;
  palette: string[];
  /** Fixed [lo, hi] color domain; omit to auto-scale across locations. */
  domain?: [number, number];
  /** Decimal places for on-marker / cell labels. */
  decimals: number;
}

const TEMP_PALETTE = ["#2c7bb6", "#ffffbf", "#d7191c"]; // cold -> hot
const TEMP_DOMAIN: [number, number] = [10, 30];

export const METRICS: Metric[] = [
  { key: "ambient_temp_C", label: "Ambient temp", unit: "°C", palette: TEMP_PALETTE, domain: TEMP_DOMAIN, decimals: 1 },
  { key: "floor_temp_C", label: "Floor temp", unit: "°C", palette: TEMP_PALETTE, domain: TEMP_DOMAIN, decimals: 1 },
  { key: "humidity_pct", label: "Humidity", unit: "%", palette: ["#f7fbff", "#6baed6", "#08306b"], decimals: 0 },
  { key: "tvoc", label: "TVOC", unit: "", palette: ["#f7fcf5", "#74c476", "#00441b"], decimals: 0 },
  { key: "wind_avg_kmh", label: "Wind (avg)", unit: "km/h", palette: ["#f7fcfd", "#66c2a4", "#00441b"], decimals: 1 },
  { key: "batt_v", label: "Battery", unit: "V", palette: ["#fff5eb", "#fd8d3c", "#7f2704"], decimals: 2 },
];

export type AggMode = "mean" | "min" | "max" | "latest";

export const AGG_MODES: { value: AggMode; label: string }[] = [
  { value: "mean", label: "Mean" },
  { value: "min", label: "Min" },
  { value: "max", label: "Max" },
  { value: "latest", label: "Latest reading" },
];

export function aggregate(values: number[], mode: AggMode): number {
  const v = values.filter((x) => Number.isFinite(x));
  if (v.length === 0) return NaN;
  switch (mode) {
    case "mean":
      return v.reduce((a, b) => a + b, 0) / v.length;
    case "min":
      return Math.min(...v);
    case "max":
      return Math.max(...v);
    case "latest":
      return v[v.length - 1];
  }
}
