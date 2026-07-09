import { Link } from "@tanstack/react-router";
import islandImg from "@/assets/universe-island.png";

/**
 * Landmark hotspots — positions in % relative to the island image.
 * Tuned to the generated 1536x1024 render.
 */
const LANDMARKS = [
  { to: "/about", label: "About →", top: "38%", left: "27%", w: "22%", h: "34%" },
  { to: "/experience", label: "Experience →", top: "30%", left: "54%", w: "18%", h: "34%" },
  { to: "/projects", label: "Projects →", top: "44%", left: "78%", w: "20%", h: "34%" },
  { to: "/hobbies", label: "Hobbies →", top: "66%", left: "27%", w: "26%", h: "24%" },
  { to: "/contact", label: "Contact →", top: "75%", left: "82%", w: "10%", h: "22%" },
] as const;

export function Universe() {
  return (
    <section
      id="universe"
      aria-label="My universe"
      className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-16 sm:py-24"
    >
      <div className="mb-6 text-center sm:mb-10">
        <p className="pill mx-auto mb-4 !bg-white/8">Explore my universe</p>
        <h2 className="font-display text-3xl font-semibold sm:text-5xl">
          Hover a landmark. Click to enter.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          Each corner of the island is a piece of what I do. Follow the road.
        </p>
      </div>

      <div className="relative w-full">
        <img
          src={islandImg}
          alt="Isometric island of my personal universe"
          width={1536}
          height={1024}
          loading="lazy"
          className="pointer-events-none relative z-10 w-full select-none"
          draggable={false}
        />

        {/* Roaming car overlay — moves in a loose loop over the road */}
        <div className="pointer-events-none absolute left-[42%] top-[62%] z-20 h-3 w-6 rounded-sm bg-accent shadow-[0_0_20px_rgba(220,120,60,0.7)] car-roam" />

        {/* Landmark hotspots */}
        {LANDMARKS.map((lm) => (
          <Link
            key={lm.to}
            to={lm.to}
            className="landmark z-30"
            style={{
              top: lm.top,
              left: lm.left,
              width: lm.w,
              height: lm.h,
            }}
            aria-label={lm.label}
          >
            <span className="landmark-label font-display">{lm.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
