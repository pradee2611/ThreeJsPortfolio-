"use client";
import { useRef, useState } from "react";
import { INTRO, BIO, DETAILS } from "@/content/about";
import { SITE, STATS } from "@/content/site";
import { splitHighlight } from "@/lib/highlight";
import { useReveal } from "@/lib/useReveal";

function Bio({ text }) {
  return (
    <p className="fade-words text-[15px] md:text-base text-dim leading-relaxed">
      {splitHighlight(text).map((chunk, i) =>
        chunk.strong ? (
          <strong key={i} className="text-[var(--ink)] font-semibold">{chunk.text}</strong>
        ) : (
          <span key={i}>{chunk.text}</span>
        )
      )}
    </p>
  );
}

// A profile fact. Emails/phones copy on click; links open.
function DetailCard({ d }) {
  const [copied, setCopied] = useState(false);
  const Tag = d.href && !d.copy ? "a" : "button";
  const props =
    Tag === "a"
      ? { href: d.href, target: "_blank", rel: "noopener noreferrer" }
      : {
          type: "button",
          onClick: async () => {
            try {
              await navigator.clipboard.writeText(d.value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1400);
            } catch {}
          },
        };

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <Tag
      {...props}
      onMouseMove={onMove}
      data-cursor="hover"
      className={`reveal spot group relative text-left ${d.value.length > 22 ? "sm:col-span-2" : ""} rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 overflow-hidden transition-transform duration-300 hover:-translate-y-0.5`}
    >
      <p className="relative text-[10px] tracking-[0.22em] uppercase text-faint mb-1.5">{d.label}</p>
      <p className="relative text-[13.5px] text-[var(--ink)] break-words">{d.value}</p>
      {(d.copy || d.href) && (
        <span className="absolute right-3 top-3 text-[10px] tracking-wide text-[var(--signal)] opacity-0 group-hover:opacity-100 transition-opacity">
          {copied ? "Copied ✓" : d.copy ? "Copy" : "Open ↗"}
        </span>
      )}
    </Tag>
  );
}

function StatTile({ s }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(600px) rotateX(${(-y * 10).toFixed(1)}deg) rotateY(${(x * 12).toFixed(1)}deg) translateZ(0)`;
  };
  const onLeave = () => { ref.current.style.transform = ""; };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="reveal panel p-5 transition-transform duration-200 will-change-transform"
    >
      <p className="text-[2.2rem] font-medium leading-none ghost-signal">{s.value}</p>
      <p className="mt-2 text-[11.5px] text-faint leading-snug">{s.label}</p>
    </div>
  );
}

export default function About() {
  const ref = useRef(null);
  useReveal(ref);

  return (
    <section id="about" ref={ref} className="section">
      <div className="container">
        <p className="reveal story-line">{INTRO.story}</p>
        <div className="reveal flex items-center gap-3 mb-10">
          <span className="chip-num">02</span>
          <p className="eyebrow">{INTRO.eyebrow}</p>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-20 items-start">
          <div>
            <h2 className="fade-words text-[clamp(2.2rem,5vw,3.8rem)] font-medium mb-8">
              {INTRO.heading.map((line, i) => (
                <span key={i} className={`block ${i % 2 === 1 ? "text-[var(--signal)]" : "text-[var(--ink)]"}`}>{line}</span>
              ))}
            </h2>
            <div className="flex flex-col gap-5 max-w-xl">
              {BIO.map((p, i) => <Bio key={i} text={p} />)}
            </div>
            <a
              href={SITE.resumeUrl}
              download
              data-cursor="hover"
              className="reveal mt-8 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--signal)] hover:text-[var(--ink)] transition-colors"
            >
              Download résumé <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((s) => <StatTile key={s.label} s={s} />)}
            </div>
            <div>
              <p className="reveal text-[11px] tracking-[0.25em] uppercase text-faint mb-3">Profile</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {DETAILS.map((d) => <DetailCard key={d.label} d={d} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
