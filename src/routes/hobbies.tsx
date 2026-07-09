import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/hobbies")({
  head: () => ({
    meta: [
      { title: "Hobbies — Sharvesh Kandavel" },
      {
        name: "description",
        content: "Off the keyboard: striker on the soccer pitch, music, travel.",
      },
      { property: "og:title", content: "Hobbies — Sharvesh Kandavel" },
      {
        property: "og:description",
        content: "Off the keyboard: striker on the soccer pitch, music, travel.",
      },
      { property: "og:url", content: "/hobbies" },
    ],
    links: [{ rel: "canonical", href: "/hobbies" }],
  }),
  component: HobbiesPage,
});

function HobbiesPage() {
  return (
    <div className="aurora-bg relative min-h-screen">
      <SiteChrome />
      <main className="mx-auto max-w-3xl px-6 py-32">
        <Link to="/" className="pill mb-10 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to universe
        </Link>

        <h1 className="font-display text-5xl font-semibold sm:text-6xl">Hobbies.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Life outside the terminal.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="text-4xl">⚽</div>
            <h3 className="mt-4 font-display text-2xl font-semibold">Soccer</h3>
            <p className="mt-2 text-sm text-foreground/85">
              Striker. Reading the pitch, timing the run, finishing the chance —
              the same instincts I bring to building products.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="text-4xl">🎧</div>
            <h3 className="mt-4 font-display text-2xl font-semibold">Music</h3>
            <p className="mt-2 text-sm text-foreground/85">
              Always something in the ears while coding — the rhythm keeps the
              flow going.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="text-4xl">🌍</div>
            <h3 className="mt-4 font-display text-2xl font-semibold">Travel</h3>
            <p className="mt-2 text-sm text-foreground/85">
              New cities, new food, new perspectives. Every trip changes how I
              think.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="text-4xl">🛠️</div>
            <h3 className="mt-4 font-display text-2xl font-semibold">Tinkering</h3>
            <p className="mt-2 text-sm text-foreground/85">
              Weekend hardware experiments — because the best way to learn is to
              take something apart and put it back together.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
