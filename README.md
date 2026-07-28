# Campus Climate Map

Interactive TypeScript visualizer for the sensor CSVs. Each location (`data/*.csv`)
is placed on a campus map by its latitude/longitude and colored by a selected
metric — the same palette logic as the original `heatmaps.html`. Clicking a marker
opens that location's own detailed time-series heat map.

## Run

```bash
npm install
npm run dev
```

Then open the printed URL (default http://localhost:5173).

## Add the map image

Save your campus screenshot as **`public/map.png`**. Until you do, markers are
still placed by lat/lon over a placeholder background.

## Line up the markers (calibration)

The image is georeferenced by the lat/lon of its four edges, set in
[`src/geo.ts`](src/geo.ts) (`MAP_BOUNDS`). Current values are estimated from the
OpenStreetMap screenshot and may need a nudge for your exact crop:

1. Tick **"Calibrate map"** in the app.
2. Hover a known landmark (a labeled street corner) — the readout shows the
   lat/lon the app thinks is under the cursor.
3. Adjust `north` / `south` / `east` / `west` in `src/geo.ts` until the readout
   matches reality and the markers sit on the right spots.

## Where things live

- `data/*.csv` — one file per location (read at build time; edit and the map updates)
- `src/geo.ts` — lat/lon ↔ image position + `MAP_BOUNDS`
- `src/metrics.ts` — which metrics, palettes, and fixed/auto color scales
- `src/color.ts` — palette interpolation (from `heatmaps.html`)
- `src/heatmap.ts` — the per-location detail heat map
- `src/main.ts` — UI, markers, legend, controls
