"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

// Pulls an element gently toward the cursor while hovered, and
// springs it back on leave. Strength scales the pull; radius padding
// around the element's own box is how far out it starts reacting.
export function useMagnetic({ strength = 0.35, radius = 24 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const moveX = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const moveY = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      moveX((e.clientX - cx) * strength);
      moveY((e.clientY - cy) * strength);
    };
    const onLeave = () => {
      moveX(0);
      moveY(0);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength, radius]);

  return ref;
}
