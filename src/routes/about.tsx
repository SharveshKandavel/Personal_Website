import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { ArrowLeft, Database, Cpu, Settings, Box, Layers, Wrench } from "lucide-react";
import {
  SiCplusplus,
  SiPython,
  SiTypescript,
  SiJavascript,
  SiHtml5,
  SiReact,
  SiNodedotjs,
  SiTailwindcss,
  SiFastapi,
  SiGit,
  SiThreedotjs,
  SiRos,
  SiArduino,
} from "react-icons/si";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Sharvesh Kandavel" },
      {
        name: "description",
        content:
          "Mechatronics student at the University of Waterloo, Presidential Scholar, builder and problem-solver.",
      },
      { property: "og:title", content: "About — Sharvesh Kandavel" },
      {
        property: "og:description",
        content:
          "Mechatronics student at the University of Waterloo, Presidential Scholar, builder and problem-solver.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const LANGUAGES = [
  { name: "C++", icon: SiCplusplus, color: "#00599C" },
  { name: "Python", icon: SiPython, color: "#3776AB" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
  { name: "HTML/CSS", icon: SiHtml5, color: "#E34F26" },
  { name: "SQL", icon: Database, color: "#4479A1" },
];

const HARDWARE = [
  { name: "SolidWorks", icon: Wrench, color: "#E3242B" },
  { name: "ROS2", icon: SiRos, color: "#22314E" },
  { name: "Arduino", icon: SiArduino, color: "#00979D" },
  { name: "Sensors", icon: Cpu, color: "#A0AAB4" },
  { name: "PID Controllers", icon: Settings, color: "#A0AAB4" },
  { name: "3D Printing", icon: Box, color: "#F05032" },
];

const SOFTWARE = [
  { name: "React", icon: SiReact, color: "#61DAFB" },
  { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4" },
  { name: "FastAPI", icon: SiFastapi, color: "#009688" },
  { name: "Git", icon: SiGit, color: "#F05032" },
  { name: "Three.js", icon: SiThreedotjs, color: "#ffffff" },
  { name: "Convex", icon: Layers, color: "#FF8C00" },
];

function AboutPage() {
  return (
    <div className="aurora-bg relative min-h-screen">
      <SiteChrome />
      <main className="mx-auto max-w-3xl px-6 py-32">
        <Link to="/" className="pill mb-10 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to universe
        </Link>

        <h1 className="font-display text-5xl font-semibold sm:text-6xl">About.</h1>

        <div className="mt-8 space-y-6 text-lg text-foreground/85">
          <p>
            Hi — I&apos;m a <strong>Mechatronics Engineering</strong> student at the{" "}
            <strong>University of Waterloo</strong>. I operate at the exact intersection of hardware,
            software, and product design.
          </p>
          <p>
            I&apos;m driven by the challenge of building systems that solve tangible problems. Whether
            it&apos;s engineering fintech tools that move money, designing autonomous robots that see and sort,
            or training models that learn from data—I love bringing bold ideas to life.
          </p>
          <p>
            Beyond the keyboard, soccer is a massive part of my identity. It&apos;s taught me
            resilience, teamwork, and strategy in ways no textbook ever could. I&apos;m always down to
            play almost any sport, and when I finally need to recharge, you&apos;ll probably catch me
            watching anime or diving into Marvel lore.
          </p>
          <p>
            Whether I&apos;m playing as a striker on the pitch or architecting a new tech stack, my
            mindset stays the exact same: <em>always look for the open lane.</em>
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Stat label="Currently" value="Seeking Fall 2026 Co-op" />
          <Stat label="Off the desk" value="Striker · Soccer" />
        </div>

        <section className="mt-10">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 transition-colors hover:border-accent/40">
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Education</h4>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold">University of Waterloo</h3>
                <p className="mt-1 text-muted-foreground">Bachelor of Applied Science in Mechatronics Engineering</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="pill text-xs border-white/10 bg-white/5">Presidential Scholarship</span>
                </div>
              </div>
              <div className="shrink-0 text-sm text-muted-foreground sm:text-right">
                <p>Sept 2023 — Apr 2028</p>
                <p className="mt-1">Waterloo, ON</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-3xl font-semibold">Technical Skills</h2>
          <div className="mt-6 flex flex-col gap-8 rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Languages</h4>
              <div className="flex flex-wrap gap-3">
                {LANGUAGES.map((skill) => (
                  <span key={skill.name} className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition-colors hover:bg-white/10">
                    <skill.icon className="h-4 w-4" style={{ color: skill.color }} />
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Hardware & Robotics</h4>
              <div className="flex flex-wrap gap-3">
                {HARDWARE.map((skill) => (
                  <span key={skill.name} className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition-colors hover:bg-white/10">
                    <skill.icon className="h-4 w-4" style={{ color: skill.color }} />
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Software & Tools</h4>
              <div className="flex flex-wrap gap-3">
                {SOFTWARE.map((skill) => (
                  <span key={skill.name} className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition-colors hover:bg-white/10">
                    <skill.icon className="h-4 w-4" style={{ color: skill.color }} />
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-lg">{value}</div>
    </div>
  );
}
