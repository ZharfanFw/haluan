import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { KanbanBoard } from './components/KanbanBoard';
import { TableView } from './components/TableView';
import { QuickAddModal } from './components/QuickAddModal';
import { DetailDrawer } from './components/DetailDrawer';
import { ErrorState } from './components/states/ErrorState';
import { LoadingState } from './components/states/LoadingState';
import { EmptyState } from './components/states/EmptyState';
import { Application, ApplicationStatus, CreateApplicationDto, UpdateApplicationDto } from './types';
import { useApplications } from './hooks/useApplications';

export function App() {
  const {
    applications,
    stats,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedStatusFilter,
    setSelectedStatusFilter,
    sortBy,
    order,
    handleSortChange,
    handleCreate: handleCreateApplication,
    handleUpdateStatus,
    handleUpdate: handleUpdateApplication,
    handleDelete,
    retry,
  } = useApplications();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddDefaultStatus, setQuickAddDefaultStatus] = useState<ApplicationStatus>('applied');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openQuickAdd = (status: ApplicationStatus = 'applied') => {
    setQuickAddDefaultStatus(status);
    setIsQuickAddOpen(true);
  };

  const handleSelectApplication = (app: Application) => {
    setSelectedApp(app);
    setIsDrawerOpen(true);
  };

  const handleCreate = async (data: CreateApplicationDto) => {
    await handleCreateApplication(data);
  };

  const handleDrawerUpdate = async (id: string, data: UpdateApplicationDto) => {
    const updated = await handleUpdateApplication(id, data);
    setSelectedApp(updated);
  };

  const handleDeleteApplication = async (id: string) => {
    await handleDelete(id);
    setIsDrawerOpen(false);
    setSelectedApp(null);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedApp(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenQuickAdd={() => openQuickAdd('applied')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12">
        <StatsBanner
          stats={stats}
          loading={loading}
          selectedStatus={selectedStatusFilter}
          onSelectStatus={setSelectedStatusFilter}
        />

        {error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : loading && applications.length === 0 ? (
          <LoadingState />
        ) : applications.length === 0 && !searchQuery && !selectedStatusFilter ? (
          <EmptyState onAddClick={() => openQuickAdd('applied')} />
        ) : (
          <div>
            {viewMode === 'kanban' ? (
              <KanbanBoard
                applications={applications}
                onSelectApplication={handleSelectApplication}
                onUpdateStatus={handleUpdateStatus}
                onOpenQuickAdd={openQuickAdd}
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

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSubmit={handleCreate}
        defaultStatus={quickAddDefaultStatus}
      />

      <DetailDrawer
        application={selectedApp}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onUpdate={handleDrawerUpdate}
        onDelete={handleDeleteApplication}
      />
    </div>
  );
}

export default App;
