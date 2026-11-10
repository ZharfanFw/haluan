import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { db } from './db.js';
import { Application, ApplicationStats, CreateApplicationDto, UpdateApplicationDto } from './types.js';

export const router = Router();

const VALID_STATUSES = ['wishlist', 'applied', 'interviewing', 'offer', 'rejected'] as const;
const VALID_WORK_MODES = ['remote', 'hybrid', 'onsite'] as const;

// GET /api/stats
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM applications 
      GROUP BY status
    `).all() as unknown as { status: string; count: number }[];

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

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data statistik', details: String(error) });
  }
});

// GET /api/applications
router.get('/applications', (req: Request, res: Response) => {
  try {
    const { q, status, sortBy = 'applied_date', order = 'desc' } = req.query;

    let query = `SELECT * FROM applications WHERE 1=1`;
    const params: (string | number)[] = [];

    if (typeof status === 'string' && VALID_STATUSES.includes(status as any)) {
      query += ` AND status = ?`;
      params.push(status);
    }

    if (typeof q === 'string' && q.trim().length > 0) {
      query += ` AND (company LIKE ? OR role LIKE ? OR notes LIKE ? OR location LIKE ?)`;
      const searchTerm = `%${q.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const allowedSortFields = ['applied_date', 'created_at', 'company', 'status'];
    const sortField = allowedSortFields.includes(String(sortBy)) ? String(sortBy) : 'applied_date';
    const sortOrder = String(order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortField} ${sortOrder}, created_at DESC`;

    const stmt = db.prepare(query);
    const applications = stmt.all(...(params as any[])) as unknown as Application[];

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data lamaran', details: String(error) });
  }
});

// GET /api/applications/:id
router.get('/applications/:id', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const application = db.prepare(`SELECT * FROM applications WHERE id = ?`).get(id) as unknown as Application | undefined;

    if (!application) {
      res.status(404).json({ error: 'Data lamaran tidak ditemukan' });
      return;
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil detail lamaran', details: String(error) });
  }
});

// POST /api/applications
router.post('/applications', (req: Request, res: Response) => {
  try {
    const body = req.body as CreateApplicationDto;

    if (!body.company || body.company.trim().length === 0) {
      res.status(400).json({ error: 'Nama perusahaan wajib diisi' });
      return;
    }

    if (!body.role || body.role.trim().length === 0) {
      res.status(400).json({ error: 'Posisi/pekerjaan wajib diisi' });
      return;
    }

    const id = crypto.randomUUID();
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];

    const status = body.status && VALID_STATUSES.includes(body.status) ? body.status : 'applied';
    const workMode = body.work_mode && VALID_WORK_MODES.includes(body.work_mode) ? body.work_mode : 'remote';
    const appliedDate = body.applied_date && body.applied_date.trim() ? body.applied_date.trim() : today;

    const stmt = db.prepare(`
      INSERT INTO applications (
        id, company, role, status, work_mode, location, salary,
        job_url, applied_date, interview_date, contact_info, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      body.company.trim(),
      body.role.trim(),
      status,
      workMode,
      body.location?.trim() || null,
      body.salary?.trim() || null,
      body.job_url?.trim() || null,
      appliedDate,
      body.interview_date?.trim() || null,
      body.contact_info?.trim() || null,
      body.notes?.trim() || null,
      now,
      now
    );

    const created = db.prepare(`SELECT * FROM applications WHERE id = ?`).get(id) as unknown as Application;
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat data lamaran', details: String(error) });
  }
});

// PATCH /api/applications/:id
router.patch('/applications/:id', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const body = req.body as UpdateApplicationDto;

    const existing = db.prepare(`SELECT * FROM applications WHERE id = ?`).get(id) as unknown as Application | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Data lamaran tidak ditemukan' });
      return;
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (body.company !== undefined) {
      if (body.company.trim().length === 0) {
        res.status(400).json({ error: 'Nama perusahaan tidak boleh kosong' });
        return;
      }
      updates.push('company = ?');
      params.push(body.company.trim());
    }

    if (body.role !== undefined) {
      if (body.role.trim().length === 0) {
        res.status(400).json({ error: 'Posisi tidak boleh kosong' });
        return;
      }
      updates.push('role = ?');
      params.push(body.role.trim());
    }

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        res.status(400).json({ error: `Status tidak valid. Pilihan: ${VALID_STATUSES.join(', ')}` });
        return;
      }
      updates.push('status = ?');
      params.push(body.status);
    }

    if (body.work_mode !== undefined) {
      if (!VALID_WORK_MODES.includes(body.work_mode)) {
        res.status(400).json({ error: `Tipe kerja tidak valid. Pilihan: ${VALID_WORK_MODES.join(', ')}` });
        return;
      }
      updates.push('work_mode = ?');
      params.push(body.work_mode);
    }

    if (body.location !== undefined) {
      updates.push('location = ?');
      params.push(body.location?.trim() || null);
    }

    if (body.salary !== undefined) {
      updates.push('salary = ?');
      params.push(body.salary?.trim() || null);
    }

    if (body.job_url !== undefined) {
      updates.push('job_url = ?');
      params.push(body.job_url?.trim() || null);
    }

    if (body.applied_date !== undefined) {
      updates.push('applied_date = ?');
      params.push(body.applied_date.trim());
    }

    if (body.interview_date !== undefined) {
      updates.push('interview_date = ?');
      params.push(body.interview_date?.trim() || null);
    }

    if (body.contact_info !== undefined) {
      updates.push('contact_info = ?');
      params.push(body.contact_info?.trim() || null);
    }

    if (body.notes !== undefined) {
      updates.push('notes = ?');
      params.push(body.notes?.trim() || null);
    }

    if (updates.length === 0) {
      res.json(existing);
      return;
    }

    updates.push('updated_at = ?');
    params.push(Date.now());

    params.push(id);
    const sql = `UPDATE applications SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...(params as any[]));

    const updated = db.prepare(`SELECT * FROM applications WHERE id = ?`).get(id) as unknown as Application;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui lamaran', details: String(error) });
  }
});

// DELETE /api/applications/:id
router.delete('/applications/:id', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const stmt = db.prepare(`DELETE FROM applications WHERE id = ?`);
    const info = stmt.run(id) as { changes?: number };

    if (!info || info.changes === 0) {
      res.status(404).json({ error: 'Data lamaran tidak ditemukan' });
      return;
    }

    res.json({ success: true, message: 'Lamaran berhasil dihapus', id });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus lamaran', details: String(error) });
  }
});
