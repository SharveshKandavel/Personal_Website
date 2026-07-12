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
    body: "Built responsive, scalable employer portals using React and TypeScript while architecting backend web services with FastAPI and Convex for real-time JSON processing. Designed Python risk-scoring models to enforce strict transaction limits, engineered complex ETL pipelines unifying multiple external APIs, and ensured the entire Plaid and Stripe infrastructure complied strictly with CFPB Advisory Opinions.",
  },
  {
    company: "WE Accelerate Program",
    role: "Web Developer",
    when: "May 2026 – Aug 2026",
    body: "Executed structural SEO optimizations across two independent websites, significantly increasing performance metrics by up to 45%. Configured detailed Google Analytics tracking, authored comprehensive technical documentation to train the employer on long-term data utilization, and was awarded the WEA Employer-Funded Award for outstanding contribution.",
  },
  {
    company: "IIT Madras",
    role: "Applied AI Program",
    when: "Aug 2025",
    body: "Developed a context-aware AI chatbot connected to a document knowledge base for retrieval-augmented Q&A. Implemented RAG pipelines using AnythingLLM with vector embeddings and deployed local machine learning models via LM Studio to benchmark processing latency and evaluate prompt engineering trade-offs.",
  },
];

function ExperiencePage() {
  return (
    <div className="bg-black relative min-h-screen text-white">
      <SiteChrome />
      <main className="mx-auto max-w-4xl px-6 py-32">
        <Link to="/" className="mb-10 inline-flex items-center gap-2 border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black">
          <ArrowLeft className="h-4 w-4" /> Back to universe
        </Link>

        <h1 className="font-display text-5xl font-semibold sm:text-6xl mb-12">Experience.</h1>

        <ol className="flex flex-col gap-8">
          {ROLES.map((r) => (
            <li
              key={r.company}
              className="group border border-white/20 bg-black p-6 sm:p-8 transition-all duration-300 hover:border-white/50 hover:shadow-[0_8px_30px_rgba(255,255,255,0.1)] relative overflow-hidden"
            >
              {/* Subtle accent line on hover */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/0 transition-colors duration-300 group-hover:bg-white" />

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-white">
                    {r.company === "IIT Madras" ? r.company : r.role}
                  </h3>
                  <p className="text-white/70 font-mono text-sm mt-1 uppercase tracking-widest">
                    {r.company === "IIT Madras" ? r.role : r.company}
                  </p>
                </div>
                <span className="mt-4 sm:mt-0 font-mono text-xs uppercase tracking-widest text-white/60">{r.when}</span>
              </div>
              
              <div className="relative pl-4 sm:pl-6 border-l-2 border-white/10 group-hover:border-white/30 transition-colors duration-300">
                <p className="text-[15px] leading-relaxed text-white/80 font-sans tracking-wide">
                  {r.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
