import React from "react";
import { render, screen, act } from "@testing-library/react";
import { SplashIntro } from "../components/SplashIntro";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("SplashIntro", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders intro when sessionStorage introPlayed is null", () => {
    render(<SplashIntro />);
    expect(screen.getByText("SHARVESH KANDAVEL")).toBeInTheDocument();
    expect(sessionStorage.getItem("introPlayed")).toBe("true");
  });

  it("does not render if introPlayed is already true", () => {
    sessionStorage.setItem("introPlayed", "true");
    const { container } = render(<SplashIntro />);
    expect(container.firstChild).toBeNull();
  });

  it("unmounts after 5.5 seconds", () => {
    const { container } = render(<SplashIntro />);
    expect(container.firstChild).not.toBeNull();

    // Fast-forward time by 5.5 seconds
    act(() => {
      vi.advanceTimersByTime(5500);
    });

    expect(container.firstChild).toBeNull();
  });
});
