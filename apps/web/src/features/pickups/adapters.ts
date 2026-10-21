import { ApiClientError } from '../../api/client'
import { getAdminAccessToken } from '../../api/auth'

export function isLiveAdmin(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem('aaharaconnect-admin-session') === '1'
}

/**
 * Returns the admin access token using the centralized Supabase Auth session adapter.
 */
export async function getLiveAccessToken(): Promise<string | null> {
  try {
    return await getAdminAccessToken()
  } catch {
    return null
  }
}


export function map409ErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    const code = error.code
    const msg = error.message.toLowerCase()

    if (code === 'VERSION_CONFLICT' || msg.includes('version')) {
      return 'Version conflict: This record was modified by another user. Please refresh and try again.'
    }
    if (code === 'INVALID_TRANSITION' || msg.includes('transition') || msg.includes('cannot perform action')) {
      return 'Invalid status transition: This action cannot be performed from the current status.'
    }
    if (msg.includes('capacity') || msg.includes('load') || msg.includes('insufficient')) {
      return 'Vehicle capacity exceeded: The vehicle cannot hold the estimated food load.'
    }
    if (msg.includes('maintenance') || msg.includes('unsafe') || msg.includes('licence') || msg.includes('expired')) {
      return 'Resource unavailable: The driver licence is expired or vehicle is currently in maintenance.'
    }
    if (msg.includes('reservation') || msg.includes('availability') || msg.includes('conflict') || msg.includes('overlap')) {
      return 'Time conflict: One or more selected volunteers, drivers, or vehicles are already booked for this window.'
    }
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'A resource conflict occurred. Please review your selection and try again.'
}
