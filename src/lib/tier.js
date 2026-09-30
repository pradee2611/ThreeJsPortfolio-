// Device tier: the 3D world is built to a budget. Phones and low-memory devices get a
// lighter (but same-looking) world: fewer blades/trees/particles, lower pixel density,
// no MSAA, a coarser terrain mesh. Resolved once, client-side.
const TIERS = {
  high: {
    name: "high", carpet: 80000, tufts: 75000, forest: 200, trees: 64, fireflies: 110,
    leaves: 70, mist: 3, birds: 9, terrain: [150, 132], dpr: [1, 1.5], aa: true,
  },
  low: {
    name: "low", carpet: 26000, tufts: 20000, forest: 80, trees: 30, fireflies: 40,
    leaves: 24, mist: 2, birds: 5, terrain: [72, 62], dpr: [1, 1.25], aa: false,
  },
};

export function getTier() {
  if (typeof window === "undefined") return TIERS.high;
  const small = window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches;
  const lowMem = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
  const fewCores = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
  return small || lowMem || fewCores ? TIERS.low : TIERS.high;
}

export const isSmallScreen = () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
