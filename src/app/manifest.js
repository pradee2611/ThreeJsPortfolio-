import { SITE } from "@/content/site";

export default function manifest() {
  return {
    name: `${SITE.name} — ${SITE.role}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0b0714",
    theme_color: "#0b0714",
    icons: [],
  };
}
