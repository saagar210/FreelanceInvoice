import { useState } from "react";
import type { Client, CreateClient, UpdateClient } from "../../types";
import { Input, TextArea } from "../shared/Input";
import { Button } from "../shared/Button";

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: CreateClient | UpdateClient) => Promise<void>;
  onDelete?: () => void;
  onCancel: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  hourly_rate?: string;
}

export function ClientForm({ client, onSubmit, onDelete, onCancel }: ClientFormProps) {
  const [name, setName] = useState(client?.name ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [company, setCompany] = useState(client?.company ?? "");
  const [address, setAddress] = useState(client?.address ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [notes, setNotes] = useState(client?.notes ?? "");
  const [hourlyRate, setHourlyRate] = useState(
    client?.hourly_rate != null ? String(client.hourly_rate) : ""
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};

    if (!name.trim()) {
      next.name = "Name is required";
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Invalid email address";
    }

    if (hourlyRate.trim() && (isNaN(Number(hourlyRate)) || Number(hourlyRate) < 0)) {
      next.hourly_rate = "Must be a positive number";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const data: CreateClient = {
        name: name.trim(),
        email: email.trim() || null,
        company: company.trim() || null,
        address: address.trim() || null,
        phone: phone.trim() || null,
        notes: notes.trim() || null,
        hourly_rate: hourlyRate.trim() ? Number(hourlyRate) : null,
      };
      await onSubmit(data);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="Client name"
        required
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="client@example.com"
      />

      <Input
        label="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Company name"
      />

      <Input
        label="Phone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="(555) 123-4567"
      />

      <Input
        label="Hourly Rate"
        type="number"
        min="0"
        step="0.01"
        value={hourlyRate}
        onChange={(e) => setHourlyRate(e.target.value)}
        error={errors.hourly_rate}
        placeholder="0.00"
      />

      <TextArea
        label="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Street address, city, state..."
      />

      <TextArea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Any notes about this client..."
      />

      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          {client && onDelete && (
            <>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-danger-600">Delete this client?</span>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={onDelete}
                  >
                    Confirm
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  className="text-danger-600 hover:text-danger-700"
                >
                  Delete Client
                </Button>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {client ? "Save Changes" : "Create Client"}
          </Button>
        </div>
      </div>
    </form>
  );
}
