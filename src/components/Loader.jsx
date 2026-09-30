"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// A full-screen preloader that covers the page until the heavy parts are truly
// ready — fonts loaded AND the 3D world has rendered its first frames — so the
// visitor never sees half-built geometry, a black canvas or a stuttering first
// scroll. The percentage is eased toward a cap (90%) while we wait, then runs to
// 100% the moment everything is ready. A hard timeout guarantees it can never
// trap someone on a slow device or a browser without WebGL.
const MAX_WAIT = 14; // seconds
const MIN_SHOW = 1.6; // seconds — long enough to read, short enough not to annoy

export default function Loader({ sceneReady, onDone }) {
  const rootRef = useRef(null);
  const [pct, setPct] = useState(0);
  const readyRef = useRef(sceneReady);
  readyRef.current = sceneReady;

  useEffect(() => {
    const s = { p: 0, fonts: false, start: performance.now(), prev: performance.now(), done: false, last: -1 };
    if (document.fonts?.ready) document.fonts.ready.then(() => { s.fonts = true; });
    else s.fonts = true;

    let raf;
    const exit = () => {
      const root = rootRef.current;
      const tl = gsap.timeline({ onComplete: onDone });
      tl.to(".ld-inner", { opacity: 0, y: -16, duration: 0.45, ease: "power2.in" })
        .to(root, { yPercent: -100, duration: 0.95, ease: "power4.inOut" }, "-=0.1");
    };

    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - s.prev) / 1000, 0.5); // frame-rate independent, even on a throttled tab
      s.prev = now;
      const t = (now - s.start) / 1000;
      const ready = (readyRef.current && s.fonts && t > MIN_SHOW) || t > MAX_WAIT;
      const cap = ready ? 100 : Math.min(90, 10 + t * 16);
      s.p += (cap - s.p) * (1 - Math.exp(-dt * (ready ? 9 : 3)));
      if (ready && s.p > 99.3) s.p = 100;
      const shown = Math.round(s.p);
      if (shown !== s.last) { s.last = shown; setPct(shown); }
      if (s.p >= 100 && !s.done) { s.done = true; exit(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="fixed inset-0 z-[400] flex flex-col bg-[#0b0714] text-[var(--ink)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 50% 42%, rgba(124,58,237,0.28), transparent 70%), radial-gradient(40% 35% at 20% 90%, rgba(183,148,246,0.12), transparent 70%)",
        }}
      />

      <div className="ld-inner relative flex-1 grid place-items-center px-6">
        <div className="text-center">
          {/* pulsing crystal mark */}
          <div className="relative mx-auto mb-8 h-16 w-16">
            <span className="absolute inset-0 rounded-full border border-[var(--signal)]/40 animate-ping" />
            <span className="absolute inset-2 rounded-full border border-[var(--signal)]/60" />
            <span className="absolute inset-0 grid place-items-center font-serif-display text-2xl text-[var(--ink)]">P/S</span>
          </div>
          <p className="font-serif-display text-[clamp(2rem,5vw,3.4rem)] leading-none">
            Pradeep <em className="pr-1">Kumar</em>
          </p>
          <p className="mt-5 font-mono text-[11px] md:text-[12px] uppercase tracking-[0.16em] leading-[1.8] text-dim">
            Full-stack &amp; Agentic AI developer
            <br />
            building worlds worth walking through
          </p>
        </div>
      </div>

      <div className="ld-inner relative px-[clamp(1.25rem,3vw,3rem)] pb-8">
        <div className="h-px w-full bg-white/10 overflow-hidden">
          <div className="h-full origin-left bg-[var(--signal)]" style={{ transform: `scaleX(${pct / 100})`, transition: "transform .2s linear" }} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-4 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.14em] text-faint">
          <span>Experience is loading</span>
          <span className="hidden sm:inline">Please wait</span>
          <span className="tabular-nums text-[var(--signal)]">{String(pct).padStart(3, "0")}%</span>
          <span className="hidden sm:inline">Out of 100%</span>
        </div>
      </div>
    </div>
  );
}
