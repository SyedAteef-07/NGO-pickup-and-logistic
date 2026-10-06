import { useState } from 'react'
import type { Pickup } from '@aaharaconnect/shared'
import { getAdminAccessToken, isLiveAuthConfigured } from '../../api/auth'
import { listLivePickups } from '../../api/pickups'

type State = 'idle' | 'loading' | 'unconfigured' | 'sign-in' | 'forbidden' | 'error' | 'ready'

export default function LivePickupsPanel() {
  const [state, setState] = useState<State>(isLiveAuthConfigured() ? 'idle' : 'unconfigured')
  const [pickups, setPickups] = useState<Pickup[]>([])

  async function load() {
    if (!isLiveAuthConfigured()) { setState('unconfigured'); return }
    setState('loading')
    try {
      const token = await getAdminAccessToken()
      if (!token) { setState('sign-in'); return }
      const page = await listLivePickups(token)
      setPickups(page.items)
      setState('ready')
    } catch (error) {
      const status = typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined
      setState(status === 401 ? 'sign-in' : status === 403 ? 'forbidden' : 'error')
    }
  }

  return <section className="panel live-pickups" aria-live="polite">
    <div className="live-pickups-heading"><div><h2>Live pickup records</h2><p>Read-only records from the shared API. The assignment table below uses demo data.</p></div><button className="button button-secondary" type="button" onClick={() => void load()} disabled={state === 'loading' || state === 'unconfigured'}>{state === 'idle' ? 'Load live pickups' : 'Refresh'}</button></div>
    {state === 'idle' && <p>Select Load live pickups to view shared API records.</p>}
    {state === 'loading' && <p>Loading pickups…</p>}
    {state === 'unconfigured' && <p>Live API access is not configured for this deployment.</p>}
    {state === 'sign-in' && <p>Sign in as an administrator under Settings to view live pickups.</p>}
    {state === 'forbidden' && <p>Your account does not have administrator access to pickups.</p>}
    {state === 'error' && <p>Could not load live pickups. Check the API connection and try again.</p>}
    {state === 'ready' && (pickups.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Pickup ID</th><th>Window starts</th><th>Window ends</th><th>Status</th></tr></thead><tbody>{pickups.map(pickup => <tr key={pickup.id}><td>{pickup.id}</td><td>{new Date(pickup.windowStartsAt).toLocaleString()}</td><td>{new Date(pickup.windowEndsAt).toLocaleString()}</td><td><span className="live-status">{pickup.status.replaceAll('_', ' ')}</span></td></tr>)}</tbody></table></div> : <p>No live pickups found.</p>)}
  </section>
}
