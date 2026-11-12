# TASK-02: Server Architecture & Security Hardening

- **Status**: ✅ Completed
- **Target Area**: `server/src/`
- **Dependencies**: TASK-01

## Objective
Elevate backend architecture by centralizing error-handling middleware, caching SQLite prepared statements to avoid query re-compilation, and introducing zero-dependency security hardening (body payload limits and essential security headers).

## Completed Work
1. **Centralized Error Handling Middleware**:
   - Implemented standard Express error middleware in [server/src/middleware/error.middleware.ts](file:///home/zharfanfw/documents/my-project/job-tracker/server/src/middleware/error.middleware.ts).
   - Handled `ValidationError` (400), `NotFoundError` (404), invalid JSON syntax (400), payload entity too large (413), and unexpected server errors (500).
   - Created `asyncHandler` wrapper and replaced repetitive `handleError` try/catch blocks across [applications.routes.ts](file:///home/zharfanfw/documents/my-project/job-tracker/server/src/routes/applications.routes.ts) and [stats.routes.ts](file:///home/zharfanfw/documents/my-project/job-tracker/server/src/routes/stats.routes.ts).
   - Extended typed `AppError` base class with prototypes intact in [server/src/errors.ts](file:///home/zharfanfw/documents/my-project/job-tracker/server/src/errors.ts).

2. **Prepared Statement Caching**:
   - In [server/src/services/application.service.ts](file:///home/zharfanfw/documents/my-project/job-tracker/server/src/services/application.service.ts), prepared static queries once at module load (`stmtGetStats`, `stmtGetById`, `stmtDeleteById`, `stmtInsertApplication`, and `stmtListDefault`).
   - Eliminated SQL re-compilation per request on high-frequency endpoints.
   - Added runtime type boundary verification on string and object arguments to prevent runtime `TypeError` crashes.

3. **Native Security & Memory Protection**:
   - Configured `express.json({ limit: '500kb' })` in [server/src/index.ts](file:///home/zharfanfw/documents/my-project/job-tracker/server/src/index.ts) to protect memory on low-spec hardware.
   - Disabled `x-powered-by` header.
   - Attached standard defensive security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`) natively with 0 dependencies.

## Verification
- [x] `npx --workspace=server tsc --noEmit` passed with 0 errors.
- [x] `npm run build:server` built TypeScript bundle cleanly.
- [x] Client production build (`npm run build:client`) succeeded in 4.46s.
