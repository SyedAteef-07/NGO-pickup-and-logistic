import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { RequestCard } from '../../../components/donor/RequestCard';
import { Button, Card, Header, Icon, LanguageSwitcher, Screen, T } from '../../../components/common/UI';
import { C } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
export default function DonorHome() {
  const { donor, requests } = useApp(); const active = requests.find(item => !['Completed', 'Cancelled'].includes(item.status));
  const completed = requests.filter(item => item.status === 'Completed');
  return <Screen><Header title="Good evening," subtitle={donor.name} right={<LanguageSwitcher />} />
    <Card style={{ backgroundColor: C.greenSoft, borderColor: '#CDE7D5', marginBottom: 20, padding: 21 }}><View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', marginBottom: 13 }}><Icon name="heart" size={27} /></View>
      <T size={23} weight="800" color={C.ink}>Your food can make someone’s day.</T><T color={C.muted} style={{ marginTop: 6, marginBottom: 17 }}>Schedule a safe pickup for your surplus food.</T>
      <Button title="Report surplus food" icon="add" onPress={() => router.push('/donor/(tabs)/donate')} /></Card>
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 21 }}><Card style={{ flex: 1, padding: 15 }}><T size={28} weight="800" color={C.green} translate={false}>{completed.reduce((sum, item) => sum + Number(item.meals), 0)}</T><T size={13} color={C.muted}>Meals shared</T></Card><Card style={{ flex: 1, padding: 15 }}><T size={28} weight="800" color={C.green} translate={false}>{completed.length}</T><T size={13} color={C.muted}>Pickups completed</T></Card></View>
    <T size={21} weight="700" color={C.ink} style={{ marginBottom: 12 }}>Your active request</T>
    {active ? <RequestCard item={active} /> : <Card><T color={C.muted}>No requests here</T></Card>}
  </Screen>;
}
