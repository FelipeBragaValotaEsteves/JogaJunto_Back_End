import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cidadeRoutes from '../../src/routes/cidade.routes.js';

vi.mock('../../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

vi.mock('../../src/middlewares/auth.middleware.js', () => ({
    requireAuth: (req, res, next) => {
     
        req.user = { id: 1, email: 'test@example.com' };
        next();
    }
}));

import { db } from '../../src/config/database.js';

describe('Testes de integração das rotas de Cidade', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/cidade', cidadeRoutes);
        vi.clearAllMocks();
    });

    describe('GET /cidade/:stateId', () => {
        it('deve retornar cidades para ID de estado válido', async () => {
            const mockCities = [
                { id: 1, nome: 'Cidade A', estado_id: 1 },
                { id: 2, nome: 'Cidade B', estado_id: 1 }
            ];

            db.query.mockResolvedValue({ rows: mockCities });

            const response = await request(app)
                .get('/cidade/1')
                .expect(200);

            expect(response.body).toEqual(mockCities);
            expect(db.query).toHaveBeenCalledWith(
                `SELECT * FROM cidade WHERE estado_id = $1
            ORDER BY nome`,
                [1]
            );
        });

        it('deve retornar array vazio quando nenhuma cidade for encontrada', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const response = await request(app)
                .get('/cidade/999')
                .expect(200);

            expect(response.body).toEqual([]);
        });
    });
});