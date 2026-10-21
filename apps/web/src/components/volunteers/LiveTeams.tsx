import { useCallback, useEffect, useState } from 'react'
import type { Team, Volunteer } from '@aaharaconnect/shared'
import { ArrowRight, Crown, Plus, ShieldCheck, UsersRound } from 'lucide-react'
import { getAdminTeam, listAdminTeams, listAdminVolunteers } from '../../features/volunteers/api'
import { Avatar, Drawer, EmptyState, StatusBadge } from '../common/UI'

export default function LiveTeams({ token }: { token: string }) {
  const [teams, setTeams] = useState<Team[]>([])
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<Team | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(false)
  const getVolunteer = (id: string) => volunteers.find(volunteer => volunteer.id === id)
  const load = useCallback(async () => {
    setLoading(true); setError(false)
    try {
      const [nextTeams, nextVolunteers] = await Promise.all([listAdminTeams(token), listAdminVolunteers(token)])
      setTeams(nextTeams); setVolunteers(nextVolunteers)
    } catch { setTeams([]); setVolunteers([]); setError(true) }
    finally { setLoading(false) }
  }, [token])
  useEffect(() => { void load() }, [load])
  const loadDetail = useCallback(async (id: string) => {
    setSelectedId(id); setDetail(null); setDetailLoading(true); setDetailError(false)
    try { setDetail(await getAdminTeam(token, id)) }
    catch { setDetailError(true) }
    finally { setDetailLoading(false) }
  }, [token])

  return <>
    <div className="page-heading"><div><span className="eyebrow">PEOPLE WORKING TOGETHER</span><h1>Volunteer Teams</h1><p>Build reliable crews for every food rescue.</p></div><button className="button button-primary" disabled title="Team changes are not connected in this read-only view"><Plus size={18}/> Create Team</button></div>
    <div className="team-intro"><div className="team-intro-icon"><UsersRound size={23}/></div><div><strong>Live team roster</strong><p>Read-only team and membership records from the shared API.</p></div><span>{teams.length} teams</span></div>
    {loading ? <section className="panel" style={{ padding: 20 }}><p>Loading teams…</p></section> : error ? <section className="panel"><EmptyState title="Could not load teams" description="Check your administrator session and API connection, then retry." action={<button className="button button-secondary" onClick={() => void load()}>Retry</button>}/></section> : teams.length ? <div className="team-grid">{teams.map(team => {
      const members = team.memberIds.map(getVolunteer).filter((member): member is Volunteer => !!member)
      const leader = team.leaderVolunteerId ? getVolunteer(team.leaderVolunteerId) : null
      return <article className="team-card" key={team.id}><div className="team-card-top"><div className="team-symbol"><UsersRound size={22}/></div></div><div className="team-card-title"><span>{team.id}</span><h2>{team.name}</h2></div><div className="team-leader"><span>TEAM LEADER</span><div><Avatar name={leader?.name ?? 'Team leader'} size="sm"/><strong>{leader?.name ?? 'Unassigned'}</strong><Crown size={15}/></div></div><div className="team-card-stats"><div><strong>{team.memberIds.length}</strong><span>Members</span></div></div><div className="team-card-footer"><div className="avatar-stack">{members.slice(0, 4).map(member => <Avatar key={member.id} name={member.name} size="sm"/>)}{members.length > 4 && <span className="avatar-overflow">+{members.length - 4}</span>}</div><button onClick={() => void loadDetail(team.id)}>View Team <ArrowRight size={17}/></button></div></article>
    })}</div> : <section className="panel"><EmptyState title="No teams found" description="There are no team records in the shared API yet." action={<button className="button button-secondary" onClick={() => void load()}>Retry</button>}/></section>}
    {selectedId && <Drawer title="Team details" onClose={() => { setSelectedId(null); setDetail(null) }}><div className="drawer-body">{detailLoading ? <p className="quiet-text">Loading team details…</p> : detailError ? <EmptyState title="Could not load team details" description="Try again to read this record." action={<button className="button button-secondary" onClick={() => void loadDetail(selectedId)}>Retry</button>}/> : detail ? <><div className="team-detail-hero"><div className="team-symbol"><UsersRound size={26}/></div><span>{detail.id}</span><h2>{detail.name}</h2><p>Team membership from the shared API.</p></div><div className="team-detail-summary"><div><span>Leader</span><strong>{detail.leaderVolunteerId ? getVolunteer(detail.leaderVolunteerId)?.name ?? 'Unknown volunteer' : 'Unassigned'}</strong></div><div><span>Members</span><strong>{detail.memberIds.length}</strong></div></div><div className="detail-section"><div className="section-heading"><h3>Team members</h3></div>{detail.memberIds.length ? detail.memberIds.map(id => {
      const member = getVolunteer(id)
      return <div className="member-row" key={id}><Avatar name={member?.name ?? 'Volunteer'}/><div><strong>{member?.name ?? 'Unknown volunteer'}{id === detail.leaderVolunteerId && <Crown size={14}/>}</strong>{member && <StatusBadge status={member.status}/>}</div></div>
    }) : <p className="quiet-text">No members in this team.</p>}</div><div className="detail-section"><div className="leadership-note"><ShieldCheck size={20}/><span>Team changes are not connected in this read-only view.</span></div></div></> : null}</div></Drawer>}
  </>
}
