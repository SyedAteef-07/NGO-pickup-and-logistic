import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Card, Icon, T, dateLabel } from '../common/UI';
import { C } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';
import { DonorRequest } from '../../types';
export function RequestCard({ item }: { item: DonorRequest }) {
  const { language, t } = useLanguage();
  return <Card onPress={() => router.push({ pathname: '/donor/request/[id]', params: { id: item.id } })} style={{ marginBottom: 12 }}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}><View style={{ flex: 1 }}><T size={18} weight="700" color={C.ink} translate={false}>{item.event}</T><T size={13} color={C.muted} translate={false}>{item.id}</T></View><Badge value={item.status} /></View>
    <View style={{ height: 1, backgroundColor: C.line, marginVertical: 14 }} />
    <View style={{ flexDirection: 'row', gap: 9, alignItems: 'center', marginBottom: 8 }}><Icon name="calendar" size={17} color={C.muted} /><T translate={false}>{dateLabel(item.date, language)} · {item.time}</T></View>
    <View style={{ flexDirection: 'row', gap: 9, alignItems: 'center', marginBottom: 12 }}><Icon name="food" size={17} color={C.muted} /><T translate={false}>{t(item.foodType)} · {item.meals} {t('Estimated meals')}</T></View>
    <T weight="700" color={C.blue}>{t('Track request')}  ›</T>
  </Card>;
}
