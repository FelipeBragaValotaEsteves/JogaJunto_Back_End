import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/config/env.js', () => ({
    env: {
        BASE_URL: 'http://localhost:3000'
    }
}));

vi.mock('../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

vi.mock('../src/models/usuarioPosicao.model.js');
vi.mock('../src/services/auth.service.js');

import { UsuarioModel } from '../src/models/usuario.model.js';
import { UsuarioService } from '../src/services/usuario.service.js';
import { UsuarioController } from '../src/controllers/usuario.controller.js';
import { UsuarioPosicaoModel } from '../src/models/usuarioPosicao.model.js';
import { AuthService } from '../src/services/auth.service.js';

import { db } from '../src/config/database.js';

describe('Testes do Módulo Usuario', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('UsuarioModel', () => {
        describe('create', () => {
            it('deve criar usuário com sucesso', async () => {
                const mockUsuario = {
                    id: 1,
                    nome: 'João Silva',
                    email: 'joao@teste.com',
                    criado_em: '2024-01-01T10:00:00.000Z'
                };

                db.query.mockResolvedValue({ rows: [mockUsuario] });

                const resultado = await UsuarioModel.create({
                    name: 'João Silva',
                    email: 'joao@teste.com',
                    password_hash: 'hash123'
                });

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('INSERT INTO usuario'),
                    ['João Silva', 'joao@teste.com', 'hash123']
                );
                expect(resultado).toEqual(mockUsuario);
            });

            it('deve retornar dados sem senha_hash', async () => {
                const mockUsuario = {
                    id: 1,
                    nome: 'João Silva',
                    email: 'joao@teste.com',
                    criado_em: '2024-01-01T10:00:00.000Z'
                };

                db.query.mockResolvedValue({ rows: [mockUsuario] });

                const resultado = await UsuarioModel.create({
                    name: 'João Silva',
                    email: 'joao@teste.com',
                    password_hash: 'hash123'
                });

                expect(resultado).not.toHaveProperty('senha_hash');
                expect(resultado).toHaveProperty('nome');
                expect(resultado).toHaveProperty('email');
            });
        });

        describe('findByEmail', () => {
            it('deve encontrar usuário por email', async () => {
                const mockUsuario = {
                    id: 1,
                    nome: 'João Silva',
                    email: 'joao@teste.com',
                    senha_hash: 'hash123'
                };

                db.query.mockResolvedValue({ rows: [mockUsuario] });

                const resultado = await UsuarioModel.findByEmail('joao@teste.com');

                expect(db.query).toHaveBeenCalledWith(
                    'SELECT * FROM usuario WHERE email = $1',
                    ['joao@teste.com']
                );
                expect(resultado).toEqual(mockUsuario);
            });

            it('deve retornar null quando usuário não encontrado', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await UsuarioModel.findByEmail('naoexiste@teste.com');

                expect(resultado).toBeNull();
            });
        });

        describe('findById', () => {
            it('deve encontrar usuário com posições', async () => {
                const mockUsuario = {
                    id: 1,
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

                const resultado = await UsuarioModel.findById(1);

                expect(db.query).toHaveBeenNthCalledWith(1,
                    expect.stringContaining('SELECT id, nome, email, img, criado_em'),
                    [1]
                );
                expect(db.query).toHaveBeenNthCalledWith(2,
                    expect.stringContaining('FROM usuario_posicao up'),
                    [1]
                );
                expect(resultado).toEqual({
                    ...mockUsuario,
                    posicoes: mockPosicoes
                });
            });

            it('deve retornar null quando usuário não encontrado', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await UsuarioModel.findById(999);

                expect(resultado).toBeNull();
            });

            it('deve retornar usuário sem posições quando não tem', async () => {
                const mockUsuario = {
                    id: 1,
                    nome: 'João Silva',
                    email: 'joao@teste.com'
                };

                db.query
                    .mockResolvedValueOnce({ rows: [mockUsuario] })
                    .mockResolvedValueOnce({ rows: [] });

                const resultado = await UsuarioModel.findById(1);

                expect(resultado).toEqual({
                    ...mockUsuario,
                    posicoes: []
                });
            });
        });

        describe('findWithHashById', () => {
            it('deve encontrar usuário com hash da senha', async () => {
                const mockUsuario = {
                    id: 1,
                    nome: 'João Silva',
                    email: 'joao@teste.com',
                    senha_hash: 'hash123'
                };

                db.query.mockResolvedValue({ rows: [mockUsuario] });

                const resultado = await UsuarioModel.findWithHashById(1);

                expect(db.query).toHaveBeenCalledWith(
                    'SELECT * FROM usuario WHERE id = $1',
                    [1]
                );
                expect(resultado).toEqual(mockUsuario);
                expect(resultado).toHaveProperty('senha_hash');
            });

            it('deve retornar null quando não encontrado', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await UsuarioModel.findWithHashById(999);

                expect(resultado).toBeNull();
            });
        });

        describe('update', () => {
            it('deve atualizar nome, email e img', async () => {
                db.query.mockResolvedValue({ rows: [] });

                await UsuarioModel.update(1, {
                    name: 'João Atualizado',
                    email: 'joao.novo@teste.com',
                    img: 'nova-foto.jpg'
                });

                expect(db.query).toHaveBeenCalledWith(
                    'UPDATE usuario SET nome = $1, email = $2, img = $3 WHERE id = $4',
                    ['João Atualizado', 'joao.novo@teste.com', 'nova-foto.jpg', 1]
                );
            });

            it('deve atualizar apenas campos fornecidos', async () => {
                db.query.mockResolvedValue({ rows: [] });

                await UsuarioModel.update(1, { name: 'Novo Nome' });

                expect(db.query).toHaveBeenCalledWith(
                    'UPDATE usuario SET nome = $1 WHERE id = $2',
                    ['Novo Nome', 1]
                );
            });

            it('deve retornar undefined quando não há campos para atualizar', async () => {
                const resultado = await UsuarioModel.update(1, {});

                expect(resultado).toBeUndefined();
                expect(db.query).not.toHaveBeenCalled();
            });
        });

        describe('updatePassword', () => {
            it('deve atualizar senha com sucesso', async () => {
                const mockUsuario = { id: 1 };
                db.query.mockResolvedValue({ rows: [mockUsuario] });

                const resultado = await UsuarioModel.updatePassword(1, 'novo-hash');

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('UPDATE usuario SET senha_hash'),
                    ['novo-hash', 1]
                );
                expect(resultado).toEqual(mockUsuario);
            });

            it('deve retornar null quando usuário não encontrado', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await UsuarioModel.updatePassword(999, 'novo-hash');

                expect(resultado).toBeNull();
            });
        });

        describe('delete', () => {
            it('deve excluir usuário', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await UsuarioModel.delete(1);

                expect(db.query).toHaveBeenCalledWith(
                    'DELETE FROM usuario WHERE id = $1',
                    [1]
                );
                expect(resultado).toEqual({ ok: true });
            });
        });

        describe('updateDeviceToken', () => {
            it('deve atualizar token do dispositivo', async () => {
                const mockUsuario = { id: 1, device_token: 'token123' };
                db.query.mockResolvedValue({ rows: [mockUsuario] });

                const resultado = await UsuarioModel.updateDeviceToken(1, 'token123');

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('UPDATE usuario'),
                    ['token123', 1]
                );
                expect(resultado).toEqual(mockUsuario);
            });

            it('deve retornar null quando usuário não encontrado', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await UsuarioModel.updateDeviceToken(999, 'token123');

                expect(resultado).toBeNull();
            });
        });

        describe('getDeviceToken', () => {
            it('deve retornar token do dispositivo', async () => {
                db.query.mockResolvedValue({ rows: [{ device_token: 'token123' }] });

                const resultado = await UsuarioModel.getDeviceToken(1);

                expect(db.query).toHaveBeenCalledWith(
                    'SELECT device_token FROM usuario WHERE id = $1',
                    [1]
                );
                expect(resultado).toBe('token123');
            });

            it('deve retornar null quando não há token', async () => {
                db.query.mockResolvedValue({ rows: [{ device_token: null }] });

                const resultado = await UsuarioModel.getDeviceToken(1);

                expect(resultado).toBeNull();
            });

            it('deve retornar null quando usuário não encontrado', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await UsuarioModel.getDeviceToken(999);

                expect(resultado).toBeNull();
            });
        });
    });

    describe('UsuarioService', () => {
        describe('updateProfile', () => {
            it('deve atualizar perfil completo', async () => {
                const mockUsuarioAtualizado = {
                    id: 1,
                    nome: 'João Atualizado',
                    email: 'joao.novo@teste.com',
                    posicoes: [{ id: 1, nome: 'Goleiro' }]
                };

                const mockPosicoesAtuais = [{ posicao_id: 2 }];

                vi.spyOn(UsuarioModel, 'update').mockResolvedValue();
                vi.mocked(UsuarioPosicaoModel.getByUsuarioId).mockResolvedValue(mockPosicoesAtuais);
                vi.mocked(UsuarioPosicaoModel.addMany).mockResolvedValue();
                vi.mocked(UsuarioPosicaoModel.removeMany).mockResolvedValue();
                vi.spyOn(UsuarioModel, 'findById').mockResolvedValue(mockUsuarioAtualizado);

                const resultado = await UsuarioService.updateProfile(1, {
                    name: 'João Atualizado',
                    email: 'joao.novo@teste.com',
                    img: 'foto.jpg',
                    positions: [1, 3]
                });

                expect(UsuarioModel.update).toHaveBeenCalledWith(1, {
                    name: 'João Atualizado',
                    email: 'joao.novo@teste.com',
                    img: 'foto.jpg'
                });
                expect(UsuarioPosicaoModel.addMany).toHaveBeenCalledWith(1, [1, 3]);
                expect(UsuarioPosicaoModel.removeMany).toHaveBeenCalledWith(1, [2]);
                expect(resultado).toEqual(mockUsuarioAtualizado);
            });

            it('deve atualizar apenas dados básicos quando não há posições', async () => {
                const mockUsuario = { id: 1, nome: 'João' };

                vi.spyOn(UsuarioModel, 'update').mockResolvedValue();
                vi.spyOn(UsuarioModel, 'findById').mockResolvedValue(mockUsuario);

                const resultado = await UsuarioService.updateProfile(1, {
                    name: 'João Atualizado'
                });

                expect(UsuarioModel.update).toHaveBeenCalledWith(1, {
                    name: 'João Atualizado'
                });
                expect(UsuarioPosicaoModel.getByUsuarioId).not.toHaveBeenCalled();
                expect(resultado).toEqual(mockUsuario);
            });

            it('deve gerenciar posições quando apenas posições são fornecidas', async () => {
                const mockUsuario = { id: 1, posicoes: [{ id: 1 }] };
                const mockPosicoesAtuais = [{ posicao_id: 2 }, { posicao_id: 3 }];

                vi.mocked(UsuarioPosicaoModel.getByUsuarioId).mockResolvedValue(mockPosicoesAtuais);
                vi.mocked(UsuarioPosicaoModel.addMany).mockResolvedValue();
                vi.mocked(UsuarioPosicaoModel.removeMany).mockResolvedValue();
                vi.spyOn(UsuarioModel, 'findById').mockResolvedValue(mockUsuario);

                await UsuarioService.updateProfile(1, {
                    positions: [1, 2]
                });

                expect(UsuarioModel.update).not.toHaveBeenCalled();
                expect(UsuarioPosicaoModel.addMany).toHaveBeenCalledWith(1, [1]);
                expect(UsuarioPosicaoModel.removeMany).toHaveBeenCalledWith(1, [3]);
            });

            it('deve não adicionar nem remover quando posições são iguais', async () => {
                const mockUsuario = { id: 1 };
                const mockPosicoesAtuais = [{ posicao_id: 1 }, { posicao_id: 2 }];

                vi.mocked(UsuarioPosicaoModel.getByUsuarioId).mockResolvedValue(mockPosicoesAtuais);
                vi.spyOn(UsuarioModel, 'findById').mockResolvedValue(mockUsuario);

                await UsuarioService.updateProfile(1, {
                    positions: [1, 2]
                });

                expect(UsuarioPosicaoModel.addMany).not.toHaveBeenCalled();
                expect(UsuarioPosicaoModel.removeMany).not.toHaveBeenCalled();
            });
        });

        describe('deleteOwn', () => {
            it('deve chamar UsuarioModel.delete', async () => {
                const mockResult = { ok: true };
                vi.spyOn(UsuarioModel, 'delete').mockResolvedValue(mockResult);

                const resultado = await UsuarioService.deleteOwn(1);

                expect(UsuarioModel.delete).toHaveBeenCalledWith(1);
                expect(resultado).toEqual(mockResult);
            });
        });
    });

    describe('UsuarioController', () => {
        let req, res, next;

        beforeEach(() => {
            req = {
                user: { id: 1 },
                body: {},
                file: null
            };
            res = {
                json: vi.fn(),
                status: vi.fn().mockReturnThis()
            };
            next = vi.fn();

            process.env.BASE_URL = 'http://localhost:3000';
        });

        describe('me', () => {
            it('deve retornar dados do usuário com URL da imagem', async () => {
                const mockUsuario = {
                    id: 1,
                    nome: 'João Silva',
                    email: 'joao@teste.com',
                    img: 'avatar.jpg',
                    posicoes: []
                };

                vi.spyOn(UsuarioModel, 'findById').mockResolvedValue(mockUsuario);

                await UsuarioController.me(req, res, next);

                expect(UsuarioModel.findById).toHaveBeenCalledWith(1);
                expect(res.json).toHaveBeenCalledWith({
                    ...mockUsuario,
                    imgUrl: 'http://localhost:3000/uploads/avatar.jpg'
                });
                expect(next).not.toHaveBeenCalled();
            });

            it('deve retornar imgUrl null quando não há imagem', async () => {
                const mockUsuario = {
                    id: 1,
                    nome: 'João Silva',
                    email: 'joao@teste.com',
                    img: null,
                    posicoes: []
                };

                vi.spyOn(UsuarioModel, 'findById').mockResolvedValue(mockUsuario);

                await UsuarioController.me(req, res, next);

                expect(res.json).toHaveBeenCalledWith({
                    ...mockUsuario,
                    imgUrl: null
                });
            });
        });

        describe('updateMe', () => {
            it('deve atualizar perfil com sucesso', async () => {
                const mockUsuarioAtualizado = {
                    id: 1,
                    nome: 'João Atualizado',
                    email: 'joao.novo@teste.com'
                };

                req.body = {
                    name: 'João Atualizado',
                    email: 'joao.novo@teste.com',
                    positions: '[1, 2]'
                };
                req.file = { filename: 'nova-foto.jpg' };

                vi.spyOn(UsuarioService, 'updateProfile').mockResolvedValue(mockUsuarioAtualizado);

                await UsuarioController.updateMe(req, res, next);

                expect(UsuarioService.updateProfile).toHaveBeenCalledWith(1, {
                    name: 'João Atualizado',
                    email: 'joao.novo@teste.com',
                    img: 'nova-foto.jpg',
                    positions: [1, 2]
                });
                expect(res.json).toHaveBeenCalledWith(mockUsuarioAtualizado);
            });

            it('deve funcionar sem arquivo de imagem', async () => {
                const mockUsuario = { id: 1 };
                req.body = { name: 'João' };

                vi.spyOn(UsuarioService, 'updateProfile').mockResolvedValue(mockUsuario);

                await UsuarioController.updateMe(req, res, next);

                expect(UsuarioService.updateProfile).toHaveBeenCalledWith(1, {
                    name: 'João',
                    img: null,
                    positions: []
                });
            });

            it('deve tratar JSON inválido em positions', async () => {
                const mockUsuario = { id: 1 };
                req.body = {
                    name: 'João',
                    positions: 'json-inválido'
                };

                vi.spyOn(UsuarioService, 'updateProfile').mockResolvedValue(mockUsuario);

                await UsuarioController.updateMe(req, res, next);

                expect(UsuarioService.updateProfile).toHaveBeenCalledWith(1, {
                    name: 'João',
                    img: null,
                    positions: []
                });
            });

            it('deve tratar positions não array', async () => {
                const mockUsuario = { id: 1 };
                req.body = {
                    name: 'João',
                    positions: '"string"'
                };

                vi.spyOn(UsuarioService, 'updateProfile').mockResolvedValue(mockUsuario);

                await UsuarioController.updateMe(req, res, next);

                expect(UsuarioService.updateProfile).toHaveBeenCalledWith(1, {
                    name: 'João',
                    img: null,
                    positions: []
                });
            });
        });

        describe('changePassword', () => {
            it('deve alterar senha com sucesso', async () => {
                const mockResult = { success: true };
                req.body = {
                    senha_atual: 'senha123',
                    nova_senha: 'nova456'
                };

                vi.mocked(AuthService.changePassword).mockResolvedValue(mockResult);

                await UsuarioController.changePassword(req, res, next);

                expect(AuthService.changePassword).toHaveBeenCalledWith({
                    userId: 1,
                    senha_atual: 'senha123',
                    nova_senha: 'nova456'
                });
                expect(res.json).toHaveBeenCalledWith(mockResult);
            });

            it('deve chamar next quando validação falha', async () => {
                req.body = {
                    senha_atual: '123',
                    nova_senha: 'nova456'
                };

                await UsuarioController.changePassword(req, res, next);

                expect(next).toHaveBeenCalled();
                expect(res.json).not.toHaveBeenCalled();
            });
        });

        describe('deleteMe', () => {
            it('deve excluir usuário com sucesso', async () => {
                const mockResult = { ok: true };
                vi.spyOn(UsuarioService, 'deleteOwn').mockResolvedValue(mockResult);

                await UsuarioController.deleteMe(req, res, next);

                expect(UsuarioService.deleteOwn).toHaveBeenCalledWith(1);
                expect(res.json).toHaveBeenCalledWith(mockResult);
            });
        });
    });
});