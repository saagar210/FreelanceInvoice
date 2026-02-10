import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "./DataTable";

interface TestItem {
  id: string;
  name: string;
  value: number;
}

const columns = [
  { key: "name", header: "Name", render: (item: TestItem) => item.name },
  {
    key: "value",
    header: "Value",
    render: (item: TestItem) => `$${item.value}`,
  },
];

const data: TestItem[] = [
  { id: "1", name: "Alpha", value: 100 },
  { id: "2", name: "Beta", value: 200 },
];

describe("DataTable", () => {
  it("renders headers", () => {
    render(
      <DataTable columns={columns} data={data} keyExtractor={(i) => i.id} />
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Value")).toBeInTheDocument();
  });

  it("renders data rows", () => {
    render(
      <DataTable columns={columns} data={data} keyExtractor={(i) => i.id} />
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("$200")).toBeInTheDocument();
  });

  it("shows empty message when no data", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        keyExtractor={(i: TestItem) => i.id}
        emptyMessage="Nothing here"
      />
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("shows default empty message", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        keyExtractor={(i: TestItem) => i.id}
      />
    );
    expect(screen.getByText("No data found")).toBeInTheDocument();
  });

  it("calls onRowClick", async () => {
    const onClick = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(i) => i.id}
        onRowClick={onClick}
      />
    );
    await userEvent.click(screen.getByText("Alpha"));
    expect(onClick).toHaveBeenCalledWith(data[0]);
  });
});
