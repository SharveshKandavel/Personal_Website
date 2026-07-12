import { useEffect, useRef } from "react";

/**
 * CustomCursor — a simple, smooth white circle with mix-blend-mode difference.
 * Morphs into a vertical stick when hovering over text.
 * Hidden on touch devices.
 */

const CURSOR_SIZE = 16;
const TEXT_SELECTORS = "p, span, h1, h2, h3, h4, h5, h6, li, blockquote, label, td, th";

const styles = {
  dot: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: CURSOR_SIZE,
    height: CURSOR_SIZE,
    borderRadius: "50%",
    background: "white",
    pointerEvents: "none" as const,
    zIndex: 99999,
    mixBlendMode: "difference" as const,
    willChange: "transform, width, height, border-radius",
    transition: "opacity 0.3s ease, width 0.2s ease, height 0.2s ease, border-radius 0.2s ease",
  },
};

function isTouchDevice() {
  if (typeof window === "undefined") return true;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });
  const rafId = useRef(0);
  const isVisible = useRef(false);
  const isText = useRef(false);

  useEffect(() => {
    if (isTouchDevice()) return;

    // Hide default cursor globally
    document.documentElement.style.cursor = "none";
    const styleTag = document.createElement("style");
    styleTag.textContent = `
      *, *::before, *::after { cursor: none !important; }
    `;
    document.head.appendChild(styleTag);

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!isVisible.current) {
        isVisible.current = true;
        if (dotRef.current) dotRef.current.style.opacity = "1";
      }

      // Check if hovering over text
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const hoveringText = target?.matches(TEXT_SELECTORS) ?? false;

      if (hoveringText !== isText.current) {
        isText.current = hoveringText;
        if (dotRef.current) {
          if (hoveringText) {
            dotRef.current.style.width = "2px";
            dotRef.current.style.height = "24px";
            dotRef.current.style.borderRadius = "2px";
          } else {
            dotRef.current.style.width = `${CURSOR_SIZE}px`;
            dotRef.current.style.height = `${CURSOR_SIZE}px`;
            dotRef.current.style.borderRadius = "50%";
          }
        }
      }
    };

    const onMouseLeave = () => {
      isVisible.current = false;
      if (dotRef.current) dotRef.current.style.opacity = "0";
    };

    const onMouseEnter = () => {
      isVisible.current = true;
      if (dotRef.current) dotRef.current.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    const animate = () => {
      rafId.current = requestAnimationFrame(animate);

      const dot = dotRef.current;
      if (!dot) return;

      // Smooth lerp
      current.current.x += (mouse.current.x - current.current.x) * 0.2;
      current.current.y += (mouse.current.y - current.current.y) * 0.2;

      // Adjust centering based on state
      const widthOffset = isText.current ? 1 : CURSOR_SIZE / 2;
      const heightOffset = isText.current ? 12 : CURSOR_SIZE / 2;

      dot.style.transform = `translate3d(${current.current.x - widthOffset}px, ${current.current.y - heightOffset}px, 0)`;
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(rafId.current);
      document.head.removeChild(styleTag);
      document.documentElement.style.cursor = "auto";
    };
  }, []);

  if (isTouchDevice()) return null;

  return <div ref={dotRef} style={{ ...styles.dot, opacity: 0 }} />;
}
