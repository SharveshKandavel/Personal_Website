import { useEffect, useRef, useState, useCallback, type ComponentType, type SVGProps } from "react";
import { Database, Cpu, Settings, Box, Layers, Wrench, type LucideProps } from "lucide-react";
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

/* ─── Types ─────────────────────────────────────────────────────────── */

type IconComponent =
  | ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>
  | ComponentType<LucideProps>;

interface Skill {
  name: string;
  icon: IconComponent;
  color: string;
}

interface RingDef {
  skills: Skill[];
  duration: string;
  /** Diameter as % of container width — 100 = full container */
  diameterPct: number;
}

/* ─── Data ──────────────────────────────────────────────────────────── */

const RINGS: RingDef[] = [
  {
    duration: "6s",
    diameterPct: 40,
    skills: [
      { name: "C++", icon: SiCplusplus, color: "#00599C" },
      { name: "Python", icon: SiPython, color: "#3776AB" },
      { name: "React", icon: SiReact, color: "#61DAFB" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
    ],
  },
  {
    duration: "10s",
    diameterPct: 70,
    skills: [
      { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
      { name: "HTML/CSS", icon: SiHtml5, color: "#E34F26" },
      { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
      { name: "FastAPI", icon: SiFastapi, color: "#009688" },
      { name: "Three.js", icon: SiThreedotjs, color: "#ffffff" },
    ],
  },
  {
    duration: "16s",
    diameterPct: 100,
    skills: [
      { name: "SolidWorks", icon: Wrench, color: "#E3242B" },
      { name: "ROS2", icon: SiRos, color: "#22314E" },
      { name: "Arduino", icon: SiArduino, color: "#00979D" },
      { name: "Sensors", icon: Cpu, color: "#A0AAB4" },
      { name: "PID Control", icon: Settings, color: "#A0AAB4" },
      { name: "3D Printing", icon: Box, color: "#F05032" },
      { name: "Git", icon: SiGit, color: "#F05032" },
      { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4" },
      { name: "Convex", icon: Layers, color: "#FF8C00" },
      { name: "SQL", icon: Database, color: "#4479A1" },
    ],
  },
];

const ALL_SKILLS = RINGS.flatMap((r) => r.skills);

/* ─── Injected keyframes ────────────────────────────────────────────── */

const STYLE_ID = "orbiting-skills-kf";

function ensureKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
    @keyframes os-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes os-counter {
      from { transform: translate(-50%,-50%) rotate(0deg); }
      to   { transform: translate(-50%,-50%) rotate(-360deg); }
    }
    @keyframes os-float {
      0%,100% { transform: translateY(0); }
      50%     { transform: translateY(-6px); }
    }
  `;
  document.head.appendChild(el);
}

/* ─── Hooks ─────────────────────────────────────────────────────────── */

function useIsMobile(bp = 768) {
  const [m, setM] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    const h = () => setM(mq.matches);
    h();
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [bp]);
  return m;
}

/* ─── Pill styling helpers ──────────────────────────────────────────── */

const iconBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.5rem",
  borderRadius: "50%",
  background: "transparent",
  cursor: "default",
  transition: "transform 250ms ease, box-shadow 250ms ease, background 250ms ease",
};

/* ─── SkillPill ─────────────────────────────────────────────────────── */

function SkillPill({
  skill,
  angle,
  duration,
  ringIdx,
  skillIdx,
  mounted,
  paused,
  onEnter,
  onLeave,
}: {
  skill: Skill;
  angle: number;
  duration: string;
  ringIdx: number;
  skillIdx: number;
  mounted: boolean;
  paused: boolean;
  onEnter: (i: number) => void;
  onLeave: () => void;
}) {
  const delay = ringIdx * 180 + skillIdx * 70;

  // Place on the perimeter of the ring container
  const rad = (angle * Math.PI) / 180;
  const xPct = 50 + 50 * Math.cos(rad);
  const yPct = 50 + 50 * Math.sin(rad);

  return (
    <div
      style={{
        position: "absolute",
        left: `${xPct}%`,
        top: `${yPct}%`,
        animation: `os-counter ${duration} linear infinite`,
        animationPlayState: paused ? "paused" : "running",
        zIndex: 5,
        opacity: mounted ? 1 : 0,
        transition: `opacity 400ms ${delay}ms ease`,
      }}
      onMouseEnter={() => onEnter(ringIdx)}
      onMouseLeave={onLeave}
    >
      <span
        style={{
          ...iconBase,
          transform: mounted
            ? "scale(1)"
            : "scale(0)",
          transitionDelay: `${delay}ms`,
        }}
        onMouseEnter={(e) => {
          const t = e.currentTarget;
          t.style.transform = "scale(1.2)";
          t.style.background = "rgba(255,255,255,0.1)";
          t.style.boxShadow = `0 0 20px ${skill.color}80`;
        }}
        onMouseLeave={(e) => {
          const t = e.currentTarget;
          t.style.transform = "scale(1)";
          t.style.background = "transparent";
          t.style.boxShadow = "none";
        }}
      >
        <skill.icon style={{ width: 24, height: 24, color: skill.color }} />
      </span>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────── */

export function OrbitingSkills() {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const [hoveredRing, setHoveredRing] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => { ensureKeyframes(); }, []);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Mouse parallax
  useEffect(() => {
    if (isMobile || typeof window === "undefined") return;

    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      targetRef.current.x = ((e.clientX - cx) / (r.width / 2)) * 10;
      targetRef.current.y = ((e.clientY - cy) / (r.height / 2)) * 10;
    };

    const tick = () => {
      const c = currentRef.current;
      const t = targetRef.current;
      c.x += (t.x - c.x) * 0.07;
      c.y += (t.y - c.y) * 0.07;

      const el = containerRef.current;
      if (el) {
        el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile]);

  const onRingEnter = useCallback((i: number) => setHoveredRing(i), []);
  const onRingLeave = useCallback(() => setHoveredRing(null), []);

  /* ── Mobile ── */
  if (isMobile) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", justifyContent: "center", padding: "1.5rem 0" }}>
        {ALL_SKILLS.map((skill, i) => (
          <span
            key={skill.name}
            style={{
              ...iconBase,
              animation: mounted ? `os-float ${3 + (i % 4) * 0.7}s ${i * 0.15}s ease-in-out infinite` : "none",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0) scale(1)" : "translateY(12px) scale(0.85)",
              transition: `opacity 400ms ${i * 40}ms ease, transform 400ms ${i * 40}ms ease`,
            }}
          >
            <skill.icon style={{ width: 24, height: 24, color: skill.color }} />
          </span>
        ))}
      </div>
    );
  }

  /* ── Desktop ── */
  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 620,
        aspectRatio: "1 / 1",
        margin: "0 auto",
        willChange: "transform",
      }}
    >
      {/* ── Core ── */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 10, pointerEvents: "none" }}>
        <div
          style={{
            position: "relative",
            width: 80,
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            fontWeight: "bold",
            letterSpacing: "0.2em",
            color: "white",
            background: "black",
            border: "1px solid rgba(0,255,255,0.5)",
            boxShadow: "0 0 30px rgba(0,255,255,0.2)",
          }}
        >
          {/* Target crosshairs */}
          <div style={{ position: "absolute", top: -8, left: "50%", width: 1, height: 16, background: "rgba(0,255,255,0.5)" }} />
          <div style={{ position: "absolute", bottom: -8, left: "50%", width: 1, height: 16, background: "rgba(0,255,255,0.5)" }} />
          <div style={{ position: "absolute", left: -8, top: "50%", width: 16, height: 1, background: "rgba(0,255,255,0.5)" }} />
          <div style={{ position: "absolute", right: -8, top: "50%", width: 16, height: 1, background: "rgba(0,255,255,0.5)" }} />
          STACK
        </div>
      </div>

      {/* ── Rings ── */}
      {RINGS.map((ring, ringIdx) => {
        const size = `${ring.diameterPct}%`;
        const paused = hoveredRing === ringIdx;

        return (
          <div key={ringIdx}>
            {/* Track circle */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: size,
                height: size,
                borderRadius: "50%",
                border: `1px dashed ${ringIdx === 0 ? "rgba(0,255,255,0.25)" : ringIdx === 1 ? "rgba(255,0,255,0.25)" : "rgba(255,150,0,0.25)"}`,
                transform: "translate(-50%,-50%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "absolute",
                top: `calc(50% - ${ring.diameterPct / 2}%)`,
                left: `calc(50% - ${ring.diameterPct / 2}%)`,
                width: size,
                height: size,
                pointerEvents: "none",
              }}
            >
              {/* Spinning layer */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  animation: `os-spin ${ring.duration} linear infinite`,
                  animationPlayState: paused ? "paused" : "running",
                }}
              >
                {ring.skills.map((skill, skillIdx) => {
                  const angle = (360 / ring.skills.length) * skillIdx - 90;
                  return (
                    <SkillPill
                      key={skill.name}
                      skill={skill}
                      angle={angle}
                      duration={ring.duration}
                      ringIdx={ringIdx}
                      skillIdx={skillIdx}
                      mounted={mounted}
                      paused={paused}
                      onEnter={onRingEnter}
                      onLeave={onRingLeave}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
