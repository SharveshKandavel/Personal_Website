import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: "Experience — Sharvesh Kandavel" },
      {
        name: "description",
        content:
          "Experience across fintech, robotics, and AI/ML — currently building at Credvan.",
      },
      { property: "og:title", content: "Experience — Sharvesh Kandavel" },
      {
        property: "og:description",
        content:
          "Experience across fintech, robotics, and AI/ML — currently building at Credvan.",
      },
      { property: "og:url", content: "/experience" },
    ],
    links: [{ rel: "canonical", href: "/experience" }],
  }),
  component: ExperiencePage,
});

const ROLES = [
  {
    company: "Credvan",
    role: "Technical Founder",
    when: "2026 – Present",
    body: "Building scalable employer portals using React, TypeScript, and FastAPI. Designing Python risk-scoring models and building ETL pipelines mapping external REST APIs to a unified database schema.",
  },
  {
    company: "IIT Madras",
    role: "Applied AI Program",
    when: "Aug 2025",
    body: "Built a context-aware AI chatbot connected to a document knowledge base for retrieval-augmented Q&A. Implemented RAG pipelines using AnythingLLM with vector embeddings.",
  },
  {
    company: "WE Accelerate Program",
    role: "Web Developer",
    when: "May 2026 – Aug 2026",
    body: "Executed structural SEO optimizations across two independent websites, increasing performance metrics by 45%. Configured Google Analytics and authored technical documentation.",
  },
];

function ExperiencePage() {
  return (
    <div className="aurora-bg relative min-h-screen">
      <SiteChrome />
      <main className="mx-auto max-w-3xl px-6 py-32">
        <Link to="/" className="pill mb-10 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to universe
        </Link>

        <h1 className="font-display text-5xl font-semibold sm:text-6xl">Experience.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Fintech → Robotics → AI. Always shipping.
        </p>

        <ol className="mt-12 space-y-6">
          {ROLES.map((r) => (
            <li
              key={r.company}
              className="relative rounded-2xl border border-border bg-card p-6 transition hover:border-accent/60"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h3 className="font-display text-2xl font-semibold">{r.company}</h3>
                  <p className="text-sm text-muted-foreground">{r.role}</p>
                </div>
                <span className="pill">{r.when}</span>
              </div>
              <p className="mt-4 text-foreground/85">{r.body}</p>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
