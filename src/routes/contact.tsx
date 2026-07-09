import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { ArrowLeft, Mail, Github, Linkedin, FileDown } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Sharvesh Kandavel" },
      {
        name: "description",
        content:
          "Reach out — open to full-time and internship opportunities. Email, LinkedIn, GitHub.",
      },
      { property: "og:title", content: "Contact — Sharvesh Kandavel" },
      {
        property: "og:description",
        content:
          "Reach out — open to full-time and internship opportunities. Email, LinkedIn, GitHub.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="aurora-bg relative min-h-screen">
      <SiteChrome />
      <main className="mx-auto max-w-2xl px-6 py-32 text-center">
        <Link to="/" className="pill mb-10 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to universe
        </Link>

        <h1 className="font-display text-5xl font-semibold sm:text-6xl">
          Let&apos;s talk.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
          Open to full-time and internship opportunities. Also happy to chat
          about anything you&apos;re building.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <a
            href="mailto:skandave@uwaterloo.ca"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-background transition hover:-translate-y-0.5"
          >
            <Mail className="h-4 w-4" /> Email me
          </a>
          <a href="https://linkedin.com/" target="_blank" rel="noreferrer" className="pill">
            <Linkedin className="h-4 w-4" /> LinkedIn
          </a>
          <a href="https://github.com/" target="_blank" rel="noreferrer" className="pill">
            <Github className="h-4 w-4" /> GitHub
          </a>
          <button
            type="button"
            className="pill opacity-60"
            title="Resume coming soon — upload the PDF and I'll wire it up"
          >
            <FileDown className="h-4 w-4" /> Resume (coming soon)
          </button>
        </div>
      </main>
    </div>
  );
}
