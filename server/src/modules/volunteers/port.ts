import type { PoolClient } from 'pg';
import {
  assertVolunteerAssignable,
  getVolunteerAvailabilityForWindow,
  getVolunteerById,
  listEligibleVolunteers,
  type AssertVolunteerAssignableInput,
  type EligibleVolunteer,
  type EligibleVolunteersQuery,
  type VolunteerIdentity,
  type VolunteerWindowAvailability,
} from './service';

// Module-owned read interface. Team 3 can adopt it after cross-module review;
// no method here locks resources or writes pickup/assignment state.
export interface VolunteerReadPort {
  getVolunteerById(volunteerId: string, client?: PoolClient): Promise<VolunteerIdentity | null>;
  listEligibleVolunteers(query: EligibleVolunteersQuery, client?: PoolClient): Promise<EligibleVolunteer[]>;
  assertVolunteerAssignable(input: AssertVolunteerAssignableInput, client?: PoolClient): Promise<VolunteerWindowAvailability>;
  getVolunteerAvailability(
    volunteerId: string, windowStartsAt: Date, windowEndsAt: Date, client?: PoolClient
  ): Promise<VolunteerWindowAvailability | null>;
}

export class DefaultVolunteerReadPort implements VolunteerReadPort {
  getVolunteerById(volunteerId: string, client?: PoolClient) { return getVolunteerById(volunteerId, client); }
  listEligibleVolunteers(query: EligibleVolunteersQuery, client?: PoolClient) { return listEligibleVolunteers(query, client); }
  assertVolunteerAssignable(input: AssertVolunteerAssignableInput, client?: PoolClient) { return assertVolunteerAssignable(input, client); }
  getVolunteerAvailability(volunteerId: string, windowStartsAt: Date, windowEndsAt: Date, client?: PoolClient) {
    return getVolunteerAvailabilityForWindow(volunteerId, windowStartsAt, windowEndsAt, client);
  }
}
