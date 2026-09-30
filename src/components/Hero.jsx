"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SiGithub, SiHuggingface } from "react-icons/si";
import { PiLinkedinLogo } from "react-icons/pi";
import { SITE, SOCIALS, STATS } from "@/content/site";
import { scrambleSwap } from "@/lib/scramble";
import lenisRef from "@/lib/lenis-instance";
import { useMagnetic } from "@/lib/useMagnetic";

const WORDS = ["agents.", "RAG pipelines.", "LLM tools.", "AI products."];

const MARQUEE = [
  "React", "Next.js", "Node.js", "Express", "MongoDB", "PostgreSQL", "Redis",
  "LangChain", "RAG", "Claude API", "Gemini API", "Databricks", "Docker", "GraphQL", "Three.js",
];

// A short, looping "agent run" — a nod to what I build — typed out line by line.
const RUN = [
  { k: "run",      text: 'agent.run("match candidate → role")' },
  { k: "parse",    text: "parse resume + JD" },
  { k: "retrieve", text: "vector search · top-k" },
  { k: "reason",   text: "call skill_match()" },
  { k: "respond",  text: "stream structured output" },
];

function RotatingWord() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    const id = setInterval(() => {
      const from = WORDS[i];
      i = (i + 1) % WORDS.length;
      scrambleSwap(gsap, ref.current, from, WORDS[i], 0.8);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return <span ref={ref} className="rot-word">{WORDS[0]}</span>;
}

// Words in the headline lift + glow as the cursor passes over them.
function Words({ text }) {
  return text.split(" ").map((w, i, arr) => (
    <span key={i}>
      <span className="hero-word inline-block transition-[transform,color,text-shadow] duration-300 hover:-translate-y-1.5 hover:text-[var(--signal)] hover:[text-shadow:0_0_28px_rgba(183,148,246,0.6)]">
        {w}
      </span>
      {i < arr.length - 1 && " "}
    </span>
  ));
}

function AgentConsole() {
  const [step, setStep] = useState(0); // how many lines are shown; RUN.length + 2 = hold, then reset
  const cardRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setStep(RUN.length); return; }
    const id = setInterval(() => setStep((s) => (s >= RUN.length + 2 ? 0 : s + 1)), 900);
    return () => clearInterval(id);
  }, []);

  const onMove = (e) => {
    const el = cardRef.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`;
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const onLeave = () => { cardRef.current.style.transform = ""; };

  const done = step >= RUN.length;

  return (
    <div className="hero-stat-card hidden lg:block">
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="spot panel overflow-hidden transition-transform duration-200 will-change-transform"
      >
        {/* title bar */}
        <div className="relative flex items-center gap-2 px-5 py-3 border-b border-white/[0.07]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b8a]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffd166]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--signal)]/80" />
          <span className="ml-3 text-[11px] tracking-[0.12em] text-faint">agent.log</span>
          <span className="ml-auto flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-dim">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--signal)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--signal)]" />
            </span>
            Open to roles
          </span>
        </div>

        {/* typed run */}
        <ul className="relative px-5 py-5 font-mono text-[11.5px] leading-[1.9] min-h-[10.5rem]">
          {RUN.map((l, i) => (
            <li key={l.k} className={`flex gap-3 transition-all duration-500 ${i < step ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
              <span className={i === 0 ? "text-[var(--signal)]" : "text-[var(--agent)]"}>{i === 0 ? "$" : "→"}</span>
              {i > 0 && <span className="w-[4.2rem] shrink-0 text-faint">{l.k}</span>}
              <span className="text-[var(--ink)]/90">{l.text}</span>
              {i < step - 1 || done ? <span className="ml-auto text-[var(--signal)]">✓</span> : i === step - 1 ? <span className="ml-auto text-faint animate-pulse">…</span> : null}
            </li>
          ))}
          <li className={`mt-1 text-[var(--signal)] transition-opacity duration-300 ${done ? "opacity-100" : "opacity-0"}`}>
            ▍ ready for the next task
          </li>
        </ul>

        <div className="hairline" />
        <dl className="relative grid grid-cols-4 gap-2 px-5 py-4">
          {STATS.map((s) => (
            <div key={s.label} className="hero-stat-row">
              <dt className="text-[1.35rem] font-medium text-[var(--ink)] leading-none">{s.value}</dt>
              <dd className="mt-1.5 text-[9.5px] text-faint leading-tight">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export default function Hero({ ready = true }) {
  const sectionRef = useRef(null);
  const introRef = useRef(null);
  const magWork = useMagnetic({ strength: 0.4 });
  const magResume = useMagnetic({ strength: 0.4 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      introRef.current = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } })
        .from(".hero-eyebrow", { opacity: 0, y: 14, duration: 0.6 }, 0.15)
        .from(".hero-line", { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.25)
        .from(".hero-sub", { opacity: 0, y: 16, duration: 0.7 }, 0.75)
        .from(".hero-cta", { opacity: 0, y: 16, duration: 0.7, stagger: 0.08 }, 0.85)
        .from(".hero-social", { opacity: 0, y: 12, duration: 0.5, stagger: 0.06 }, 1.05)
        .from(".hero-scroll-cue", { opacity: 0, duration: 0.8 }, 1.1)
        .from(".hero-stat-card", { opacity: 0, x: 30, duration: 0.9 }, 0.7)
        .from(".hero-stat-row", { opacity: 0, y: 10, duration: 0.5, stagger: 0.07 }, 1.1)
        .from(".hero-marquee", { opacity: 0, y: 20, duration: 0.8 }, 1.2);
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // The intro plays once the loader has lifted.
  useEffect(() => {
    if (ready) introRef.current?.play();
  }, [ready]);

  // A soft light follows the cursor across the hero.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    const x = gsap.quickTo(el, "--gx", { duration: 0.6, ease: "power3.out" });
    const y = gsap.quickTo(el, "--gy", { duration: 0.6, ease: "power3.out" });
    const move = (e) => { const r = el.getBoundingClientRect(); x(e.clientX - r.left); y(e.clientY - r.top); };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, []);

  const goTo = (sel) => (e) => {
    e.preventDefault();
    const el = document.querySelector(sel);
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -24, duration: 1.3 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  const socials = [
    { href: SOCIALS.github, label: "GitHub", Icon: SiGithub },
    { href: SOCIALS.linkedin, label: "LinkedIn", Icon: PiLinkedinLogo },
    { href: SOCIALS.huggingface, label: "Hugging Face", Icon: SiHuggingface },
  ];

  return (
    <section id="hero" ref={sectionRef} className="hero-section relative min-h-[100svh] md:min-h-[112vh] flex items-center overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(420px circle at var(--gx, 60%) var(--gy, 40%), rgba(183,148,246,0.16), transparent 70%)" }}
      />

      <div className="container relative z-10 pt-24 pb-24 grid lg:grid-cols-[1.25fr_0.75fr] gap-12 items-center">
        <div>
          <p className="hero-eyebrow eyebrow mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--signal)]" />
            {SITE.location} · Available for select roles
          </p>

          <h1 className="text-[clamp(2.6rem,7.4vw,5.9rem)] font-medium text-[var(--ink)]">
            <span className="reveal-line block overflow-hidden pb-[0.08em]">
              <span className="hero-line block"><Words text="Full-stack developer." /></span>
            </span>
            <span className="reveal-line block overflow-hidden pb-[0.08em]">
              <span className="hero-line block"><Words text="Now building" /></span>
            </span>
            <span className="reveal-line block overflow-hidden pb-[0.12em]">
              <span className="hero-line block ghost-signal"><RotatingWord /></span>
            </span>
          </h1>

          <p className="hero-sub mt-8 max-w-xl text-[15px] md:text-base text-dim leading-relaxed">
            {SITE.tagline} I&apos;m <span className="text-[var(--ink)] font-medium">{SITE.name}</span> — a {SITE.role.toLowerCase()} who ships
            production MERN platforms and wires them up to LLMs, RAG pipelines, and multi-agent workflows.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              ref={magWork}
              href="#work"
              onClick={goTo("#work")}
              data-cursor="hover"
              className="hero-cta group inline-flex items-center gap-2 rounded-full bg-[var(--signal)] px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#1a0f2e] hover:bg-[var(--ink)] transition-colors"
            >
              View Work <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              ref={magResume}
              href={SITE.resumeUrl}
              download
              data-cursor="hover"
              className="hero-cta inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--ink)] hover:border-[var(--signal)] hover:text-[var(--signal)] transition-colors"
            >
              Resume
            </a>
            <ul className="flex items-center gap-2 sm:ml-2">
              {socials.map(({ href, label, Icon }) => (
                <li key={label} className="hero-social">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    data-cursor="hover"
                    className="grid place-items-center h-11 w-11 rounded-full border border-white/15 text-dim hover:text-[var(--signal)] hover:border-[var(--signal)] hover:-translate-y-1 hover:bg-[var(--signal)]/10 transition-all duration-300"
                  >
                    <Icon size={18} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <AgentConsole />
      </div>

      {/* scroll cue */}
      <button
        onClick={goTo("#vista")}
        data-cursor="hover"
        aria-label="Scroll down"
        className="hero-scroll-cue absolute bottom-24 right-[clamp(1.25rem,5vw,4rem)] z-10 hidden md:flex flex-col items-center gap-3 text-[var(--ink-faint)] hover:text-[var(--signal)] transition-colors"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <span className="relative h-9 w-[22px] rounded-full border border-current">
          <span className="absolute left-1/2 top-1.5 h-1.5 w-[3px] -translate-x-1/2 rounded-full bg-[var(--signal)] animate-[wheel_1.8s_ease-in-out_infinite]" />
        </span>
      </button>

      {/* tech marquee */}
      <div className="hero-marquee absolute inset-x-0 bottom-0 z-10 border-t border-white/[0.07] bg-[#0b0714]/55 backdrop-blur-sm overflow-hidden" aria-hidden="true">
        <div className="marquee-track flex w-max items-center gap-10 py-4">
          {[...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i} className="flex items-center gap-10 text-[12px] tracking-[0.22em] uppercase text-faint">
              {t}
              <span className="h-1 w-1 rounded-full bg-[var(--signal)]/70" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
