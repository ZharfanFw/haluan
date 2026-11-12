import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle invalid JSON body syntax errors from express.json()
  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400 && 'body' in err) {
    res.status(400).json({ error: 'Format JSON payload tidak valid' });
    return;
  }

  // Handle payload entity too large (exceeds limit)
  if (typeof err === 'object' && err !== null && 'type' in err && (err as { type: string }).type === 'entity.too.large') {
    res.status(413).json({ error: 'Ukuran payload melebihi batas maksimum (500KB)' });
    return;
  }

  // Handle known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Handle unexpected errors
  const message = err instanceof Error ? err.message : String(err);
  console.error('[Unhandled Error]', err);

  res.status(500).json({
    error: 'Terjadi kesalahan internal pada server',
    details: process.env.NODE_ENV === 'production' ? undefined : message,
  });
}

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => unknown
) => (req: Request, res: Response, next: NextFunction): void => {
  try {
    const result = fn(req, res, next);
    if (result instanceof Promise) {
      result.catch(next);
    }
  } catch (err) {
    next(err);
  }
};
