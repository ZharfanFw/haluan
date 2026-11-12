# Project State: Haluan (Personal Career Application Tracker)

## Current Milestone: Milestone 2 - Codebase Modularization, Hardening & Automated Testing
- **Status**: COMPLETED & VERIFIED
- **Architecture**: Vite 6 + React 18 SPA + Express.js API (TypeScript)
- **Database**: Embedded SQLite (`node:sqlite` in WAL mode) in `data/haluan.db`
- **Deployment**: Docker (`node:22-slim`) + Docker Compose for ThinkPad X200 home server
- **Design Standard**: UI Anti-Slop (Minimalist, dark zinc aesthetic, 4-state component handling)
- **Modular Docs**: Tracked in `docs/` and `docs/tasks/`

## Architecture Decisions
1. **Node.js LTS over Bun**: Selected because target host is a ThinkPad X200 (Intel Core 2 Duo) which lacks AVX2 instruction support.
2. **Native `node:sqlite`**: Leveraged Node 22's built-in SQLite engine (`DatabaseSync`) to eliminate C++ compilation, `python3`, `make`, and `node-gyp` dependencies. This guarantees fast, zero-failure Docker builds on vintage hardware.
3. **Unified Single-Port Deployment**: Express serves both `/api/*` and compiled Vite static assets (`/client/dist`) in production on port 3000.
4. **Centralized Error Handling & Prepared Statements**: Implemented Express error middleware and static prepared statement caching to eliminate per-request SQL re-compilation.
5. **Zero-Dependency Security**: Hardened with native 500KB JSON payload caps, `x-powered-by` disabling, and defensive HTTP security headers.
6. **Single Source of Truth for Types**: Consolidated domain interfaces in `shared/types.d.ts` without extra package overhead.
7. **Client State Synchronization & Race Condition Protection**: Immediate optimistic state updates on drawer edits and 300ms debounced search with `AbortController` cancellation.
8. **Built-in `node:test` Suite**: 14 automated tests covering health checks, security headers, validation boundaries, and CRUD metrics without external testing libraries.

## Verification Log
- [x] `npm run typecheck` passed across server and client with 0 errors.
- [x] `npm test` passed 14/14 tests in 1.1s.
- [x] `npm run build` production bundle succeeded for both client (3.35s) and server.
- [x] Modular task documentation updated in [docs/TASKS.md](file:///home/zharfanfw/documents/my-project/job-tracker/docs/TASKS.md).
