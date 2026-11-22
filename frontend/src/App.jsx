import { useCallback, useEffect, useState } from "react";
import { Menu, Plus } from "lucide-react";
import Sidebar from "./components/Sidebar.jsx";
import StatsCards from "./components/StatsCards.jsx";
import LeadFilters from "./components/LeadFilters.jsx";
import LeadsTable from "./components/LeadsTable.jsx";
import Pagination from "./components/Pagination.jsx";
import LeadModal from "./components/LeadModal.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import ToastContainer from "./components/ToastContainer.jsx";
import { createLead, deleteLead, getLeads, getStats, updateLead } from "./services/api.js";
import { EMPTY_STATS, PAGE_SIZE } from "./utils/constants.js";

export default function App() {
  // ----- data from the API -----
  const [stats, setStats] = useState(EMPTY_STATS);
  const [statsLoading, setStatsLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // ----- search / filter / page -----
  const [searchInput, setSearchInput] = useState(""); // what the user is typing
  const [search, setSearch] = useState(""); // debounced value sent to the API
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0); // bump to re-fetch after add/edit/delete

  // ----- UI state -----
  const [modalLead, setModalLead] = useState(undefined); // undefined = closed, null = add, object = edit
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dismissToast = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const addToast = useCallback(
    (type, message) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current, { id, type, message }]);
      setTimeout(() => dismissToast(id), 4500);
    },
    [dismissToast]
  );

  // Wait 300ms after the user stops typing before searching.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load the leads table whenever search, filter, page or refreshKey changes.
  useEffect(() => {
    let ignore = false; // ignore answers of outdated requests
    setLoading(true);
    setLoadError("");

    getLeads({ search, status: statusFilter, page, limit: PAGE_SIZE })
      .then((result) => {
        if (ignore) return;
        if (result.data.length === 0 && page > 1) {
          setPage(Math.min(page - 1, result.pagination.totalPages)); // e.g. last lead of last page was deleted
          return;
        }
        setLeads(result.data);
        setPagination(result.pagination);
        setLoading(false);
      })
      .catch((error) => {
        if (ignore) return;
        setLeads([]);
        setLoadError(error.message);
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [search, statusFilter, page, refreshKey]);

  // Load the dashboard counters.
  useEffect(() => {
    let ignore = false;
    getStats()
      .then((result) => !ignore && setStats(result.data))
      .catch(() => {}) // the table already shows a connection error
      .finally(() => !ignore && setStatsLoading(false));
    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  async function handleSave(form) {
    const isEdit = Boolean(modalLead);
    // If the API rejects the data this throws, and the modal shows the error.
    const result = isEdit ? await updateLead(modalLead.id, form) : await createLead(form);
    setModalLead(undefined);
    addToast("success", result.message || (isEdit ? "Lead updated successfully" : "Lead created successfully"));
    if (!isEdit) setPage(1);
    setRefreshKey((key) => key + 1);
  }

  async function handleDeleteConfirmed() {
    setDeleting(true);
    try {
      const result = await deleteLead(leadToDelete.id);
      addToast("success", result.message || "Lead deleted successfully");
      setLeadToDelete(null);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      addToast("error", error.message);
      if (error.status === 404) {
        setLeadToDelete(null); // already deleted elsewhere
        setRefreshKey((key) => key + 1);
      }
    } finally {
      setDeleting(false);
    }
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setStatusFilter("");
    setPage(1);
  }

  const hasFilters = Boolean(search || statusFilter || searchInput);

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        total={stats.total}
        onClose={() => setSidebarOpen(false)}
        onAddLead={() => setModalLead(null)}
      />

      <main className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <div className="topbar-title">
            <h1>Lead Manager</h1>
            <p>Track, manage and convert your leads</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModalLead(null)}>
            <Plus size={17} /> <span className="btn-text">Add Lead</span>
          </button>
        </header>

        <div className="content">
          <section id="dashboard" className="section">
            <h2 className="section-title">Dashboard overview</h2>
            <StatsCards stats={stats} loading={statsLoading} />
          </section>

          <section id="leads" className="card">
            <div className="card-head">
              <div>
                <h2 className="section-title">All leads</h2>
                <p className="muted">Search, filter and manage every lead in one place.</p>
              </div>
            </div>

            <LeadFilters
              searchInput={searchInput}
              onSearchChange={setSearchInput}
              statusFilter={statusFilter}
              onStatusChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              hasFilters={hasFilters}
              onClear={clearFilters}
            />

            <LeadsTable
              leads={leads}
              loading={loading}
              error={loadError}
              hasFilters={hasFilters}
              onEdit={(lead) => setModalLead(lead)}
              onDelete={(lead) => setLeadToDelete(lead)}
              onAdd={() => setModalLead(null)}
              onClearFilters={clearFilters}
              onRetry={() => setRefreshKey((key) => key + 1)}
            />

            {!loadError && leads.length > 0 && <Pagination pagination={pagination} shown={leads.length} onPageChange={setPage} />}
          </section>
        </div>
      </main>

      {modalLead !== undefined && (
        <LeadModal lead={modalLead} onClose={() => setModalLead(undefined)} onSave={handleSave} />
      )}
      {leadToDelete && (
        <ConfirmDialog
          lead={leadToDelete}
          busy={deleting}
          onCancel={() => setLeadToDelete(null)}
          onConfirm={handleDeleteConfirmed}
        />
      )}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
