import { useState } from 'react'
import type { Driver, Vehicle } from '../../types'
import { Modal } from '../common/UI'

type Props = {
  vehicle?: Vehicle
  drivers: Driver[]
  onClose: () => void
  onSave: (vehicle: Vehicle) => void
  notify: (message: string, kind?: 'success' | 'error') => void
}

const VEHICLE_TYPES = ['Van', 'Mini Truck', 'Tempo', 'Truck', 'Auto Rickshaw', 'Pickup']
const SIZES: ('SMALL' | 'MEDIUM' | 'LARGE')[] = ['SMALL', 'MEDIUM', 'LARGE']

export default function VehicleModal({ vehicle, drivers, onClose, onSave, notify }: Props) {
  const isEdit = !!vehicle
  const [registrationNumber, setRegistrationNumber] = useState(vehicle?.registrationNumber ?? '')
  const [type, setType] = useState(vehicle?.type ?? 'Van')
  const [sizeCategory, setSizeCategory] = useState<'SMALL' | 'MEDIUM' | 'LARGE'>(vehicle?.sizeCategory ?? 'MEDIUM')
  const [capacityKg, setCapacityKg] = useState(String(vehicle?.capacityKg ?? 250))
  const [indicativeMaxVessels, setIndicativeMaxVessels] = useState(String(vehicle?.indicativeMaxVessels ?? 12))
  const [driverId, setDriverId] = useState(vehicle?.driverId ?? '')
  const [status, setStatus] = useState<'AVAILABLE' | 'ON TRIP' | 'MAINTENANCE'>(vehicle?.status ?? 'AVAILABLE')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const reg = registrationNumber.trim().toUpperCase()
    if (!reg) {
      notify('Please enter a registration number.', 'error')
      return
    }
    const cap = Number(capacityKg)
    if (!cap || cap <= 0) {
      notify('Please enter a valid positive payload capacity.', 'error')
      return
    }
    const vessels = Number(indicativeMaxVessels)
    if (indicativeMaxVessels && (isNaN(vessels) || vessels < 0)) {
      notify('Please enter a valid indicative vessel capacity.', 'error')
      return
    }

    const payload: Vehicle = {
      vehicleId: vehicle?.vehicleId ?? `V${String(Date.now()).slice(-4)}`,
      registrationNumber: reg,
      type,
      sizeCategory,
      capacityKg: cap,
      indicativeMaxVessels: vessels > 0 ? vessels : undefined,
      driverId: driverId || undefined,
      status,
      lastMaintenance: vehicle?.lastMaintenance,
      nextMaintenance: vehicle?.nextMaintenance,
    }

    onSave(payload)
    notify(isEdit ? 'Vehicle updated successfully.' : 'Vehicle added successfully.', 'success')
    onClose()
  }

  return (
    <Modal
      title={isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
      subtitle={isEdit ? 'Update specifications and status for this vehicle.' : 'Register a new transport vehicle for food recovery dispatches.'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="dialog-form">
        <div className="field">
          <label htmlFor="veh-reg">Registration Number</label>
          <input
            id="veh-reg"
            type="text"
            value={registrationNumber}
            onChange={e => setRegistrationNumber(e.target.value)}
            placeholder="e.g. KA-01-AB-1234"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="field">
            <label htmlFor="veh-type">Vehicle Type</label>
            <select id="veh-type" value={type} onChange={e => setType(e.target.value)}>
              {VEHICLE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="veh-size">Size Category</label>
            <select id="veh-size" value={sizeCategory} onChange={e => setSizeCategory(e.target.value as 'SMALL' | 'MEDIUM' | 'LARGE')}>
              {SIZES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="field">
            <label htmlFor="veh-cap">Payload Capacity (kg)</label>
            <input
              id="veh-cap"
              type="number"
              min="1"
              step="1"
              value={capacityKg}
              onChange={e => setCapacityKg(e.target.value)}
              placeholder="e.g. 250"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="veh-vessels">Indicative Vessel Capacity</label>
            <input
              id="veh-vessels"
              type="number"
              min="1"
              step="1"
              value={indicativeMaxVessels}
              onChange={e => setIndicativeMaxVessels(e.target.value)}
              placeholder="e.g. 12"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="field">
            <label htmlFor="veh-driver">Assigned Driver</label>
            <select id="veh-driver" value={driverId} onChange={e => setDriverId(e.target.value)}>
              <option value="">Unassigned</option>
              {drivers.map(d => (
                <option key={d.driverId} value={d.driverId}>
                  {d.name} ({d.status})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="veh-status">Status</label>
            <select
              id="veh-status"
              value={status}
              onChange={e => setStatus(e.target.value as 'AVAILABLE' | 'ON TRIP' | 'MAINTENANCE')}
            >
              <option value="AVAILABLE">Available</option>
              <option value="ON TRIP">On Trip</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="dialog-footer">
          <button type="button" className="button button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button button-primary">
            Save Vehicle
          </button>
        </div>
      </form>
    </Modal>
  )
}
