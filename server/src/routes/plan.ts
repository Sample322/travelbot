import { Router, Request, Response } from 'express';
import { oneCallDaily } from '../weather';
import { generateTips } from '../ai';

const router = Router();

/**
 * POST /plan/recommendations
 * Тянет погоду через OpenWeather One Call 3.0 и просит AI дать советы.
 * Body: { city: string, coords: { lat, lng }, dates: { from, to }, prefs: any, language: 'ru'|'en' }
 */
router.post('/recommendations', async (req: Request, res: Response) => {
  const { city, coords, dates, prefs, language } = req.body as {
    city: string;
    coords: { lat: number; lng: number };
    dates: { from: string; to: string };
    prefs: any;
    language: 'ru' | 'en';
  };

  const daily = await oneCallDaily(coords.lat, coords.lng, process.env.OWM_KEY!);
  const tips = await generateTips({ city, dates, prefs, daily, language });
  res.json({
    weather: tips.weather,
    clothing: tips.clothing,
    bestTimes: tips.bestTimes,
    tips: tips.tips,
  });
});

export default router;
