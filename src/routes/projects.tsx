import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { ArrowLeft, ExternalLink, Github, Cpu, Coins, Bot, Zap } from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Sharvesh Kandavel" },
      {
        name: "description",
        content:
          "Selected projects: BitGold, Silambam Motion Sensor, Autonomous Color-Sorting Robot, Revamp PC Builder.",
      },
      { property: "og:title", content: "Projects — Sharvesh Kandavel" },
      {
        property: "og:description",
        content:
          "Selected projects: BitGold, Silambam Motion Sensor, Autonomous Color-Sorting Robot, Revamp PC Builder.",
      },
      { property: "og:url", content: "/projects" },
    ],
    links: [{ rel: "canonical", href: "/projects" }],
  }),
  component: ProjectsPage,
});

const PROJECTS = [
  {
    name: "BitGold",
    subtitle: "Invest spare change into real 24K gold",
    icon: Coins,
    accent: "#f5c842",
    accentBg: "rgba(245,200,66,0.08)",
    tags: ["React", "TypeScript", "Convex", "Tailwind CSS", "Live Gold API"],
    body: "A fintech platform that rounds up everyday purchases and invests the spare change into fractional 24K physical gold. Features real-time gold price tracking via a Live Gold API, secure multi-tenant authentication, and an intuitive dashboard showing portfolio performance.",
    highlights: [
      "Real-time gold price integration",
      "Fractional gold investment engine",
      "Secure multi-tenant auth",
      "Portfolio performance dashboard",
    ],
    github: "https://github.com/SharveshKandavel",
    live: null,
    featured: true,
  },
  {
    name: "Revamp",
    subtitle: "Interactive 3D PC customization platform",
    icon: Cpu,
    accent: "#7c8cf8",
    accentBg: "rgba(124,140,248,0.08)",
    tags: ["React", "TypeScript", "Three.js", "FastAPI", "REST APIs"],
    body: "Full-stack PC customization platform with interactive 3D hardware models. Users can visually build a PC, see real-time compatibility checks, and get automated price data via external REST APIs. Built with Three.js for immersive hardware visualization.",
    highlights: [
      "Interactive 3D hardware models (Three.js)",
      "Real-time compatibility checker",
      "Automated price extraction via APIs",
      "Full-stack React + FastAPI architecture",
    ],
    github: "https://github.com/SharveshKandavel",
    live: null,
    featured: false,
  },
  {
    name: "Silambam Motion Sensor",
    subtitle: "Wearable martial-arts swing tracker",
    icon: Zap,
    accent: "#38d9a9",
    accentBg: "rgba(56,217,169,0.08)",
    tags: ["C++", "Arduino", "Bluetooth", "Hardware", "Sensors"],
    body: "Wearable tracking system capturing and analyzing Silambam (traditional Tamil martial art) swing mechanics. Custom algorithms stream real-time telemetry via Bluetooth to a companion app, giving practitioners instant feedback on speed, angle, and technique.",
    highlights: [
      "Real-time swing telemetry via Bluetooth",
      "Custom C++ signal algorithms",
      "Wearable Arduino hardware",
      "Technique scoring & feedback",
    ],
    github: "https://github.com/SharveshKandavel",
    live: null,
    featured: false,
  },
  {
    name: "Autonomous Sorting Robot",
    subtitle: "Color-detecting PID-controlled robot",
    icon: Bot,
    accent: "#f08030",
    accentBg: "rgba(240,128,48,0.08)",
    tags: ["C++", "Robotics", "SolidWorks", "PID", "Sensors"],
    body: "Fully autonomous robot that uses 3 motors and 4 sensors to detect, navigate toward, and sort objects by color. Dynamic PID controllers ensure smooth, precise movement across varied terrain while the color sensor pipeline classifies targets in real time.",
    highlights: [
      "3-motor drive with PID controllers",
      "4-sensor color + proximity detection",
      "Autonomous navigation & sorting",
      "SolidWorks mechanical design",
    ],
    github: "https://github.com/SharveshKandavel",
    live: null,
    featured: false,
  },
] as const;

