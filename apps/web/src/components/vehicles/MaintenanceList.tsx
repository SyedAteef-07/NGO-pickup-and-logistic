import { AlertTriangle, Clock, Plus, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Vehicle, VehicleMaintenanceRecord } from '../../types'
import { EmptyState, formatDate } from '../common/UI'

type Props = {
  maintenanceRecords: VehicleMaintenanceRecord[]
  vehicles: Vehicle[]
  onLogMaintenance: () => void
}

export default function MaintenanceList({
  maintenanceRecords,
  vehicles,
  onLogMaintenance,
}: Props) {
  const [vehicleFilter, setVehicleFilter] = useState('')
  const [conditionFilter, setConditionFilter] = useState('')
  const [query, setQuery] = useState('')

  const today = new Date().toISOString().slice(0, 10)

  const filteredRecords = useMemo(() => {
    return maintenanceRecords.filter(m => {
      const v = vehicles.find(item => item.vehicleId === m.vehicleId)
      if (query) {
        const text = `${v?.registrationNumber ?? ''} ${m.serviceType} ${m.summary} ${m.recordedBy ?? ''}`.toLowerCase()
        if (!text.includes(query.toLowerCase())) return false
      }
      if (vehicleFilter && m.vehicleId !== vehicleFilter) return false
      if (conditionFilter && m.condition !== conditionFilter) return false
      return true
    })
  }, [maintenanceRecords, vehicles, query, vehicleFilter, conditionFilter])

  const hasFilters = query || vehicleFilter || conditionFilter
  const clearFilters = () => {
    setQuery('')
    setVehicleFilter('')
    setConditionFilter('')
  }

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Track inspection history, scheduled maintenance, and safety alerts.
        </p>
        <button
          type="button"
          className="button button-primary self-start sm:self-auto"
          onClick={onLogMaintenance}
        >
          <Plus size={16} /> Log Service
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="search"
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
              placeholder="Search service logs, summary…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <select
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white"
            value={vehicleFilter}
            onChange={e => setVehicleFilter(e.target.value)}
          >
            <option value="">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.vehicleId} value={v.vehicleId}>
                {v.registrationNumber} ({v.type})
              </option>
            ))}
          </select>

          <select
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white"
            value={conditionFilter}
            onChange={e => setConditionFilter(e.target.value)}
          >
            <option value="">All Conditions</option>
            <option value="GOOD">Good (Operational)</option>
            <option value="NEEDS_SERVICE">Needs Service</option>
            <option value="UNSAFE">Unsafe (Critical Fault)</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong>{filteredRecords.length}</strong> of {maintenanceRecords.length} service records
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

      {/* Table */}
      {filteredRecords.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4">Service Date</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Service Type</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Summary & Work Done</th>
                <th className="py-3 px-4">Next Due Date</th>
                <th className="py-3 px-4">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.map(m => {
                const vehicle = vehicles.find(v => v.vehicleId === m.vehicleId)
                const isOverdue = m.nextServiceDueOn && m.nextServiceDueOn < today
                const diffDays = m.nextServiceDueOn
                  ? Math.ceil((new Date(m.nextServiceDueOn).getTime() - new Date(today).getTime()) / (1000 * 3600 * 24))
                  : null
                const isDueSoon = diffDays !== null && diffDays >= 0 && diffDays <= 14

                return (
                  <tr key={m.recordId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-700">{formatDate(m.servicedOn)}</td>
                    <td className="py-3 px-4">
                      {vehicle ? (
                        <div>
                          <strong className="text-slate-800 font-semibold">{vehicle.registrationNumber}</strong>
                          <span className="block text-[11px] text-slate-400">{vehicle.type}</span>
                        </div>
                      ) : (
                        <span className="font-mono">{m.vehicleId}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{m.serviceType}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          m.condition === 'GOOD'
                            ? 'bg-emerald-50 text-emerald-700'
                            : m.condition === 'NEEDS_SERVICE'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {m.condition === 'GOOD' ? 'Good' : m.condition === 'NEEDS_SERVICE' ? 'Needs Service' : 'Unsafe'}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-600 truncate" title={m.summary}>
                      {m.summary}
                    </td>
                    <td className="py-3 px-4">
                      {m.nextServiceDueOn ? (
                        <div>
                          <span>{formatDate(m.nextServiceDueOn)}</span>
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
                    <td className="py-3 px-4 text-slate-500">{m.recordedBy ?? 'Coordinator'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No maintenance records found"
          description="Try adjusting your filter options or log a new maintenance event."
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
