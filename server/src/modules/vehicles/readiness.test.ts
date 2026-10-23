import { describe, expect, it } from 'vitest';
import { evaluateVehicleReadiness } from './readiness';

describe('evaluateVehicleReadiness (centralized readiness evaluation)', () => {
  const baseAsOf = new Date('2026-10-23T12:00:00Z');

  it('marks an active vehicle with clean records and no conflicts as READY and dispatchable', () => {
    const result = evaluateVehicleReadiness({
      status: 'ACTIVE',
      hasActiveDowntime: false,
      hasActiveAssignment: false,
      latestCondition: 'GOOD',
      nextServiceDueOn: '2026-11-15',
      asOfDate: baseAsOf,
    });

    expect(result.isReady).toBe(true);
    expect(result.dispatchStatus).toBe('READY');
    expect(result.reasons).toEqual([]);
  });

  it('marks a RETIRED vehicle as non-dispatchable with RETIRED_STATUS reason', () => {
    const result = evaluateVehicleReadiness({
      status: 'RETIRED',
      hasActiveDowntime: false,
      hasActiveAssignment: false,
      latestCondition: 'GOOD',
      asOfDate: baseAsOf,
    });

    expect(result.isReady).toBe(false);
    expect(result.dispatchStatus).toBe('RETIRED');
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        code: 'RETIRED_STATUS',
        severity: 'BLOCKING',
      })
    );
  });

  it('marks a vehicle with status=MAINTENANCE as non-dispatchable with MAINTENANCE_STATUS reason', () => {
    const result = evaluateVehicleReadiness({
      status: 'MAINTENANCE',
      hasActiveDowntime: false,
      hasActiveAssignment: false,
      latestCondition: 'GOOD',
      asOfDate: baseAsOf,
    });

    expect(result.isReady).toBe(false);
    expect(result.dispatchStatus).toBe('MAINTENANCE_RESTRICTED');
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        code: 'MAINTENANCE_STATUS',
        severity: 'BLOCKING',
      })
    );
  });

  it('blocks dispatch when active downtime restriction exists', () => {
    const result = evaluateVehicleReadiness({
      status: 'ACTIVE',
      hasActiveDowntime: true,
      hasActiveAssignment: false,
      latestCondition: 'GOOD',
      asOfDate: baseAsOf,
    });

    expect(result.isReady).toBe(false);
    expect(result.dispatchStatus).toBe('MAINTENANCE_RESTRICTED');
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        code: 'ACTIVE_DOWNTIME_RESTRICTION',
        severity: 'BLOCKING',
      })
    );
  });

  it('blocks dispatch and marks DISPATCHED when vehicle has an active assignment conflict', () => {
    const result = evaluateVehicleReadiness({
      status: 'ACTIVE',
      hasActiveDowntime: false,
      hasActiveAssignment: true,
      latestCondition: 'GOOD',
      asOfDate: baseAsOf,
    });

    expect(result.isReady).toBe(false);
    expect(result.dispatchStatus).toBe('DISPATCHED');
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        code: 'ACTIVE_ASSIGNMENT_CONFLICT',
        severity: 'BLOCKING',
      })
    );
  });

  it('blocks dispatch when latest maintenance record is UNSAFE', () => {
    const result = evaluateVehicleReadiness({
      status: 'ACTIVE',
      hasActiveDowntime: false,
      hasActiveAssignment: false,
      latestCondition: 'UNSAFE',
      asOfDate: baseAsOf,
    });

    expect(result.isReady).toBe(false);
    expect(result.dispatchStatus).toBe('MAINTENANCE_RESTRICTED');
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        code: 'MAINTENANCE_CONDITION_UNSAFE',
        severity: 'BLOCKING',
      })
    );
  });

  it('does not block dispatch solely on overdue service date, but raises a WARNING reason', () => {
    const result = evaluateVehicleReadiness({
      status: 'ACTIVE',
      hasActiveDowntime: false,
      hasActiveAssignment: false,
      latestCondition: 'GOOD',
      nextServiceDueOn: '2026-10-01', // Before 2026-10-23
      asOfDate: baseAsOf,
    });

    expect(result.isReady).toBe(true);
    expect(result.dispatchStatus).toBe('READY');
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        code: 'SERVICE_OVERDUE',
        severity: 'WARNING',
      })
    );
  });

  it('raises a WARNING when condition is NEEDS_SERVICE without blocking dispatch', () => {
    const result = evaluateVehicleReadiness({
      status: 'ACTIVE',
      hasActiveDowntime: false,
      hasActiveAssignment: false,
      latestCondition: 'NEEDS_SERVICE',
      asOfDate: baseAsOf,
    });

    expect(result.isReady).toBe(true);
    expect(result.dispatchStatus).toBe('READY');
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        code: 'SERVICE_RECOMMENDED',
        severity: 'WARNING',
      })
    );
  });

  it('never treats missing/unknown status as proof of passing', () => {
    const result = evaluateVehicleReadiness({
      status: null,
      hasActiveDowntime: false,
      hasActiveAssignment: false,
      latestCondition: 'GOOD',
      asOfDate: baseAsOf,
    });

    expect(result.isReady).toBe(false);
    expect(result.reasons).toContainEqual(
      expect.objectContaining({
        code: 'UNKNOWN_STATUS',
        severity: 'BLOCKING',
      })
    );
  });

  it('accumulates multiple blocking reasons when multiple restrictions apply', () => {
    const result = evaluateVehicleReadiness({
      status: 'MAINTENANCE',
      hasActiveDowntime: true,
      hasActiveAssignment: true,
      latestCondition: 'UNSAFE',
      asOfDate: baseAsOf,
    });

    expect(result.isReady).toBe(false);
    const codes = result.reasons.map(r => r.code);
    expect(codes).toContain('MAINTENANCE_STATUS');
    expect(codes).toContain('ACTIVE_DOWNTIME_RESTRICTION');
    expect(codes).toContain('MAINTENANCE_CONDITION_UNSAFE');
    expect(codes).toContain('ACTIVE_ASSIGNMENT_CONFLICT');
  });
});
