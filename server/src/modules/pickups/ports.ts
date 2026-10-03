import type { PoolClient } from 'pg';
import { getPool } from '../../db/pool';

export type FoodRequestSummary = {
  id: string;
  status: 'SUBMITTED' | 'CANCELLED';
  safetyReview: 'PENDING' | 'APPROVED' | 'REJECTED';
  pickupDeadline: Date;
  readyAt: Date;
  estimatedWeightKg?: number | null;
};

export interface FoodPort {
  getFoodRequest(foodRequestId: string, client?: PoolClient): Promise<FoodRequestSummary | null>;
}

// TODO(Team2): Replace temporary read-only database query with Team 2 Food service interface once implemented.
export class DefaultFoodPort implements FoodPort {
  async getFoodRequest(foodRequestId: string, client?: PoolClient): Promise<FoodRequestSummary | null> {
    const db = client ?? getPool();
    const result = await db.query<{
      id: string;
      status: 'SUBMITTED' | 'CANCELLED';
      safety_review: 'PENDING' | 'APPROVED' | 'REJECTED';
      pickup_deadline: Date;
      ready_at: Date;
      estimated_weight_kg?: string | number | null;
    }>(
      `SELECT id, status, safety_review, pickup_deadline, ready_at, estimated_weight_kg FROM app.food_requests WHERE id = $1`,
      [foodRequestId]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      status: row.status,
      safetyReview: row.safety_review,
      pickupDeadline: new Date(row.pickup_deadline),
      readyAt: new Date(row.ready_at),
      estimatedWeightKg: row.estimated_weight_kg != null ? Number(row.estimated_weight_kg) : null,
    };
  }
}

export type VolunteerSummary = {
  id: string;
  personId: string;
  status: 'ACTIVE' | 'INACTIVE';
  isAvailable: boolean;
};

export interface VolunteerPort {
  getVolunteerAvailability(
    volunteerId: string,
    windowStartsAt: Date,
    windowEndsAt: Date,
    client?: PoolClient
  ): Promise<VolunteerSummary | null>;
}

// TODO(Team1): Replace temporary read-only query with Team 1 Volunteer service interface once implemented.
export class DefaultVolunteerPort implements VolunteerPort {
  async getVolunteerAvailability(
    volunteerId: string,
    windowStartsAt: Date,
    windowEndsAt: Date,
    client?: PoolClient
  ): Promise<VolunteerSummary | null> {
    const db = client ?? getPool();
    const volResult = await db.query<{
      id: string;
      person_id: string;
      status: 'ACTIVE' | 'INACTIVE';
    }>(
      `SELECT id, person_id, status FROM app.volunteers WHERE id = $1`,
      [volunteerId]
    );
    if (volResult.rows.length === 0) return null;
    const vol = volResult.rows[0];

    const availResult = await db.query<{ count: string }>(
      `SELECT count(*)::text as count FROM app.volunteer_availability
       WHERE volunteer_id = $1 AND state = 'AVAILABLE' AND starts_at <= $2 AND ends_at >= $3`,
      [volunteerId, windowStartsAt, windowEndsAt]
    );
    const hasAvailableWindow = parseInt(availResult.rows[0]?.count ?? '0', 10) > 0;

    const unavailResult = await db.query<{ count: string }>(
      `SELECT count(*)::text as count FROM app.volunteer_availability
       WHERE volunteer_id = $1 AND state = 'UNAVAILABLE'
         AND tstzrange(starts_at, ends_at, '[)') && tstzrange($2, $3, '[)')`,
      [volunteerId, windowStartsAt, windowEndsAt]
    );
    const hasUnavailableOverlap = parseInt(unavailResult.rows[0]?.count ?? '0', 10) > 0;

    return {
      id: vol.id,
      personId: vol.person_id,
      status: vol.status,
      isAvailable: hasAvailableWindow && !hasUnavailableOverlap,
    };
  }
}

export type DriverSummary = {
  id: string;
  personId: string;
  licenceNumber: string;
  licenceExpiresOn: Date;
  status: 'ACTIVE' | 'INACTIVE';
};

export interface DriverPort {
  getDriver(driverId: string, client?: PoolClient): Promise<DriverSummary | null>;
}

// TODO(Team5): Replace temporary read-only query with Team 5 Driver service interface once implemented.
export class DefaultDriverPort implements DriverPort {
  async getDriver(driverId: string, client?: PoolClient): Promise<DriverSummary | null> {
    const db = client ?? getPool();
    const result = await db.query<{
      id: string;
      person_id: string;
      licence_number: string;
      licence_expires_on: Date | string;
      status: 'ACTIVE' | 'INACTIVE';
    }>(
      `SELECT id, person_id, licence_number, licence_expires_on, status FROM app.drivers WHERE id = $1`,
      [driverId]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      personId: row.person_id,
      licenceNumber: row.licence_number,
      licenceExpiresOn: new Date(row.licence_expires_on),
      status: row.status,
    };
  }
}

export type VehicleSummary = {
  id: string;
  registrationNumber: string;
  kind: string;
  capacityKg: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';
};

export interface VehiclePort {
  getVehicle(vehicleId: string, client?: PoolClient): Promise<VehicleSummary | null>;
}

// TODO(Team5): Replace temporary read-only query with Team 5 Vehicle service interface once implemented.
export class DefaultVehiclePort implements VehiclePort {
  async getVehicle(vehicleId: string, client?: PoolClient): Promise<VehicleSummary | null> {
    const db = client ?? getPool();
    const result = await db.query<{
      id: string;
      registration_number: string;
      kind: string;
      capacity_kg: string | number;
      status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';
    }>(
      `SELECT id, registration_number, kind, capacity_kg, status FROM app.vehicles WHERE id = $1`,
      [vehicleId]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      registrationNumber: row.registration_number,
      kind: row.kind,
      capacityKg: Number(row.capacity_kg),
      status: row.status,
    };
  }
}

export const defaultFoodPort = new DefaultFoodPort();
export const defaultVolunteerPort = new DefaultVolunteerPort();
export const defaultDriverPort = new DefaultDriverPort();
export const defaultVehiclePort = new DefaultVehiclePort();

