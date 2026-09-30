"use client";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WAYPOINTS, pathX, POND_POSITION, POND_RADIUS, HOUSE_POSITION, MOUNTAINS, CLIFF, CLIFF_FRONT_Z, BEACON, FOREST } from "@/lib/journeyPath";
import { terrainHeight } from "@/lib/terrainHeight";
import { Q } from "@/lib/quality";
import { getTier } from "@/lib/tier";
import { Lighting, Terrain, Trees, Pond, Birds, Moon, Waterfall, House, FallingLeaves, Mountain, Cliff, Fireflies, Beacon, Grass, GroundMist, FOG } from "./NatureWorld";

// ─────────────────────────────────────────────────────────────
// A single continuous 3D world behind the whole page: rolling
// purple land, a scattered forest, a still pond, and a loose
// flock of birds (see NatureWorld.jsx), with the camera flying a
// spline through it from Hero → About → Work → Contact as you
// scroll. No external models/textures — every shape is procedural.
// ─────────────────────────────────────────────────────────────

// Vertical purple gradient used as the scene background — a cheap
// "sky" (a single texture, not geometry) that fog blends into at
// the horizon, echoing a lavender-to-ink dusk sky.
function useSkyTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 4;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#241636");
    grad.addColorStop(0.42, "#6b46be");
    grad.addColorStop(0.72, "#3a2566");
    grad.addColorStop(1, "#0b0714");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 4, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

function SkyBackground() {
  const { scene } = useThree();
  const tex = useSkyTexture();
  useEffect(() => {
    scene.background = tex;
    return () => { scene.background = null; };
  }, [scene, tex]);
  return null;
}

function buildStarfield(count = 500, radius = 26) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * (0.4 + Math.random() * 0.6);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi) - 6;
  }
  return positions;
}

function Starfield() {
  const positions = useMemo(() => buildStarfield(), []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#d8caf7" size={0.045} transparent opacity={0.4} depthWrite={false} sizeAttenuation />
    </points>
  );
}

// Maps the page's scroll position onto the camera spline. Each
// waypoint is pinned to a real section (see journeyPath): pinned
// scroll-through sections (vista, orbit) place several waypoints along
// their pinned range via `frac`; other sections use their centre.
// Anchors are re-measured periodically because accordions, fonts and
// images all change section heights after first paint.
function measureAnchors() {
  const vh = window.innerHeight;
  const maxY = Math.max(1, document.documentElement.scrollHeight - vh);
  const ys = WAYPOINTS.map((w) => {
    const el = document.getElementById(w.id);
    if (!el) return null;
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (w.id === "hero") return 0;
    if (w.frac !== undefined) return top + (el.offsetHeight - vh) * w.frac;
    return top + el.offsetHeight / 2 - vh / 2;
  });
  let prev = -1;
  return ys.map((y) => {
    const v = THREE.MathUtils.clamp(y ?? (prev + 1), 0, maxY);
    prev = Math.max(v, prev + 1);
    return prev;
  });
}

const smooth = (t) => t * t * (3 - 2 * t);

