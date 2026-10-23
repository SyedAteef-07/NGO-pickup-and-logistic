import { Router } from 'express';
import { requireAuth } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import {
  createVehicleMaintenanceRecordSchema,
  createVehicleSchema,
  updateVehicleSchema,
} from '@aaharaconnect/shared';
import {
  createMaintenanceHandler,
  createVehicleHandler,
  deleteVehicleHandler,
  getFleetSummaryHandler,
  getVehicleByIdHandler,
  listDriversHandler,
  listMaintenanceHandler,
  listVehiclesHandler,
  updateVehicleHandler,
} from './controller';

export const vehicleRoutes = Router();

const vehicleSubRouter = Router();
const driverSubRouter = Router();

// Summary / metrics endpoint must precede /:id to prevent matching 'summary' as an ID
vehicleSubRouter.get('/summary', requireAuth, requireRole('ADMIN'), getFleetSummaryHandler);
vehicleSubRouter.get('/', requireAuth, requireRole('ADMIN'), listVehiclesHandler);
vehicleSubRouter.post('/', requireAuth, requireRole('ADMIN'), validateBody(createVehicleSchema), createVehicleHandler);
vehicleSubRouter.get('/:id', requireAuth, requireRole('ADMIN'), getVehicleByIdHandler);
vehicleSubRouter.patch('/:id', requireAuth, requireRole('ADMIN'), validateBody(updateVehicleSchema), updateVehicleHandler);
vehicleSubRouter.delete('/:id', requireAuth, requireRole('ADMIN'), deleteVehicleHandler);
vehicleSubRouter.get('/:id/maintenance', requireAuth, requireRole('ADMIN'), listMaintenanceHandler);
vehicleSubRouter.post(
  '/:id/maintenance',
  requireAuth,
  requireRole('ADMIN'),
  validateBody(createVehicleMaintenanceRecordSchema),
  createMaintenanceHandler
);

// Driver endpoints for registry display
driverSubRouter.get('/', requireAuth, requireRole('ADMIN'), listDriversHandler);

// Dispatch to subrouters based on baseUrl mount point (/vehicles vs /drivers)
vehicleRoutes.use((request, response, next) => {
  if (request.baseUrl.endsWith('/drivers')) {
    return driverSubRouter(request, response, next);
  }
  return vehicleSubRouter(request, response, next);
});
