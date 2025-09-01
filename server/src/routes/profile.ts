import { Router } from 'express';
import { prisma } from '../index';

/**
 * Profile routes. Allow the client to fetch and update the user's
 * travel preferences. The user ID is supplied via the
 * `x-user-id` header, which should correspond to the Telegram ID
 * verified during `/auth/verify`. Preferences are stored in the
 * Profile model as JSON strings for food and activities. If no
 * profile exists, GET returns null. POST will create or update
 * the profile.
 */
const router = Router();

// Fetch the current user's profile. Returns null if not set.
router.get('/', async (req, res) => {
  const uid = req.headers['x-user-id'];
  if (!uid) return res.status(400).json({ error: 'x-user-id header required' });
  const userId = BigInt(String(uid));
  const profile = await prisma.profile.findUnique({ where: { userId } });
  return res.json(profile);
});

// Create or update the user's profile. Expects JSON body with
// `food`, `activities`, `dailyBudget` and `travelStyle` fields.
router.post('/', async (req, res) => {
  const uid = req.headers['x-user-id'];
  if (!uid) return res.status(400).json({ error: 'x-user-id header required' });
  const userId = BigInt(String(uid));
  const { food, activities, dailyBudget, travelStyle } = req.body;
  const profile = await prisma.profile.upsert({
    where: { userId },
    update: {
      food: food != null ? JSON.stringify(food) : undefined,
      activities: activities != null ? JSON.stringify(activities) : undefined,
      dailyBudget: dailyBudget ?? undefined,
      travelStyle: travelStyle ?? undefined
    },
    create: {
      userId,
      food: food != null ? JSON.stringify(food) : undefined,
      activities: activities != null ? JSON.stringify(activities) : undefined,
      dailyBudget: dailyBudget ?? undefined,
      travelStyle: travelStyle ?? undefined
    }
  });
  return res.json(profile);
});

export default router;