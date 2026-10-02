import type { PoolClient } from 'pg';
import type { VehicleAssignments } from '@aaharaconnect/shared';
import { getPool } from '../../db/pool';

type AssignmentRow = {
  assignment_id: string;
  pickup_id: string;
  status: VehicleAssignments['items'][number]['status'];
  window_starts_at: Date;
  window_ends_at: Date;
  driver_id: string;
  volunteer_ids: string[];
};

/** Module 3 reads only its assignments; Module 5 never stores a second roster. */
export async function listVehicleAssignments(vehicleId: string, client?: PoolClient): Promise<VehicleAssignments> {
  const db = client ?? getPool();
  const result = await db.query<AssignmentRow>(`
    SELECT a.id AS assignment_id, a.pickup_id, a.status,
           p.window_starts_at, p.window_ends_at, a.driver_id,
           COALESCE(array_agg(am.volunteer_id ORDER BY am.volunteer_id)
             FILTER (WHERE am.volunteer_id IS NOT NULL), '{}'::uuid[]) AS volunteer_ids
    FROM app.assignments a
    JOIN app.pickups p ON p.id = a.pickup_id
    LEFT JOIN app.assignment_members am ON am.assignment_id = a.id
    WHERE a.vehicle_id = $1
      AND a.status NOT IN ('REJECTED', 'CANCELLED', 'FAILED', 'DELIVERED')
      AND p.status NOT IN ('CANCELLED', 'FAILED', 'DELIVERED')
    GROUP BY a.id, p.id
    ORDER BY p.window_starts_at, a.id
  `, [vehicleId]);
  return {
    items: result.rows.map(row => ({
      assignmentId: row.assignment_id,
      pickupId: row.pickup_id,
      status: row.status,
      windowStartsAt: row.window_starts_at.toISOString(),
      windowEndsAt: row.window_ends_at.toISOString(),
      driverId: row.driver_id,
      volunteerIds: row.volunteer_ids,
    })),
    nextCursor: null,
  };
}
