import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function Hero({
  name = "Sharvesh Kandavel",
  tagline = "Mechatronics @ Waterloo. I code, I solve, I build, I score.",
  statusChip,
}: {
  name?: string;
  tagline?: string;
  statusChip?: string;
}) {
  return (
    <section className="aurora-bg relative flex min-h-screen w-full flex-col items-center justify-center px-6 pb-32 pt-24 text-center">
      <h1 className="max-w-5xl font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl md:text-8xl">
        Hi, I&apos;m {name}.
      </h1>

      <p className="mt-6 max-w-2xl font-display text-lg italic text-foreground/85 sm:text-2xl">
        {tagline}
      </p>


      {/* Center-bottom status chip */}
      {statusChip && (
        <div className="pill absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:inline-flex">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
          {statusChip}
        </div>
      )}

      {/* Scroll cue */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:bottom-28">
        Scroll to explore my universe ↓
      </div>
    </section>
  );
}
