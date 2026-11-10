# Technical Specification: Minimalist Job Application Tracker

> **Status**: APPROVED  
> **Architecture**: Vite + React SPA + Express.js API (TypeScript)  
> **Database**: Embedded SQLite (via better-sqlite3)  
> **Deployment**: Docker & Docker Compose on Home Server (ThinkPad X200 / Intel Core 2 Duo, Node.js 20/22 LTS)  
> **Design Philosophy**: Minimalist, fast, anti-fatigue, zero AI-slop UI, rock-solid persistence.

---

## 1. Overview & Constraints

### 1.1 The Objective
A lightweight, lightning-fast job tracker designed for active job hunting. It eliminates tracking friction with a 2-field quick entry ("Anti-Fatigue"), provides instant visual status progression across application stages, and operates with a clean, distraction-free minimalist aesthetic.

### 1.2 Target Hardware & Deployment Environment (ThinkPad X200)
- **CPU**: Intel Core 2 Duo (x86_64 legacy architecture, **no AVX/AVX2** support).
- **Runtime**: **Node.js LTS (v20 / v22)**.
- **Containerization**: Single multi-stage **Docker** container exposing 1 port (e.g. `3000`).
  - Express serves both `/api/*` and the compiled static Vite frontend (`/client/dist`).
  - SQLite data directory (`/app/data`) mounted to host directory (`./data`) for simple snapshot backups.
- **Memory Footprint**: Target `< 60MB RAM` under idle/normal usage.

---

## 2. Application Flow & Status Pipeline

### 2.1 Stages
1. **Wishlist**: Discovered jobs to apply for later.
2. **Applied**: Submitted applications awaiting response (Default stage).
3. **Interviewing**: Active interview stages (HR screen, technical test, user interview).
4. **Offer**: Received job offer (salary, terms).
5. **Rejected**: Application closed or rejected (archived with optional feedback notes).

### 2.2 Core Features
- **Anti-Fatigue Quick-Add**: Only `company` and `role` are required. Quick modal pops up, user inputs in 3 seconds, hits `Enter`, card appears immediately.
- **Dual View Layout**:
  - **Kanban Board**: Drag & drop or 1-click status shift between columns.
  - **Table View**: Compact spreadsheet style with search, filter by status, sort by date.
- **Quick Metrics**: Header summary showing count of Total, Applied, Interviewing, Offers, and Rejections.
- **Application Detail & Notes**: Slide-out drawer / modal for tracking recruiter contacts, interview dates, salary notes, and job post link.

---

## 3. UI/UX Design System (Anti-Slop Standards)

- **Color Palette**: Neutral dark/light zinc grays (`#09090b` / `#18181b` / `#27272a`), subtle high-contrast borders (`#27272a`), crisp white text (`#fafafa`) and muted subtext (`#a1a1aa`).
- **Stage Badges**:
  - Wishlist: Slate (`bg-zinc-800 text-zinc-300`)
  - Applied: Blue (`bg-blue-950/60 text-blue-400 border-blue-800/50`)
  - Interviewing: Amber / Purple (`bg-amber-950/60 text-amber-400 border-amber-800/50`)
  - Offer: Emerald (`bg-emerald-950/60 text-emerald-400 border-emerald-800/50`)
  - Rejected: Rose / Muted (`bg-zinc-900 text-zinc-500 border-zinc-800`)
- **4 States Rule**:
  - **Skeleton**: Exact layout dimensions during initial fetch.
  - **Empty**: Informative icon + "Belum ada lowongan di tahap ini" + Quick Add CTA.
  - **Error**: Clear error message + "Coba Lagi" button.
  - **Success**: Smooth transitions, accessible keyboard interactions (`Esc` closes modals, `Tab` focus ring).

---

## 4. Data Schema (`data/jobs.db`)

```sql
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,                       -- Nanoid or UUID string
  company TEXT NOT NULL,                     -- Nama Perusahaan
  role TEXT NOT NULL,                        -- Posisi / Jabatan
  status TEXT NOT NULL DEFAULT 'applied',    -- 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected'
  work_mode TEXT NOT NULL DEFAULT 'remote',  -- 'remote' | 'hybrid' | 'onsite'
  location TEXT,                             -- e.g. "Jakarta", "Singapore", "Remote"
  salary TEXT,                               -- e.g. "Rp 15.000.000 - 20.000.000"
  job_url TEXT,                              -- Link postingan loker
  applied_date TEXT NOT NULL,                -- Format YYYY-MM-DD
  interview_date TEXT,                       -- Tanggal wawancara berikutnya
  contact_info TEXT,                         -- Kontak HR / Recruiter (Email, LinkedIn, WhatsApp)
  notes TEXT,                                -- Catatan bebas, evaluasi, tech stack
  created_at INTEGER NOT NULL,               -- Unix epoch timestamp (ms)
  updated_at INTEGER NOT NULL                -- Unix epoch timestamp (ms)
);

CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON applications(applied_date);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company);
```

---

## 5. REST API Endpoints (Express)

- `GET /api/applications`: List applications (supports `?q=`, `?status=`, `?sortBy=`, `?order=`)
- `POST /api/applications`: Create new application (validates `company` and `role`)
- `GET /api/applications/:id`: Fetch single application
- `PATCH /api/applications/:id`: Update application fields / status
- `DELETE /api/applications/:id`: Delete application
- `GET /api/stats`: Aggregate counts by stage

---

## 6. Project Architecture

```text
job-tracker/
├── server/                 # Express backend (TypeScript)
│   ├── src/
│   │   ├── db.ts           # SQLite connection & schema migrations
│   │   ├── routes.ts       # Express routes for /api
│   │   └── index.ts        # Express entry point & static server
│   ├── tsconfig.json
│   └── package.json
├── client/                 # Vite + React (TypeScript + Tailwind CSS)
│   ├── src/
│   │   ├── components/     # KanbanBoard, TableView, QuickAddModal, DetailDrawer, StatsBar
│   │   ├── lib/api.ts      # API fetch client
│   │   ├── types.ts        # TypeScript definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
├── data/                   # SQLite database (mounted in Docker)
├── Dockerfile              # Multi-stage production container build
├── docker-compose.yml      # Local / homeserver compose setup
├── package.json            # Root runner scripts (npm run dev, npm run build)
├── SPEC.md
└── PROJECT_STATE.md
```

---

## 7. Verification & Acceptance Criteria

1. **Docker & Hardware Compatibility**:
   - Container builds cleanly with multi-stage Dockerfile using `node:20-alpine`.
   - Starts without requiring AVX/AVX2 CPU flags.
   - Database persists cleanly in mounted `./data/jobs.db`.
2. **API & Data Layer**:
   - Validation rejects requests missing `company` or `role`.
   - SQLite indexes confirm fast queries.
3. **Frontend UX**:
   - Quick Add modal submits in under 3 seconds.
   - Status transitions (drag & drop / click) update instantly with optimistic UI or quick refresh.
   - 4-state UI handling with zero layout shift.
