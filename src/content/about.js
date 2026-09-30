// ─────────────────────────────────────────────
//  ABOUT + EXPERTISE + EXPERIENCE + RECOGNITIONS + EDUCATION
//  Edit everything here.
// ─────────────────────────────────────────────

import {
  SiReact, SiNextdotjs, SiRedux, SiTailwindcss, SiFramer, SiThreedotjs,
  SiNodedotjs, SiExpress, SiGraphql, SiJsonwebtokens, SiSocketdotio,
  SiMongodb, SiMongoose, SiPostgresql, SiRedis,
  SiLangchain, SiGooglegemini, SiApachespark, SiDelta, SiDatabricks, SiAnthropic,
  SiGit, SiGithub, SiPostman, SiDocker, SiVercel,
} from "react-icons/si";
import {
  PiRobot, PiStack, PiPlugsConnected, PiGraph, PiChatsCircle, PiPuzzlePiece,
  PiClock, PiUsersThree, PiCloud,
} from "react-icons/pi";

export const INTRO = {
  story: "Where the journey puts down roots.",
  eyebrow: "About",
  heading: ["Two years of", "shipping.", "A lifetime of", "learning."],
};

export const BIO = [
  "I'm a *Full-Stack Developer* with hands-on experience in the *MERN stack* and *Next.js*, deeply passionate about building scalable, aesthetic web applications.",
  "I've since expanded into *GenAI* and *Agentic AI* — building *RAG pipelines*, *LLM-powered tools* and *multi-agent workflows*, and earning a *Databricks Certified Data Engineer Associate* credential — while shipping real-world projects in startup acceleration, ed-tech and recruitment platforms.",
  "My commitment is to deliver high-quality software that transcends expectations. I thrive in collaborative environments and constantly seek challenges that push the boundaries of modern digital storytelling.",
];

// Key facts shown as an interactive "profile" grid. `copy` = click to copy.
export const DETAILS = [
  { label: "Full name", value: "Pradeep Kumar S" },
  { label: "Location", value: "Saravanapatti, Coimbatore" },
  { label: "Email", value: "pradee.s.2611@gmail.com", copy: true, href: "mailto:pradee.s.2611@gmail.com" },
  { label: "Phone", value: "+91-7010262389", copy: true, href: "tel:+917010262389" },
  { label: "LinkedIn", value: "Connect with me", href: "https://www.linkedin.com/in/pradeep-kumar-selvam" },
  { label: "Hugging Face", value: "View my models", href: "https://huggingface.co/Pradee26112001" },
];

// ── Expertise explorer ────────────────────────────────────────
export const EXPERTISE = {
  story: "Where the tools come together.",
  eyebrow: "Expertise",
  heading: "The stack I reach for.",
  groups: [
    {
      key: "frontend",
      label: "Frontend",
      blurb: "Interfaces that feel fast, look considered and hold their state together.",
      items: [
        { name: "React.js", icon: SiReact },
        { name: "Next.js", icon: SiNextdotjs },
        { name: "Redux Toolkit", icon: SiRedux },
        { name: "Zustand", icon: PiStack },
        { name: "Tailwind CSS", icon: SiTailwindcss },
        { name: "Framer Motion", icon: SiFramer },
        { name: "Three.js", icon: SiThreedotjs },
      ],
    },
    {
      key: "backend",
      label: "Backend",
      blurb: "Secure, well-shaped APIs — 500+ endpoints and counting.",
      items: [
        { name: "Node.js", icon: SiNodedotjs },
        { name: "Express.js", icon: SiExpress },
        { name: "REST APIs", icon: PiPlugsConnected },
        { name: "GraphQL", icon: SiGraphql },
        { name: "JWT Authentication", icon: SiJsonwebtokens },
        { name: "WebSockets", icon: SiSocketdotio },
      ],
    },
    {
      key: "database",
      label: "Database",
      blurb: "Schemas designed for the query, not the other way round.",
      items: [
        { name: "MongoDB", icon: SiMongodb },
        { name: "Mongoose", icon: SiMongoose },
        { name: "PostgreSQL", icon: SiPostgresql },
        { name: "Redis", icon: SiRedis },
      ],
    },
    {
      key: "ai",
      label: "GenAI & Agentic AI",
      blurb: "RAG pipelines, LLM tools and multi-agent workflows that actually ship.",
      items: [
        { name: "LangChain", icon: SiLangchain },
        { name: "OpenAI API", icon: PiRobot },
        { name: "Gemini API", icon: SiGooglegemini },
        { name: "Claude API", icon: SiAnthropic },
        { name: "RAG", icon: PiGraph },
        { name: "Apache Spark", icon: SiApachespark },
        { name: "Delta Lake", icon: SiDelta },
        { name: "Databricks", icon: SiDatabricks },
      ],
    },
    {
      key: "tools",
      label: "Tools & Platforms",
      blurb: "The day-to-day kit for building, testing and deploying.",
      items: [
        { name: "Git", icon: SiGit },
        { name: "GitHub", icon: SiGithub },
        { name: "Postman", icon: SiPostman },
        { name: "Docker", icon: SiDocker },
        { name: "AWS", icon: PiCloud },
        { name: "Vercel", icon: SiVercel },
      ],
    },
    {
      key: "soft",
      label: "Soft Skills",
      blurb: "Because software is a team sport.",
      items: [
        { name: "Communication", icon: PiChatsCircle },
        { name: "Problem-solving", icon: PiPuzzlePiece },
        { name: "Time Management", icon: PiClock },
        { name: "Leadership", icon: PiUsersThree },
      ],
    },
  ],
};

