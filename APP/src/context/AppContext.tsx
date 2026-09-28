import React, { createContext, useContext, useState } from 'react';
import { Text, View } from 'react-native';
import { C, font, shadow } from '../constants/theme';
import { donorProfile, initialAssignments, initialAvailability, initialRequests, volunteerProfile } from '../data/mockData';
import { AssignmentStatus, AvailabilitySlot, DonorProfile, DonorRequest, Role, VolunteerAssignment, VolunteerProfile } from '../types';
import { useLanguage } from './LanguageContext';

type AppValue = {
  role: Role; login: (role: Exclude<Role, null>) => void; logout: () => void;
  assignments: VolunteerAssignment[]; updateAssignment: (id: string, status: AssignmentStatus, reason?: string) => void;
  slots: AvailabilitySlot[]; saveSlot: (slot: AvailabilitySlot) => void; deleteSlot: (id: string) => void;
  volunteer: VolunteerProfile; saveVolunteer: (profile: VolunteerProfile) => void;
  donor: DonorProfile; saveDonor: (profile: DonorProfile) => void;
  requests: DonorRequest[]; submitRequest: (request: Omit<DonorRequest, 'id' | 'status' | 'createdAt'>) => string;
  cancelRequest: (id: string) => boolean; notify: (message: string) => void;
};
const Context = createContext<AppValue | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [role, setRole] = useState<Role>(null);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [slots, setSlots] = useState(initialAvailability);
  const [volunteer, setVolunteer] = useState(volunteerProfile);
  const [donor, setDonor] = useState(donorProfile);
  const [requests, setRequests] = useState(initialRequests);
  const [toast, setToast] = useState('');
  const notify = (message: string) => { setToast(message); setTimeout(() => setToast(''), 3000); };
  const updateAssignment = (id: string, status: AssignmentStatus, reason?: string) => {
    setAssignments(prev => prev.map(item => item.id === id ? { ...item, status, rejectionReason: reason } : item));
    const feedback: Record<AssignmentStatus, string> = { Pending: 'Pending', Accepted: 'Assignment accepted', 'In Progress': 'Pickup started', 'Checked In': 'Check-in complete', Completed: 'Assignment completed', Rejected: 'Assignment declined' };
    notify(feedback[status]);
  };
  const saveSlot = (slot: AvailabilitySlot) => { setSlots(prev => [slot, ...prev.filter(item => item.id !== slot.id)]); notify('Slot saved'); };
  const deleteSlot = (id: string) => { setSlots(prev => prev.filter(item => item.id !== id)); notify('Slot deleted'); };
  const saveVolunteer = (profile: VolunteerProfile) => { setVolunteer(profile); notify('Profile updated'); };
  const saveDonor = (profile: DonorProfile) => { setDonor(profile); notify('Profile updated'); };
  const submitRequest = (request: Omit<DonorRequest, 'id' | 'status' | 'createdAt'>) => {
    const next = Math.max(7, ...requests.map(item => Number(item.id.slice(4)) || 0)) + 1;
    const id = `REQ-${String(next).padStart(3, '0')}`;
    setRequests(prev => [{ ...request, id, status: 'Submitted', createdAt: new Date().toISOString().slice(0, 10) }, ...prev]);
    return id;
  };
  const cancelRequest = (id: string) => {
    const item = requests.find(request => request.id === id);
    if (!item || !['Submitted', 'Assigned'].includes(item.status)) { notify('Pickup has already begun.'); return false; }
    setRequests(prev => prev.map(request => request.id === id ? { ...request, status: 'Cancelled' } : request));
    notify('Request cancelled'); return true;
  };
  const value = { role, login: setRole, logout: () => setRole(null), assignments, updateAssignment,
    slots, saveSlot, deleteSlot, volunteer, saveVolunteer, donor, saveDonor, requests, submitRequest, cancelRequest, notify };
  return <Context.Provider value={value}>
    {children}
    {!!toast && <View pointerEvents="none" style={{ position: 'absolute', bottom: 88, alignSelf: 'center', backgroundColor: C.ink, paddingHorizontal: 18, paddingVertical: 13, borderRadius: 14, maxWidth: '90%', ...shadow }}>
      <Text style={{ color: C.white, fontSize: 15, fontFamily: font, fontWeight: '600', textAlign: 'center' }}>{t(toast)}</Text>
    </View>}
  </Context.Provider>;
}
export function useApp() { const value = useContext(Context); if (!value) throw new Error('AppProvider missing'); return value; }
