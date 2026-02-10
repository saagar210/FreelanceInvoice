import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input, TextArea } from "./Input";

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("renders without label", () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByPlaceholderText("Type here")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<Input label="Email" error="Required field" />);
    expect(screen.getByText("Required field")).toBeInTheDocument();
  });

  it("applies error styling", () => {
    render(<Input label="Email" error="Invalid" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveClass("border-danger-500");
  });

  it("accepts user input", async () => {
    render(<Input label="Name" />);
    const input = screen.getByLabelText("Name");
    await userEvent.type(input, "John Doe");
    expect(input).toHaveValue("John Doe");
  });

  it("generates id from label", () => {
    render(<Input label="First Name" />);
    const input = screen.getByLabelText("First Name");
    expect(input).toHaveAttribute("id", "first-name");
  });
});

describe("TextArea", () => {
  it("renders with label", () => {
    render(<TextArea label="Notes" />);
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<TextArea label="Notes" error="Too long" />);
    expect(screen.getByText("Too long")).toBeInTheDocument();
  });

  it("accepts user input", async () => {
    render(<TextArea label="Description" />);
    const textarea = screen.getByLabelText("Description");
    await userEvent.type(textarea, "Some text");
    expect(textarea).toHaveValue("Some text");
  });
});
