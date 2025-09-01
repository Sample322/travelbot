import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

/**
 * GET /favorites?city=...
 * Возвращает список избранных мест для пользователя; можно фильтровать по городу.
 */
router.get('/', async (req: Request, res: Response) => {
  const userIdHeader = req.headers['x-user-id'];
  const userId = userIdHeader ? BigInt(String(userIdHeader)) : null;
  if (!userId) return res.status(400).json({ error: 'Missing user id' });

  const city = String(req.query.city || '');
  const favorites = await prisma.favorite.findMany({
    where: { userId, ...(city ? { city } : {}) },
    orderBy: { createdAt: 'desc' },
  });
  res.json(favorites);
});

/**
 * POST /favorites
 * Сохраняет избранное место.
 * Body: { city, name, type, lat, lng, address }
 */
router.post('/', async (req: Request, res: Response) => {
  const userIdHeader = req.headers['x-user-id'];
  const userId = userIdHeader ? BigInt(String(userIdHeader)) : null;
  if (!userId) return res.status(400).json({ error: 'Missing user id' });

  const { city, name, type, lat, lng, address } = req.body as {
    city: string;
    name: string;
    type?: string;
    lat?: number;
    lng?: number;
    address?: string;
  };
  const fav = await prisma.favorite.create({
    data: { userId, city, name, type: type ?? null, lat, lng, address },
  });
  res.json(fav);
});

export default router;
