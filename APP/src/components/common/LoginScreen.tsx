import React, { useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { Button, Card, Field, Header, Icon, LanguageSwitcher, Screen, T } from './UI';
import { C } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
export function LoginScreen({ role }: { role: Exclude<Role, null> }) {
  const app = useApp(); const [identifier, setIdentifier] = useState(''); const [password, setPassword] = useState('');
  const submit = (demo = false) => {
    const emailOrPhone = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) || /^\d{10}$/.test(identifier);
    if (!demo && !emailOrPhone) { app.notify('Enter a valid email or 10-digit phone number.'); return; }
    if (!demo && password.length < 4) { app.notify('Password must have at least 4 characters.'); return; }
    app.login(role);
  };
  if (app.role === role) return <Redirect href={role === 'volunteer' ? '/volunteer/(tabs)/home' : '/donor/(tabs)/home'} />;
  return <Screen style={{ justifyContent: 'center' }}><View style={{ alignItems: 'flex-end', marginBottom: 24 }}><LanguageSwitcher /></View>
    <Header title={role === 'volunteer' ? 'Volunteer sign in' : 'Donor sign in'} subtitle="Welcome back" back />
    <Card style={{ padding: 22 }}><View style={{ width: 54, height: 54, borderRadius: 15, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><Icon name={role === 'volunteer' ? 'team' : 'food'} size={28} /></View>
      <Field label="Email or phone number" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" keyboardType="email-address" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Sign in" onPress={() => submit()} style={{ marginTop: 6 }} />
      <Button title="Use demo account" onPress={() => app.login(role)} variant="quiet" style={{ marginTop: 8 }} />
    </Card><T size={13} color={C.muted} style={{ textAlign: 'center', marginTop: 22 }}>Together, less food waste.</T>
  </Screen>;
}
