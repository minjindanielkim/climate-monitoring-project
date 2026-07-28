// Loads the sensor CSVs (data/*.csv) at build time and groups them by location.
// Each file is one physical location with a fixed lat/lon and a time series.

export interface Reading {
  seq: number;
  elapsed_min: number;
  [metric: string]: number;
}

export interface Location {
  id: number;
  name: string;
  lat: number;
  lon: number;
  rows: Reading[];
}

// Friendly names matching the original heatmaps.html datasets, keyed by file id.
const NAMES: Record<number, string> = {
  1: "parking1",
  2: "hill1",
  3: "cif1",
  4: "discgolf",
  5: "e5parking",
};

// Vite raw-imports every CSV in ../data so the app stays driven by the files.
const files = import.meta.glob("../data/*.csv", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseCsv(text: string): { header: string[]; rows: string[][] } {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",").map((s) => s.trim());
  const rows = lines
    .slice(1)
    .map((l) => l.split(","))
    // drop blank / incomplete trailing rows (e.g. 4.csv ends with ",,,,")
    .filter((v) => v.length >= header.length && v[1]?.trim() !== "" && v[2]?.trim() !== "");
  return { header, rows };
}

function loadLocation(path: string, text: string): Location {
  const { header, rows } = parseCsv(text);
  const idx = (name: string) => header.indexOf(name);
  const latI = idx("latitude");
  const lonI = idx("longitude");

  const readings: Reading[] = rows.map((v) => {
    const r: Reading = { seq: 0, elapsed_min: 0 };
    header.forEach((col, i) => {
      if (col === "latitude" || col === "longitude") return;
      const num = parseFloat(v[i]);
      r[col] = Number.isNaN(num) ? 0 : num;
    });
    return r;
  });

  const id = parseInt(path.match(/(\d+)\.csv$/)?.[1] ?? "0", 10);
  return {
    id,
    name: NAMES[id] ?? `Location ${id}`,
    lat: parseFloat(rows[0][latI]),
    lon: parseFloat(rows[0][lonI]),
    rows: readings,
  };
}

export const LOCATIONS: Location[] = Object.entries(files)
  .map(([path, text]) => loadLocation(path, text))
  .sort((a, b) => a.id - b.id);
