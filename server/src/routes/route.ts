import { Router } from 'express';
import { prisma, openai } from '../index';
import { ENV } from '../env';
import { generateRouteJSON } from '../ai';
import { geocodePlaceInCity, haversineKm } from '../geo';

/**
 * Route generation endpoint. Accepts user input including city,
 * profile preferences and trip context, calls the AI to generate a
 * route, geocodes each place for coordinates and addresses,
 * calculates total distance between consecutive points, saves the
 * route to the database and returns it to the client. If AI is
 * unavailable (no API key), the response will contain a static
 * mock route defined in ai.ts.
 */
const router = Router();

router.post('/', async (req, res) => {
  const uid = req.headers['x-user-id'];
  if (!uid) return res.status(400).json({ error: 'x-user-id header required' });
  const userId = BigInt(String(uid));
  const { city, country, time, profile, hunger, transport, withKids, language } = req.body as any;
  try {
    // Use the AI to generate a base route (without coordinates).
    const baseRoute = await generateRouteJSON(openai, { city, time, profile, hunger, transport, withKids, language });
    // Geocode each place within the city to get coordinates and
    // addresses. Also compute the cumulative distance.
    const placesWithCoords: any[] = [];
    let totalKm = 0;
    let prevPoint: { lat: number; lng: number } | null = null;
    for (const place of baseRoute.places) {
      const geo = await geocodePlaceInCity(place.name, city, ENV.YANDEX_KEY);
      const coords = geo ? { lat: geo.lat, lng: geo.lng } : null;
      const address = geo?.address ?? null;
      placesWithCoords.push({ ...place, coords, address });
      if (prevPoint && coords) {
        totalKm += haversineKm(prevPoint, coords);
      }
      if (coords) prevPoint = coords;
    }
    // Assign computed values back into the route JSON.
    const routeJson = {
      ...baseRoute,
      places: placesWithCoords,
      totalDistance: baseRoute.totalDistance ?? `${totalKm.toFixed(1)} km`
    };
    // Persist the route in the database for history and offline
    // retrieval. Use the JSON type for efficient storage.
    await prisma.route.create({ data: { userId, city, country: country ?? null, language, routeJson } });
    return res.json({ ok: true, route: routeJson });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;