import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConviteModel } from '../src/models/convite.model.js';
import { ConviteService } from '../src/services/convite.service.js';
import { ConviteController } from '../src/controllers/convite.controller.js';

vi.mock('../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

vi.mock('../src/services/notificacao.service.js', () => ({
    NotificacaoService: {
        sendNotification: vi.fn()
    }
}));

vi.mock('../src/models/partida.model.js', () => ({
    PartidaModel: {
        findByIdDetailed: vi.fn()
    }
}));

import { db } from '../src/config/database.js';
import { NotificacaoService } from '../src/services/notificacao.service.js';
import { PartidaModel } from '../src/models/partida.model.js';

describe('Testes do Módulo Convite', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Modelo: ConviteModel', () => {
        describe('getPartidaById (buscar partida por id)', () => {
            it('deve retornar a partida quando encontrada', async () => {
                const mockPartida = { id: 1, usuario_criador_id: 123 };
                db.query.mockResolvedValue({ rows: [mockPartida] });

                const result = await ConviteModel.getPartidaById(1);

                expect(db.query).toHaveBeenCalledWith(
                    'SELECT id, usuario_criador_id FROM public.partida WHERE id = $1',
                    [1]
                );
                expect(result).toEqual(mockPartida);
            });
        });

        describe('existsAny (verificar existência de convite)', () => {
            it('deve retornar true quando o convite existir', async () => {
                db.query.mockResolvedValue({ rows: [{ '1': 1 }] });

                const result = await ConviteModel.existsAny(1, 123);

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    [1, 123]
                );
                expect(result).toBe(true);
            });

            it('deve retornar false quando o convite não existir', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const result = await ConviteModel.existsAny(1, 123);

                expect(result).toBe(false);
            });
        });

        describe('create (criar convite)', () => {
            it('deve criar o convite e retorná-lo', async () => {
                const mockConvite = { id: 1, usuario_id: 123, partida_id: 1, status: 'pendente' };
                db.query.mockResolvedValue({ rows: [mockConvite] });

                const result = await ConviteModel.create({ partida_id: 1, usuario_id: 123, status: 'pendente' });

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    [123, 1, 'pendente']
                );
                expect(result).toEqual(mockConvite);
            });
        });

        describe('findPending (buscar convite pendente)', () => {
            it('deve retornar o convite pendente quando encontrado', async () => {
                const mockConvite = { id: 1, usuario_id: 123, partida_id: 1, status: 'pendente' };
                db.query.mockResolvedValue({ rows: [mockConvite] });

                const result = await ConviteModel.findPending(1, 123);

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    [1, 123]
                );
                expect(result).toEqual(mockConvite);
            });

            it('deve retornar null quando não houver convite pendente', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const result = await ConviteModel.findPending(1, 123);

                expect(result).toBeNull();
            });
        });

        describe('findPendingById (buscar convite pendente por id)', () => {
            it('deve retornar convite pendente com info da partida quando encontrado', async () => {
                const mockConvite = { 
                    id: 1, 
                    usuario_id: 123, 
                    partida_id: 1, 
                    status: 'pendente',
                    usuario_criador_id: 456
                };
                db.query.mockResolvedValue({ rows: [mockConvite] });

                const result = await ConviteModel.findPendingById(1);

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    [1]
                );
                expect(result).toEqual(mockConvite);
            });
        });

        describe('updateStatus (atualizar status do convite)', () => {
            it('deve atualizar o status do convite e retorná-lo', async () => {
                const mockConvite = { id: 1, usuario_id: 123, partida_id: 1, status: 'aceito' };
                db.query.mockResolvedValue({ rows: [mockConvite] });

                const result = await ConviteModel.updateStatus(1, 'aceito');

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    [1, 'aceito']
                );
                expect(result).toEqual(mockConvite);
            });
        });

        describe('ensureParticipante (garantir participante)', () => {
            it('deve retornar participante existente quando encontrado', async () => {
                const mockParticipante = { id: 1 };
                db.query.mockResolvedValueOnce({ rows: [mockParticipante] });

                const result = await ConviteModel.ensureParticipante({
                    partida_id: 1,
                    jogador_id: 123,
                    confirmado: true,
                    participou: false,
                    nota: null
                });

                expect(result).toEqual(mockParticipante);
            });

            it('deve criar novo participante quando não encontrado', async () => {
                const mockNewParticipante = { 
                    id: 2, 
                    partida_id: 1, 
                    jogador_id: 123, 
                    confirmado: true, 
                    participou: false, 
                    nota: null 
                };
                db.query.mockResolvedValueOnce({ rows: [] });
                db.query.mockResolvedValueOnce({ rows: [mockNewParticipante] });

                const result = await ConviteModel.ensureParticipante({
                    partida_id: 1,
                    jogador_id: 123,
                    confirmado: true,
                    participou: false,
                    nota: null
                });

                expect(result).toEqual(mockNewParticipante);
            });
        });

        describe('listByPartida (listar por partida)', () => {
            it('deve retornar convites da partida', async () => {
                const mockConvites = [
                    { convite_id: 1, partida_id: 1, usuario_id: 123, nome: 'João', imagem_url: 'url1', status: 'pendente' },
                    { convite_id: 2, partida_id: 1, usuario_id: 456, nome: 'Maria', imagem_url: 'url2', status: 'aceito' }
                ];
                db.query.mockResolvedValue({ rows: mockConvites });

                const result = await ConviteModel.listByPartida(1);

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    [1]
                );
                expect(result).toEqual(mockConvites);
            });
        });

        describe('listByUsuario (listar por usuário)', () => {
            it('deve retornar convites do usuário', async () => {
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

                const result = await ConviteModel.listByUsuario(123);

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    [123]
                );
                expect(result).toEqual(mockConvites);
            });
        });
    });

    describe('Serviço: ConviteService', () => {
        describe('criar', () => {
            it('deve criar convite quando válido', async () => {
                const mockPartida = { id: 1, usuario_criador_id: 123 };
                const mockConvite = { id: 1, usuario_id: 456, partida_id: 1, status: 'pendente' };

                vi.spyOn(ConviteModel, 'getPartidaById').mockResolvedValue(mockPartida);
                vi.spyOn(ConviteModel, 'existsAny').mockResolvedValue(false);
                vi.spyOn(ConviteModel, 'create').mockResolvedValue(mockConvite);

                const result = await ConviteService.criar({
                    partida_id: 1,
                    usuario_id: 456,
                    solicitante_id: 123
                });

                expect(result).toEqual(mockConvite);
            });

            it('deve retornar not_found quando a partida não existir', async () => {
                vi.spyOn(ConviteModel, 'getPartidaById').mockResolvedValue(null);

                const result = await ConviteService.criar({
                    partida_id: 999,
                    usuario_id: 456,
                    solicitante_id: 123
                });

                expect(result).toBe('not_found');
            });

            it('deve retornar forbidden quando o usuário não for o organizador', async () => {
                const mockPartida = { id: 1, usuario_criador_id: 123 };
                vi.spyOn(ConviteModel, 'getPartidaById').mockResolvedValue(mockPartida);

                const result = await ConviteService.criar({
                    partida_id: 1,
                    usuario_id: 456,
                    solicitante_id: 999
                });

                expect(result).toBe('forbidden');
            });

            it('deve retornar conflict quando o convite já existir', async () => {
                const mockPartida = { id: 1, usuario_criador_id: 123 };
                vi.spyOn(ConviteModel, 'getPartidaById').mockResolvedValue(mockPartida);
                vi.spyOn(ConviteModel, 'existsAny').mockResolvedValue(true);

                const result = await ConviteService.criar({
                    partida_id: 1,
                    usuario_id: 456,
                    solicitante_id: 123
                });

                expect(result).toBe('conflict');
            });
        });

        describe('aceitar', () => {
            it('deve aceitar convite quando válido', async () => {
                const mockPending = { id: 1, usuario_id: 123, partida_id: 1, usuario_criador_id: 456 };
                const mockUpdated = { id: 1, usuario_id: 123, partida_id: 1, status: 'aceito' };

                vi.spyOn(ConviteModel, 'findPendingById').mockResolvedValue(mockPending);
                vi.spyOn(ConviteModel, 'updateStatus').mockResolvedValue(mockUpdated);

                const result = await ConviteService.aceitar({ id: 1, authUserId: 123 });

                expect(result).toEqual({ convite: mockUpdated });
                expect(ConviteModel.updateStatus).toHaveBeenCalledWith(1, 'aceito');
            });

            it('deve retornar not_found quando o convite não existir', async () => {
                vi.spyOn(ConviteModel, 'findPendingById').mockResolvedValue(null);

                const result = await ConviteService.aceitar({ id: 999, authUserId: 123 });

                expect(result).toBe('not_found');
            });

            it('deve retornar forbidden quando o usuário não for o dono do convite', async () => {
                const mockPending = { id: 1, usuario_id: 456, partida_id: 1, usuario_criador_id: 789 };
                vi.spyOn(ConviteModel, 'findPendingById').mockResolvedValue(mockPending);

                const result = await ConviteService.aceitar({ id: 1, authUserId: 123 });

                expect(result).toBe('forbidden');
            });
        });

        describe('recusar', () => {
            it('deve recusar convite quando válido', async () => {
                const mockPending = { id: 1, usuario_id: 123, partida_id: 1, usuario_criador_id: 456 };
                const mockUpdated = { id: 1, usuario_id: 123, partida_id: 1, status: 'recusado' };

                vi.spyOn(ConviteModel, 'findPendingById').mockResolvedValue(mockPending);
                vi.spyOn(ConviteModel, 'updateStatus').mockResolvedValue(mockUpdated);

                const result = await ConviteService.recusar({ id: 1, authUserId: 123 });

                expect(result).toEqual({ convite: mockUpdated });
                expect(ConviteModel.updateStatus).toHaveBeenCalledWith(1, 'recusado');
            });
        });

        describe('cancelar', () => {
            it('deve cancelar convite quando válido', async () => {
                const mockPending = { id: 1, usuario_id: 456, partida_id: 1, usuario_criador_id: 123 };
                const mockUpdated = { id: 1, usuario_id: 456, partida_id: 1, status: 'cancelado' };

                vi.spyOn(ConviteModel, 'findPendingById').mockResolvedValue(mockPending);
                vi.spyOn(ConviteModel, 'updateStatus').mockResolvedValue(mockUpdated);

                const result = await ConviteService.cancelar({ id: 1, solicitanteId: 123 });

                expect(result).toEqual({ convite: mockUpdated });
                expect(ConviteModel.updateStatus).toHaveBeenCalledWith(1, 'cancelado');
            });

            it('deve retornar forbidden quando o usuário não for o organizador', async () => {
                const mockPending = { id: 1, usuario_id: 456, partida_id: 1, usuario_criador_id: 123 };
                vi.spyOn(ConviteModel, 'findPendingById').mockResolvedValue(mockPending);

                const result = await ConviteService.cancelar({ id: 1, solicitanteId: 999 });

                expect(result).toBe('forbidden');
            });
        });

        describe('listarPorPartida', () => {
            it('deve retornar convites da partida', async () => {
                const mockConvites = [{ convite_id: 1, usuario_id: 123 }];
                vi.spyOn(ConviteModel, 'listByPartida').mockResolvedValue(mockConvites);

                const result = await ConviteService.listarPorPartida({ partidaId: 1 });

                expect(result).toEqual(mockConvites);
                expect(ConviteModel.listByPartida).toHaveBeenCalledWith(1);
            });
        });

        describe('listarPorUsuario', () => {
            it('deve retornar convites do usuário', async () => {
                const mockConvites = [{ convite_id: 1, partida_id: 1 }];
                vi.spyOn(ConviteModel, 'listByUsuario').mockResolvedValue(mockConvites);

                const result = await ConviteService.listarPorUsuario(123);

                expect(result).toEqual(mockConvites);
                expect(ConviteModel.listByUsuario).toHaveBeenCalledWith(123);
            });
        });
    });

    describe('Controlador: ConviteController', () => {
        let req, res, next;

        beforeEach(() => {
            req = {
                user: { id: 123 },
                body: {},
                params: {}
            };
            res = {
                json: vi.fn(),
                status: vi.fn().mockReturnThis()
            };
            next = vi.fn();
        });

        describe('criar', () => {
            it('deve criar convite com sucesso', async () => {
                const mockConvite = { id: 1, usuario_id: 456, partida_id: 1, status: 'pendente' };
                const mockPartidaDetalhada = {
                    id: 1,
                    local: 'Campo A',
                    data: '2024-12-01',
                    hora_inicio: '10:00',
                    tipo_partida_nome: 'futebol'
                };

                req.body = { partida_id: 1, usuario_id: 456 };

                vi.spyOn(ConviteService, 'criar').mockResolvedValue(mockConvite);
                PartidaModel.findByIdDetailed.mockResolvedValue(mockPartidaDetalhada);

                await ConviteController.criar(req, res);

                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.json).toHaveBeenCalledWith(mockConvite);
                expect(NotificacaoService.sendNotification).toHaveBeenCalled();
            });

            it('deve retornar 403 quando proibido', async () => {
                req.body = { partida_id: 1, usuario_id: 456 };
                vi.spyOn(ConviteService, 'criar').mockResolvedValue('forbidden');

                await ConviteController.criar(req, res);

                expect(res.status).toHaveBeenCalledWith(403);
                expect(res.json).toHaveBeenCalledWith({ message: 'Apenas o organizador pode convidar.' });
            });

            it('deve retornar 409 em caso de conflito', async () => {
                req.body = { partida_id: 1, usuario_id: 456 };
                vi.spyOn(ConviteService, 'criar').mockResolvedValue('conflict');

                await ConviteController.criar(req, res);

                expect(res.status).toHaveBeenCalledWith(409);
                expect(res.json).toHaveBeenCalledWith({ message: 'Já existe convite para este usuário.' });
            });

            it('deve retornar 404 quando não encontrado', async () => {
                req.body = { partida_id: 999, usuario_id: 456 };
                vi.spyOn(ConviteService, 'criar').mockResolvedValue('not_found');

                await ConviteController.criar(req, res);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({ message: 'Partida não encontrada.' });
            });
        });

        describe('aceitar', () => {
            it('deve aceitar convite com sucesso', async () => {
                const mockResult = { convite: { id: 1, status: 'aceito' } };
                req.params.id = '1';
                vi.spyOn(ConviteService, 'aceitar').mockResolvedValue(mockResult);

                await ConviteController.aceitar(req, res);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith(mockResult);
            });

            it('deve retornar 404 quando o convite pendente não for encontrado', async () => {
                req.params.id = '999';
                vi.spyOn(ConviteService, 'aceitar').mockResolvedValue('not_found');

                await ConviteController.aceitar(req, res);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({ message: 'Convite pendente não encontrado.' });
            });
        });

        describe('recusar', () => {
            it('deve recusar convite com sucesso', async () => {
                const mockResult = { convite: { id: 1, status: 'recusado' } };
                req.params.id = '1';
                vi.spyOn(ConviteService, 'recusar').mockResolvedValue(mockResult);

                await ConviteController.recusar(req, res);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith(mockResult);
            });
        });

        describe('cancelar', () => {
            it('deve cancelar convite com sucesso', async () => {
                const mockResult = { convite: { id: 1, status: 'cancelado' } };
                req.params.id = '1';
                vi.spyOn(ConviteService, 'cancelar').mockResolvedValue(mockResult);

                await ConviteController.cancelar(req, res);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith(mockResult);
            });

            it('deve retornar 403 quando proibido', async () => {
                req.params.id = '1';
                vi.spyOn(ConviteService, 'cancelar').mockResolvedValue('forbidden');

                await ConviteController.cancelar(req, res);

                expect(res.status).toHaveBeenCalledWith(403);
                expect(res.json).toHaveBeenCalledWith({ message: 'Apenas o organizador pode cancelar.' });
            });
        });

        describe('listarPorPartida', () => {
            it('deve listar convites da partida', async () => {
                const mockConvites = [{ convite_id: 1, usuario_id: 123 }];
                req.params.partidaId = '1';
                vi.spyOn(ConviteService, 'listarPorPartida').mockResolvedValue(mockConvites);

                await ConviteController.listarPorPartida(req, res);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith(mockConvites);
            });
        });

        describe('listarPorUsuario', () => {
            it('deve listar convites do usuário', async () => {
                const mockConvites = [{ convite_id: 1, partida_id: 1 }];
                req.params.usuarioId = '123';
                vi.spyOn(ConviteService, 'listarPorUsuario').mockResolvedValue(mockConvites);

                await ConviteController.listarPorUsuario(req, res);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith(mockConvites);
            });
        });
    });
});