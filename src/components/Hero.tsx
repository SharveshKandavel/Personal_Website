import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function Hero({
  name = "Your Name",
  tagline = "Mechatronics @ Waterloo. I code, I solve, I build, I score.",
  currentlyLabel = "Currently: Building at Credvan",
  buildingChip = "Currently building ⚙ Credvan",
}: {
  name?: string;
  tagline?: string;
  currentlyLabel?: string;
  buildingChip?: string;
}) {
  return (
    <section className="aurora-bg relative flex min-h-screen w-full flex-col items-center justify-center px-6 pb-32 pt-24 text-center">
      <h1 className="max-w-5xl font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl md:text-8xl">
        Hi, I&apos;m {name}.
      </h1>

      <p className="mt-6 max-w-2xl font-display text-lg italic text-foreground/85 sm:text-2xl">
        {tagline}
      </p>

      <p className="mt-5 text-sm text-muted-foreground sm:text-base">
        {currentlyLabel}
      </p>

      <Link
        to="/about"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-background shadow-xl transition-transform hover:-translate-y-0.5"
      >
        About Me
        <ArrowRight className="h-4 w-4" />
      </Link>

      {/* Center-bottom building chip */}
      <div className="pill absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:inline-flex">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
        {buildingChip}
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:bottom-28">
        Scroll to explore my universe ↓
      </div>
    </section>
  );
}
