import { Router } from 'express';
import { oneCallDaily } from '../weather';
import { generateTips } from '../ai';
import { openai } from '../index';
import { ENV } from '../env';

/**
 * Planning recommendations endpoint. Accepts the city coordinates,
 * trip date range, user preferences and the desired language. It
 * fetches a weather forecast from OpenWeather One Call 3.0 and
 * passes a digest to the AI to generate clothing, timing and
 * general travel tips. If the AI is unavailable, it returns
 * sensible defaults defined in ai.ts.
 */
const router = Router();

router.post('/recommendations', async (req, res) => {
  const { city, coords, dates, prefs, language } = req.body as any;
  if (!coords) return res.status(400).json({ error: 'coords required' });
  try {
    // Fetch weather forecast for the next days using OpenWeatherMap.
    const daily = await oneCallDaily(coords.lat, coords.lng, ENV.OWM_KEY);
    // Use AI to summarise the forecast and offer tips.
    const tips = await generateTips(openai, { city, dates, prefs, daily, language });
    return res.json({ weather: tips.weather, clothing: tips.clothing, bestTimes: tips.bestTimes, tips: tips.tips });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;