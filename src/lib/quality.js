// Shared, mutable render-quality dial (1 = full). AdaptiveQuality in
// BackgroundScene lowers it when the GPU can't keep up; heavy props read it
// each frame (e.g. how many grass blades to draw) without re-rendering React.
export const Q = { scale: 1 };
