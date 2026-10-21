import { useCallback, useEffect, useState } from 'react'
import { isLiveAdmin } from './adapters'
import { calculateAiLogistics } from './aiLogistics'
import {
  fetchDrivers,
  fetchFoodRequests,
  fetchPickups,
  fetchVehicleAssignments,
  fetchVehicles,
  fetchVolunteers,
} from './api'
import type {
  AssignmentStatusLive,
  FoodRequestSummary,
  LiveAssignment,
  Pickup,
  PickupStatus,
  VehicleAssignmentSummary,
} from './types'

export const initialDemoPickups: Pickup[] = [
  {
    id: 'p1000000-0000-4000-8000-000000000001',
    foodRequestId: 'f1000000-0000-4000-8000-000000000001',
    donorName: 'Bengaluru Palace Banquet',
    donorLocation: 'Vasanth Nagar, Bengaluru',
    deliveryAddress: 'AaharaConnect Indiranagar Distribution Center',
    status: 'PLANNED',
    windowStartsAt: new Date(Date.now() + 3600000).toISOString(),
    windowEndsAt: new Date(Date.now() + 10800000).toISOString(),
    version: 1,
    createdAt: new Date().toISOString(),
    foods: [
      { name: 'Rice', foodType: 'VEG', quantity: 25, unit: 'kg', peopleFed: 120 },
      { name: 'Dal / sambar', foodType: 'VEG', quantity: 15, unit: 'kg', peopleFed: 100 },
      { name: 'Veg curry', foodType: 'VEG', quantity: 10, unit: 'kg', peopleFed: 80 },
      { name: 'Gulab jamun', foodType: 'SWEETS', quantity: 5, unit: 'kg', peopleFed: 60 },
    ],
    aiAssessment: calculateAiLogistics([
      { name: 'Rice', foodType: 'VEG', quantity: 25, unit: 'kg', peopleFed: 120 },
      { name: 'Dal / sambar', foodType: 'VEG', quantity: 15, unit: 'kg', peopleFed: 100 },
      { name: 'Veg curry', foodType: 'VEG', quantity: 10, unit: 'kg', peopleFed: 80 },
      { name: 'Gulab jamun', foodType: 'SWEETS', quantity: 5, unit: 'kg', peopleFed: 60 },
    ], 'Bengaluru Palace Banquet', 'Vasanth Nagar, Bengaluru'),
  },
  {
    id: 'p1000000-0000-4000-8000-000000000002',
    foodRequestId: 'f1000000-0000-4000-8000-000000000002',
    donorName: 'Koramangala Community Kitchen',
    donorLocation: '5th Block Koramangala, Bengaluru',
    deliveryAddress: 'AaharaConnect Shanthi Nagar Community Shelter',
    status: 'ASSIGNED',
    windowStartsAt: new Date(Date.now() + 7200000).toISOString(),
    windowEndsAt: new Date(Date.now() + 14400000).toISOString(),
    version: 1,
    createdAt: new Date().toISOString(),
    foods: [
      { name: 'Veg biryani', foodType: 'VEG', quantity: 12, unit: 'kg', peopleFed: 50 },
      { name: 'Raita', foodType: 'VEG', quantity: 4, unit: 'kg', peopleFed: 40 },
    ],
    aiAssessment: calculateAiLogistics([
      { name: 'Veg biryani', foodType: 'VEG', quantity: 12, unit: 'kg', peopleFed: 50 },
      { name: 'Raita', foodType: 'VEG', quantity: 4, unit: 'kg', peopleFed: 40 },
    ], 'Koramangala Community Kitchen', '5th Block Koramangala, Bengaluru'),
  },
]

export function saveDemoPickup(pickup: Pickup) {
  try {
    let list: Pickup[] = []
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('aa:demo-pickups') : null
    if (stored) {
      list = JSON.parse(stored)
    } else {
      list = [...initialDemoPickups]
    }
    const next = [pickup, ...list.filter(p => p.id !== pickup.id)]
    window.localStorage.setItem('aa:demo-pickups', JSON.stringify(next))
  } catch {}
}