// ── Experience ────────────────────────────────────────────────
export const EXPERIENCE_INTRO = {
  story: "Where the work has been done.",
  eyebrow: "Experience",
  heading: "Two roles. One team. Real users.",
};

export const EXPERIENCE = [
  {
    role: "Software Associate",
    org: "SNS Square",
    place: "Coimbatore",
    period: "Sep 2025 – Present",
    points: [
      "Collaborate within a 4-member engineering team, owning full-stack features end-to-end using React.js, Redux.js, Node.js, Express and MongoDB.",
      "Designed and integrated 500+ RESTful API endpoints and backend services powering dynamic, data-driven front-end experiences.",
      "Build responsive, reusable UI components and manage application state with React.js and Redux.js.",
      "Participate in code reviews and agile ceremonies (sprint planning, standups) using Git to maintain code quality and delivery velocity.",
    ],
    tech: ["React.js", "Redux.js", "Node.js", "Express", "MongoDB", "Git"],
  },
  {
    role: "Junior Software Associate",
    org: "SNS Square",
    place: "Coimbatore",
    period: "Jul 2024 – Sep 2025",
    points: [
      "Built full-stack features end-to-end on the MERN stack, from MongoDB schema design through Express/Node.js APIs to the React.js UI.",
      "Implemented JWT-based user authentication and MongoDB data integration to ship production-ready features.",
      "Designed responsive, state-driven front-end interfaces with React.js and Redux.js, translating design specs into reusable components.",
      "Worked within Git/GitHub version control and Visual Studio in a collaborative, code-reviewed development environment.",
    ],
    tech: ["MERN Stack", "React.js", "Redux.js", "Node.js", "Express.js", "MongoDB", "Git", "GitHub"],
  },
];

// ── Recognitions ──────────────────────────────────────────────
export const RECOGNITION_INTRO = {
  story: "Where the learning is proven.",
  eyebrow: "Recognitions",
  heading: "Certified, and still curious.",
};

export const CERT_FILTERS = ["All", "AI & Data Engineering", "AI & Agentic Development", "Web Development", "Design & Product", "Artificial Intelligence"];

export const CERTIFICATIONS = [
  { name: "Databricks Certified Data Engineer Associate", by: "Databricks", date: "May 2026", note: "Expires May 2028", cat: "AI & Data Engineering", featured: true },
  { name: "Generative AI Engineer Associate", by: "Databricks", date: "Jan 2026", cat: "AI & Data Engineering", featured: true },
  { name: "Model Context Protocol: Advanced Topics", by: "Anthropic", date: "Jul 2026", cat: "AI & Agentic Development" },
  { name: "Introduction to Subagents", by: "Anthropic", date: "Jul 2026", cat: "AI & Agentic Development" },
  { name: "Introduction to Model Context Protocol", by: "Anthropic", date: "Jun 2026", cat: "AI & Agentic Development" },
  { name: "Introduction to Agent Skills", by: "Anthropic", date: "Jun 2026", cat: "AI & Agentic Development" },
  { name: "Claude Code in Action", by: "Anthropic", date: "Jun 2026", cat: "AI & Agentic Development" },
  { name: "Building with the Claude API", by: "Anthropic", date: "Jun 2026", cat: "AI & Agentic Development" },
  { name: "AI Fluency Framework & Foundations", by: "Anthropic", date: "Jun 2026", cat: "AI & Agentic Development" },
  { name: "Generative AI Applications & Python Fundamentals", by: "HCL GUVI", date: "May 2025", cat: "Artificial Intelligence", href: "https://www.guvi.in/share-certificate/4276eT92t71s1vy412" },
  { name: "Full Stack Web Development (MERN Stack)", by: "PrepInsta", date: "Feb 2024", cat: "Web Development", href: "https://certifications.prepinstaprime.com/verify" },
  { name: "Enterprise Design Thinking Co-Creator", by: "IBM", date: "Mar 2022", cat: "Design & Product", href: "https://www.credly.com/badges/91b5d410-d58b-4792-ba9e-5132a254e5d5?source=linked_in_profile" },
  { name: "Enterprise Design Thinking Practitioner", by: "IBM", date: "Mar 2022", cat: "Design & Product", href: "https://www.credly.com/badges/588d3afc-8df6-4f5c-b28f-af3823e6cb92?source=linked_in_profile" },
];

export const ADDITIONAL_RECOGNITIONS = [
  { name: "NPTEL IoT Fundamentals", by: "NPTEL", date: "2023", cat: "IoT & Hardware" },
  { name: "FACE Training Certificate of Appreciation", by: "FACE Training", date: "2023", cat: "Professional Development" },
  { name: "MSP Trust & Lions Club Participation", by: "Lions Club", date: "2022", cat: "Community Service" },
  { name: "Git & Quantitative Aptitude", by: "PrepInsta", date: "", cat: "Development & Analytics" },
  { name: "Conference: Innovative Research (International)", by: "International Research Conference", date: "2023", cat: "Research & Innovation" },
];

// ── Education ─────────────────────────────────────────────────
export const EDUCATION_INTRO = {
  eyebrow: "Education",
  heading: "Where it started.",
};

export const EDUCATION = [
  { name: "Bachelor of Technology", place: "SNS Institutions", city: "Coimbatore", period: "2021 – 2024", tag: "Higher education" },
  { name: "Diploma", place: "Sri Ramakrishna Degree College (Autonomous)", city: "Coimbatore", period: "2020", tag: "Technical education" },
  { name: "Secondary Education", place: "Christus Rex Higher Secondary School", city: "Ooty", period: "2018", tag: "School education" },
];
