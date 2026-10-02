import React, { useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { Button, Card, Field, Header, Icon, LanguageSwitcher, Screen, T } from './UI';
import { C } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { isLiveAuthConfigured, signInWithEmail, signOut } from '../../api/auth';
export function LoginScreen({ role }: { role: Exclude<Role, null> }) {
  const app = useApp(); const [identifier, setIdentifier] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = (demo = false) => {
    const emailOrPhone = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) || /^\d{10}$/.test(identifier);
    if (!demo && !emailOrPhone) { app.notify('Enter a valid email or 10-digit phone number.'); return; }
    if (!demo && password.length < 4) { app.notify('Password must have at least 4 characters.'); return; }
    app.login(role);
  };
  const submitLive = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) { app.notify('Use your email address to sign in.'); return; }
    if (password.length < 4) { app.notify('Password must have at least 4 characters.'); return; }
    setBusy(true);
    try {
      const user = await signInWithEmail(identifier.trim(), password);
      if (user.role !== role.toUpperCase()) {
        await signOut();
        app.notify('This account does not have access to that role.');
        return;
      }
      app.loginAuthenticated(role);
    } catch {
      app.notify('Sign in failed. Check your account and try again.');
    } finally { setBusy(false); }
  };
  if (app.role === role) return <Redirect href={role === 'volunteer' ? '/volunteer/(tabs)/home' : '/donor/(tabs)/home'} />;
  return <Screen style={{ justifyContent: 'center' }}><View style={{ alignItems: 'flex-end', marginBottom: 24 }}><LanguageSwitcher /></View>
    <Header title={role === 'volunteer' ? 'Volunteer sign in' : 'Donor sign in'} subtitle="Welcome back" back />
    <Card style={{ padding: 22 }}><View style={{ width: 54, height: 54, borderRadius: 15, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><Icon name={role === 'volunteer' ? 'team' : 'food'} size={28} /></View>
      <Field label="Email or phone number" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" keyboardType="email-address" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Sign in" onPress={() => submit()} disabled={busy} style={{ marginTop: 6 }} />
      {isLiveAuthConfigured() && <Button title="Sign in to shared API" onPress={() => { void submitLive(); }} loading={busy} disabled={busy} variant="outline" style={{ marginTop: 8 }} />}
      <Button title="Use demo account" onPress={() => submit(true)} disabled={busy} variant="quiet" style={{ marginTop: 8 }} />
    </Card><T size={13} color={C.muted} style={{ textAlign: 'center', marginTop: 22 }}>Together, less food waste.</T>
  </Screen>;
}
