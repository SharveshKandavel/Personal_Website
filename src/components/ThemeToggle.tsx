import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // Check initial state
    if (document.documentElement.classList.contains("light-mode")) {
      setIsLight(true);
    }
  }, []);

  const toggle = () => {
    if (isLight) {
      document.documentElement.classList.remove("light-mode");
      setIsLight(false);
    } else {
      document.documentElement.classList.add("light-mode");
      setIsLight(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className="flex h-11 w-11 items-center justify-center border border-white/20 bg-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-white hover:text-black z-[100]"
      aria-label="Toggle theme"
    >
      {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}
