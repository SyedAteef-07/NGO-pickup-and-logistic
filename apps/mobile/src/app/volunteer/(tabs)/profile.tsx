import React from 'react';
import { ProfileScreen } from '../../../components/common/ProfileScreen';
import { LiveProfileScreen } from '../../../components/volunteer/LiveProfileScreen';
import { useApp } from '../../../context/AppContext';
export default function VolunteerProfile() { return useApp().mode === 'live' ? <LiveProfileScreen /> : <ProfileScreen role="volunteer" />; }
