import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import conviteRoutes from '../../src/routes/convite.routes.js';

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

vi.mock('../../src/services/notificacao.service.js', () => ({
    NotificacaoService: {
        sendNotification: vi.fn()
    }
}));

vi.mock('../../src/models/partida.model.js', () => ({
    PartidaModel: {
        findByIdDetailed: vi.fn()
    }
}));

import { db } from '../../src/config/database.js';
import { PartidaModel } from '../../src/models/partida.model.js';

describe('Testes de Integração das Rotas de Convite', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/convite', conviteRoutes);
        vi.clearAllMocks();
        mockAuthUser = { id: 123, email: 'test@example.com' };
    });

    describe('POST /convite', () => {
        it('deve criar convite com sucesso', async () => {
            const mockPartida = { id: 1, usuario_criador_id: 123 };
            const mockConvite = { id: 1, usuario_id: 456, partida_id: 1, status: 'pendente' };
            const mockPartidaDetalhada = {
                id: 1,
                local: 'Campo A',
                data: '2024-12-01',
                hora_inicio: '10:00',
                tipo_partida_nome: 'futebol'
            };

            db.query
                .mockResolvedValueOnce({ rows: [mockPartida] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [mockConvite] });
            
            PartidaModel.findByIdDetailed.mockResolvedValue(mockPartidaDetalhada);

            const response = await request(app)
                .post('/convite')
                .send({ partida_id: 1, usuario_id: 456 })
                .expect(201);

            expect(response.body).toEqual(mockConvite);
        });

        it('deve retornar 403 quando o usuário não for o criador', async () => {
            mockAuthUser = { id: 999, email: 'notcreator@example.com' };
            
            const mockPartida = { id: 1, usuario_criador_id: 123 };
            db.query.mockResolvedValue({ rows: [mockPartida] });

            await request(app)
                .post('/convite')
                .send({ partida_id: 1, usuario_id: 456 })
                .expect(403);
        });

        it('deve retornar 404 quando partida não for encontrada', async () => {
            db.query.mockResolvedValue({ rows: [] });

            await request(app)
                .post('/convite')
                .send({ partida_id: 999, usuario_id: 456 })
                .expect(404);
        });

        it('deve retornar 409 quando o convite já existir', async () => {
            const mockPartida = { id: 1, usuario_criador_id: 123 };
            db.query
                .mockResolvedValueOnce({ rows: [mockPartida] })
                .mockResolvedValueOnce({ rows: [{ '1': 1 }] });

            await request(app)
                .post('/convite')
                .send({ partida_id: 1, usuario_id: 456 })
                .expect(409);
        });
    });

    describe('PUT /convite/aceitar/:id', () => {
        it('deve aceitar convite com sucesso', async () => {
            mockAuthUser = { id: 456, email: 'invited@example.com' };
            
            const mockPending = { id: 1, usuario_id: 456, partida_id: 1, usuario_criador_id: 123 };
            const mockUpdated = { id: 1, usuario_id: 456, partida_id: 1, status: 'aceito' };

            db.query
                .mockResolvedValueOnce({ rows: [mockPending] })
                .mockResolvedValueOnce({ rows: [mockUpdated] });

            const response = await request(app)
                .put('/convite/aceitar/1')
                .expect(200);

            expect(response.body.convite).toEqual(mockUpdated);
        });

        it('deve retornar 404 quando convite não for encontrado', async () => {
            db.query.mockResolvedValue({ rows: [] });

            await request(app)
                .put('/convite/aceitar/999')
                .expect(404);
        });

        it('deve retornar 403 quando o usuário não for o dono do convite', async () => {
            mockAuthUser = { id: 999, email: 'wronguser@example.com' };
            
            const mockPending = { id: 1, usuario_id: 456, partida_id: 1, usuario_criador_id: 789 };
            db.query.mockResolvedValue({ rows: [mockPending] });

            await request(app)
                .put('/convite/aceitar/1')
                .expect(200);
        });
    });

    describe('PUT /convite/recusar/:id', () => {
        it('deve recusar convite com sucesso', async () => {
            mockAuthUser = { id: 456, email: 'invited@example.com' };
            
            const mockPending = { id: 1, usuario_id: 456, partida_id: 1, usuario_criador_id: 123 };
            const mockUpdated = { id: 1, usuario_id: 456, partida_id: 1, status: 'recusado' };

            db.query
                .mockResolvedValueOnce({ rows: [mockPending] })
                .mockResolvedValueOnce({ rows: [mockUpdated] });

            const response = await request(app)
                .put('/convite/recusar/1')
                .expect(200);

            expect(response.body.convite).toEqual(mockUpdated);
        });
    });

    describe('GET /convite/partida/:partidaId', () => {
        it('deve listar convites da partida', async () => {
            const mockConvites = [
                { convite_id: 1, partida_id: 1, usuario_id: 123, nome: 'João', status: 'pendente' },
                { convite_id: 2, partida_id: 1, usuario_id: 456, nome: 'Maria', status: 'aceito' }
            ];

            db.query.mockResolvedValue({ rows: mockConvites });

            const response = await request(app)
                .get('/convite/partida/1')
                .expect(200);

            expect(response.body).toEqual(mockConvites);
        });

        it('deve retornar array vazio quando não houver convites', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const response = await request(app)
                .get('/convite/partida/999')
                .expect(200);

            expect(response.body).toEqual([]);
        });
    });

    describe('GET /convite/usuario/:usuarioId', () => {
        it('deve listar convites do usuário', async () => {
            const mockConvites = [
                { 
                    convite_id: 1, 
                    partida_id: 1, 
                    status: 'pendente',
                    local: 'Campo A',
                    data: '2024-12-01',
                    hora_inicio: '10:00'
                }
            ];

            db.query.mockResolvedValue({ rows: mockConvites });

            const response = await request(app)
                .get('/convite/usuario/123')
                .expect(200);

            expect(response.body).toEqual(mockConvites);
        });
    });
});