import React, { createContext, useContext, useMemo, useState } from 'react';
import { kn } from '../constants/translations';
import { Language } from '../types';
type LanguageValue = { language: Language; setLanguage: (value: Language) => void; t: (value: string) => string };
const Context = createContext<LanguageValue | null>(null);
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const value = useMemo(() => ({ language, setLanguage, t: (value: string) => language === 'kn' ? kn[value] ?? value : value }), [language]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useLanguage() { const value = useContext(Context); if (!value) throw new Error('LanguageProvider missing'); return value; }
