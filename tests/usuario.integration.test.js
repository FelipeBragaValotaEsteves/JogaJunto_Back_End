import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import usuarioRoutes from '../src/routes/usuario.routes.js';
import path from 'path';

vi.mock('../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

vi.mock('../src/models/usuarioPosicao.model.js', () => ({
    UsuarioPosicaoModel: {
        getByUsuarioId: vi.fn(),
        addMany: vi.fn(),
        removeMany: vi.fn()
    }
}));

vi.mock('../src/services/auth.service.js', () => ({
    AuthService: {
        changePassword: vi.fn()
    }
}));

vi.mock('../src/middlewares/auth.middleware.js', () => ({
    requireAuth: (req, res, next) => {
        req.user = { id: 123, nome: 'Usuário Teste' };
        next();
    }
}));

import { db } from '../src/config/database.js';
import { UsuarioPosicaoModel } from '../src/models/usuarioPosicao.model.js';
import { AuthService } from '../src/services/auth.service.js';

const app = express();
app.use(express.json());
app.use('/usuario', usuarioRoutes);

describe('Testes de Integração - Usuario', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.BASE_URL = 'http://localhost:3000';
    });

    describe('GET /usuario/me', () => {
        it('deve retornar dados do usuário autenticado', async () => {
            const mockUsuario = {
                id: 123,
                nome: 'João Silva',
                email: 'joao@teste.com',
                img: 'avatar.jpg',
                criado_em: '2024-01-01T10:00:00.000Z'
            };

            const mockPosicoes = [
                { id: 1, nome: 'Goleiro' },
                { id: 2, nome: 'Zagueiro' }
            ];

            db.query
                .mockResolvedValueOnce({ rows: [mockUsuario] })
                .mockResolvedValueOnce({ rows: mockPosicoes });

            const response = await request(app)
                .get('/usuario/me')
                .expect(200);

            expect(response.body).toEqual({
                ...mockUsuario,
                posicoes: mockPosicoes,
                imgUrl: 'http://localhost:3000/uploads/avatar.jpg'
            });
        });

        it('deve retornar imgUrl null quando não há imagem', async () => {
            const mockUsuario = {
                id: 123,
                nome: 'João Silva',
                email: 'joao@teste.com',
                img: null
            };

            db.query
                .mockResolvedValueOnce({ rows: [mockUsuario] })
                .mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .get('/usuario/me')
                .expect(200);

            expect(response.body.imgUrl).toBeNull();
        });
    });

    describe('PATCH /usuario/me', () => {
        it('deve atualizar perfil básico com sucesso', async () => {
            const mockUsuarioAtualizado = {
                id: 123,
                nome: 'João Atualizado',
                email: 'joao.novo@teste.com',
                posicoes: []
            };

            vi.mocked(UsuarioPosicaoModel.getByUsuarioId).mockResolvedValue([]);
            db.query
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [mockUsuarioAtualizado] })
                .mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .patch('/usuario/me')
                .send({
                    name: 'João Atualizado',
                    email: 'joao.novo@teste.com'
                })
                .expect(200);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE usuario'),
                ['João Atualizado', 'joao.novo@teste.com', 123]
            );
        });

        it('deve atualizar perfil com posições', async () => {
            const mockUsuario = { id: 123, nome: 'João' };
            const mockPosicoesAtuais = [{ posicao_id: 1 }];

            vi.mocked(UsuarioPosicaoModel.getByUsuarioId).mockResolvedValue(mockPosicoesAtuais);
            vi.mocked(UsuarioPosicaoModel.addMany).mockResolvedValue();
            vi.mocked(UsuarioPosicaoModel.removeMany).mockResolvedValue();

            db.query
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [mockUsuario] })
                .mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .patch('/usuario/me')
                .send({
                    name: 'João',
                    positions: JSON.stringify([2, 3])
                })
                .expect(200);

            expect(UsuarioPosicaoModel.addMany).toHaveBeenCalledWith(123, [2, 3]);
            expect(UsuarioPosicaoModel.removeMany).toHaveBeenCalledWith(123, [1]);
        });

        it('deve funcionar com upload de arquivo', async () => {
            const mockUsuario = { id: 123, nome: 'João' };

            db.query
                .mockResolvedValueOnce({ rows: [mockUsuario] })
                .mockResolvedValueOnce({ rows: [] });

            const imagePath = path.resolve('tests/fixtures/test-image.jpg');

            await request(app)
                .patch('/usuario/me')
                .field('name', 'João')
                .attach('img', Buffer.from('fake-image'), 'test.jpg')
                .expect(200);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE usuario'),
                expect.arrayContaining(['João'])
            );
        });
    });

    describe('PATCH /usuario/me/password', () => {
        it('deve alterar senha com sucesso', async () => {
            const mockResult = { success: true, message: 'Senha alterada com sucesso' };
            vi.mocked(AuthService.changePassword).mockResolvedValue(mockResult);

            const response = await request(app)
                .patch('/usuario/me/password')
                .send({
                    senha_atual: 'senha123',
                    nova_senha: 'nova456'
                })
                .expect(200);

            expect(AuthService.changePassword).toHaveBeenCalledWith({
                userId: 123,
                senha_atual: 'senha123',
                nova_senha: 'nova456'
            });
            expect(response.body).toEqual(mockResult);
        });
    });

    describe('DELETE /usuario/me', () => {
        it('deve excluir conta do usuário', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const response = await request(app)
                .delete('/usuario/me')
                .expect(200);

            expect(db.query).toHaveBeenCalledWith(
                'DELETE FROM usuario WHERE id = $1',
                [123]
            );
            expect(response.body).toEqual({ ok: true });
        });
    });

    describe('Autenticação', () => {
        it('deve funcionar com usuário autenticado em todas as rotas', async () => {
            const mockUsuario = { id: 123, nome: 'João' };

            db.query.mockResolvedValue({ rows: [mockUsuario] });

            await request(app)
                .get('/usuario/me')
                .expect(200);

            await request(app)
                .patch('/usuario/me')
                .send({ name: 'Novo Nome' })
                .expect(200);

            const mockAuthResult = { success: true };
            vi.mocked(AuthService.changePassword).mockResolvedValue(mockAuthResult);

            await request(app)
                .patch('/usuario/me/password')
                .send({
                    senha_atual: 'senha123',
                    nova_senha: 'nova456'
                })
                .expect(200);

            await request(app)
                .delete('/usuario/me')
                .expect(200);
        });

        it('deve validar estrutura de dados retornados', async () => {
            const mockUsuario = {
                id: 123,
                nome: 'João Silva',
                email: 'joao@teste.com',
                img: 'avatar.jpg',
                criado_em: '2024-01-01T10:00:00.000Z'
            };

            const mockPosicoes = [
                { id: 1, nome: 'Goleiro' }
            ];

            db.query
                .mockResolvedValueOnce({ rows: [mockUsuario] })
                .mockResolvedValueOnce({ rows: mockPosicoes });

            const response = await request(app)
                .get('/usuario/me')
                .expect(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('nome');
            expect(response.body).toHaveProperty('email');
            expect(response.body).toHaveProperty('posicoes');
            expect(response.body).toHaveProperty('imgUrl');
            expect(Array.isArray(response.body.posicoes)).toBe(true);
        });
    });
});