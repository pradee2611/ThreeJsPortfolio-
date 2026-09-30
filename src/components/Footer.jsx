"use client";
import { SITE, SOCIALS, NAV_LINKS } from "@/content/site";
import lenisRef from "@/lib/lenis-instance";

export default function Footer() {
  const toTop = (e) => {
    e.preventDefault();
    if (lenisRef.current) lenisRef.current.scrollTo(0, { duration: 1.3 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="container py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div>
            <p className="text-[11px] tracking-[0.25em] uppercase text-faint mb-3">Let&apos;s talk</p>
            <a href="#contact" onClick={(e) => {
              e.preventDefault();
              const el = document.querySelector("#contact");
              if (lenisRef.current && el) lenisRef.current.scrollTo(el, { offset: -24, duration: 1.3 });
              else el?.scrollIntoView({ behavior: "smooth" });
            }} data-cursor="hover" className="text-3xl md:text-5xl font-medium text-[var(--ink)] hover:text-[var(--signal)] transition-colors">
              {SITE.email}
            </a>
          </div>

          <button onClick={toTop} data-cursor="hover" className="self-start md:self-auto text-[11px] tracking-[0.2em] uppercase text-faint hover:text-[var(--signal)] transition-colors">
            Back to top ↑
          </button>
        </div>

        <div className="hairline my-10" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <p className="text-[12px] text-faint">
            © {new Date().getFullYear()} {SITE.name}. Built from scratch — Next.js, Three.js, GSAP.
          </p>

          <div className="flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} data-cursor="hover" className="text-[12px] text-faint hover:text-[var(--ink)] transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-5">
            {[
              ["LinkedIn", SOCIALS.linkedin],
              ["GitHub", SOCIALS.github],
              ["Hugging Face", SOCIALS.huggingface],
            ].map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" data-cursor="hover" className="text-[12px] text-faint hover:text-[var(--signal)] transition-colors">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
