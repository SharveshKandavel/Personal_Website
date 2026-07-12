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
    <div className="bg-black relative min-h-screen text-white">
      <SiteChrome />
      <main className="mx-auto max-w-3xl px-6 py-32">
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2 border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" /> Back to universe
        </Link>

        <h1 className="font-display text-5xl font-semibold sm:text-6xl">Hobbies.</h1>
        <p className="mt-4 text-lg text-white mb-12">Life outside the terminal.</p>

        <div className="flex flex-col gap-6 sm:grid sm:grid-cols-2">
          <div className="group border border-white/20 bg-black p-6 transition-colors hover:border-white/50">
            <h3 className="font-display text-2xl font-semibold text-white">Soccer</h3>
            <p className="mt-4 text-white leading-relaxed">
              Striker. Reading the pitch, timing the run, finishing the chance — the same instincts
              I bring to building products.
            </p>
          </div>
          <div className="group relative border border-white/20 bg-black p-6 transition-colors hover:border-white/50">
            <Star className="absolute right-6 top-6 h-5 w-5 text-white fill-white" />
            <h3 className="font-display text-2xl font-semibold pr-8 text-white">
              Late-Night Discourses
            </h3>
            <p className="mt-4 text-white leading-relaxed">
              Nothing beats exchanging ideas, debating perspectives, and just talking about life
              with friends.
            </p>
          </div>
          <div className="group border border-white/20 bg-black p-6 transition-colors hover:border-white/50">
            <h3 className="font-display text-2xl font-semibold text-white">Travel</h3>
            <p className="mt-4 text-white leading-relaxed">
              New cities, new food, new perspectives. Every trip changes how I think.
            </p>
          </div>
          <div className="group border border-white/20 bg-black p-6 transition-colors hover:border-white/50">
            <h3 className="font-display text-2xl font-semibold text-white">Tinkering</h3>
            <p className="mt-4 text-white leading-relaxed">
              Weekend hardware experiments — because the best way to learn is to take something
              apart and put it back together.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
