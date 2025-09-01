import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

/**
 * GET /profile
 * Возвращает профиль пользователя (предпочтения).
 */
router.get('/', async (req: Request, res: Response) => {
  const userIdHeader = req.headers['x-user-id'];
  const userId = userIdHeader ? BigInt(String(userIdHeader)) : null;
  if (!userId) return res.status(400).json({ error: 'Missing user id' });

  const profile = await prisma.profile.findUnique({ where: { userId } });
  res.json(profile ?? null);
});

/**
 * POST /profile
 * Сохраняет или обновляет профиль пользователя.
 * Body: { food: string[], activities: string[], dailyBudget: string, travelStyle: string }
 */
router.post('/', async (req: Request, res: Response) => {
  const userIdHeader = req.headers['x-user-id'];
  const userId = userIdHeader ? BigInt(String(userIdHeader)) : null;
  if (!userId) return res.status(400).json({ error: 'Missing user id' });

  const { food, activities, dailyBudget, travelStyle } = req.body as {
    food?: string[];
    activities?: string[];
    dailyBudget?: string;
    travelStyle?: string;
  };

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      food: JSON.stringify(food ?? []),
      activities: JSON.stringify(activities ?? []),
      dailyBudget: dailyBudget ?? null,
      travelStyle: travelStyle ?? null,
    },
    update: {
      food: JSON.stringify(food ?? []),
      activities: JSON.stringify(activities ?? []),
      dailyBudget: dailyBudget ?? null,
      travelStyle: travelStyle ?? null,
    },
  });
  res.json(profile);
});

export default router;
