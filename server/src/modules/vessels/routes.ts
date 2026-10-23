import { Router } from 'express';
import { requireAuth } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import {
  createVesselLogSchema,
  createVesselSchema,
  issueVesselSchema,
  returnVesselSchema,
  updateVesselSchema,
} from '@aaharaconnect/shared';
import {
  addVesselLogHandler,
  createVesselHandler,
  deleteVesselHandler,
  getVesselByIdHandler,
  getVesselsSummaryHandler,
  issueVesselHandler,
  listVesselLogsHandler,
  listVesselsHandler,
  returnVesselHandler,
  updateVesselHandler,
} from './controller';

export const vesselRoutes = Router();

// Metrics & Issuance endpoints (must precede /:id)
vesselRoutes.get('/summary', requireAuth, requireRole('ADMIN'), getVesselsSummaryHandler);
vesselRoutes.post('/issue', requireAuth, requireRole('ADMIN'), validateBody(issueVesselSchema), issueVesselHandler);

// Standard CRUD
vesselRoutes.get('/', requireAuth, requireRole('ADMIN'), listVesselsHandler);
vesselRoutes.post('/', requireAuth, requireRole('ADMIN'), validateBody(createVesselSchema), createVesselHandler);
vesselRoutes.get('/:id', requireAuth, requireRole('ADMIN'), getVesselByIdHandler);
vesselRoutes.patch('/:id', requireAuth, requireRole('ADMIN'), validateBody(updateVesselSchema), updateVesselHandler);
vesselRoutes.delete('/:id', requireAuth, requireRole('ADMIN'), deleteVesselHandler);

// Return vessel from pickup
vesselRoutes.post('/:id/return', requireAuth, requireRole('ADMIN'), validateBody(returnVesselSchema), returnVesselHandler);

// Vessel cleaning, inspection, and maintenance logs
vesselRoutes.get('/:id/logs', requireAuth, requireRole('ADMIN'), listVesselLogsHandler);
vesselRoutes.post('/:id/logs', requireAuth, requireRole('ADMIN'), validateBody(createVesselLogSchema), addVesselLogHandler);
