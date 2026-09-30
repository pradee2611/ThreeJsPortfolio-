"use client";
import { useRef, useState } from "react";
import { EXPERTISE } from "@/content/about";
import SectionHead from "./SectionHead";
import { useReveal } from "@/lib/useReveal";

function Chip({ item, index }) {
  const Icon = item.icon;
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <li
      onMouseMove={onMove}
      data-cursor="hover"
      className="chip-in spot group relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 overflow-hidden transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-[var(--signal)]/50"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <span className="relative grid place-items-center h-9 w-9 rounded-lg bg-[var(--signal)]/10 text-[var(--signal)] group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform duration-300">
        <Icon size={18} />
      </span>
      <span className="relative text-[13.5px] text-[var(--ink)]">{item.name}</span>
    </li>
  );
}

export default function Expertise() {
  const ref = useRef(null);
  useReveal(ref);
  const [active, setActive] = useState(0);
  const group = EXPERTISE.groups[active];

  return (
    <section id="expertise" ref={ref} className="section">
      <div className="container">
        <SectionHead num="03" story={EXPERTISE.story} eyebrow={EXPERTISE.eyebrow} heading={EXPERTISE.heading} />

        <div className="reveal panel p-4 md:p-6 grid lg:grid-cols-[16rem_1fr] gap-6 lg:gap-10">
          {/* category rail */}
          <div role="tablist" aria-label="Skill categories" className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 -mx-1 px-1">
            {EXPERTISE.groups.map((g, i) => (
              <button
                key={g.key}
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                onMouseEnter={() => window.matchMedia("(hover: hover)").matches && setActive(i)}
                data-cursor="hover"
                className={`relative shrink-0 text-left rounded-lg px-4 py-3 text-[13.5px] transition-colors ${
                  i === active ? "text-[var(--ink)] bg-[var(--signal)]/12" : "text-dim hover:text-[var(--ink)]"
                }`}
              >
                <span
                  className={`absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-[var(--signal)] transition-opacity ${
                    i === active ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span className="flex items-center justify-between gap-6">
                  {g.label}
                  <span className="text-[10px] text-faint">{String(g.items.length).padStart(2, "0")}</span>
                </span>
              </button>
            ))}
          </div>

          {/* items */}
          <div key={group.key} className="min-h-[15rem]">
            <p className="chip-in text-[14px] md:text-[15px] text-dim max-w-xl mb-6">{group.blurb}</p>
            <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {group.items.map((it, i) => <Chip key={it.name} item={it} index={i} />)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
