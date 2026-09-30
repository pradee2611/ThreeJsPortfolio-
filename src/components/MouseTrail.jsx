"use client";
import { useEffect, useRef } from "react";

// A trail of small violet sparks that follows the cursor — the
// "mouse magic" layer. Pure 2D canvas, independent of the 3D scene,
// desktop-only, and cheap (a few dozen particles at most).
const COLORS = ["#cdb8fb", "#b794f6", "#7c3aed", "#efe6fb"];

export default function MouseTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let raf = 0;
    let last = { x: -100, y: -100 };

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e) => {
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      const moved = Math.hypot(dx, dy);
      last = { x: e.clientX, y: e.clientY };
      if (moved < 3) return;
      const n = moved > 40 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.3 - Math.random() * 0.4,
          size: 1.5 + Math.random() * 2.2,
          life: 1,
          decay: 0.018 + Math.random() * 0.014,
          color: COLORS[(Math.random() * COLORS.length) | 0],
        });
      }
      if (particles.length > 160) particles = particles.slice(-160);
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter((p) => p.life > 0);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        const r = Math.max(p.size * p.life, 0);
        ctx.beginPath();
        ctx.globalAlpha = Math.max(p.life, 0) * 0.85;
        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[150] pointer-events-none" aria-hidden="true" />;
}
