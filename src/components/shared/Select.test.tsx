import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "./Select";

const options = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
  { value: "c", label: "Option C" },
];

describe("Select", () => {
  it("renders with label", () => {
    render(<Select label="Status" options={options} />);
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
  });

  it("renders all options", () => {
    render(<Select label="Pick" options={options} />);
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
    expect(screen.getByText("Option C")).toBeInTheDocument();
  });

  it("renders placeholder option", () => {
    render(<Select label="Pick" options={options} placeholder="Choose one" />);
    expect(screen.getByText("Choose one")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<Select label="Pick" options={options} error="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("allows selection", async () => {
    render(<Select label="Pick" options={options} />);
    const select = screen.getByLabelText("Pick");
    await userEvent.selectOptions(select, "b");
    expect(select).toHaveValue("b");
  });
});
