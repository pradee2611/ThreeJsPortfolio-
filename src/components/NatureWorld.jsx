"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { terrainHeight } from "@/lib/terrainHeight";
import { Q } from "@/lib/quality";
import { WAYPOINTS, KEEP_CLEAR, pathX, POND_POSITION, POND_RADIUS } from "@/lib/journeyPath";

// ─────────────────────────────────────────────────────────────
// A small procedural landscape the camera flies over: rolling
// ground, a scattered autumn broadleaf forest (shedding leaves),
// one still pond with lily pads, and a loose flock of birds.
// Everything is generated geometry (no external models/textures),
// kept in the site's purple palette with warm autumn accents.
// ─────────────────────────────────────────────────────────────

export function Lighting() {
  return (
    <>
      <hemisphereLight args={["#d9c8ff", "#2a1d4a", 1.15]} />
      <directionalLight position={[3, 7, 12]} intensity={1.5} color="#f6eeff" />
      <directionalLight position={[-6, 5, -14]} intensity={0.9} color="#9b7cf0" />
      <ambientLight intensity={0.3} />
    </>
  );
}

export function Terrain({ segments = [150, 132] }) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(90, 80, segments[0], segments[1]);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const low = new THREE.Color("#2a1358");
    const high = new THREE.Color("#5a35a8");
    const violet = new THREE.Color("#7a4bd0");
    const tmp = new THREE.Color();
    const hash = (x, z) => {
      const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
      return s - Math.floor(s);
    };
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = terrainHeight(x, z);
      pos.setY(i, y);
      const n = THREE.MathUtils.clamp((y + 3.5) / 1.8, 0, 1);
      tmp.copy(low).lerp(high, n);
      // broad violet drifts + fine speckle so the soil never looks flat
      const patch = 0.5 + 0.5 * Math.sin(x * 0.17 + Math.sin(z * 0.13) * 2.0);
      tmp.lerp(violet, patch * 0.35);
      const speck = 0.88 + hash(x, z) * 0.24;
      colors[i * 3] = tmp.r * speck;
      colors[i * 3 + 1] = tmp.g * speck;
      colors[i * 3 + 2] = tmp.b * speck;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [segments]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} metalness={0} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
// Scene fog — shared so the custom grass/mist shaders can match it.
// ─────────────────────────────────────────────────────────────
export const FOG = { color: "#2b1d4c", near: 8, far: 38 };

