import type { PoolClient } from 'pg';
import { HttpError } from '../../middleware/errorHandler';
import type {
  CreateVehicle,
  CreateVehicleMaintenanceRecord,
  FleetSummary,
  ListVehiclesQuery,
  UpdateVehicle,
} from '@aaharaconnect/shared';
import * as vehicleRepo from './repository';

export async function listVehicles(params: ListVehiclesQuery, client?: PoolClient) {
  return vehicleRepo.listVehicles(params, client);
}

export async function getVehicleById(id: string, client?: PoolClient) {
  const vehicle = await vehicleRepo.findVehicleById(id, client);
  if (!vehicle) {
    throw new HttpError(404, 'NOT_FOUND', 'Vehicle not found.');
  }
  return vehicle;
}

export async function createVehicle(input: CreateVehicle, client?: PoolClient) {
  const vehicle = await vehicleRepo.createVehicle(input, client);
  if (!vehicle) {
    throw new HttpError(500, 'INTERNAL_ERROR', 'Failed to retrieve vehicle after creation.');
  }
  return vehicle;
}

export async function updateVehicle(
  id: string,
  patch: UpdateVehicle,
  client?: PoolClient
) {
  const existing = await vehicleRepo.findVehicleById(id, client);
  if (!existing) {
    throw new HttpError(404, 'NOT_FOUND', 'Vehicle not found.');
  }
  const updated = await vehicleRepo.updateVehicle(id, patch, client);
  if (!updated) {
    throw new HttpError(404, 'NOT_FOUND', 'Vehicle not found.');
  }
  return updated;
}

export async function getFleetSummary(client?: PoolClient): Promise<FleetSummary> {
  return vehicleRepo.getFleetSummary(client);
}

export async function listMaintenanceHistory(vehicleId: string, client?: PoolClient) {
  // Confirm vehicle exists
  await getVehicleById(vehicleId, client);
  return vehicleRepo.listMaintenanceHistory(vehicleId, client);
}

export async function createMaintenanceRecord(
  vehicleId: string,
  input: CreateVehicleMaintenanceRecord,
  actorId?: string,
  client?: PoolClient
) {
  return vehicleRepo.createMaintenanceRecord(vehicleId, input, actorId ?? null, client);
}

export async function listDrivers(client?: PoolClient) {
  return vehicleRepo.listDrivers(client);
}

export async function removeVehicle(id: string, client?: PoolClient) {
  return vehicleRepo.deleteVehicle(id, client);
}
