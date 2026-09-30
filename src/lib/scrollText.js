"use client";

// Scroll-scrubbed word-by-word fade (opacity + blur + lift), the way
// editorial WebGL sites reveal their copy: each word resolves from a soft
// blur in sequence as you scroll, and dissolves the same way on the way out.

// Animated blur filters are expensive on phone GPUs — there we fade + lift only.
const small = () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
const FROM = { autoAlpha: 0, y: 26, filter: "blur(9px)" };
const SHOWN = { autoAlpha: 1, y: 0, filter: "blur(0px)" };
const from = () => (small() ? { autoAlpha: 0, y: 20 } : FROM);
const shown = () => (small() ? { autoAlpha: 1, y: 0 } : SHOWN);
const out = () => (small() ? { autoAlpha: 0, y: -16 } : { autoAlpha: 0, y: -22, filter: "blur(12px)" });

// Wraps every word inside `el` (recursing through <em>/<strong>) in an inline-block
// `.w` span. Idempotent — safe under React strict-mode double effects.
export function splitWords(el) {
  if (!el.dataset.split) {
    el.dataset.split = "1";
    const walk = (node) => {
      Array.from(node.childNodes).forEach((ch) => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(" "));
            else {
              const s = document.createElement("span");
              s.className = "w";
              s.style.display = "inline-block";
              s.style.willChange = "opacity, transform, filter";
              s.textContent = part;
              frag.appendChild(s);
            }
          });
          ch.replaceWith(frag);
        } else if (ch.nodeType === 1) walk(ch);
      });
    };
    walk(el);
  }
  return Array.from(el.querySelectorAll(".w"));
}

// A story beat = `.fw` elements (split into words) + `.fb` blocks (faded as one piece).
// Adds entry + exit tweens for every beat to one scrubbed timeline (total length 1).
export function addFadeBeats(gsap, tl, beats) {
  const slice = 1 / beats.length;
  beats.forEach((el, i) => {
    const at = i * slice;
    const words = Array.from(el.querySelectorAll(".fw")).flatMap(splitWords);
    const blocks = Array.from(el.querySelectorAll(".fb"));
    const all = [...words, ...blocks];

    gsap.set(all, from());
    gsap.set(el, { autoAlpha: 1 });

    const stagger = slice * 0.02;
    tl.fromTo(words, from(), { ...shown(), duration: slice * 0.1, stagger, ease: "none", immediateRender: false }, at + slice * 0.05)
      .fromTo(blocks, from(), { ...shown(), duration: slice * 0.14, ease: "none", immediateRender: false }, at + slice * 0.2)
      .fromTo(
        all,
        shown(),
        { ...out(), duration: slice * 0.1, stagger: slice * 0.012, ease: "none", immediateRender: false },
        at + slice * 0.72
      );
  });
}

// Site-wide: any `.fade-words` inside `root` fades in word by word as it scrolls into view.
export function initWordFades(gsap, ScrollTrigger, root) {
  gsap.utils.toArray(".fade-words", root).forEach((el) => {
    const words = splitWords(el);
    if (!words.length) return;
    gsap.fromTo(
      words,
      from(),
      {
        ...shown(),
        ease: "none",
        stagger: 0.12,
        immediateRender: true,
        scrollTrigger: { trigger: el, start: "top 92%", end: "top 48%", scrub: 0.5 },
      }
    );
  });
}
