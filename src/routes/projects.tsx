import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { ArrowLeft, ExternalLink, Github, Cpu, Coins, Activity, Bot } from "lucide-react";

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

function BitGoldVisual({ accent }: { accent: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-2 py-4 sm:py-0 w-32">
      <div className="relative h-20 w-full">
        {[48, 42, 36, 30].map((size, i) => (
          <div
            key={i}
            className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border-2 font-bold shadow-lg"
            style={{
              width: size * 1.4,
              height: size * 0.4,
              bottom: i * 10,
              background: `linear-gradient(135deg, #ffd700, #b8860b)`,
              borderColor: "#daa520",
              color: "#7a5a00",
              fontSize: i === 0 ? "10px" : "0px",
              boxShadow: `0 ${4 - i}px 12px rgba(218,165,32,0.4)`,
              zIndex: 10 - i,
            }}
          >
            {i === 0 ? "24K GOLD" : ""}
          </div>
        ))}
      </div>
      <span className="text-xs font-medium" style={{ color: accent }}>
        Fractional Gold
      </span>
    </div>
  );
}

function RevampVisual({ accent }: { accent: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-2 py-4 sm:py-0 w-32">
      <div
        className="relative flex h-20 w-20 items-center justify-center rounded-xl border-4 bg-black/40"
        style={{ borderColor: accent, boxShadow: `0 0 25px ${accent}33` }}
      >
        <div className="h-10 w-10 rounded-sm bg-current opacity-80" style={{ color: accent }} />
        {/* CPU Traces */}
        <div className="absolute -left-2 top-3 h-1 w-2 bg-current" style={{ color: accent }} />
        <div className="absolute -left-2 bottom-3 h-1 w-2 bg-current" style={{ color: accent }} />
        <div className="absolute -right-2 top-3 h-1 w-2 bg-current" style={{ color: accent }} />
        <div className="absolute -right-2 bottom-3 h-1 w-2 bg-current" style={{ color: accent }} />
        <div className="absolute -top-2 left-3 h-2 w-1 bg-current" style={{ color: accent }} />
        <div className="absolute -top-2 right-3 h-2 w-1 bg-current" style={{ color: accent }} />
        <div className="absolute -bottom-2 left-3 h-2 w-1 bg-current" style={{ color: accent }} />
        <div className="absolute -bottom-2 right-3 h-2 w-1 bg-current" style={{ color: accent }} />
      </div>
      <span className="mt-1 text-xs font-medium" style={{ color: accent }}>
        3D Hardware
      </span>
    </div>
  );
}

function SilambamVisual({ accent }: { accent: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-2 py-4 sm:py-0 w-32">
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Stick */}
        <div className="absolute h-full w-2 rotate-45 rounded-full bg-foreground/20" />
        {/* Sensor Module */}
        <div
          className="absolute flex h-6 w-10 rotate-45 items-center justify-center rounded-md border-2 bg-background/90 shadow-lg shadow-current/20"
          style={{ borderColor: accent, color: accent }}
        >
          <Activity className="h-3 w-3" />
        </div>
        {/* Wireless Waves */}
        <div
          className="absolute left-1/2 top-1/4 h-4 w-4 animate-ping rounded-full border border-current opacity-50"
          style={{ color: accent }}
        />
      </div>
      <span className="text-xs font-medium" style={{ color: accent }}>
        Motion Telemetry
      </span>
    </div>
  );
}

function RobotVisual({ accent }: { accent: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-2 py-4 sm:py-0 w-32">
      <div className="relative flex h-20 w-20 items-end justify-center pb-2">
        {/* Robot Base */}
        <div
          className="relative z-10 flex h-14 w-16 flex-col items-center justify-end rounded-t-xl border-2 bg-card pb-1 shadow-lg shadow-current/20"
          style={{ borderColor: accent, color: accent }}
        >
          {/* Eye Scanner */}
          <div className="mb-2 flex h-3 w-8 items-center justify-center rounded-full bg-current/20">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-current shadow-[0_0_5px_currentColor]" />
          </div>
          {/* Wheels */}
          <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full border-2 bg-background" style={{ borderColor: accent }} />
          <div className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full border-2 bg-background" style={{ borderColor: accent }} />
        </div>
        {/* Colored Sorting Blocks */}
        <div className="absolute -left-2 bottom-2 h-4 w-4 rounded bg-blue-500/80" />
        <div className="absolute -right-2 bottom-2 h-4 w-4 rounded bg-red-500/80" />
      </div>
      <span className="text-xs font-medium" style={{ color: accent }}>
        PID Control
      </span>
    </div>
  );
}

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
    visual: BitGoldVisual,
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
    visual: RevampVisual,
  },
  {
    name: "Silambam Motion Sensor",
    subtitle: "Wearable martial-arts swing tracker",
    icon: Activity,
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
    visual: SilambamVisual,
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
    visual: RobotVisual,
  },
];

function ProjectsPage() {
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

        <div className="mt-12 flex flex-col gap-8">
          {PROJECTS.map((p) => {
            const Visual = p.visual;
            return (
              <div
                key={p.name}
                className="group relative overflow-hidden rounded-3xl border border-border transition-all hover:border-accent/50"
                style={{ background: p.accentBg }}
              >
                {/* Colored Top Border */}
                <div className="h-1 w-full" style={{ background: p.accent }} />

                <div className="p-8 sm:p-10">
                  <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      {/* Icon + Title */}
                      <div className="mb-4 flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl"
                          style={{ background: p.accent + "28", border: `1px solid ${p.accent}55` }}
                        >
                          <p.icon className="h-6 w-6" style={{ color: p.accent }} />
                        </div>
                      </div>

                      <h2 className="font-display text-3xl font-semibold sm:text-4xl">{p.name}</h2>
                      <p className="mt-1.5 text-base text-muted-foreground">{p.subtitle}</p>

                      <p className="mt-5 text-sm leading-relaxed text-foreground/85 md:text-base">
                        {p.body}
                      </p>

                      {/* Highlights */}
                      <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                        {p.highlights.map((h) => (
                          <li key={h} className="flex items-center gap-2 text-sm text-foreground/80">
                            <span style={{ color: p.accent }} className="text-base font-bold">✓</span>
                            {h}
                          </li>
                        ))}
                      </ul>

                      {/* Tags */}
                      <div className="mt-7 flex flex-wrap gap-2">
                        {p.tags.map((t) => (
                          <span key={t} className="pill border-white/10 !bg-white/5 !py-1.5 text-xs text-foreground/80">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Custom Visual Component */}
                    <Visual accent={p.accent} />
                  </div>

                  {/* Action Links */}
                  <div className="mt-8 flex gap-3">
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pill inline-flex items-center gap-2 text-sm transition hover:bg-white/10"
                    >
                      <Github className="h-4 w-4" /> GitHub
                    </a>
                    {p.live && (
                      <a
                        href={p.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:opacity-90"
                        style={{ background: p.accent, boxShadow: `0 4px 14px ${p.accent}40` }}
                      >
                        <ExternalLink className="h-4 w-4" /> Live demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
