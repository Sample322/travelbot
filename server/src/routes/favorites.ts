import { Router } from 'express';
import { prisma } from '../index';

/**
 * Favourite points of interest routes. Allow the client to store
 * and retrieve favourite places for a city. Favourites are keyed
 * by the user and city. This enables building routes later based
 * on the user's saved interests. Coordinates are optional so
 * favourites can be saved even if geocoding fails.
 */
const router = Router();

// Retrieve favourites for the current user. Optionally filter by
// city via query string.
router.get('/', async (req, res) => {
  const uid = req.headers['x-user-id'];
  if (!uid) return res.status(400).json({ error: 'x-user-id header required' });
  const userId = BigInt(String(uid));
  const city = String(req.query.city || '');
  const list = await prisma.favorite.findMany({
    where: { userId, ...(city ? { city } : {}) },
    orderBy: { createdAt: 'desc' }
  });
  return res.json(list);
});

// Add a new favourite place. Expects name and city; type, lat, lng and
// address are optional.
router.post('/', async (req, res) => {
  const uid = req.headers['x-user-id'];
  if (!uid) return res.status(400).json({ error: 'x-user-id header required' });
  const userId = BigInt(String(uid));
  const { city, name, type, lat, lng, address } = req.body;
  if (!city || !name) return res.status(400).json({ error: 'city and name are required' });
  const fav = await prisma.favorite.create({
    data: {
      userId,
      city,
      name,
      type: type ?? null,
      lat: lat != null ? Number(lat) : null,
      lng: lng != null ? Number(lng) : null,
      address: address ?? null
    }
  });
  return res.json(fav);
});

export default router;