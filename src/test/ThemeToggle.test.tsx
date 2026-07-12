import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "../components/ThemeToggle";
import { describe, it, expect, beforeEach } from "vitest";

describe("ThemeToggle", () => {
  beforeEach(() => {
    // Clear any classes on document element before each test
    document.documentElement.className = "";
  });

  it("renders correctly", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it("toggles theme when clicked", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    // Initially not light mode
    expect(document.documentElement.classList.contains("light-mode")).toBe(false);

    // Click to toggle
    fireEvent.click(button);
    expect(document.documentElement.classList.contains("light-mode")).toBe(true);

    // Click again to toggle back
    fireEvent.click(button);
    expect(document.documentElement.classList.contains("light-mode")).toBe(false);
  });
});
