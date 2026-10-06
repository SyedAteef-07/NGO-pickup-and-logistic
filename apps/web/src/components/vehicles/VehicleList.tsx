import { AlertTriangle, Clock, Edit2, Eye, Plus, Search, Wrench, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Driver, Vehicle } from '../../types'
import { EmptyState, StatusBadge, formatDate } from '../common/UI'

type Props = {
  vehicles: Vehicle[]
  drivers: Driver[]
  onAddVehicle: () => void
  onViewVehicle: (vehicle: Vehicle) => void
  onEditVehicle: (vehicle: Vehicle) => void
  onLogMaintenance: (vehicle: Vehicle) => void
}

export default function VehicleList({
  vehicles,
  drivers,
  onAddVehicle,
  onViewVehicle,
  onEditVehicle,
  onLogMaintenance,
}: Props) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [capacityFilter, setCapacityFilter] = useState('')
  const [maintFilter, setMaintFilter] = useState('')

  const today = new Date().toISOString().slice(0, 10)

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const driver = drivers.find(d => d.driverId === v.driverId)
      if (query) {
        const text = `${v.registrationNumber} ${v.vehicleId} ${v.type} ${driver?.name ?? ''}`.toLowerCase()
        if (!text.includes(query.toLowerCase())) return false
      }
      if (typeFilter && !v.type.toLowerCase().includes(typeFilter.toLowerCase())) return false
      if (statusFilter && v.status !== statusFilter) return false
      if (capacityFilter) {
        if (capacityFilter === 'small' && v.capacityKg > 250) return false
        if (capacityFilter === 'medium' && (v.capacityKg <= 250 || v.capacityKg > 500)) return false
        if (capacityFilter === 'large' && v.capacityKg <= 500) return false
      }
      if (maintFilter) {
        if (!v.nextMaintenance) return false
        if (maintFilter === 'overdue' && v.nextMaintenance >= today) return false
        if (maintFilter === 'due') {
          const diffDays = Math.ceil((new Date(v.nextMaintenance).getTime() - new Date(today).getTime()) / (1000 * 3600 * 24))
          if (diffDays < 0 || diffDays > 14) return false
        }
      }
      return true
    })
  }, [vehicles, drivers, query, typeFilter, statusFilter, capacityFilter, maintFilter, today])

  const hasFilters = query || typeFilter || statusFilter || capacityFilter || maintFilter
  const clearFilters = () => {
    setQuery('')
    setTypeFilter('')
    setStatusFilter('')
    setCapacityFilter('')
    setMaintFilter('')
  }

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Track transport capacity, size specs, indicative vessels, and maintenance readiness.
        </p>
        <button
          type="button"
          className="button button-primary self-start sm:self-auto"
          onClick={onAddVehicle}
        >
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="search"
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
              placeholder="Search registration, driver…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <select
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">All Vehicle Types</option>
            <option value="Van">Van</option>
            <option value="Mini Truck">Mini Truck</option>
            <option value="Tempo">Tempo</option>
            <option value="Truck">Truck</option>
            <option value="Auto Rickshaw">Auto Rickshaw</option>
          </select>

          <select
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON TRIP">On Trip</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          <select
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white"
            value={capacityFilter}
            onChange={e => setCapacityFilter(e.target.value)}
          >
            <option value="">Any Capacity</option>
            <option value="small">Small (up to 250 kg)</option>
            <option value="medium">Medium (251–500 kg)</option>
            <option value="large">Large (above 500 kg)</option>
          </select>

          <select
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white"
            value={maintFilter}
            onChange={e => setMaintFilter(e.target.value)}
          >
            <option value="">Any Maintenance</option>
            <option value="overdue">Overdue for service</option>
            <option value="due">Due in 14 days</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong>{filteredVehicles.length}</strong> of {vehicles.length} vehicles
          </span>
          {hasFilters && (
            <button
              type="button"
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              onClick={clearFilters}
            >
              <X size={13} /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Vehicles Table */}
      {filteredVehicles.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4">Vehicle ID</th>
                <th className="py-3 px-4">Registration</th>
                <th className="py-3 px-4">Type & Size</th>
                <th className="py-3 px-4 text-right">Capacity (kg)</th>
                <th className="py-3 px-4 text-right">Indicative Vessels</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Next Service</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVehicles.map(v => {
                const driver = drivers.find(d => d.driverId === v.driverId)
                const isOverdue = v.nextMaintenance && v.nextMaintenance < today
                const diffDays = v.nextMaintenance
                  ? Math.ceil((new Date(v.nextMaintenance).getTime() - new Date(today).getTime()) / (1000 * 3600 * 24))
                  : null
                const isDueSoon = diffDays !== null && diffDays >= 0 && diffDays <= 14

                return (
                  <tr key={v.vehicleId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">{v.vehicleId}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{v.registrationNumber}</td>
                    <td className="py-3 px-4">
                      <span>{v.type}</span>
                      {v.sizeCategory && (
                        <span className="text-[11px] text-slate-400 ml-1">({v.sizeCategory})</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{v.capacityKg} kg</td>
                    <td className="py-3 px-4 text-right text-slate-600 font-mono">
                      {v.indicativeMaxVessels ?? '—'}
                    </td>
                    <td className="py-3 px-4">
                      {driver ? (
                        <div>
                          <span className="font-medium text-slate-800">{driver.name}</span>
                          <span className="block text-[11px] text-slate-400">{driver.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-3 px-4">
                      {v.nextMaintenance ? (
                        <div>
                          <span className="text-slate-700">{formatDate(v.nextMaintenance)}</span>
                          {isOverdue && (
                            <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded">
                              <AlertTriangle size={10} /> Overdue
                            </span>
                          )}
                          {isDueSoon && (
                            <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded">
                              <Clock size={10} /> {diffDays}d
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          className="icon-button p-1 hover:text-emerald-700"
                          title="View Details"
                          onClick={() => onViewVehicle(v)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className="icon-button p-1 hover:text-emerald-700"
                          title="Edit Vehicle"
                          onClick={() => onEditVehicle(v)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="icon-button p-1 hover:text-emerald-700"
                          title="Log Service"
                          onClick={() => onLogMaintenance(v)}
                        >
                          <Wrench size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No vehicles match the filter criteria"
          description="Adjust your search query or reset the filters to view the fleet register."
          action={
            <button type="button" className="button button-primary button-sm mt-3" onClick={clearFilters}>
              Clear filters
            </button>
          }
        />
      )}
    </div>
  )
}
