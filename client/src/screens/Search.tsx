import React, { useState } from 'react';
import { api } from '../api';

interface SearchProps {
  /**
   * Callback fired when a city is selected from the search results.
   * Receives the city object (with lat/lng and onLocation flag).
   */
  onSelect: (city: any) => void;
  /**
   * Callback to enter planning mode manually.
   */
  onPlan: () => void;
}

/**
 * The search screen allows the user to search for a city by name or
 * select from popular destinations. After a city is chosen, the app
 * determines whether the user is already in the city using
 * geolocation and informs the parent component via `onSelect`.
 */
export default function Search({ onSelect, onPlan }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
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

  async function selectCity(city: any) {
    // Ask for user's coordinates. If permission is denied or an error
    // occurs we assume the user is not on location and proceed.
    const determineLocation = async () => {
      return new Promise<{ lat: number; lng: number } | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    };
    const userCoords = await determineLocation();
    if (!userCoords) {
      onSelect({ ...city, onLocation: false });
      return;
    }
    try {
      const r: any = await api.post('geo/check-location', { json: { city: { lat: city.lat, lng: city.lng }, user: userCoords } }).json();
      onSelect({ ...city, onLocation: r.onLocation, distanceKm: r.distanceKm });
    } catch {
      onSelect({ ...city, onLocation: false });
    }
  }

  const popular = [
    { name: 'Москва', country: 'Россия', lat: 55.7558, lng: 37.6176 },
    { name: 'Санкт-Петербург', country: 'Россия', lat: 59.9311, lng: 30.3609 },
    { name: 'Париж', country: 'Франция', lat: 48.8566, lng: 2.3522 },
    { name: 'Лондон', country: 'Великобритания', lat: 51.5074, lng: -0.1278 }
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Введите название города..."
          className="border p-2 flex-1"
        />
        <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={!query || loading}>
          {loading ? 'Поиск...' : 'Найти'}
        </button>
        <button onClick={onPlan} className="bg-gray-400 text-white px-4 py-2 rounded">
          Планирование
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
      {!query && (
        <div>
          <h3 className="font-semibold mb-2">Популярные направления</h3>
          <ul className="border rounded divide-y">
            {popular.map((c) => (
              <li key={c.name} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => selectCity(c)}>
                {c.name} — {c.country}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}