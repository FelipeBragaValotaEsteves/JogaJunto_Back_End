import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('Healthcheck', () => {
  it('GET /health deve responder ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
