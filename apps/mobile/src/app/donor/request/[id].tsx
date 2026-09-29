import React, { useState } from 'react';
import { View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Badge, Button, Card, Header, Icon, InfoRow, Screen, Sheet, T, dateLabel } from '../../../components/common/UI';
import { C } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { useLanguage } from '../../../context/LanguageContext';
export default function RequestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(); const app = useApp(); const { language, t } = useLanguage(); const [confirm, setConfirm] = useState(false);
  if (app.role !== 'donor') return <Redirect href="/" />;
  const item = app.requests.find(request => request.id === id);
  if (!item) return <Screen><Header title="Not found" back /></Screen>;
  const stages = ['Submitted', 'Assigned', 'Pickup In Progress', 'Completed'];
  const progress = stages.indexOf(item.status);
  const canCancel = ['Submitted', 'Assigned'].includes(item.status);
  return <Screen><Header title="Request details" back />
    <Card style={{ marginBottom: 17 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}><View style={{ flex: 1 }}><T size={22} weight="800" color={C.ink} translate={false}>{item.event}</T><T size={13} color={C.muted} translate={false}>{item.id}</T></View><Badge value={item.status} /></View>
      <View style={{ height: 1, backgroundColor: C.line, marginVertical: 15 }} /><InfoRow icon="calendar" label="Pickup time" value={`${dateLabel(item.date, language)} · ${item.time}`} /><InfoRow icon="pin" label="Pickup address" value={item.address} /><InfoRow icon="food" label="Food type" value={`${t(item.foodType)} · ${item.meals} ${t('meals')}`} /></Card>
    <T size={20} weight="700" color={C.ink} style={{ marginBottom: 11 }}>Pickup progress</T>
    <Card style={{ marginBottom: 17 }}>{stages.map((stage, index) => <View key={stage} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 13, minHeight: index === stages.length - 1 ? 38 : 60 }}><View style={{ alignItems: 'center', width: 25 }}><View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: progress >= index ? C.green : C.line, alignItems: 'center', justifyContent: 'center' }}>{progress >= index && <Icon name="check" size={17} color={C.white} />}</View>{index < stages.length - 1 && <View style={{ width: 2, height: 35, backgroundColor: progress > index ? C.green : C.line }} />}</View><T weight={progress >= index ? '700' : '500'} color={progress >= index ? C.ink : C.muted}>{stage}</T></View>)}
      {item.status === 'Cancelled' && <Badge value="Cancelled" />}</Card>
    <T size={20} weight="700" color={C.ink} style={{ marginBottom: 11 }}>Food details</T>
    <Card style={{ marginBottom: 18 }}><InfoRow icon="food" label="Food source" value={`${item.source} · ${t(item.sourceType)}`} /><InfoRow icon="clock" label="Food ready by" value={item.readyTime} /><InfoRow icon="person" label="Contact person" value={`${item.contactName} · ${item.phone}`} />{!!item.notes && <InfoRow icon="assignment" label="Notes" value={item.notes} />}</Card>
    {canCancel && <Button title="Cancel request" variant="outline" onPress={() => setConfirm(true)} />}
    <Sheet visible={confirm} onClose={() => setConfirm(false)} title="Cancel this request?">
      <T color={C.muted} style={{ marginBottom: 20 }}>This request can be cancelled before pickup begins.</T>
      <Button title="Confirm cancellation" variant="danger" onPress={() => { if (app.cancelRequest(item.id)) { setConfirm(false); router.replace('/donor/(tabs)/requests'); } }} />
      <Button title="Keep request" variant="quiet" onPress={() => setConfirm(false)} style={{ marginTop: 6 }} />
    </Sheet>
  </Screen>;
}
