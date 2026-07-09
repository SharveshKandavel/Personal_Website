import { createFileRoute, Link } from "@tanstack/react-router";
import { Hero } from "@/components/Hero";
import { Universe } from "@/components/Universe";
import { SiteChrome } from "@/components/SiteChrome";
import { ArrowRight } from "lucide-react";

const NAME = "Sharvesh Kandavel";

export const Route = createFileRoute("/")({
  component: Index,
});

const PREVIEW_CARDS = [
  {
    to: "/about",
    title: "About",
    body: "Mechatronics @ Waterloo. Presidential Scholar. Builder & problem-solver.",
  },
  {
    to: "/experience",
    title: "Experience",
    body: "Currently building at Credvan. Past internships in fintech, robotics, and AI.",
  },
  {
    to: "/projects",
    title: "Projects",
    body: "Revamp, Bitgold, Motion Sensor, Sorting Robot.",
  },
  {
    to: "/hobbies",
    title: "Hobbies",
    body: "Striker on the pitch. Off the pitch — coding, music, wandering cities.",
  },
  {
    to: "/contact",
    title: "Contact",
    body: "Open to full-time & internship opportunities. Say hi.",
  },
] as const;

function Index() {
  return (
    <div className="relative min-h-screen">
      <SiteChrome name={NAME} />

      <Hero
        name={NAME}
        tagline="Mechatronics @ Waterloo. I code, I solve, I build."
        currentlyLabel="Currently: Building at Credvan"
        buildingChip="Currently building ⚙ Credvan"
      />

      <Universe />

      {/* Preview strip — fallback nav to every section */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PREVIEW_CARDS.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-accent/60"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold">{card.title}</h3>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{card.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {NAME}. Built with care.
      </footer>
    </div>
  );
}
