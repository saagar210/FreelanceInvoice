import { useCallback, useEffect, useState } from "react";
import { Button } from "../components/shared/Button";
import { EmptyState } from "../components/shared/EmptyState";
import { Badge } from "../components/shared/Badge";
import { TextArea } from "../components/shared/Input";
import { formatDate } from "../lib/formatters";
import { useAppStore } from "../stores/appStore";
import * as commands from "../lib/commands";
import type { Estimate } from "../types";

export function EstimatesPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [estimating, setEstimating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<Estimate | null>(null);
  const claudeApiKey = useAppStore((s) => s.claudeApiKey);

  const loadEstimates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await commands.listEstimates();
      setEstimates(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEstimates();
  }, [loadEstimates]);

  const getConfidenceColor = (score: number) => {
    if (score >= 0.7) return "success";
    if (score >= 0.5) return "warning";
    return "danger";
  };

  async function handleRunEstimate() {
    if (!claudeApiKey) {
      setError("Claude API key is required. Set it in Settings.");
      return;
    }
    if (!description.trim()) {
      setError("Please describe the project you want to estimate.");
      return;
    }

    setEstimating(true);
    setError(null);
    setLatestResult(null);

    try {
      const result = await commands.runAiEstimate(
        claudeApiKey,
        description.trim()
      );
      setLatestResult(result);
      setDescription("");
      loadEstimates();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : String(err)
      );
    } finally {
      setEstimating(false);
    }
  }

  function EstimateCard({ est }: { est: Estimate }) {
    const riskFlags: string[] = Array.isArray(est.risk_flags)
      ? est.risk_flags
      : [];

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {est.project_description}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(est.created_at)}
            </p>
          </div>
          <Badge
            variant={
              getConfidenceColor(est.confidence_score) as
                | "success"
                | "warning"
                | "danger"
            }
          >
            {Math.round(est.confidence_score * 100)}% confidence
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-600 font-medium">Optimistic</p>
            <p className="text-2xl font-bold text-green-600">
              {est.optimistic_hours}h
            </p>
          </div>
          <div className="bg-primary-50 rounded-lg p-4 text-center">
            <p className="text-sm text-primary-600 font-medium">Realistic</p>
            <p className="text-2xl font-bold text-primary-600">
              {est.realistic_hours}h
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <p className="text-sm text-amber-600 font-medium">Conservative</p>
            <p className="text-2xl font-bold text-amber-600">
              {est.conservative_hours}h
            </p>
          </div>
        </div>

        {riskFlags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {riskFlags.map((flag, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"
              >
                {flag}
              </span>
            ))}
          </div>
        )}

        {est.reasoning && (
          <p className="mt-4 text-sm text-gray-600">{est.reasoning}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Estimates</h1>
      </div>

      {/* AI Estimation Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          New Estimate
        </h2>
        <TextArea
          label="Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the project in detail: tech stack, features, complexity, client requirements..."
          rows={4}
        />
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleRunEstimate} loading={estimating}>
            {estimating ? "Analyzing..." : "Run AI Estimate"}
          </Button>
          {!claudeApiKey && (
            <p className="text-xs text-gray-500">
              Set your Claude API key in Settings first.
            </p>
          )}
        </div>
      </div>

      {/* Latest Result Highlight */}
      {latestResult && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Latest Result
          </h2>
          <EstimateCard est={latestResult} />
        </div>
      )}

      {/* Past Estimates */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : estimates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            title="No estimates yet"
            description="Use AI to estimate project hours before sending quotes to clients."
          />
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Past Estimates
          </h2>
          {estimates.map((est) => (
            <EstimateCard key={est.id} est={est} />
          ))}
        </div>
      )}
    </div>
  );
}