function CameraRig() {
  const { camera, size } = useThree();
  // portrait screens need a wider lens to keep the falls and path in frame
  useEffect(() => {
    camera.fov = size.width / size.height < 0.8 ? 64 : 45;
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  const curvePos = useMemo(
    () => new THREE.CatmullRomCurve3(WAYPOINTS.map((w) => new THREE.Vector3(...w.pos)), false, "catmullrom", 0.4),
    []
  );
  const curveLook = useMemo(
    () => new THREE.CatmullRomCurve3(WAYPOINTS.map((w) => new THREE.Vector3(...w.look)), false, "catmullrom", 0.4),
    []
  );
  const anchors = useRef(null);
  const lastMeasure = useRef(0);
  const dirty = useRef(true);

  useEffect(() => {
    let lastW = window.innerWidth;
    const mark = () => { dirty.current = true; };
    const onResize = () => { if (window.innerWidth !== lastW) { lastW = window.innerWidth; mark(); } }; // ignore URL-bar height jitter on phones
    window.addEventListener("resize", onResize);
    window.addEventListener("load", mark);
    const ro = new ResizeObserver(mark);
    ro.observe(document.body);
    ScrollTrigger.addEventListener("refresh", mark);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", mark);
      ro.disconnect();
      ScrollTrigger.removeEventListener("refresh", mark);
    };
  }, []);
  const u = useRef(0); // smoothed position along the spline, in waypoint-index units
  const parallax = useRef({ x: 0, y: 0 });
  const look = useRef(new THREE.Vector3(...WAYPOINTS[0].look));
  const last = WAYPOINTS.length - 1;
  const walkEnd = WAYPOINTS.findIndex((w) => w.id === "vista" && w.frac === 1); // index where the forest walk ends

  useFrame((state, delta) => {
    const now = state.clock.elapsedTime;
    // Re-measure only when the layout actually changed (resize / ScrollTrigger refresh /
    // accordions), plus a slow safety net — never every frame, never on the hot path.
    if (!anchors.current || dirty.current || now - lastMeasure.current > 4) {
      anchors.current = measureAnchors();
      lastMeasure.current = now;
      dirty.current = false;
    }
    const a = anchors.current;
    const sy = window.scrollY;
    let target = last;
    if (sy <= a[0]) target = 0;
    else {
      for (let i = 0; i < last; i++) {
        if (sy < a[i + 1]) {
          const f = THREE.MathUtils.clamp((sy - a[i]) / (a[i + 1] - a[i]), 0, 1);
          target = i + (WAYPOINTS[i].linear ? f : smooth(f));
          break;
        }
      }
    }
    const dt = Math.min(delta, 0.05); // never let a hitch (or a hidden tab) teleport the camera
    u.current = THREE.MathUtils.damp(u.current, target, 3.6, dt);

    parallax.current.x = THREE.MathUtils.damp(parallax.current.x, state.pointer.x, 3, dt);
    parallax.current.y = THREE.MathUtils.damp(parallax.current.y, state.pointer.y, 3, dt);

    const t = THREE.MathUtils.clamp(u.current / last, 0, 1);
    const pos = curvePos.getPoint(t);
    const lookAt = curveLook.getPoint(t);

    // Walking through the forest: a soft head-bob and sway that fades out as you reach the clearing.
    const walk = THREE.MathUtils.clamp(1 - (u.current - (walkEnd - 1)) / 1, 0, 1);
    const stride = sy * 0.018;
    const bobY = Math.sin(stride) * 0.035 * walk;
    const bobX = Math.sin(stride * 0.5) * 0.05 * walk;

    camera.position.set(pos.x + bobX + parallax.current.x * 0.35, pos.y + bobY + parallax.current.y * 0.22, pos.z);
    look.current.set(
      THREE.MathUtils.damp(look.current.x, lookAt.x, 7, dt),
      THREE.MathUtils.damp(look.current.y, lookAt.y, 7, dt),
      THREE.MathUtils.damp(look.current.z, lookAt.z, 7, dt)
    );
    camera.lookAt(look.current);
  });

  return null;
}


// If the GPU can't hold ~45fps, quietly render at a lower resolution.
// Steps down quickly, steps back up only after a long stable stretch.
function AdaptiveQuality() {
  const setDpr = useThree((s) => s.setDpr);
  const acc = useRef({ t: 0, frames: 0, level: 1, good: 0 });
  useFrame((_, delta) => {
    const a = acc.current;
    a.t += delta;
    a.frames++;
    if (a.t < 1.5) return;
    const fps = a.frames / a.t;
    a.t = 0; a.frames = 0;
    if (delta > 0.25) return; // ignore tab-switch stalls
    if (fps < 42 && a.level > 0.6) {
      a.level = Math.max(0.6, a.level - 0.2);
      Q.scale = Math.max(0.45, Q.scale - 0.2);
      a.good = 0;
      setDpr(Math.min(window.devicePixelRatio, 1.5) * a.level);
    } else if (fps > 57 && a.level < 1) {
      if (++a.good >= 6) { a.level = Math.min(1, a.level + 0.2); Q.scale = Math.min(1, Q.scale + 0.2); a.good = 0; setDpr(Math.min(window.devicePixelRatio, 1.5) * a.level); }
    } else a.good = 0;
  });
  return null;
}

// Grass is kept off the pond, the cliff and the beacon's plinth.
const GRASS_AVOID = [
  [POND_POSITION[0], POND_POSITION[2], POND_RADIUS * 1.35],
  [BEACON.x, BEACON.z, 0.8],
];

// Ground heights the water/rock props hang off.
const pondGround = terrainHeight(POND_POSITION[0], POND_POSITION[2]);
const cliffGround = terrainHeight(CLIFF.position[0], CLIFF.position[2]);
const CLIFF_TOP = cliffGround + CLIFF.size[1] - 0.5 - 0.15; // notch sits just under the crest
const FALL_BOTTOM = pondGround + 0.1;

// Dense, tall trees on both sides of the forest path (the path itself is kept clear).
const FOREST_BOUNDS = { w: FOREST.halfWidth * 2, d: FOREST.zMax - FOREST.zMin, zOffset: (FOREST.zMax + FOREST.zMin) / 2 };

// Tells the page when the world has actually been drawn a few times — shaders
// compiled, geometry uploaded — so the loader can lift onto a finished scene.
function ReadySignal({ onReady }) {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current === -1) return;
    if (++frames.current >= 10) { frames.current = -1; onReady?.(); }
  });
  return null;
}

