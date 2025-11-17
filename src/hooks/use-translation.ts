'use client';

import { useState, useEffect } from 'react';
import { Language, Translations, getTranslation } from '@/lib/translations';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';

export function useTranslation() {
  const { profile, refreshProfile } = useAuth();
  const [language, setLanguage] = useState<Language>('mm');
  const [t, setT] = useState<Translations>(getTranslation('mm'));
  const supabase = createClient();

  useEffect(() => {
    const lang = (profile?.preferred_language || 'mm') as Language;
    setLanguage(lang);
    setT(getTranslation(lang));
  }, [profile?.preferred_language]);

  const toggleLanguage = async () => {
    const newLang: Language = language === 'mm' ? 'en' : 'mm';

    // Update local state immediately for responsive UI
    setLanguage(newLang);
    setT(getTranslation(newLang));

    // Save to database if user is logged in
    if (profile?.id) {
      try {
        const { error } = await (supabase
          .from('users') as any)
          .update({ preferred_language: newLang })
          .eq('id', profile.id);

        if (error) {
          console.error('Error updating language:', error);
        } else {
          // Refresh profile to sync state
          await refreshProfile();
        }
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }
  };

  return {
    language,
    t,
    setLanguage,
    toggleLanguage,
  };
}
