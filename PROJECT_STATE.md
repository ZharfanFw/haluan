# Project State: Haluan (Personal Career Application Tracker)

## Current Milestone: Milestone 1 - Full Vertical Slice Implementation & Verified
- **Status**: COMPLETED & VERIFIED
- **Architecture**: Vite 6 + React 18 SPA + Express.js API (TypeScript)
- **Database**: Embedded SQLite (`node:sqlite` in WAL mode) in `data/haluan.db`
- **Deployment**: Docker (`node:22-alpine`) + Docker Compose for ThinkPad X200 home server
- **Design Standard**: UI Anti-Slop (Minimalist, dark zinc aesthetic, 4-state component handling)

## Architecture Decisions
1. **Node.js LTS over Bun**: Selected because target host is a ThinkPad X200 (Intel Core 2 Duo) which lacks AVX2 instruction support.
2. **Native `node:sqlite`**: Leveraged Node 22's built-in SQLite engine (`DatabaseSync`) to eliminate C++ compilation, `python3`, `make`, and `node-gyp` dependencies. This guarantees fast, zero-failure Docker builds on vintage hardware.
3. **Unified Single-Port Deployment**: Express serves both `/api/*` and compiled Vite static assets (`/client/dist`) in production on port 3000.
4. **Anti-Fatigue Quick Add**: Only `company` and `role` are mandatory for adding an application.
5. **Dual View**: Kanban Board + Spreadsheet Table with in-place status shift and fast search/filtering.

## Verification Log
- [x] Client TypeScript compilation & Vite production build passed (4.13s).
- [x] Server TypeScript compilation passed.
- [x] Integration suite passed all 9 deterministic end-to-end checks:
  - Health check (`/health`)
  - Initial empty stats (`/api/stats`)
  - Application creation (`POST /api/applications`)
  - Query & sorting (`GET /api/applications`)
  - Full-text search (`GET /api/applications?q=...`)
  - Status updates (`PATCH /api/applications/:id`)
  - Pipeline metrics sync (`GET /api/stats`)
  - Deletion (`DELETE /api/applications/:id`)
  - Static SPA serving (`GET /`)
- [x] Dockerfile & docker-compose.yml configured for single-command homeserver deployment with mounted `./data`.
