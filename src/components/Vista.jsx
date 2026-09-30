"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { addFadeBeats } from "@/lib/scrollText";
import { splitHighlight } from "@/lib/highlight";

gsap.registerPlugin(ScrollTrigger);

// The opening of the story: a walk through the forest. A deliberately empty stretch of page: the copy hugs the edges and the
// centre is left clear so the 3D valley is the star. While it's pinned the
// camera (see BackgroundScene → CameraRig) walks the forest path and
// emerges into the clearing, with the waterfall dead ahead.
const BEATS = [
  {
    side: "left",
    kicker: "Chapter I — The path",
    title: "*Every* product starts with a single step.",
    body: "An idea, a rough sketch, a one-line prompt.",
  },
  {
    side: "right",
    kicker: "Chapter II — Deeper in",
    title: "*Then* it gains weight.",
    stats: [
      { to: 2, suffix: "+", label: "years shipping production code" },
      { to: 10, suffix: "+", label: "real-world platforms delivered" },
      { to: 500, suffix: "+", label: "REST API endpoints built" },
      { to: 600, suffix: "", label: "concurrent users supported" },
    ],
  },
  {
    side: "left",
    kicker: "Chapter III — The clearing",
    title: "*…and* opens onto something real.",
    body: "From MERN platforms to RAG pipelines and multi-agent workflows.",
  },
];

export default function Vista() {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const beats = gsap.utils.toArray(".vista-beat");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });

      // Each beat gets an equal slice: slide in + decode, hold, dissolve out.
      addFadeBeats(gsap, tl, beats);
      const slice = 1 / beats.length;

      // Count-up tied to the middle beat.
      const nums = gsap.utils.toArray(".vista-num");
      const counters = nums.map((n) => ({ el: n, to: Number(n.dataset.to), suffix: n.dataset.suffix || "", v: 0 }));
      const obj = { p: 0 };
      tl.fromTo(
        obj,
        { p: 0 },
        {
          p: 1,
          duration: slice * 0.3,
          onUpdate: () => counters.forEach((c) => { c.el.textContent = Math.round(c.to * obj.p) + c.suffix; }),
        },
        slice + slice * 0.06
      );

      // The scroll cue and depth meter.
      gsap.fromTo(".vista-meter-fill", { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom bottom", scrub: true },
      });
      gsap.to(".vista-cue", {
        autoAlpha: 0, ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: "+=220", scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="vista" ref={ref} className="relative h-[340svh] md:h-[460vh]" aria-label="Scroll journey">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* soft edge shading so text on the sides reads against the bright valley, centre stays open */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(11,7,20,0.72) 0%, rgba(11,7,20,0.0) 34%, rgba(11,7,20,0.0) 66%, rgba(11,7,20,0.72) 100%)",
          }}
        />

        {/* phones: a soft floor so copy stays readable over bright grass */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] md:hidden bg-gradient-to-t from-[#0b0714]/85 via-[#0b0714]/45 to-transparent" />
        <div className="container relative h-full">
          {BEATS.map((b, i) => (
            <div
              key={i}
              data-side={b.side}
              className={`vista-beat invisible absolute bottom-[14vh] max-w-[22rem] md:max-w-[26rem] ${
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
              {b.stats && (
                <dl className="fb mt-6 grid grid-cols-2 gap-x-8 gap-y-5">
                  {b.stats.map((s) => (
                    <div key={s.label}>
                      <dt className="text-[clamp(2rem,4vw,3.2rem)] font-medium leading-none ghost-signal">
                        <span className="vista-num" data-to={s.to} data-suffix={s.suffix}>0{s.suffix}</span>
                      </dt>
                      <dd className="mt-1.5 text-[11px] text-faint leading-snug">{s.label}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          ))}

          {/* depth meter: fills as the camera descends toward the pond */}
          <div className="absolute right-[clamp(0.75rem,2vw,1.5rem)] top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-3" aria-hidden="true">
            <span className="text-[9px] tracking-[0.3em] uppercase text-faint [writing-mode:vertical-rl]">Walk on</span>
            <div className="relative h-32 w-px bg-white/15 overflow-hidden">
              <div className="vista-meter-fill absolute inset-0 origin-top bg-[var(--signal)]" />
            </div>
          </div>

          <div className="vista-cue absolute top-[16vh] inset-x-0 flex flex-col items-center gap-3 text-center" aria-hidden="true">
            <span className="text-[10px] tracking-[0.35em] uppercase text-faint">Keep scrolling — follow the path</span>
            <span className="h-10 w-px bg-gradient-to-b from-[var(--signal)] to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
