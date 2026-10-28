import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Scale,
  Sparkles,
  ThermometerSnowflake,
  Truck,
} from 'lucide-react'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { StatusBadge, formatTime } from '../components/common/UI'
import {
  assignDonorPickupToVehicle,
  fetchAllDonorRequests,
  getAllActiveTrips,
  type DonorPickupRequest,
} from '../features/vehicles/donorTripService'
import type { Vehicle } from '../types'
import { isLiveAdmin } from '../features/pickups/adapters'

interface Props {
  vehicles?: Vehicle[]
  setVehicles?: Dispatch<SetStateAction<Vehicle[]>>
  notify?: (message: string, kind?: 'success' | 'error') => void
}

export default function FoodDonor({ vehicles = [], setVehicles, notify }: Props) {
  const [requests, setRequests] = useState<DonorPickupRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [selectedVehicleMap, setSelectedVehicleMap] = useState<Record<string, string>>({})

  const loadRequests = async () => {
    setLoading(true); setLoadError(false)
    try {
      const live = isLiveAdmin()
      const data = await fetchAllDonorRequests(live)
      const activeTrips = live ? [] : getAllActiveTrips()

      // Merge assignment status from active trips
      const enriched = data.map(req => {
        const matchingTrip = activeTrips.find(t => t.foodRequestId === req.id)
        if (matchingTrip) {
          return {
            ...req,
            status: 'ASSIGNED' as const,
            assignedVehicleId: matchingTrip.vehicleId,
            assignedVehicleReg: matchingTrip.vehicleReg,
          }
        }
        return req
      })

      setRequests(enriched)
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRequests()
    const handleSync = () => void loadRequests()
    window.addEventListener('storage', handleSync)
    window.addEventListener('focus', handleSync)
    let bc: BroadcastChannel | null = null
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('aahara_donations')
        bc.onmessage = () => void loadRequests()
      }
    } catch {}
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('focus', handleSync)
      if (bc) bc.close()
    }
  }, [])

  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE')

  const handleAssign = (request: DonorPickupRequest) => {
    const chosenVehicleId = selectedVehicleMap[request.id] || availableVehicles[0]?.vehicleId
    if (!chosenVehicleId) {
      notify?.('Please select an available vehicle to assign.', 'error')
      return
    }

    const vehicle = vehicles.find(v => v.vehicleId === chosenVehicleId)
    if (!vehicle) {
      notify?.('Selected vehicle was not found.', 'error')
      return
    }

    if (vehicle.capacityKg < request.estimatedWeightKg) {
      notify?.(
        `Vehicle capacity (${vehicle.capacityKg} kg) is insufficient for this pickup (${request.estimatedWeightKg} kg).`,
        'error'
      )
      return
    }

    const res = assignDonorPickupToVehicle(vehicle, request)
    if (res.success && res.trip) {
      // Mark vehicle as ON TRIP
      if (setVehicles) {
        setVehicles(prev =>
          prev.map(v => (v.vehicleId === vehicle.vehicleId ? { ...v, status: 'ON TRIP' } : v))
        )
      }

      setRequests(prev =>
        prev.map(r =>
          r.id === request.id
            ? {
                ...r,
                status: 'ASSIGNED',
                assignedVehicleId: vehicle.vehicleId,
                assignedVehicleReg: vehicle.registrationNumber,
              }
            : r
        )
      )

      notify?.(
        `Assigned ${request.donorName} (${request.estimatedWeightKg} kg) to vehicle ${vehicle.registrationNumber}!`,
        'success'
      )
    } else {
      notify?.(res.error || 'Failed to assign vehicle.', 'error')
    }
  }

  const awaitingCount = requests.filter(r => r.status === 'SUBMITTED').length
  const assignedCount = requests.filter(r => ['ASSIGNED', 'IN_TRANSIT'].includes(r.status)).length

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">FOOD & DONOR MANAGEMENT</span>
          <h1>Food & Donors</h1>
          <p>{isLiveAdmin() ? 'Food requests from the shared API. Schedule vehicles through Pickup & Logistics.' : 'Demo donor requests and fleet planning.'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="button button-secondary flex items-center gap-1.5"
            onClick={() => void loadRequests()}
            title="Refresh donor requests"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <a
            className="button button-primary flex items-center gap-1.5"
            href={`${import.meta.env.BASE_URL}donor/index.html`}
            target="_blank"
            rel="noreferrer"
          >
            Open donor prototype <ExternalLink size={15} />
          </a>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 block">Total Donor Requests</span>
          <strong className="text-2xl font-black text-slate-800 mt-1 block">{requests.length}</strong>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Received via backend & donor app</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-2xs">
          <span className="text-xs font-semibold text-amber-700 block">Awaiting review / pickup planning</span>
          <strong className="text-2xl font-black text-amber-800 mt-1 block">{awaitingCount}</strong>
          <span className="text-[11px] text-amber-600 mt-0.5 block">Review food safety before scheduling</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-700 block">Assigned / In Transit</span>
          <strong className="text-2xl font-black text-emerald-800 mt-1 block">{assignedCount}</strong>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">Active vehicle rescue operations</span>
        </div>
      </div>

      {/* Main Request List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Package size={18} className="text-emerald-700" />
            Live Food Requests from Donors
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {availableVehicles.length} vehicles currently available
          </span>
        </div>

        {loadError ? <div className="p-8 text-center bg-white rounded-2xl border border-slate-200" role="alert">Could not load food requests from the API. Check your Admin session and retry.</div> : requests.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <Package size={32} className="mx-auto text-slate-300 mb-2" />
            <h3 className="font-bold text-slate-700">No donor requests found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              No food requests received yet. Use the donor prototype to submit a donation, and it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {requests.map(req => {
              const selectedVehId = selectedVehicleMap[req.id] || availableVehicles[0]?.vehicleId || ''
              const candidateVehicle = vehicles.find(v => v.vehicleId === selectedVehId)
              const hasCapacity = candidateVehicle
                ? candidateVehicle.capacityKg >= req.estimatedWeightKg
                : false

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-200 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header: Donor & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          {req.donorName}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <MapPin size={13} className="text-emerald-600 shrink-0" />
                          <span>{req.pickupAddress}</span>
                        </p>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>

                    {/* Timings & Contact */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                        <Clock size={13} className="text-slate-400" />
                        <span>{`Ready: ${formatTime(req.readyAt)} · Due: ${formatTime(req.pickupDeadline)}`}</span>
                      </div>
                      {req.contactPhone && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                          <Phone size={13} className="text-slate-400" />
                          <span>{req.contactPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* Cargo Specs */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="rounded-xl border border-slate-150 bg-slate-50/70 p-2.5">
                        <span className="block text-[10px] font-bold uppercase text-slate-400">Cargo Weight</span>
                        <strong className="text-sm font-extrabold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Scale size={13} className="text-emerald-600" />
                          <span>{req.weightProvided === false ? 'Not provided' : `${req.estimatedWeightKg} kg`}</span>
                        </strong>
                      </div>
                      <div className="rounded-xl border border-slate-150 bg-slate-50/70 p-2.5">
                        <span className="block text-[10px] font-bold uppercase text-slate-400">Indicative Vessels</span>
                        <strong className="text-sm font-extrabold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Package size={13} className="text-emerald-600" />
                          <span>{req.weightProvided === false ? 'Pending' : `${req.totalVessels} Vessels`}</span>
                        </strong>
                      </div>
                    </div>

                    {/* Automated Equipment Requirement */}
                    <div className={`p-3 rounded-xl border text-xs space-y-1 ${req.equipment.badgeClass}`}>
                      <div className="flex items-center gap-1.5 font-bold">
                        {req.equipment.needsRefrigerator ? (
                          <ThermometerSnowflake size={15} />
                        ) : req.equipment.needsInsulatedBody ? (
                          <Flame size={15} />
                        ) : (
                          <Sparkles size={15} />
                        )}
                        <span>{req.equipment.label}</span>
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed">{req.equipment.reason}</p>
                    </div>

                    {/* Food Items */}
                    <div className="text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-150">
                      <span className="font-semibold text-slate-700">Food Items: </span>
                      <span>{req.foods.map(f => `${f.name} (${f.quantity} ${f.unit})`).join(', ')}</span>
                    </div>
                  </div>

                  {/* Assignment Action Footer */}
                  <div className="pt-3 border-t border-slate-100">
                    {isLiveAdmin() ? <p className="text-sm text-slate-600">Use Pickup & Logistics to plan and reserve a vehicle for this request.</p> :
                    req.status === 'ASSIGNED' ? (
                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-emerald-800">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          <span>
                            {`Assigned to vehicle: ${req.assignedVehicleReg || 'Registered Fleet'}`}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold bg-white text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          On Trip
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label htmlFor={`veh-select-${req.id}`} className="sr-only">
                            Select Vehicle
                          </label>
                          <select
                            id={`veh-select-${req.id}`}
                            value={selectedVehId}
                            onChange={e =>
                              setSelectedVehicleMap(prev => ({ ...prev, [req.id]: e.target.value }))
                            }
                            className="flex-1 h-10 px-3 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:border-emerald-500 focus:outline-none"
                            disabled={availableVehicles.length === 0}
                          >
                            {availableVehicles.length === 0 ? (
                              <option value="">No vehicles currently available</option>
                            ) : (
                              availableVehicles.map(v => (
                                <option key={v.vehicleId} value={v.vehicleId}>
                                  {`${v.registrationNumber} (${v.type}) · Cap: ${v.capacityKg} kg ${v.capacityKg < req.estimatedWeightKg ? '⚠️ Low Capacity' : '✓ Fits'}`}
                                </option>
                              ))
                            )}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleAssign(req)}
                            disabled={availableVehicles.length === 0 || !hasCapacity}
                            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <Truck size={14} /> Assign Vehicle
                          </button>
                        </div>
                        {candidateVehicle && !hasCapacity && (
                          <p className="text-[11px] text-rose-600 font-medium">
                            {`Selected vehicle capacity (${candidateVehicle.capacityKg} kg) is less than pickup weight (${req.estimatedWeightKg} kg).`}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
