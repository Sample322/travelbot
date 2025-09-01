import { Router, Request, Response } from 'express';
import { prisma, openai } from '../index';
import { geocodePlaceInCity, haversineKm } from '../geo';
import { generateRouteJSON } from '../ai';
import { ENV } from '../env';

const router = Router();

/**
 * POST /route
 * Принимает данные (город, время, предпочтения и т.д.), вызывает AI для генерации маршрута,
 * геокодирует каждое место (добавляет coords/address), вычисляет расстояние и сохраняет в БД.
 */
router.post('/', async (req: Request, res: Response) => {
  const userIdHeader = req.headers['x-user-id'];
  const userId = userIdHeader ? BigInt(String(userIdHeader)) : null;
  if (!userId) return res.status(400).json({ error: 'Missing user id' });

  const {
    city,
    country,
    time,
    profile,
    hunger,
    transport,
    withKids,
    language,
  } = req.body as {
    city: string;
    country?: string;
    time: string;
    profile: any;
    hunger: string;
    transport: string;
    withKids: boolean;
    language: 'ru' | 'en';
  };

  try {
    // генерируем маршрут через LLM
    let route = await generateRouteJSON({
      city,
      time,
      profile,
      hunger,
      transport,
      withKids,
      language,
    });

    // геокодируем места (добавляем coords, address) и считаем расстояние
    let totalKm = 0;
    let prev: { lat: number; lng: number } | null = null;
    const places = [];
    for (const p of route.places || []) {
      const geo = await geocodePlaceInCity(p.name, city, ENV.YANDEX_KEY);
      const place = {
        ...p,
        coords: geo ? { lat: geo.lat, lng: geo.lng } : null,
        address: geo?.address ?? null,
      };
      places.push(place);
      if (prev && geo) {
        totalKm += haversineKm(prev, { lat: geo.lat, lng: geo.lng });
      }
      if (geo) prev = { lat: geo.lat, lng: geo.lng };
    }
    route.places = places;
    // если AI не вернул расстояние — подставляем
    if (!route.totalDistance) {
      route.totalDistance = `${totalKm.toFixed(1)} km`;
    }

    // сохраняем в БД
    const saved = await prisma.route.create({
      data: {
        userId,
        city,
        country: country ?? null,
        language,
        routeJson: route as any,
      },
    });

    res.json({ ok: true, route: saved.routeJson });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err?.message || 'AI error' });
  }
});

export default router;
