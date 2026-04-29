import express, { type Express } from 'express';
import { candidateRouter } from './routes/candidateRoutes';
import { uploadRouter } from './routes/uploadRoutes';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.get('/', (_req, res) => {
    res.type('text/plain');
    res.send('Hola LTI!');
  });
  app.use(candidateRouter);
  app.use(uploadRouter);
  app.use(errorHandler);
  return app;
}
