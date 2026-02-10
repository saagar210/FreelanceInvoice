import { useCallback } from "react";
import type { InvoiceLineItem } from "../../types";
import { formatCurrency } from "../../lib/formatters";
import { Button } from "../shared/Button";

type LineItemData = Omit<InvoiceLineItem, "id" | "invoice_id">;

interface LineItemRowProps {
  item: LineItemData;
  index: number;
  onUpdate: (index: number, item: LineItemData) => void;
  onRemove: (index: number) => void;
}

export function LineItemRow({
  item,
  index,
  onUpdate,
  onRemove,
}: LineItemRowProps) {
  const handleFieldChange = useCallback(
    (field: keyof LineItemData, raw: string) => {
      const updated = { ...item };

      if (field === "description") {
        updated.description = raw;
      } else if (field === "quantity") {
        const val = parseFloat(raw) || 0;
        updated.quantity = val;
        updated.amount = val * updated.unit_price;
      } else if (field === "unit_price") {
        const val = parseFloat(raw) || 0;
        updated.unit_price = val;
        updated.amount = updated.quantity * val;
      }

      onUpdate(index, updated);
    },
    [item, index, onUpdate]
  );

  return (
    <tr className="border-b border-gray-100 last:border-b-0">
      <td className="py-2 pr-2">
        <input
          type="text"
          value={item.description}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          placeholder="Line item description"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </td>
      <td className="py-2 px-2 w-24">
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => handleFieldChange("quantity", e.target.value)}
          min={0}
          step={0.25}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-right shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </td>
      <td className="py-2 px-2 w-32">
        <input
          type="number"
          value={item.unit_price}
          onChange={(e) => handleFieldChange("unit_price", e.target.value)}
          min={0}
          step={0.01}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-right shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </td>
      <td className="py-2 px-2 w-32 text-right text-sm font-medium text-gray-900">
        {formatCurrency(item.amount)}
      </td>
      <td className="py-2 pl-2 w-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          aria-label="Remove line item"
        >
          <svg
            className="w-4 h-4 text-danger-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </Button>
      </td>
    </tr>
  );
}
