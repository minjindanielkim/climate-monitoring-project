import "./style.css";
import { LOCATIONS, type Location } from "./data";
import { METRICS, AGG_MODES, aggregate, type Metric, type AggMode } from "./metrics";
import { colorFor, inkFor, gradientFor } from "./color";
import { project, unproject } from "./geo";
import { renderHeatmap } from "./heatmap";
import { renderLineChart } from "./linechart";

// ---- app state ----
let metric: Metric = METRICS[0];
let aggMode: AggMode = "mean";
let selected: Location | null = null;
let calibrating = false;

// Path to the campus screenshot. Drop your image in /public (map.jpg or map.png).
const MAP_SRC = "/map.jpg";

const app = document.getElementById("app")!;
app.innerHTML = `
  <div class="wrap">
    <h1>Campus Climate Map</h1>
    <p class="sub">
      Each marker is a sensor location, placed by its latitude/longitude and colored by the
      selected metric (same palette scheme as the heat maps). Temperatures use a fixed 10–30&nbsp;°C
      scale; other metrics scale across all locations. Click a marker to open that location's own
      detailed time-series heat map.
    </p>

    <div class="controls">
      <div class="field">
        <label>Metric</label>
        <div class="btn-row" id="metric"></div>
      </div>
      <div class="controls-lower">
        <div class="field">
          <label for="agg">Aggregation</label>
          <select id="agg"></select>
        </div>
        <label class="toggle"><input type="checkbox" id="calib" /> Calibrate map (show lat/lon under cursor)</label>
      </div>
    </div>

    <div class="map-panel" id="mapPanel">
      <div class="map-stage" id="stage"></div>
      <div class="probe" id="probe">–</div>
    </div>

    <div class="legend" id="legend"></div>

    <div class="detail" id="detail">
      <p class="hint">Select a location marker above to see its full time-series heat map here.</p>
    </div>

    <p class="foot">
      Locations: ${LOCATIONS.map((l) => l.name).join(", ")}.
      Markers show the ${AGG_MODES.map((a) => a.label.toLowerCase()).join(" / ")} value per location.
    </p>
  </div>
`;

// ---- metric buttons ----
const metricRow = document.getElementById("metric") as HTMLDivElement;
metricRow.innerHTML = METRICS.map(
  (m, i) => `<button type="button" class="btn" data-i="${i}">${m.label}${m.unit ? ` <span class="btn-unit">${m.unit}</span>` : ""}</button>`
).join("");
function syncMetricButtons() {
  metricRow.querySelectorAll<HTMLButtonElement>(".btn").forEach((b) => {
    b.classList.toggle("active", METRICS[+b.dataset.i!] === metric);
  });
}
metricRow.querySelectorAll<HTMLButtonElement>(".btn").forEach((b) => {
  b.onclick = () => { metric = METRICS[+b.dataset.i!]; syncMetricButtons(); render(); };
});
syncMetricButtons();

const aggSel = document.getElementById("agg") as HTMLSelectElement;
aggSel.innerHTML = AGG_MODES.map((a) => `<option value="${a.value}">${a.label}</option>`).join("");
aggSel.onchange = () => { aggMode = aggSel.value as AggMode; render(); };

const calib = document.getElementById("calib") as HTMLInputElement;
const mapPanel = document.getElementById("mapPanel")!;
calib.onchange = () => {
  calibrating = calib.checked;
  mapPanel.classList.toggle("calibrating", calibrating);
};

// ---- build map stage (image + overlay) ----
const stage = document.getElementById("stage")!;
const img = new Image();
img.className = "map-img";
img.src = MAP_SRC;
img.alt = "Campus map";
const overlay = document.createElement("div");
overlay.className = "overlay";

img.onload = () => { stage.appendChild(img); stage.appendChild(overlay); render(); };
img.onerror = () => {
  const fb = document.createElement("div");
  fb.className = "map-fallback";
  fb.innerHTML = `Map image not found at <code>public/map.png</code>.<br>Save your campus screenshot there — markers are still placed by lat/lon below.`;
  stage.appendChild(fb);
  stage.appendChild(overlay);
  render();
};

