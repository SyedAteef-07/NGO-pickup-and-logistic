import type {
  DispatchReadinessStatus,
  ReadinessReasonCode,
  VehicleReadiness,
  VehicleReadinessReason,
} from '@aaharaconnect/shared';

export interface VehicleReadinessEvaluationInput {
  status: string | null | undefined;
  hasActiveDowntime: boolean;
  hasActiveAssignment: boolean;
  latestCondition: 'GOOD' | 'NEEDS_SERVICE' | 'UNSAFE' | string | null;
  nextServiceDueOn?: string | null;
  asOfDate?: Date;
}

/**
 * Centralized evaluation of vehicle dispatch readiness.
 *
 * Distinguishes the database lifecycle status ('ACTIVE', 'MAINTENANCE', 'RETIRED')
 * from operational dispatch readiness ('READY', 'DISPATCHED', 'MAINTENANCE_RESTRICTED', 'RETIRED').
 *
 * Rules:
 * - RETIRED vehicles must not be dispatchable.
 * - Vehicles under active maintenance restriction (status=MAINTENANCE, active downtime, or latest condition=UNSAFE) must not be dispatchable.
 * - Vehicles with conflicting active assignments must not be dispatchable.
 * - Overdue service is surfaced as an actionable warning but does not automatically imply UNSAFE without organizational policy.
 * - Missing/unknown status is never treated as passing.
 */
export function evaluateVehicleReadiness(
  input: VehicleReadinessEvaluationInput
): VehicleReadiness {
  const reasons: VehicleReadinessReason[] = [];
  const asOf = input.asOfDate ?? new Date();
  const todayStr = asOf.toISOString().slice(0, 10);

  // 1. Mandatory lifecycle check: missing information is not treated as proof of passing.
  if (!input.status || input.status !== 'ACTIVE') {
    if (input.status === 'RETIRED') {
      reasons.push({
        code: 'RETIRED_STATUS' as ReadinessReasonCode,
        message: 'Vehicle has been retired from active fleet service.',
        severity: 'BLOCKING',
      });
    } else if (input.status === 'MAINTENANCE') {
      reasons.push({
        code: 'MAINTENANCE_STATUS' as ReadinessReasonCode,
        message: 'Vehicle lifecycle status is set to MAINTENANCE.',
        severity: 'BLOCKING',
      });
    } else {
      reasons.push({
        code: 'UNKNOWN_STATUS',
        message: `Vehicle lifecycle status is invalid or missing (${String(input.status)}).`,
        severity: 'BLOCKING',
      });
    }
  }

  // 2. Active downtime restriction (scheduled maintenance / unavailability windows)
  if (input.hasActiveDowntime) {
    reasons.push({
      code: 'ACTIVE_DOWNTIME_RESTRICTION' as ReadinessReasonCode,
      message: 'Vehicle is currently within an active downtime or maintenance reservation window.',
      severity: 'BLOCKING',
    });
  }

  // 3. Maintenance condition safety restriction
  if (input.latestCondition === 'UNSAFE') {
    reasons.push({
      code: 'MAINTENANCE_CONDITION_UNSAFE' as ReadinessReasonCode,
      message: 'Most recent maintenance record indicates vehicle condition is UNSAFE.',
      severity: 'BLOCKING',
    });
  }

  // 4. Conflicting active assignment
  if (input.hasActiveAssignment) {
    reasons.push({
      code: 'ACTIVE_ASSIGNMENT_CONFLICT' as ReadinessReasonCode,
      message: 'Vehicle currently has an active pickup dispatch assignment.',
      severity: 'BLOCKING',
    });
  }

  // 5. Advisory / non-blocking compliance checks
  if (input.nextServiceDueOn && input.nextServiceDueOn < todayStr) {
    reasons.push({
      code: 'SERVICE_OVERDUE' as ReadinessReasonCode,
      message: `Scheduled maintenance was due on ${input.nextServiceDueOn}. Service is overdue.`,
      severity: 'WARNING',
    });
  }

  if (input.latestCondition === 'NEEDS_SERVICE') {
    reasons.push({
      code: 'SERVICE_RECOMMENDED' as ReadinessReasonCode,
      message: 'Latest maintenance inspection noted that the vehicle NEEDS_SERVICE soon.',
      severity: 'WARNING',
    });
  }

  // Derive dispatch status
  const hasBlocking = reasons.some(r => r.severity === 'BLOCKING');
  let dispatchStatus: DispatchReadinessStatus;

  if (input.status === 'RETIRED') {
    dispatchStatus = 'RETIRED';
  } else if (
    input.status === 'MAINTENANCE' ||
    input.hasActiveDowntime ||
    input.latestCondition === 'UNSAFE'
  ) {
    dispatchStatus = 'MAINTENANCE_RESTRICTED';
  } else if (input.hasActiveAssignment) {
    dispatchStatus = 'DISPATCHED';
  } else if (hasBlocking) {
    dispatchStatus = 'MAINTENANCE_RESTRICTED';
  } else {
    dispatchStatus = 'READY';
  }

  return {
    isReady: !hasBlocking,
    dispatchStatus,
    reasons,
  };
}