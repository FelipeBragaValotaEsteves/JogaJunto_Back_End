import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import notificacaoRoutes from '../../src/routes/notificacao.routes.js';

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

vi.mock('../../src/models/usuario.model.js', () => ({
    UsuarioModel: {
        getDeviceToken: vi.fn()
    }
}));

global.fetch = vi.fn();

import { db } from '../../src/config/database.js';

describe('Testes de Integração das Rotas de Notificação', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/notificacao', notificacaoRoutes);
        vi.clearAllMocks();
        mockAuthUser = { id: 123, email: 'test@example.com' };
        global.fetch.mockReset();
    });

    describe('GET /notificacao/usuario/:usuarioId', () => {
        it('deve listar notificações do usuário com sucesso', async () => {
            const mockNotificacoes = [
                {
                    id: 1,
                    usuario_id: 123,
                    mensagem: 'Você foi convidado para uma partida de futebol',
                    vista: false,
                    datahora_envio: '2024-01-01T10:00:00.000Z'
                },
                {
                    id: 2,
                    usuario_id: 123,
                    mensagem: 'Sua partida foi confirmada',
                    vista: true,
                    datahora_envio: '2024-01-01T09:00:00.000Z'
                }
            ];

            db.query.mockResolvedValue({ rows: mockNotificacoes });

            const response = await request(app)
                .get('/notificacao/usuario/123')
                .expect(200);

            expect(response.body).toEqual(mockNotificacoes);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('ORDER BY n.datahora_envio DESC'),
                [123]
            );
        });

        it('deve retornar array vazio quando usuário não tem notificações', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const response = await request(app)
                .get('/notificacao/usuario/999')
                .expect(200);

            expect(response.body).toEqual([]);
        });

        it('deve filtrar apenas notificações do usuário solicitado', async () => {
            const mockNotificacoes = [
                { id: 1, usuario_id: 123, mensagem: 'Para usuário 123' }
            ];

            db.query.mockResolvedValue({ rows: mockNotificacoes });

            await request(app)
                .get('/notificacao/usuario/123')
                .expect(200);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE n.usuario_id = $1'),
                [123]
            );
        });
    });
});