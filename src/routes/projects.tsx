import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Sharvesh Kandavel" },
      {
        name: "description",
        content:
          "Selected projects: BitGold, Silambam Motion Sensor, Color-Sorting Robot, AI/ML research at IIT Madras.",
      },
      { property: "og:title", content: "Projects — Sharvesh Kandavel" },
      {
        property: "og:description",
        content:
          "Selected projects: BitGold, Silambam Motion Sensor, Color-Sorting Robot, AI/ML research at IIT Madras.",
      },
      { property: "og:url", content: "/projects" },
    ],
    links: [{ rel: "canonical", href: "/projects" }],
  }),
  component: ProjectsPage,
});

const PROJECTS = [
  {
    name: "Revamp",
    tags: ["React", "TypeScript", "Three.js", "FastAPI"],
    body: "Full-stack PC customization platform with interactive 3D hardware models and automated data extraction via external REST APIs.",
  },
  {
    name: "Bitgold",
    tags: ["React", "TypeScript", "Convex", "Tailwind CSS"],
    body: "Fintech platform investing spare change into fractional 24K gold. Integrating a Live Gold API for real-time price and secure multi-tenant authentication.",
  },
  {
    name: "Martial-Arts Motion Sensor",
    tags: ["C++", "Hardware", "Arduino"],
    body: "Wearable tracking system capturing and analyzing martial arts swing mechanics with robust algorithms to stream telemetry via Bluetooth.",
  },
  {
    name: "Autonomous Sorting Robot",
    tags: ["C++", "Robotics", "SolidWorks"],
    body: "Autonomous robot utilizing 3 motors and 4 sensors to detect, navigate, and sort objects by color using dynamic PID controllers.",
  },
];

function ProjectsPage() {
  return (
    <div className="aurora-bg relative min-h-screen">
      <SiteChrome />
      <main className="mx-auto max-w-4xl px-6 py-32">
        <Link to="/" className="pill mb-10 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to universe
        </Link>

        <h1 className="font-display text-5xl font-semibold sm:text-6xl">Projects.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Things I&apos;ve built — hardware, software, or both.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {PROJECTS.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-accent/60"
            >
              <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span key={t} className="pill !py-1 !text-[11px]">
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-foreground/85">{p.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
