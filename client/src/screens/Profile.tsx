import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useTranslation } from 'react-i18next';

interface ProfileProps {
  onNext: () => void;
}

/**
 * Screen allowing the user to select their travel preferences. The
 * selected values are sent to the backend and persisted in the
 * database. Once saved, the user proceeds to search for a city.
 */
export default function Profile({ onNext }: ProfileProps) {
  const { t } = useTranslation();
  // Options for food, activities, budgets, and travel styles. Expand
  // these arrays to support more categories.
  const foodOptions = ['Европейская', 'Азиатская', 'Русская', 'Вегетарианская', 'Морепродукты'];
  const activityOptions = ['Музеи', 'Природа', 'Ночная жизнь', 'Шоппинг', 'Архитектура'];
  const budgetOptions = ['до 1000₽', '1000–3000₽', '3000–5000₽', '5000+₽'];
  const styleOptions = ['Спокойный', 'Активный'];

  const [selectedFood, setSelectedFood] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [dailyBudget, setDailyBudget] = useState('');
  const [travelStyle, setTravelStyle] = useState('');

  const toggle = (item: string, list: string[], setList: (l: string[]) => void) => {
    setList(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);
  };

  async function saveProfile() {
    try {
      await api.post('profile', { json: {
        food: selectedFood,
        activities: selectedActivities,
        dailyBudget,
        travelStyle
      }});
      onNext();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">{t('profile')}</h2>
      <div>
        <h3 className="font-semibold mb-1">Выберите любимые кухни:</h3>
        <div className="flex flex-wrap gap-2">
          {foodOptions.map((opt) => (
            <button
              key={opt}
              className={`px-3 py-1 rounded-full border ${selectedFood.includes(opt) ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => toggle(opt, selectedFood, setSelectedFood)}
            >{opt}</button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-1">Выберите интересы:</h3>
        <div className="flex flex-wrap gap-2">
          {activityOptions.map((opt) => (
            <button
              key={opt}
              className={`px-3 py-1 rounded-full border ${selectedActivities.includes(opt) ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => toggle(opt, selectedActivities, setSelectedActivities)}
            >{opt}</button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-1">Бюджет на день:</h3>
        <select
          className="border p-2 w-full"
          value={dailyBudget}
          onChange={(e) => setDailyBudget(e.target.value)}
        >
          <option value="" disabled>Выберите</option>
          {budgetOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <div>
        <h3 className="font-semibold mb-1">Стиль путешествия:</h3>
        <select
          className="border p-2 w-full"
          value={travelStyle}
          onChange={(e) => setTravelStyle(e.target.value)}
        >
          <option value="" disabled>Выберите</option>
          {styleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <button
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!dailyBudget || !travelStyle}
        onClick={saveProfile}
      >
        Сохранить
      </button>
    </div>
  );
}