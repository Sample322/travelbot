import express from 'express';
import cors from 'cors';
import { ENV } from './env';
import { PrismaClient } from '@prisma/client';
import { makeOpenAI } from './ai';

// Route modules
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import geoRoutes from './routes/geo';
import routeRoutes from './routes/route';
import planRoutes from './routes/plan';
import favoritesRoutes from './routes/favorites';

/**
 * Entry point for the backend HTTP server. This sets up the
 * Express app, attaches middleware, initialises Prisma and the
 * OpenAI client, mounts the subrouters and starts listening on the
 * configured port. When deployed in Docker, environment variables
 * will be supplied via the container configuration. See README for
 * details on how to run the server locally or in production.
 */

export const prisma = new PrismaClient();
export const openai = makeOpenAI(ENV.OPENAI_API_KEY);

const app = express();

// Allow cross‑origin requests from the client during development.
app.use(cors());
// Parse JSON bodies with a reasonable size limit.
app.use(express.json({ limit: '1mb' }));

// Simple health check to confirm the service is running.
app.get('/health', (_req, res) => res.json({ ok: true }));

// Mount API routes under their respective prefixes. Each router
// handles its own error responses.
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/geo', geoRoutes);
app.use('/route', routeRoutes);
app.use('/plan', planRoutes);
app.use('/favorites', favoritesRoutes);

// Start the HTTP server. Use an environment variable for the port
// with a sensible default when developing locally.
const port = parseInt(ENV.PORT || '3000', 10);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${port}`);
});