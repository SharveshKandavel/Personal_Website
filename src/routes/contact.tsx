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
    <div className="bg-black relative min-h-screen text-white">
      <SiteChrome />
      <main className="mx-auto max-w-2xl px-6 py-32 text-center">
        <Link to="/" className="mb-10 inline-flex items-center gap-2 border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black">
          <ArrowLeft className="h-4 w-4" /> Back to universe
        </Link>

        <h1 className="font-display text-5xl font-semibold sm:text-6xl">
          Let&apos;s talk.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-white">
          Open to full-time and internship opportunities. Also happy to chat
          about anything you&apos;re building.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <a
            href="mailto:skandave@uwaterloo.ca"
            className="inline-flex items-center gap-2 border border-white bg-white px-6 py-3 font-mono uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white"
          >
            <Mail className="h-4 w-4" /> Email me
          </a>
          <a 
            href="https://linkedin.com/in/sharveshkandavel/" 
            target="_blank" 
            rel="noreferrer" 
            className="inline-flex items-center gap-2 border border-white/20 bg-black px-6 py-3 font-mono uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
          >
            <Linkedin className="h-4 w-4" /> LinkedIn
          </a>
          <a 
            href="https://github.com/SharveshKandavel" 
            target="_blank" 
            rel="noreferrer" 
            className="inline-flex items-center gap-2 border border-white/20 bg-black px-6 py-3 font-mono uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-white/20 bg-black px-6 py-3 font-mono uppercase tracking-widest text-white transition-colors hover:border-white/50 hover:bg-white/5"
            title="Download Resume"
          >
            <FileDown className="h-4 w-4" /> Resume
          </a>
        </div>
      </main>
    </div>
  );
}
