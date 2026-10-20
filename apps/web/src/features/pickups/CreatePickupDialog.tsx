import { Sparkles, Truck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../../components/common/UI'
import { isLiveAdmin, map409ErrorMessage } from './adapters'
import { calculateAiLogistics } from './aiLogistics'
import { createPickup, reviewFoodSafety } from './api'
import { saveDemoPickup, useFoodRequests } from './hooks'
import type { Pickup } from './types'

interface Props {
  onClose: () => void
  onSuccess: (pickup: Pickup) => void
  notify: (message: string, kind?: 'success' | 'error') => void
}

export function CreatePickupDialog({ onClose, onSuccess, notify }: Props) {
  const { foodRequests, loading: loadingRequests, isDemoFallback } = useFoodRequests()

  const [foodRequestId, setFoodRequestId] = useState(
    foodRequests[0]?.id || 'f1000000-0000-4000-8000-000000000001'
  )

  useEffect(() => {
    if (foodRequests.length > 0 && !foodRequests.some(r => r.id === foodRequestId)) {
      setFoodRequestId(foodRequests[0].id)
    }
  }, [foodRequests, foodRequestId])

  const selectedRequest = useMemo(
    () => foodRequests.find(r => r.id === foodRequestId) || foodRequests[0],
    [foodRequests, foodRequestId]
  )

  const aiAssessment = useMemo(
    () =>
      calculateAiLogistics(
        selectedRequest?.foods || [],
        selectedRequest?.donorName,
        selectedRequest?.location
      ),
    [selectedRequest]
  )

  const [deliveryAddress, setDeliveryAddress] = useState(
    'AaharaConnect Distribution Center, Indiranagar'
  )
  const [windowStartsAt, setWindowStartsAt] = useState(() => {
    const d = new Date(Date.now() + 3600000)
    return d.toISOString().slice(0, 16)
  })
  const [windowEndsAt, setWindowEndsAt] = useState(() => {
    const d = new Date(Date.now() + 14400000)
    return d.toISOString().slice(0, 16)
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [safetyReviews, setSafetyReviews] = useState<Record<string, string>>({})
  const [approvingSafety, setApprovingSafety] = useState(false)

  const currentSafetyReview = safetyReviews[foodRequestId] || selectedRequest?.safetyReview || 'APPROVED'

  const handleApproveSafety = async () => {
    if (!foodRequestId) return
    setApprovingSafety(true)
    setError(null)
    try {
      if (isLiveAdmin()) {
        await reviewFoodSafety(foodRequestId, 'APPROVED')
      }
      setSafetyReviews(prev => ({ ...prev, [foodRequestId]: 'APPROVED' }))
      notify('Food safety review approved.')
    } catch (err: unknown) {
      const msg = map409ErrorMessage(err)
      setError(msg)
      notify(msg, 'error')
    } finally {
      setApprovingSafety(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!foodRequestId || !deliveryAddress.trim()) {
      notify('Please fill in all required fields.', 'error')
      return
    }
    if (isLiveAdmin() && currentSafetyReview !== 'APPROVED') {
      const msg = 'Food request safety review must be APPROVED before scheduling a pickup. Please click "Approve Safety".'
      setError(msg)
      notify(msg, 'error')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      if (isLiveAdmin()) {
        const created = await createPickup({
          foodRequestId,
          deliveryAddress: deliveryAddress.trim(),
          windowStartsAt: new Date(windowStartsAt).toISOString(),
          windowEndsAt: new Date(windowEndsAt).toISOString(),
        })
        notify('Pickup scheduled successfully.')
        onSuccess(created)
      } else {
        const demoCreated: Pickup = {
          id: 'p1000000-0000-4000-8000-' + String(Date.now()).slice(-12).padStart(12, '0'),
          foodRequestId,
          deliveryAddress: deliveryAddress.trim(),
          windowStartsAt: new Date(windowStartsAt).toISOString(),
          windowEndsAt: new Date(windowEndsAt).toISOString(),
          status: 'PLANNED',
          version: 1,
          createdAt: new Date().toISOString(),
          donorName: selectedRequest?.donorName || 'Food Donor',
          donorLocation: selectedRequest?.location || 'Bengaluru',
          foods: selectedRequest?.foods || [],
          aiAssessment,
        }
        saveDemoPickup(demoCreated)
        notify('Pickup scheduled successfully.')
        onSuccess(demoCreated)
      }
      onClose()
    } catch (err: unknown) {
      const msg = map409ErrorMessage(err)
      setError(msg)
      notify(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Schedule Pickup"
      subtitle="Schedule food rescue for an approved food request."
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="dialog-form"
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}
      >
        {error && (
          <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {isDemoFallback && (
          <div
            className="wizard-tip"
            style={{
              padding: '0.5rem',
              background: '#fef3c7',
              borderRadius: '4px',
              fontSize: '0.85rem',
            }}
          >
            <strong>Demo food requests (Waiting for Team 2 API)</strong>
          </div>
        )}

        <label className="field">
          <span>Food Request</span>
          <select
            value={foodRequestId}
            onChange={e => setFoodRequestId(e.target.value)}
            disabled={loadingRequests}
          >
            {foodRequests.map(fr => (
              <option key={fr.id} value={fr.id} disabled={!!fr.pickup}>
                {`${fr.donorName} (${fr.location})${fr.pickup ? ' — Already Scheduled' : fr.safetyReview === 'PENDING' ? ' — Safety Review Pending' : ''}`}
              </option>
            ))}
          </select>
        </label>

        {currentSafetyReview === 'PENDING' ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              gap: '0.5rem',
            }}
          >
            <div>
              <strong style={{ color: '#92400e', fontSize: '0.85rem' }}>
                {'Food Safety Review: PENDING'}
              </strong>
              <p style={{ margin: '2px 0 0', color: '#b45309', fontSize: '0.78rem' }}>
                {'Admin safety approval is required before scheduling pickup.'}
              </p>
            </div>
            <button
              type="button"
              className="button button-secondary"
              style={{ fontSize: '0.8rem', padding: '4px 10px', height: 'auto', whiteSpace: 'nowrap' }}
              disabled={approvingSafety}
              onClick={handleApproveSafety}
            >
              {approvingSafety ? 'Approving…' : 'Approve Safety'}
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#047857',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
            }}
          >
            <span>{'✓ Food Safety Review: APPROVED'}</span>
          </div>
        )}

        {/* AI Logistics Preview Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#065f46',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              <Sparkles size={16} />
              <span>AI Logistics Assessment</span>
            </div>
            <span
              style={{
                background: '#d1fae5',
                color: '#065f46',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
              }}
            >
              {`${aiAssessment.vehicle.suitabilityScore}% Match`}
            </span>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#0f172a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <Truck size={14} style={{ color: '#059669' }} />
              <span>Recommended Vehicle</span>
              <span>:</span>
              <strong style={{ color: '#047857' }}>{aiAssessment.vehicle.vehicleType}</strong>
            </div>
            <p style={{ margin: '2px 0 0', color: '#475569', fontSize: '0.78rem' }}>
              {aiAssessment.vehicle.reason}
            </p>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#0f172a' }}>
            <span style={{ fontWeight: 600 }}>Required Vessels</span>
            <span>:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '3px' }}>
              {aiAssessment.vessels.map(v => (
                <span
                  key={v.containerType}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '2px 6px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {`${v.count}x ${v.containerType}`}
                </span>
              ))}
            </div>
          </div>
        </div>

        <label className="field">
          <span>Delivery Address</span>
          <input
            type="text"
            value={deliveryAddress}
            onChange={e => setDeliveryAddress(e.target.value)}
            placeholder="Enter destination address"
            required
          />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label className="field">
            <span>Window Start</span>
            <input
              type="datetime-local"
              value={windowStartsAt}
              onChange={e => setWindowStartsAt(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Window End</span>
            <input
              type="datetime-local"
              value={windowEndsAt}
              onChange={e => setWindowEndsAt(e.target.value)}
              required
            />
          </label>
        </div>

        <div
          className="dialog-footer"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1rem',
          }}
        >
          <button type="button" className="button button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button button-primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Schedule Pickup'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