// ─────────────────────────────────────────────────────────────
// GRASS: tens of thousands of tapered blades drawn in ONE instanced
// draw call. Wind, gusts and "the camera brushes past" bending all
// happen in the vertex shader, so the CPU cost per frame is ~zero.
// ─────────────────────────────────────────────────────────────
const GRASS_VERT = /* glsl */ `
  attribute vec3 aOffset;
  attribute vec4 aRand;
  uniform float uTime;
  uniform vec3 uCam;
  varying float vH;
  varying float vTint;
  varying float vPatch;
  varying float vDepth;

  void main() {
    float h = position.y;              // 0 at root .. 1 at tip
    float rot = aRand.x * 6.28318;
    vec3 p = position;
    p.x *= aRand.z * (1.0 - h * 0.9);  // taper toward the tip
    p.y *= aRand.y;
    p = vec3(cos(rot) * p.x, p.y, sin(rot) * p.x);

    vec3 w = aOffset + p;

    // layered wind + a slow travelling gust
    float bend = h * h;
    float gust = 0.55 + 0.45 * sin(uTime * 0.35 + aOffset.x * 0.12 + aOffset.z * 0.09);
    float wind = sin(uTime * 1.6 + aOffset.x * 0.55 + aOffset.z * 0.35) * 0.55
               + sin(uTime * 2.9 + aOffset.x * 1.3 - aOffset.z * 0.8) * 0.25;
    w.x += wind * 0.2 * gust * bend * aRand.y;
    w.z += wind * 0.09 * gust * bend * aRand.y;

    // each blade arches over along its own facing, like soft meadow grass
    vec2 face = vec2(-sin(rot), cos(rot));
    w.xz += face * bend * (0.16 + aRand.w * 0.22) * aRand.y;
    w.y  -= bend * 0.06 * aRand.y;

    // blades part and lean away as the camera walks through them
    vec2 d = w.xz - uCam.xz;
    float dist = length(d);
    float push = smoothstep(1.5, 0.0, dist) * bend;
    w.xz += (d / max(dist, 0.001)) * push * 0.4;
    w.y  -= push * 0.18 * aRand.y;

    vH = h;
    vTint = aRand.w;
    vPatch = 0.5 + 0.5 * sin(aOffset.x * 0.21 + sin(aOffset.z * 0.17) * 2.0);

    vec4 mv = viewMatrix * vec4(w, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const GRASS_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uRoot;
  uniform vec3 uTip;
  uniform vec3 uDry;
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vH;
  varying float vTint;
  varying float vPatch;
  varying float vDepth;

  void main() {
    vec3 col = mix(uRoot, uTip, pow(vH, 0.8));
    col = mix(col, uDry, vPatch * 0.4 * vH);                     // pinker, sun-kissed patches
    col *= 0.82 + 0.4 * vTint;                                   // gentle per-blade variation
    col *= mix(0.55, 1.0, smoothstep(0.0, 0.5, vH));             // soft (not harsh) shading at the roots
    col += vec3(0.32, 0.2, 0.5) * pow(vH, 2.0) * 0.35;          // glowing lavender tips
    float f = smoothstep(uFogNear, uFogFar, vDepth);
    col = mix(col, uFogColor, f);
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function bladeGeometry(rings = 5) {
  // `rings` rings of 2 vertices + a single tip vertex
  const verts = [];
  for (let i = 0; i < rings; i++) {
    const y = i / rings;
    verts.push(-0.5, y, 0, 0.5, y, 0);
  }
  verts.push(0, 1, 0);
  const idx = [];
  for (let i = 0; i < rings - 1; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    idx.push(a, b, c, b, d, c);
  }
  const top = (rings - 1) * 2;
  idx.push(top, top + 1, rings * 2);
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  g.setIndex(idx);
  return g;
}

export function Grass({ count = 90000, area = { x0: -13, x1: 13, z0: -7.5, z1: 31 }, avoid = [], rings = 5, clump = 0.3, heightMul = 1, seed: seed0 = 91, pathKeep = 0.4 }) {
  const mat = useRef(null);
  const geometry = useMemo(() => {
    const g = bladeGeometry(rings);
    const offsets = new Float32Array(count * 3);
    const rands = new Float32Array(count * 4);
    let seed = seed0;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    let n = 0;
    let guard = 0;
    while (n < count && guard < count * 4) {
      guard++;
      let x = area.x0 + rand() * (area.x1 - area.x0);
      let z = area.z0 + rand() * (area.z1 - area.z0);
      // pull blades toward a per-cell tuft centre so the lawn grows in clumps, not evenly
      const cell = 0.8;
      const cx = Math.floor(x / cell), cz = Math.floor(z / cell);
      const jx = Math.sin(cx * 12.9898 + cz * 78.233) * 43758.5453, jz = Math.sin(cx * 39.346 + cz * 11.135) * 24634.6345;
      const tx = (cx + 0.5 + ((jx - Math.floor(jx)) - 0.5) * 0.5) * cell;
      const tz = (cz + 0.5 + ((jz - Math.floor(jz)) - 0.5) * 0.5) * cell;
      x += (tx - x) * clump;
      z += (tz - z) * clump;
      // skip water, plinth, etc.
      if (avoid.some(([ax, az, ar]) => Math.hypot(ax - x, az - z) < ar)) continue;
      // thin out the worn footpath
      if (z > 1.5 && Math.abs(x - pathX(z)) < 0.9 && rand() < 1 - pathKeep) continue;
      offsets[n * 3] = x;
      offsets[n * 3 + 1] = terrainHeight(x, z) - 0.02;
      offsets[n * 3 + 2] = z;
      rands[n * 4] = rand();
      const dp = Math.hypot(x - POND_POSITION[0], z - POND_POSITION[2]);
      const nearPond = Math.min(1, Math.max(0.22, (dp - POND_RADIUS * 1.35) / 3.2));
      rands[n * 4 + 1] = nearPond * (0.2 + rand() * rand() * 0.5 + (rand() < 0.06 ? 0.22 : 0)) * heightMul;   // height, with a few tall stalks
      rands[n * 4 + 2] = 0.055 + rand() * 0.04;                                      // width
      rands[n * 4 + 3] = rand();
      n++;
    }
    g.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offsets.subarray(0, n * 3), 3));
    g.setAttribute("aRand", new THREE.InstancedBufferAttribute(rands.subarray(0, n * 4), 4));
    g.instanceCount = n;
    g.userData.total = n;
    return g;
  }, [count, area.x0, area.x1, area.z0, area.z1, avoid, rings, clump, heightMul, seed0, pathKeep]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCam: { value: new THREE.Vector3() },
      uRoot: { value: new THREE.Color("#3b1c78") },
      uTip: { value: new THREE.Color("#b58cf6") },
      uDry: { value: new THREE.Color("#f0a8e8") },
      uFogColor: { value: new THREE.Color(FOG.color) },
      uFogNear: { value: FOG.near },
      uFogFar: { value: FOG.far },
    }),
    []
  );

  useFrame((state) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    mat.current.uniforms.uCam.value.copy(state.camera.position);
    // blades are stored in random order, so drawing a prefix thins the lawn evenly
    const want = Math.max(1000, Math.floor(geometry.userData.total * Q.scale));
    if (geometry.instanceCount !== want) geometry.instanceCount = want;
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial ref={mat} vertexShader={GRASS_VERT} fragmentShader={GRASS_FRAG} uniforms={uniforms} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
// Ground mist: a few huge, low, drifting noise sheets. The camera
// walks through them, which is most of what makes the forest feel
// like air rather than empty space.
// ─────────────────────────────────────────────────────────────
const MIST_SHEET_VERT = /* glsl */ `
  varying vec2 vP;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vP = wp.xz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const MIST_SHEET_FRAG = /* glsl */ `
  precision mediump float;
  varying vec2 vP;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  void main() {
    vec2 q = vP * 0.11 + vec2(uTime * 0.02, uTime * 0.012);
    float n = noise(q) * 0.55 + noise(q * 2.3 + 7.0) * 0.3 + noise(q * 5.1 - 3.0) * 0.15;
    float a = smoothstep(0.38, 0.8, n) * uOpacity;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

export function GroundMist({ y = -2.2, size = 90, layers = 3 }) {
  const mats = useRef([]);
  useFrame((state) => {
    mats.current.forEach((m) => { if (m) m.uniforms.uTime.value = state.clock.elapsedTime; });
  });
  return (
    <group>
      {Array.from({ length: layers }).map((_, i) => (
        <mesh key={i} position={[i * 3.1, y + i * 0.45, -i * 2.7]} rotation={[-Math.PI / 2, 0, i * 0.7]} renderOrder={2}>
          <planeGeometry args={[size, size]} />
          <shaderMaterial
            ref={(m) => (mats.current[i] = m)}
            vertexShader={MIST_SHEET_VERT}
            fragmentShader={MIST_SHEET_FRAG}
            uniforms={{ uTime: { value: i * 40 }, uOpacity: { value: 0.2 - i * 0.04 }, uColor: { value: new THREE.Color("#b9a4f0") } }}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// Deterministic scatter, kept clear of a radius around every camera
// waypoint so the flight path stays unobstructed.
function scatterPoints(count, bounds, clearRadius, seedStart = 1) {
  const points = [];
  let seed = seedStart;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const exclusions = [...WAYPOINTS.map((w) => w.pos)];
  let guard = 0;
  while (points.length < count && guard < count * 12) {
    guard++;
    const x = (rand() - 0.5) * bounds.w;
    const z = (rand() - 0.5) * bounds.d + bounds.zOffset;
    const clear =
      exclusions.every((p) => Math.hypot(p[0] - x, p[2] - z) > clearRadius) &&
      KEEP_CLEAR.every(([cx, cz, cr]) => Math.hypot(cx - x, cz - z) > cr);
    if (clear) points.push({ x, z, r: rand() });
  }
  return points;
}

// Per-tree data used both to place the trunk once and to re-sway the
// canopy every frame — layered-sine wind riding on a slow traveling
// gust (sampled from each tree's x/z position), the same shape real
// wind-noise-texture techniques produce without needing a texture.
//
// Broadleaf autumn silhouette: two overlapping lumpy canopy blobs per
// tree instead of pine cones — rounder, and it reads correctly with
// FallingLeaves, which pines wouldn't.
export function Trees({ count = 64, bounds = { w: 32, d: 34, zOffset: -5 }, seed = 7, tall = 1, clearRadius = 2.9 }) {
  const trunkRef = useRef(null);
  const canopyRef = useRef(null);
  const lobeRef = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const trees = useMemo(() => {
    // Wide enough (x) and deep enough (z) to cover the whole camera
    // corridor from Hero through Contact, including the Work waypoint,
    // which previously sat past the scatter's z range and came up bare.
    const pts = scatterPoints(count, bounds, clearRadius, seed);
    const canopy = new THREE.Color("#6f52bf"); // violet
    const autumn = new THREE.Color("#c9709a"); // dusty rose/magenta
    return pts.map((tr) => ({
      ...tr,
      y: terrainHeight(tr.x, tr.z),
      scale: (0.8 + tr.r * 0.85) * tall,
      rotY: tr.r * Math.PI * 2,
      phase: tr.r * 62.8,
      windAmp: 0.045 + tr.r * 0.045,
      lobeOffset: [(tr.r - 0.5) * 0.55, ((tr.r * 7) % 1) * 0.2, ((tr.r * 13) % 1 - 0.5) * 0.5],
      color: canopy.clone().lerp(autumn, (tr.r * 5) % 1),
    }));
  }, [count, bounds, seed, tall, clearRadius]);

  useEffect(() => {
    if (!trunkRef.current || !canopyRef.current || !lobeRef.current) return;
    trees.forEach((tr, i) => {
      dummy.position.set(tr.x, tr.y + 0.45 * tr.scale, tr.z);
      dummy.rotation.set(0, tr.rotY, 0);
      dummy.scale.set(tr.scale * 0.85, tr.scale * 1.1, tr.scale * 0.85);
      dummy.updateMatrix();
      trunkRef.current.setMatrixAt(i, dummy.matrix);

      // Place the canopy/lobe here too (sway = 0) so they're correctly
      // positioned from the first frame — the wind useFrame below only
      // re-poses them once already visible, it must never be what puts
      // them there in the first place.
      dummy.position.set(tr.x, tr.y + 1.55 * tr.scale, tr.z);
      dummy.rotation.set(0, tr.rotY, 0);
      dummy.scale.setScalar(tr.scale);
      dummy.updateMatrix();
      canopyRef.current.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tr.x + tr.lobeOffset[0], tr.y + (1.55 + tr.lobeOffset[1]) * tr.scale, tr.z + tr.lobeOffset[2]);
      dummy.rotation.set(0, tr.rotY + 0.6, 0);
      dummy.scale.setScalar(tr.scale * 0.62);
      dummy.updateMatrix();
      lobeRef.current.setMatrixAt(i, dummy.matrix);

      canopyRef.current.setColorAt(i, tr.color);
      lobeRef.current.setColorAt(i, tr.color.clone().lerp(new THREE.Color("#f0c9e0"), 0.25));
    });
    trunkRef.current.instanceMatrix.needsUpdate = true;
    canopyRef.current.instanceMatrix.needsUpdate = true;
    lobeRef.current.instanceMatrix.needsUpdate = true;
    if (canopyRef.current.instanceColor) canopyRef.current.instanceColor.needsUpdate = true;
    if (lobeRef.current.instanceColor) lobeRef.current.instanceColor.needsUpdate = true;
  }, [trees, dummy]);

  const skip = useRef(0);
  useFrame((state) => {
    if (!canopyRef.current || !lobeRef.current) return;
    // Wind sway is slow — updating every other frame is indistinguishable
    // and halves the per-frame instance-matrix cost.
    skip.current = (skip.current + 1) % 3;
    if (skip.current !== 0) return;
    const cam = state.camera.position;
    const t = state.clock.elapsedTime;
    trees.forEach((tr, i) => {
      const dx = tr.x - cam.x, dz = tr.z - cam.z;
      if (dx * dx + dz * dz > 1600) return; // too far to see the sway — keep last pose
      // A gust band traveling across the forest along +x, modulating
      // how hard each tree sways depending on where it sits in the
      // wave right now — so the whole forest ripples rather than each
      // tree swaying independently and uniformly.
      const gust = 0.55 + 0.45 * Math.sin(tr.x * 0.35 + tr.z * 0.18 - t * 0.7);
      const sway =
        (Math.sin(t * 0.9 + tr.phase) * tr.windAmp + Math.sin(t * 2.3 + tr.phase * 1.7) * tr.windAmp * 0.35) * gust;

      dummy.position.set(tr.x, tr.y + 1.55 * tr.scale, tr.z);
      dummy.rotation.set(sway * 0.6, tr.rotY, sway);
      dummy.scale.setScalar(tr.scale);
      dummy.updateMatrix();
      canopyRef.current.setMatrixAt(i, dummy.matrix);

      dummy.position.set(
        tr.x + tr.lobeOffset[0] + sway * 0.3,
        tr.y + (1.55 + tr.lobeOffset[1]) * tr.scale,
        tr.z + tr.lobeOffset[2]
      );
      dummy.rotation.set(sway * 0.9, tr.rotY + 0.6, sway * 1.3);
      dummy.scale.setScalar(tr.scale * 0.62);
      dummy.updateMatrix();
      lobeRef.current.setMatrixAt(i, dummy.matrix);
    });
    canopyRef.current.instanceMatrix.needsUpdate = true;
    lobeRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[null, null, trees.length]}>
        <cylinderGeometry args={[0.05, 0.1, 0.9, 5]} />
        <meshStandardMaterial color="#2c2140" roughness={0.9} />
      </instancedMesh>
      {/* two overlapping lumpy blobs per tree = a rounder, fuller broadleaf canopy */}
      <instancedMesh ref={canopyRef} args={[null, null, trees.length]}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={lobeRef} args={[null, null, trees.length]}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial roughness={0.75} />
      </instancedMesh>
    </group>
  );
}

const LEAF_COLORS = ["#c9709a", "#e0b3d0", "#8f5fd6", "#f0c9e0"];

// Autumn leaves shedding from the canopy — each one drifts down with
// its own fall speed, a side-to-side sway, and a tumble, looping back
// to a fresh height above the trees once it reaches the ground.
export function FallingLeaves({ count = 70 }) {
  const ref = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const leaves = useMemo(() => {
    const pts = scatterPoints(count, { w: 32, d: 34, zOffset: -5 }, 2.2, 13);
    return pts.map((p) => {
      const topY = terrainHeight(p.x, p.z) + 2.1 + p.r * 1.4;
      return {
        x: p.x,
        z: p.z,
        y: topY - p.r * 3.6, // stagger start heights so falls aren't in sync
        topY,
        speed: 0.22 + p.r * 0.32,
        swayFreq: 0.55 + p.r * 1.1,
        swayAmp: 0.22 + p.r * 0.32,
        spinSpeed: (p.r - 0.5) * 3,
        scale: 0.045 + p.r * 0.03,
        phase: p.r * 30,
        color: new THREE.Color(LEAF_COLORS[Math.floor(p.r * 4) % 4]),
      };
    });
  }, [count]);

  useEffect(() => {
    if (!ref.current) return;
    leaves.forEach((l, i) => ref.current.setColorAt(i, l.color));
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [leaves]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    leaves.forEach((l, i) => {
      l.y -= l.speed * delta;
      if (l.y < terrainHeight(l.x, l.z)) l.y = l.topY;

      const sx = l.x + Math.sin(t * l.swayFreq + l.phase) * l.swayAmp;
      const sz = l.z + Math.cos(t * l.swayFreq * 0.8 + l.phase) * l.swayAmp * 0.6;
      dummy.position.set(sx, l.y, sz);
      dummy.rotation.set(t * l.spinSpeed * 0.6, t * l.spinSpeed, t * l.spinSpeed * 0.4 + l.phase);
      dummy.scale.setScalar(l.scale);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[null, null, leaves.length]}>
      <planeGeometry args={[1, 0.7]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </instancedMesh>
  );
}


// Fireflies drifting between the forest trees — slow lissajous wander,
// each one blinking on its own phase. Soft additive glow, no textures.
const FLY_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uScale;
  varying float vA;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.35 + aSeed * 40.0) * 0.9;
    p.y += sin(uTime * 0.5 + aSeed * 23.0) * 0.35;
    p.z += cos(uTime * 0.3 + aSeed * 31.0) * 0.9;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float blink = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * (0.8 + aSeed) + aSeed * 60.0), 3.0);
    gl_PointSize = (0.16 + aSeed * 0.12) * uScale / -mv.z;
    vA = blink;
    gl_Position = projectionMatrix * mv;
  }
`;
const FLY_FRAG = /* glsl */ `
  precision mediump float;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a = a * a * vA;
    gl_FragColor = vec4(mix(vec3(0.75, 0.6, 1.0), vec3(1.0, 0.9, 0.7), step(0.75, vA)) * a, a);
  }
`;

