import express from 'express';
import cors from 'cors';
import { ENV } from './env';
import { PrismaClient } from '@prisma/client';
import { makeLLM } from './ai';

import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import geoRoutes from './routes/geo';
import routeRoutes from './routes/route';
import planRoutes from './routes/plan';
import favoritesRoutes from './routes/favorites';

const app = express();

// Инстансы Prisma и LLM
export const prisma = new PrismaClient();
export const openai = makeLLM();

app.use(cors());
app.use(express.json());

// Health‑check
app.get('/health', (_req, res) => res.json({ ok: true }));

// Роуты API
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/geo', geoRoutes);
app.use('/route', routeRoutes);
app.use('/plan', planRoutes);
app.use('/favorites', favoritesRoutes);

// Раздача статических файлов клиента
import path from 'path';
const staticDir = path.join(__dirname, '..', 'dist_client');
app.use(express.static(staticDir));
app.get('*', (_req, res) => res.sendFile(path.join(staticDir, 'index.html')));

app.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`);
});
