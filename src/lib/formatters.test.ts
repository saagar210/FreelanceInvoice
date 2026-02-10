import { describe, it, expect } from "vitest";
import {
  formatDuration,
  formatHours,
  formatCurrency,
} from "./formatters";

describe("formatDuration", () => {
  it("formats seconds only", () => {
    expect(formatDuration(45)).toBe("00:45");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(125)).toBe("02:05");
  });

  it("formats hours, minutes, seconds", () => {
    expect(formatDuration(3661)).toBe("1:01:01");
  });

  it("formats zero", () => {
    expect(formatDuration(0)).toBe("00:00");
  });

  it("formats large hours", () => {
    expect(formatDuration(36000)).toBe("10:00:00");
  });
});

describe("formatHours", () => {
  it("converts seconds to hours with one decimal", () => {
    expect(formatHours(3600)).toBe("1.0h");
    expect(formatHours(5400)).toBe("1.5h");
    expect(formatHours(0)).toBe("0.0h");
  });
});

describe("formatCurrency", () => {
  it("formats dollars", () => {
    expect(formatCurrency(1500)).toBe("$1,500.00");
    expect(formatCurrency(0)).toBe("$0.00");
    expect(formatCurrency(99.99)).toBe("$99.99");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-100)).toBe("-$100.00");
  });
});
