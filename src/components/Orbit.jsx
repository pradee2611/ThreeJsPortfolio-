"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { addFadeBeats } from "@/lib/scrollText";
import { splitHighlight } from "@/lib/highlight";

gsap.registerPlugin(ScrollTrigger);

// An interlude: text hugs the edges while the camera (BackgroundScene →
// CameraRig) circles the glowing crystal in the clearing, so the whole
// world — forest, mountains, moon — appears to rotate around you.
const BEATS = [
  {
    side: "left",
    kicker: "Interlude — The signal",
    title: "*Where* craft meets intelligence.",
    body: "Two years of MERN and Next.js in production, now wired to LLMs.",
  },
  {
    side: "right",
    kicker: "What I build",
    title: "*Full-stack* foundations. Agentic future.",
    chips: ["RAG pipelines", "LLM-powered tools", "Multi-agent workflows", "MCP servers"],
  },
  {
    side: "left",
    kicker: "Proof",
    title: "*Certified* by Databricks & Anthropic.",
    body: "Data Engineer Associate, Generative AI Engineer Associate, and a run of Claude API, Claude Code and MCP courses.",
  },
];

export default function Orbit() {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const beats = gsap.utils.toArray(".orbit-beat");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
      addFadeBeats(gsap, tl, beats);
      gsap.fromTo(".orbit-dial", { rotate: 0 }, {
        rotate: 280, ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom bottom", scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="orbit" ref={ref} className="relative h-[320svh] md:h-[420vh]" aria-label="Scroll interlude">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(11,7,20,0.7) 0%, rgba(11,7,20,0) 34%, rgba(11,7,20,0) 66%, rgba(11,7,20,0.7) 100%)",
          }}
        />
        {/* phones: a soft floor so copy stays readable over bright grass */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] md:hidden bg-gradient-to-t from-[#0b0714]/85 via-[#0b0714]/45 to-transparent" />
        <div className="container relative h-full">
          {BEATS.map((b, i) => (
            <div
              key={i}
              data-side={b.side}
              className={`orbit-beat invisible absolute bottom-[14vh] max-w-[22rem] md:max-w-[27rem] ${
                b.side === "left" ? "left-[clamp(1.25rem,5vw,4rem)]" : "right-[clamp(1.25rem,5vw,4rem)] text-right"
              }`}
            >
              <p className="fb mb-4"><span className="tag-pill">{b.kicker}</span></p>
              <h2 aria-label={b.title.replace(/\*/g, "")} className="font-serif-display uppercase text-[clamp(2.2rem,4.6vw,4rem)] text-[var(--ink)] leading-[0.98]">
                <span aria-hidden="true" className="fw block">
                  {splitHighlight(b.title).map((c, k) => (c.strong ? <em key={k} className="normal-case pr-[0.15em]">{c.text}</em> : <span key={k}>{c.text}</span>))}
                </span>
              </h2>
              {b.body && <p className="fw mt-5 font-mono text-[11px] md:text-[12px] uppercase tracking-[0.14em] leading-[1.8] text-[var(--ink)]/80">{b.body}</p>}
              {b.chips && (
                <ul className={`fb mt-6 flex flex-wrap gap-2 ${b.side === "right" ? "justify-end" : ""}`}>
                  {b.chips.map((c) => (
                    <li key={c} className="rounded-full border border-white/20 bg-[#0b0714]/50 backdrop-blur px-3.5 py-1.5 text-[12px] text-[var(--ink)]">{c}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* compass dial: turns with the camera */}
          <div className="absolute left-1/2 top-[15vh] -translate-x-1/2 hidden md:flex flex-col items-center gap-3" aria-hidden="true">
            <span className="text-[10px] tracking-[0.35em] uppercase text-faint">Orbit</span>
            <div className="orbit-dial relative h-14 w-14 rounded-full border border-white/25">
              <span className="absolute left-1/2 top-[-3px] h-[6px] w-[6px] -translate-x-1/2 rounded-full bg-[var(--signal)] shadow-[0_0_10px_var(--signal)]" />
              <span className="absolute inset-3 rounded-full border border-dashed border-white/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