export default function BackgroundScene({ onReady }) {
  const tier = useMemo(() => getTier(), []);
  useEffect(() => { if (tier.name === "low") Q.scale = 0.8; }, [tier]);
  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={tier.dpr}
        gl={{ antialias: tier.aa, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: WAYPOINTS[0].pos, fov: 45, far: 70 }}
      >
        <fog attach="fog" args={[FOG.color, FOG.near, FOG.far]} />
        <SkyBackground />
        <Lighting />
        <CameraRig />
        <ReadySignal onReady={onReady} />
        <AdaptiveQuality />
        <Starfield />
        <Moon />
        <Terrain segments={tier.terrain} />
        {MOUNTAINS.map((m) => <Mountain key={m.seed} position={m.position} radius={m.radius} height={m.height} seed={m.seed} />)}
        <Cliff position={CLIFF.position} size={CLIFF.size} />
        {/* dense short carpet fills every gap; taller tufts stand out of it */}
        <Grass avoid={GRASS_AVOID} count={tier.carpet} rings={3} clump={0} heightMul={0.6} seed={7} pathKeep={0.55} />
        <Grass avoid={GRASS_AVOID} count={tier.tufts} heightMul={tier.name === "low" ? 0.7 : 1} clump={0.3} seed={91} pathKeep={0.4} />
        <Trees count={tier.trees} />
        <Trees count={tier.forest} bounds={FOREST_BOUNDS} seed={21} tall={1.7} clearRadius={2.4} />
        <Fireflies count={tier.fireflies} />
        <GroundMist layers={tier.mist} />
        <FallingLeaves count={tier.leaves} />
        <Beacon position={[BEACON.x, 0, BEACON.z]} />
        <Pond position={POND_POSITION} radius={POND_RADIUS} />
        <Waterfall x={0} z={CLIFF_FRONT_Z + 0.35} top={CLIFF_TOP} bottom={FALL_BOTTOM} width={2.3} />
        <House position={HOUSE_POSITION} />
        <Birds count={tier.birds} />
      </Canvas>
    </div>
  );
}
