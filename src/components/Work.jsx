"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { INTRO, TABS, PROJECTS, MORE } from "@/content/work";
import SectionHead from "./SectionHead";
import ProjectArt from "./ProjectArt";
import lenisRef from "@/lib/lenis-instance";
import { useReveal } from "@/lib/useReveal";

function ProjectCard({ project, index, onOpen }) {
  const cardRef = useRef(null);

  const onMove = (e) => {
    const el = cardRef.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 9).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 11).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    el.style.setProperty("--ax", `${(x * -14).toFixed(1)}px`);
    el.style.setProperty("--ay", `${(y * -10).toFixed(1)}px`);
  };
  const onLeave = () => {
    const el = cardRef.current;
    ["--rx", "--ry", "--ax", "--ay"].forEach((k) => el.style.setProperty(k, "0"));
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <li className="chip-in" style={{ animationDelay: `${index * 70}ms` }}>
      <button
        ref={cardRef}
        onClick={() => onOpen(project)}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        data-cursor="hover"
        aria-label={`Open ${project.title} details`}
        className="spot group relative block w-full text-left panel overflow-hidden transition-transform duration-200 will-change-transform"
        style={{ transform: "perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))" }}
      >
        <div className="relative h-40 overflow-hidden">
          <div
            className="absolute -inset-4 transition-transform duration-300 ease-out group-hover:scale-110"
            style={{ transform: "translate(var(--ax,0px), var(--ay,0px))" }}
          >
            <ProjectArt art={project.art} hue={project.hue} className="h-full w-full" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0714]/85 via-transparent to-transparent" />
          <span className="absolute left-5 top-4 chip-num bg-[#0b0714]/60 backdrop-blur">{project.num}</span>
          <span
            aria-hidden="true"
            className="absolute right-4 top-4 grid place-items-center h-9 w-9 rounded-full border border-white/25 bg-[#0b0714]/60 backdrop-blur text-[var(--ink)] opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
          >
            ↗
          </span>
          <div className="absolute left-5 bottom-3">
            <p className="text-[1.6rem] font-medium leading-none text-[var(--ink)]">{project.metric.value}</p>
            <p className="mt-1 text-[10.5px] tracking-wide text-dim">{project.metric.label}</p>
          </div>
        </div>

        <div className="relative p-5 md:p-6">
          <p className="text-[10.5px] tracking-[0.2em] uppercase text-faint mb-2">{project.label}</p>
          <h3 className="text-xl md:text-[1.55rem] font-medium text-[var(--ink)] mb-3 group-hover:text-[var(--signal)] transition-colors">{project.title}</h3>
          <p className="text-[13.5px] text-dim leading-relaxed line-clamp-3">{project.description}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {project.tech.slice(0, 4).map((t) => (
              <li key={t} className="text-[10.5px] tracking-wide text-faint border border-white/10 rounded-full px-2.5 py-0.5">{t}</li>
            ))}
            {project.tech.length > 4 && (
              <li className="text-[10.5px] text-faint px-1 py-0.5">+{project.tech.length - 4}</li>
            )}
          </ul>
          <p className="mt-5 text-[11px] tracking-[0.18em] uppercase text-[var(--signal)] flex items-center gap-2">
            Explore <span className="inline-block transition-transform group-hover:translate-x-1.5">→</span>
          </p>
        </div>
      </button>
    </li>
  );
}

