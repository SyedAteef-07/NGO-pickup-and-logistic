import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Field, Header, Icon, InfoRow, LanguageSwitcher, Screen, Sheet, T } from './UI';
import { C } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
export function ProfileScreen({ role }: { role: 'volunteer' | 'donor' }) {
  const app = useApp(); const [editing, setEditing] = useState(false);
  const [name, setName] = useState(role === 'volunteer' ? app.volunteer.name : app.donor.name);
  const [email, setEmail] = useState(role === 'volunteer' ? app.volunteer.email : app.donor.email);
  const [phone, setPhone] = useState(role === 'volunteer' ? app.volunteer.phone : app.donor.phone);
  const [extra, setExtra] = useState(role === 'volunteer' ? app.volunteer.emergencyName : app.donor.organization);
  const [extra2, setExtra2] = useState(role === 'volunteer' ? app.volunteer.emergencyPhone : app.donor.address);
  const profile = role === 'volunteer' ? app.volunteer : app.donor;
  const save = () => { if (!name.trim() || !email.trim() || !phone.trim()) { app.notify('Please complete all required fields.'); return; }
    if (role === 'volunteer') app.saveVolunteer({ ...app.volunteer, name, email, phone, emergencyName: extra, emergencyPhone: extra2 });
    else app.saveDonor({ ...app.donor, name, email, phone, organization: extra, address: extra2 });
    setEditing(false); };
  return <Screen><Header title="Profile" right={<LanguageSwitcher />} />
    <Card style={{ alignItems: 'center', marginBottom: 18, paddingVertical: 23 }}><View style={{ width: 66, height: 66, borderRadius: 22, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}><Icon name="person" size={33} /></View>
      <T size={22} weight="800" color={C.ink} translate={false}>{profile.name}</T><T color={C.muted}>{role === 'volunteer' ? 'Food Rescue Volunteer' : 'Food Donor'}</T><T size={13} color={C.muted} style={{ marginTop: 4 }}>Member since 2026</T></Card>
    <T size={20} weight="700" color={C.ink} style={{ marginBottom: 11 }}>Personal information</T>
    <Card style={{ marginBottom: 18 }}><InfoRow icon="person" label="Name" value={profile.name} /><InfoRow icon="phone" label="Phone number" value={profile.phone} /><InfoRow icon="person" label="Email" value={profile.email} />
      {role === 'volunteer' ? <InfoRow icon="shield" label="Registration number" value={app.volunteer.registration} /> : <><InfoRow icon="team" label="Organization" value={app.donor.organization} /><InfoRow icon="pin" label="Address" value={app.donor.address} /></>}
      <Button title="Edit profile" icon="edit" variant="outline" onPress={() => setEditing(true)} style={{ marginTop: 10 }} /></Card>
    {role === 'volunteer' && <><T size={20} weight="700" color={C.ink} style={{ marginBottom: 11 }}>Emergency contact</T><Card style={{ marginBottom: 18 }}><InfoRow icon="person" label="Name" value={app.volunteer.emergencyName} /><InfoRow icon="phone" label="Phone number" value={app.volunteer.emergencyPhone} /></Card></>}
    <T size={20} weight="700" color={C.ink} style={{ marginBottom: 11 }}>Settings</T><Card style={{ marginBottom: 20 }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><T weight="600">Language</T><LanguageSwitcher /></View></Card>
    <Button title="Log out" icon="logout" variant="outline" onPress={() => { app.logout(); router.replace('/'); }} />
    <Sheet visible={editing} onClose={() => setEditing(false)} title="Edit profile">
      <Field label="Name" value={name} onChangeText={setName} required /><Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" required />
      <Field label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" required />
      <Field label={role === 'volunteer' ? 'Emergency contact' : 'Organization'} value={extra} onChangeText={setExtra} />
      <Field label={role === 'volunteer' ? 'Phone number' : 'Address'} value={extra2} onChangeText={setExtra2} />
      <Button title="Save changes" onPress={save} /><Button title="Cancel" variant="quiet" onPress={() => setEditing(false)} style={{ marginTop: 6 }} />
    </Sheet>
  </Screen>;
}
