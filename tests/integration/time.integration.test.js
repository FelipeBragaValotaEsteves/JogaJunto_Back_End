import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import timeRoutes from '../../src/routes/time.routes.js';

vi.mock('../../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

vi.mock('../../src/models/jogo.model.js', () => ({
    JogoModel: {
        findJogoById: vi.fn(),
        getPartidaById: vi.fn()
    }
}));

vi.mock('../../src/middlewares/auth.middleware.js', () => ({
    requireAuth: (req, res, next) => {
        req.user = { id: 123, nome: 'Usuário Teste' };
        next();
    }
}));

import { db } from '../../src/config/database.js';
import { JogoModel } from '../../src/models/jogo.model.js';

const app = express();
app.use(express.json());
app.use('/time', timeRoutes);

describe('Testes de Integração - Time', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /time/jogo/:jogoId', () => {
        it('deve criar time com sucesso', async () => {
            const mockJogo = { id: 1, partida_id: 1 };
            const mockPartida = { id: 1, usuario_criador_id: 123 };
            const mockTime = {
                id: 1,
                partida_jogo_id: 1,
                nome: 'Time A'
            };

            vi.mocked(JogoModel.findJogoById).mockResolvedValue(mockJogo);
            vi.mocked(JogoModel.getPartidaById).mockResolvedValue(mockPartida);
            db.query.mockResolvedValue({ rows: [mockTime] });

            const response = await request(app)
                .post('/time/jogo/1')
                .send({ nome: 'Time A' })
                .expect(201);

            expect(response.body).toEqual(mockTime);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO partida_jogo_time'),
                [1, 'Time A']
            );
        });

        it('deve retornar 404 quando jogo não encontrado', async () => {
            vi.mocked(JogoModel.findJogoById).mockResolvedValue(null);

            const response = await request(app)
                .post('/time/jogo/999')
                .send({ nome: 'Time A' })
                .expect(404);

            expect(response.body).toEqual({ message: 'Jogo não encontrado.' });
        });

        it('deve retornar 403 quando usuário não é organizador', async () => {
            const mockJogo = { id: 1, partida_id: 1 };
            const mockPartida = { id: 1, usuario_criador_id: 456 };

            vi.mocked(JogoModel.findJogoById).mockResolvedValue(mockJogo);
            vi.mocked(JogoModel.getPartidaById).mockResolvedValue(mockPartida);

            const response = await request(app)
                .post('/time/jogo/1')
                .send({ nome: 'Time A' })
                .expect(403);

            expect(response.body).toEqual({ message: 'Apenas o organizador pode criar times.' });
        });

        it('deve retornar 500 quando há erro no banco', async () => {
            const mockJogo = { id: 1, partida_id: 1 };
            const mockPartida = { id: 1, usuario_criador_id: 123 };

            vi.mocked(JogoModel.findJogoById).mockResolvedValue(mockJogo);
            vi.mocked(JogoModel.getPartidaById).mockResolvedValue(mockPartida);
            db.query.mockRejectedValue(new Error('Erro no banco'));

            await request(app)
                .post('/time/jogo/1')
                .send({ nome: 'Time A' })
                .expect(500);
        });

        it('deve validar campos obrigatórios', async () => {
            const mockJogo = { id: 1, partida_id: 1 };
            const mockPartida = { id: 1, usuario_criador_id: 123 };

            vi.mocked(JogoModel.findJogoById).mockResolvedValue(mockJogo);
            vi.mocked(JogoModel.getPartidaById).mockResolvedValue(mockPartida);

            await request(app)
                .post('/time/jogo/1')
                .send({})
                .expect(500);
        });
    });

    describe('PUT /time/:timeId', () => {
        it('deve editar time com sucesso', async () => {
            const mockTime = { id: 1, partida_jogo_id: 1, nome: 'Time A' };
            const mockJogo = { id: 1, partida_id: 1 };
            const mockPartida = { id: 1, usuario_criador_id: 123 };
            const mockTimeAtualizado = { id: 1, partida_jogo_id: 1, nome: 'Time Editado' };

            db.query
                .mockResolvedValueOnce({ rows: [mockTime] })
                .mockResolvedValueOnce({ rows: [mockTimeAtualizado] });
            vi.mocked(JogoModel.findJogoById).mockResolvedValue(mockJogo);
            vi.mocked(JogoModel.getPartidaById).mockResolvedValue(mockPartida);

            const response = await request(app)
                .put('/time/1')
                .send({ nome: 'Time Editado' })
                .expect(200);

            expect(response.body).toEqual(mockTimeAtualizado);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE partida_jogo_time'),
                [1, 'Time Editado']
            );
        });

        it('deve retornar 404 quando time não encontrado', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const response = await request(app)
                .put('/time/999')
                .send({ nome: 'Novo Nome' })
                .expect(404);

            expect(response.body).toEqual({ message: 'Time não encontrado.' });
        });

        it('deve retornar 403 quando usuário não é organizador', async () => {
            const mockTime = { id: 1, partida_jogo_id: 1, nome: 'Time A' };
            const mockJogo = { id: 1, partida_id: 1 };
            const mockPartida = { id: 1, usuario_criador_id: 456 };

            db.query.mockResolvedValue({ rows: [mockTime] });
            vi.mocked(JogoModel.findJogoById).mockResolvedValue(mockJogo);
            vi.mocked(JogoModel.getPartidaById).mockResolvedValue(mockPartida);

            const response = await request(app)
                .put('/time/1')
                .send({ nome: 'Novo Nome' })
                .expect(403);

            expect(response.body).toEqual({ message: 'Apenas o organizador pode editar.' });
        });
    });

    describe('DELETE /time/:timeId', () => {
        it('deve excluir time com sucesso', async () => {
            const mockTime = { id: 1, partida_jogo_id: 1, nome: 'Time A' };
            const mockJogo = { id: 1, partida_id: 1 };
            const mockPartida = { id: 1, usuario_criador_id: 123 };

            db.query
                .mockResolvedValueOnce({ rows: [mockTime] })
                .mockResolvedValueOnce({ rows: [] });
            vi.mocked(JogoModel.findJogoById).mockResolvedValue(mockJogo);
            vi.mocked(JogoModel.getPartidaById).mockResolvedValue(mockPartida);

            const response = await request(app)
                .delete('/time/1')
                .expect(200);

            expect(response.body).toEqual({ message: 'Time excluído com sucesso.' });
            expect(db.query).toHaveBeenCalledWith(
                'DELETE FROM partida_jogo_time WHERE id = $1',
                [1]
            );
        });

        it('deve retornar 404 quando time não encontrado', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const response = await request(app)
                .delete('/time/999')
                .expect(404);

            expect(response.body).toEqual({ message: 'Time não encontrado.' });
        });

        it('deve retornar 403 quando usuário não é organizador', async () => {
            const mockTime = { id: 1, partida_jogo_id: 1, nome: 'Time A' };
            const mockJogo = { id: 1, partida_id: 1 };
            const mockPartida = { id: 1, usuario_criador_id: 456 };

            db.query.mockResolvedValue({ rows: [mockTime] });
            vi.mocked(JogoModel.findJogoById).mockResolvedValue(mockJogo);
            vi.mocked(JogoModel.getPartidaById).mockResolvedValue(mockPartida);

            const response = await request(app)
                .delete('/time/1')
                .expect(403);

            expect(response.body).toEqual({ message: 'Apenas o organizador pode excluir.' });
        });
    });
});