// coordinate probe for calibration
overlay.addEventListener("mousemove", (e) => {
  if (!calibrating) return;
  const r = overlay.getBoundingClientRect();
  const fx = (e.clientX - r.left) / r.width;
  const fy = (e.clientY - r.top) / r.height;
  const { lat, lon } = unproject(fx, fy);
  const probe = document.getElementById("probe")!;
  probe.textContent = `lat ${lat.toFixed(5)}  lon ${lon.toFixed(5)}   (fx ${fx.toFixed(3)}, fy ${fy.toFixed(3)})`;
});

// ---- rendering ----
function metricDomain(): [number, number] {
  if (metric.domain) return metric.domain;
  const vals = LOCATIONS.map((l) => aggregate(l.rows.map((r) => r[metric.key] ?? NaN), aggMode)).filter(Number.isFinite);
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  return [lo, hi === lo ? lo + 1 : hi];
}

function render() {
  const [lo, hi] = metricDomain();
  const range = hi - lo || 1;

  // markers
  overlay.innerHTML = "";
  for (const loc of LOCATIONS) {
    const value = aggregate(loc.rows.map((r) => r[metric.key] ?? NaN), aggMode);
    const bg = colorFor((value - lo) / range, metric.palette);
    const { fx, fy } = project(loc.lat, loc.lon);

    const el = document.createElement("div");
    el.className = "marker" + (selected?.id === loc.id ? " selected" : "");
    el.style.left = `${fx * 100}%`;
    el.style.top = `${fy * 100}%`;
    el.style.background = bg;
    el.style.color = inkFor(bg);
    el.textContent = Number.isFinite(value) ? value.toFixed(metric.decimals === 0 ? 0 : 1) : "?";
    el.title = `${loc.name}\n${loc.lat.toFixed(5)}, ${loc.lon.toFixed(5)}\n${metric.label}: ${value.toFixed(metric.decimals)}${metric.unit} (${aggMode})\nClick for full heat map`;

    const name = document.createElement("span");
    name.className = "marker-name";
    name.textContent = loc.name;
    el.appendChild(name);

    el.onclick = () => { selected = loc; render(); renderDetail(); };
    overlay.appendChild(el);
  }

  renderLegend(lo, hi);
}

function renderLegend(lo: number, hi: number) {
  const legend = document.getElementById("legend")!;
  const scaleNote = metric.domain ? "fixed scale" : `${aggMode} across locations`;
  legend.innerHTML = `
    <span class="title">${metric.label}${metric.unit ? ` (${metric.unit})` : ""}</span>
    <span class="lbl">${lo.toFixed(metric.decimals)}</span>
    <span class="bar" style="background:${gradientFor(metric.palette)}"></span>
    <span class="lbl">${hi.toFixed(metric.decimals)}</span>
    <span class="lbl">· ${scaleNote}</span>
  `;
}

function renderDetail() {
  const detail = document.getElementById("detail")!;
  if (!selected) return;
  detail.innerHTML = "";
  const head = document.createElement("div");
  head.className = "detail-head";
  head.innerHTML = `<h2>${selected.name}</h2><span class="detail-meta">${selected.lat.toFixed(5)}, ${selected.lon.toFixed(5)}</span>`;
  detail.appendChild(head);

  const grid = document.createElement("div");
  grid.className = "detail-grid";

  const hmCol = document.createElement("div");
  hmCol.className = "detail-col";
  hmCol.innerHTML = `<h3 class="col-title">Heat map</h3>`;
  hmCol.appendChild(renderHeatmap(selected));

  const lcCol = document.createElement("div");
  lcCol.className = "detail-col";
  lcCol.innerHTML = `<h3 class="col-title">Change over time</h3>`;
  lcCol.appendChild(renderLineChart(selected));

  grid.append(hmCol, lcCol);
  detail.appendChild(grid);
}
