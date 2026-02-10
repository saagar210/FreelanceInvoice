import type { Client, InvoiceLineItem } from "../../types";
import { formatCurrency, formatDate } from "../../lib/formatters";

type LineItemData = Omit<InvoiceLineItem, "id" | "invoice_id">;

interface InvoicePreviewProps {
  businessName: string;
  businessEmail: string;
  businessAddress: string;
  client: Client | null;
  lineItems: LineItemData[];
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
  invoiceNumber?: string;
}

export function InvoicePreview({
  businessName,
  businessEmail,
  businessAddress,
  client,
  lineItems,
  issueDate,
  dueDate,
  subtotal,
  taxRate,
  taxAmount,
  total,
  notes,
  invoiceNumber,
}: InvoicePreviewProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 max-w-3xl mx-auto print:shadow-none print:border-none">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {businessName || "Your Business"}
          </h2>
          {businessEmail && (
            <p className="text-sm text-gray-600 mt-1">{businessEmail}</p>
          )}
          {businessAddress && (
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {businessAddress}
            </p>
          )}
        </div>
        <div className="text-right">
          <h3 className="text-xl font-semibold text-primary-600 uppercase tracking-wide">
            Invoice
          </h3>
          {invoiceNumber && (
            <p className="text-sm text-gray-600 mt-1">#{invoiceNumber}</p>
          )}
        </div>
      </div>

      {/* Client & Dates */}
      <div className="flex justify-between mb-8">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Bill To
          </p>
          {client ? (
            <div className="text-sm text-gray-800">
              <p className="font-medium">{client.name}</p>
              {client.company && <p>{client.company}</p>}
              {client.email && <p>{client.email}</p>}
              {client.address && (
                <p className="whitespace-pre-line">{client.address}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No client selected</p>
          )}
        </div>
        <div className="text-right text-sm">
          <div className="mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Issue Date
            </p>
            <p className="text-gray-800">{formatDate(issueDate)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Due Date
            </p>
            <p className="text-gray-800">{formatDate(dueDate)}</p>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2">
              Description
            </th>
            <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2 w-20">
              Qty
            </th>
            <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2 w-28">
              Rate
            </th>
            <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2 w-28">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {lineItems.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="py-8 text-center text-sm text-gray-400 italic"
              >
                No line items added
              </td>
            </tr>
          ) : (
            lineItems.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-3 text-sm text-gray-800">
                  {item.description || "Untitled item"}
                </td>
                <td className="py-3 text-sm text-gray-800 text-right">
                  {item.quantity}
                </td>
                <td className="py-3 text-sm text-gray-800 text-right">
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="py-3 text-sm font-medium text-gray-900 text-right">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-2 text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900 font-medium">
              {formatCurrency(subtotal)}
            </span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between py-2 text-sm border-b border-gray-100">
              <span className="text-gray-600">Tax ({taxRate}%)</span>
              <span className="text-gray-900 font-medium">
                {formatCurrency(taxAmount)}
              </span>
            </div>
          )}
          <div className="flex justify-between py-3 text-base font-bold border-t-2 border-gray-800 mt-1">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Notes
          </p>
          <p className="text-sm text-gray-700 whitespace-pre-line">{notes}</p>
        </div>
      )}
    </div>
  );
}
