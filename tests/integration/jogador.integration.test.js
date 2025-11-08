import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import jogadorRoutes from '../../src/routes/jogador.routes.js';

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

vi.mock('../../src/models/convite.model.js', () => ({
    ConviteModel: {
        getPartidaById: vi.fn()
    }
}));

import { db } from '../../src/config/database.js';
import { ConviteModel } from '../../src/models/convite.model.js';

describe('Testes de Integração das Rotas de Jogador', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/jogador', jogadorRoutes);
        vi.clearAllMocks();
        mockAuthUser = { id: 123, email: 'test@example.com' };
    });

    describe('POST /jogador/externo', () => {
        it('deve criar jogador externo com sucesso', async () => {
            const mockJogador = { 
                id: 1, 
                tipo: 'externo', 
                usuario_id: null, 
                nome: 'João Silva', 
            };

            db.query.mockResolvedValue({ rows: [mockJogador] });

            const response = await request(app)
                .post('/jogador/externo')
                .send({ nome: 'João Silva'})
                .expect(201);

            expect(response.body).toEqual(mockJogador);
            expect(db.query).toHaveBeenCalledWith(
                expect.any(String),
                ['João Silva', 123]
            );
        });

        it('deve retornar erro 400 quando nome não fornecido', async () => {
            await request(app)
                .post('/jogador/externo')
                .send({ posicao: 'Atacante' })
                .expect(400);
        });

        it('deve criar jogador externo sem posição', async () => {
            const mockJogador = { 
                id: 2, 
                tipo: 'externo', 
                usuario_id: null, 
                nome: 'Maria Santos', 
                posicao: null 
            };

            db.query.mockResolvedValue({ rows: [mockJogador] });

            const response = await request(app)
                .post('/jogador/externo')
                .send({ nome: 'Maria Santos' })
                .expect(201);

            expect(response.body).toEqual(mockJogador);
        });
    });

    describe('POST /jogador/externo/adicionar', () => {
        it('deve adicionar jogador externo existente à partida', async () => {
            const mockPartida = { id: 1, usuario_criador_id: 123 };
            const mockParticipante = { id: 1 };

            ConviteModel.getPartidaById.mockResolvedValue(mockPartida);
            db.query.mockResolvedValue({ rows: [mockParticipante] });

            const response = await request(app)
                .post('/jogador/externo/adicionar')
                .send({ partida_id: 1, jogador_id: 456 })
                .expect(201);

            expect(response.body).toEqual({ participante_id: 1, jogador_id: 456 });
        });

        it('deve retornar erro quando partida não encontrada', async () => {
            ConviteModel.getPartidaById.mockResolvedValue(null);

            await request(app)
                .post('/jogador/externo/adicionar')
                .send({ partida_id: 999, jogador_id: 456 })
                .expect(400);
        });
    });

    describe('GET /jogador/disponiveis/partida/:partidaId', () => {
        it('deve listar jogadores disponíveis para partida', async () => {
            const mockJogadores = [
                { 
                    id: 123, 
                    id_jogador: 1, 
                    nome: 'João Silva', 
                    foto: 'foto1.jpg', 
                    posicoes: ['Atacante', 'Meio-Campo'] 
                },
                { 
                    id: 456, 
                    id_jogador: 2, 
                    nome: 'Maria Santos', 
                    foto: 'foto2.jpg', 
                    posicoes: ['Zagueiro'] 
                }
            ];

            db.query.mockResolvedValue({ rows: mockJogadores });

            const response = await request(app)
                .get('/jogador/disponiveis/partida/1')
                .expect(200);

            expect(response.body).toEqual(mockJogadores);
        });

        it('deve filtrar jogadores por nome', async () => {
            const mockJogadores = [
                { 
                    id: 123, 
                    id_jogador: 1, 
                    nome: 'João Silva', 
                    foto: 'foto1.jpg', 
                    posicoes: ['Atacante'] 
                }
            ];

            db.query.mockResolvedValue({ rows: mockJogadores });

            const response = await request(app)
                .get('/jogador/disponiveis/partida/1?nome=João')
                .expect(200);

            expect(response.body).toEqual(mockJogadores);
        });

        it('deve retornar array vazio quando não há jogadores disponíveis', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const response = await request(app)
                .get('/jogador/disponiveis/partida/999')
                .expect(200);

            expect(response.body).toEqual([]);
        });
    });

    describe('GET /jogador/partida/:partidaId', () => {
        it('deve listar todos jogadores da partida', async () => {
            const mockJogadores = [
                { 
                    id: 1, 
                    nome: 'João Silva', 
                    foto: 'foto1.jpg', 
                    status: 'aceito', 
                    posicoes: ['Atacante'] 
                },
                { 
                    id: 2, 
                    nome: 'Maria Santos', 
                    foto: 'foto2.jpg', 
                    status: 'Inserido Manualmente', 
                    posicoes: ['Zagueiro'] 
                }
            ];

            db.query.mockResolvedValue({ rows: mockJogadores });

            const response = await request(app)
                .get('/jogador/partida/1')
                .expect(200);

            expect(response.body).toEqual(mockJogadores);
        });

        it('deve retornar array vazio quando não há jogadores na partida', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const response = await request(app)
                .get('/jogador/partida/999')
                .expect(200);

            expect(response.body).toEqual([]);
        });
    });
});