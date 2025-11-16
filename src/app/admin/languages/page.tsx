'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Languages, Info } from 'lucide-react';

export default function AdminLanguagesPage() {
  const { t, language } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold text-gray-900 mb-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
          {t.admin.languageEditor}
        </h2>
        <p className={`text-gray-600 ${language === 'mm' ? 'font-myanmar' : ''}`}>
          {language === 'mm'
            ? 'အက်ပ်ရှိ ဘာသာပြန်ချက်များကို တည်းဖြတ်ပါ'
            : 'Edit translations for the app'}
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className={language === 'mm' ? 'font-myanmar' : ''}>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              {language === 'mm' ? 'ဘာသာစကား စီမံခန့်ခွဲမှု' : 'Language Management'}
            </h3>
            <p className="text-blue-800 mb-4">
              {language === 'mm'
                ? 'ဘာသာပြန်ချက်များကို /src/lib/translations.ts ဖိုင်တွင် တည်းဖြတ်နိုင်ပါသည်။ အက်ပ်သည် မြန်မာနှင့် အင်္ဂလိပ် ဘာသာစကားများကို ပံ့ပိုးပေးပါသည်။'
                : 'Translations are managed in /src/lib/translations.ts file. The app currently supports Myanmar (mm) and English (en) languages.'}
            </p>
            <div className="space-y-2 text-sm text-blue-700">
              <div className={`flex items-center gap-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                <Languages className="w-4 h-4" />
                <span>
                  {language === 'mm' ? 'လက်ရှိ ဘာသာစကားများ:' : 'Current languages:'} မြန်မာ (mm), English (en)
                </span>
              </div>
              <div className={`flex items-center gap-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                <span className="font-medium">
                  {language === 'mm' ? 'စုစုပေါင်း ဘာသာပြန်ချက် အုပ်စုများ:' : 'Total translation groups:'}
                </span>
                <span>7 (common, auth, dashboard, meals, ingredients, admin)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Translations Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${language === 'mm' ? 'font-myanmar' : ''}`}>
          {language === 'mm' ? 'ဘာသာပြန်ချက် အုပ်စုများ' : 'Translation Groups'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'common', count: 14 },
            { key: 'auth', count: 17 },
            { key: 'dashboard', count: 13 },
            { key: 'meals', count: 11 },
            { key: 'ingredients', count: 13 },
            { key: 'admin', count: 14 },
          ].map((group) => (
            <div key={group.key} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{group.key}</span>
                <span className="text-sm text-gray-500">
                  {group.count} {language === 'mm' ? 'ဘာသာပြန်ချက်' : 'translations'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className={`bg-gray-50 rounded-xl p-6 ${language === 'mm' ? 'font-myanmar' : ''}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {language === 'mm' ? 'ဘာသာပြန်ချက် ထည့်သွင်းရန်' : 'How to Add Translations'}
        </h3>
        <ol className="space-y-2 text-gray-700 list-decimal list-inside">
          <li>{language === 'mm'
            ? '/src/lib/translations.ts ဖိုင်ကို ဖွင့်ပါ'
            : 'Open /src/lib/translations.ts file'}</li>
          <li>{language === 'mm'
            ? 'သင့်လျော်သော အုပ်စုတွင် ဘာသာပြန်ချက် အသစ် ထည့်ပါ'
            : 'Add new translation keys in the appropriate group'}</li>
          <li>{language === 'mm'
            ? 'မြန်မာနှင့် အင်္ဂလိပ် နှစ်မျိုးလုံးအတွက် တန်ဖိုးများ ထည့်ပါ'
            : 'Provide values for both Myanmar (mm) and English (en)'}</li>
          <li>{language === 'mm'
            ? 'အက်ပ်ကို ပြန်လည် စတင်ပါ'
            : 'Restart the app to see changes'}</li>
        </ol>
      </div>
    </div>
  );
}
