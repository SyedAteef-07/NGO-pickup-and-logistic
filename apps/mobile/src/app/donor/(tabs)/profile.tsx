import React from 'react';
import { ProfileScreen } from '../../../components/common/ProfileScreen';
import LiveDonorProfile from '../../../components/donor/LiveDonorProfile';
import { useApp } from '../../../context/AppContext';
export default function DonorProfile() { return useApp().mode === 'live' ? <LiveDonorProfile /> : <ProfileScreen role="donor" />; }