export function Fireflies({ count = 110, area = { x: 9, zMin: 3, zMax: 32 } }) {
  const mat = useRef(null);
  const { positions, seeds } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const z = area.zMin + Math.random() * (area.zMax - area.zMin);
      p[i * 3] = (Math.random() - 0.5) * 2 * area.x;
      p[i * 3 + 1] = -2.5 + 0.3 + Math.random() * 1.9;
      p[i * 3 + 2] = z;
      s[i] = Math.random();
    }
    return { positions: p, seeds: s };
  }, [count, area.x, area.zMin, area.zMax]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uScale: { value: 600 } }), []);
  useFrame((state) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    mat.current.uniforms.uScale.value = state.size.height * state.viewport.dpr * 1.2;
  });
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={FLY_VERT}
        fragmentShader={FLY_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// A floating crystal on a stone plinth, ringed by counter-rotating
// bands and a swarm of orbiting motes. The camera circles it during
// the "orbit" interlude, so the whole world appears to rotate around it.
function useGlowTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(200,170,255,0.9)");
    grad.addColorStop(0.35, "rgba(140,100,240,0.35)");
    grad.addColorStop(1, "rgba(120,80,230,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

export function Beacon({ position }) {
  const ground = terrainHeight(position[0], position[2]);
  const crystal = useRef(null);
  const ringA = useRef(null);
  const ringB = useRef(null);
  const motes = useRef(null);
  const glow = useGlowTexture();

  const moteData = useMemo(() => {
    const n = 70;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.3 + Math.random() * 1.1;
      p[i * 3] = Math.cos(a) * r;
      p[i * 3 + 1] = (Math.random() - 0.5) * 1.8;
      p[i * 3 + 2] = Math.sin(a) * r;
    }
    return p;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (crystal.current) {
      crystal.current.rotation.y += delta * 0.6;
      crystal.current.position.y = 1.75 + Math.sin(t * 0.9) * 0.12;
    }
    if (ringA.current) { ringA.current.rotation.z += delta * 0.5; ringA.current.rotation.x += delta * 0.2; }
    if (ringB.current) { ringB.current.rotation.y -= delta * 0.7; ringB.current.rotation.z -= delta * 0.25; }
    if (motes.current) motes.current.rotation.y += delta * 0.25;
  });

  return (
    <group position={[position[0], ground, position[2]]} scale={0.6}>
      {/* stone plinth */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[1.0, 1.2, 0.3, 8]} />
        <meshStandardMaterial color="#4a3c7c" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.7, 0.85, 0.16, 8]} />
        <meshStandardMaterial color="#6a58a8" roughness={0.9} flatShading />
      </mesh>

      <group ref={crystal} position={[0, 1.75, 0]}>
        <mesh scale={[0.62, 1.05, 0.62]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#b79bff" emissive="#7c3aed" emissiveIntensity={1.4} roughness={0.15} metalness={0.4} flatShading />
        </mesh>
        <mesh scale={[0.3, 0.55, 0.3]} rotation={[0, Math.PI / 4, 0]}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#efe6ff" />
        </mesh>
      </group>

      <group position={[0, 1.75, 0]}>
        <mesh ref={ringA}>
          <torusGeometry args={[1.05, 0.02, 8, 64]} />
          <meshBasicMaterial color="#cdb8fb" />
        </mesh>
        <mesh ref={ringB} rotation={[1.1, 0.4, 0]}>
          <torusGeometry args={[1.45, 0.015, 8, 64]} />
          <meshBasicMaterial color="#8f6fe0" />
        </mesh>
        <points ref={motes}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[moteData, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#e6d9ff" size={0.05} transparent opacity={0.9} depthWrite={false} sizeAttenuation blending={THREE.AdditiveBlending} />
        </points>
        {glow && (
          <sprite scale={[5, 5, 1]}>
            <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.75} />
          </sprite>
        )}
        <pointLight color="#a78bfa" intensity={9} distance={9} decay={1.6} />
      </group>
    </group>
  );
}