function ProjectsPage() {
  const featured = PROJECTS[0];
  const rest     = PROJECTS.slice(1);

  return (
    <div className="aurora-bg relative min-h-screen">
      <SiteChrome />
      <main className="mx-auto max-w-5xl px-6 py-32">
        <Link to="/" className="pill mb-10 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to universe
        </Link>

        <h1 className="font-display text-5xl font-semibold sm:text-6xl">Projects.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Things I&apos;ve built — hardware, software, or both.
        </p>

        {/* ── Featured: BitGold ─────────────────────────────────────────── */}
        <div
          className="mt-12 overflow-hidden rounded-3xl border border-border"
          style={{ background: featured.accentBg }}
        >
          {/* Gold header bar */}
          <div className="h-1 w-full" style={{ background: featured.accent }} />

          <div className="p-8 sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                {/* Icon + name */}
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: featured.accent + "28", border: `1px solid ${featured.accent}55` }}
                  >
                    <featured.icon className="h-5 w-5" style={{ color: featured.accent }} />
                  </div>
                  <span
                    className="rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-widest"
                    style={{ background: featured.accent + "22", color: featured.accent }}
                  >
                    Featured
                  </span>
                </div>

                <h2 className="font-display text-3xl font-semibold sm:text-4xl">{featured.name}</h2>
                <p className="mt-1 text-base text-muted-foreground">{featured.subtitle}</p>

                <p className="mt-5 text-sm leading-relaxed text-foreground/85">{featured.body}</p>

                {/* Highlights */}
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {featured.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-foreground/80">
                      <span style={{ color: featured.accent }} className="text-base font-bold">✓</span>
                      {h}
                    </li>
                  ))}
                </ul>

                {/* Tags */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {featured.tags.map((t) => (
                    <span key={t} className="pill !py-1 !text-[11px]">{t}</span>
                  ))}
                </div>
              </div>

              {/* Coin stack visual */}
              <div className="flex shrink-0 flex-col items-center justify-center gap-2 py-4 sm:py-0">
                {[48, 42, 36, 30].map((size, i) => (
                  <div
                    key={i}
                    className="rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-lg"
                    style={{
                      width: size * 1.3,
                      height: size * 0.35,
                      background: `linear-gradient(135deg, #ffd700, #b8860b)`,
                      borderColor: "#daa520",
                      color: "#7a5a00",
                      fontSize: i === 0 ? "10px" : "0px",
                      boxShadow: `0 ${4 - i}px 12px rgba(218,165,32,0.4)`,
                    }}
                  >
                    {i === 0 ? "24K GOLD" : ""}
                  </div>
                ))}
                <span className="mt-2 text-xs font-medium" style={{ color: featured.accent }}>
                  BitGold
                </span>
              </div>
            </div>

            {/* Links */}
            <div className="mt-8 flex gap-3">
              <a
                href={featured.github}
                target="_blank"
                rel="noopener noreferrer"
                className="pill inline-flex items-center gap-2 hover:bg-white/12 transition"
              >
                <Github className="h-4 w-4" /> GitHub
              </a>
              {featured.live && (
                <a
                  href={featured.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                  style={{ background: featured.accent }}
                >
                  <ExternalLink className="h-4 w-4" /> Live demo
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Other projects ────────────────────────────────────────────── */}
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {rest.map((p) => (
            <div
              key={p.name}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-accent/60"
              style={{ background: p.accentBg }}
            >
              {/* Icon */}
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: p.accent + "22", border: `1px solid ${p.accent}44` }}
              >
                <p.icon className="h-5 w-5" style={{ color: p.accent }} />
              </div>

              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{p.subtitle}</p>

              <p className="mt-3 flex-1 text-sm text-foreground/80">{p.body}</p>

              {/* Highlights */}
              <ul className="mt-4 space-y-1.5">
                {p.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-1.5 text-xs text-foreground/70">
                    <span style={{ color: p.accent }} className="mt-0.5 font-bold">›</span>
                    {h}
                  </li>
                ))}
              </ul>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="pill !py-0.5 !text-[10px]">{t}</span>
                ))}
              </div>

              {/* GitHub link */}
              <a
                href={p.github}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" /> View on GitHub
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
