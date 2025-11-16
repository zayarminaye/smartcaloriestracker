'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Settings as SettingsIcon, Save, Info } from 'lucide-react';

export default function AdminSettingsPage() {
  const { t, language } = useTranslation();
  const [settings, setSettings] = useState({
    requireIngredientVerification: true,
    allowUserContributions: true,
    defaultLanguage: 'mm',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Implement save settings API
    setTimeout(() => {
      setSaving(false);
      alert(language === 'mm' ? 'ဆက်တင်များ သိမ်းဆည်းပြီးပါပြီ' : 'Settings saved successfully');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold text-gray-900 mb-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
          {t.admin.systemSettings}
        </h2>
        <p className={`text-gray-600 ${language === 'mm' ? 'font-myanmar' : ''}`}>
          {language === 'mm'
            ? 'စနစ် ဆက်တင်များကို စီမံခန့်ခွဲပါ'
            : 'Manage system settings and configurations'}
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className={language === 'mm' ? 'font-myanmar' : ''}>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              {language === 'mm' ? 'အရေးကြီးသော မှတ်ချက်' : 'Important Note'}
            </h3>
            <p className="text-blue-800">
              {language === 'mm'
                ? 'ဆက်တင်များကို database ရှိ system_settings ဇယားတွင် သိမ်းဆည်းထားပါသည်။ ပြောင်းလဲမှုများသည် ချက်ချင်း အကျိုးသက်ရောက်မည်ဖြစ်ပါသည်။'
                : 'Settings are stored in the system_settings table in the database. Changes take effect immediately.'}
            </p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${language === 'mm' ? 'font-myanmar' : ''}`}>
            {language === 'mm' ? 'ပါဝင်ပစ္စည်း စီမံခန့်ခွဲမှု' : 'Ingredient Management'}
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className={`font-medium text-gray-900 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {language === 'mm'
                    ? 'ပါဝင်ပစ္စည်း အတည်ပြုမှု လိုအပ်ခြင်း'
                    : 'Require Ingredient Verification'}
                </h4>
                <p className={`text-sm text-gray-600 mt-1 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {language === 'mm'
                    ? 'အတည်ပြုပြီး ပါဝင်ပစ္စည်းများကိုသာ အသုံးပြုသူများအား ပြသမည်'
                    : 'Only show verified ingredients to regular users'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireIngredientVerification}
                  onChange={(e) =>
                    setSettings({ ...settings, requireIngredientVerification: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className={`font-medium text-gray-900 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {language === 'mm'
                    ? 'အသုံးပြုသူ ပါဝင်ပစ္စည်း ထည့်သွင်းခွင့်'
                    : 'Allow User Contributions'}
                </h4>
                <p className={`text-sm text-gray-600 mt-1 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {language === 'mm'
                    ? 'အသုံးပြုသူများသည် ပါဝင်ပစ္စည်း အသစ်များ ထည့်သွင်းနိုင်မည်'
                    : 'Allow users to submit new ingredients'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowUserContributions}
                  onChange={(e) =>
                    setSettings({ ...settings, allowUserContributions: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div>
          <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${language === 'mm' ? 'font-myanmar' : ''}`}>
            {language === 'mm' ? 'ဘာသာစကား ဆက်တင်များ' : 'Language Settings'}
          </h3>

          <div className="p-4 border border-gray-200 rounded-lg">
            <label className={`block font-medium text-gray-900 mb-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
              {language === 'mm' ? 'မူလ ဘာသာစကား' : 'Default Language'}
            </label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${language === 'mm' ? 'font-myanmar' : ''}`}
            >
              <option value="mm" className="font-myanmar">မြန်မာ (Myanmar)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${language === 'mm' ? 'font-myanmar' : ''}`}
          >
            <Save className="w-5 h-5" />
            {saving ? t.common.loading : t.common.save}
          </button>
        </div>
      </div>
    </div>
  );
}
