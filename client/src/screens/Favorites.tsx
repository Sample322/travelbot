import React, { useEffect, useState } from 'react';
import { api } from '../api';

interface FavoritesProps {
  /** Navigate back to the previous screen */
  onBack: () => void;
  /** Navigate to route screen for a given city */
  onToRoute: (city: any) => void;
}

/**
 * Display the user's saved favourite points of interest. Allows
 * selecting a favourite city to start a new route from. Favourites
 * are grouped by city so the user can quickly build a route around
 * previously starred places. Favourites can be added from the
 * server via other screens (e.g. future enhancements).
 */
export default function Favorites({ onBack, onToRoute }: FavoritesProps) {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res: any = await api.get('favorites').json();
        setList(res);
      } catch (err) {
        console.error(err);
        setList([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Group favourites by city for a cleaner display.
  const grouped = list.reduce((acc: Record<string, any[]>, fav: any) => {
    acc[fav.city] = acc[fav.city] || [];
    acc[fav.city].push(fav);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="p-4 space-y-4">
      <button onClick={onBack} className="text-blue-600">← Назад</button>
      <h2 className="text-xl font-bold">Избранные места</h2>
      {loading && <div>Загрузка...</div>}
      {!loading && Object.keys(grouped).length === 0 && <div className="text-sm opacity-70">Нет избранных мест. Добавьте их при планировании поездки.</div>}
      {!loading && Object.keys(grouped).length > 0 && (
        <div className="space-y-4">
          {Object.entries(grouped).map(([city, items]) => (
            <div key={city} className="border p-3 rounded">
              <div className="font-semibold mb-1">{city}</div>
              <ul className="space-y-1 text-sm">
                {items.map((f: any) => (
                  <li key={f.id} className="flex justify-between items-center">
                    <span>{f.name}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => onToRoute({ name: city, country: items[0].country || '', lat: items[0].lat, lng: items[0].lng })} className="mt-2 bg-blue-600 text-white px-3 py-2 rounded">
                Построить маршрут
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}