import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import type { Availability as ServerAvailability } from '@aaharaconnect/shared';
import { Badge, Button, Card, Field, Header, Icon, Screen, Segments, Sheet, T, dateLabel } from '../../../components/common/UI';
import { C } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useVolunteerData } from '../../../context/VolunteerDataContext';
import { AvailabilitySlot } from '../../../types';
export default function Availability() { return useApp().mode === 'live' ? <LiveAvailability /> : <DemoAvailability />; }

function DemoAvailability() {
  const { slots, saveSlot, deleteSlot, notify } = useApp(); const { language, t } = useLanguage();
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('all');
  const days = Array.from({ length: 7 }, (_, offset) => {
    const value = new Date(); value.setDate(value.getDate() + offset);
    return { key: `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`,
      label: value.toLocaleDateString(language === 'kn' ? 'kn-IN' : 'en-IN', { weekday: 'short', day: 'numeric' }) };
  });
  const visibleSlots = selectedDate === 'all' ? slots : slots.filter(slot => slot.date === selectedDate);
  const [date, setDate] = useState('2026-09-30'); const [start, setStart] = useState('6:00 PM'); const [end, setEnd] = useState('11:00 PM');
  const edit = (slot?: AvailabilitySlot) => { setEditing(slot?.id ?? null); setDate(slot?.date ?? (selectedDate === 'all' ? days[0].key : selectedDate)); setStart(slot?.start ?? '6:00 PM'); setEnd(slot?.end ?? '11:00 PM'); setOpen(true); };
  const save = () => { if (!date.trim() || !start.trim() || !end.trim()) { notify('Please enter a date and both times.'); return; }
    saveSlot({ id: editing ?? `SLOT-${Date.now()}`, date: date.trim(), start: start.trim(), end: end.trim() }); setOpen(false); };
  return <Screen><Header title="Availability" subtitle="Plan when you can help." />
    <Button title="Add time slot" icon="add" onPress={() => edit()} style={{ marginBottom: 22 }} />
    <T size={20} weight="700" color={C.ink} style={{ marginBottom: 12 }}>Your time slots</T>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 15 }} style={{ flexGrow: 0, marginHorizontal: -20, paddingHorizontal: 20 }}>
      {[{ key: 'all', label: t('All days') }, ...days].map(day => <Pressable key={day.key} accessibilityRole="button" onPress={() => setSelectedDate(day.key)} style={{ borderRadius: 11, minHeight: 42, paddingHorizontal: 14, justifyContent: 'center', backgroundColor: selectedDate === day.key ? C.green : C.white, borderWidth: 1, borderColor: selectedDate === day.key ? C.green : C.line }}><T size={14} weight="700" color={selectedDate === day.key ? C.white : C.muted} translate={false}>{day.label}</T></Pressable>)}
    </ScrollView>
    {visibleSlots.length ? visibleSlots.map(slot => <Card key={slot.id} style={{ marginBottom: 12 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}><View style={{ flex: 1 }}><T size={18} weight="700" color={C.ink} translate={false}>{dateLabel(slot.date, language)}</T><T color={C.muted} translate={false}>{slot.start} – {slot.end}</T></View><Badge value="Available" /></View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}><Button title="Edit time slot" icon="edit" variant="outline" onPress={() => edit(slot)} style={{ flex: 1 }} /><Pressable accessibilityRole="button" onPress={() => deleteSlot(slot.id)} style={{ width: 52, borderRadius: 12, backgroundColor: C.redSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="trash" color={C.red} /></Pressable></View>
    </Card>) : <Card><T size={18} weight="700" color={C.ink}>{selectedDate === 'all' ? 'No slots yet' : 'No slots on this day'}</T><T color={C.muted}>Add a slot so coordinators know when you can help.</T></Card>}
    <Sheet visible={open} onClose={() => setOpen(false)} title={editing ? 'Edit time slot' : 'Add time slot'}>
      <Field label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" /><Field label="Start time" value={start} onChangeText={setStart} /><Field label="End time" value={end} onChangeText={setEnd} />
      <Button title="Save slot" onPress={save} /><Button title="Cancel" variant="quiet" onPress={() => setOpen(false)} style={{ marginTop: 6 }} />
    </Sheet>
  </Screen>;
}

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function localTime(date: Date) {
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}
function parseLocalTime(date: string, value: string): Date | null {
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const time = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value.trim());
  if (!day || !time) return null;
  const year = Number(day[1]), month = Number(day[2]), dateNumber = Number(day[3]);
  const hour = Number(time[1]), minute = Number(time[2]);
  if (hour < 1 || hour > 12 || minute > 59) return null;
  const hour24 = hour % 12 + (time[3].toUpperCase() === 'PM' ? 12 : 0);
  const result = new Date(year, month - 1, dateNumber, hour24, minute);
  return result.getFullYear() === year && result.getMonth() === month - 1 && result.getDate() === dateNumber && result.getHours() === hour24 && result.getMinutes() === minute ? result : null;
}

