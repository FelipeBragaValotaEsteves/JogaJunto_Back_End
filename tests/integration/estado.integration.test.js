import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import estadoRoutes from '../../src/routes/estado.routes.js';

vi.mock('../../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

vi.mock('../../src/middlewares/auth.middleware.js', () => ({
    requireAuth: (req, res, next) => {
        req.user = { id: 123, email: 'test@example.com' };
        next();
    }
}));

import { db } from '../../src/config/database.js';

describe('Testes de Integração das Rotas de Estado', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/estado', estadoRoutes);
        vi.clearAllMocks();
    });

    describe('GET /estado', () => {
        it('deve retornar lista de estados com sucesso', async () => {
            const mockEstados = [
                { id: 1, nome: 'Acre', sigla: 'AC' },
                { id: 2, nome: 'Alagoas', sigla: 'AL' },
                { id: 3, nome: 'Bahia', sigla: 'BA' }
            ];

            db.query.mockResolvedValue({ rows: mockEstados });

            const response = await request(app)
                .get('/estado')
                .expect(200);

            expect(response.body).toEqual(mockEstados);
            expect(db.query).toHaveBeenCalledWith(
                `SELECT * FROM estado
            ORDER BY nome`
            );
        });

        it('deve retornar array vazio quando não há estados cadastrados', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const response = await request(app)
                .get('/estado')
                .expect(200);

            expect(response.body).toEqual([]);
        });
    });
});