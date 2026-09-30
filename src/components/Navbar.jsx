"use client";
import { useEffect, useState } from "react";
import { SITE, NAV_LINKS } from "@/content/site";
import lenisRef from "@/lib/lenis-instance";
import { useMagnetic } from "@/lib/useMagnetic";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#hero");
  const magTalk = useMagnetic({ strength: 0.45 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.querySelector(l.href)).filter(Boolean);
    if (!sections.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const go = (href) => (e) => {
    e.preventDefault();
    setOpen(false);
    const el = document.querySelector(href);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -24, duration: 1.3 });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[100] transition-colors duration-300 ${
        scrolled ? "bg-[#0b0714]/75 backdrop-blur-md border-b border-white/[0.06]" : "bg-transparent"
      }`}
    >
      <nav className="container flex items-center justify-between h-16 md:h-20">
        <a href="#hero" onClick={go("#hero")} className="font-display text-lg tracking-tight text-[var(--ink)]" data-cursor="hover">
          P<span className="text-[var(--signal)]">/</span>S
        </a>

        <ul className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={go(l.href)}
                data-cursor="hover"
                className={`group flex items-center gap-2 text-[13px] tracking-[0.08em] transition-colors ${
                  active === l.href ? "text-[var(--ink)]" : "text-[var(--ink-dim)] hover:text-[var(--ink)]"
                }`}
              >
                <span className={`text-[10px] transition-colors ${active === l.href ? "text-[var(--signal)]" : "text-[var(--signal)]/60"}`}>
                  {l.num}
                </span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          ref={magTalk}
          href="#contact"
          onClick={go("#contact")}
          data-cursor="hover"
          className="hidden lg:inline-flex items-center rounded-full border border-[var(--signal)]/40 px-4 py-2 text-[12px] tracking-[0.12em] uppercase text-[var(--signal)] hover:bg-[var(--signal)]/10 transition-colors"
        >
          Let&apos;s talk
        </a>

        <button
          data-cursor="hover"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden relative w-9 h-9 flex flex-col items-center justify-center gap-[5px]"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className={`block h-px w-6 bg-[var(--ink)] transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`} />
          <span className={`block h-px w-6 bg-[var(--ink)] transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-px w-6 bg-[var(--ink)] transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-white/[0.06] bg-[#0b0714]/95 backdrop-blur-md">
          <ul className="container py-4 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={go(l.href)}
                  className={`flex items-center gap-3 py-3 text-sm tracking-wide ${
                    active === l.href ? "text-[var(--ink)]" : "text-[var(--ink-dim)]"
                  }`}
                >
                  <span className="text-[10px] text-[var(--signal)]">{l.num}</span>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
