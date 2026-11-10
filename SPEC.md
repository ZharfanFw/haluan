# Technical Specification: Minimalist Job Application Tracker

> **Status**: DRAFT (Awaiting User Review & Sign-Off)  
> **Target Environment**: Self-hosted on Home Server (ThinkPad X200 / Intel Core 2 Duo, Node.js LTS, Docker)  
> **Design Philosophy**: Minimalist, fast, anti-fatigue, zero AI-slop UI, rock-solid SQLite persistence.

---

## 1. Overview & Problem Statement

### 1.1 The Problem
When actively applying to dozens of job listings, spreadsheet tracking often feels tedious and unmotivating, while complex CRM/Job platforms are bloated with unnecessary fields, sluggish interfaces, and confusing layouts. The user needs an intuitive, visually clear tracker that reduces friction to zero and makes the progress visible at a glance.

### 1.2 Target Hardware Constraints (ThinkPad X200)
- **CPU**: Intel Core 2 Duo (x86_64 legacy architecture, **no AVX/AVX2** support).
- **Runtime**: **Node.js LTS** (Bun cannot be used due to AVX2 / instruction set incompatibility on Core 2 Duo).
- **RAM**: Typically 4GB–8GB DDR3. The system must maintain a tiny memory footprint (< 150MB total).
- **Database**: Embedded **SQLite** in WAL mode. Zero background daemon overhead, zero network latency, instant snapshot backups via single-file copy.

---

## 2. Core User Experience & UI Principles (Anti-Slop Standard)

### 2.1 Anti-Fatigue Quick Entry
- To prevent user burnout when logging multiple jobs, **only two fields are required**: `Company Name` and `Role Title`.
- Everything else (salary, URL, location, notes, date) is optional and can be filled in seconds or updated later.

### 2.2 Dual View Layout
1. **Kanban Board View (Default)**:
   - Columns: `Wishlist` → `Applied` → `Interviewing` → `Offer` → `Rejected`.
   - Cards display: Company name, Role, Work Mode badge (Remote/Hybrid/Onsite), Applied date, Salary badge (if provided).
   - Fluid drag-and-drop or single-click status progression to deliver instant tactile satisfaction.
2. **Table / Spreadsheet View**:
   - Compact table for bulk scanning, sorting by date, and instant multi-column filtering.

### 2.3 Visual Polish & 4-State Engineering
- **Color Palette**: Neutral dark/light zinc grays, clean typography, purposeful contrast (ratio >= 4.5:1). No purple gradients or glowing borders.
- **Micro-metrics Bar**: Top counter showing `Total Applications`, `Active Pipeline`, `Interviews`, `Offers`.
- **4 States Enforcement**:
  - *Skeleton Loading*: Matches card/table shapes to eliminate Layout Shift (CLS).
  - *Empty State*: Helpful icon + context + primary "+ Tambah Lamaran Pertama" CTA.
  - *Error State*: Plain language message + "Coba Lagi" action.
  - *Success State*: Crisp data rendering with keyboard accessibility (`Esc` closes modals, `Tab` navigates inputs).

---

## 3. Data Schema & Architecture

### 3.1 Database: SQLite Schema (`jobs.db`)

```sql
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,                       -- CUID or UUID string
  company TEXT NOT NULL,                     -- Nama Perusahaan
  role TEXT NOT NULL,                        -- Posisi / Jabatan
  status TEXT NOT NULL DEFAULT 'applied',    -- 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected'
  work_mode TEXT NOT NULL DEFAULT 'remote',  -- 'remote' | 'hybrid' | 'onsite'
  location TEXT,                             -- e.g. "Jakarta", "Singapore", "Remote - ID"
  salary TEXT,                               -- e.g. "Rp 15.000.000 - 20.000.000"
  job_url TEXT,                              -- Link postingan loker
  applied_date TEXT NOT NULL,                -- Format YYYY-MM-DD
  interview_date TEXT,                       -- Tanggal wawancara berikutnya (jika ada)
  contact_info TEXT,                         -- Kontak HR / Recruiter (Email, LinkedIn, WhatsApp)
  notes TEXT,                                -- Catatan bebas, pertanyaan interview, evaluasi
  created_at INTEGER NOT NULL,               -- Unix epoch timestamp (ms)
  updated_at INTEGER NOT NULL                -- Unix epoch timestamp (ms)
);

CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON applications(applied_date);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company);
```

---

## 4. REST API Contracts

| Method | Endpoint | Description | Request Body / Query |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/applications` | List applications with filter & search | `?q=search&status=applied&sort=date` |
| `POST` | `/api/applications` | Create new application | JSON payload (company & role required) |
| `GET` | `/api/applications/:id` | Get application detail | None |
| `PATCH` | `/api/applications/:id` | Partial update (status move, edit data) | JSON payload with fields to update |
| `DELETE` | `/api/applications/:id` | Delete application | None |
| `GET` | `/api/stats` | Pipeline count summary | None |

---

## 5. Recommended Tech Stack Options

### Option A: Next.js 14/15 (App Router) + SQLite + Tailwind CSS + Lucide Icons (Recommended)
- **Architecture**: Single unified project. Frontend React components and Backend API routes run under Node.js LTS in one process.
- **ORM / DB**: Better-SQLite3 with Drizzle ORM (lightweight, zero runtime compilation issues).
- **Deployment**: Standalone Node output (`node server.js`) or single lightweight Docker container (~100MB RAM usage).
- **Pros**: Super easy to maintain, single port, standard in industry, hot reloading during local development.

### Option B: Vite + React (SPA) + Express/Node Backend API
- **Architecture**: Separate frontend build served statically by a lightweight Node.js Express server.
- **RAM**: ~40MB RAM.
- **Pros**: Even lighter memory footprint on vintage hardware.

---

## 6. Verification & Acceptance Criteria

1. **Functional Tests**:
   - [ ] Creating an application with only `company` and `role` succeeds.
   - [ ] Dragging or updating status between columns updates the database immediately.
   - [ ] Search filter matches company and role accurately in real-time.
   - [ ] Stats counter updates dynamically when an application is added/moved/deleted.
2. **Performance & Hardware Check**:
   - [ ] Starts up under standard Node.js without AVX2 instructions.
   - [ ] Idling memory footprint is verified below 150MB.
   - [ ] Single SQLite file persists on disk (`data/jobs.db`).
3. **UI/UX Quality**:
   - [ ] No layout shift during loading.
   - [ ] Clean empty state when no jobs are present.
   - [ ] Accessible modal dialogs with `Esc` key handling and autofocus.
