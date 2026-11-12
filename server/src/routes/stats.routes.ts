import { Router } from 'express';
import { getStats } from '../services/application.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';

export const statsRouter = Router();

statsRouter.get(
  '/',
  asyncHandler((_req, res) => {
    res.json(getStats());
  })
);
