import React, { useState } from 'react';
import { RequestCard } from '../../../components/donor/RequestCard';
import { Empty, Header, Screen, Segments } from '../../../components/common/UI';
import { useApp } from '../../../context/AppContext';
import { LiveDonorRequests } from '../../../components/donor/LiveRequests';
export default function Requests() {
  const { requests, mode } = useApp(); const [tab, setTab] = useState('Active');
  if (mode === 'live') return <LiveDonorRequests />;
  const items = requests.filter(item => tab === 'Active' ? !['Completed', 'Cancelled'].includes(item.status) : ['Completed', 'Cancelled'].includes(item.status));
  return <Screen><Header title="Your pickup requests" subtitle="Follow each request from start to finish." /><Segments values={['Active', 'Completed']} selected={tab} onSelect={setTab} />
    {items.length ? items.map(item => <RequestCard key={item.id} item={item} />) : <Empty title="No requests here" detail="Your requests will appear here." icon="food" />}
  </Screen>;
}
