// Cheap deterministic value-noise (no dependency) used to shape the
// procedural ground and to seed where trees land on it. Not real
// Perlin noise, but smooth and stable enough for gentle rolling hills.
function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function valueNoise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const h00 = hash2(xi, yi);
  const h10 = hash2(xi + 1, yi);
  const h01 = hash2(xi, yi + 1);
  const h11 = hash2(xi + 1, yi + 1);
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  return (h00 * (1 - u) + h10 * u) * (1 - v) + (h01 * (1 - u) + h11 * u) * v;
}

function fbm(x, y, octaves = 3) {
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(x * freq, y * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm; // 0..1
}

const BASE_Y = -2.6;
const AMPLITUDE = 0.9;

// World-space ground height at (x, z).
export function terrainHeight(x, z) {
  return BASE_Y + (fbm(x * 0.09, z * 0.09, 4) - 0.5) * AMPLITUDE * 2;
}

export { BASE_Y as TERRAIN_BASE_Y };
