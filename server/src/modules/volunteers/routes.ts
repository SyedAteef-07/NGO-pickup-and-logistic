import { Router } from 'express';
import { requireAuth } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import {
  createAdminTeamHandler,
  createOwnAvailabilityHandler,
  getAdminTeamHandler,
  getAdminVolunteerHandler,
  getOwnProfileHandler,
  listAdminTeamsHandler,
  listAdminVolunteersHandler,
  listOwnAvailabilityHandler,
  replaceOwnAvailabilityHandler,
  updateAdminTeamHandler,
  updateOwnProfileHandler,
} from './controller';
import { availabilityWriteSchema, createTeamSchema, updateOwnProfileSchema, updateTeamSchema } from './schemas';

export const volunteerRoutes = Router();
const selfProfileRoutes = Router();
const teamRoutes = Router();

selfProfileRoutes.get('/me', requireAuth, requireRole('VOLUNTEER'), getOwnProfileHandler);
selfProfileRoutes.patch('/me', requireAuth, requireRole('VOLUNTEER'), validateBody(updateOwnProfileSchema), updateOwnProfileHandler);
selfProfileRoutes.get('/me/availability', requireAuth, requireRole('VOLUNTEER'), listOwnAvailabilityHandler);
selfProfileRoutes.post('/me/availability', requireAuth, requireRole('VOLUNTEER'), validateBody(availabilityWriteSchema), createOwnAvailabilityHandler);
selfProfileRoutes.patch('/me/availability/:id', requireAuth, requireRole('VOLUNTEER'), validateBody(availabilityWriteSchema), replaceOwnAvailabilityHandler);
selfProfileRoutes.get('/', requireAuth, requireRole('ADMIN'), listAdminVolunteersHandler);
selfProfileRoutes.get('/:id', requireAuth, requireRole('ADMIN'), getAdminVolunteerHandler);

teamRoutes.get('/', requireAuth, requireRole('ADMIN'), listAdminTeamsHandler);
teamRoutes.get('/:id', requireAuth, requireRole('ADMIN'), getAdminTeamHandler);
teamRoutes.post('/', requireAuth, requireRole('ADMIN'), validateBody(createTeamSchema), createAdminTeamHandler);
teamRoutes.patch('/:id', requireAuth, requireRole('ADMIN'), validateBody(updateTeamSchema), updateAdminTeamHandler);

// The central router mounts this module at both /volunteers and /teams.
volunteerRoutes.use((request, response, next) => {
  if (request.baseUrl.endsWith('/volunteers')) return selfProfileRoutes(request, response, next);
  if (request.baseUrl.endsWith('/teams')) {
    if (request.path === '/me' || request.path.startsWith('/me/')) return next();
    return teamRoutes(request, response, next);
  }
  next();
});
