import { useState, useEffect, useCallback, useMemo } from "react";
import type { Project, ProjectStatus, CreateProject, UpdateProject, Client } from "../types";
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  listClients,
} from "../lib/commands";
import { formatCurrency } from "../lib/formatters";
import { DataTable } from "../components/shared/DataTable";
import { Modal } from "../components/shared/Modal";
import { Button } from "../components/shared/Button";
import { StatusBadge } from "../components/shared/Badge";
import { EmptyState } from "../components/shared/EmptyState";
import { ProjectForm } from "../components/projects/ProjectForm";

type FilterTab = "all" | ProjectStatus;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
  { key: "on_hold", label: "On Hold" },
];

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clientMap, setClientMap] = useState<Record<string, Client>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectList, clientList] = await Promise.all([
        listProjects(),
        listClients(),
      ]);
      setProjects(projectList);
      const map: Record<string, Client> = {};
      for (const c of clientList) {
        map[c.id] = c;
      }
      setClientMap(map);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProjects = useMemo(() => {
    if (filter === "all") return projects;
    return projects.filter((p) => p.status === filter);
  }, [projects, filter]);

  function openCreate() {
    setEditingProject(undefined);
    setModalOpen(true);
  }

  function openEdit(project: Project) {
    setEditingProject(project);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingProject(undefined);
  }

  async function handleSubmit(data: CreateProject | UpdateProject) {
    setSubmitting(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, data as UpdateProject);
      } else {
        await createProject(data as CreateProject);
      }
      closeModal();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!editingProject) return;
    setSubmitting(true);
    try {
      await deleteProject(editingProject.id);
      closeModal();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    } finally {
      setSubmitting(false);
    }
  }

  function getClientName(clientId: string): string {
    const client = clientMap[clientId];
    if (!client) return "Unknown";
    return client.company ? `${client.name} (${client.company})` : client.name;
  }

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (p: Project) => (
        <span className="font-medium text-gray-900">{p.name}</span>
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (p: Project) => getClientName(p.client_id),
    },
    {
      key: "status",
      header: "Status",
      render: (p: Project) => <StatusBadge status={p.status} />,
    },
    {
      key: "rate",
      header: "Rate",
      render: (p: Project) =>
        p.hourly_rate !== null ? formatCurrency(p.hourly_rate) : "--",
    },
    {
      key: "budget",
      header: "Budget Hours",
      render: (p: Project) =>
        p.budget_hours !== null ? `${p.budget_hours}h` : "--",
    },
  ];

  // Loading state
  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Button onClick={openCreate}>New Project</Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg bg-danger-50 border border-danger-200 p-3 text-sm text-danger-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-danger-500 hover:text-danger-700 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table or empty state */}
      {projects.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          }
          title="No projects yet"
          description="Create your first project to start tracking time and generating invoices."
          actionLabel="New Project"
          onAction={openCreate}
        />
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-500">
          No projects match the selected filter.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredProjects}
            onRowClick={openEdit}
            keyExtractor={(p) => p.id}
          />
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingProject ? "Edit Project" : "New Project"}
        size="lg"
      >
        <ProjectForm
          project={editingProject}
          onSubmit={handleSubmit}
          onDelete={editingProject ? handleDelete : undefined}
          onCancel={closeModal}
          loading={submitting}
        />
      </Modal>
    </div>
  );
}
