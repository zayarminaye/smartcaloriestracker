'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from '@/hooks/use-translation';
import {
  Shield,
  ShieldOff,
  Search,
  Mail,
  Award,
  Flame,
  TrendingUp,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  is_admin: boolean;
  email_verified: boolean;
  preferred_language: string;
  points: number;
  level: number;
  streak_days: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { t, language } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentIsAdmin: boolean) => {
    if (userId === currentUser?.id) {
      alert(language === 'mm'
        ? 'သင့်ကိုယ်ပိုင် အက်ဒမင် အခြေအနေကို ပြောင်းလဲ၍မရပါ'
        : 'You cannot modify your own admin status');
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/admin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_admin: !currentIsAdmin }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update admin status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold text-gray-900 mb-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
          {t.admin.userManagement}
        </h2>
        <p className={`text-gray-600 ${language === 'mm' ? 'font-myanmar' : ''}`}>
          {language === 'mm'
            ? 'အသုံးပြုသူများကို စီမံခန့်ခွဲပြီး အက်ဒမင် ခွင့်ပြုချက်များ သတ်မှတ်ပါ'
            : 'Manage users and assign admin permissions'}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={language === 'mm' ? 'အမည် သို့မဟုတ် အီးမေးလ် ဖြင့် ရှာဖွေပါ...' : 'Search by name or email...'}
          className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${language === 'mm' ? 'font-myanmar' : ''}`}
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {language === 'mm' ? 'အသုံးပြုသူ' : 'User'}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {language === 'mm' ? 'ဘာသာစကား' : 'Language'}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {language === 'mm' ? 'စာရင်းအင်း' : 'Stats'}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {language === 'mm' ? 'အခန်းကဏ္ဍ' : 'Role'}
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {language === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {t.common.loading}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`px-6 py-8 text-center text-gray-500 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                    {language === 'mm' ? 'အသုံးပြုသူ မတွေ့ပါ' : 'No users found'}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-semibold">
                          {(user.display_name || user.full_name || user.email)?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className={`text-sm font-medium text-gray-900 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                            {user.display_name || user.full_name || 'No name'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail className="w-3.5 h-3.5" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                      {user.preferred_language === 'mm' ? 'မြန်မာ' : 'English'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-purple-600">
                          <Award className="w-4 h-4" />
                          <span>L{user.level}</span>
                        </div>
                        <div className="flex items-center gap-1 text-orange-600">
                          <Flame className="w-4 h-4" />
                          <span>{user.streak_days}d</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600">
                          <TrendingUp className="w-4 h-4" />
                          <span>{user.points}pts</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_admin ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                          <Shield className="w-3.5 h-3.5" />
                          Admin
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                          {language === 'mm' ? 'အသုံးပြုသူ' : 'User'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                        disabled={user.id === currentUser?.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${language === 'mm' ? 'font-myanmar' : ''} ${
                          user.id === currentUser?.id
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : user.is_admin
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        {user.is_admin ? (
                          <>
                            <ShieldOff className="w-4 h-4" />
                            {t.admin.removeAdmin}
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            {t.admin.makeAdmin}
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
