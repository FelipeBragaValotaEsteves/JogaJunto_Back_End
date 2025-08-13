import { env } from './config/env.js';
import { createApp } from './app.js';
import { pool } from './config/database.js';

const app = createApp();

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
