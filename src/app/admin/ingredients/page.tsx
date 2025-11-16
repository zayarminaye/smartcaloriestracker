'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import {
  ShieldCheck,
  Shield,
  Search,
  Filter,
  Check,
  X,
  Sparkles,
  Database,
} from 'lucide-react';

interface Ingredient {
  id: string;
  name_english: string;
  name_myanmar: string;
  category: string;
  calories_per_100g: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  verified: boolean;
  data_source: string;
  usage_count: number;
}

export default function AdminIngredientsPage() {
  const { t, language } = useTranslation();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchIngredients();
  }, [filter, search]);

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('filter', filter);
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/ingredients?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setIngredients(data.ingredients || []);
      }
    } catch (error) {
      console.error('Failed to fetch ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (ingredientId: string, currentVerified: boolean) => {
    try {
      const response = await fetch(`/api/admin/ingredients/${ingredientId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentVerified }),
      });

      if (response.ok) {
        fetchIngredients();
      }
    } catch (error) {
      console.error('Failed to update verification:', error);
    }
  };

  const filterOptions = [
    { value: 'all', label: language === 'mm' ? 'အားလုံး' : 'All' },
    { value: 'verified', label: language === 'mm' ? 'အတည်ပြုပြီး' : 'Verified' },
    { value: 'pending', label: language === 'mm' ? 'စောင့်ဆိုင်းနေသော' : 'Pending' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold text-gray-900 mb-2 ${language === 'mm' ? 'font-myanmar' : ''}`}>
          {t.admin.ingredientManagement}
        </h2>
        <p className={`text-gray-600 ${language === 'mm' ? 'font-myanmar' : ''}`}>
          {language === 'mm'
            ? 'ပါဝင်ပစ္စည်းများကို စီမံခန့်ခွဲပြီး အတည်ပြုပါ'
            : 'Manage and verify ingredients'}
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'mm' ? 'ရှာဖွေရန်...' : 'Search...'}
            className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${language === 'mm' ? 'font-myanmar' : ''}`}
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 p-1">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as any)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${language === 'mm' ? 'font-myanmar' : ''} ${
                filter === option.value
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ingredients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {language === 'mm' ? 'အမည်' : 'Name'}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {language === 'mm' ? 'အမျိုးအစား' : 'Category'}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {language === 'mm' ? 'အာဟာရ' : 'Nutrition'}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {language === 'mm' ? 'အရင်းအမြစ်' : 'Source'}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {language === 'mm' ? 'အသုံးပြုမှု' : 'Usage'}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {t.ingredients.verificationStatus}
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'mm' ? 'font-myanmar' : ''}`}>
                  {language === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {t.common.loading}
                  </td>
                </tr>
              ) : ingredients.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`px-6 py-8 text-center text-gray-500 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                    {language === 'mm' ? 'ပါဝင်ပစ္စည်း မတွေ့ပါ' : 'No ingredients found'}
                  </td>
                </tr>
              ) : (
                ingredients.map((ingredient) => (
                  <tr key={ingredient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium text-gray-900 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                          {language === 'mm' ? ingredient.name_myanmar : ingredient.name_english}
                        </div>
                        <div className={`text-sm text-gray-500 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                          {language === 'mm' ? ingredient.name_english : ingredient.name_myanmar}
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                      {ingredient.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div>{ingredient.calories_per_100g} kcal</div>
                        <div className="text-xs text-gray-500">
                          P:{ingredient.protein_g}g F:{ingredient.fat_g}g C:{ingredient.carbs_g}g
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {ingredient.data_source === 'database' ? (
                          <Database className="w-4 h-4 text-green-600" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-orange-600" />
                        )}
                        <span className="text-sm text-gray-600">
                          {ingredient.data_source}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ingredient.usage_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ingredient.verified ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {t.ingredients.verified}
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 ${language === 'mm' ? 'font-myanmar' : ''}`}>
                          <Shield className="w-3.5 h-3.5" />
                          {t.ingredients.unverified}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleVerification(ingredient.id, ingredient.verified)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${language === 'mm' ? 'font-myanmar' : ''} ${
                          ingredient.verified
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        {ingredient.verified ? (
                          <>
                            <X className="w-4 h-4" />
                            {t.admin.unverifyIngredient}
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            {t.admin.verifyIngredient}
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
