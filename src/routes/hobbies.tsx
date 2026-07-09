import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { ArrowLeft, Star } from "lucide-react";

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
          <div className="relative rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-2xl font-semibold">Soccer</h3>
            <p className="mt-2 text-sm text-foreground/85">
              Striker. Reading the pitch, timing the run, finishing the chance —
              the same instincts I bring to building products.
            </p>
          </div>
          <div className="relative rounded-2xl border border-border bg-card p-6">
            <Star className="absolute right-6 top-6 h-5 w-5 text-yellow-500 fill-yellow-500" />
            <h3 className="font-display text-2xl font-semibold pr-8">Late-Night Discourses</h3>
            <p className="mt-2 text-sm text-foreground/85">
              Nothing beats exchanging ideas, debating perspectives, and just talking about life with friends. 
            </p>
          </div>
          <div className="relative rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-2xl font-semibold">Travel</h3>
            <p className="mt-2 text-sm text-foreground/85">
              New cities, new food, new perspectives. Every trip changes how I
              think.
            </p>
          </div>
          <div className="relative rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-2xl font-semibold">Tinkering</h3>
            <p className="mt-2 text-sm text-foreground/85">
              Weekend hardware experiments — because the best way to learn is to
              take something apart and put it back together.
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          <Star className="inline h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
          Star is something most favourite.
        </p>
      </main>
    </div>
  );
}
