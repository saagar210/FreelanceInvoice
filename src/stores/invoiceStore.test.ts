import { describe, it, expect, beforeEach } from "vitest";
import { useInvoiceStore } from "./invoiceStore";

describe("invoiceStore", () => {
  beforeEach(() => {
    useInvoiceStore.getState().reset();
  });

  it("starts with empty line items", () => {
    expect(useInvoiceStore.getState().lineItems).toHaveLength(0);
  });

  it("adds line items", () => {
    useInvoiceStore.getState().addLineItem({
      description: "Web Development",
      quantity: 10,
      unit_price: 150,
      amount: 1500,
      sort_order: 0,
    });

    expect(useInvoiceStore.getState().lineItems).toHaveLength(1);
    expect(useInvoiceStore.getState().lineItems[0].description).toBe(
      "Web Development"
    );
  });

  it("calculates subtotal", () => {
    const store = useInvoiceStore.getState();
    store.addLineItem({
      description: "Item A",
      quantity: 2,
      unit_price: 100,
      amount: 200,
      sort_order: 0,
    });
    store.addLineItem({
      description: "Item B",
      quantity: 1,
      unit_price: 300,
      amount: 300,
      sort_order: 1,
    });

    expect(useInvoiceStore.getState().subtotal()).toBe(500);
  });

  it("calculates tax and total", () => {
    const store = useInvoiceStore.getState();
    store.setTaxRate(10);
    store.addLineItem({
      description: "Work",
      quantity: 1,
      unit_price: 1000,
      amount: 1000,
      sort_order: 0,
    });

    expect(useInvoiceStore.getState().taxAmount()).toBe(100);
    expect(useInvoiceStore.getState().total()).toBe(1100);
  });

  it("removes line items", () => {
    const store = useInvoiceStore.getState();
    store.addLineItem({
      description: "A",
      quantity: 1,
      unit_price: 100,
      amount: 100,
      sort_order: 0,
    });
    store.addLineItem({
      description: "B",
      quantity: 1,
      unit_price: 200,
      amount: 200,
      sort_order: 1,
    });

    useInvoiceStore.getState().removeLineItem(0);
    expect(useInvoiceStore.getState().lineItems).toHaveLength(1);
    expect(useInvoiceStore.getState().lineItems[0].description).toBe("B");
  });

  it("updates line items", () => {
    const store = useInvoiceStore.getState();
    store.addLineItem({
      description: "Original",
      quantity: 1,
      unit_price: 100,
      amount: 100,
      sort_order: 0,
    });

    useInvoiceStore.getState().updateLineItem(0, {
      description: "Updated",
      quantity: 2,
      unit_price: 150,
      amount: 300,
      sort_order: 0,
    });

    expect(useInvoiceStore.getState().lineItems[0].description).toBe("Updated");
    expect(useInvoiceStore.getState().lineItems[0].amount).toBe(300);
  });

  it("resets to defaults", () => {
    const store = useInvoiceStore.getState();
    store.setClientId("some-id");
    store.setTaxRate(15);
    store.addLineItem({
      description: "Work",
      quantity: 1,
      unit_price: 100,
      amount: 100,
      sort_order: 0,
    });

    useInvoiceStore.getState().reset();

    expect(useInvoiceStore.getState().clientId).toBeNull();
    expect(useInvoiceStore.getState().taxRate).toBe(0);
    expect(useInvoiceStore.getState().lineItems).toHaveLength(0);
  });

  it("sets default dates to today and +30 days", () => {
    const state = useInvoiceStore.getState();
    const today = new Date().toISOString().split("T")[0];
    expect(state.issueDate).toBe(today);
    // Due date should be ~30 days from now
    const dueDate = new Date(state.dueDate);
    const expectedDue = new Date();
    expectedDue.setDate(expectedDue.getDate() + 30);
    expect(dueDate.toISOString().split("T")[0]).toBe(
      expectedDue.toISOString().split("T")[0]
    );
  });
});
