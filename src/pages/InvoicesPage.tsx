import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/shared/Button";
import { DataTable } from "../components/shared/DataTable";
import { StatusBadge } from "../components/shared/Badge";
import { EmptyState } from "../components/shared/EmptyState";
import { Modal } from "../components/shared/Modal";
import { formatCurrency, formatDate } from "../lib/formatters";
import * as commands from "../lib/commands";
import { useAppStore } from "../stores/appStore";
import type { Invoice, InvoiceStatus } from "../types";

const STATUS_TABS: { label: string; value: InvoiceStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
];

export function InvoicesPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const { businessName, businessEmail, businessAddress } = useAppStore();

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const status = statusFilter === "all" ? undefined : statusFilter;
      const data = await commands.listInvoices(status);
      setInvoices(data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  async function handlePreview(invoice: Invoice) {
    try {
      const html = await commands.renderInvoiceHtml(
        invoice.id,
        businessName,
        businessEmail,
        businessAddress
      );
      setPreviewHtml(html);
    } catch (err) {
      console.error("Failed to render invoice:", err);
    }
  }

  async function handleStatusChange(invoice: Invoice, status: InvoiceStatus) {
    try {
      await commands.updateInvoiceStatus(invoice.id, status);
      loadInvoices();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  const columns = [
    {
      key: "number",
      header: "Invoice #",
      render: (inv: Invoice) => (
        <span className="font-medium">{inv.invoice_number}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (inv: Invoice) => <StatusBadge status={inv.status} />,
    },
    {
      key: "date",
      header: "Date",
      render: (inv: Invoice) => formatDate(inv.issue_date),
    },
    {
      key: "due",
      header: "Due",
      render: (inv: Invoice) => formatDate(inv.due_date),
    },
    {
      key: "total",
      header: "Total",
      render: (inv: Invoice) => (
        <span className="font-medium">{formatCurrency(inv.total)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (inv: Invoice) => (
        <div className="flex gap-2">
          <button
            onClick={() => handlePreview(inv)}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            Preview
          </button>
          {inv.status === "draft" && (
            <button
              onClick={() => handleStatusChange(inv, "sent")}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark Sent
            </button>
          )}
          {(inv.status === "sent" || inv.status === "overdue") && (
            <button
              onClick={() => handleStatusChange(inv, "paid")}
              className="text-xs text-green-600 hover:text-green-700 font-medium"
            >
              Mark Paid
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <Button onClick={() => navigate("/invoices/new")}>New Invoice</Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              statusFilter === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : invoices.length === 0 ? (
          <EmptyState
            title="No invoices yet"
            description="Create your first invoice to start billing clients."
            actionLabel="New Invoice"
            onAction={() => navigate("/invoices/new")}
          />
        ) : (
          <DataTable
            columns={columns}
            data={invoices}
            keyExtractor={(inv) => inv.id}
          />
        )}
      </div>

      {/* Preview Modal */}
      {previewHtml && (
        <Modal
          title="Invoice Preview"
          isOpen={true}
          onClose={() => setPreviewHtml(null)}
          size="lg"
        >
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </Modal>
      )}
    </div>
  );
}
