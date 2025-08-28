import { env } from './config/env.js';
import { createApp } from './app.js';
import { pool } from './config/database.js';
import cors from 'cors';
import path from 'path';
import express from 'express';
import helmet from 'helmet';

const app = createApp();

app.use(cors());

app.use(helmet({
  crossOriginResourcePolicy: false
}));


// app.use(cors({
//   origin: '*',
//   methods: ['GET', 'POST', 'PATCH', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use('/uploads', express.static(path.resolve('uploads'), {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

app.listen(env.port, async () => {
  try {
    console.log(`API rodando em http://localhost:${env.port}`);
  } catch (e) {
    console.error('Erro ao garantir schema:', e);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});
