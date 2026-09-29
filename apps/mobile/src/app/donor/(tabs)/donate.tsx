import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Field, Header, Icon, Screen, T } from '../../../components/common/UI';
import { C } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
export default function DonateFood() {
  const app = useApp();
  const [source, setSource] = useState(app.donor.organization); const [sourceType, setSourceType] = useState('Wedding');
  const [address, setAddress] = useState(app.donor.address); const [date, setDate] = useState('2026-09-30');
  const [time, setTime] = useState('10:30 PM'); const [foodType, setFoodType] = useState('Vegetarian meals');
  const [meals, setMeals] = useState('120'); const [readyTime, setReadyTime] = useState('10:00 PM');
  const [contactName, setContactName] = useState(app.donor.name); const [phone, setPhone] = useState(app.donor.phone);
  const [notes, setNotes] = useState(''); const [safe, setSafe] = useState(false); const [photo, setPhoto] = useState(false); const [submitting, setSubmitting] = useState(false);
  const submit = () => {
    if (![source, address, date, time, foodType, meals, readyTime, contactName, phone].every(value => value.trim()) || Number(meals) <= 0) { app.notify('Please complete all required fields.'); return; }
    if (!/^\d{10}$/.test(phone.trim())) { app.notify('Please enter a valid phone number.'); return; }
    if (!safe) { app.notify('Please confirm food safety.'); return; }
    setSubmitting(true);
    setTimeout(() => { const id = app.submitRequest({ source: source.trim(), sourceType, address: address.trim(), date: date.trim(), time: time.trim(), foodType: foodType.trim(), meals: meals.trim(), readyTime: readyTime.trim(), contactName: contactName.trim(), phone: phone.trim(), notes: notes.trim(), event: source.trim() });
      setSubmitting(false); router.push({ pathname: '/donor/success', params: { id } }); }, 650);
  };
  return <Screen><Header title="New food pickup" subtitle="Tell us about the food and when it is ready." />
    <T size={20} weight="700" color={C.ink} style={{ marginBottom: 12 }}>Food source</T>
    <Card style={{ marginBottom: 18 }}><Field label="Source / event name" value={source} onChangeText={setSource} required /><T weight="600" color={C.ink} style={{ marginBottom: 9 }}>Source type</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{['Wedding', 'Event', 'Restaurant', 'Other'].map(value => <Pressable key={value} accessibilityRole="button" onPress={() => setSourceType(value)} style={{ borderRadius: 99, borderWidth: 1, borderColor: sourceType === value ? C.green : C.line, backgroundColor: sourceType === value ? C.greenSoft : C.white, paddingHorizontal: 13, paddingVertical: 9 }}><T size={14} weight="600" color={sourceType === value ? C.green : C.muted}>{value}</T></Pressable>)}</View></Card>
    <T size={20} weight="700" color={C.ink} style={{ marginBottom: 12 }}>Pickup details</T>
    <Card style={{ marginBottom: 18 }}><Field label="Pickup address" value={address} onChangeText={setAddress} required multiline /><Field label="Pickup date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" required /><Field label="Preferred pickup time" value={time} onChangeText={setTime} required /></Card>
    <T size={20} weight="700" color={C.ink} style={{ marginBottom: 12 }}>Food details</T>
    <Card style={{ marginBottom: 18 }}><Field label="Food type" value={foodType} onChangeText={setFoodType} required /><Field label="Estimated meals" value={meals} onChangeText={setMeals} keyboardType="number-pad" required /><Field label="Food ready by" value={readyTime} onChangeText={setReadyTime} required />
      <Pressable accessibilityRole="button" onPress={() => setPhoto(value => !value)} style={{ minHeight: 62, borderWidth: 1, borderStyle: 'dashed', borderColor: C.line, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}><Icon name={photo ? 'check' : 'camera'} size={20} /><T weight="600" color={C.green}>{photo ? 'Photo added' : 'Add a photo'}</T></Pressable><T size={13} color={C.muted} style={{ marginTop: 7 }}>Tap to attach a sample photo</T></Card>
    <T size={20} weight="700" color={C.ink} style={{ marginBottom: 12 }}>Contact details</T>
    <Card style={{ marginBottom: 18 }}><Field label="Contact person" value={contactName} onChangeText={setContactName} required /><Field label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" required /><Field label="Additional notes" value={notes} onChangeText={setNotes} multiline /></Card>
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: safe }} onPress={() => setSafe(value => !value)} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 11, marginBottom: 18, paddingHorizontal: 2 }}><View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: safe ? C.green : C.muted, backgroundColor: safe ? C.green : C.white, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>{safe && <Icon name="check" size={17} color={C.white} />}</View><T style={{ flex: 1 }}>I confirm this food is safe, fresh and properly stored.</T></Pressable>
    <Button title="Submit pickup request" onPress={submit} loading={submitting} disabled={submitting} />
  </Screen>;
}
