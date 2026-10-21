import { ArrowLeft, ArrowRight, Check, ShieldAlert, Sparkles, Truck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Modal } from '../../components/common/UI'
import { isLiveAdmin, map409ErrorMessage } from './adapters'
import { calculateAiLogistics, rankVehiclesForPickup, rankVolunteersForPickup } from './aiLogistics'
import { createAssignment } from './api'
import { saveDemoAssignment, updateDemoPickupStatus, useAssignWizardResources } from './hooks'
import type { LiveAssignment, Pickup } from './types'

interface Props {
  pickup: Pickup
  onClose: () => void
  onSuccess: (assignment: LiveAssignment) => void
  notify: (message: string, kind?: 'success' | 'error') => void
}

const wizardSteps = [
  'Select Volunteers',
  'Select Driver',
  'Select Vehicle',
  'Containers',
  'Review Assignment',
]

const demoVolunteersFallback = [
  { volunteerId: 'vol-1', name: 'Kavya Iyer', role: 'Pickup Volunteer' },
  { volunteerId: 'vol-2', name: 'Amit Patel', role: 'Pickup Volunteer' },
  { volunteerId: 'vol-3', name: 'Neha Rao', role: 'Food Handling Volunteer' },
  { volunteerId: 'vol-4', name: 'Rohan Verma', role: 'Distribution Volunteer' },
]

const demoDriversFallback = [
  { driverId: 'drv-1', name: 'Rahul Kumar', licenceStatus: 'VALID' },
  { driverId: 'drv-2', name: 'Suresh Gowda', licenceStatus: 'VALID' },
  { driverId: 'drv-3', name: 'Priya Sharma', licenceStatus: 'VALID' },
]

const demoVehiclesFallback = [
  { vehicleId: 'veh-1', registrationNumber: 'KA 01 AB 1234', type: '3-Wheeler Cargo Auto', capacity: 120 },
  { vehicleId: 'veh-2', registrationNumber: 'KA 05 XY 5678', type: 'Tata Ace Mini Truck', capacity: 500 },
  { vehicleId: 'veh-3', registrationNumber: 'KA 03 EV 9012', type: 'Two-Wheeler EV Scooter', capacity: 25 },
  { vehicleId: 'veh-4', registrationNumber: 'KA 04 CR 3456', type: 'Refrigerated Cargo Van', capacity: 1200 },
]

