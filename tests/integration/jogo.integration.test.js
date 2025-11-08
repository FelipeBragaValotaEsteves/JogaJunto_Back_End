import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

vi.mock('../../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

let mockAuthUser = { id: 123, email: 'test@example.com' };

vi.mock('../../src/middlewares/auth.middleware.js', () => ({
    requireAuth: (req, res, next) => {
        req.user = mockAuthUser;
        next();
    }
}));

vi.mock('../../src/services/time.service.js', () => ({
    TimeService: {
        criarTime: vi.fn()
    }
}));

import { db } from '../../src/config/database.js';
import { db } from '../../src/config/database.js';
import { TimeService } from '../../src/services/time.service.js';
import jogoRoutes from '../../src/routes/jogo.routes.js';
describe('Testes de Integração das Rotas de Jogo', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/jogo', jogoRoutes);
        vi.clearAllMocks();
        mockAuthUser = { id: 123, email: 'test@example.com' };
    });

    describe('POST /jogo', () => {
        it('deve criar jogo com dois times com sucesso', async () => {
            const mockPartida = { id: 1, usuario_criador_id: 123 };
            const mockJogo = { id: 1, partida_id: 1 };
            const mockTime1 = { id: 1, nome: 'Time A' };
            const mockTime2 = { id: 2, nome: 'Time B' };

            db.query
                .mockResolvedValueOnce({ rows: [mockPartida] })
                .mockResolvedValueOnce({ rows: [mockJogo] });

            TimeService.criarTime
                .mockResolvedValueOnce(mockTime1)
                .mockResolvedValueOnce(mockTime2);

            const response = await request(app)
                .post('/jogo')
                .send({
                    partidaId: 1,
                    time1: 'Time A',
                    time2: 'Time B'
                })
                .expect(201);

            expect(response.body).toEqual({
                jogo: mockJogo,
                time1: mockTime1,
                time2: mockTime2
            });
        });

        it('deve retornar 404 quando partida não encontrada', async () => {
            db.query.mockResolvedValue({ rows: [] });

            await request(app)
                .post('/jogo')
                .send({
                    partidaId: 999,
                    time1: 'Time A',
                    time2: 'Time B'
                })
                .expect(404);
        });

        it('deve retornar 403 quando usuário não é criador da partida', async () => {
            mockAuthUser = { id: 999, email: 'notcreator@example.com' };
            
            const mockPartida = { id: 1, usuario_criador_id: 123 };
            db.query.mockResolvedValue({ rows: [mockPartida] });

            await request(app)
                .post('/jogo')
                .send({
                    partidaId: 1,
                    time1: 'Time A',
                    time2: 'Time B'
                })
                .expect(403);
        });

        it('deve retornar 403 quando falha ao criar time1', async () => {
            const mockPartida = { id: 1, usuario_criador_id: 123 };
            const mockJogo = { id: 1, partida_id: 1 };

            db.query
                .mockResolvedValueOnce({ rows: [mockPartida] })
                .mockResolvedValueOnce({ rows: [mockJogo] });

            TimeService.criarTime.mockResolvedValueOnce('forbidden');

            await request(app)
                .post('/jogo')
                .send({
                    partidaId: 1,
                    time1: 'Time A',
                    time2: 'Time B'
                })
                .expect(403);
        });

        it('deve retornar 400 quando dados inválidos para time2', async () => {
            const mockPartida = { id: 1, usuario_criador_id: 123 };
            const mockJogo = { id: 1, partida_id: 1 };
            const mockTime1 = { id: 1, nome: 'Time A' };

            db.query
                .mockResolvedValueOnce({ rows: [mockPartida] })
                .mockResolvedValueOnce({ rows: [mockJogo] });

            TimeService.criarTime
                .mockResolvedValueOnce(mockTime1)
                .mockResolvedValueOnce('invalid_data');

            await request(app)
                .post('/jogo')
                .send({
                    partidaId: 1,
                    time1: 'Time A',
                    time2: 'Time B'
                })
                .expect(400);
        });
    });

    describe('DELETE /jogo/:jogoId', () => {
        it('deve excluir jogo com sucesso', async () => {
            const mockJogo = { id: 1, partida_id: 1 };
            const mockPartida = { id: 1, usuario_criador_id: 123 };

            db.query
                .mockResolvedValueOnce({ rows: [mockJogo] })
                .mockResolvedValueOnce({ rows: [mockPartida] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .delete('/jogo/1')
                .expect(200);

            expect(response.body).toEqual({ message: 'Jogo excluído com sucesso.' });
        });

        it('deve retornar 404 quando jogo não encontrado', async () => {
            db.query.mockResolvedValue({ rows: [] });

            await request(app)
                .delete('/jogo/999')
                .expect(404);
        });

        it('deve retornar 403 quando usuário não é criador', async () => {
            mockAuthUser = { id: 999, email: 'notcreator@example.com' };
            
            const mockJogo = { id: 1, partida_id: 1 };
            const mockPartida = { id: 1, usuario_criador_id: 123 };

            db.query
                .mockResolvedValueOnce({ rows: [mockJogo] })
                .mockResolvedValueOnce({ rows: [mockPartida] });

            await request(app)
                .delete('/jogo/1')
                .expect(403);
        });
    });

    describe('GET /jogo/:jogoId', () => {
        it('deve obter resumo completo do jogo', async () => {
            const mockRows = [
                {
                    jogo_id: 1,
                    time_id: 1,
                    time_nome: 'Time A',
                    time_gols: 3,
                    time_assistencias: 2,
                    time_cartoes_amarelos: 1,
                    time_cartoes_vermelhos: 0,
                    time_participante_id: 1,
                    jogador_id: 1,
                    gol: 2,
                    assistencia: 1,
                    defesa: 0,
                    cartao_amarelo: 0,
                    cartao_vermelho: 0,
                    jogador_nome: 'João Silva',
                    posicao_nome: 'Atacante',
                    foto: 'foto1.jpg'
                }
            ];

            db.query.mockResolvedValue({ rows: mockRows });

            const response = await request(app)
                .get('/jogo/1')
                .expect(200);

            expect(response.body).toHaveProperty('jogoId', 1);
            expect(response.body).toHaveProperty('times');
            expect(response.body.times).toHaveLength(1);
            expect(response.body.times[0]).toHaveProperty('timeId', 1);
            expect(response.body.times[0]).toHaveProperty('nome', 'Time A');
            expect(response.body.times[0].totais).toHaveProperty('gols', 3);
        });
    });
});