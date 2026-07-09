import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { ArrowLeft } from "lucide-react";

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

function AboutPage() {
  return (
    <div className="aurora-bg relative min-h-screen">
      <SiteChrome />
      <main className="mx-auto max-w-3xl px-6 py-32">
        <Link
          to="/"
          className="pill mb-10 inline-flex"
        >
          <ArrowLeft className="h-4 w-4" /> Back to universe
        </Link>

        <h1 className="font-display text-5xl font-semibold sm:text-6xl">About.</h1>

        <div className="mt-8 space-y-6 text-lg text-foreground/85">
          <p>
            Hi — I&apos;m a <strong>Mechatronics Engineering</strong> student at the{" "}
            <strong>University of Waterloo</strong>, and a Presidential Scholar. I sit
            at the intersection of hardware, software, and product.
          </p>
          <p>
            I love building things that solve real problems — from fintech tools that
            move money, to robots that see and sort, to models that learn from data.
          </p>
          <p>
            Off the keyboard, I&apos;m a striker on the soccer pitch. On or off it,
            I&apos;m looking for the open lane.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Stat label="Degree" value="Mechatronics · Waterloo" />
          <Stat label="Recognition" value="Presidential Scholarship" />
          <Stat label="Currently" value="Building at Credvan" />
          <Stat label="Off the desk" value="Striker · Soccer" />
        </div>
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
