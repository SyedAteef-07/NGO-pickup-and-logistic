import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Availability, CreateAvailabilityRequest, Volunteer } from '@aaharaconnect/shared';
import { createOwnVolunteerAvailability, getOwnVolunteerProfile, listOwnVolunteerAvailability, replaceOwnVolunteerAvailability, updateOwnVolunteerProfile } from '../api/volunteers';
import { useApp } from './AppContext';

type VolunteerData = {
  profile: Volunteer | null;
  availability: Availability[];
  profileLoading: boolean;
  availabilityLoading: boolean;
  profileError: string | null;
  availabilityError: string | null;
  refreshProfile: () => Promise<void>;
  refreshAvailability: () => Promise<void>;
  updateProfile: (input: { name: string; phoneE164?: string }) => Promise<void>;
  saveAvailability: (input: CreateAvailabilityRequest, id?: string) => Promise<void>;
};

const Context = createContext<VolunteerData | null>(null);
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Request failed. Please try again.';

export function VolunteerDataProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useApp();
  const [profile, setProfile] = useState<Volunteer | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [profileLoading, setProfileLoading] = useState(mode === 'live');
  const [availabilityLoading, setAvailabilityLoading] = useState(mode === 'live');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (mode !== 'live') return;
    setProfileLoading(true); setProfileError(null);
    try { setProfile(await getOwnVolunteerProfile()); }
    catch (error) { setProfile(null); setProfileError(errorMessage(error)); }
    finally { setProfileLoading(false); }
  }, [mode]);
  const refreshAvailability = useCallback(async () => {
    if (mode !== 'live') return;
    setAvailabilityLoading(true); setAvailabilityError(null);
    try { setAvailability(await listOwnVolunteerAvailability()); }
    catch (error) { setAvailability([]); setAvailabilityError(errorMessage(error)); }
    finally { setAvailabilityLoading(false); }
  }, [mode]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      if (mode === 'live') { void refreshProfile(); void refreshAvailability(); }
      else { setProfile(null); setAvailability([]); setProfileLoading(false); setAvailabilityLoading(false); }
    });
    return () => { active = false; };
  }, [mode, refreshProfile, refreshAvailability]);

  const updateProfile = async (input: { name: string; phoneE164?: string }) => {
    setProfile(await updateOwnVolunteerProfile(input));
    setProfileError(null);
  };
  const saveAvailability = async (input: CreateAvailabilityRequest, id?: string) => {
    const saved = id ? await replaceOwnVolunteerAvailability(id, input) : await createOwnVolunteerAvailability(input);
    setAvailability(previous => [...previous.filter(item => item.id !== saved.id), saved].sort((a, b) => a.startsAt.localeCompare(b.startsAt)));
    setAvailabilityError(null);
  };
  return <Context.Provider value={{ profile, availability, profileLoading, availabilityLoading, profileError, availabilityError, refreshProfile, refreshAvailability, updateProfile, saveAvailability }}>{children}</Context.Provider>;
}

export function useVolunteerData() {
  const value = useContext(Context);
  if (!value) throw new Error('VolunteerDataProvider missing');
  return value;
}