export function updateDemoPickupStatus(pickupId: string, status: PickupStatus) {
  try {
    let list: Pickup[] = []
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('aa:demo-pickups') : null
    if (stored) {
      list = JSON.parse(stored)
    } else {
      list = [...initialDemoPickups]
    }
    const next = list.map(p => (p.id === pickupId ? { ...p, status } : p))
    window.localStorage.setItem('aa:demo-pickups', JSON.stringify(next))
  } catch {}
}

export function saveDemoAssignment(assignment: LiveAssignment) {
  try {
    let map: Record<string, LiveAssignment> = {}
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('aa:demo-assignments') : null
    if (stored) {
      map = JSON.parse(stored)
    }
    map[assignment.pickupId] = assignment
    map[assignment.id] = assignment
    window.localStorage.setItem('aa:demo-assignments', JSON.stringify(map))
  } catch {}
}

export function getDemoAssignment(pickupIdOrAssignmentId: string): LiveAssignment | null {
  try {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('aa:demo-assignments') : null
    if (stored) {
      const map = JSON.parse(stored)
      return map[pickupIdOrAssignmentId] || null
    }
  } catch {}
  return null
}

export function updateDemoAssignmentStatus(assignmentId: string, status: AssignmentStatusLive): LiveAssignment | null {
  try {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('aa:demo-assignments') : null
    if (stored) {
      const map = JSON.parse(stored)
      const existing = map[assignmentId]
      if (existing) {
        const updated: LiveAssignment = { ...existing, status, version: (existing.version || 0) + 1 }
        map[assignmentId] = updated
        if (existing.pickupId) {
          map[existing.pickupId] = updated
        }
        window.localStorage.setItem('aa:demo-assignments', JSON.stringify(map))
        return updated
      }
    }
  } catch {}
  return null
}

export function syncPickupsWithDonations(basePickups: Pickup[]): Pickup[] {
  let donations: FoodRequestSummary[] = []
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('aa:donations') : null
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) donations = parsed
    }
  } catch {}

  const existingFoodRequestIds = new Set(basePickups.map(p => p.foodRequestId))
  const newPickups: Pickup[] = []

  for (const d of donations) {
    if (!existingFoodRequestIds.has(d.id)) {
      const ai = calculateAiLogistics(d.foods || [], d.donorName, d.location)
      newPickups.push({
        id: 'p' + d.id.slice(1),
        foodRequestId: d.id,
        status: 'PLANNED',
        windowStartsAt: d.readyAt || new Date(Date.now() + 3600000).toISOString(),
        windowEndsAt: d.pickupDeadline || new Date(Date.now() + 14400000).toISOString(),
        deliveryAddress: 'AaharaConnect Distribution Center, Indiranagar',
        version: 1,
        createdAt: new Date().toISOString(),
        donorName: d.donorName,
        donorLocation: d.location,
        foods: d.foods || [],
        aiAssessment: ai,
      })
      existingFoodRequestIds.add(d.id)
    }
  }

  const combined = [...newPickups, ...basePickups]

  // Ensure all pickups have an AI assessment calculated
  const withAi = combined.map(p => {
    if (!p.aiAssessment) {
      return {
        ...p,
        aiAssessment: calculateAiLogistics(p.foods || [], p.donorName, p.donorLocation),
      }
    }
    return p
  })

  // Ensure base initial demo pickups are preserved
  for (const init of initialDemoPickups) {
    if (!withAi.some(p => p.id === init.id)) {
      withAi.push(init)
    }
  }

  return withAi
}

