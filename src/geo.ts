// Georeferencing: convert (lat, lon) -> fractional position (0..1) inside the
// map image, and back. The area is tiny (~3 km) so a linear projection between
// the image's geographic bounds is accurate to a few metres.
//
// ┌──────────────── ADJUST THESE IF MARKERS DON'T LINE UP ─────────────────┐
// │ These are the lat/lon of the four EDGES of your map.png screenshot.     │
// │ Turn on "Calibrate" in the app: hover the map to read the lat/lon under │
// │ the cursor, compare against a known street, and tweak until it matches. │
// └────────────────────────────────────────────────────────────────────────┘

export interface Bounds {
  north: number; // lat at the TOP edge of the image
  south: number; // lat at the BOTTOM edge
  west: number; // lon at the LEFT edge
  east: number; // lon at the RIGHT edge
}

// Top-left corner = (43.484012, -80.567613); bottom-right = (43.461940, -80.529452).
export const MAP_BOUNDS: Bounds = {
  north: 43.484012, // top-left latitude
  south: 43.461940, // bottom-right latitude
  west: -80.567613, // top-left longitude
  east: -80.529452, // bottom-right longitude
};

export interface Frac {
  fx: number; // 0 = left edge, 1 = right edge
  fy: number; // 0 = top edge, 1 = bottom edge
}

/** (lat, lon) -> fractional position within the image. */
export function project(lat: number, lon: number, b: Bounds = MAP_BOUNDS): Frac {
  return {
    fx: (lon - b.west) / (b.east - b.west),
    fy: (b.north - lat) / (b.north - b.south),
  };
}

/** Fractional position within the image -> (lat, lon). Used for calibration. */
export function unproject(fx: number, fy: number, b: Bounds = MAP_BOUNDS): { lat: number; lon: number } {
  return {
    lat: b.north - fy * (b.north - b.south),
    lon: b.west + fx * (b.east - b.west),
  };
}
