// The story: you start deep inside a forest, walking a winding path
// toward a glow between the trees. The path opens onto a clearing with a
// floating crystal beacon, and beyond it a valley — two mountains, a rock
// cliff, a waterfall and the pond at its foot.
//
// The camera flies a Catmull-Rom spline through the waypoints below. Each
// waypoint names the page element it belongs to (`id`), and — for the tall
// pinned "scroll-through" sections — how far through that section's pinned
// range it lands (`frac`), so the scroll → camera mapping follows the real
// layout. `linear: true` means the segment *starting* at that waypoint moves
// at constant speed (walking / orbiting) instead of easing in and out.
//
// Ground sits at roughly y = -2.6 (see terrainHeight).

// The forest path meanders gently around x = 0.
export const pathX = (z) => 1.4 * Math.sin(z * 0.22);

const EYE = -1.9; // walking eye height

// Beacon (the floating crystal) and the orbit the camera makes around it.
export const BEACON = { x: 3.2, z: -2.0 };
const ORBIT_R = 4.2;
const orbitPos = (deg, y) => {
  const a = (deg * Math.PI) / 180;
  return [BEACON.x + ORBIT_R * Math.sin(a), y, BEACON.z + ORBIT_R * Math.cos(a)];
};
const ORBIT_LOOK = [BEACON.x, -1.5, BEACON.z];

export const WAYPOINTS = [
  // ── the forest walk (hero → vista) ────────────────────────────
  { id: "hero",  pos: [pathX(27), EYE, 27], look: [pathX(14), -1.5, 14], linear: true },
  { id: "vista", frac: 0.32, pos: [pathX(18), EYE, 18], look: [pathX(7), -1.45, 7], linear: true },
  { id: "vista", frac: 0.66, pos: [pathX(9), EYE, 9], look: [0, -1.1, -3], linear: true },
  { id: "vista", frac: 1,    pos: [0, -0.3, 2.2], look: [0, -0.2, -9.8] },            // clearing — falls dead ahead
  // ── the valley ────────────────────────────────────────────────
  { id: "about",      pos: [-4.6, -1.3, -3.4], look: [0, 0, -9] },               // left bank
  { id: "experience", pos: [5.6, -1.4, -5.4],  look: [0, 0.2, -9.2] },            // right bank
  // ── the orbit around the beacon (pinned interlude) ────────────
  { id: "orbit", frac: 0,    pos: orbitPos(100, -1.5), look: ORBIT_LOOK, linear: true },
  { id: "orbit", frac: 0.25, pos: orbitPos(170, -1.2), look: ORBIT_LOOK, linear: true },
  { id: "orbit", frac: 0.5,  pos: orbitPos(240, -1.0), look: ORBIT_LOOK, linear: true },
  { id: "orbit", frac: 0.75, pos: orbitPos(310, -1.3), look: ORBIT_LOOK, linear: true },
  { id: "orbit", frac: 1,    pos: orbitPos(380, -1.6), look: ORBIT_LOOK },
  // ── the rest of the journey ───────────────────────────────────
  { id: "work",         pos: [0.5, 0.8, 1.5],    look: [0, -0.6, -9.5] },         // raised overview
  { id: "recognitions", pos: [-2.6, -1.2, -5.8], look: [1, 0.6, -10] },           // close, side-on to the falls
  { id: "contact",      pos: [0, -1.6, -5.0],    look: [0, 0.6, -9.8] },          // standing at the pond's edge
];

export const POND_POSITION = [0, 0, -8.1];
export const POND_RADIUS = 2.7;

// Two flanking mountains + the cliff the water spills from.
export const MOUNTAINS = [
  { position: [-6.2, 0, -9.6],  radius: 3.9, height: 8.6, seed: 3 },
  { position: [6.6, 0, -10.4],  radius: 4.2, height: 9.4, seed: 8 },
];
export const CLIFF = { position: [0, 0, -11.6], size: [7.6, 5.8, 3.4] };
// z of the cliff's front face — the water hugs it.
export const CLIFF_FRONT_Z = CLIFF.position[2] + CLIFF.size[2] / 2;

// [x, y(unused, terrain-derived), z, facingY]
export const HOUSE_POSITION = [-8.5, 0, -3.8, 0.9];

// The forest occupies z > FOREST_START; the path winds through it.
export const FOREST = { zMin: 3, zMax: 36, halfWidth: 13 };

// Keep-clear zones for scattered props: [x, z, radius]
const PATH_CLEAR = [];
for (let z = FOREST.zMax - 2; z >= 1; z -= 1.8) PATH_CLEAR.push([pathX(z), z, 1.9]);

export const KEEP_CLEAR = [
  ...MOUNTAINS.map((m) => [m.position[0], m.position[2], m.radius + 1.2]),
  [CLIFF.position[0], CLIFF.position[2], 5.2],
  [POND_POSITION[0], POND_POSITION[2], POND_RADIUS + 1.8],
  [HOUSE_POSITION[0], HOUSE_POSITION[2], 2.2],
  [BEACON.x, BEACON.z, ORBIT_R + 1.6],   // the clearing the camera orbits in
  [0, 0, 3.6],                            // where the forest path opens out
  ...PATH_CLEAR,
];
