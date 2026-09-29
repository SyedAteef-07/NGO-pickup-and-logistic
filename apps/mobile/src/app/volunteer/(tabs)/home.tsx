import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { AssignmentCard } from '../../../components/volunteer/AssignmentCard';
import { Badge, Button, Card, Header, Icon, LanguageSwitcher, Screen, T } from '../../../components/common/UI';
import { C } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { useLanguage } from '../../../context/LanguageContext';
export default function VolunteerHome() {
  const { volunteer, assignments, slots } = useApp();
  const { t } = useLanguage();
  const next = assignments.find(item => !['Completed', 'Rejected'].includes(item.status));
  return <Screen><Header title={`Good evening,`} subtitle={volunteer.name} right={<LanguageSwitcher />} />
    <Card style={{ backgroundColor: C.greenSoft, borderColor: '#CDE7D5', marginBottom: 20 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={24} /></View><View style={{ flex: 1 }}><T size={17} weight="700" color={C.ink}>Available for pickups</T><T color={C.muted}>Ready to make a difference today?</T></View><Badge value="Available" /></View></Card>
    <T size={21} weight="700" color={C.ink} style={{ marginBottom: 12 }}>Next assignment</T>
    {next ? <AssignmentCard item={next} /> : <Card><T color={C.muted}>No completed assignments yet</T></Card>}
    <View style={{ flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 22 }}>
      {[['14', 'Completed pickups'], ['37h', 'Volunteer hours'], [String(assignments.filter(item => !['Completed', 'Rejected'].includes(item.status)).length), 'Upcoming']].map(([value, label]) => <Card key={label} style={{ flex: 1, padding: 13, minHeight: 103 }}><T size={26} weight="800" color={C.green} translate={false}>{value}</T><T size={13} color={C.muted}>{label}</T></Card>)}
    </View>
    <T size={21} weight="700" color={C.ink} style={{ marginBottom: 12 }}>Your availability</T>
    <Card><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Icon name="calendar" size={24} /><View style={{ flex: 1 }}><T weight="700" color={C.ink}>This week</T><T color={C.muted} translate={false}>{slots.length} {t('slots')}</T></View></View><Button title="Manage availability" onPress={() => router.push('/volunteer/(tabs)/availability')} variant="outline" style={{ marginTop: 15 }} /></Card>
  </Screen>;
}
