import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificacaoModel } from '../src/models/notificacao.model.js';
import { NotificacaoService } from '../src/services/notificacao.service.js';
import { NotificacaoController } from '../src/controllers/notificacao.controller.js';

vi.mock('../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

vi.mock('../src/models/usuario.model.js', () => ({
    UsuarioModel: {
        getDeviceToken: vi.fn()
    }
}));

global.fetch = vi.fn();

import { db } from '../src/config/database.js';
import { UsuarioModel } from '../src/models/usuario.model.js';

describe('Testes do Módulo Notificação', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch.mockReset();
    });

    describe('NotificacaoModel', () => {
        describe('create', () => {
            it('deve criar notificação com sucesso', async () => {
                const mockNotificacao = {
                    id: 1,
                    usuario_id: 123,
                    mensagem: 'Nova notificação',
                    vista: false,
                    datahora_envio: '2024-01-01T10:00:00.000Z'
                };

                db.query.mockResolvedValue({ rows: [mockNotificacao] });

                const resultado = await NotificacaoModel.create({
                    usuario_id: 123,
                    mensagem: 'Nova notificação'
                });

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    [123, 'Nova notificação', false]
                );
                expect(resultado).toEqual(mockNotificacao);
            });

            it('deve definir vista como false por padrão', async () => {
                const mockNotificacao = {
                    id: 1,
                    usuario_id: 123,
                    mensagem: 'Teste',
                    vista: false,
                    datahora_envio: '2024-01-01T10:00:00.000Z'
                };

                db.query.mockResolvedValue({ rows: [mockNotificacao] });

                await NotificacaoModel.create({
                    usuario_id: 123,
                    mensagem: 'Teste'
                });

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('VALUES ($1, $2, $3, NOW())'),
                    [123, 'Teste', false]
                );
            });

            it('deve usar NOW() para datahora_envio', async () => {
                const mockNotificacao = {
                    id: 1,
                    usuario_id: 123,
                    mensagem: 'Teste',
                    vista: false,
                    datahora_envio: new Date().toISOString()
                };

                db.query.mockResolvedValue({ rows: [mockNotificacao] });

                const resultado = await NotificacaoModel.create({
                    usuario_id: 123,
                    mensagem: 'Teste'
                });

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('NOW()'),
                    expect.any(Array)
                );
                expect(resultado.datahora_envio).toBeDefined();
            });
        });

        describe('listByUsuario', () => {
            it('deve retornar notificações do usuário ordenadas por data', async () => {
                const mockNotificacoes = [
                    {
                        id: 2,
                        usuario_id: 123,
                        mensagem: 'Notificação mais recente',
                        vista: false,
                        datahora_envio: '2024-01-01T12:00:00.000Z'
                    },
                    {
                        id: 1,
                        usuario_id: 123,
                        mensagem: 'Notificação mais antiga',
                        vista: true,
                        datahora_envio: '2024-01-01T10:00:00.000Z'
                    }
                ];

                db.query.mockResolvedValue({ rows: mockNotificacoes });

                const resultado = await NotificacaoModel.listByUsuario(123);

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('ORDER BY n.datahora_envio DESC'),
                    [123]
                );
                expect(resultado).toEqual(mockNotificacoes);
            });

            it('deve retornar array vazio quando não há notificações', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await NotificacaoModel.listByUsuario(999);

                expect(resultado).toEqual([]);
            });

            it('deve filtrar apenas notificações do usuário específico', async () => {
                const mockNotificacoes = [
                    { id: 1, usuario_id: 123, mensagem: 'Teste 1' }
                ];

                db.query.mockResolvedValue({ rows: mockNotificacoes });

                await NotificacaoModel.listByUsuario(123);

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('WHERE n.usuario_id = $1'),
                    [123]
                );
            });
        });
    });

    describe('NotificacaoService', () => {
        describe('sendNotification', () => {
            it('deve enviar notificação push com sucesso', async () => {
                const mockDeviceToken = 'ExponentPushToken[xxxxxxxxxxxxxx]';
                const mockPushResponse = { data: [{ status: 'ok' }] };
                const mockNotificacao = {
                    id: 1,
                    usuario_id: 123,
                    mensagem: 'Teste de notificação',
                    vista: false
                };

                UsuarioModel.getDeviceToken.mockResolvedValue(mockDeviceToken);
                global.fetch.mockResolvedValue({
                    json: () => Promise.resolve(mockPushResponse)
                });
                vi.spyOn(NotificacaoModel, 'create').mockResolvedValue(mockNotificacao);

                const resultado = await NotificacaoService.sendNotification({
                    usuario_id: 123,
                    title: 'Título Teste',
                    body: 'Teste de notificação',
                    data: { tipo: 'teste' }
                });

                expect(UsuarioModel.getDeviceToken).toHaveBeenCalledWith(123);
                expect(global.fetch).toHaveBeenCalledWith(
                    'https://exp.host/--/api/v2/push/send',
                    expect.objectContaining({
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: expect.stringContaining(mockDeviceToken)
                    })
                );
                expect(NotificacaoModel.create).toHaveBeenCalledWith({
                    usuario_id: 123,
                    mensagem: 'Teste de notificação'
                });
                expect(resultado).toEqual(mockPushResponse);
            });

            it('deve incluir todos os campos necessários na requisição push', async () => {
                const mockDeviceToken = 'ExponentPushToken[test]';
                const mockPushResponse = { data: [{ status: 'ok' }] };

                UsuarioModel.getDeviceToken.mockResolvedValue(mockDeviceToken);
                global.fetch.mockResolvedValue({
                    json: () => Promise.resolve(mockPushResponse)
                });
                vi.spyOn(NotificacaoModel, 'create').mockResolvedValue({});

                await NotificacaoService.sendNotification({
                    usuario_id: 123,
                    title: 'Título',
                    body: 'Corpo da mensagem',
                    data: { tipo: 'convite', id: 456 }
                });

                const fetchCall = global.fetch.mock.calls[0];
                const requestBody = JSON.parse(fetchCall[1].body);

                expect(requestBody).toEqual({
                    to: mockDeviceToken,
                    sound: 'default',
                    title: 'Título',
                    body: 'Corpo da mensagem',
                    data: { tipo: 'convite', id: 456 },
                    icon: process.env.BASE_URL + '/assets/logo.png'
                });
            });
        });

        describe('listarPorUsuario', () => {
            it('deve retornar notificações do usuário', async () => {
                const mockNotificacoes = [
                    { id: 1, usuario_id: 123, mensagem: 'Teste 1' },
                    { id: 2, usuario_id: 123, mensagem: 'Teste 2' }
                ];

                vi.spyOn(NotificacaoModel, 'listByUsuario').mockResolvedValue(mockNotificacoes);

                const resultado = await NotificacaoService.listarPorUsuario(123);

                expect(NotificacaoModel.listByUsuario).toHaveBeenCalledWith(123);
                expect(resultado).toEqual(mockNotificacoes);
            });

            it('deve retornar array vazio quando usuário não tem notificações', async () => {
                vi.spyOn(NotificacaoModel, 'listByUsuario').mockResolvedValue([]);

                const resultado = await NotificacaoService.listarPorUsuario(999);

                expect(resultado).toEqual([]);
            });
        });
    });

    describe('NotificacaoController', () => {
        let req, res;

        beforeEach(() => {
            req = {
                params: {}
            };
            res = {
                json: vi.fn(),
                status: vi.fn().mockReturnThis()
            };
        });

        describe('listarPorUsuario', () => {
            it('deve listar notificações do usuário com sucesso', async () => {
                const mockNotificacoes = [
                    {
                        id: 1,
                        usuario_id: 123,
                        mensagem: 'Você foi convidado para uma partida',
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

                req.params.usuarioId = '123';
                vi.spyOn(NotificacaoService, 'listarPorUsuario').mockResolvedValue(mockNotificacoes);

                await NotificacaoController.listarPorUsuario(req, res);

                expect(NotificacaoService.listarPorUsuario).toHaveBeenCalledWith(123);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith(mockNotificacoes);
            });

            it('deve retornar array vazio quando usuário não tem notificações', async () => {
                req.params.usuarioId = '999';
                vi.spyOn(NotificacaoService, 'listarPorUsuario').mockResolvedValue([]);

                await NotificacaoController.listarPorUsuario(req, res);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith([]);
            });
        });
    });
});