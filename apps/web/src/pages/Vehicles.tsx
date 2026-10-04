import { AlertTriangle, CheckCircle, Clock, Plus, Truck, Wrench } from 'lucide-react'
import { useState } from 'react'
import type { Assignment, Driver, Event, Vehicle, VehicleMaintenanceRecord } from '../types'
import MaintenanceList from '../components/vehicles/MaintenanceList'
import MaintenanceModal from '../components/vehicles/MaintenanceModal'
import VehicleDetailModal from '../components/vehicles/VehicleDetailModal'
import VehicleList from '../components/vehicles/VehicleList'
import VehicleModal from '../components/vehicles/VehicleModal'

type Props = {
  vehicles: Vehicle[]
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>
  maintenanceRecords: VehicleMaintenanceRecord[]
  setMaintenanceRecords: React.Dispatch<React.SetStateAction<VehicleMaintenanceRecord[]>>
  drivers: Driver[]
  assignments: Assignment[]
  events: Event[]
  notify: (message: string, kind?: 'success' | 'error') => void
}

type Tab = 'fleet' | 'maintenance'

export default function Vehicles({
  vehicles,
  setVehicles,
  maintenanceRecords,
  setMaintenanceRecords,
  drivers,
  assignments,
  events,
  notify,
}: Props) {
  const [tab, setTab] = useState<Tab>('fleet')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'detail' | 'maint' | null>(null)

  const availableCount = vehicles.filter(v => v.status === 'AVAILABLE').length
  const onTripCount = vehicles.filter(v => v.status === 'ON TRIP').length
  const maintenanceCount = vehicles.filter(v => v.status === 'MAINTENANCE').length

  const handleSaveVehicle = (vehicle: Vehicle) => {
    setVehicles(current => {
      const exists = current.some(v => v.vehicleId === vehicle.vehicleId)
      if (exists) {
        return current.map(v => (v.vehicleId === vehicle.vehicleId ? vehicle : v))
      }
      return [vehicle, ...current]
    })
  }

  const handleSaveMaintenance = (record: VehicleMaintenanceRecord, updatedVehicleStatus?: 'MAINTENANCE') => {
    setMaintenanceRecords(current => [record, ...current])

    setVehicles(current =>
      current.map(v => {
        if (v.vehicleId !== record.vehicleId) return v
        return {
          ...v,
          lastMaintenance: record.servicedOn,
          nextMaintenance: record.nextServiceDueOn ?? v.nextMaintenance,
          status: updatedVehicleStatus ?? v.status,
        }
      })
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">FLEET & LOGISTICS</span>
          <h1>Vehicle Details & Fleet</h1>
          <p>Maintain canonical vehicle inventory, payload capacity, and service history.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setModalMode('maint')}
          >
            <Wrench size={16} /> Log Service
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              setSelectedVehicle(null)
              setModalMode('add')
            }}
          >
            <Plus size={16} /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="metric-card">
          <span className="metric-label flex items-center gap-1.5">
            <Truck size={15} /> Total Fleet
          </span>
          <strong className="metric-value">{vehicles.length}</strong>
          <span className="metric-sub">Registered vehicles</span>
        </div>
        <div className="metric-card">
          <span className="metric-label flex items-center gap-1.5 text-emerald-700">
            <CheckCircle size={15} /> Available
          </span>
          <strong className="metric-value text-emerald-700">{availableCount}</strong>
          <span className="metric-sub">Ready for dispatch</span>
        </div>
        <div className="metric-card">
          <span className="metric-label flex items-center gap-1.5 text-blue-700">
            <Clock size={15} /> On Trip
          </span>
          <strong className="metric-value text-blue-700">{onTripCount}</strong>
          <span className="metric-sub">Active assignments</span>
        </div>
        <div className="metric-card">
          <span className="metric-label flex items-center gap-1.5 text-amber-700">
            <AlertTriangle size={15} /> Maintenance
          </span>
          <strong className="metric-value text-amber-700">{maintenanceCount}</strong>
          <span className="metric-sub">Under service or repair</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6 -mb-px">
          <button
            type="button"
            className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
              tab === 'fleet'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setTab('fleet')}
          >
            <Truck size={16} /> <span>Fleet Registry</span> <span>({vehicles.length})</span>
          </button>
          <button
            type="button"
            className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
              tab === 'maintenance'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setTab('maintenance')}
          >
            <Wrench size={16} /> <span>Maintenance Logs</span> <span>({maintenanceRecords.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'fleet' ? (
        <VehicleList
          vehicles={vehicles}
          drivers={drivers}
          onAddVehicle={() => {
            setSelectedVehicle(null)
            setModalMode('add')
          }}
          onViewVehicle={v => {
            setSelectedVehicle(v)
            setModalMode('detail')
          }}
          onEditVehicle={v => {
            setSelectedVehicle(v)
            setModalMode('edit')
          }}
          onLogMaintenance={v => {
            setSelectedVehicle(v)
            setModalMode('maint')
          }}
        />
      ) : (
        <MaintenanceList
          maintenanceRecords={maintenanceRecords}
          vehicles={vehicles}
          onLogMaintenance={() => {
            setSelectedVehicle(null)
            setModalMode('maint')
          }}
        />
      )}

      {/* Modals and Drawers */}
      {modalMode === 'add' && (
        <VehicleModal
          drivers={drivers}
          onClose={() => setModalMode(null)}
          onSave={handleSaveVehicle}
          notify={notify}
        />
      )}

      {modalMode === 'edit' && selectedVehicle && (
        <VehicleModal
          vehicle={selectedVehicle}
          drivers={drivers}
          onClose={() => {
            setSelectedVehicle(null)
            setModalMode(null)
          }}
          onSave={handleSaveVehicle}
          notify={notify}
        />
      )}

      {modalMode === 'detail' && selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          drivers={drivers}
          assignments={assignments}
          events={events}
          maintenanceRecords={maintenanceRecords}
          onClose={() => {
            setSelectedVehicle(null)
            setModalMode(null)
          }}
          onEdit={() => setModalMode('edit')}
          onLogMaintenance={() => setModalMode('maint')}
        />
      )}

      {modalMode === 'maint' && (
        <MaintenanceModal
          vehicles={vehicles}
          initialVehicleId={selectedVehicle?.vehicleId}
          onClose={() => {
            setSelectedVehicle(null)
            setModalMode(null)
          }}
          onSave={handleSaveMaintenance}
          notify={notify}
        />
      )}
    </div>
  )
}
