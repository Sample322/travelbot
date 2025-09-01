import React, { useState } from 'react';
import { api } from '../api';
import MapYandex from '../components/MapYandex';

interface RouteScreenProps {
  city: any;
  onBack: () => void;
  onFav: () => void;
}

/**
 * Screen for generating and displaying a route. Allows the user to
 * specify additional details (time available, hunger level, transport
 * mode, whether travelling with kids) before calling the backend to
 * generate the route. After generation the route is shown with a
 * polyline on the Yandex map and a list of places.
 */
export default function RouteScreen({ city, onBack, onFav }: RouteScreenProps) {
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<any>(null);
  const yaKey = import.meta.env.VITE_YANDEX_KEY;
  const tg = (window as any).Telegram?.WebApp;
  const language = (tg?.initDataUnsafe?.user?.language_code || 'ru').startsWith('en') ? 'en' : 'ru';

  // Form state
  const [timeAvailable, setTimeAvailable] = useState('4 hours');
  const [hunger, setHunger] = useState('normal');
  const [transport, setTransport] = useState('walk');
  const [withKids, setWithKids] = useState(false);

  async function generate() {
    if (!city) return;
    setLoading(true);
    setRoute(null);
    try {
      const payload = {
        city: city.name,
        country: city.country,
        time: timeAvailable,
        profile: {},
        hunger,
        transport,
        withKids,
        language
      };
      const r: any = await api.post('route', { json: payload }).json();
      setRoute(r.route);
      // Save to localStorage for offline access (keeping only last 5)
      const stored = JSON.parse(localStorage.getItem('routes') || '[]');
      stored.unshift({ city: city.name, date: new Date().toISOString(), route: r.route });
      if (stored.length > 5) stored.pop();
      localStorage.setItem('routes', JSON.stringify(stored));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const points = (route?.places || []).map((p: any) => p.coords).filter(Boolean);

  return (
    <div className="p-4 space-y-3">
      <button onClick={onBack} className="text-blue-600">← Назад</button>
      <h2 className="text-xl font-bold">Маршрут: {city?.name}</h2>
      <div className="space-y-2 border p-3 rounded">
        <div>
          <label className="block font-semibold mb-1">Длительность</label>
          <select value={timeAvailable} onChange={(e) => setTimeAvailable(e.target.value)} className="border p-2 w-full">
            <option value="2 hours">2 часа</option>
            <option value="4 hours">4 часа</option>
            <option value="6 hours">6 часов</option>
            <option value="1 day">1 день</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Уровень голода</label>
          <select value={hunger} onChange={(e) => setHunger(e.target.value)} className="border p-2 w-full">
            <option value="snack">Легкий перекус</option>
            <option value="normal">Нормальный</option>
            <option value="hungry">Очень голоден</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Транспорт</label>
          <select value={transport} onChange={(e) => setTransport(e.target.value)} className="border p-2 w-full">
            <option value="walk">Только пешком</option>
            <option value="walk+transport">Пешком + транспорт</option>
            <option value="transport">Только транспорт</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input id="withKids" type="checkbox" checked={withKids} onChange={(e) => setWithKids(e.target.checked)} />
          <label htmlFor="withKids">Путешествую с детьми</label>
        </div>
        <button onClick={generate} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading}>
          {loading ? 'Генерация...' : 'Сгенерировать маршрут'}
        </button>
      </div>
      {route && (
        <div className="space-y-2">
          <MapYandex points={points} apiKey={yaKey} lang={language === 'en' ? 'en_US' : 'ru_RU'} />
          <ul className="space-y-2">
            {route.places.map((p: any, i: number) => (
              <li key={i} className="border p-2 rounded">
                <div className="font-semibold">{p.name}</div>
                {p.address && <div className="text-sm opacity-70">{p.address}</div>}
                <div className="text-sm">{p.time} · {p.type}</div>
                <p className="text-sm mt-1">{p.description}</p>
              </li>
            ))}
          </ul>
          <div className="text-sm opacity-70">Итого: {route.totalDistance} · {route.estimatedCost}</div>
        </div>
      )}
      {!route && <div className="text-sm opacity-70">Маршрут ещё не сгенерирован.</div>}
    </div>
  );
}