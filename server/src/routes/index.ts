import { Router } from 'express';
import { applicationsRouter } from './applications.routes.js';
import { statsRouter } from './stats.routes.js';

export const router = Router();

router.use('/applications', applicationsRouter);
router.use('/stats', statsRouter);
