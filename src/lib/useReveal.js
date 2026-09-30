"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initWordFades } from "@/lib/scrollText";

gsap.registerPlugin(ScrollTrigger);

// Fades + lifts every `.reveal` inside `ref` as it scrolls into view.
export function useReveal(ref, { start = "top 88%", y = 24 } = {}) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".reveal").forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start, once: true },
          opacity: 0,
          y,
          duration: 0.75,
          delay: (i % 5) * 0.04,
          ease: "power3.out",
        });
      });
      initWordFades(gsap, ScrollTrigger, ref.current);
    }, ref);
    return () => ctx.revert();
  }, [ref, start, y]);
}