export function usePickups() {
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadInitial = useCallback(async () => {
    if (!isLiveAdmin()) {
      let list = [...initialDemoPickups]
      try {
        const stored = typeof window !== 'undefined' ? window.localStorage.getItem('aa:demo-pickups') : null
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed
          }
        }
      } catch {}

      const synced = syncPickupsWithDonations(list)
      setPickups(synced)
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('aa:demo-pickups', JSON.stringify(synced))
        }
      } catch {}
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPickups(null)
      setPickups(data.items)
      setNextCursor(data.nextCursor)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load pickups.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore || !isLiveAdmin()) return
    setLoadingMore(true)
    try {
      const data = await fetchPickups(nextCursor)
      setPickups(prev => [...prev, ...data.items])
      setNextCursor(data.nextCursor)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load more pickups.')
    } finally {
      setLoadingMore(false)
    }
  }, [nextCursor, loadingMore])

  useEffect(() => {
    void loadInitial()
    const handleSync = () => void loadInitial()
    let bc: BroadcastChannel | null = null
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleSync)
      window.addEventListener('focus', handleSync)
      try {
        if ('BroadcastChannel' in window) {
          bc = new BroadcastChannel('aahara_donations')
          bc.onmessage = () => {
            void loadInitial()
          }
        }
      } catch {}
      return () => {
        window.removeEventListener('storage', handleSync)
        window.removeEventListener('focus', handleSync)
        if (bc) bc.close()
      }
    }
  }, [loadInitial])

  return {
    pickups,
    loading,
    loadingMore,
    hasMore: Boolean(nextCursor),
    error,
    loadMore,
    reload: loadInitial,
  }
}

export const fallbackDemoFoodRequests: FoodRequestSummary[] = [
  {
    id: 'f1000000-0000-4000-8000-000000000001',
    donorName: 'Bengaluru Palace Banquet',
    location: 'Vasanth Nagar, Bengaluru',
    readyAt: new Date(Date.now() + 3600000).toISOString(),
    pickupDeadline: new Date(Date.now() + 14400000).toISOString(),
    status: 'SUBMITTED',
    safetyReview: 'APPROVED',
    isDemo: true,
    foods: [
      { name: 'Rice', foodType: 'VEG', quantity: 25, unit: 'kg', peopleFed: 120 },
      { name: 'Dal / sambar', foodType: 'VEG', quantity: 15, unit: 'kg', peopleFed: 100 },
      { name: 'Veg curry', foodType: 'VEG', quantity: 10, unit: 'kg', peopleFed: 80 },
      { name: 'Gulab jamun', foodType: 'SWEETS', quantity: 5, unit: 'kg', peopleFed: 60 },
    ],
    totalFeeds: 360,
  },
  {
    id: 'f1000000-0000-4000-8000-000000000002',
    donorName: 'Koramangala Community Kitchen',
    location: '5th Block Koramangala, Bengaluru',
    readyAt: new Date(Date.now() + 7200000).toISOString(),
    pickupDeadline: new Date(Date.now() + 18000000).toISOString(),
    status: 'SUBMITTED',
    safetyReview: 'APPROVED',
    isDemo: true,
    foods: [
      { name: 'Veg biryani', foodType: 'VEG', quantity: 12, unit: 'kg', peopleFed: 50 },
      { name: 'Raita', foodType: 'VEG', quantity: 4, unit: 'kg', peopleFed: 40 },
    ],
    totalFeeds: 90,
  },
  {
    id: 'f1000000-0000-4000-8000-000000000003',
    donorName: 'Indiranagar Wedding Convention',
    location: '100ft Road Indiranagar, Bengaluru',
    readyAt: new Date(Date.now() + 1800000).toISOString(),
    pickupDeadline: new Date(Date.now() + 10800000).toISOString(),
    status: 'SUBMITTED',
    safetyReview: 'APPROVED',
    isDemo: true,
    foods: [
      { name: 'Chicken biryani', foodType: 'NON_VEG', quantity: 45, unit: 'kg', peopleFed: 180 },
      { name: 'Gravy / Shervah', foodType: 'NON_VEG', quantity: 20, unit: 'kg', peopleFed: 150 },
      { name: 'Roti / Chapati', foodType: 'VEG', quantity: 150, unit: 'pcs', peopleFed: 75 },
    ],
    totalFeeds: 405,
  },
]

