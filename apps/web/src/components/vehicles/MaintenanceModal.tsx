import { useState } from 'react'
import type { Vehicle, VehicleMaintenanceRecord } from '../../types'
import { Modal } from '../common/UI'

type Props = {
  vehicles: Vehicle[]
  initialVehicleId?: string
  onClose: () => void
  onSave: (record: VehicleMaintenanceRecord, updatedVehicleStatus?: 'MAINTENANCE') => void
  notify: (message: string, kind?: 'success' | 'error') => void
}

const SERVICE_TYPES = [
  'General Service',
  'Tyre Replacement',
  'AC Service',
  'Brake Repair',
  'Clutch Replacement',
  'Battery Replacement',
  'Insurance & Fitness',
  'Body Work',
  'Other',
]

export default function MaintenanceModal({
  vehicles,
  initialVehicleId,
  onClose,
  onSave,
  notify,
}: Props) {
  const [vehicleId, setVehicleId] = useState(initialVehicleId ?? vehicles[0]?.vehicleId ?? '')
  const [servicedOn, setServicedOn] = useState(() => new Date().toISOString().slice(0, 10))
  const [serviceType, setServiceType] = useState('General Service')
  const [condition, setCondition] = useState<'GOOD' | 'NEEDS_SERVICE' | 'UNSAFE'>('GOOD')
  const [summary, setSummary] = useState('')
  const [nextServiceDueOn, setNextServiceDueOn] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicleId) {
      notify('Please select a vehicle.', 'error')
      return
    }
    const cleanSummary = summary.trim()
    if (!cleanSummary) {
      notify('Please enter a service summary.', 'error')
      return
    }
    if (nextServiceDueOn && nextServiceDueOn < servicedOn) {
      notify('Next service due date must be on or after serviced date.', 'error')
      return
    }

    const record: VehicleMaintenanceRecord = {
      recordId: `MNT${String(Date.now()).slice(-4)}`,
      vehicleId,
      servicedOn,
      serviceType,
      condition,
      summary: cleanSummary,
      nextServiceDueOn: nextServiceDueOn || undefined,
      recordedBy: 'Anjali Mehta',
    }

    // Critical V5 rule: UNSAFE condition sets vehicle status to MAINTENANCE immediately
    const shouldUpdateStatus = condition === 'UNSAFE' ? ('MAINTENANCE' as const) : undefined

    onSave(record, shouldUpdateStatus)
    notify(
      condition === 'UNSAFE'
        ? 'Maintenance logged. Vehicle status set to MAINTENANCE due to safety fault.'
        : 'Maintenance record saved successfully.',
      condition === 'UNSAFE' ? 'error' : 'success'
    )
    onClose()
  }

  return (
    <Modal
      title="Log Vehicle Maintenance"
      subtitle="Record inspection, repairs, fitness checks, and next due schedule."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="dialog-form">
        <div className="field">
          <label htmlFor="mnt-veh">Select Vehicle</label>
          <select id="mnt-veh" value={vehicleId} onChange={e => setVehicleId(e.target.value)}>
            {vehicles.map(v => (
              <option key={v.vehicleId} value={v.vehicleId}>
                {v.registrationNumber} · {v.type} ({v.status})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="field">
            <label htmlFor="mnt-date">Service Date</label>
            <input
              id="mnt-date"
              type="date"
              value={servicedOn}
              onChange={e => setServicedOn(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="mnt-type">Service Type</label>
            <select id="mnt-type" value={serviceType} onChange={e => setServiceType(e.target.value)}>
              {SERVICE_TYPES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="mnt-condition">Vehicle Condition After Service</label>
          <select
            id="mnt-condition"
            value={condition}
            onChange={e => setCondition(e.target.value as 'GOOD' | 'NEEDS_SERVICE' | 'UNSAFE')}
          >
            <option value="GOOD">Good · Safe for operational dispatch</option>
            <option value="NEEDS_SERVICE">Needs Attention · Service required soon</option>
            <option value="UNSAFE">Unsafe · Immediate fault, vehicle set to Maintenance</option>
          </select>
          {condition === 'UNSAFE' && (
            <p className="field-note field-note-warning">
              Recording an UNSAFE condition will automatically take this vehicle out of service.
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="mnt-summary">Service Summary & Notes</label>
          <textarea
            id="mnt-summary"
            rows={3}
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder="Details of service performed, parts replaced, or fitness test notes."
            required
          />
        </div>

        <div className="field">
          <label htmlFor="mnt-due">Next Service Due Date</label>
          <input
            id="mnt-due"
            type="date"
            min={servicedOn}
            value={nextServiceDueOn}
            onChange={e => setNextServiceDueOn(e.target.value)}
          />
        </div>

        <div className="dialog-footer">
          <button type="button" className="button button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button button-primary">
            Save Record
          </button>
        </div>
      </form>
    </Modal>
  )
}
