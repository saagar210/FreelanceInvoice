import { useCallback, useEffect, useMemo, useState } from "react";
import type { Client, CreateClient, UpdateClient } from "../types";
import {
  listClients,
  createClient,
  updateClient,
  deleteClient,
} from "../lib/commands";
import { formatCurrency, formatDate } from "../lib/formatters";
import { DataTable } from "../components/shared/DataTable";
import { Button } from "../components/shared/Button";
import { Modal } from "../components/shared/Modal";
import { EmptyState } from "../components/shared/EmptyState";
import { ClientForm } from "../components/clients/ClientForm";

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(
    undefined
  );

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listClients();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  function openCreate() {
    setSelectedClient(undefined);
    setModalOpen(true);
  }

  function openEdit(client: Client) {
    setSelectedClient(client);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedClient(undefined);
  }

  async function handleSubmit(data: CreateClient | UpdateClient) {
    if (selectedClient) {
      await updateClient(selectedClient.id, data as UpdateClient);
    } else {
      await createClient(data as CreateClient);
    }
    closeModal();
    await fetchClients();
  }

  async function handleDelete() {
    if (!selectedClient) return;
    await deleteClient(selectedClient.id);
    closeModal();
    await fetchClients();
  }

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        render: (c: Client) => (
          <span className="font-medium text-gray-900">{c.name}</span>
        ),
      },
      {
        key: "company",
        header: "Company",
        render: (c: Client) => c.company ?? "-",
      },
      {
        key: "email",
        header: "Email",
        render: (c: Client) => c.email ?? "-",
      },
      {
        key: "rate",
        header: "Rate",
        render: (c: Client) =>
          c.hourly_rate != null ? formatCurrency(c.hourly_rate) + "/hr" : "-",
      },
      {
        key: "created",
        header: "Created",
        render: (c: Client) => formatDate(c.created_at),
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-xl p-6 text-center">
        <p className="text-danger-700 font-medium mb-2">
          Something went wrong
        </p>
        <p className="text-sm text-danger-600 mb-4">{error}</p>
        <Button variant="secondary" onClick={fetchClients}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <Button onClick={openCreate}>Add Client</Button>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
            title="No clients yet"
            description="Add your first client to start tracking projects and sending invoices."
            actionLabel="Add Client"
            onAction={openCreate}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <DataTable
            columns={columns}
            data={clients}
            onRowClick={openEdit}
            keyExtractor={(c) => c.id}
          />
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={selectedClient ? "Edit Client" : "New Client"}
        size="lg"
      >
        <ClientForm
          client={selectedClient}
          onSubmit={handleSubmit}
          onDelete={selectedClient ? handleDelete : undefined}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
