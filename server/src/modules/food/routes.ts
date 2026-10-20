import { Router } from 'express';
import { z } from 'zod';
import { createFoodRequestSchema, safetyReviewSchema } from '@aaharaconnect/shared';
import { requireAuth } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import {
  cancelFoodRequestHandler,
  createFoodRequestHandler,
  getFoodRequestByIdHandler,
  listFoodRequestsHandler,
  safetyReviewHandler,
} from './controller';

export const foodRoutes = Router();

// Module 2 — Food and Donor Management endpoints
foodRoutes.post(
  '/',
  requireAuth,
  validateBody(createFoodRequestSchema),
  createFoodRequestHandler
);

foodRoutes.get(
  '/',
  requireAuth,
  listFoodRequestsHandler
);

foodRoutes.get(
  '/:id',
  requireAuth,
  getFoodRequestByIdHandler
);

foodRoutes.post(
  '/:id/cancel',
  requireAuth,
  cancelFoodRequestHandler
);

foodRoutes.post(
  '/:id/safety-review',
  requireAuth,
  requireRole('ADMIN'),
  validateBody(
    z.object({
      review: safetyReviewSchema.refine(r => r !== 'PENDING', {
        message: 'Review must be either APPROVED or REJECTED.',
      }),
    })
  ),
  safetyReviewHandler
);
