import { useCallback, useState } from 'react'
import { Layout } from './components/layout/Layout'
import { Toast } from './components/common/UI'
import CreateAssignmentDialog from './components/assignments/CreateAssignmentDialog'
import { initialAssignments, initialTeams, initialVolunteers } from './data/mockData'
import Dashboard from './pages/Dashboard'
import Volunteers from './pages/Volunteers'
import Teams from './pages/Teams'
import Assignments from './pages/Assignments'
import Settings from './pages/Settings'
import { useRenderedLanguage, type Language } from './lib/i18n'
import type { Assignment, Page, Volunteer, VolunteerTeam } from './types'

export default function App() {
  const [language, setLanguage] = useState<Language>(() => window.localStorage.getItem('aaharaconnect-language') === 'kn' ? 'kn' : 'en')
  useRenderedLanguage(language)
  const [page, setPage] = useState<Page>('dashboard')
  const [volunteers, setVolunteers] = useState<Volunteer[]>(initialVolunteers)
  const [teams, setTeams] = useState<VolunteerTeam[]>(initialTeams)
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments)
  const [assignmentOpen, setAssignmentOpen] = useState(false)
  const [initialVolunteerId, setInitialVolunteerId] = useState<string | undefined>()
  const [toast, setToast] = useState<{ message: string; kind: 'success' | 'error' } | null>(null)
  const [showSuccessNotifications, setShowSuccessNotifications] = useState(true)
  const notify = useCallback((message: string, kind: 'success' | 'error' = 'success') => { if (kind === 'error' || showSuccessNotifications) setToast({ message, kind }) }, [showSuccessNotifications])
  const openAssignment = (volunteerId?: string) => { if (volunteerId) { const volunteer = volunteers.find(v => v.volunteerId === volunteerId); if (volunteer?.status !== 'AVAILABLE') { notify('Cannot assign this volunteer. They are not currently available.', 'error'); return } } setInitialVolunteerId(volunteerId); setAssignmentOpen(true) }
  const assignTeam = (volunteerId: string, teamId: string) => {
    setVolunteers(current => current.map(v => v.volunteerId === volunteerId ? { ...v, teamId:teamId || undefined } : v))
    setTeams(current => current.map(team => { const memberIds = team.memberIds.filter(id => id !== volunteerId); if (team.teamId === teamId) memberIds.push(volunteerId); return { ...team, memberIds, leaderId:team.leaderId === volunteerId && team.teamId !== teamId ? memberIds[0] ?? '' : team.leaderId } }))
  }
  const createAssignment = (assignment: Assignment) => { setAssignments(current => [assignment, ...current]); setAssignmentOpen(false); setPage('assignments'); notify('Assignment Created Successfully · Pending') }
  const changeLanguage = (next: Language) => { setLanguage(next); window.localStorage.setItem('aaharaconnect-language', next) }
  return <Layout page={page} onPage={setPage} language={language} onLanguageChange={changeLanguage}>
    {page === 'dashboard' && <Dashboard volunteers={volunteers} teams={teams} assignments={assignments} onCreateAssignment={() => openAssignment()} onViewAssignments={() => setPage('assignments')} onViewVolunteers={() => setPage('volunteers')}/>}
    {page === 'volunteers' && <Volunteers volunteers={volunteers} teams={teams} assignments={assignments} setVolunteers={setVolunteers} onAssignTeam={assignTeam} onCreateAssignment={openAssignment} notify={notify}/>}
    {page === 'teams' && <Teams volunteers={volunteers} teams={teams} setTeams={setTeams} onAssignTeam={assignTeam} notify={notify}/>}
    {page === 'assignments' && <Assignments assignments={assignments} setAssignments={setAssignments} volunteers={volunteers} teams={teams} onCreateAssignment={() => openAssignment()} notify={notify}/>}
    {page === 'settings' && <Settings notifications={showSuccessNotifications} onNotificationsChange={setShowSuccessNotifications}/>}
    {assignmentOpen && <CreateAssignmentDialog volunteers={volunteers} teams={teams} assignments={assignments} initialVolunteerId={initialVolunteerId} onClose={() => setAssignmentOpen(false)} onCreate={createAssignment} notify={notify}/>}
    {toast && <Toast message={toast.message} kind={toast.kind} onClose={() => setToast(null)}/>}
  </Layout>
}
