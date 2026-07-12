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
    <div className="flex shrink-0 flex-col items-center justify-center py-4 sm:py-0 w-full sm:w-48 md:w-64 lg:w-[280px]">
      <div
        className="relative w-full aspect-[4/3] overflow-hidden rounded-xl shadow-2xl"
        style={{ boxShadow: `0 10px 30px ${accent}33` }}
      >
        <img
          src="/Bitgold_Photo.png"
          alt="BitGold Preview"
          className="h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105"
        />
      </div>
    </div>
  );
}

function RevampVisual({ accent }: { accent: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center py-4 sm:py-0 w-full sm:w-48 md:w-64 lg:w-[280px]">
      <div
        className="relative w-full aspect-[4/3] overflow-hidden rounded-xl shadow-2xl"
        style={{ boxShadow: `0 10px 30px ${accent}33` }}
      >
        <img
          src="/Revamp_Photo.png"
          alt="Revamp Preview"
          className="h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105"
        />
      </div>
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
    <div className="flex shrink-0 items-start justify-end py-4 sm:py-0 sm:pl-6 w-full sm:w-[250px] lg:w-[300px]">
      <img
        src="/Autonomous_Photo.jfif"
        alt="Autonomous Sorting Robot"
        className="max-h-[350px] w-full object-contain"
      />
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
    subtitle: "Full-stack PC customization platform",
    icon: Cpu,
    accent: "#7c8cf8",
    accentBg: "rgba(124,140,248,0.08)",
    tags: ["React", "TypeScript", "PostgreSQL", "FastAPI", "REST APIs"],
    body: "Full-stack PC customization platform with TypeScript dashboards to curate tailored hardware configurations. Managed complex JSONB structures in a PostgreSQL database for flexible metadata and real-time CRUD sync, while enforcing strict data isolation via Row Level Security (RLS).",
    highlights: [
      "PostgreSQL with Row Level Security (RLS)",
      "Complex JSONB database schemas",
      "Automated data extraction via Rainforest API",
      "Full-stack React + FastAPI architecture",
    ],
    github: "https://github.com/SharveshKandavel",
    live: null,
    visual: RevampVisual,
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
];

function ProjectsPage() {
  return (
    <div className="bg-black relative min-h-screen text-white">
      <SiteChrome />
      <main className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" /> Back to universe
        </Link>

        <h1 className="font-display text-5xl font-semibold sm:text-6xl">Projects.</h1>
        <p className="mt-4 text-lg text-white mb-12">
          Things I&apos;ve built — hardware, software, or both.
        </p>

        <div className="flex flex-col gap-8">
          {PROJECTS.map((p) => {
            const Visual = p.visual;
            return (
              <div
                key={p.name}
                className="group relative border border-white/20 bg-black transition-all hover:border-white/50"
              >
                {/* Colored Top Border */}
                <div className="h-1 w-full" style={{ background: p.accent }} />

                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      {/* Icon + Title */}
                      <div className="mb-4 flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 items-center justify-center border"
                          style={{ background: p.accent + "15", borderColor: `${p.accent}55` }}
                        >
                          <p.icon className="h-6 w-6" style={{ color: p.accent }} />
                        </div>
                      </div>

                      <h2 className="font-display text-2xl font-semibold text-white">{p.name}</h2>
                      <p className="mt-1 font-mono text-xs tracking-widest uppercase text-white/70">
                        {p.subtitle}
                      </p>

                      <p className="mt-3 text-sm leading-relaxed text-white">{p.body}</p>

                      {/* Highlights */}
                      <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                        {p.highlights.map((h) => (
                          <li key={h} className="flex items-center gap-2 text-sm text-white">
                            <span style={{ color: p.accent }} className="text-base font-bold">
                              ▸
                            </span>
                            {h}
                          </li>
                        ))}
                      </ul>

                      {/* Tags */}
                      <div className="mt-7 flex flex-wrap gap-2">
                        {p.tags.map((t) => (
                          <span
                            key={t}
                            className="border border-white/20 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Custom Visual Component */}
                    <Visual accent={p.accent} />
                  </div>

                  {/* Action Links */}
                  <div className="mt-8 flex gap-3 border-t border-white/10 pt-6">
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
                    >
                      <Github className="h-4 w-4" /> GitHub
                    </a>
                    {p.live && (
                      <a
                        href={p.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border border-white bg-white px-4 py-2 font-mono text-xs uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white"
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
