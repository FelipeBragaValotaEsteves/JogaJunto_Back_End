import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import partidaRoutes from '../../src/routes/partida.routes.js';

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

import { db } from '../../src/config/database.js';

describe('Testes de Integração das Rotas de Partida', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/partida', partidaRoutes);
        vi.clearAllMocks();
        mockAuthUser = { id: 123, email: 'test@example.com' };
    });

    describe('POST /partida', () => {
        it('deve criar partida com sucesso', async () => {
            const mockPartida = {
                id: 1,
                local: 'Campo Central',
                rua: 'Rua das Flores',
                bairro: 'Centro',
                numero: 123,
                cidade_id: 1,
                usuario_criador_id: 123,
                data: '2024-12-01T00:00:00.000Z',
                hora_inicio: '10:00',
                hora_fim: '12:00',
                tipo_partida_id: 1,
                status: 'aguardando',
                valor: 25.50
            };

            db.query.mockResolvedValue({ rows: [mockPartida] });

            const response = await request(app)
                .post('/partida')
                .send({
                    local: 'Campo Central',
                    rua: 'Rua das Flores',
                    bairro: 'Centro',
                    numero: 123,
                    cidade_id: 1,
                    data: '2024-12-01',
                    hora_inicio: '10:00',
                    hora_fim: '12:00',
                    tipo_partida_id: 1,
                    valor: 25.50
                })
                .expect(201);

            expect(response.body).toEqual(mockPartida);
        });
    });

    describe('PUT /partida/:id', () => {
        it('deve atualizar partida com sucesso', async () => {
            const mockPartida = {
                id: 1,
                local: 'Campo Atualizado',
                usuario_criador_id: 123
            };

            db.query.mockResolvedValue({ rows: [mockPartida] });

            const response = await request(app)
                .put('/partida/1')
                .send({
                    local: 'Campo Atualizado',
                    valor: 30.00
                })
                .expect(200);

            expect(response.body).toEqual(mockPartida);
        });

        it('deve retornar 404 quando partida não encontrada ou usuário não é criador', async () => {
            db.query.mockResolvedValue({ rows: [] });

            await request(app)
                .put('/partida/999')
                .send({ local: 'Campo Atualizado' })
                .expect(404);
        });
    });

    describe('POST /partida/cancelar/:id', () => {
        it('deve cancelar partida com sucesso', async () => {
            const mockResult = { id: 1, status: 'cancelada' };
            db.query.mockResolvedValue({ rows: [mockResult] });

            const response = await request(app)
                .post('/partida/cancelar/1')
                .expect(200);

            expect(response.body.status).toBe('cancelada');
        });

        it('deve retornar 404 quando partida não encontrada', async () => {
            db.query.mockResolvedValue({ rows: [] });

            await request(app)
                .post('/partida/cancelar/999')
                .expect(404);
        });

        it('deve verificar se usuário é o criador', async () => {
            mockAuthUser = { id: 999, email: 'notowner@example.com' };
            db.query.mockResolvedValue({ rows: [] });

            await request(app)
                .post('/partida/cancelar/1')
                .expect(404);
        });
    });

    describe('GET /partida/:id', () => {
        it('deve retornar partida com detalhes', async () => {
            const mockPartida = {
                id: 1,
                local: 'Campo A',
                cidade_nome: 'São Paulo',
                estado_id: 1,
                tipo_partida_nome: 'Futebol'
            };

            db.query.mockResolvedValue({ rows: [mockPartida] });

            const response = await request(app)
                .get('/partida/1')
                .expect(200);

            expect(response.body).toEqual(mockPartida);
            expect(response.body).toHaveProperty('cidade_nome');
            expect(response.body).toHaveProperty('tipo_partida_nome');
        });

        it('deve retornar 404 quando partida não encontrada', async () => {
            db.query.mockResolvedValue({ rows: [] });

            await request(app)
                .get('/partida/999')
                .expect(404);
        });
    });

    describe('GET /partida/criada/:userId', () => {
        it('deve retornar partidas criadas pelo usuário', async () => {
            const mockPartidas = [
                { id: 1, usuario_criador_id: 123, data: '2024-12-02' },
                { id: 2, usuario_criador_id: 123, data: '2024-12-01' }
            ];

            db.query.mockResolvedValue({ rows: mockPartidas });

            const response = await request(app)
                .get('/partida/criada/123')
                .expect(200);

            expect(response.body).toEqual(mockPartidas);
        });

        it('deve retornar array vazio quando usuário não tem partidas', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const response = await request(app)
                .get('/partida/criada/999')
                .expect(200);

            expect(response.body).toEqual([]);
        });
    });

    describe('GET /partida/jogada', () => {
        it('deve retornar partidas onde usuário participou', async () => {
            const mockPartidas = [
                { id: 1, data: '2024-12-01' }
            ];

            db.query.mockResolvedValue({ rows: mockPartidas });

            const response = await request(app)
                .get('/partida/jogada/123')
                .expect(200);

            expect(response.body).toEqual(mockPartidas);
        });
    });

    describe('GET /partida/proximas/:city', () => {
        it('deve retornar partidas da cidade especificada', async () => {
            const mockPartidas = [
                { id: 1, local: 'Campo A' },
                { id: 2, local: 'Campo B' }
            ];

            db.query.mockResolvedValue({ rows: mockPartidas });

            const response = await request(app)
                .get('/partida/proximas/São Paulo')
                .expect(200);

            expect(response.body).toEqual(mockPartidas);
        });
    });

    describe('GET /partida/resumo/:partidaId', () => {
        it('deve retornar resumo da partida', async () => {
            const mockRows = [
                {
                    jogo_id: 1,
                    time_id: 1,
                    time_nome: 'Time A',
                    time_gols: 2,
                    time_assistencias: 1,
                    time_cartoes_amarelos: 0,
                    time_cartoes_vermelhos: 0,
                    time_participante_id: 1,
                    jogador_id: 1,
                    gol: 1,
                    assistencia: 0,
                    defesa: 0,
                    cartao_amarelo: 0,
                    cartao_vermelho: 0,
                    jogador_nome: 'João Silva'
                }
            ];

            db.query.mockResolvedValue({ rows: mockRows });

            const response = await request(app)
                .get('/partida/resumo/1')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0]).toHaveProperty('jogoId', 1);
            expect(response.body[0]).toHaveProperty('times');
        });

        it('deve retornar array vazio quando não há dados', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const response = await request(app)
                .get('/partida/resumo/999')
                .expect(200);

            expect(response.body).toEqual([]);
        });
    });
});