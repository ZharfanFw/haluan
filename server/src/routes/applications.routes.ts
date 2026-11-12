import { Router } from 'express';
import * as service from '../services/application.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';

export const applicationsRouter = Router();

applicationsRouter.get(
  '/',
  asyncHandler((req, res) => {
    res.json(service.listApplications(req.query));
  })
);

applicationsRouter.get(
  '/:id',
  asyncHandler((req, res) => {
    res.json(service.getApplication(String(req.params.id)));
  })
);

applicationsRouter.post(
  '/',
  asyncHandler((req, res) => {
    const created = service.createApplication(req.body);
    res.status(201).json(created);
  })
);

applicationsRouter.patch(
  '/:id',
  asyncHandler((req, res) => {
    const updated = service.updateApplication(String(req.params.id), req.body);
    res.json(updated);
  })
);

applicationsRouter.delete(
  '/:id',
  asyncHandler((req, res) => {
    res.json(service.deleteApplication(String(req.params.id)));
  })
);
