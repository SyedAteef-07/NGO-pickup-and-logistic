import React from 'react';
import { TabLayout } from '../../../components/common/TabLayout';
import { VolunteerDataProvider } from '../../../context/VolunteerDataContext';
export default function Layout() { return <VolunteerDataProvider><TabLayout role="volunteer" /></VolunteerDataProvider>; }
