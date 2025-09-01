import { Router, Request, Response } from 'express';
import { ENV } from '../env';
import { prisma } from '../index';
import { verifyAndParseInitData } from '../telegram';

const router = Router();

/**
 * POST /auth/verify
 * Body: { initData: string }
 * Валидируем подпись, парсим user и создаём/обновляем пользователя в БД.
 */
router.post('/verify', async (req: Request, res: Response) => {
  const { initData } = req.body as { initData: string };
  try {
    const parsed = verifyAndParseInitData(initData, ENV.BOT_TOKEN);
    const tgUser = parsed.user;
    if (!tgUser) {
      return res.status(400).json({ ok: false, error: 'No user in initData' });
    }

    const user = await prisma.user.upsert({
      where: { id: BigInt(tgUser.id) },
      create: {
        id: BigInt(tgUser.id),
        username: tgUser.username ?? null,
        firstName: tgUser.first_name ?? null,
        language: tgUser.language_code ?? null
      },
      update: {
        username: tgUser.username ?? null,
        firstName: tgUser.first_name ?? null,
        language: tgUser.language_code ?? null
      }
    });

    res.json({ ok: true, user });
  } catch (err: any) {
    res.status(401).json({ ok: false, error: err?.message || 'Invalid initData' });
  }
});

export default router;
