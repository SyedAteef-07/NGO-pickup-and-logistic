import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Card, Icon, T, dateLabel } from '../common/UI';
import { C } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { VolunteerAssignment } from '../../types';
export function AssignmentCard({ item }: { item: VolunteerAssignment }) {
  const { language, t } = useLanguage();
  return <Card onPress={() => router.push({ pathname: '/volunteer/assignment/[id]', params: { id: item.id } })} style={{ marginBottom: 12 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}><View style={{ flex: 1 }}><T size={18} weight="700" color={C.ink} translate={false}>{item.event}</T><T size={13} color={C.muted} translate={false}>{item.id}</T></View><Badge value={item.status} /></View>
    <View style={{ height: 1, backgroundColor: C.line, marginVertical: 14 }} />
    <View style={{ flexDirection: 'row', gap: 9, alignItems: 'center', marginBottom: 8 }}><Icon name="calendar" size={17} color={C.muted} /><T translate={false}>{dateLabel(item.date, language)} · {item.time}</T></View>
    <View style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start', marginBottom: 12 }}><Icon name="pin" size={17} color={C.muted} /><T style={{ flex: 1 }} translate={false}>{item.address}</T></View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><T weight="600" color={C.green}>{item.role}</T><T weight="700" color={C.blue}>{t('View details')}  ›</T></View>
  </Card>;
}