const POND_VERT = /* glsl */ `
  varying vec2 vC;
  uniform float uR;
  void main() {
    // ShapeGeometry UVs are raw shape coords, so derive our own -1..1 local space
    vC = position.xy / uR;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const POND_FRAG = /* glsl */ `
  precision mediump float;
  varying vec2 vC;
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uSky;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    float d = length(vC);

    // slow drifting surface
    float drift = noise(vC * 6.0 + vec2(uTime * 0.12, -uTime * 0.09));
    float drift2 = noise(vC * 14.0 - vec2(uTime * 0.2, uTime * 0.05));

    // where the waterfall lands (back of the pond = +y in shape space)
    vec2 imp = vec2(0.0, 0.46);
    float di = length(vC - imp);
    float rings = sin(di * 30.0 - uTime * 3.0) * 0.5 + 0.5;
    rings *= smoothstep(1.15, 0.05, di);
    float foam = smoothstep(0.42, 0.0, di) * (0.5 + 0.5 * noise(vC * 26.0 + uTime * 0.9));

    // gentle far ripples
    float far = sin(d * 20.0 - uTime * 0.9) * 0.5 + 0.5;
    far *= smoothstep(0.85, 0.2, d) * 0.5;

    vec3 base = mix(uShallow, uDeep, smoothstep(0.05, 0.85, d));
    // rim picks up sky colour like a real reflective edge
    float rim = smoothstep(0.45, 0.85, d);
    vec3 color = mix(base, uSky, rim * 0.55);
    color += (drift * 0.1 + drift2 * 0.06) * uSky;
    color += (rings * 0.2 + far * 0.1) * uShallow;

    // moonlit sheen: a rippling bright band across the surface
    float band = smoothstep(0.32, 0.0, abs(vC.x - 0.28 + (drift - 0.5) * 0.18));
    band *= 0.55 + 0.45 * noise(vec2(vC.y * 9.0, uTime * 0.6));
    color += band * vec3(0.55, 0.45, 0.85) * 0.55;

    // twinkling glints
    float glint = step(0.987, noise(vC * 70.0 + floor(uTime * 3.0)));
    color += glint * vec3(1.0, 0.95, 1.0) * 0.9;

    color = mix(color, vec3(0.95, 0.92, 1.0), foam * 0.75);
    gl_FragColor = vec4(color, 1.0);
  }
