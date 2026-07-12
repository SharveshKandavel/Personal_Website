import { Github, Linkedin, Mail, FileDown } from "lucide-react";

export function SiteHUD() {
  return (
    <>
      {/* Top-left brand pill */}
      <div className="fixed left-4 top-4 z-[90] sm:left-6 sm:top-6">
        <div className="flex items-center gap-3 border border-white/20 bg-black px-5 py-2.5 font-display text-base font-semibold text-white shadow-lg transition-all hover:bg-white hover:text-black sm:text-lg uppercase tracking-widest cursor-default">
          Sharvesh Kandavel.
        </div>
      </div>

      {/* Top-right socials & links */}
      <div className="fixed right-4 top-4 z-[90] flex items-center gap-2 sm:right-6 sm:top-6">
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noreferrer"
          aria-label="Resume"
          className="flex h-11 items-center justify-center gap-2 border border-white/20 bg-black px-4 text-sm font-mono uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-white hover:text-black"
        >
          <FileDown className="h-4 w-4" />
          <span className="hidden sm:inline">Resume</span>
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
        <a
          href="mailto:skandave@uwaterloo.ca"
          aria-label="Email"
          className="flex h-11 items-center justify-center gap-2 border border-white/20 bg-black px-4 text-sm font-mono uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-white hover:text-black"
        >
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Contact</span>
        </a>
      </div>
    </>
  );
}
