import { useState, useEffect } from "react";
import type { Project, CreateProject, UpdateProject, ProjectStatus, Client } from "../../types";
import { listClients } from "../../lib/commands";
import { Input, TextArea } from "../shared/Input";
import { Select } from "../shared/Select";
import { Button } from "../shared/Button";

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "archived", label: "Archived" },
];

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: CreateProject | UpdateProject) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ProjectForm({
  project,
  onSubmit,
  onDelete,
  onCancel,
  loading = false,
}: ProjectFormProps) {
  const isEdit = Boolean(project);

  const [name, setName] = useState(project?.name ?? "");
  const [clientId, setClientId] = useState(project?.client_id ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "active");
  const [hourlyRate, setHourlyRate] = useState(project?.hourly_rate?.toString() ?? "");
  const [budgetHours, setBudgetHours] = useState(project?.budget_hours?.toString() ?? "");

  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setClientsLoading(true);
    listClients()
      .then((data) => {
        if (!cancelled) setClients(data);
      })
      .catch(() => {
        if (!cancelled) setErrors((prev) => ({ ...prev, clients: "Failed to load clients" }));
      })
      .finally(() => {
        if (!cancelled) setClientsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Project name is required";
    if (!isEdit && !clientId) next.clientId = "Client is required";

    const rate = hourlyRate.trim() ? parseFloat(hourlyRate) : null;
    if (rate !== null && (isNaN(rate) || rate < 0)) {
      next.hourlyRate = "Must be a valid positive number";
    }

    const hours = budgetHours.trim() ? parseFloat(budgetHours) : null;
    if (hours !== null && (isNaN(hours) || hours < 0)) {
      next.budgetHours = "Must be a valid positive number";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const rate = hourlyRate.trim() ? parseFloat(hourlyRate) : null;
    const hours = budgetHours.trim() ? parseFloat(budgetHours) : null;

    if (isEdit) {
      const data: UpdateProject = {
        name: name.trim(),
        description: description.trim() || null,
        status,
        hourly_rate: rate,
        budget_hours: hours,
      };
      await onSubmit(data);
    } else {
      const data: CreateProject = {
        client_id: clientId,
        name: name.trim(),
        description: description.trim() || null,
        status,
        hourly_rate: rate,
        budget_hours: hours,
      };
      await onSubmit(data);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    await onDelete?.();
  }

  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: c.company ? `${c.name} (${c.company})` : c.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Project Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="e.g. Website Redesign"
        required
      />

      {!isEdit && (
        <Select
          label="Client"
          options={clientOptions}
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder={clientsLoading ? "Loading clients..." : "Select a client"}
          error={errors.clientId || errors.clients}
          disabled={clientsLoading}
          required
        />
      )}

      <TextArea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Brief project description (optional)"
      />

      <Select
        label="Status"
        options={STATUS_OPTIONS}
        value={status}
        onChange={(e) => setStatus(e.target.value as ProjectStatus)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Hourly Rate ($)"
          type="number"
          step="0.01"
          min="0"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          error={errors.hourlyRate}
          placeholder="0.00"
        />
        <Input
          label="Budget Hours"
          type="number"
          step="0.5"
          min="0"
          value={budgetHours}
          onChange={(e) => setBudgetHours(e.target.value)}
          error={errors.budgetHours}
          placeholder="0"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        {isEdit && onDelete ? (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            loading={loading}
          >
            {deleteConfirm ? "Confirm Delete" : "Delete Project"}
          </Button>
        ) : (
          <div />
        )}

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </div>
    </form>
  );
}
