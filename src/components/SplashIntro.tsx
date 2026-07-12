import { useEffect, useState } from "react";

export function SplashIntro() {
  const [visible, setVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("introPlayed");
    }
    return true;
  });

  useEffect(() => {
    if (!visible) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("introPlayed", "true");
    }
    const t = setTimeout(() => {
      setVisible(false);
    }, 5500);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#f0f5fa]"
      style={{
        animation: "fadeOut 0.8s ease forwards",
        animationDelay: "4.7s",
      }}
    >
      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="relative z-10 text-center px-4">
        <h1
          className="font-display text-3xl font-bold tracking-[0.2em] uppercase text-black sm:text-5xl md:text-6xl"
          style={{
            animation: "scaleIn 1s cubic-bezier(.22,1,.36,1) forwards",
            animationDelay: "0.2s",
            opacity: 0,
          }}
        >
          SHARVESH KANDAVEL
        </h1>
        <p
          className="mx-auto mt-6 max-w-2xl text-sm text-black/70 sm:text-base font-mono leading-relaxed tracking-widest uppercase"
          style={{
            animation: "slideUpFade 0.8s ease forwards",
            animationDelay: "0.8s",
            opacity: 0,
          }}
        >
          Mechatronics Engineer building at the intersection of <br className="hidden sm:block" />{" "}
          hardware, software, and bold ideas.
        </p>
      </div>

      <div
        className="absolute bottom-16 z-10 flex flex-col items-center gap-4 text-center"
        style={{ animation: "slideUpFade 0.8s ease forwards", animationDelay: "1.8s", opacity: 0 }}
      >
        <p className="font-display text-lg tracking-widest text-black/80 uppercase">
          Welcome to my world.
        </p>
      </div>
    </div>
  );
}
