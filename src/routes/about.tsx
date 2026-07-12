import { useState } from "react";
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
import { OrbitingSkills } from "@/components/OrbitingSkills";

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
  const [viewMode, setViewMode] = useState<"orbit" | "grid">("orbit");

  return (
    <div className="bg-black relative min-h-screen text-white">
      <SiteChrome />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" /> Back to universe
        </Link>

        <h1 className="font-display text-5xl font-semibold sm:text-6xl">About.</h1>

        <div className="mt-8 space-y-4 text-lg text-white leading-relaxed max-w-2xl">
          <p>
            Hi, I'm a Mechatronics Engineering student at the University of Waterloo. I love working right at the point where hardware, software, and product design meet.
          </p>
          <p>
            I genuinely enjoy building systems that actually do something useful. Whether I'm working on fintech tools for moving money around, writing code for autonomous robots, or training data models, I just like bringing cool ideas to life.
          </p>
          <p>
            When I'm away from my computer, soccer is a huge part of my life. It's taught me a lot about teamwork and strategy over the years. I'll play pretty much any sport, and on my rest days you can usually find me watching anime or reading up on Marvel lore.
          </p>
          <p>
            Whether I'm playing on the field or writing a new piece of software, my mindset is always the same:{" "}
            <em className="text-white not-italic border-b border-white">
              always look for the open lane.
            </em>
          </p>
        </div>

        <div className="mt-8">
          <div className="inline-flex items-center gap-3 border border-white px-5 py-2.5 bg-white text-black font-mono text-sm uppercase tracking-widest font-bold">
            <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
            Seeking Fall 2026 Co-op
          </div>
        </div>

        <section className="mt-16 border-t border-white/20 pt-10">
          <h2 className="mb-8 font-display text-2xl font-semibold uppercase tracking-widest text-white">
            Education
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-display text-2xl font-semibold text-white">
                University of Waterloo
              </h3>
              <p className="mt-1 font-mono text-xs tracking-widest uppercase text-white/70">
                Bachelor of Applied Science in Mechatronics Engineering
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="border border-white/20 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white">
                  Presidential Scholarship
                </span>
              </div>
            </div>
            <div className="shrink-0 font-mono text-sm uppercase tracking-widest text-white sm:text-right">
              <p>Sept 2023 — Apr 2028</p>
              <p className="mt-1">Waterloo, ON</p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="font-display text-2xl font-semibold uppercase tracking-widest text-white">
              The Arsenal
            </h2>
            <div className="flex bg-black w-fit shadow-[0_8px_30px_rgba(255,255,255,0.3)]">
              <button
                onClick={() => setViewMode("orbit")}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${viewMode === "orbit" ? "bg-white text-black font-bold" : "text-white hover:text-white"}`}
              >
                Orbit
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${viewMode === "grid" ? "bg-white text-black font-bold" : "text-white hover:text-white"}`}
              >
                Grid
              </button>
            </div>
          </div>

          {viewMode === "orbit" ? (
            <div className="relative aspect-square w-full max-w-[500px] mx-auto bg-black">
              <OrbitingSkills />
            </div>
          ) : (
            <div className="flex flex-col gap-6 bg-black p-6">
              <div>
                <h4 className="mb-4 text-[10px] font-mono font-bold uppercase tracking-widest text-white/50">
                  Languages
                </h4>
                <div className="flex flex-wrap gap-4">
                  {LANGUAGES.map((skill) => (
                    <span
                      key={skill.name}
                      className="flex flex-col items-center gap-2 bg-transparent p-2 text-xs font-mono text-white transition-all hover:scale-110"
                    >
                      <skill.icon className="h-6 w-6" style={{ color: skill.color }} />
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-4 text-[10px] font-mono font-bold uppercase tracking-widest text-white/50">
                  Hardware & Robotics
                </h4>
                <div className="flex flex-wrap gap-4">
                  {HARDWARE.map((skill) => (
                    <span
                      key={skill.name}
                      className="flex flex-col items-center gap-2 bg-transparent p-2 text-xs font-mono text-white transition-all hover:scale-110"
                    >
                      <skill.icon className="h-6 w-6" style={{ color: skill.color }} />
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-4 text-[10px] font-mono font-bold uppercase tracking-widest text-white/50">
                  Software & Tools
                </h4>
                <div className="flex flex-wrap gap-4">
                  {SOFTWARE.map((skill) => (
                    <span
                      key={skill.name}
                      className="flex flex-col items-center gap-2 bg-transparent p-2 text-xs font-mono text-white transition-all hover:scale-110"
                    >
                      <skill.icon className="h-6 w-6" style={{ color: skill.color }} />
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 border border-white/20 bg-black p-6 transition-colors hover:border-white/50">
      <span className="font-mono text-xs uppercase tracking-widest text-white">{label}</span>
      <span className="font-display text-xl font-medium text-white">{value}</span>
    </div>
  );
}
