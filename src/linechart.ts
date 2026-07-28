// Per-location line graph: one small line per metric showing its change over
// time. Mirrors the heat map (same metrics, same per-metric auto-scaling) but
// as sparklines so the trend across readings is visible.

import { METRICS } from "./metrics";
import type { Location } from "./data";

const W = 300; // svg user-units (scales to container width)
const H = 52;
const PAD = 6;

function lineColor(palette: string[]): string {
  // most-saturated end of the palette = the visible line color
  return palette[palette.length - 1];
}

function sparkline(values: number[], color: string): string {
  const vals = values.map((v) => (Number.isFinite(v) ? v : 0));
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const range = hi - lo || 1;
  const n = vals.length;
  const x = (i: number) => PAD + (n === 1 ? 0 : (i / (n - 1)) * (W - 2 * PAD));
  const y = (v: number) => H - PAD - ((v - lo) / range) * (H - 2 * PAD);

  const pts = vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
  const line = "M" + pts.join(" L");
  const area = `M${x(0).toFixed(1)},${(H - PAD).toFixed(1)} L${pts.join(" L")} L${x(n - 1).toFixed(1)},${(H - PAD).toFixed(1)} Z`;
  const dots = vals
    .map((v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="1.6" fill="${color}" />`)
    .join("");
  const lastX = x(n - 1).toFixed(1);
  const lastY = y(vals[n - 1]).toFixed(1);

  return `
    <svg class="lc-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img">
      <path d="${area}" fill="${color}" fill-opacity="0.12" stroke="none" />
      <path d="${line}" fill="none" stroke="${color}" stroke-width="1.6"
            stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
      ${dots}
      <circle cx="${lastX}" cy="${lastY}" r="2.6" fill="${color}" stroke="#fff" stroke-width="1" />
    </svg>`;
}

export function renderLineChart(loc: Location): HTMLElement {
  const rows = loc.rows;
  const wrap = document.createElement("div");
  wrap.className = "lc";

  for (const m of METRICS) {
    const vals = rows.map((r) => r[m.key] ?? NaN);
    const finite = vals.filter(Number.isFinite);
    const lo = Math.min(...finite);
    const hi = Math.max(...finite);
    const color = lineColor(m.palette);

    const row = document.createElement("div");
    row.className = "lc-row";
    row.innerHTML = `
      <div class="lc-head">
        <span class="lc-name">${m.label}${m.unit ? ` (${m.unit})` : ""}</span>
        <span class="lc-range">${lo.toFixed(m.decimals)} – ${hi.toFixed(m.decimals)}</span>
      </div>
      ${sparkline(vals, color)}`;
    wrap.appendChild(row);
  }

  const axis = document.createElement("div");
  axis.className = "axis";
  axis.textContent = "reading number  →  (time increases left → right)";
  wrap.appendChild(axis);
  return wrap;
}
