import React from 'react';
import { ColorValue, Modal, Pressable, ScrollView, StyleProp, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { C, font, shadow } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';

const symbols: Record<string, { ios: string; android: string; web: string }> = {
  home: { ios: 'house', android: 'home', web: 'home' }, assignment: { ios: 'list.clipboard', android: 'assignment', web: 'assignment' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }, history: { ios: 'clock.arrow.circlepath', android: 'history', web: 'history' },
  person: { ios: 'person.crop.circle', android: 'person', web: 'person' }, food: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' },
  add: { ios: 'plus', android: 'add', web: 'add' }, pin: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' }, team: { ios: 'person.2', android: 'groups', web: 'groups' },
  truck: { ios: 'truck.box', android: 'local_shipping', web: 'local_shipping' }, back: { ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' },
  arrow: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }, check: { ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' },
  edit: { ios: 'square.and.pencil', android: 'edit', web: 'edit' }, trash: { ios: 'trash', android: 'delete', web: 'delete' },
  language: { ios: 'globe', android: 'language', web: 'language' }, logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' },
  heart: { ios: 'heart', android: 'favorite', web: 'favorite' }, camera: { ios: 'camera', android: 'photo_camera', web: 'photo_camera' },
  phone: { ios: 'phone', android: 'call', web: 'call' }, shield: { ios: 'checkmark.shield', android: 'verified_user', web: 'verified_user' },
};
export function Icon({ name, size = 21, color = C.green }: { name: string; size?: number; color?: ColorValue }) {
  return <SymbolView name={symbols[name] as any ?? symbols.check as any} size={size} tintColor={color} fallback={<Text style={{ fontSize: size, color }}>•</Text>} />;
}
export function T({ children, size = 15, weight = '400', color = C.text, style, translate = true, numberOfLines }: {
  children: React.ReactNode; size?: number; weight?: TextStyle['fontWeight']; color?: string; style?: StyleProp<TextStyle>; translate?: boolean; numberOfLines?: number;
}) {
  const { t } = useLanguage();
  return <Text numberOfLines={numberOfLines} style={[{ fontSize: size, fontWeight: weight, color, fontFamily: font, lineHeight: size * 1.4 }, style]}>
    {translate && typeof children === 'string' ? t(children) : children}
  </Text>;
}
export function Screen({ children, scroll = true, style }: { children: React.ReactNode; scroll?: boolean; style?: StyleProp<ViewStyle> }) {
  return <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: C.bg }}>
    {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 34, flexGrow: 1 }, style]}>{children}</ScrollView>
      : <View style={[{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }, style]}>{children}</View>}
  </SafeAreaView>;
}
export function Header({ title, subtitle, back = false, right }: { title: string; subtitle?: string; back?: boolean; right?: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 22 }}>
    {back && <Pressable accessibilityRole="button" onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', marginRight: 2 }}><Icon name="back" size={20} /></Pressable>}
    <View style={{ flex: 1 }}><T size={26} weight="700" color={C.ink} style={{ lineHeight: 32 }}>{title}</T>{subtitle && <T color={C.muted} style={{ marginTop: 3 }}>{subtitle}</T>}</View>{right}
  </View>;
}
export function Card({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const cardStyle: StyleProp<ViewStyle> = [{ backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 18, padding: 18, ...shadow }, style];
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={cardStyle}>{children}</Pressable> : <View style={cardStyle}>{children}</View>;
}
export function Button({ title, onPress, variant = 'primary', icon, disabled = false, style, loading = false }: {
  title: string; onPress: () => void; variant?: 'primary' | 'green' | 'outline' | 'danger' | 'quiet'; icon?: string; disabled?: boolean; style?: StyleProp<ViewStyle>; loading?: boolean;
}) {
  const bg = variant === 'primary' ? C.blue : variant === 'green' ? C.green : variant === 'danger' ? C.red : variant === 'outline' ? C.white : 'transparent';
  const fg = ['primary', 'green', 'danger'].includes(variant) ? C.white : variant === 'quiet' ? C.blue : C.ink;
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled || loading} onPress={onPress}
    style={[{ minHeight: 52, borderRadius: 13, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
      backgroundColor: disabled ? C.line : bg, borderWidth: variant === 'outline' ? 1 : 0, borderColor: C.line, opacity: loading ? 0.65 : 1 }, style]}>
    {icon && <Icon name={icon} size={19} color={fg} />}<T weight="700" color={fg} style={{ textAlign: 'center' }}>{loading ? 'Loading...' : title}</T>
  </Pressable>;
}
export function Badge({ value }: { value: string }) {
  const color = ['Completed', 'Available', 'Checked In'].includes(value) ? C.green : ['Pending', 'Submitted'].includes(value) ? C.orange : ['Cancelled', 'Rejected', 'Unavailable'].includes(value) ? C.red : C.blue;
  const bg = color === C.green ? C.greenSoft : color === C.orange ? C.orangeSoft : color === C.red ? C.redSoft : C.blueSoft;
  return <View style={{ alignSelf: 'flex-start', backgroundColor: bg, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 99 }}><T size={13} weight="700" color={color}>{value}</T></View>;
}
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4, borderRadius: 10, backgroundColor: C.white, borderWidth: 1, borderColor: C.line }}>
    {(['en', 'kn'] as const).map(code => <Pressable key={code} accessibilityRole="button" onPress={() => setLanguage(code)} style={{ paddingHorizontal: 9, paddingVertical: 6, backgroundColor: language === code ? C.greenSoft : 'transparent', borderRadius: 7 }}>
      <T size={13} weight="700" color={language === code ? C.green : C.muted} translate={false}>{code === 'en' ? 'English' : 'ಕನ್ನಡ'}</T>
    </Pressable>)}
  </View>;
}
export function Field({ label, value, onChangeText, required, multiline, ...props }: TextInputProps & { label: string; value: string; onChangeText: (text: string) => void; required?: boolean }) {
  const { t } = useLanguage();
  return <View style={{ marginBottom: 16 }}><T weight="600" color={C.ink} style={{ marginBottom: 7 }} translate={false}>{t(label)}{required ? ' *' : ''}</T>
    <TextInput {...props} multiline={multiline} value={value} onChangeText={onChangeText} placeholder={props.placeholder ? t(props.placeholder) : t(label)} placeholderTextColor="#98A79E"
      style={{ minHeight: multiline ? 92 : 50, borderWidth: 1, borderColor: C.line, borderRadius: 12, backgroundColor: C.white, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: C.ink, fontFamily: font, textAlignVertical: multiline ? 'top' : 'center' }} />
  </View>;
}
export function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10 }}><View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={18} /></View>
    <View style={{ flex: 1 }}><T size={13} color={C.muted}>{label}</T><T weight="600" style={{ marginTop: 2 }} translate={false}>{value}</T></View></View>;
}
export function Segments({ values, selected, onSelect }: { values: string[]; selected: string; onSelect: (value: string) => void }) {
  return <View style={{ flexDirection: 'row', backgroundColor: '#EBF0EA', padding: 4, borderRadius: 13, marginBottom: 18 }}>
    {values.map(value => <Pressable key={value} accessibilityRole="button" onPress={() => onSelect(value)} style={{ flex: 1, minHeight: 41, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: selected === value ? C.white : 'transparent' }}><T weight={selected === value ? '700' : '500'} color={selected === value ? C.green : C.muted}>{value}</T></Pressable>)}
  </View>;
}
export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,34,26,0.42)' }}>
    <Pressable onPress={onClose} style={{ flex: 1 }} /><View style={{ backgroundColor: C.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 34, maxHeight: '86%' }}>
      <T size={21} weight="700" color={C.ink} style={{ marginBottom: 18 }}>{title}</T><ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
    </View></View></Modal>;
}
export function Empty({ title, detail, icon = 'assignment' }: { title: string; detail: string; icon?: string }) {
  return <Card style={{ alignItems: 'center', paddingVertical: 34 }}><View style={{ width: 54, height: 54, borderRadius: 16, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Icon name={icon} size={26} /></View>
    <T size={18} weight="700" color={C.ink} style={{ textAlign: 'center' }}>{title}</T><T color={C.muted} style={{ textAlign: 'center', marginTop: 5 }}>{detail}</T></Card>;
}
export function dateLabel(date: string, language: 'en' | 'kn' = 'en') {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString(language === 'kn' ? 'kn-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