export function AssignWizard({ pickup, onClose, onSuccess, notify }: Props) {
  const [step, setStep] = useState(0)
  const [idempotencyKey] = useState(() => crypto.randomUUID())
  const [selectedVolunteerIds, setSelectedVolunteerIds] = useState<string[]>([])
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [role] = useState('Pickup Volunteer')

  const aiAssessment = useMemo(
    () =>
      pickup.aiAssessment ||
      calculateAiLogistics(pickup.foods || [], pickup.donorName, pickup.donorLocation),
    [pickup]
  )

  const [containerCount, setContainerCount] = useState(
    () => aiAssessment.vessels.reduce((acc, v) => acc + v.count, 0) || 2
  )
  const [estimatedLoadKg, setEstimatedLoadKg] = useState(
    () => aiAssessment.totalEstimatedWeightKg || 30
  )
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    volunteers,
    drivers,
    vehicles,
    waitingTeam1,
    waitingTeam5Drivers,
    waitingTeam5Vehicles,
  } = useAssignWizardResources()

  const activeVolunteers = volunteers.length > 0 ? volunteers : demoVolunteersFallback
  const activeDrivers = drivers.length > 0 ? drivers : demoDriversFallback
  const activeVehicles = vehicles.length > 0 ? vehicles : demoVehiclesFallback

  const volunteerRanking = useMemo(
    () =>
      rankVolunteersForPickup(activeVolunteers, {
        totalEstimatedWeightKg: Number(estimatedLoadKg),
        foods: pickup.foods,
      }),
    [activeVolunteers, estimatedLoadKg, pickup.foods]
  )

  const vehicleRanking = useMemo(
    () =>
      rankVehiclesForPickup(activeVehicles, {
        totalEstimatedWeightKg: Number(estimatedLoadKg),
        totalVessels: Number(containerCount),
      }),
    [activeVehicles, estimatedLoadKg, containerCount]
  )

  const canContinue = () => {
    if (step === 0) return selectedVolunteerIds.length > 0
    if (step === 1) return !!selectedDriverId
    if (step === 2) {
      if (!selectedVehicleId) return false
      const chosen = vehicleRanking.ranked.find(v => v.vehicleId === selectedVehicleId)
      return chosen ? chosen.isEligible : true
    }
    if (step === 3) return containerCount > 0
    return true
  }

  const handleNext = () => {
    if (!canContinue()) {
      notify('Complete required selection to proceed.', 'error')
      return
    }
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setErrorMessage(null)
    try {
      if (isLiveAdmin()) {
        const assignment = await createAssignment(
          pickup.id,
          {
            teamId: null,
            volunteerIds: selectedVolunteerIds,
            driverId: selectedDriverId,
            vehicleId: selectedVehicleId,
            role,
            windowStartsAt: pickup.windowStartsAt,
            windowEndsAt: pickup.windowEndsAt,
            containers: [
              {
                containerType: aiAssessment.vessels[0]?.containerType || 'insulated crate',
                count: Number(containerCount),
                estimatedLoadKg: Number(estimatedLoadKg),
              },
            ],
          },
          idempotencyKey
        )
        notify('Assignment created successfully.')
        onSuccess(assignment)
      } else {
        const demoAssignment: LiveAssignment = {
          id: 'a1000000-0000-4000-8000-' + String(Date.now()).slice(-12).padStart(12, '0'),
          pickupId: pickup.id,
          status: 'ACCEPTED',
          version: 1,
          volunteerIds: selectedVolunteerIds,
          teamId: null,
          driverId: selectedDriverId,
          vehicleId: selectedVehicleId,
        }
        saveDemoAssignment(demoAssignment)
        updateDemoPickupStatus(pickup.id, 'ASSIGNED')
        notify('Assignment created successfully.')
        onSuccess(demoAssignment)
      }
      onClose()
    } catch (err: unknown) {
      const friendly = map409ErrorMessage(err)
      setErrorMessage(friendly)
      notify(friendly, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Assign Crew & Vehicle"
      subtitle="Assign volunteers, driver, and vehicle for this pickup."
      onClose={onClose}
      wide
    >
      <div className="wizard">
        <div className="wizard-steps">
          {wizardSteps.map((label, idx) => (
            <div
              key={label}
              className={`wizard-step ${idx === step ? 'current' : ''} ${idx < step ? 'done' : ''}`}
            >
              <span>{idx < step ? <Check size={14} /> : idx + 1}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>

        <div className="wizard-content">
          {errorMessage && (
            <div className="wizard-tip error-tip" style={{ color: '#dc2626', marginBottom: '1rem' }}>
              <ShieldAlert size={18} /> {errorMessage}
            </div>
          )}

          {step === 0 && (
            <>
              <div className="wizard-title">
                <h3>Select Volunteers</h3>
                <p>Choose participating volunteers for this pickup.</p>
              </div>
              {waitingTeam1 && volunteers.length === 0 ? (
                <div className="wizard-tip" style={{ marginBottom: '1rem' }}>
                  <strong>{waitingTeam1}</strong>
                </div>
              ) : null}
              {volunteerRanking.noCandidatesReason && (
                <div className="wizard-tip error-tip" style={{ color: '#b91c1c', marginBottom: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem' }}>
                  <ShieldAlert size={16} /> {volunteerRanking.noCandidatesReason}
                </div>
              )}
              <div className="choice-grid two-col">
                {volunteerRanking.ranked.map(vol => {
                  const id = vol.volunteerId
                  const name = vol.name
                  const isSelected = selectedVolunteerIds.includes(id)
                  const isRecommended = vol.isEligible && vol.rank <= 2
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`choice-card ${isSelected ? 'selected' : ''}`}
                      disabled={!vol.isEligible}
                      style={{
                        opacity: vol.isEligible ? 1 : 0.6,
                        cursor: vol.isEligible ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '4px',
                        textAlign: 'left',
                      }}
                      onClick={() => {
                        if (!vol.isEligible) return
                        setSelectedVolunteerIds(prev =>
                          isSelected ? prev.filter(x => x !== id) : [...prev, id]
                        )
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <strong>{name}</strong>
                        {isRecommended && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: '#ecfdf5',
                              color: '#065f46',
                              border: '1px solid #a7f3d0',
                              padding: '2px 6px',
                              borderRadius: '999px',
                            }}
                          >
                            {`⭐ Match ${vol.suitabilityScore}%`}
                          </span>
                        )}
                        {!vol.isEligible && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: '#fee2e2',
                              color: '#991b1b',
                              border: '1px solid #fecaca',
                              padding: '2px 6px',
                              borderRadius: '999px',
                            }}
                          >
                            Unavailable
                          </span>
                        )}
                      </div>
                      {vol.reasons.length > 0 && (
                        <small style={{ color: '#047857', fontSize: '0.74rem' }}>
                          ✓ {vol.reasons[0]}
                        </small>
                      )}
                      {vol.constraints.length > 0 && (
                        <small style={{ color: '#b91c1c', fontSize: '0.74rem' }}>
                          ✕ {vol.constraints[0]}
                        </small>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="wizard-title">
                <h3>Select Driver</h3>
                <p>Choose an authorized driver with a valid licence.</p>
              </div>
              {waitingTeam5Drivers && drivers.length === 0 ? (
                <div className="wizard-tip" style={{ marginBottom: '1rem' }}>
                  <strong>{waitingTeam5Drivers}</strong>
                </div>
              ) : null}
              <div className="choice-grid two-col">
                {activeDrivers.map((drv: any) => {
                  const id = drv.driverId || drv.id
                  const name = drv.name || id
                  const isSelected = selectedDriverId === id
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`choice-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedDriverId(id)}
                    >
                      <strong>{name}</strong>
                      {drv.licenceNumber && (
                        <small style={{ color: '#64748b', display: 'block', marginTop: '2px' }}>
                          {`Licence: ${drv.licenceNumber}`}
                        </small>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="wizard-title">
                <h3>Select Vehicle</h3>
                <p>{'Choose an active vehicle with sufficient payload capacity.'}</p>
              </div>

              {/* Vehicle Logistics Recommendation Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                  border: '1px solid #a7f3d0',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                }}
              >
                <Sparkles size={18} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: '#065f46' }}>
                    {'Logistics Recommendation (Scoring Algorithm)'}
                  </div>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Truck size={15} style={{ color: '#059669' }} />
                    <span>{vehicleRanking.bestVehicle ? `${vehicleRanking.bestVehicle.kind} (${vehicleRanking.bestVehicle.registrationNumber}) · ${vehicleRanking.bestVehicle.suitabilityScore}% match` : `${aiAssessment.vehicle.vehicleType} (Estimated Profile)`}</span>
                  </div>
                  <p style={{ margin: '3px 0 0', color: '#475569', fontSize: '0.8rem' }}>
                    {vehicleRanking.bestVehicle?.reasons[0] || aiAssessment.vehicle.reason}
                  </p>
                </div>
              </div>

              {waitingTeam5Vehicles && vehicles.length === 0 ? (
                <div className="wizard-tip" style={{ marginBottom: '1rem' }}>
                  <strong>{waitingTeam5Vehicles}</strong>
                </div>
              ) : null}

              {vehicleRanking.noCandidatesReason && (
                <div className="wizard-tip error-tip" style={{ color: '#b91c1c', marginBottom: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem' }}>
                  <ShieldAlert size={16} /> {vehicleRanking.noCandidatesReason}
                </div>
              )}

              <div className="choice-grid two-col">
                {vehicleRanking.ranked.map(veh => {
                  const id = veh.vehicleId
                  const reg = veh.registrationNumber
                  const isSelected = selectedVehicleId === id
                  const isTopPick = veh.isEligible && veh.rank === 1
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`choice-card ${isSelected ? 'selected' : ''}`}
                      disabled={!veh.isEligible}
                      style={{
                        opacity: veh.isEligible ? 1 : 0.6,
                        cursor: veh.isEligible ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '4px',
                        textAlign: 'left',
                      }}
                      onClick={() => {
                        if (!veh.isEligible) return
                        setSelectedVehicleId(id)
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <strong>{reg}</strong>
                        {isTopPick && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: '#ecfdf5',
                              color: '#065f46',
                              border: '1px solid #a7f3d0',
                              padding: '2px 6px',
                              borderRadius: '999px',
                            }}
                          >
                            {`⭐ Top Pick · ${veh.suitabilityScore}%`}
                          </span>
                        )}
                        {veh.isOverCapacity && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: '#fee2e2',
                              color: '#991b1b',
                              border: '1px solid #fecaca',
                              padding: '2px 6px',
                              borderRadius: '999px',
                            }}
                          >
                            {'Over Capacity'}
                          </span>
                        )}
                        {!veh.isEligible && !veh.isOverCapacity && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: '#fee2e2',
                              color: '#991b1b',
                              border: '1px solid #fecaca',
                              padding: '2px 6px',
                              borderRadius: '999px',
                            }}
                          >
                            {veh.status}
                          </span>
                        )}
                      </div>
                      <small style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>
                        {`${veh.kind} · Capacity: ${veh.capacityKg} kg`}
                      </small>
                      {veh.reasons.length > 0 && (
                        <small style={{ color: '#047857', fontSize: '0.73rem', marginTop: '2px' }}>
                          ✓ {veh.reasons[0]}
                        </small>
                      )}
                      {veh.constraints.length > 0 && (
                        <small style={{ color: '#b91c1c', fontSize: '0.73rem', marginTop: '2px' }}>
                          ✕ {veh.constraints[0]}
                        </small>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="wizard-title">
                <h3>Containers & Load</h3>
                <p>Specify the containers required for food rescue.</p>
              </div>

              {/* AI Vessels Breakdown */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Required Vessels</strong>
                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                    onClick={() => {
                      setContainerCount(aiAssessment.vessels.reduce((acc, v) => acc + v.count, 0) || 2)
                      setEstimatedLoadKg(aiAssessment.totalEstimatedWeightKg || 30)
                      notify('AI recommended vessels applied.')
                    }}
                  >
                    Apply AI Vessels
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {aiAssessment.vessels.map(v => (
                    <div
                      key={v.containerType}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '0.45rem 0.65rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>{`${v.count}x ${v.containerType}`}</span>
                        <span style={{ color: '#059669' }}>{v.capacityPerUnit}</span>
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
                        {v.purpose}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dialog-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label className="field">
                  <span>Container Count</span>
                  <input
                    type="number"
                    min="1"
                    value={containerCount}
                    onChange={e => setContainerCount(Number(e.target.value))}
                  />
                </label>
                <label className="field">
                  <span>Estimated Load (kg)</span>
                  <input
                    type="number"
                    min="1"
                    value={estimatedLoadKg}
                    onChange={e => setEstimatedLoadKg(Number(e.target.value))}
                  />
                </label>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="wizard-title">
                <h3>Review Assignment</h3>
                <p>Confirm the details before dispatching the crew.</p>
              </div>
              <div className="review-card">
                <div className="review-grid">
                  <div>
                    <span>Pickup ID</span>
                    <strong>{pickup.id.slice(0, 12)}…</strong>
                  </div>
                  <div>
                    <span>Role</span>
                    <strong>{role}</strong>
                  </div>
                  <div>
                    <span>Containers</span>
                    <strong>{`${containerCount} (${estimatedLoadKg} kg)`}</strong>
                  </div>
                  <div>
                    <span>Delivery Address</span>
                    <strong>{pickup.deliveryAddress}</strong>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="wizard-footer">
          <button
            type="button"
            className="button button-secondary"
            onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
          >
            {step === 0 ? 'Cancel' : <><ArrowLeft size={17} /> Back</>}
          </button>
          <div className="step-counter">
            Step {step + 1} of 5
          </div>
          {step === 4 ? (
            <button
              type="button"
              className="button button-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Creating…' : 'Confirm Assignment'}
            </button>
          ) : (
            <button
              type="button"
              className="button button-primary"
              onClick={handleNext}
              disabled={!canContinue()}
            >
              Continue <ArrowRight size={17} />
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
