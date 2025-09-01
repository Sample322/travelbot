import React, { useState } from 'react';
import { api } from '../api';

interface PlanProps {
  /** Called when the user navigates back to the previous screen */
  onBack: () => void;
  /** Called when the user wants to generate a route from this city */
  onToRoute: (city: any) => void;
}

/**
 * Planning screen. Allows the user to search for a destination city,
 * select start and end dates for a future trip, fetch travel
 * recommendations (weather summary, clothing list, best visiting
 * times and general tips) and proceed to route generation. This
 * screen does not save favourites by itself; favourites are managed
 * via the separate favourites screen and route generation.
 */
export default function Plan({ onBack, onToRoute }: PlanProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [dates, setDates] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [reco, setReco] = useState<any>(null);

  const tg = (window as any).Telegram?.WebApp;
  const language = (tg?.initDataUnsafe?.user?.language_code || 'ru').startsWith('en') ? 'en' : 'ru';

  async function searchCity() {
    if (!query) return;
    setLoading(true);
    try {
      const res: any = await api.get('geo/search', { searchParams: { q: query } }).json();
      setResults(res);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReco() {
    if (!selectedCity || !dates.from || !dates.to) return;
    setLoading(true);
    try {
      const payload = {
        city: selectedCity.name,
        coords: { lat: selectedCity.lat, lng: selectedCity.lng },
        dates,
        prefs: {},
        language
      };
      const r: any = await api.post('plan/recommendations', { json: payload }).json();
      setReco(r);
    } catch (err) {
      console.error(err);
      setReco(null);
    } finally {
      setLoading(false);
    }
  }

  function selectCity(city: any) {
    setSelectedCity(city);
    setReco(null);
    setResults([]);
  }

  return (
    <div className="p-4 space-y-4">
      <button onClick={onBack} className="text-blue-600">← Назад</button>
      <h2 className="text-xl font-bold">Планирование поездки</h2>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Введите город..."
          className="border p-2 flex-1"
        />
        <button onClick={searchCity} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={!query || loading}>
          {loading ? 'Поиск...' : 'Найти'}
        </button>
      </div>
      {results.length > 0 && (
        <ul className="border rounded divide-y">
          {results.map((c) => (
            <li key={`${c.name}-${c.lat}`} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => selectCity(c)}>
              {c.name} — {c.country}
            </li>
          ))}
        </ul>
      )}
      {selectedCity && (
        <div className="border p-3 rounded space-y-3">
          <div className="font-semibold">{selectedCity.name} — {selectedCity.country}</div>
          <div className="flex gap-2">
            <label className="block">
              <span className="text-sm">Дата начала</span>
              <input type="date" value={dates.from} onChange={(e) => setDates((d) => ({ ...d, from: e.target.value }))} className="border p-2" />
            </label>
            <label className="block">
              <span className="text-sm">Дата конца</span>
              <input type="date" value={dates.to} onChange={(e) => setDates((d) => ({ ...d, to: e.target.value }))} className="border p-2" />
            </label>
            <button onClick={fetchReco} className="bg-green-600 text-white px-3 py-2 rounded" disabled={!dates.from || !dates.to || loading}>
              {loading ? 'Загрузка...' : 'Рекомендации'}
            </button>
          </div>
          {reco && (
            <div className="space-y-1 text-sm mt-2">
              {reco.weather?.summary && <div><b>Погода:</b> {reco.weather.summary}</div>}
              {reco.clothing?.length > 0 && <div><b>Одежда:</b> {reco.clothing.join(', ')}</div>}
              {reco.bestTimes?.length > 0 && <div><b>Лучшее время:</b> {reco.bestTimes.join('; ')}</div>}
              {reco.tips?.length > 0 && <div><b>Советы:</b> {reco.tips.join('; ')}</div>}
              <button onClick={() => onToRoute(selectedCity)} className="mt-2 bg-blue-600 text-white px-3 py-2 rounded">
                Построить маршрут
              </button>
            </div>
          )}
        </div>
      )}
      {!selectedCity && results.length === 0 && !query && (
        <div className="text-sm opacity-70">Введите название города, чтобы получить рекомендации.</div>
      )}
    </div>
  );
}