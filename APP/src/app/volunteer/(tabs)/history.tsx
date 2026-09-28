import React from 'react';
import { AssignmentCard } from '../../../components/volunteer/AssignmentCard';
import { Empty, Header, Screen } from '../../../components/common/UI';
import { useApp } from '../../../context/AppContext';
export default function History() {
  const { assignments } = useApp(); const items = assignments.filter(item => item.status === 'Completed');
  return <Screen><Header title="History" subtitle="Your impact so far." />
    {items.length ? items.map(item => <AssignmentCard key={item.id} item={item} />) : <Empty title="No completed assignments yet" detail="Completed assignments will appear here." icon="history" />}
  </Screen>;
}
