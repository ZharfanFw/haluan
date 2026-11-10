# Haluan (Personal Career Application Tracker)

A lightweight, distraction-free career application tracker built for speed, clarity, and zero tracking fatigue. Designed specifically to run smoothly on self-hosted environments (such as a vintage home server / ThinkPad X200) with minimal RAM usage (< 50MB) and zero external database dependencies.

---

## Features

- **Anti-Fatigue Quick Add**: Only 2 required fields (*Company* and *Role*). Log an application in under 3 seconds so marathon job applications don't feel like a chore.
- **Dual View Layout**:
  - **Kanban Board**: Visually track stages (*Wishlist -> Applied -> Interviewing -> Offer -> Rejected*) with 1-click stage advancement.
  - **Table View**: Compact spreadsheet style with search, sorting by date/company, and instant status updates.
- **Pipeline Statistics Bar**: Top summary metrics with 1-click filter toggle.
- **UI Anti-Slop Design**: Dark zinc minimalist aesthetic, high-contrast typography, zero unneeded neon gradients, and strict 4-state handling (Skeleton loading, friendly Empty state, Error retry, and Data views).
- **Rock-Solid Local Persistence**: Embedded SQLite database (`node:sqlite`) with WAL mode. Zero setup, zero memory bloat, atomic backups.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, Lucide Icons, TypeScript |
| **Backend** | Express 4, Node.js 22 LTS, TypeScript |
| **Database** | Embedded SQLite (`node:sqlite` in WAL mode) |
| **Container** | Multi-stage Docker (`node:22-alpine`), Docker Compose |

---

## Cara Menjalankan

### 1. Menjalankan di Mode Development (Lokal)

```bash
# 1. Install dependensi
npm install

# 2. Jalankan server backend dan client secara bersamaan
npm run dev
```

- Frontend akan berjalan di: `http://localhost:5173`
- Backend API akan berjalan di: `http://localhost:3000`

---

### 2. Menjalankan di Homeserver Menggunakan Docker (Rekomendasi)

Cukup gunakan satu perintah Docker Compose:

```bash
# Build dan jalankan container di background
docker compose up -d --build
```

Aplikasi langsung dapat diakses di browser jaringan lokal kamu melalui:
`http://<IP-HOMESERVER>:3000`

Semua data lamaran tersimpan dengan aman di folder `./data/jobs.db` pada host machine kamu.

#### Untuk Menghentikan atau Update:

```bash
# Melihat log aplikasi
docker compose logs -f

# Menghentikan container
docker compose down

# Update aplikasi setelah pull code baru
docker compose up -d --build
```

---

### 3. Backup Data

Karena database menggunakan SQLite tunggal di folder `./data`, kamu cukup menyalin file:
```bash
cp data/jobs.db ~/backup-jobs-$(date +%F).db
```

---

## Struktur Direktori

```text
job-tracker/
├── client/                 # Vite + React (Frontend SPA)
│   ├── src/
│   │   ├── components/     # Navbar, KanbanBoard, TableView, QuickAddModal, DetailDrawer, StatsBanner
│   │   ├── lib/            # API fetchers & utils
│   │   ├── types.ts        # Shared TypeScript interfaces
│   │   ├── App.tsx         # Main application controller
│   │   └── main.tsx
│   └── vite.config.ts
├── server/                 # Express API (Backend)
│   ├── src/
│   │   ├── db.ts           # SQLite setup & schema initialization
│   │   ├── routes.ts       # REST endpoints (/api/applications, /api/stats)
│   │   └── index.ts        # Entry point & static client server
│   └── tsconfig.json
├── data/                   # Folder database SQLite (dimount di Docker)
├── Dockerfile              # Multi-stage production container build
├── docker-compose.yml      # Konfigurasi deployment homeserver
├── SPEC.md                 # Dokumen spesifikasi teknis arsitektur
├── PROJECT_STATE.md        # Catatan status & histori keputusan proyek
└── package.json            # Root workspaces configuration
```
