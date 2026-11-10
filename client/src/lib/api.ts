import { Application, ApplicationStats, CreateApplicationDto, UpdateApplicationDto } from '../types';

const API_BASE = '/api';

export async function fetchApplications(params?: {
  q?: string;
  status?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}): Promise<Application[]> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set('q', params.q);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.order) searchParams.set('order', params.order);

  const url = `${API_BASE}/applications${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal memuat daftar lamaran');
  }
  return res.json();
}

export async function fetchStats(): Promise<ApplicationStats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) {
    throw new Error('Gagal memuat ringkasan statistik');
  }
  return res.json();
}

export async function createApplication(data: CreateApplicationDto): Promise<Application> {
  const res = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal membuat lamaran');
  }
  return res.json();
}

export async function updateApplication(id: string, data: UpdateApplicationDto): Promise<Application> {
  const res = await fetch(`${API_BASE}/applications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal memperbarui lamaran');
  }
  return res.json();
}

export async function deleteApplication(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/applications/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal menghapus lamaran');
  }
}
