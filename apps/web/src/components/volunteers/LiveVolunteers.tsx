import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Team, Volunteer } from '@aaharaconnect/shared'
import { ChevronDown, Phone, Plus, Search, SlidersHorizontal, Users, X } from 'lucide-react'
import { getAdminVolunteer, listAdminTeams, listAdminVolunteers } from '../../features/volunteers/api'
import { Avatar, Drawer, EmptyState, StatusBadge } from '../common/UI'

export default function LiveVolunteers({ token }: { token: string }) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [teamId, setTeamId] = useState('all')
  const [skill, setSkill] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<Volunteer | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(false)
    try {
      const [nextVolunteers, nextTeams] = await Promise.all([listAdminVolunteers(token), listAdminTeams(token)])
      setVolunteers(nextVolunteers); setTeams(nextTeams)
    } catch { setVolunteers([]); setTeams([]); setError(true) }
    finally { setLoading(false) }
  }, [token])
  useEffect(() => { void load() }, [load])
  const loadDetail = useCallback(async (id: string) => {
    setSelectedId(id); setDetail(null); setDetailLoading(true); setDetailError(false)
    try { setDetail(await getAdminVolunteer(token, id)) }
    catch { setDetailError(true) }
    finally { setDetailLoading(false) }
  }, [token])
  const teamNames = (id: string) => teams.filter(team => team.memberIds.includes(id)).map(team => team.name).join(', ') || 'Unassigned'
  const skills = useMemo(() => [...new Set(volunteers.flatMap(volunteer => volunteer.skills))].sort(), [volunteers])
  const filtered = useMemo(() => volunteers.filter(volunteer => {
    const query = search.trim().toLowerCase()
    return (!query || `${volunteer.name} ${volunteer.phoneE164 ?? ''} ${volunteer.registrationCode}`.toLowerCase().includes(query))
      && (status === 'all' || volunteer.status === status)
      && (teamId === 'all' || (teamId === 'none' ? !teams.some(team => team.memberIds.includes(volunteer.id)) : teams.some(team => team.id === teamId && team.memberIds.includes(volunteer.id))))
      && (skill === 'all' || volunteer.skills.includes(skill))
  }), [volunteers, teams, search, status, teamId, skill])

  return <>
    <div className="page-heading"><div><span className="eyebrow">PEOPLE & CAPACITY</span><h1>Volunteers</h1><p>Manage NGO volunteers and their availability.</p></div><button className="button button-primary" disabled title="Volunteer onboarding is not connected to an admin API"><Plus size={18}/> Add Volunteer</button></div>
    <div className="info-strip"><div className="info-strip-icon"><Users size={21}/></div><div><strong>Live administrator roster</strong><span>Read-only records from the shared API. Add and edit actions are unavailable here.</span></div><span className="info-strip-count">{volunteers.length} profiles</span></div>
    <section className="panel volunteer-panel" aria-live="polite">
      <div className="table-toolbar"><div className="search-wrap"><Search size={18}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search volunteers by name, phone or registration" aria-label="Search volunteers"/>{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={16}/></button>}</div><span className="result-count">Showing {filtered.length} of {volunteers.length} volunteers</span></div>
      <div className="filters"><span className="filter-caption"><SlidersHorizontal size={17}/> Filters</span><label className="select-wrap"><select value={status} onChange={event => setStatus(event.target.value)} aria-label="Filter by status"><option value="all">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select><ChevronDown size={15}/></label><label className="select-wrap"><select value={teamId} onChange={event => setTeamId(event.target.value)} aria-label="Filter by team"><option value="all">All teams</option>{teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}<option value="none">Unassigned</option></select><ChevronDown size={15}/></label><label className="select-wrap"><select value={skill} onChange={event => setSkill(event.target.value)} aria-label="Filter by skill"><option value="all">All skills</option>{skills.map(value => <option key={value} value={value}>{value}</option>)}</select><ChevronDown size={15}/></label>{(status !== 'all' || teamId !== 'all' || skill !== 'all') && <button className="clear-filters" onClick={() => { setStatus('all'); setTeamId('all'); setSkill('all') }}>Clear filters</button>}</div>
      {loading ? <p className="quiet-text" style={{ padding: 20 }}>Loading volunteers…</p> : error ? <EmptyState title="Could not load volunteers" description="Check your administrator session and API connection, then retry." action={<button className="button button-secondary" onClick={() => void load()}>Retry</button>}/> : filtered.length ? <div className="table-scroll"><table className="data-table volunteer-table"><thead><tr><th>Volunteer</th><th>Phone</th><th>Skills</th><th>Team</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map(volunteer => <tr key={volunteer.id}><td><button className="person-cell" onClick={() => void loadDetail(volunteer.id)}><Avatar name={volunteer.name}/><span><strong>{volunteer.name}</strong><small>{volunteer.registrationCode}</small></span></button></td><td>{volunteer.phoneE164 ?? '—'}</td><td><div className="skill-list">{volunteer.skills.map(value => <span className="skill-badge" key={value}>{value}</span>)}</div></td><td><span className="team-cell">{teamNames(volunteer.id)}</span></td><td><StatusBadge status={volunteer.status}/></td><td><button className="text-link" onClick={() => void loadDetail(volunteer.id)}>View profile</button></td></tr>)}</tbody></table></div> : <EmptyState title="No volunteers found" description="Try a different search or clear the filters to see more people." action={<button className="button button-secondary" onClick={() => { setSearch(''); setStatus('all'); setTeamId('all'); setSkill('all') }}>Clear search and filters</button>}/>}
      <div className="table-footer"><span>Live volunteer roster</span><button className="text-link" onClick={() => void load()} disabled={loading}>Refresh</button></div>
    </section>
    {selectedId && <Drawer title="Volunteer profile" onClose={() => { setSelectedId(null); setDetail(null) }}><div className="drawer-body">{detailLoading ? <p className="quiet-text">Loading volunteer profile…</p> : detailError ? <EmptyState title="Could not load volunteer profile" description="Try again to read this record." action={<button className="button button-secondary" onClick={() => void loadDetail(selectedId)}>Retry</button>}/> : detail ? <><div className="profile-hero"><Avatar name={detail.name} size="lg"/><h2>{detail.name}</h2><span className="muted-id">{detail.registrationCode}</span><StatusBadge status={detail.status}/></div><div className="detail-section"><h3>Volunteer details</h3><div className="detail-grid"><div><span>Phone</span><strong><Phone size={15}/>{detail.phoneE164 ?? '—'}</strong></div><div><span>Team</span><strong><Users size={15}/>{teamNames(detail.id)}</strong></div></div><div className="detail-skills"><span>Skills</span><div className="skill-list">{detail.skills.map(value => <span className="skill-badge" key={value}>{value}</span>)}</div></div></div><p className="quiet-text">Availability and assignment history are not included in this administrator read API.</p></> : null}</div></Drawer>}
  </>
}
