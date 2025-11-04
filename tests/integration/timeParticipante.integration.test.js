import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import timeParticipanteRoutes from '../../src/routes/timeParticipante.routes.js';

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
app.use('/time-participante', timeParticipanteRoutes);

describe('Testes de Integração - TimeParticipante', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /time-participante', () => {
        it('deve adicionar jogador ao time com sucesso', async () => {
            const mockPartidaInfo = { partida_id: 1, usuario_criador_id: 123 };
            const mockParticipante = {
                id: 1,
                timeId: 1,
                jogadorId: 456,
                posicaoId: 1,
                gol: null,
                assistencia: null,
                defesa: null,
                cartaoAmarelo: null,
                cartaoVermelho: null
            };

            db.query
                .mockResolvedValueOnce({ rows: [mockPartidaInfo] })
                .mockResolvedValueOnce({ rows: [{ 1: 1 }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [mockParticipante] });

            const response = await request(app)
                .post('/time-participante')
                .send({
                    timeId: 1,
                    jogadorId: 456,
                    posicaoId: 1
                })
                .expect(201);

            expect(response.body).toEqual(mockParticipante);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO public.partida_jogo_time_participante'),
                [1, 456, 1]
            );
        });

        it('deve retornar 404 quando time não encontrado', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const response = await request(app)
                .post('/time-participante')
                .send({
                    timeId: 999,
                    jogadorId: 456,
                    posicaoId: 1
                })
                .expect(404);

            expect(response.body).toEqual({
                message: 'Time do jogo não encontrado.'
            });
        });

        it('deve retornar 403 quando usuário não é organizador', async () => {
            const mockPartidaInfo = { partida_id: 1, usuario_criador_id: 999 };

            db.query.mockResolvedValue({ rows: [mockPartidaInfo] });

            const response = await request(app)
                .post('/time-participante')
                .send({
                    timeId: 1,
                    jogadorId: 456,
                    posicaoId: 1
                })
                .expect(403);

            expect(response.body).toEqual({
                message: 'Apenas o organizador pode adicionar.'
            });
        });

        it('deve retornar 409 quando jogador não está na partida', async () => {
            const mockPartidaInfo = { partida_id: 1, usuario_criador_id: 123 };

            db.query
                .mockResolvedValueOnce({ rows: [mockPartidaInfo] })
                .mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .post('/time-participante')
                .send({
                    timeId: 1,
                    jogadorId: 456,
                    posicaoId: 1
                })
                .expect(409);

            expect(response.body).toEqual({
                message: 'Jogador não está cadastrado na partida.'
            });
        });

        it('deve retornar 409 quando jogador já está no time', async () => {
            const mockPartidaInfo = { partida_id: 1, usuario_criador_id: 123 };

            db.query
                .mockResolvedValueOnce({ rows: [mockPartidaInfo] })
                .mockResolvedValueOnce({ rows: [{ 1: 1 }] })
                .mockResolvedValueOnce({ rows: [{ 1: 1 }] });

            const response = await request(app)
                .post('/time-participante')
                .send({
                    timeId: 1,
                    jogadorId: 456,
                    posicaoId: 1
                })
                .expect(409);

            expect(response.body).toEqual({
                message: 'Jogador já está neste time.'
            });
        });
    });

    describe('PUT /time-participante/:timeParticipanteId', () => {
        it('deve atualizar estatísticas com sucesso', async () => {
            const mockParticipante = { id: 1, partida_jogo_time_id: 1 };
            const mockPartidaInfo = { partida_id: 1, usuario_criador_id: 123 };
            const mockAtualizado = {
                id: 1,
                timeId: 1,
                jogadorId: 456,
                posicaoId: 1,
                gol: 2,
                assistencia: 1,
                defesa: 0,
                cartaoAmarelo: 1,
                cartaoVermelho: 0
            };

            db.query
                .mockResolvedValueOnce({ rows: [mockParticipante] })
                .mockResolvedValueOnce({ rows: [mockPartidaInfo] })
                .mockResolvedValueOnce({ rows: [mockAtualizado] });

            const response = await request(app)
                .put('/time-participante/1')
                .send({
                    gol: 2,
                    assistencia: 1,
                    cartaoAmarelo: 1
                })
                .expect(200);

            expect(response.body).toEqual(mockAtualizado);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE public.partida_jogo_time_participante'),
                [2, 1, 1, 1]
            );
        });

        it('deve retornar 404 quando participante não encontrado', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const response = await request(app)
                .put('/time-participante/999')
                .send({ gol: 1 })
                .expect(404);

            expect(response.body).toEqual({
                message: 'Registro de jogador no time não encontrado.'
            });
        });

        it('deve retornar 403 quando usuário não é organizador', async () => {
            const mockParticipante = { id: 1, partida_jogo_time_id: 1 };
            const mockPartidaInfo = { partida_id: 1, usuario_criador_id: 999 };

            db.query
                .mockResolvedValueOnce({ rows: [mockParticipante] })
                .mockResolvedValueOnce({ rows: [mockPartidaInfo] });

            const response = await request(app)
                .put('/time-participante/1')
                .send({ gol: 1 })
                .expect(403);

            expect(response.body).toEqual({
                message: 'Apenas o organizador pode atualizar estatísticas.'
            });
        });
    });
});