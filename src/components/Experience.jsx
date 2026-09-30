"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EXPERIENCE, EXPERIENCE_INTRO } from "@/content/about";
import SectionHead from "./SectionHead";
import { useReveal } from "@/lib/useReveal";

gsap.registerPlugin(ScrollTrigger);

function Job({ job, open, onToggle, index }) {
  return (
    <li className="reveal relative pl-9 md:pl-14">
      {/* node on the timeline */}
      <span
        className={`absolute left-0 top-7 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 transition-all duration-300 ${
          open ? "border-[var(--signal)] bg-[var(--signal)] shadow-[0_0_18px_var(--signal)]" : "border-white/30 bg-[#0b0714]"
        }`}
      />
      <div className={`panel overflow-hidden transition-colors ${open ? "border-[var(--signal)]/40" : ""}`}>
        <button
          onClick={onToggle}
          aria-expanded={open}
          data-cursor="hover"
          className="w-full text-left p-5 md:p-7 flex items-start justify-between gap-6"
        >
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase text-[var(--signal)] mb-2">{job.period}</p>
            <h3 className="text-xl md:text-2xl font-medium text-[var(--ink)]">{job.role}</h3>
            <p className="mt-1 text-[13px] text-faint">{job.org} · {job.place}</p>
          </div>
          <span
            aria-hidden="true"
            className={`shrink-0 grid place-items-center h-9 w-9 rounded-full border border-white/15 text-[var(--signal)] transition-transform duration-300 ${open ? "rotate-45" : ""}`}
          >
            +
          </span>
        </button>

        <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="px-5 md:px-7 pb-6 md:pb-7">
              <ul className="flex flex-col gap-3">
                {job.points.map((p, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-[14px] text-dim leading-relaxed"
                    style={open ? { animation: `chipIn .5s ${i * 70}ms both cubic-bezier(.2,.7,.2,1)` } : undefined}
                  >
                    <span className="mt-[9px] h-px w-3 shrink-0 bg-[var(--signal)]" />
                    {p}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[10px] tracking-[0.25em] uppercase text-faint mb-2">Technologies</p>
              <ul className="flex flex-wrap gap-2">
                {job.tech.map((t) => (
                  <li key={t} className="text-[11px] text-dim border border-white/10 rounded-full px-2.5 py-1 hover:border-[var(--signal)]/60 hover:text-[var(--ink)] transition-colors">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function Experience() {
  const ref = useRef(null);
  const lineRef = useRef(null);
  const [open, setOpen] = useState(0);
  useReveal(ref);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(lineRef.current, { scaleY: 0 }, {
        scaleY: 1, ease: "none", transformOrigin: "top",
        scrollTrigger: { trigger: ".exp-list", start: "top 70%", end: "bottom 60%", scrub: 0.5 },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  // Accordions change the section's height, which moves every scroll trigger below it.
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 560);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <section id="experience" ref={ref} className="section">
      <div className="container">
        <SectionHead num="04" story={EXPERIENCE_INTRO.story} eyebrow={EXPERIENCE_INTRO.eyebrow} heading={EXPERIENCE_INTRO.heading} />

        <div className="relative max-w-4xl">
          <div className="absolute left-0 top-2 bottom-2 w-px bg-white/10" aria-hidden="true" />
          <div ref={lineRef} className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-[var(--signal)] to-[var(--agent)]" aria-hidden="true" />
          <ul className="exp-list flex flex-col gap-6">
            {EXPERIENCE.map((job, i) => (
              <Job key={job.role + job.period} job={job} index={i} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
