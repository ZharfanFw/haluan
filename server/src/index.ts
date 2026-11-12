import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { db, initDatabase } from './db.js';
import { router as apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB schema
initDatabase();

export const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security hygiene: disable fingerprinting and set defensive headers
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(cors());
app.use(express.json({ limit: '500kb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// API Routes
app.use('/api', apiRouter);

// Production static assets serving (from Vite build)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[Server] Serving static client from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // Catch-all route to support client-side SPA routing
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized error handling middleware (must be registered after all routes)
app.use(errorHandler);

// Only listen when executed directly (not when imported in test runners)
let server: ReturnType<typeof app.listen> | null = null;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Haluan API running on http://0.0.0.0:${PORT}`);
  });
}

// Graceful shutdown
function gracefulShutdown(signal: string) {
  console.log(`[Server] Received ${signal}. Closing gracefully...`);
  if (server) {
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      db.close();
      console.log('[Server] SQLite connection closed.');
      process.exit(0);
    });
  } else {
    db.close();
    process.exit(0);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
