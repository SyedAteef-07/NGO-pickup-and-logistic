import { useEffect, useState } from 'react'
import App from './App'
import Landing from './pages/Landing'

const WORKSPACE_HASH = '#/workspace'

export default function Root() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onHash = () => { setHash(window.location.hash); window.scrollTo({ top:0 }) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return hash.startsWith(WORKSPACE_HASH) ? <App /> : <Landing />
}
