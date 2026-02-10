import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { ClientsPage } from "./pages/ClientsPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { TimeTrackingPage } from "./pages/TimeTrackingPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { InvoiceBuilderPage } from "./pages/InvoiceBuilderPage";
import { EstimatesPage } from "./pages/EstimatesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { useTimerStore } from "./stores/timerStore";
import { useAppStore } from "./stores/appStore";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useDarkMode } from "./hooks/useDarkMode";

function AppContent() {
  useKeyboardShortcuts();
  useDarkMode();

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/time" element={<TimeTrackingPage />} />
        <Route path="/invoices/new" element={<InvoiceBuilderPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/estimates" element={<EstimatesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  const fetchTimerState = useTimerStore((s) => s.fetchTimerState);
  const loadSettings = useAppStore((s) => s.loadSettings);

  useEffect(() => {
    fetchTimerState();
    loadSettings();
  }, [fetchTimerState, loadSettings]);

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
