import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import tipoRoutes from '../../src/routes/tipo.routes.js';

vi.mock('../../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

vi.mock('../../src/middlewares/auth.middleware.js', () => ({
    requireAuth: (req, res, next) => {
        req.user = { id: 123, nome: 'Usuário Teste' };
        next();
    }
}));

import { db } from '../../src/config/database.js';

const app = express();
app.use(express.json());
app.use('/tipo', tipoRoutes);

describe('Testes de Integração - Tipo', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /tipo', () => {
        it('deve retornar lista de tipos com status 200', async () => {
            const mockTipos = [
                { 
                    id: 1, 
                    nome: 'Futebol 11',
                },
                { 
                    id: 2, 
                    nome: 'Futsal',
                },
                { 
                    id: 3, 
                    nome: 'Society',
                }
            ];

            db.query.mockResolvedValue({ rows: mockTipos });

            const response = await request(app)
                .get('/tipo')
                .expect(200);

            expect(response.body).toEqual(mockTipos);
            expect(db.query).toHaveBeenCalledWith(
                'SELECT * FROM tipo_partida\n            ORDER BY nome'
            );
        });

        it('deve retornar array vazio quando não há tipos cadastrados', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const response = await request(app)
                .get('/tipo')
                .expect(200);

            expect(response.body).toEqual([]);
        });
    });
});