# Project State: Minimalist Job Application Tracker

## Current Milestone: Milestone 0 - Project Setup & Architecture Approval
- **Status**: Ready to scaffold
- **Architecture**: Vite + React SPA + Express.js API (TypeScript)
- **Database**: SQLite (`data/jobs.db`) via `better-sqlite3`
- **Deployment**: Docker & Docker Compose (`node:20-alpine`) for ThinkPad X200 home server
- **Design Standard**: UI Anti-Slop (Minimalist, dark zinc aesthetic, 4-state component handling)

## Architecture Decisions
1. **Node.js LTS over Bun**: Selected because target host is a ThinkPad X200 (Intel Core 2 Duo) which lacks AVX2 instruction support.
2. **Embedded SQLite over External DB**: Zero RAM overhead, no second container, atomic backups via single-file copy.
3. **Unified Single-Port Deployment**: Express serves both `/api/*` and compiled Vite static assets in production, simplifying reverse-proxy and Docker port mapping.
4. **Anti-Fatigue Quick Add**: Only `company` and `role` are mandatory for adding an application.

## Next Steps (Vertical Slice)
1. Initialize root workspace `package.json` and directory structure.
2. Build Express server (`server/`) with SQLite schema, validation, and REST endpoints.
3. Verify backend endpoints with automated test / curl verification.
4. Scaffold Vite React frontend (`client/`) with Tailwind CSS and Lucide icons.
5. Implement Kanban Board & Table views with 4-state UI.
6. Create `Dockerfile` & `docker-compose.yml` and test build.
