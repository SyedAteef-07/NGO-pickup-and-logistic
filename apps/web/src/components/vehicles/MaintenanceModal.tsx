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
  const [customServiceType, setCustomServiceType] = useState('')
  const [conditionSelection, setConditionSelection] = useState<'GOOD' | 'NEEDS_SERVICE' | 'UNSAFE' | 'OTHER'>('GOOD')
  const [customCondition, setCustomCondition] = useState('')
  const [customConditionSafety, setCustomConditionSafety] = useState<'GOOD' | 'NEEDS_SERVICE' | 'UNSAFE'>('GOOD')
  const [summary, setSummary] = useState('')
  const [nextServiceDueOn, setNextServiceDueOn] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicleId) {
      notify('Please select a vehicle.', 'error')
      return
    }

    const finalServiceType = serviceType === 'Other' ? customServiceType.trim() : serviceType
    if (!finalServiceType) {
      notify('Please enter a service type.', 'error')
      return
    }

    let finalCondition: 'GOOD' | 'NEEDS_SERVICE' | 'UNSAFE' = 'GOOD'
    let conditionNote = ''
    if (conditionSelection === 'OTHER') {
      const cleanCustom = customCondition.trim()
      if (!cleanCustom) {
        notify('Please enter the vehicle condition.', 'error')
        return
      }
      finalCondition = customConditionSafety
      conditionNote = `Condition: ${cleanCustom}. `
    } else {
      finalCondition = conditionSelection
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
      serviceType: finalServiceType,
      condition: finalCondition,
      summary: conditionNote ? `${conditionNote}${cleanSummary}` : cleanSummary,
      nextServiceDueOn: nextServiceDueOn || undefined,
      recordedBy: 'Anjali Mehta',
    }

    // Critical V5 rule: UNSAFE condition sets vehicle status to MAINTENANCE immediately
    const shouldUpdateStatus = finalCondition === 'UNSAFE' ? ('MAINTENANCE' as const) : undefined

    onSave(record, shouldUpdateStatus)
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
            {serviceType === 'Other' && (
              <input
                id="mnt-custom-type"
                type="text"
                className="mt-2"
                value={customServiceType}
                onChange={e => setCustomServiceType(e.target.value)}
                placeholder="e.g. Engine Overhaul, Oil Change"
                required
              />
            )}
          </div>
        </div>

        <div className="field">
          <label htmlFor="mnt-condition">Vehicle Condition After Service</label>
          <select
            id="mnt-condition"
            value={conditionSelection}
            onChange={e => setConditionSelection(e.target.value as 'GOOD' | 'NEEDS_SERVICE' | 'UNSAFE' | 'OTHER')}
          >
            <option value="GOOD">Good · Safe for operational dispatch</option>
            <option value="NEEDS_SERVICE">Needs Attention · Service required soon</option>
            <option value="UNSAFE">Unsafe · Immediate fault, vehicle set to Maintenance</option>
            <option value="OTHER">Other (Enter condition manually)</option>
          </select>

          {conditionSelection === 'OTHER' && (
            <div className="mt-2 space-y-2">
              <input
                id="mnt-custom-condition"
                type="text"
                value={customCondition}
                onChange={e => setCustomCondition(e.target.value)}
                placeholder="e.g. Minor body scratch, windshield repair"
                required
              />
              <div className="field">
                <label className="text-xs font-semibold text-slate-600">Dispatch Safety:</label>
                <div className="flex gap-4 text-xs mt-1">
                  <label className="inline-flex items-center gap-1 cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      name="mnt-condition-safety"
                      value="GOOD"
                      checked={customConditionSafety === 'GOOD'}
                      onChange={() => setCustomConditionSafety('GOOD')}
                    />
                    Safe for dispatch
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      name="mnt-condition-safety"
                      value="NEEDS_SERVICE"
                      checked={customConditionSafety === 'NEEDS_SERVICE'}
                      onChange={() => setCustomConditionSafety('NEEDS_SERVICE')}
                    />
                    Service soon
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      name="mnt-condition-safety"
                      value="UNSAFE"
                      checked={customConditionSafety === 'UNSAFE'}
                      onChange={() => setCustomConditionSafety('UNSAFE')}
                    />
                    Unsafe (Restrict dispatch)
                  </label>
                </div>
              </div>
            </div>
          )}

          {(conditionSelection === 'UNSAFE' || (conditionSelection === 'OTHER' && customConditionSafety === 'UNSAFE')) && (
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

        <div className="dialog-footer pt-3 border-t border-emerald-100 flex justify-end gap-3">
          <button
            type="button"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 transition-all shadow-xs cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-700/30 flex items-center gap-2 cursor-pointer border border-emerald-600"
          >
            Save Record
          </button>
        </div>
      </form>
    </Modal>
  )
}
