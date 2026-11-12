import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const TEST_DB_PATH = '/tmp/haluan-test.db';
process.env.DB_PATH = TEST_DB_PATH;
process.env.NODE_ENV = 'test';

// Dynamically import after setting environment variables
const { app } = await import('../src/index.js');
const { db } = await import('../src/db.js');

let server: any;
let baseUrl = '';

before(async () => {
  // Clean up any stale test database
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => {
      try {
        db.close();
      } catch {
        // Ignored if already closed
      }
      if (fs.existsSync(TEST_DB_PATH)) {
        try {
          fs.unlinkSync(TEST_DB_PATH);
        } catch {
          // Ignored
        }
      }
      resolve();
    });
  });
});

describe('Haluan API Test Suite', () => {
  describe('Health and Security Headers', () => {
    it('GET /health returns 200 with status ok and security headers', async () => {
      const res = await fetch(`${baseUrl}/health`);
      assert.equal(res.status, 200);

      const body = await res.json();
      assert.equal(body.status, 'ok');
      assert.equal(typeof body.uptime, 'number');

      // Security headers assertions
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
      assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
      assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
      assert.equal(res.headers.get('x-powered-by'), null);
    });
  });

  describe('Validation & Error Handling', () => {
    it('GET /api/stats returns all zero counts when database is empty', async () => {
      const res = await fetch(`${baseUrl}/api/stats`);
      assert.equal(res.status, 200);

      const stats = await res.json();
      assert.deepEqual(stats, {
        total: 0,
        wishlist: 0,
        applied: 0,
        interviewing: 0,
        offer: 0,
        rejected: 0,
      });
    });

    it('POST /api/applications fails if company is missing', async () => {
      const res = await fetch(`${baseUrl}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'Backend Engineer' }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /perusahaan/i);
    });

    it('POST /api/applications fails if role is missing', async () => {
      const res = await fetch(`${baseUrl}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: 'Acme Corp' }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /posisi/i);
    });

    it('POST /api/applications fails gracefully on invalid JSON', async () => {
      const res = await fetch(`${baseUrl}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json-payload',
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /JSON/i);
    });

    it('GET /api/applications/:id returns 404 for nonexistent id', async () => {
      const res = await fetch(`${baseUrl}/api/applications/non-existent-uuid`);
      assert.equal(res.status, 404);
      const data = await res.json();
      assert.match(data.error, /tidak ditemukan/i);
    });
  });

  describe('CRUD Lifecycle & Metrics Synchronization', () => {
    let createdId = '';

    it('POST /api/applications creates an application with defaults', async () => {
      const payload = {
        company: 'Stripe',
        role: 'Software Engineer',
        salary: '25.000.000',
        location: 'Jakarta',
      };

      const res = await fetch(`${baseUrl}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      assert.equal(res.status, 201);
      const data = await res.json();

      assert.ok(data.id);
      assert.equal(data.company, 'Stripe');
      assert.equal(data.role, 'Software Engineer');
      assert.equal(data.status, 'applied'); // default
      assert.equal(data.work_mode, 'remote'); // default
      assert.equal(data.salary, '25.000.000');
      assert.equal(data.location, 'Jakarta');
      assert.ok(data.created_at);

      createdId = data.id;
    });

    it('GET /api/applications/:id fetches the created application', async () => {
      const res = await fetch(`${baseUrl}/api/applications/${createdId}`);
      assert.equal(res.status, 200);

      const data = await res.json();
      assert.equal(data.id, createdId);
      assert.equal(data.company, 'Stripe');
    });

    it('GET /api/applications lists applications and supports search filtering', async () => {
      // Should match
      const res1 = await fetch(`${baseUrl}/api/applications?q=Stripe`);
      const data1 = await res1.json();
      assert.equal(data1.length, 1);
      assert.equal(data1[0].id, createdId);

      // Should not match
      const res2 = await fetch(`${baseUrl}/api/applications?q=NonExistentCompany`);
      const data2 = await res2.json();
      assert.equal(data2.length, 0);
    });

    it('GET /api/stats reflects the newly created application', async () => {
      const res = await fetch(`${baseUrl}/api/stats`);
      assert.equal(res.status, 200);

      const stats = await res.json();
      assert.equal(stats.total, 1);
      assert.equal(stats.applied, 1);
      assert.equal(stats.interviewing, 0);
    });

    it('PATCH /api/applications/:id updates application status and fields', async () => {
      const res = await fetch(`${baseUrl}/api/applications/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'interviewing',
          interview_date: '2026-11-20',
          notes: 'User interview scheduled',
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.status, 'interviewing');
      assert.equal(data.interview_date, '2026-11-20');
      assert.equal(data.notes, 'User interview scheduled');
    });

    it('PATCH /api/applications/:id rejects invalid status or work mode', async () => {
      const res1 = await fetch(`${baseUrl}/api/applications/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'invalid_status_value' }),
      });
      assert.equal(res1.status, 400);

      const res2 = await fetch(`${baseUrl}/api/applications/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ work_mode: 'invalid_mode' }),
      });
      assert.equal(res2.status, 400);
    });

    it('GET /api/stats reflects the status update', async () => {
      const res = await fetch(`${baseUrl}/api/stats`);
      assert.equal(res.status, 200);

      const stats = await res.json();
      assert.equal(stats.total, 1);
      assert.equal(stats.applied, 0);
      assert.equal(stats.interviewing, 1);
    });

    it('DELETE /api/applications/:id deletes the application', async () => {
      const res = await fetch(`${baseUrl}/api/applications/${createdId}`, {
        method: 'DELETE',
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);

      // Verify it is no longer found
      const getRes = await fetch(`${baseUrl}/api/applications/${createdId}`);
      assert.equal(getRes.status, 404);

      // Verify stats reset to 0
      const statsRes = await fetch(`${baseUrl}/api/stats`);
      const stats = await statsRes.json();
      assert.equal(stats.total, 0);
      assert.equal(stats.interviewing, 0);
    });
  });
});
