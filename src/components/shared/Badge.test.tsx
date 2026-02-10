import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge, StatusBadge } from "./Badge";

describe("Badge", () => {
  it("renders with default variant", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("renders success variant", () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  it("renders danger variant", () => {
    render(<Badge variant="danger">Error</Badge>);
    expect(screen.getByText("Error")).toBeInTheDocument();
  });
});

describe("StatusBadge", () => {
  it("renders draft status", () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText("draft")).toBeInTheDocument();
  });

  it("renders paid status", () => {
    render(<StatusBadge status="paid" />);
    expect(screen.getByText("paid")).toBeInTheDocument();
  });

  it("renders on_hold status with space", () => {
    render(<StatusBadge status="on_hold" />);
    expect(screen.getByText("on hold")).toBeInTheDocument();
  });
});
