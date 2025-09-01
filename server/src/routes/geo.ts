import { Router, Request, Response } from 'express';
import { geocodeCity, haversineKm } from '../geo';
import { ENV } from '../env';

const router = Router();

/**
 * GET /geo/search?q=...
 * Ищет города по названию через Яндекс Геокодер.
 */
router.get('/search', async (req: Request, res: Response) => {
  const q = String(req.query.q || '');
  if (!q) return res.json([]);
  const results = await geocodeCity(q, ENV.YANDEX_KEY);
  res.json(results);
});

/**
 * POST /geo/check-location
 * Проверяет, находится ли пользователь в выбранном городе (радиус 10 км).
 * Body: { city: { lat: number, lng: number }, user: { lat: number, lng: number } }
 */
router.post('/check-location', async (req: Request, res: Response) => {
  const { city, user } = req.body as {
    city: { lat: number; lng: number };
    user: { lat: number; lng: number };
  };
  const distanceKm = haversineKm(
    { lat: city.lat, lng: city.lng },
    { lat: user.lat, lng: user.lng },
  );
  res.json({ onLocation: distanceKm <= 10, distanceKm });
});

export default router;
