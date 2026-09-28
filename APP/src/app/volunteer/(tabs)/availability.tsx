import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Badge, Button, Card, Field, Header, Icon, Screen, Sheet, T, dateLabel } from '../../../components/common/UI';
import { C } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { useLanguage } from '../../../context/LanguageContext';
import { AvailabilitySlot } from '../../../types';
export default function Availability() {
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
