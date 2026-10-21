import { useCallback, useEffect, useState } from 'react'
import { getAdminAccessToken, isLiveAuthConfigured } from '../../api/auth'

type AdminMode = 'checking' | 'demo' | 'live' | 'error'

export function useAdminMode() {
  const [mode, setMode] = useState<AdminMode>(isLiveAuthConfigured() && window.localStorage.getItem('aaharaconnect-admin-session') ? 'checking' : 'demo')
  const [token, setToken] = useState<string | null>(null)
  const check = useCallback(async () => {
    if (!isLiveAuthConfigured() || !window.localStorage.getItem('aaharaconnect-admin-session')) { setMode('demo'); return }
    setMode('checking')
    try {
      const next = await getAdminAccessToken()
      setToken(next)
      setMode(next ? 'live' : 'demo')
    } catch {
      setToken(null)
      setMode('error')
    }
  }, [])
  useEffect(() => { void check() }, [check])
  return { mode, token, retry: check }
}
