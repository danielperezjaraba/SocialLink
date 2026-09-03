import cors from 'cors';
import express, { type Express } from 'express';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { rateLimit } from './middleware/rateLimit';
import { authRouter } from './modules/auth/auth.routes';
import { plansRouter } from './modules/plans/plans.routes';
import { projectsRouter } from './modules/projects/projects.routes';
import { usersRouter } from './modules/users/users.routes';

export function createApp(): Express {
  const app = express();

  // Detrás de un proxy (Render, Railway) la IP real viaja en X-Forwarded-For.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(cors({ origin: env.corsOrigins }));

  // Un diagrama grande con notas ronda los cientos de kilobytes; 2 MB deja
  // margen suficiente y descarta de entrada cualquier envío desproporcionado.
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'sociallink-api' });
  });

  app.use(
    '/api/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 40,
      message: 'Demasiados intentos seguidos. Espera unos minutos y vuelve a probar.',
    }),
    authRouter,
  );

  app.use('/api/users', usersRouter);
  app.use('/api/plans', plansRouter);
  app.use('/api/projects', projectsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
