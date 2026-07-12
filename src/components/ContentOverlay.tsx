import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ContentOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/** Cubic-bezier that feels like a damped spring — fast attack, gentle settle. */
const SPRING_EASE = "cubic-bezier(.22,1,.36,1)";
const PANEL_DURATION_MS = 520;
const BACKDROP_DURATION_MS = 380;
const CONTENT_DELAY_MS = 200;

export function ContentOverlay({
  isOpen,
  onClose,
  title,
  children,
}: ContentOverlayProps) {
  // Controls whether the portal is mounted in the DOM at all.
  const [mounted, setMounted] = useState(false);
  // Controls the visual open/close state (drives CSS transitions).
  const [visible, setVisible] = useState(false);

  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  // ── Open ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      closingRef.current = false;
      setMounted(true);
      // Force a layout read so the browser registers the initial styles
      // before we flip to "visible" on the next frame.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    }
  }, [isOpen]);

  // ── Close (animated) ───────────────────────────────────────────────
  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);

    const timeout = setTimeout(() => {
      setMounted(false);
      onClose();
    }, PANEL_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [onClose]);

  // ── Escape key ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, handleClose]);

  // ── Body scroll lock ──────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const prev = document.body.style.cssText;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.cssText = prev;
    };
  }, [mounted]);

  if (!mounted) return null;

  // ── Inline styles ─────────────────────────────────────────────────
  const backdropStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 9998,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    opacity: visible ? 1 : 0,
    transition: `opacity ${BACKDROP_DURATION_MS}ms ${SPRING_EASE}`,
    willChange: "opacity",
  };

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    maxHeight: "92vh",
    background: "#000000",
    borderTop: "1px solid rgba(255, 255, 255, 0.15)",
    overflowY: "auto",
    transform: visible ? "translate3d(0, 0, 0)" : "translate3d(0, 100%, 0)",
    opacity: visible ? 1 : 0,
    transition: [
      `transform ${PANEL_DURATION_MS}ms ${SPRING_EASE}`,
      `opacity ${PANEL_DURATION_MS * 0.6}ms ease`,
    ].join(", "),
    willChange: "transform, opacity",
  };

  const contentInnerStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0, 0, 0)" : "translate3d(0, 16px, 0)",
    transition: [
      `opacity 420ms ${SPRING_EASE} ${CONTENT_DELAY_MS}ms`,
      `transform 420ms ${SPRING_EASE} ${CONTENT_DELAY_MS}ms`,
    ].join(", "),
    willChange: "opacity, transform",
  };

  const closeButtonStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 10,
    display: "flex",
    justifyContent: "flex-end",
    padding: "20px 20px 0",
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        style={backdropStyle}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div ref={panelRef} style={panelStyle} role="dialog" aria-modal="true">
        {/* Close button — sticky at top-right */}
        <div style={closeButtonStyle}>
          <button
            onClick={handleClose}
            className="cursor-pointer select-none border border-white/20 bg-black px-4 py-2 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
          >
            [X] Close
          </button>
        </div>

        {/* Content with delayed fade-in */}
        <div
          ref={contentRef}
          style={contentInnerStyle}
          className="px-5 pb-16 pt-6 sm:px-8 md:px-12"
        >
          {/* Title */}
          <h1
            className="mb-8 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:mb-10 md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h1>

          {/* Section content */}
          <div
            className="font-sans text-base leading-relaxed text-foreground/80"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
