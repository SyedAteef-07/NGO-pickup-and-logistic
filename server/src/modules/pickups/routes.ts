import { Router } from 'express';
import { uuidSchema } from '@aaharaconnect/shared';
import { requireAuth } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/authorize';
import { HttpError } from '../../middleware/errorHandler';
import { sendSuccess } from '../../utils/response';
import { listVehicleAssignments } from './vehicleAssignments';

// Team 3 owns assignment creation, reservations, and pickup transitions.
export const pickupRoutes = Router();

// This Module 3 projection is the sole source for Module 5's assigned-people view.
export const vehicleAssignmentRoutes = Router();
vehicleAssignmentRoutes.get('/:vehicleId/assignments', requireAuth, requireRole('ADMIN'), async (request, response, next) => {
  try {
    const id = uuidSchema.safeParse(request.params.vehicleId);
    if (!id.success) throw new HttpError(400, 'VALIDATION_ERROR', 'Vehicle ID must be a UUID.');
    sendSuccess(response, await listVehicleAssignments(id.data));
  } catch (error) { next(error); }
});
