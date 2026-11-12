import crypto from 'node:crypto';
import { db } from '../db.js';
import {
  Application,
  ApplicationStats,
  CreateApplicationDto,
  UpdateApplicationDto,
} from '../types.js';
import {
  VALID_STATUSES,
  VALID_WORK_MODES,
  ALLOWED_SORT_FIELDS,
  DEFAULT_SORT_FIELD,
} from '../constants.js';
import { ValidationError, NotFoundError } from '../errors.js';

export interface ListApplicationsParams {
  q?: unknown;
  status?: unknown;
  sortBy?: unknown;
  order?: unknown;
}

// Cached prepared statements for high-throughput static queries
const stmtGetStats = db.prepare(`
  SELECT status, COUNT(*) as count
  FROM applications
  GROUP BY status
`);

const stmtGetById = db.prepare(`
  SELECT * FROM applications WHERE id = ?
`);

const stmtDeleteById = db.prepare(`
  DELETE FROM applications WHERE id = ?
`);

const stmtInsertApplication = db.prepare(`
  INSERT INTO applications (
    id, company, role, status, work_mode, location, salary,
    job_url, applied_date, interview_date, contact_info, notes,
    created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const stmtListDefault = db.prepare(`
  SELECT * FROM applications ORDER BY applied_date DESC, created_at DESC
`);

export function getStats(): ApplicationStats {
  const rows = stmtGetStats.all() as unknown as { status: string; count: number }[];

  const stats: ApplicationStats = {
    total: 0,
    wishlist: 0,
    applied: 0,
    interviewing: 0,
    offer: 0,
    rejected: 0,
  };

  for (const row of rows) {
    if (row.status in stats) {
      (stats as unknown as Record<string, number>)[row.status] = Number(row.count);
    }
    stats.total += Number(row.count);
  }

  return stats;
}

export function listApplications(params: ListApplicationsParams = {}): Application[] {
  const { q, status, sortBy = DEFAULT_SORT_FIELD, order = 'desc' } = params;

  const hasSearch = typeof q === 'string' && q.trim().length > 0;
  const hasStatus = typeof status === 'string' && VALID_STATUSES.includes(status as any);
  const isDefaultSort = (!sortBy || sortBy === DEFAULT_SORT_FIELD) && (!order || String(order).toLowerCase() === 'desc');

  // Use fast static prepared statement when no filters are applied
  if (!hasSearch && !hasStatus && isDefaultSort) {
    return stmtListDefault.all() as unknown as Application[];
  }

  let query = `SELECT * FROM applications WHERE 1=1`;
  const queryParams: (string | number)[] = [];

  if (hasStatus) {
    query += ` AND status = ?`;
    queryParams.push(status as string);
  }

  if (hasSearch) {
    query += ` AND (company LIKE ? OR role LIKE ? OR notes LIKE ? OR location LIKE ?)`;
    const searchTerm = `%${(q as string).trim()}%`;
    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  const sortField = ALLOWED_SORT_FIELDS.includes(String(sortBy) as any)
    ? String(sortBy)
    : DEFAULT_SORT_FIELD;
  const sortOrder = String(order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  query += ` ORDER BY ${sortField} ${sortOrder}, created_at DESC`;

  return db.prepare(query).all(...(queryParams as any[])) as unknown as Application[];
}

export function getApplication(id: string): Application {
  if (!id || typeof id !== 'string') {
    throw new ValidationError('ID lamaran wajib disertakan');
  }

  const application = stmtGetById.get(id) as unknown as Application | undefined;

  if (!application) {
    throw new NotFoundError('Data lamaran tidak ditemukan');
  }

  return application;
}

export function createApplication(body: CreateApplicationDto): Application {
  validateRequiredFields(body);

  const id = crypto.randomUUID();
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];

  const status = body.status && VALID_STATUSES.includes(body.status) ? body.status : 'applied';
  const workMode = body.work_mode && VALID_WORK_MODES.includes(body.work_mode) ? body.work_mode : 'remote';
  const appliedDate = body.applied_date && typeof body.applied_date === 'string' && body.applied_date.trim()
    ? body.applied_date.trim()
    : today;

  stmtInsertApplication.run(
    id,
    body.company.trim(),
    body.role.trim(),
    status,
    workMode,
    sanitizeString(body.location),
    sanitizeString(body.salary),
    sanitizeString(body.job_url),
    appliedDate,
    sanitizeString(body.interview_date),
    sanitizeString(body.contact_info),
    sanitizeString(body.notes),
    now,
    now
  );

  return getApplication(id);
}

export function updateApplication(id: string, body: UpdateApplicationDto): Application {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Data pembaruan tidak valid');
  }

  const existing = getApplication(id);

  const updates: string[] = [];
  const params: any[] = [];

  if (body.company !== undefined) {
    if (typeof body.company !== 'string' || body.company.trim().length === 0) {
      throw new ValidationError('Nama perusahaan tidak boleh kosong');
    }
    updates.push('company = ?');
    params.push(body.company.trim());
  }

  if (body.role !== undefined) {
    if (typeof body.role !== 'string' || body.role.trim().length === 0) {
      throw new ValidationError('Posisi tidak boleh kosong');
    }
    updates.push('role = ?');
    params.push(body.role.trim());
  }

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      throw new ValidationError(`Status tidak valid. Pilihan: ${VALID_STATUSES.join(', ')}`);
    }
    updates.push('status = ?');
    params.push(body.status);
  }

  if (body.work_mode !== undefined) {
    if (!VALID_WORK_MODES.includes(body.work_mode)) {
      throw new ValidationError(`Tipe kerja tidak valid. Pilihan: ${VALID_WORK_MODES.join(', ')}`);
    }
    updates.push('work_mode = ?');
    params.push(body.work_mode);
  }

  if (body.location !== undefined) {
    updates.push('location = ?');
    params.push(sanitizeString(body.location));
  }

  if (body.salary !== undefined) {
    updates.push('salary = ?');
    params.push(sanitizeString(body.salary));
  }

  if (body.job_url !== undefined) {
    updates.push('job_url = ?');
    params.push(sanitizeString(body.job_url));
  }

  if (body.applied_date !== undefined) {
    if (typeof body.applied_date !== 'string' || body.applied_date.trim().length === 0) {
      throw new ValidationError('Tanggal lamaran tidak valid');
    }
    updates.push('applied_date = ?');
    params.push(body.applied_date.trim());
  }

  if (body.interview_date !== undefined) {
    updates.push('interview_date = ?');
    params.push(sanitizeString(body.interview_date));
  }

  if (body.contact_info !== undefined) {
    updates.push('contact_info = ?');
    params.push(sanitizeString(body.contact_info));
  }

  if (body.notes !== undefined) {
    updates.push('notes = ?');
    params.push(sanitizeString(body.notes));
  }

  if (updates.length === 0) {
    return existing;
  }

  updates.push('updated_at = ?');
  params.push(Date.now());

  params.push(id);
  const sql = `UPDATE applications SET ${updates.join(', ')} WHERE id = ?`;
  db.prepare(sql).run(...(params as any[]));

  return getApplication(id);
}

export function deleteApplication(id: string): { success: boolean; message: string; id: string } {
  // Validate existence first
  getApplication(id);

  const info = stmtDeleteById.run(id) as { changes?: number };

  if (!info || info.changes === 0) {
    throw new NotFoundError('Data lamaran tidak ditemukan');
  }

  return { success: true, message: 'Lamaran berhasil dihapus', id };
}

function validateRequiredFields(body: CreateApplicationDto): void {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Data lamaran tidak valid');
  }

  if (!body.company || typeof body.company !== 'string' || body.company.trim().length === 0) {
    throw new ValidationError('Nama perusahaan wajib diisi');
  }

  if (!body.role || typeof body.role !== 'string' || body.role.trim().length === 0) {
    throw new ValidationError('Posisi/pekerjaan wajib diisi');
  }
}

function sanitizeString(val: unknown): string | null {
  if (typeof val === 'string' && val.trim().length > 0) {
    return val.trim();
  }
  return null;
}