export function useFoodRequests() {
  const [foodRequests, setFoodRequests] = useState<FoodRequestSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [isDemoFallback, setIsDemoFallback] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRequests = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!isLiveAdmin()) {
      let localDonations: FoodRequestSummary[] = []
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('aa:donations') : null
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            localDonations = parsed
          }
        }
      } catch {}

      setFoodRequests([...localDonations, ...fallbackDemoFoodRequests])
      setIsDemoFallback(true)
      setLoading(false)
      return
    }

    try {
      const res = await fetchFoodRequests()
      if (Array.isArray(res?.items)) {
        setFoodRequests(res.items)
        setIsDemoFallback(false)
      } else {
        setFoodRequests([])
        setIsDemoFallback(false)
      }
    } catch (err: unknown) {
      // In live admin mode, report the error honestly rather than pretending live succeeded with fake data
      const message = err instanceof Error ? err.message : 'Unable to fetch food requests from server.'
      setError(message)
      setFoodRequests([])
      setIsDemoFallback(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRequests()
    const handleSync = () => void loadRequests()
    if (typeof window !== 'undefined') {
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
    }
  }, [loadRequests])

  return { foodRequests, loading, isDemoFallback, error, reload: loadRequests }
}

export function useAssignWizardResources() {
  const [volunteers, setVolunteers] = useState<unknown[]>([])
  const [drivers, setDrivers] = useState<unknown[]>([])
  const [vehicles, setVehicles] = useState<unknown[]>([])
  const [waitingTeam1, setWaitingTeam1] = useState<string | null>(null)
  const [waitingTeam5Drivers, setWaitingTeam5Drivers] = useState<string | null>(null)
  const [waitingTeam5Vehicles, setWaitingTeam5Vehicles] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const loadResources = async () => {
      setLoading(true)

      if (!isLiveAdmin()) {
        if (active) {
          setVolunteers([])
          setDrivers([])
          setVehicles([])
          setLoading(false)
        }
        return
      }

      // Check Volunteers (Team 1)
      try {
        const volRes = await fetchVolunteers()
        if (active) {
          if (Array.isArray(volRes?.items) && volRes.items.length > 0) {
            setVolunteers(volRes.items)
            setWaitingTeam1(null)
          } else {
            setWaitingTeam1('Team 1 Volunteers API: no records returned')
          }
        }
      } catch {
        if (active) {
          setWaitingTeam1('Waiting for Team 1 API (GET /volunteers)')
        }
      }

      // Check Drivers (Team 5)
      try {
        const drvRes = await fetchDrivers()
        if (active) {
          if (Array.isArray(drvRes?.items) && drvRes.items.length > 0) {
            setDrivers(drvRes.items)
            setWaitingTeam5Drivers(null)
          } else {
            setWaitingTeam5Drivers('Team 5 Drivers API: no records returned')
          }
        }
      } catch {
        if (active) {
          setWaitingTeam5Drivers('Waiting for Team 5 API (GET /drivers)')
        }
      }

      // Check Vehicles (Team 5)
      try {
        const vehRes = await fetchVehicles()
        if (active) {
          if (Array.isArray(vehRes?.items) && vehRes.items.length > 0) {
            setVehicles(vehRes.items)
            setWaitingTeam5Vehicles(null)
          } else {
            setWaitingTeam5Vehicles('Team 5 Vehicles API: no records returned')
          }
        }
      } catch {
        if (active) {
          setWaitingTeam5Vehicles('Waiting for Team 5 API (GET /vehicles)')
        }
      }

      if (active) setLoading(false)
    }

    void loadResources()
    return () => {
      active = false
    }
  }, [])

  return {
    volunteers,
    drivers,
    vehicles,
    waitingTeam1,
    waitingTeam5Drivers,
    waitingTeam5Vehicles,
    loading,
  }
}

export function useVehicleAssignments(vehicleId?: string | null) {
  const [assignments, setAssignments] = useState<VehicleAssignmentSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!vehicleId || !isLiveAdmin()) {
      setAssignments([])
      return
    }
    let active = true
    setLoading(true)
    setError(null)
    fetchVehicleAssignments(vehicleId)
      .then(items => {
        if (active) setAssignments(items)
      })
      .catch(err => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load vehicle projection.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [vehicleId])

  return { assignments, loading, error }
}