function LiveAvailability() {
  const { availability, availabilityLoading, availabilityError, refreshAvailability, saveAvailability } = useVolunteerData();
  const { notify } = useApp();
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('all');
  const [date, setDate] = useState(localDate(new Date()));
  const [endDate, setEndDate] = useState(localDate(new Date()));
  const [start, setStart] = useState('6:00 PM');
  const [end, setEnd] = useState('11:00 PM');
  const [state, setState] = useState<'AVAILABLE' | 'UNAVAILABLE'>('AVAILABLE');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const days = Array.from({ length: 7 }, (_, offset) => {
    const value = new Date(); value.setDate(value.getDate() + offset);
    return { key: localDate(value), label: value.toLocaleDateString(language === 'kn' ? 'kn-IN' : 'en-IN', { weekday: 'short', day: 'numeric' }) };
  });
  const visible = selectedDate === 'all' ? availability : availability.filter(item => localDate(new Date(item.startsAt)) === selectedDate);
  const edit = (slot?: ServerAvailability) => {
    setEditing(slot?.id ?? null);
    const nextDate = slot ? localDate(new Date(slot.startsAt)) : selectedDate === 'all' ? days[0].key : selectedDate;
    setDate(nextDate);
    setEndDate(slot ? localDate(new Date(slot.endsAt)) : nextDate);
    setStart(slot ? localTime(new Date(slot.startsAt)) : '6:00 PM');
    setEnd(slot ? localTime(new Date(slot.endsAt)) : '11:00 PM');
    setState(slot?.state ?? 'AVAILABLE'); setFormError(null); setOpen(true);
  };
  const save = async () => {
    const startsAt = parseLocalTime(date, start), endsAt = parseLocalTime(endDate, end);
    if (!startsAt || !endsAt || startsAt >= endsAt) { setFormError('Enter a valid date and time range (start before end).'); return; }
    setSaving(true); setFormError(null);
    try {
      await saveAvailability({ startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(), state }, editing ?? undefined);
      setOpen(false); notify('Slot saved');
    } catch (error) { setFormError(error instanceof Error ? error.message : 'Could not save time slot.'); }
    finally { setSaving(false); }
  };
  return <Screen><Header title="Availability" subtitle="Plan when you can help." />
    <Button title="Add time slot" icon="add" onPress={() => edit()} style={{ marginBottom: 22 }} />
    <T size={20} weight="700" color={C.ink} style={{ marginBottom: 12 }}>Your time slots</T>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 15 }} style={{ flexGrow: 0, marginHorizontal: -20, paddingHorizontal: 20 }}>
      {[{ key: 'all', label: t('All days') }, ...days].map(day => <Pressable key={day.key} accessibilityRole="button" onPress={() => setSelectedDate(day.key)} style={{ borderRadius: 11, minHeight: 42, paddingHorizontal: 14, justifyContent: 'center', backgroundColor: selectedDate === day.key ? C.green : C.white, borderWidth: 1, borderColor: selectedDate === day.key ? C.green : C.line }}><T size={14} weight="700" color={selectedDate === day.key ? C.white : C.muted} translate={false}>{day.label}</T></Pressable>)}
    </ScrollView>
    {availabilityLoading ? <Card><T>Loading availability...</T></Card> : availabilityError ? <Card><T color={C.red}>{availabilityError}</T><Button title="Retry" onPress={() => void refreshAvailability()} variant="outline" style={{ marginTop: 14 }} /></Card> : visible.length ? visible.map(slot => {
      const begins = new Date(slot.startsAt), ends = new Date(slot.endsAt);
      return <Card key={slot.id} style={{ marginBottom: 12 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}><View style={{ flex: 1 }}><T size={18} weight="700" color={C.ink} translate={false}>{dateLabel(localDate(begins), language)}</T><T color={C.muted} translate={false}>{localTime(begins)} – {localDate(begins) === localDate(ends) ? '' : `${dateLabel(localDate(ends), language)} `}{localTime(ends)}</T></View><Badge value={slot.state === 'AVAILABLE' ? 'Available' : 'Unavailable'} /></View><Button title="Edit time slot" icon="edit" variant="outline" onPress={() => edit(slot)} style={{ marginTop: 16 }} /></Card>;
    }) : <Card><T size={18} weight="700" color={C.ink}>{selectedDate === 'all' ? 'No slots yet' : 'No slots on this day'}</T><T color={C.muted}>Add a slot so coordinators know when you can help.</T></Card>}
    <Sheet visible={open} onClose={() => setOpen(false)} title={editing ? 'Edit time slot' : 'Add time slot'}>
      <Field label="Date" value={date} onChangeText={value => { if (endDate === date) setEndDate(value); setDate(value); }} placeholder="YYYY-MM-DD" /><Field label="Start time" value={start} onChangeText={setStart} placeholder="6:00 PM" /><Field label="End date" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" /><Field label="End time" value={end} onChangeText={setEnd} placeholder="11:00 PM" />
      <Segments values={['Available', 'Unavailable']} selected={state === 'AVAILABLE' ? 'Available' : 'Unavailable'} onSelect={value => setState(value === 'Available' ? 'AVAILABLE' : 'UNAVAILABLE')} />
      {!!formError && <T color={C.red} style={{ marginBottom: 12 }}>{formError}</T>}
      <Button title="Save slot" onPress={() => void save()} loading={saving} /><Button title="Cancel" variant="quiet" onPress={() => setOpen(false)} style={{ marginTop: 6 }} />
    </Sheet>
  </Screen>;
}