function ProjectModal({ list, index, onClose, onNav }) {
  const project = list[index];
  const closeRef = useRef(null);

  useEffect(() => {
    lenisRef.current?.stop();
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenisRef.current?.start();
    };
  }, [onClose, onNav]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 md:p-8" role="dialog" aria-modal="true" aria-label={project.title}>
      <div className="modal-backdrop absolute inset-0 bg-[#07040f]/80 backdrop-blur-md" onClick={onClose} />
      <div key={project.key} className="modal-card relative w-full max-w-4xl max-h-full overflow-y-auto custom-scroll panel !bg-[#120a20]/95 grid md:grid-cols-[1.05fr_1fr]">
        <div className="relative min-h-[14rem] md:min-h-full overflow-hidden">
          <ProjectArt art={project.art} hue={project.hue} className="absolute inset-0 h-full w-full scale-[1.35]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120a20] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#120a20]" />
          <div className="absolute left-6 bottom-5">
            <p className="text-[2.6rem] font-medium leading-none text-[var(--ink)]">{project.metric.value}</p>
            <p className="mt-1.5 text-[12px] text-dim">{project.metric.label}</p>
          </div>
        </div>

        <div className="p-6 md:p-9 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <span className="chip-num">{project.num}</span>
            <span className="text-[11px] tracking-[0.2em] uppercase text-faint">{project.label}</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-medium text-[var(--ink)] mb-4">{project.title}</h3>
          <p className="text-[14.5px] text-dim leading-relaxed">{project.description}</p>

          <p className="mt-6 text-[10px] tracking-[0.25em] uppercase text-faint mb-2">My role</p>
          <p className="text-[14px] text-[var(--ink)] leading-relaxed">{project.role}</p>

          <p className="mt-6 text-[10px] tracking-[0.25em] uppercase text-faint mb-2">Built with</p>
          <ul className="flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <li key={t} className="text-[11.5px] text-dim border border-white/12 rounded-full px-3 py-1">{t}</li>
            ))}
          </ul>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--signal)] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#1a0f2e] hover:bg-[var(--ink)] transition-colors"
            >
              {project.href.includes("github.com") ? "View on GitHub" : "Visit live site"} ↗
            </a>
            <div className="flex items-center gap-2">
              <button onClick={() => onNav(-1)} data-cursor="hover" aria-label="Previous project" className="grid place-items-center h-10 w-10 rounded-full border border-white/15 text-[var(--ink)] hover:border-[var(--signal)] hover:text-[var(--signal)] transition-colors">←</button>
              <span className="text-[11px] text-faint tabular-nums w-10 text-center">{index + 1}/{list.length}</span>
              <button onClick={() => onNav(1)} data-cursor="hover" aria-label="Next project" className="grid place-items-center h-10 w-10 rounded-full border border-white/15 text-[var(--ink)] hover:border-[var(--signal)] hover:text-[var(--signal)] transition-colors">→</button>
            </div>
          </div>
        </div>

        <button
          ref={closeRef}
          onClick={onClose}
          data-cursor="hover"
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid place-items-center h-9 w-9 rounded-full border border-white/20 bg-[#0b0714]/70 text-[var(--ink)] hover:border-[var(--signal)] hover:text-[var(--signal)] transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function Work() {
  const ref = useRef(null);
  useReveal(ref);
  const [tab, setTab] = useState("featured");
  const [openIndex, setOpenIndex] = useState(-1);

  const list = PROJECTS.filter((p) => p.tab === tab);
  const close = useCallback(() => setOpenIndex(-1), []);
  const nav = useCallback((d) => setOpenIndex((i) => (i + d + list.length) % list.length), [list.length]);

  return (
    <section id="work" ref={ref} className="section">
      <div className="container">
        <SectionHead num="05" story={INTRO.story} eyebrow={INTRO.eyebrow} heading={INTRO.heading} className="mb-10" />

        <div role="tablist" aria-label="Project categories" className="reveal mb-8 inline-flex rounded-full border border-white/12 bg-white/[0.03] p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              data-cursor="hover"
              className={`rounded-full px-4 md:px-5 py-2 text-[12px] tracking-[0.08em] transition-colors ${
                tab === t.key ? "bg-[var(--signal)] text-[#1a0f2e] font-semibold" : "text-dim hover:text-[var(--ink)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <ul key={tab} className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
          {list.map((p, i) => <ProjectCard key={p.key} project={p} index={i} onOpen={() => setOpenIndex(i)} />)}
        </ul>

        <p className="reveal mt-10 text-[13px] text-faint">
          {MORE.text}{" "}
          <a href={MORE.href} target="_blank" rel="noopener noreferrer" data-cursor="hover" className="text-[var(--signal)] hover:text-[var(--ink)] transition-colors">
            explore GitHub →
          </a>
        </p>
      </div>

      {openIndex >= 0 && <ProjectModal list={list} index={openIndex} onClose={close} onNav={nav} />}
    </section>
  );
}