`;

// An organic outline (sum of a few sine harmonics around the rim)
// instead of a perfect circle — reads as a real pond, not a coaster.
function pondGeometry(radius = 1.7, segments = 40) {
  const shape = new THREE.Shape();
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const rr = 1 + 0.12 * Math.sin(a * 3 + 1.3) + 0.08 * Math.sin(a * 5 + 0.4) + 0.05 * Math.sin(a * 7 + 2.1);
    const x = Math.cos(a) * radius * rr;
    const y = Math.sin(a) * radius * rr;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return new THREE.ShapeGeometry(shape, segments);
}

function LilyPad({ x, z, scale = 1, rotation = 0 }) {
  return (
    <group position={[x, 0.015, z]} rotation={[-Math.PI / 2, 0, rotation]} scale={scale}>
      <mesh>
        <circleGeometry args={[0.16, 10, 0.4, Math.PI * 1.7]} />
        <meshStandardMaterial color="#3c2f68" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.001]} scale={0.4}>
        <circleGeometry args={[0.16, 8]} />
        <meshStandardMaterial color="#d9a7e0" roughness={0.6} />
      </mesh>
    </group>
  );
}

// A cluster of low, irregular rocks sitting right at the waterline —
// this is what actually sells a pond as a dip in real ground rather
// than a disc laid on top of the terrain.
function ShoreRock({ x, z, scale = 1, rotation = 0 }) {
  return (
    <mesh position={[x, 0.05 * scale, z]} rotation={[0.3, rotation, 0.15]} scale={[scale * 1.3, scale * 0.7, scale]}>
      <icosahedronGeometry args={[0.22, 0]} />
      <meshStandardMaterial color="#2e2348" roughness={0.95} flatShading />
    </mesh>
  );
}

export function Pond({ position, radius = 2 }) {
  const mat = useRef(null);
  const y = terrainHeight(position[0], position[2]) + 0.07;
  const geometry = useMemo(() => pondGeometry(radius), [radius]);
  const bankGeometry = useMemo(() => pondGeometry(radius * 1.2), [radius]);
  const pads = useMemo(
    () => [
      { x: -1.05, z: 0.55, scale: 1, rotation: 0.4 },
      { x: -0.7, z: -0.85, scale: 0.75, rotation: 2.1 },
      { x: 0.95, z: 0.35, scale: 0.85, rotation: 4.0 },
    ],
    []
  );
  const rocks = useMemo(
    () => [
      { x: -1.9, z: 0.2, scale: 1, rotation: 0.6 },
      { x: -1.6, z: 1.0, scale: 0.7, rotation: 2.4 },
      { x: 0.3, z: -1.75, scale: 0.9, rotation: 1.1 },
      { x: 1.5, z: -0.9, scale: 0.65, rotation: 3.6 },
      { x: 1.85, z: 0.7, scale: 0.8, rotation: 4.8 },
      { x: -0.4, z: 1.85, scale: 0.6, rotation: 0.2 },
    ],
    []
  );

  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group position={[position[0], y, position[2]]}>
      {/* lighter wet-sand bank so the shoreline reads clearly against the grass */}
      <mesh geometry={bankGeometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.035, 0]}>
        <meshStandardMaterial color="#6f5cb0" roughness={1} />
      </mesh>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <shaderMaterial
          ref={mat}
          vertexShader={POND_VERT}
          fragmentShader={POND_FRAG}
          uniforms={{
            uTime: { value: 0 },
            uR: { value: radius * 1.25 },
            uDeep: { value: new THREE.Color("#34237a") },
            uShallow: { value: new THREE.Color("#8d6df0") },
            uSky: { value: new THREE.Color("#d9c9ff") },
          }}
        />
      </mesh>
      <group scale={radius / 1.7}>
        {rocks.map((r, i) => <ShoreRock key={i} {...r} />)}
        {pads.map((p, i) => <LilyPad key={i} {...p} />)}
      </group>
    </group>
  );
}

// A two-joint wing — a "shoulder" segment and a "tip" segment nested
// inside it — instead of one rigid cone. Flapping the tip more than
// the shoulder (the shoulder drives, the tip trails and bends further)
// is the same idea the three.js GPGPU birds example rigs its flap
// with, without needing that example's GPU compute-shader pipeline,
// which only pays for itself at flock sizes in the thousands — ours
// is 9 birds animated on the CPU, so a compute pass would be pure
// overhead here, not a feature.
function useWingGeometry() {
  return useMemo(() => {
    const shoulder = new THREE.Shape();
    shoulder.moveTo(0, 0);
    shoulder.lineTo(0.15, -0.018);
    shoulder.lineTo(0.14, 0.045);
    shoulder.lineTo(0.02, 0.035);
    shoulder.closePath();

    const tip = new THREE.Shape();
    tip.moveTo(0, 0);
    tip.lineTo(0.16, 0.008);
    tip.lineTo(0.11, 0.055);
    tip.lineTo(0, 0.03);
    tip.closePath();

    return { shoulder: new THREE.ShapeGeometry(shoulder), tip: new THREE.ShapeGeometry(tip) };
  }, []);
}

function Wing({ mirror, geo, shoulderRef, tipRef }) {
  return (
    <group scale={[mirror ? -1 : 1, 1, 1]}>
      <group ref={shoulderRef}>
        <mesh geometry={geo.shoulder}>
          <meshBasicMaterial color="#efe6fb" side={THREE.DoubleSide} />
        </mesh>
        <group ref={tipRef} position={[0.14, 0.01, 0]}>
          <mesh geometry={geo.tip}>
            <meshBasicMaterial color="#d8c8f2" side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function BirdMesh({ setRef, phase }) {
  const geo = useWingGeometry();
  const shoulderL = useRef(null);
  const tipL = useRef(null);
  const shoulderR = useRef(null);
  const tipR = useRef(null);

  useFrame((state) => {
    const flap = Math.sin(state.clock.elapsedTime * 11 + phase * 4);
    const shoulderAngle = 0.25 + flap * 0.45;
    const tipAngle = flap * 0.85;
    if (shoulderL.current) shoulderL.current.rotation.z = shoulderAngle;
    if (tipL.current) tipL.current.rotation.z = tipAngle;
    if (shoulderR.current) shoulderR.current.rotation.z = shoulderAngle;
    if (tipR.current) tipR.current.rotation.z = tipAngle;
  });

  return (
    <group ref={setRef}>
      {/* body + head, so it reads as a bird rather than a pair of wings */}
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1.7]}>
        <sphereGeometry args={[0.028, 8, 6]} />
        <meshBasicMaterial color="#2a1f42" />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <sphereGeometry args={[0.017, 6, 6]} />
        <meshBasicMaterial color="#2a1f42" />
      </mesh>
      {/* tail fan */}
      <mesh position={[0, 0, -0.09]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.022, 0.09, 4]} />
        <meshBasicMaterial color="#2a1f42" />
      </mesh>
      <Wing mirror={false} geo={geo} shoulderRef={shoulderL} tipRef={tipL} />
      <Wing mirror geo={geo} shoulderRef={shoulderR} tipRef={tipR} />
    </group>
  );
}

// A real boids flock — separation, alignment, cohesion, and a soft
// pull back toward a home volume — instead of birds tracing fixed
// circles. O(n²) neighbour checks are trivial at this flock size.
const HOME = new THREE.Vector3(0, 2.1, -2);
const HOME_RADIUS = 7;
const PERCEPTION = 2.4;
const SEPARATION = 0.9;
const MAX_SPEED = 1.7;
const MIN_SPEED = 0.55;
const MAX_FORCE = 0.05;

export function Birds({ count = 9 }) {
  const refs = useRef([]);
  const boids = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return {
          pos: new THREE.Vector3(Math.cos(a) * 4, HOME.y + (Math.random() - 0.5) * 1.4, HOME.z + Math.sin(a) * 3.5),
          vel: new THREE.Vector3(Math.cos(a + 1.4), 0, Math.sin(a + 1.4)).multiplyScalar(1.1),
          phase: Math.random() * Math.PI * 2,
        };
      }),
    [count]
  );
  const tmp = useMemo(
    () => ({ sep: new THREE.Vector3(), ali: new THREE.Vector3(), coh: new THREE.Vector3(), diff: new THREE.Vector3(), steer: new THREE.Vector3(), toHome: new THREE.Vector3() }),
    []
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    for (let i = 0; i < boids.length; i++) {
      const b = boids[i];
      tmp.sep.set(0, 0, 0);
      tmp.ali.set(0, 0, 0);
      tmp.coh.set(0, 0, 0);
      let sepN = 0, aliN = 0, cohN = 0;

      for (let j = 0; j < boids.length; j++) {
        if (i === j) continue;
        const other = boids[j];
        const d = b.pos.distanceTo(other.pos);
        if (d < PERCEPTION) {
          tmp.ali.add(other.vel);
          tmp.coh.add(other.pos);
          aliN++; cohN++;
        }
        if (d < SEPARATION && d > 0.0001) {
          tmp.diff.subVectors(b.pos, other.pos).divideScalar(d);
          tmp.sep.add(tmp.diff);
          sepN++;
        }
      }

      const accel = tmp.steer.set(0, 0, 0);
      if (sepN > 0) accel.add(tmp.sep.divideScalar(sepN).setLength(MAX_SPEED).sub(b.vel).clampLength(0, MAX_FORCE * 1.8));
      if (aliN > 0) accel.add(tmp.ali.divideScalar(aliN).setLength(MAX_SPEED).sub(b.vel).clampLength(0, MAX_FORCE));
      if (cohN > 0) {
        tmp.coh.divideScalar(cohN).sub(b.pos);
        accel.add(tmp.coh.setLength(MAX_SPEED).sub(b.vel).clampLength(0, MAX_FORCE));
      }
      tmp.toHome.subVectors(HOME, b.pos);
      const distHome = tmp.toHome.length();
      if (distHome > HOME_RADIUS) {
        accel.add(tmp.toHome.setLength(MAX_SPEED).sub(b.vel).clampLength(0, MAX_FORCE * 2.5));
      }

      b.vel.addScaledVector(accel, dt * 60);
      b.vel.clampLength(MIN_SPEED, MAX_SPEED);
      b.pos.addScaledVector(b.vel, dt);

      const g = refs.current[i];
      if (g) {
        g.position.copy(b.pos);
        g.rotation.y = Math.atan2(b.vel.x, b.vel.z);
        g.rotation.z = THREE.MathUtils.clamp(-accel.x * 5, -0.5, 0.5);
      }
    }
  });

  return (
    <group>
      {boids.map((b, i) => (
        <BirdMesh key={i} phase={b.phase} setRef={(el) => { refs.current[i] = el; }} />
      ))}
    </group>
  );
}

// A soft glowing moon, always visible above the horizon — placed far
// enough out that it reads as sky, not scenery, and exempted from fog
// so it never dims into the haze.
export function Moon({ position = [9, 8, -16], radius = 1.3 }) {
  return (
    <group position={position}>
      <mesh fog={false}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial color="#f3ecff" />
      </mesh>
      <mesh fog={false}>
        <sphereGeometry args={[radius * 1.6, 16, 16]} />
        <meshBasicMaterial color="#cdb8fb" transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh fog={false}>
        <sphereGeometry args={[radius * 2.6, 16, 16]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.06} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

// A jagged rock peak — the same noise-and-vertex-color technique as
// Terrain, but a displaced cone instead of a plane. The waterfall
// leans against its face and a carved notch marks where the water
// actually exits the rock, so the fall reads as coming from the
// mountain instead of hanging in mid-air.
function mountainGeometry(radius, height, radialSegments = 9, heightSegments = 7, seed = 3) {
  const geo = new THREE.ConeGeometry(radius, height, radialSegments, heightSegments, true);
  const pos = geo.attributes.position;
  const hash = (x, y) => {
    const s = Math.sin(x * 91.3 + y * 47.1 + seed * 12.9) * 43758.5453;
    return s - Math.floor(s);
  };
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const angle = Math.atan2(z, x);
    const heightFrac = THREE.MathUtils.clamp(y / height + 0.5, 0, 1);
    const jag =
      (hash(Math.round(angle * 3), Math.round(heightFrac * 6)) - 0.5) * radius * 0.5 * (1 - heightFrac * 0.55);
    const nx = x + Math.cos(angle) * jag;
    const nz = z + Math.sin(angle) * jag;
    pos.setX(i, nx);
    pos.setZ(i, nz);
  }
  const colors = new Float32Array(pos.count * 3);
  const rock = new THREE.Color("#33285a");
  const stone = new THREE.Color("#6a56a6");
  const peak = new THREE.Color("#d2c6f2");
  for (let i = 0; i < pos.count; i++) {
    const heightFrac = THREE.MathUtils.clamp(pos.getY(i) / height + 0.5, 0, 1);
    const c = heightFrac < 0.6 ? rock.clone().lerp(stone, heightFrac / 0.6) : stone.clone().lerp(peak, (heightFrac - 0.6) / 0.4);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

export function Mountain({ position, radius = 2.5, height = 6.4, seed = 3 }) {
  const geometry = useMemo(() => mountainGeometry(radius, height, 9, 7, seed), [radius, height, seed]);
  const y = terrainHeight(position[0], position[2]) + height / 2 - 0.6;
  return (
    <mesh geometry={geometry} position={[position[0], y, position[2]]}>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0.05} flatShading />
    </mesh>
  );
}

const FALL_VERT = /* glsl */ `
  varying vec2 vUv;
  uniform float uTopScale;
  uniform float uBottomScale;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.x *= mix(uBottomScale, uTopScale, uv.y);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const FALL_FRAG = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uSeed;
  uniform float uGain;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    float x = vUv.x + uSeed;
    float y = vUv.y;
    float t = uTime * uSpeed;

    // long vertical strands: noise stretched along y, scrolling downward at several speeds
    float n1 = noise(vec2(x * 7.0,  y * 1.6 + t * 1.3));
    float n2 = noise(vec2(x * 16.0, y * 3.4 + t * 2.4));
    float n3 = noise(vec2(x * 34.0, y * 7.5 + t * 3.9));
    float n4 = noise(vec2(x * 70.0, y * 14.0 + t * 6.0));
    float streak = n1 * 0.38 + n2 * 0.3 + n3 * 0.22 + n4 * 0.1;
    float bright = smoothstep(0.34, 0.8, streak);
    float sparkle = smoothstep(0.78, 0.98, n3 * n4 * 1.9);

    // accelerating flow: water thins and stretches as it falls
    float speedFade = mix(0.85, 1.0, 1.0 - y);

    // ragged, breathing edges
    float wob = (noise(vec2(y * 5.0 - t * 0.5, 3.0 + uSeed)) - 0.5) * 0.16;
    float edge = smoothstep(0.0, 0.22, vUv.x + wob) * smoothstep(1.0, 0.78, vUv.x + wob);
    // hot translucent core, soft rim
    float core = smoothstep(0.5, 0.0, abs(vUv.x - 0.5 + wob * 0.6));
    float lip = smoothstep(1.0, 0.95, y) * smoothstep(0.0, 0.03, y);

    // foam churning where the water meets the pool
    float foam = smoothstep(0.3, 0.0, y) * (0.55 + 0.45 * n2);
    // bright crest just below the spill point
    float crest = smoothstep(0.86, 0.96, y) * smoothstep(1.0, 0.96, y) * 0.8;

    vec3 deep = vec3(0.34, 0.24, 0.72);
    vec3 lit = vec3(0.9, 0.84, 1.0);
    vec3 body = mix(deep, lit, bright * 0.85 + core * 0.35);
    vec3 col = mix(body, vec3(1.0), clamp(foam + sparkle * 0.7 + crest, 0.0, 1.0));
    float a = (0.3 + bright * 0.55 + core * 0.3 + foam * 0.6 + sparkle * 0.5) * edge * lip * speedFade * uGain;
    gl_FragColor = vec4(col * a, a);
  }
