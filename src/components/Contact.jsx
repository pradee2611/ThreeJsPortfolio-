"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { INTRO, CONTACT_LINKS } from "@/content/contact";
import { useMagnetic } from "@/lib/useMagnetic";

gsap.registerPlugin(ScrollTrigger);

const field =
  "w-full bg-white/[0.04] border border-white/12 rounded-lg px-3.5 py-2.5 text-[var(--ink)] text-[14px] placeholder:text-white/35 focus:outline-none focus:border-[var(--signal)] focus:bg-white/[0.06] transition-colors";

export default function Contact() {
  const ref = useRef(null);
  const magSend = useMagnetic({ strength: 0.25 });
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStatus("sent");
      setForm({ name: "", email: "", message: "", website: "" });
    } catch (err) {
      setError(err.message || "Network error. Please try again.");
      setStatus("error");
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".reveal").forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
          opacity: 0,
          y: 24,
          duration: 0.7,
          delay: i * 0.05,
          ease: "power3.out",
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="contact" ref={ref} className="section">
      <div className="container grid lg:grid-cols-[1fr_1fr] gap-14 items-start">
        <div>
          <p className="reveal story-line">{INTRO.story}</p>
          <div className="reveal flex items-center gap-3 mb-4">
            <span className="chip-num">07</span>
            <p className="eyebrow">{INTRO.eyebrow}</p>
          </div>
          <h2 className="reveal text-[clamp(2.2rem,6vw,4rem)] font-medium mb-6">
            {INTRO.heading.map((line, i) => (
              <span key={i} className={`block ${i === 2 ? "text-[var(--signal)]" : ""}`}>{line}</span>
            ))}
          </h2>
          <p className="reveal text-dim text-[14px] max-w-sm mb-8">{INTRO.note}</p>

          <ul className="reveal flex flex-col gap-1 max-w-sm">
            {CONTACT_LINKS.map((c) => (
              <li key={c.label} className="border-b border-white/[0.06] py-3 flex items-center justify-between gap-4">
                <span className="text-[11px] tracking-[0.2em] uppercase text-faint">{c.label}</span>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  data-cursor="hover"
                  className="text-[13px] text-[var(--ink)] hover:text-[var(--signal)] transition-colors truncate"
                >
                  {c.value}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={submit} noValidate className="reveal panel p-6 md:p-7 flex flex-col gap-4" aria-label="Contact form">
          <div>
            <label htmlFor="c-name" className="block text-[10px] text-[var(--signal)] tracking-[0.25em] uppercase font-semibold mb-1.5">Name</label>
            <input id="c-name" className={field} type="text" autoComplete="name" required maxLength={100}
              placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label htmlFor="c-email" className="block text-[10px] text-[var(--signal)] tracking-[0.25em] uppercase font-semibold mb-1.5">Email</label>
            <input id="c-email" className={field} type="email" autoComplete="email" required maxLength={200}
              placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label htmlFor="c-msg" className="block text-[10px] text-[var(--signal)] tracking-[0.25em] uppercase font-semibold mb-1.5">Message</label>
            <textarea id="c-msg" className={field + " resize-none"} rows={4} required maxLength={5000}
              placeholder="Tell me about your project or role…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>

          {/* honeypot — hidden from people, bots fill it */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
            className="absolute left-[-9999px] w-px h-px opacity-0" value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })} />

          <button ref={magSend} type="submit" disabled={status === "sending"} data-cursor="hover"
            className="mt-1 w-full py-3 bg-[var(--signal)] text-[#1a0f2e] text-[12px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[var(--ink)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            {status === "sending" ? "Sending…" : "Send Message"}
          </button>

          <p role="status" aria-live="polite" className="min-h-[1.25rem] text-[13px] font-medium">
            {status === "sent" && <span className="text-[var(--signal)]">Message sent — I&apos;ll get back to you soon.</span>}
            {status === "error" && <span className="text-red-300">{error}</span>}
          </p>
        </form>
      </div>
    </section>
  );
}
