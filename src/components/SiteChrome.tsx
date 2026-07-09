import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Instagram, Mail, Menu } from "lucide-react";

const NAV_ITEMS = [
  { to: "/about", label: "About" },
  { to: "/experience", label: "Experience" },
  { to: "/projects", label: "Projects" },
  { to: "/hobbies", label: "Hobbies" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteChrome({ name = "Sharvesh Kandavel" }: { name?: string }) {
  return (
    <>
      {/* Top-left brand pill */}
      <Link
        to="/"
        className="fixed left-4 top-4 z-50 rounded-full bg-white px-5 py-2.5 font-display text-base font-semibold text-background shadow-lg transition-transform hover:-translate-y-0.5 sm:left-6 sm:top-6 sm:text-lg"
      >
        {name}.
      </Link>

      {/* Top-right menu */}
      <button
        aria-label="Open menu"
        className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white text-background shadow-lg transition-transform hover:-translate-y-0.5 sm:right-6 sm:top-6 sm:h-12 sm:w-12"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Left vertical nav */}
      <nav className="fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-6 md:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="font-display text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom-left socials */}
      <div className="fixed bottom-5 left-4 z-40 flex items-center gap-3 sm:bottom-6 sm:left-6">
        <a
          href="https://github.com/SharveshKandavel"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-foreground/80 backdrop-blur transition hover:bg-white/16 hover:text-foreground"
        >
          <Github className="h-4 w-4" />
        </a>
        <a
          href="https://linkedin.com/in/sharveshkandavel/"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-foreground/80 backdrop-blur transition hover:bg-white/16 hover:text-foreground"
        >
          <Linkedin className="h-4 w-4" />
        </a>
        <a
          href="https://instagram.com/"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-foreground/80 backdrop-blur transition hover:bg-white/16 hover:text-foreground"
        >
          <Instagram className="h-4 w-4" />
        </a>
      </div>

      {/* Bottom-right email */}
      <a
        href="mailto:hello@example.com"
        className="pill fixed bottom-5 right-4 z-40 sm:bottom-6 sm:right-6"
      >
        <Mail className="h-4 w-4" />
        Email
      </a>
    </>
  );
}
