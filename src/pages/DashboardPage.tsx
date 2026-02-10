import { useCallback, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "../lib/formatters";
import * as commands from "../lib/commands";
import type {
  DashboardSummary,
  RevenueByClient,
  MonthlyRevenue,
  HoursByProject,
} from "../types";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [revenueByClient, setRevenueByClient] = useState<RevenueByClient[]>(
    []
  );
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [hoursByProject, setHoursByProject] = useState<HoursByProject[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [sum, rev, monthly, hours] = await Promise.all([
        commands.getDashboardSummary(),
        commands.getRevenueByClient(),
        commands.getMonthlyRevenue(12),
        commands.getHoursByProject(30),
      ]);
      setSummary(sum);
      setRevenueByClient(rev);
      setMonthlyRevenue(monthly);
      setHoursByProject(hours);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(summary?.total_revenue ?? 0),
      color: "text-green-600",
    },
    {
      label: "Outstanding",
      value: formatCurrency(summary?.outstanding_amount ?? 0),
      color: "text-warning-600",
    },
    {
      label: "Hours This Week",
      value: `${(summary?.hours_this_week ?? 0).toFixed(1)}h`,
      color: "text-primary-600",
    },
    {
      label: "Active Projects",
      value: String(summary?.active_projects ?? 0),
      color: "text-gray-900",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Revenue
          </h2>
          {monthlyRevenue.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">
              No revenue data yet. Complete and mark invoices as paid.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue by Client */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue by Client
          </h2>
          {revenueByClient.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">
              No client revenue data yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={revenueByClient}
                  dataKey="total_revenue"
                  nameKey="client_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                  }
                >
                  {revenueByClient.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Hours by Project Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Hours by Project (Last 30 Days)
        </h2>
        {hoursByProject.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No time tracked in the last 30 days.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2">
                  Project
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2">
                  Total Hours
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2">
                  Billable Hours
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2">
                  Utilization
                </th>
              </tr>
            </thead>
            <tbody>
              {hoursByProject.map((h) => (
                <tr key={h.project_name} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-800 font-medium">
                    {h.project_name}
                  </td>
                  <td className="py-3 text-sm text-gray-800 text-right">
                    {h.total_hours.toFixed(1)}h
                  </td>
                  <td className="py-3 text-sm text-gray-800 text-right">
                    {h.billable_hours.toFixed(1)}h
                  </td>
                  <td className="py-3 text-sm text-gray-800 text-right">
                    {h.total_hours > 0
                      ? `${((h.billable_hours / h.total_hours) * 100).toFixed(0)}%`
                      : "0%"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
