'use client';

import { useState, useEffect } from 'react';
import { Language, Translations, getTranslation } from '@/lib/translations';
import { useAuth } from '@/contexts/auth-context';

export function useTranslation() {
  const { profile } = useAuth();
  const [language, setLanguage] = useState<Language>('mm');
  const [t, setT] = useState<Translations>(getTranslation('mm'));

  useEffect(() => {
    const lang = (profile?.preferred_language || 'mm') as Language;
    setLanguage(lang);
    setT(getTranslation(lang));
  }, [profile?.preferred_language]);

  const toggleLanguage = () => {
    const newLang: Language = language === 'mm' ? 'en' : 'mm';
    setLanguage(newLang);
    setT(getTranslation(newLang));
  };

  return {
    language,
    t,
    setLanguage,
    toggleLanguage,
  };
}
