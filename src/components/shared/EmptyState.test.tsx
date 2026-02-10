import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState title="No clients" description="Add your first client" />
    );
    expect(screen.getByText("No clients")).toBeInTheDocument();
    expect(screen.getByText("Add your first client")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    render(
      <EmptyState
        title="No data"
        description="Get started"
        actionLabel="Add New"
        onAction={vi.fn()}
      />
    );
    expect(screen.getByText("Add New")).toBeInTheDocument();
  });

  it("calls onAction when button clicked", async () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="Empty"
        description="Nothing here"
        actionLabel="Create"
        onAction={onAction}
      />
    );
    await userEvent.click(screen.getByText("Create"));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("does not render button without actionLabel", () => {
    render(<EmptyState title="Empty" description="Nothing" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