`;

const MIST_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uScale;
  uniform float uSize;
  varying float vA;
  void main() {
    float t = fract(uTime * 0.22 + aSeed);
    vec3 p = position;
    p.y += t * 1.5;
    p.x += (aSeed - 0.5) * t * 2.2;
    p.z += (fract(aSeed * 7.13) - 0.25) * t * 1.8;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.5 + t * 1.7) * uScale / -mv.z;
    vA = (1.0 - t) * smoothstep(0.0, 0.12, t);
    gl_Position = projectionMatrix * mv;
  }
`;
const MIST_FRAG = /* glsl */ `
  precision mediump float;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vA * 0.5;
    gl_FragColor = vec4(vec3(0.93, 0.88, 1.0) * a, a);
  }
`;

// One sheet of falling water — a shader plane that tapers to a
// narrower crest and fans wider at the base.
function FallSheet({ x, z, top, bottom, width, speed = 1, seed = 0, topScale = 0.75, bottomScale = 1.3, gain = 1 }) {
  const mat = useRef(null);
  const height = top - bottom;
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uSeed: { value: seed },
      uGain: { value: gain },
      uTopScale: { value: topScale },
      uBottomScale: { value: bottomScale },
    }),
    [speed, seed, topScale, bottomScale, gain]
  );
  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return (
    <mesh position={[x, (top + bottom) / 2, z]}>
      <planeGeometry args={[width, height, 1, 1]} />
      <shaderMaterial
        ref={mat}
        vertexShader={FALL_VERT}
        fragmentShader={FALL_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Soft rising spray at the base of the falls.
function SplashMist({ x, y, z, spread = 1.6, count = 70, size = 0.55 }) {
  const mat = useRef(null);
  const { positions, seeds } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3] = x + (Math.random() - 0.5) * spread;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = z + Math.random() * 0.5;
      s[i] = Math.random();
    }
    return { positions: p, seeds: s };
  }, [x, y, z, spread, count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uScale: { value: 600 }, uSize: { value: size } }), [size]);
  useFrame((state) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    mat.current.uniforms.uScale.value = state.size.height * state.viewport.dpr * 1.2;
  });
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={MIST_VERT}
        fragmentShader={MIST_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// A craggy rock wall spanning the gap between the two mountains: heavy
// jitter, terraced ledges, horizontal strata bands, dark cracks and
// depth-based shading so the face reads as real rock, not a gradient.
// Its top edge is where the waterfall starts.
function cliffGeometry([w, h, d]) {
  const geo = new THREE.BoxGeometry(w, h, d, 22, 14, 5);
  const pos = geo.attributes.position;
  const hash = (a, b, c) => {
    const s = Math.sin(a * 91.3 + b * 47.1 + c * 23.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const shade = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const edgeX = Math.abs(x) > w / 2 - 0.01;
    const edgeY = y > h / 2 - 0.01;
    const front = z > d / 2 - 0.01;
    const j = (k, s = 3) => hash(Math.round(x * s), Math.round(y * s), Math.round(z * s) + k) - 0.5;
    const yn = (y + h / 2) / h;
    // terraces: alternate bands push out / recede, so the face steps like layered stone
    const band = Math.floor(yn * 7);
    const terrace = front ? (band % 2 ? 0.16 : -0.1) : 0;
    // a gorge carved down the middle where the water runs
    const gorge = front ? -0.28 * Math.exp(-(x * x) / 1.6) : 0;
    const crest = edgeY ? j(4) * 0.7 * (0.4 + Math.abs(x) / (w / 2)) : 0;
    const taper = 1 - Math.max(0, yn - 0.55) * 0.34; // narrower toward the crest
    pos.setX(i, x * taper + (edgeX ? j(1) * 0.5 : j(1) * 0.22));
    pos.setY(i, y + j(2) * 0.24 + crest);
    pos.setZ(i, z + j(3) * 0.32 + terrace + gorge);
    // vertical cracks & pockets of shadow
    const crack = Math.abs(Math.sin(x * 2.6 + j(5, 2) * 6)) < 0.08 ? 0.55 : 1;
    shade[i] = crack * (0.78 + hash(Math.round(x * 4), Math.round(y * 4), 9) * 0.34);
  }
  const colors = new Float32Array(pos.count * 3);
  const dark = new THREE.Color("#3a2d68");
  const mid = new THREE.Color("#6c59b0");
  const top = new THREE.Color("#a996dd");
  const moss = new THREE.Color("#4d3f8a");
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i), z = pos.getZ(i), x = pos.getX(i);
    const f = THREE.MathUtils.clamp(y / h + 0.5, 0, 1);
    tmp.copy(f < 0.72 ? dark.clone().lerp(mid, f / 0.72) : mid.clone().lerp(top, (f - 0.72) / 0.28));
    // horizontal strata
    const strata = 0.85 + 0.15 * Math.sin(y * 6.5 + Math.sin(x * 1.3) * 1.5);
    // wet, darker stone flanking the water
    const wet = Math.exp(-(x * x) / 2.6) * 0.32;
    const ao = THREE.MathUtils.clamp(0.72 + (z - (-d / 2)) / d * 0.4, 0.6, 1.1); // recessed = darker
    tmp.multiplyScalar(strata * shade[i] * ao * (1 - wet));
    // faint mossy tint on mid-height ledges
    tmp.lerp(moss, f > 0.35 && f < 0.7 ? 0.12 : 0);
    colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

export function Cliff({ position, size }) {
  const geometry = useMemo(() => cliffGeometry(size), [size]);
  const y = terrainHeight(position[0], position[2]) + size[1] / 2 - 0.5;
  return (
    <mesh geometry={geometry} position={[position[0], y, position[2]]}>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0.05} flatShading />
    </mesh>
  );
}

// The waterfall: a broad main sheet with a hot core, a dark wet recess
// behind it, two thin side trickles, mid-fall turbulence, a big rolling
// plume where it lands, boulders and foam at the base, a glow that lights
// the surrounding rock, and droplets in front for close-up parallax.
// x/z is the centre of the main fall; it runs from `top` to `bottom`.
function useSoftShadow() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(64, 64, 8, 64, 64, 64);
    grad.addColorStop(0, "rgba(15,8,36,0.75)");
    grad.addColorStop(0.55, "rgba(15,8,36,0.4)");
    grad.addColorStop(1, "rgba(15,8,36,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

export function Waterfall({ x = 0, z, top, bottom, width = 2.3 }) {
  const height = top - bottom;
  const dropRef = useRef(null);
  const glow = useGlowTexture();
  const shadow = useSoftShadow();
  const droplets = useMemo(() => {
    const n = 110;
    const positions = new Float32Array(n * 3);
    const speeds = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      positions[i * 3] = x + (Math.random() - 0.5) * width * 1.15;
      positions[i * 3 + 1] = bottom + Math.random() * height;
      positions[i * 3 + 2] = z + 0.14 + Math.random() * 0.22;
      speeds[i] = 2.2 + Math.random() * 1.8;
    }
    return { positions, speeds };
  }, [x, z, bottom, height, width]);

  const boulders = useMemo(() => {
    const out = [];
    for (let i = 0; i < 9; i++) {
      const side = i % 2 ? 1 : -1;
      out.push({
        x: x + side * (width * 0.55 + 0.25 + (i % 4) * 0.42) + Math.sin(i * 12.3) * 0.2,
        z: z + 0.35 + ((i * 37) % 10) / 10 * 0.9,
        s: 0.3 + ((i * 53) % 10) / 10 * 0.42,
        r: i * 1.3,
      });
    }
    return out;
  }, [x, z, width]);

  useFrame((state, delta) => {
    if (!dropRef.current) return;
    const arr = dropRef.current.geometry.attributes.position.array;
    for (let i = 0; i < droplets.speeds.length; i++) {
      arr[i * 3 + 1] -= delta * droplets.speeds[i];
      if (arr[i * 3 + 1] < bottom) arr[i * 3 + 1] = top - Math.random() * 0.3;
    }
    dropRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const mid = bottom + height * 0.5;
  return (
    <group>
      {/* dark, wet recess the water runs down — gives the sheet something to read against */}
      <mesh position={[x, (top + bottom) / 2, z - 0.2]}>
        <planeGeometry args={[width * 2.2, height * 1.05]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>

      <FallSheet x={x} z={z} top={top} bottom={bottom} width={width} speed={1} gain={1.05} topScale={0.7} bottomScale={1.35} />
      {/* narrower, faster, brighter core in front */}
      <FallSheet x={x} z={z + 0.05} top={top} bottom={bottom} width={width * 0.5} speed={1.5} seed={5.3} gain={0.9} topScale={0.8} bottomScale={1.15} />
      <FallSheet x={x - width * 0.98} z={z + 0.02} top={top - height * 0.3} bottom={bottom} width={width * 0.2} speed={1.25} seed={3.1} topScale={0.9} bottomScale={1.2} gain={1.1} />
      <FallSheet x={x + width * 1.06} z={z + 0.02} top={top - height * 0.2} bottom={bottom} width={width * 0.24} speed={0.9} seed={7.7} topScale={0.9} bottomScale={1.2} gain={1.1} />

      {/* turbulence part-way down, then the big plume at the base */}
      <SplashMist x={x} y={mid + height * 0.12} z={z + 0.12} spread={width * 0.7} count={28} size={0.32} />
      <SplashMist x={x} y={bottom + 0.05} z={z + 0.1} spread={width * 1.5} count={150} size={0.85} />
      <SplashMist x={x} y={bottom + 0.02} z={z + 0.35} spread={width * 2.2} count={70} size={0.5} />

      {/* light the falls throw onto the rock, and the hot spot where they land */}
      {glow && (
        <>
          <sprite position={[x, mid + height * 0.1, z - 0.15]} scale={[width * 3.4, height * 1.05, 1]}>
            <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.32} color="#a68cff" />
          </sprite>
          <sprite position={[x, bottom + 0.35, z + 0.4]} scale={[width * 3.2, 1.9, 1]}>
            <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.7} color="#e6dcff" />
          </sprite>
        </>
      )}
      <pointLight position={[x, bottom + 0.8, z + 1.2]} color="#b9a4ff" intensity={5} distance={7} decay={1.6} />

      {/* boulders and foam-flecked rocks at the foot */}
      {boulders.map((b, i) => (
        <mesh key={i} position={[b.x, bottom + b.s * 0.25, b.z]} rotation={[0.3 * i, b.r, 0.2]} scale={[b.s * 1.3, b.s * 0.85, b.s]}>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#3b2f6e" roughness={0.9} flatShading />
        </mesh>
      ))}

      <points ref={dropRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[droplets.positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#ffffff" size={0.045} transparent opacity={0.9} depthWrite={false} sizeAttenuation />
      </points>
    </group>
  );
}

// A small cabin landmark — a warm, lived-in beat amid the purple
// world, placed near the last waypoint so arriving feels like arriving.
export function House({ position }) {
  const y = terrainHeight(position[0], position[2]);
  return (
    <group position={[position[0], y, position[2]]} rotation={[0, position[3] ?? 0, 0]}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.5, 1.1, 1.2]} />
        <meshStandardMaterial color="#2c2245" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.35, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.15, 0.85, 4]} />
        <meshStandardMaterial color="#4a3570" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.4, 0.61]} fog={false}>
        <planeGeometry args={[0.32, 0.42]} />
        <meshBasicMaterial color="#ffd9a0" />
      </mesh>
      <mesh position={[-0.45, 0.65, 0.61]} fog={false}>
        <planeGeometry args={[0.22, 0.22]} />
        <meshBasicMaterial color="#ffe6bf" />
      </mesh>
    </group>
  );
}
