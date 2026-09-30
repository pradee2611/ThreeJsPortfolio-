import { Space_Grotesk, Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { SITE, SOCIALS } from "@/content/site";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });

export const viewport = {
  themeColor: "#0b0714",
};

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.role}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "Full-Stack Developer", "MERN Stack", "Next.js Developer", "React Developer",
    "Agentic AI", "Generative AI", "RAG", "LangChain", "Node.js", "MongoDB", "Coimbatore",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.role}`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.role}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
  alternates: { canonical: SITE.url },
  category: "portfolio",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE.url}/#person`,
      name: SITE.name,
      url: SITE.url,
      jobTitle: SITE.role,
      email: SITE.email,
      address: { "@type": "PostalAddress", addressLocality: "Coimbatore", addressCountry: "IN" },
      knowsAbout: ["React", "Next.js", "Node.js", "Express", "MongoDB", "LangChain", "RAG", "Gemini API", "OpenAI API", "Databricks"],
      sameAs: [SOCIALS.linkedin, SOCIALS.github, SOCIALS.huggingface],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${serif.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION} />
        )}
        {process.env.NEXT_PUBLIC_BING_VERIFICATION && (
          <meta name="msvalidate.01" content={process.env.NEXT_PUBLIC_BING_VERIFICATION} />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
