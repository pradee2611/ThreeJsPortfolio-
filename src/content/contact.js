// ─────────────────────────────────────────────
//  CONTACT SECTION — edit everything here
// ─────────────────────────────────────────────

import { SITE, SOCIALS } from "./site";

export const INTRO = {
  story: "Where the story continues with you.",
  eyebrow: "Get In Touch",
  heading: ["Let's build", "something", "that thinks."],
  note: "Open to full-stack & Agentic AI roles · Coimbatore, India",
};

export const CONTACT_LINKS = [
  { label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
  { label: "Phone", value: SITE.phone, href: `tel:${SITE.phone.replace(/[^+\d]/g, "")}` },
  { label: "LinkedIn", value: "pradeep-kumar-selvam", href: SOCIALS.linkedin },
  { label: "GitHub", value: "pradee2611", href: SOCIALS.github },
  { label: "Hugging Face", value: "Pradee26112001", href: SOCIALS.huggingface },
];
