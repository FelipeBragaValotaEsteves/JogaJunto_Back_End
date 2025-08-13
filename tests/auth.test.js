import request from 'supertest';
import { createApp } from '../src/app.js';
import { ensureSchema, db, pool } from '../src/config/database.js';

const app = createApp();

beforeAll(async () => {
  await ensureSchema();
  
  await db.query('DELETE FROM convites');
  await db.query('DELETE FROM partidas');
  await db.query('DELETE FROM usuarios');
});

afterAll(async () => {
  await pool.end();
});

describe('Auth', () => {
  const payload = { nome: 'Teste', email: 'teste@ex.com', senha: '123456' };

  it('POST /api/auth/register cria usuário e retorna token', async () => {
    const res = await request(app).post('/api/auth/register').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(payload.email);
    expect(res.body.token).toBeTruthy();
  });

  it('POST /api/auth/login autentica e retorna token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: payload.email, senha: payload.senha
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });
});
