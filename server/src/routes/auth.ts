import { Router } from 'express';
import { verifyInitData } from '../telegram';
import { ENV } from '../env';
import { prisma } from '../index';

/**
 * Authentication routes. The `/verify` endpoint accepts a raw
 * `initData` string from the Telegram WebApp and verifies its
 * authenticity using the bot token. On success it creates or
 * updates the user in the database. The client should call this
 * endpoint immediately after the WebApp is opened to establish a
 * server‑side session. See the Telegram Mini Apps docs for more
 * details on initData verification【350668147173360†screenshot】.
 */
const router = Router();

router.post('/verify', async (req, res) => {
  const { initData } = req.body as { initData?: string };
  if (!initData) return res.status(400).json({ ok: false, error: 'initData required' });
  try {
    const parsed = verifyInitData(initData, ENV.BOT_TOKEN);
    const tgUser = parsed.user;
    // Upsert the user based on Telegram ID. Use BigInt conversion
    // because Prisma stores BigInt fields as native BigInt in JS.
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
    return res.json({ ok: true, user });
  } catch (err: any) {
    return res.status(401).json({ ok: false, error: err.message });
  }
});

export default router;