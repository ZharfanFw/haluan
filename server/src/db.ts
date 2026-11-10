// @ts-ignore: node:sqlite types may be in preview depending on @types/node version
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const defaultDbPath = path.resolve(process.cwd(), process.cwd().endsWith('server') ? '../data/haluan.db' : './data/haluan.db');
const dbFilePath = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : defaultDbPath;

const dbDir = path.dirname(dbFilePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new DatabaseSync(dbFilePath);

// Optimize SQLite performance & reliability
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'applied',
      work_mode TEXT NOT NULL DEFAULT 'remote',
      location TEXT,
      salary TEXT,
      job_url TEXT,
      applied_date TEXT NOT NULL,
      interview_date TEXT,
      contact_info TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON applications(applied_date);
    CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company);
  `);
}
