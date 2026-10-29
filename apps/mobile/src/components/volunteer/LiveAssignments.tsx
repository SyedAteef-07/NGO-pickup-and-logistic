import React, { useCallback, useEffect, useState } from 'react';
import type { Assignment, AssignmentTransition } from '@aaharaconnect/shared';
import { View } from 'react-native';
import { listOwnAssignments, transitionOwnAssignment } from '../../api/assignments';
import { ApiClientError } from '../../api/client';
import { Badge, Button, Card, Empty, Header, Screen, Segments, T } from '../common/UI';
import { C } from '../../constants/theme';

const terminal = new Set<Assignment['status']>(['DELIVERED', 'REJECTED', 'CANCELLED', 'FAILED']);
const volunteerActions: Partial<Record<Assignment['status'], { action: AssignmentTransition['action']; label: string }>> = {
  PENDING: { action: 'ACCEPT', label: 'Accept assignment' },
  ACCEPTED: { action: 'START', label: 'Start pickup' },
  EN_ROUTE: { action: 'ARRIVE', label: 'Check in at pickup' },
  ARRIVED_AT_DONOR: { action: 'COLLECT', label: 'Food collected' },
};

export default function LiveAssignments() {
  const [items, setItems] = useState<Assignment[]>([]);
  const [tab, setTab] = useState('Active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try { setItems(await listOwnAssignments()); }
    catch { setItems([]); setError('Could not load assignments. Check your connection and retry.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => { if (active) void refresh(); });
    return () => { active = false; };
  }, [refresh]);

  const changeStatus = async (item: Assignment, action: AssignmentTransition['action']) => {
    setBusyId(item.id); setActionError(null);
    try {
      const updated = await transitionOwnAssignment(item.id, { action, expectedVersion: item.version });
      setItems(current => current.map(row => row.id === updated.id ? updated : row));
      await refresh();
    } catch (cause) {
      setActionError(cause instanceof ApiClientError && cause.code === 'VERSION_CONFLICT'
        ? 'Assignment changed. Refresh and try again.'
        : 'Could not update assignment. Refresh and try again.');
    } finally { setBusyId(null); }
  };

  const visible = items.filter(item => tab === 'Active' ? !terminal.has(item.status) : terminal.has(item.status));
  return <Screen>
    <Header title="Your assignments" subtitle="Assignments from the shared API." />
    <Button title="Refresh assignments" variant="outline" onPress={() => void refresh()} style={{ marginBottom: 12 }} />
    <Segments values={['Active', 'Past']} selected={tab} onSelect={setTab} />
    {error && <Card style={{ marginBottom: 12 }}><T color={C.red}>{error}</T><Button title="Retry" variant="outline" onPress={() => void refresh()} /></Card>}
    {actionError && <Card style={{ marginBottom: 12 }}><T color={C.red}>{actionError}</T></Card>}
    {loading ? <T>Loading assignments…</T> : !error && visible.length === 0
      ? <Empty title="No assignments here" detail="Your assigned pickups will appear here." />
      : visible.map(item => {
        const next = volunteerActions[item.status];
        return <Card key={item.id} style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <T weight="700" color={C.ink}>Pickup assignment</T><Badge value={item.status.replaceAll('_', ' ')} />
          </View>
          <T color={C.muted} translate={false}>{item.id}</T>
          <T color={C.muted} translate={false}>Pickup: {item.pickupId}</T>
          {next && <Button title={next.label} disabled={busyId !== null} loading={busyId === item.id}
            onPress={() => void changeStatus(item, next.action)} style={{ marginTop: 12 }} />}
          {item.status === 'PENDING' && <Button title="Reject assignment" variant="outline" disabled={busyId !== null}
            onPress={() => void changeStatus(item, 'REJECT')} style={{ marginTop: 8 }} />}
        </Card>;
      })}
  </Screen>;
}
