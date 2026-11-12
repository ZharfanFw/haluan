import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Application,
  ApplicationStats,
  ApplicationStatus,
  CreateApplicationDto,
  UpdateApplicationDto,
} from '../types';
import {
  fetchApplications,
  fetchStats,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../lib/api';

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<ApplicationStatus | null>(null);
  const [sortBy, setSortBy] = useState('applied_date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Main data loader with AbortController cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async () => {
    // Abort previous in-flight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const [appsData, statsData] = await Promise.all([
        fetchApplications(
          {
            q: debouncedSearchQuery,
            status: selectedStatusFilter || undefined,
            sortBy,
            order,
          },
          controller.signal
        ),
        fetchStats(controller.signal),
      ]);

      setApplications(appsData);
      setStats(statsData);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted due to newer query parameters; ignore
        return;
      }
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [debouncedSearchQuery, selectedStatusFilter, sortBy, order]);

  useEffect(() => {
    loadData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);

  const handleCreate = useCallback(async (data: CreateApplicationDto) => {
    await createApplication(data);
    await loadData();
  }, [loadData]);

  const handleUpdateStatus = useCallback(
    async (id: string, newStatus: ApplicationStatus) => {
      // Optimistic UI update in applications list
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );

      try {
        await updateApplication(id, { status: newStatus });
        const newStats = await fetchStats();
        setStats(newStats);
      } catch (err: unknown) {
        // Revert to server state on failure
        await loadData();
        alert(err instanceof Error ? err.message : 'Gagal memperbarui status');
      }
    },
    [loadData]
  );

  const handleUpdate = useCallback(
    async (id: string, data: UpdateApplicationDto): Promise<Application> => {
      const updated = await updateApplication(id, data);

      // Immediately synchronize local application state
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? updated : app))
      );

      // Refresh pipeline stats if status changed
      if (data.status !== undefined) {
        const newStats = await fetchStats().catch(() => null);
        if (newStats) {
          setStats(newStats);
        }
      }

      return updated;
    },
    []
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteApplication(id);

      // Optimistically remove from local state
      setApplications((prev) => prev.filter((app) => app.id !== id));

      // Refresh pipeline stats
      const newStats = await fetchStats().catch(() => null);
      if (newStats) {
        setStats(newStats);
      }
    },
    []
  );

  const handleSortChange = useCallback((field: string) => {
    setSortBy((prevSortBy) => {
      if (prevSortBy === field) {
        setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setOrder('desc');
      }
      return field;
    });
  }, []);

  return {
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
    handleCreate,
    handleUpdateStatus,
    handleUpdate,
    handleDelete,
    retry: loadData,
  };
}
