import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Mail, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

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
        className="fixed left-4 top-4 z-50 flex items-center gap-3 border border-white/20 bg-black px-5 py-2.5 font-display text-base font-semibold text-white shadow-lg transition-all hover:bg-white hover:text-black sm:left-6 sm:top-6 sm:text-lg uppercase tracking-widest"
      >
        {name}.
      </Link>

      {/* Left vertical nav */}
      <nav className="fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-6 md:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="font-display text-lg font-medium text-white transition-colors hover:text-white"
            activeProps={{ className: "text-white" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom-left socials */}
      <div className="fixed bottom-5 left-4 z-40 flex items-center gap-3 sm:bottom-6 sm:left-6">
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noreferrer"
          aria-label="Resume"
          className="flex h-11 items-center justify-center gap-2 border border-white/20 bg-black px-4 text-sm font-mono uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-white hover:text-black"
        >
          Resume
        </a>
        <a
          href="https://github.com/SharveshKandavel"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className="flex h-11 w-11 items-center justify-center border border-white/20 bg-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-white hover:text-black"
        >
          <Github className="h-5 w-5" />
        </a>
        <a
          href="https://linkedin.com/in/sharveshkandavel/"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
          className="flex h-11 w-11 items-center justify-center border border-white/20 bg-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-white hover:text-black"
        >
          <Linkedin className="h-5 w-5" />
        </a>
      </div>

      {/* Bottom-right theme toggle and email */}
      <div className="fixed bottom-5 right-4 z-40 flex items-center gap-2 sm:bottom-6 sm:right-6">
        <ThemeToggle />
        <a
          href="mailto:skandave@uwaterloo.ca"
          className="flex h-11 items-center justify-center gap-2 border border-white/20 bg-black px-4 text-sm font-mono uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-white hover:text-black"
        >
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Email</span>
        </a>
      </div>
    </>
  );
}
