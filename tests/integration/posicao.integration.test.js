import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import posicaoRoutes from '../../src/routes/posicao.routes.js';

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
app.use('/posicao', posicaoRoutes);

describe('Testes de Integração - Posição', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /posicao/list', () => {
        it('deve retornar lista de posições com status 200', async () => {
            const mockPosicoes = [
                { id: 1, nome: 'Goleiro' },
                { id: 2, nome: 'Zagueiro' },
                { id: 3, nome: 'Lateral Direito' },
                { id: 4, nome: 'Lateral Esquerdo' },
                { id: 5, nome: 'Volante' },
                { id: 6, nome: 'Meio-campo' },
                { id: 7, nome: 'Ponta Direita' },
                { id: 8, nome: 'Ponta Esquerda' },
                { id: 9, nome: 'Atacante' },
                { id: 10, nome: 'Centroavante' }
            ];

            db.query.mockResolvedValue({ rows: mockPosicoes });

            const response = await request(app)
                .get('/posicao/list')
                .expect(200);

            expect(response.body).toEqual(mockPosicoes);
            expect(db.query).toHaveBeenCalledWith(
                'SELECT id, nome FROM posicao ORDER BY id ASC'
            );
        });

        it('deve retornar array vazio quando não há posições cadastradas', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const response = await request(app)
                .get('/posicao/list')
                .expect(200);

            expect(response.body).toEqual([]);
        });
    });
});