import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';

export function createApp() {
  const app = express();

  app.use(helmet({
    crossOriginResourcePolicy: false
  }));

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/api', routes);

  app.use('/uploads', express.static(path.resolve('uploads'), {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
