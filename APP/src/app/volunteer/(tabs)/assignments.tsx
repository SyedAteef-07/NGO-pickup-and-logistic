import React, { useState } from 'react';
import { AssignmentCard } from '../../../components/volunteer/AssignmentCard';
import { Empty, Header, Screen, Segments } from '../../../components/common/UI';
import { useApp } from '../../../context/AppContext';
export default function Assignments() {
  const { assignments } = useApp(); const [tab, setTab] = useState('Active');
  const items = assignments.filter(item => tab === 'Active' ? !['Completed', 'Rejected'].includes(item.status) : ['Completed', 'Rejected'].includes(item.status));
  return <Screen><Header title="Your assignments" subtitle="Stay on top of your pickups." /><Segments values={['Active', 'Past']} selected={tab} onSelect={setTab} />
    {items.length ? items.map(item => <AssignmentCard key={item.id} item={item} />) : <Empty title="No completed assignments yet" detail="Completed assignments will appear here." />}
  </Screen>;
}
