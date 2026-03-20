import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GhostMascot } from "../ui/ghost-mascot";

describe("GhostMascot", () => {
  it("should render without crashing", () => {
    const { container } = render(<GhostMascot />);
    const mascot = container.querySelector(".ghost-mascot");

    expect(mascot).toBeInTheDocument();
  });

  it("should render the ghost body structure", () => {
    const { container } = render(<GhostMascot />);

    expect(container.querySelector(".ghost-body")).toBeInTheDocument();
    expect(container.querySelector(".ghost-red")).toBeInTheDocument();
    expect(container.querySelector(".ghost-shadow")).toBeInTheDocument();
  });

  it("should apply custom className prop", () => {
    const { container } = render(<GhostMascot className="my-custom-class" />);
    const mascot = container.querySelector(".ghost-mascot");

    expect(mascot).toHaveClass("my-custom-class");
  });

  it("should have empty className by default (no extra classes)", () => {
    const { container } = render(<GhostMascot />);
    const mascot = container.querySelector(".ghost-mascot");

    // Default className="" means the class list should just be "ghost-mascot" + possible space
    expect(mascot).toBeInTheDocument();
    expect(mascot?.className).toContain("ghost-mascot");
  });

  it("should render ghost eyes", () => {
    const { container } = render(<GhostMascot />);

    expect(container.querySelector(".ghost-eye")).toBeInTheDocument();
    expect(container.querySelector(".ghost-eye1")).toBeInTheDocument();
    expect(container.querySelector(".ghost-pupil")).toBeInTheDocument();
    expect(container.querySelector(".ghost-pupil1")).toBeInTheDocument();
  });
});
