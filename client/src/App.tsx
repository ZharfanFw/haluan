import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { KanbanBoard } from './components/KanbanBoard';
import { TableView } from './components/TableView';
import { QuickAddModal } from './components/QuickAddModal';
import { DetailDrawer } from './components/DetailDrawer';
import { Application, ApplicationStats, ApplicationStatus, CreateApplicationDto, UpdateApplicationDto } from './types';
import { fetchApplications, fetchStats, createApplication, updateApplication, deleteApplication } from './lib/api';
import { AlertCircle, RefreshCw, Plus } from 'lucide-react';

export function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<ApplicationStatus | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const [sortBy, setSortBy] = useState('applied_date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Modal & Drawer States
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddDefaultStatus, setQuickAddDefaultStatus] = useState<ApplicationStatus>('applied');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [appsData, statsData] = await Promise.all([
        fetchApplications({
          q: searchQuery,
          status: selectedStatusFilter || undefined,
          sortBy,
          order,
        }),
        fetchStats(),
      ]);
      setApplications(appsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatusFilter, sortBy, order]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenQuickAdd = (status: ApplicationStatus = 'applied') => {
    setQuickAddDefaultStatus(status);
    setIsQuickAddOpen(true);
  };

  const handleSelectApplication = (app: Application) => {
    setSelectedApp(app);
    setIsDrawerOpen(true);
  };

  const handleCreate = async (data: CreateApplicationDto) => {
    await createApplication(data);
    await loadData();
  };

  const handleUpdateStatus = async (id: string, newStatus: ApplicationStatus) => {
    // Optimistic UI update
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
    try {
      await updateApplication(id, { status: newStatus });
      // Refresh stats
      const newStats = await fetchStats();
      setStats(newStats);
    } catch (err) {
      // Revert if error
      await loadData();
      alert(err instanceof Error ? err.message : 'Gagal memperbarui status');
    }
  };

  const handleUpdate = async (id: string, data: UpdateApplicationDto) => {
    const updated = await updateApplication(id, data);
    setSelectedApp(updated);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    await deleteApplication(id);
    setIsDrawerOpen(false);
    setSelectedApp(null);
    await loadData();
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setOrder('desc');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenQuickAdd={() => handleOpenQuickAdd('applied')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12">
        {/* Statistics Overview */}
        <StatsBanner
          stats={stats}
          loading={loading}
          selectedStatus={selectedStatusFilter}
          onSelectStatus={setSelectedStatusFilter}
        />

        {/* State 1: Error State */}
        {error ? (
          <div className="rounded-2xl border border-rose-900/60 bg-rose-950/20 p-8 text-center my-8">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-rose-200">Gagal Memuat Data</h3>
            <p className="text-xs text-rose-300/80 mt-1 max-w-md mx-auto">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 border border-rose-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
          </div>
        ) : loading && applications.length === 0 ? (
          /* State 2: Skeleton Loading State */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, colIndex) => (
              <div
                key={colIndex}
                className="rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-3 h-96 animate-pulse space-y-3"
              >
                <div className="h-5 bg-zinc-800 rounded w-24"></div>
                <div className="h-28 bg-zinc-800/60 rounded-xl"></div>
                <div className="h-28 bg-zinc-800/60 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : applications.length === 0 && !searchQuery && !selectedStatusFilter ? (
          /* State 3: Clean Initial Empty State */
          <div className="py-24 border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-zinc-900/20 my-6">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-3xl mb-4 border border-zinc-800 shadow-inner">
              🎯
            </div>
            <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
              Mulai Tracking Lamaran Pertamamu
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-md leading-relaxed">
              Catat lowongan yang ingin kamu lamar dengan cepat tanpa repot. Cukup nama perusahaan dan posisi!
            </p>
            <button
              onClick={() => handleOpenQuickAdd('applied')}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-zinc-100 text-zinc-900 hover:bg-white active:bg-zinc-200 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Lamaran Sekarang</span>
            </button>
          </div>
        ) : (
          /* State 4: Success View (Kanban or Table) */
          <div>
            {viewMode === 'kanban' ? (
              <KanbanBoard
                applications={applications}
                onSelectApplication={handleSelectApplication}
                onUpdateStatus={handleUpdateStatus}
                onOpenQuickAdd={handleOpenQuickAdd}
              />
            ) : (
              <TableView
                applications={applications}
                onSelectApplication={handleSelectApplication}
                onUpdateStatus={handleUpdateStatus}
                sortBy={sortBy}
                order={order}
                onSortChange={handleSortChange}
              />
            )}
          </div>
        )}
      </main>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSubmit={handleCreate}
        defaultStatus={quickAddDefaultStatus}
      />

      {/* Application Detail Drawer */}
      <DetailDrawer
        application={selectedApp}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedApp(null);
        }}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default App;
