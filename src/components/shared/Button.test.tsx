import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByText("Click"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables when loading", () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByText("Save").closest("button")).toBeDisabled();
  });

  it("disables when disabled prop is set", () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByText("Save").closest("button")).toBeDisabled();
  });

  it("renders different variants", () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText("Primary").closest("button")).toHaveClass(
      "bg-primary-600"
    );

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByText("Danger").closest("button")).toHaveClass(
      "bg-danger-600"
    );
  });

  it("renders different sizes", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByText("Small").closest("button")).toHaveClass("px-3");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText("Large").closest("button")).toHaveClass("px-6");
  });

  it("shows loading spinner when loading", () => {
    render(<Button loading>Save</Button>);
    const svg = screen
      .getByText("Save")
      .closest("button")
      ?.querySelector("svg");
    expect(svg).toHaveClass("animate-spin");
  });
});
