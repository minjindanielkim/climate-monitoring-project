// Per-location detail heatmap: metrics as rows, sequential readings as columns.
// This is the same visualization as the original heatmaps.html, one per location.

import { colorFor, inkFor } from "./color";
import { METRICS } from "./metrics";
import type { Location } from "./data";

export function renderHeatmap(loc: Location): HTMLElement {
  const rows = loc.rows;
  const nCols = rows.length;

  const wrap = document.createElement("div");
  const span = `${rows[0].elapsed_min}–${rows[nCols - 1].elapsed_min} min · ${nCols} readings`;
  wrap.innerHTML = `<p class="detail-meta">${span}</p>`;

  const scroll = document.createElement("div");
  scroll.className = "scroll";
  const tbl = document.createElement("table");
  tbl.className = "hm";

  const thead = document.createElement("tr");
  thead.innerHTML = `<th></th>` + rows.map((_, i) => `<th class="col">${i + 1}</th>`).join("");
  tbl.appendChild(thead);

  for (const m of METRICS) {
    const vals = rows.map((r) => r[m.key] ?? NaN);
    let lo: number, hi: number;
    if (m.domain) {
      [lo, hi] = m.domain;
    } else {
      lo = Math.min(...vals);
      hi = Math.max(...vals);
    }
    const range = hi - lo || 1;

    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = `${m.label}${m.unit ? ` (${m.unit})` : ""}`;
    tr.appendChild(th);

    vals.forEach((v, i) => {
      const bg = colorFor((v - lo) / range, m.palette);
      const td = document.createElement("td");
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.style.background = bg;
      cell.style.color = inkFor(bg);
      cell.textContent = v.toFixed(m.decimals);
      const scaleNote = m.domain ? `fixed scale ${lo}–${hi}${m.unit}` : `row range ${lo}–${hi}`;
      cell.title = `${loc.name} · reading ${i + 1} (t=${rows[i].elapsed_min} min)\n${m.label}: ${v}${m.unit}\n(${scaleNote})`;
      td.appendChild(cell);
      tr.appendChild(td);
    });
    tbl.appendChild(tr);
  }

  scroll.appendChild(tbl);
  wrap.appendChild(scroll);
  const axis = document.createElement("div");
  axis.className = "axis";
  axis.textContent = "reading number  →  (time increases left → right)";
  wrap.appendChild(axis);
  return wrap;
}
