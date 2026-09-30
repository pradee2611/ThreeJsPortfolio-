"use client";

// Scroll-scrubbed "decode" text: characters resolve from noise into the
// real words as a beat scrolls in, and dissolve back into noise as it
// leaves — so the copy visibly *changes* with the scroll.

const CH = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=<>/?";

export function prepScramble(el) {
  if (el._scr) return el._scr;
  const full = el.textContent;
  // Each character resolves at its own moment: left-to-right sweep plus jitter.
  const th = Array.from(full).map((_, i) => (i / Math.max(full.length, 1)) * 0.62 + Math.random() * 0.38);
  el._scr = { full, th };
  return el._scr;
}

export function renderScramble(el, p) {
  const { full, th } = prepScramble(el);
  if (p >= 0.999) {
    if (el.textContent !== full) el.textContent = full;
    el.classList.remove("is-scrambling");
    return;
  }
  let out = "";
  for (let i = 0; i < full.length; i++) {
    const c = full[i];
    out += c === " " || c === "\n" || p > th[i] ? c : CH[(Math.random() * CH.length) | 0];
  }
  el.textContent = out;
  el.classList.add("is-scrambling");
}

// Adds slide + fade + decode tweens for each beat to a scrubbed timeline.
// Elements with class `.scr` inside a beat are decoded; the rest just fade.
export function addScrambleBeats(gsap, tl, beats) {
  const slice = 1 / beats.length;
  beats.forEach((el, i) => {
    const at = i * slice;
    const fromX = el.dataset.side === "left" ? -40 : 40;
    const texts = Array.from(el.querySelectorAll(".scr"));
    texts.forEach(prepScramble);
    const obj = { p: 0 };
    const draw = () => texts.forEach((t) => renderScramble(t, obj.p));

    tl.fromTo(el, { autoAlpha: 0, x: fromX }, { autoAlpha: 1, x: 0, duration: slice * 0.22, immediateRender: false }, at + slice * 0.04)
      .fromTo(obj, { p: 0 }, { p: 1, duration: slice * 0.3, onUpdate: draw, immediateRender: false }, at + slice * 0.04)
      .fromTo(obj, { p: 1 }, { p: 0, duration: slice * 0.2, onUpdate: draw, immediateRender: false }, at + slice * 0.76)
      .to(el, { autoAlpha: 0, x: -fromX * 0.6, duration: slice * 0.2, immediateRender: false }, at + slice * 0.76);
  });
}

// Word-to-word decode for a single element (used by the hero's rotating word).
export function scrambleSwap(gsap, el, from, to, duration = 0.7) {
  const len = Math.max(from.length, to.length);
  const th = Array.from({ length: len }, (_, i) => (i / len) * 0.6 + Math.random() * 0.4);
  const o = { p: 0 };
  return gsap.to(o, {
    p: 1,
    duration,
    ease: "none",
    onUpdate: () => {
      let s = "";
      for (let i = 0; i < to.length; i++) {
        const c = to[i];
        s += c === " " || o.p > th[i] ? c : CH[(Math.random() * CH.length) | 0];
      }
      el.textContent = s;
      el.classList.toggle("is-scrambling", o.p < 1);
    },
    onComplete: () => {
      el.textContent = to;
      el.classList.remove("is-scrambling");
    },
  });
}
