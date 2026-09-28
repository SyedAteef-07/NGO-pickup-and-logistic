import { Platform } from 'react-native';
export const C = {
  bg: '#F8F7F2', white: '#FFFFFF', ink: '#18342C', text: '#263A33', muted: '#63756D',
  line: '#E4E9E3', green: '#08643B', greenSoft: '#E4F3E9', blue: '#086FB4', blueSoft: '#E7F3FB',
  orange: '#BE6B0B', orangeSoft: '#FFF1DA', red: '#B5403C', redSoft: '#FDEBE9',
};
export const shadow = Platform.select({
  ios: { shadowColor: '#1D3828', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 3 } },
  android: { elevation: 2 },
  default: { boxShadow: '0 3px 12px rgba(29,56,40,0.06)' },
});
export const font = Platform.select({ web: 'Noto Sans Kannada, Nirmala UI, Arial, sans-serif', default: undefined });
