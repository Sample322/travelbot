import { Router } from 'express';
import { geocodeCity, haversineKm } from '../geo';
import { ENV } from '../env';

/**
 * Geo routes. Provide endpoints for searching cities and checking
 * whether the user is located within a certain radius of the
 * selected city. Uses the Haversine formula to compute distances.
 */
const router = Router();

// Search cities by name (full or partial). Returns an array of
// objects containing name, country, lat and lng. The Yandex API
// returns up to five results.
router.get('/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json([]);
  try {
    const results = await geocodeCity(q, ENV.YANDEX_KEY);
    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Determine if the user is within a 10km radius of a city centre.
// The client sends coordinates of the city and the user. The
// response includes a boolean `onLocation` and the distance in km.
router.post('/check-location', async (req, res) => {
  const { city, user } = req.body as { city: { lat: number; lng: number }; user: { lat: number; lng: number } };
  if (!city || !user) return res.status(400).json({ error: 'city and user coordinates required' });
  const distanceKm = haversineKm(city, user);
  const onLocation = distanceKm <= 10;
  return res.json({ onLocation, distanceKm });
});

export default router;