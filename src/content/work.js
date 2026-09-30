// ─────────────────────────────────────────────
//  WORK SECTION — edit everything here
// ─────────────────────────────────────────────

export const INTRO = {
  story: "Where thinking takes shape.",
  eyebrow: "Selected Work",
  heading: "Shipped, not just shelved.",
};

export const TABS = [
  { key: "featured", label: "Featured Works" },
  { key: "open", label: "Open Source & GitHub" },
];

// `hue` seeds each card's generative artwork; `metric` is the big number on the card.
export const PROJECTS = [
  {
    key: "startzy",
    tab: "featured",
    num: "01",
    label: "Startup Accelerator",
    title: "Startzy",
    description:
      "A comprehensive platform for startup acceleration with funding modules and streamlined onboarding processes.",
    role: "Full-stack development, funding module, onboarding",
    tech: ["Next.js", "Node.js", "Express", "MongoDB"],
    href: "https://www.startzyai.com/",
    metric: { value: "Funding", label: "onboarding & funding modules" },
    hue: 268,
    art: "orbit",
  },
  {
    key: "edcom",
    tab: "featured",
    num: "02",
    label: "Student Admission Portal",
    title: "EdCom",
    description:
      "A student admission management system with multi-step forms, real-time validation, Razorpay payment integration, and automated seat and document workflows.",
    role: "Multi-step forms, real-time validation, Razorpay integration, automated enrollment workflows",
    tech: ["React", "Express", "Node.js", "MongoDB"],
    href: "https://github.com/pradee2611",
    metric: { value: "Razorpay", label: "payments in the admission flow" },
    hue: 310,
    art: "steps",
  },
  {
    key: "hyrdragon",
    tab: "featured",
    num: "03",
    label: "AI-First Hiring Platform",
    title: "HyrDragon",
    description:
      "An AI-first recruitment platform for automated skill matching, resume analysis, and interview evaluation. Engineered the backend to reliably support 600 concurrent users, with modules for coding tests, AI chatbot interviews, and proctoring.",
    role: "AI matchmaking, coding tests, AI chatbot interviews, MCQ assessments, proctoring & security",
    tech: ["React", "Node.js", "Express", "MongoDB", "Python"],
    href: "https://hyrdragon.digitaldiffuse.in/",
    metric: { value: "600", label: "concurrent users supported" },
    hue: 255,
    art: "network",
  },
  {
    key: "milai",
    tab: "featured",
    num: "04",
    label: "Career Upskilling",
    title: "Milai.ai",
    description:
      "Learning and assessment platform for candidate upskilling. Developed skill-gap analysis, interview bots, and coding challenges.",
    role: "Skill-gap analysis, interview bots, coding challenges",
    tech: ["React", "Node.js", "Express", "MongoDB"],
    href: "https://milai.ai/",
    metric: { value: "Skill-gap", label: "analysis, interview bots, challenges" },
    hue: 285,
    art: "bars",
  },
  {
    key: "dragon",
    tab: "featured",
    num: "05",
    label: "AI Exam Prep & Placement",
    title: "Dragon Suite",
    description:
      "A 20-module super app spanning exam prep, placement readiness, and AI-driven candidate assessment for students, recruiters, and colleges.",
    role: "Full-stack development across the exam-prep, hiring, and AI modules",
    tech: ["React", "Node.js", "Express", "MongoDB"],
    href: "https://www.1000dragons.ai/",
    metric: { value: "20", label: "modules in one super app" },
    hue: 275,
    art: "grid",
  },
  // ── Open source & GitHub ───────────────────────────────────
  {
    key: "foodaccess",
    tab: "open",
    num: "01",
    label: "Food Security Platform",
    title: "FoodAccess",
    description:
      "A full-stack solution designed to combat food waste and improve distribution logistics by connecting donors, food banks, and shelters in real-time.",
    role: "End-to-end full-stack development, real-time dashboard, and donor matching logistics",
    tech: ["React", "TypeScript", "Node.js", "Express", "MongoDB"],
    href: "https://github.com/pradee2611/FoodAccess",
    metric: { value: "Real-time", label: "donors · food banks · shelters" },
    hue: 295,
    art: "network",
  },
  {
    key: "agentic",
    tab: "open",
    num: "02",
    label: "Agentic AI & LLM Systems",
    title: "Agentic AI Workshop",
    description:
      "Hands-on training resources, implementation notebooks, and practical examples for building intelligent autonomous agents, multi-agent frameworks, and structured tool-calling pipelines.",
    role: "Curated notebook materials, LangChain agents, and custom tool integrations",
    tech: ["Jupyter Notebook", "Python", "LangChain", "Gemini API"],
    href: "https://github.com/pradee2611/Agentic_ai_workshop",
    metric: { value: "Agents", label: "multi-agent & tool-calling" },
    hue: 262,
    art: "orbit",
  },
  {
    key: "fullstack",
    tab: "open",
    num: "03",
    label: "Web Architecture Sandbox",
    title: "Fullstack Playground",
    description:
      "An interactive sandbox containing experimental full-stack features, modern UI paradigms, secure authentication, database schemas, and optimized build setups.",
    role: "Interactive dashboard, custom API endpoints, and Vercel optimization",
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vercel"],
    href: "https://github.com/pradee2611/fullstack-playground",
    metric: { value: "Sandbox", label: "auth, schemas, build setups" },
    hue: 280,
    art: "grid",
  },
  {
    key: "learning",
    tab: "open",
    num: "04",
    label: "Interactive Code Playground",
    title: "Learning Sandbox",
    description:
      "A collection of React challenge environments, custom state-management containers, data structure visualizations, and experimentations in the modern frontend ecosystem.",
    role: "Custom React hooks, algorithmic animations, and responsive components",
    tech: ["React", "JavaScript", "HTML5", "CSS3", "Vercel"],
    href: "https://github.com/pradee2611/learning",
    metric: { value: "React", label: "hooks & algorithm visuals" },
    hue: 300,
    art: "bars",
  },
  {
    key: "placement",
    tab: "open",
    num: "05",
    label: "ML Placement & Salary Predictor",
    title: "Student Placement Predictor",
    description:
      "A machine learning app that predicts campus placement outcomes and salary packages, with SHAP-powered explainability and actionable improvement suggestions.",
    role: "Model training, SHAP explainability, and Gradio interface",
    tech: ["Python", "XGBoost", "Scikit-learn", "SHAP", "Gradio"],
    href: "https://github.com/pradee2611/Student-Placement-Predictor",
    metric: { value: "SHAP", label: "explainable predictions" },
    hue: 250,
    art: "steps",
  },
  {
    key: "mcq",
    tab: "open",
    num: "06",
    label: "RAG-Powered Question Generation",
    title: "JEE/NEET MCQ Generator",
    description:
      "An AI application that generates JEE/NEET practice MCQs using Retrieval-Augmented Generation (RAG), with OCR-based content ingestion and a searchable knowledge base.",
    role: "RAG pipeline, OCR ingestion, and vector search implementation",
    tech: ["Python", "Streamlit", "Gemini API", "FAISS", "Tesseract OCR"],
    href: "https://github.com/pradee2601/Question-Extraction",
    metric: { value: "RAG", label: "OCR → vectors → MCQs" },
    hue: 272,
    art: "orbit",
  },
];

export const MORE = {
  text: "There's more where these came from —",
  href: "https://github.com/pradee2611",
};
