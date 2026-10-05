import { Calendar, Clock, Edit2, Truck, UserRound, Wrench } from 'lucide-react'
import type { Assignment, Driver, Event, Vehicle, VehicleMaintenanceRecord } from '../../types'
import { Drawer, StatusBadge, formatDate, formatTime } from '../common/UI'

type Props = {
  vehicle: Vehicle
  drivers: Driver[]
  assignments: Assignment[]
  events: Event[]
  maintenanceRecords: VehicleMaintenanceRecord[]
  onClose: () => void
  onEdit: () => void
  onLogMaintenance: () => void
}

export default function VehicleDetailModal({
  vehicle,
  drivers,
  assignments,
  events,
  maintenanceRecords,
  onClose,
  onEdit,
  onLogMaintenance,
}: Props) {
  const driver = drivers.find(d => d.driverId === vehicle.driverId)
  const vehicleAssignments = assignments.filter(a => a.vehicleId === vehicle.vehicleId)
  const vehicleMaintenance = maintenanceRecords.filter(m => m.vehicleId === vehicle.vehicleId)

  return (
    <Drawer title={`Vehicle: ${vehicle.registrationNumber}`} onClose={onClose}>
      <div className="drawer-content space-y-6">
        {/* Top Header Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{vehicle.registrationNumber}</h3>
                <p className="text-xs text-slate-500">{vehicle.type} {vehicle.sizeCategory ? `· ${vehicle.sizeCategory}` : ''}</p>
              </div>
            </div>
            <StatusBadge status={vehicle.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block">Payload Capacity</span>
              <strong className="text-sm text-slate-700">{vehicle.capacityKg} kg</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Indicative Max Vessels</span>
              <strong className="text-sm text-slate-700">{vehicle.indicativeMaxVessels ? `${vehicle.indicativeMaxVessels}` : '—'}</strong>
            </div>
          </div>
        </div>

        {/* Assigned Driver Card */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <UserRound size={15} /> Primary Assigned Driver
            </h4>
          </div>
          {driver ? (
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-slate-800 text-sm">{driver.name}</strong>
                <StatusBadge status={driver.status} />
              </div>
              <p className="text-slate-600">{driver.phone}</p>
              <p className="text-slate-500">{driver.licenseNumber} · {formatDate(driver.licenseExpiry)}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
              No driver assigned to this vehicle currently.
            </p>
          )}
        </div>

        {/* Read-only Central Assignments Projection */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock size={15} /> Current Trips & Assignments
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">
              Module 3 Projection
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            Read-only projection derived from central Pickup & Logistics assignments.
          </p>

          {vehicleAssignments.length > 0 ? (
            <div className="space-y-2">
              {vehicleAssignments.map(a => {
                const event = events.find(e => e.eventId === a.eventId)
                return (
                  <div key={a.assignmentId} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="font-mono text-slate-700">{a.assignmentId}</strong>
                      <StatusBadge status={a.status} />
                    </div>
                    {event && (
                      <p className="font-medium text-slate-800">{event.title} · {event.location}</p>
                    )}
                    <p className="text-slate-500 flex items-center gap-1">
                      <Calendar size={13} /> {formatDate(a.assignedTime)} · {formatTime(a.assignedTime)}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
              No active or scheduled assignments for this vehicle.
            </p>
          )}
        </div>

        {/* Maintenance History */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Wrench size={15} /> Maintenance Records
            </h4>
          </div>

          {vehicleMaintenance.length > 0 ? (
            <div className="space-y-2">
              {vehicleMaintenance.map(m => (
                <div key={m.recordId} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{m.serviceType}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        m.condition === 'GOOD'
                          ? 'bg-emerald-50 text-emerald-700'
                          : m.condition === 'NEEDS_SERVICE'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {m.condition}
                    </span>
                  </div>
                  <p className="text-slate-600">{m.summary}</p>
                  <div className="flex items-center justify-between text-slate-400 pt-1 text-[11px]">
                    <span>{formatDate(m.servicedOn)}</span>
                    {m.nextServiceDueOn && <span>{formatDate(m.nextServiceDueOn)}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
              No service logs recorded yet.
            </p>
          )}
        </div>

        {/* Drawer Action Buttons */}
        <div className="pt-4 border-t border-slate-200 flex gap-2">
          <button type="button" className="button button-secondary flex-1" onClick={onEdit}>
            <Edit2 size={16} /> Edit Specs
          </button>
          <button type="button" className="button button-primary flex-1" onClick={onLogMaintenance}>
            <Wrench size={16} /> Log Service
          </button>
        </div>
      </div>
    </Drawer>
  )
}
