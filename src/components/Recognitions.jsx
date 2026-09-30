"use client";
import { useRef, useState } from "react";
import {
  RECOGNITION_INTRO, CERT_FILTERS, CERTIFICATIONS, ADDITIONAL_RECOGNITIONS,
  EDUCATION_INTRO, EDUCATION,
} from "@/content/about";
import SectionHead from "./SectionHead";
import { useReveal } from "@/lib/useReveal";
import { PiCertificate, PiGraduationCap, PiArrowUpRight } from "react-icons/pi";

function CertCard({ c, index }) {
  const Tag = c.href ? "a" : "div";
  const props = c.href ? { href: c.href, target: "_blank", rel: "noopener noreferrer" } : {};
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <li className="chip-in" style={{ animationDelay: `${index * 50}ms` }}>
      <Tag
        {...props}
        onMouseMove={onMove}
        data-cursor={c.href ? "hover" : undefined}
        className={`spot group relative flex h-full gap-4 rounded-2xl border p-5 overflow-hidden transition-[transform,border-color] duration-300 hover:-translate-y-1 ${
          c.featured
            ? "border-[var(--signal)]/40 bg-gradient-to-br from-[var(--agent)]/25 to-white/[0.03]"
            : "border-white/10 bg-white/[0.03] hover:border-[var(--signal)]/40"
        }`}
      >
        <span className="relative shrink-0 grid place-items-center h-11 w-11 rounded-xl bg-[var(--signal)]/12 text-[var(--signal)] group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
          <PiCertificate size={22} />
        </span>
        <div className="relative min-w-0">
          <p className="text-[10px] tracking-[0.2em] uppercase text-faint mb-1.5">{c.cat}</p>
          <h3 className={`font-medium text-[var(--ink)] leading-snug ${c.featured ? "text-[16px] md:text-[17px]" : "text-[14.5px]"}`}>{c.name}</h3>
          <p className="mt-1.5 text-[12.5px] text-dim">
            {c.by} · <span className="text-faint">{c.date}</span>
            {c.note && <span className="text-faint"> · {c.note}</span>}
          </p>
        </div>
        {c.href && (
          <PiArrowUpRight className="absolute right-4 top-4 text-[var(--signal)] opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
        )}
      </Tag>
    </li>
  );
}

export default function Recognitions() {
  const ref = useRef(null);
  useReveal(ref);
  const [filter, setFilter] = useState("All");
  const list = CERTIFICATIONS.filter((c) => filter === "All" || c.cat === filter);

  return (
    <section id="recognitions" ref={ref} className="section">
      <div className="container">
        <SectionHead num="06" story={RECOGNITION_INTRO.story} eyebrow={RECOGNITION_INTRO.eyebrow} heading={RECOGNITION_INTRO.heading} className="mb-8" />

        <div className="reveal mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Certification categories">
          {CERT_FILTERS.map((f) => {
            const n = f === "All" ? CERTIFICATIONS.length : CERTIFICATIONS.filter((c) => c.cat === f).length;
            return (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                data-cursor="hover"
                className={`rounded-full border px-3.5 py-1.5 text-[12px] transition-colors ${
                  filter === f
                    ? "border-[var(--signal)] bg-[var(--signal)]/15 text-[var(--ink)]"
                    : "border-white/12 text-dim hover:border-white/30 hover:text-[var(--ink)]"
                }`}
              >
                {f} <span className="text-faint ml-1">{n}</span>
              </button>
            );
          })}
        </div>

        <ul key={filter} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((c, i) => <CertCard key={c.name} c={c} index={i} />)}
        </ul>

        <div className="reveal mt-14">
          <p className="text-[11px] tracking-[0.25em] uppercase text-faint mb-4">Additional recognitions</p>
          <ul className="flex flex-wrap gap-2.5">
            {ADDITIONAL_RECOGNITIONS.map((a) => (
              <li
                key={a.name}
                data-cursor="hover"
                className="group rounded-full border border-white/10 bg-white/[0.03] pl-4 pr-3 py-2 text-[12.5px] text-dim hover:border-[var(--signal)]/50 hover:text-[var(--ink)] transition-colors"
              >
                {a.name}
                <span className="ml-2 text-[10.5px] text-faint group-hover:text-[var(--signal)] transition-colors">
                  {[a.date, a.cat].filter(Boolean).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Education */}
        <div className="mt-24">
          <div className="reveal flex items-center gap-3 mb-4">
            <span className="chip-num">06.1</span>
            <p className="eyebrow">{EDUCATION_INTRO.eyebrow}</p>
          </div>
          <h2 className="fade-words text-[clamp(1.8rem,4vw,2.8rem)] font-medium mb-10">{EDUCATION_INTRO.heading}</h2>

          <ol className="relative grid md:grid-cols-3 gap-5">
            <div className="hidden md:block absolute left-0 right-0 top-[1.05rem] h-px bg-gradient-to-r from-[var(--signal)]/60 via-white/15 to-transparent" aria-hidden="true" />
            {EDUCATION.map((e) => (
              <li key={e.name} className="reveal relative pt-9">
                <span className="absolute left-0 top-2 h-3 w-3 rounded-full bg-[var(--signal)] shadow-[0_0_14px_var(--signal)]" />
                <div className="panel p-5 h-full hover:border-[var(--signal)]/40 transition-colors">
                  <div className="flex items-center gap-2 text-[var(--signal)] mb-3">
                    <PiGraduationCap size={18} />
                    <span className="text-[10.5px] tracking-[0.2em] uppercase">{e.tag}</span>
                  </div>
                  <p className="text-[12px] text-faint">{e.period}</p>
                  <h3 className="mt-1 text-lg font-medium text-[var(--ink)]">{e.name}</h3>
                  <p className="mt-2 text-[13px] text-dim leading-snug">{e.place}</p>
                  <p className="text-[12px] text-faint">{e.city}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
