import React from 'react';
import { View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Icon, Screen, T } from '../../components/common/UI';
import { C } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
export default function RequestSuccess() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { role } = useApp();
  if (role !== 'donor') return <Redirect href="/" />;
  return <Screen style={{ justifyContent: 'center' }}><Card style={{ alignItems: 'center', padding: 25 }}>
    <View style={{ width: 74, height: 74, borderRadius: 23, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 17 }}><Icon name="check" size={39} /></View>
    <T size={26} weight="800" color={C.ink} style={{ textAlign: 'center' }}>Request submitted!</T>
    <T color={C.muted} style={{ textAlign: 'center', marginTop: 8 }}>We’ll connect you with a pickup team.</T>
    <View style={{ borderRadius: 12, backgroundColor: C.bg, paddingHorizontal: 22, paddingVertical: 14, alignItems: 'center', marginVertical: 22, width: '100%' }}><T size={13} color={C.muted}>Request ID</T><T size={22} weight="800" color={C.green} translate={false}>{id}</T></View>
    <Button title="View my requests" onPress={() => router.replace('/donor/(tabs)/requests')} style={{ width: '100%', marginBottom: 7 }} />
    <Button title="Back to home" variant="quiet" onPress={() => router.replace('/donor/(tabs)/home')} style={{ width: '100%' }} />
  </Card></Screen>;
}
