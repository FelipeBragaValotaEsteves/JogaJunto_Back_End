import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimeParticipanteModel } from '../src/models/timeParticipante.model.js';
import { TimeParticipanteService } from '../src/services/timeParticipante.service.js';
import { TimeParticipanteController } from '../src/controllers/timeParticipante.controller.js';

vi.mock('../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

import { db } from '../src/config/database.js';

describe('Testes do Módulo TimeParticipante', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('TimeParticipanteModel', () => {
        describe('getPartidaInfoByTimeId', () => {
            it('deve retornar informações da partida por time id', async () => {
                const mockPartidaInfo = {
                    partida_id: 1,
                    usuario_criador_id: 123
                };

                db.query.mockResolvedValue({ rows: [mockPartidaInfo] });

                const resultado = await TimeParticipanteModel.getPartidaInfoByTimeId(1);

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('JOIN partida_jogo j'),
                    [1]
                );
                expect(resultado).toEqual(mockPartidaInfo);
            });

            it('deve retornar null quando time não encontrado', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await TimeParticipanteModel.getPartidaInfoByTimeId(999);

                expect(resultado).toBeNull();
            });
        });

        describe('getPartidaInfoByTimeParticipanteId', () => {
            it('deve retornar informações da partida por time participante id', async () => {
                const mockPartidaInfo = {
                    partida_id: 1,
                    usuario_criador_id: 123
                };

                db.query.mockResolvedValue({ rows: [mockPartidaInfo] });

                const resultado = await TimeParticipanteModel.getPartidaInfoByTimeParticipanteId(1);

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('FROM partida_jogo_time_participante tp'),
                    [1]
                );
                expect(resultado).toEqual(mockPartidaInfo);
            });

            it('deve retornar null quando time participante não encontrado', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await TimeParticipanteModel.getPartidaInfoByTimeParticipanteId(999);

                expect(resultado).toBeNull();
            });
        });

        describe('jogadorEstaNaPartida', () => {
            it('deve retornar true quando jogador está na partida', async () => {
                db.query.mockResolvedValue({ rows: [{ 1: 1 }] });

                const resultado = await TimeParticipanteModel.jogadorEstaNaPartida(1, 123);

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('FROM partida_participante'),
                    [1, 123]
                );
                expect(resultado).toBe(true);
            });

            it('deve retornar false quando jogador não está na partida', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await TimeParticipanteModel.jogadorEstaNaPartida(1, 999);

                expect(resultado).toBe(false);
            });
        });

        describe('existsInTime', () => {
            it('deve retornar true quando jogador já está no time', async () => {
                db.query.mockResolvedValue({ rows: [{ 1: 1 }] });

                const resultado = await TimeParticipanteModel.existsInTime(1, 123);

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('FROM partida_jogo_time_participante'),
                    [1, 123]
                );
                expect(resultado).toBe(true);
            });

            it('deve retornar false quando jogador não está no time', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await TimeParticipanteModel.existsInTime(1, 999);

                expect(resultado).toBe(false);
            });
        });

        describe('insertTimeParticipante', () => {
            it('deve inserir participante no time com sucesso', async () => {
                const mockParticipante = {
                    id: 1,
                    timeId: 1,
                    partidaParticipanteId: 10,
                    posicaoId: null,
                    gol: null,
                    assistencia: null,
                    defesa: null,
                    cartaoAmarelo: null,
                    cartaoVermelho: null
                };

                db.query.mockResolvedValue({ rows: [mockParticipante] });

                const resultado = await TimeParticipanteModel.insertTimeParticipante({
                    timeId: 1,
                    partidaParticipanteId: 10
                });

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('INSERT INTO partida_jogo_time_participante'),
                    [1, 10]
                );
                expect(resultado).toEqual(mockParticipante);
            });

            it('deve inserir com estatísticas iniciais nulas', async () => {
                const mockParticipante = {
                    id: 1,
                    timeId: 1,
                    partidaParticipanteId: 15
                };

                db.query.mockResolvedValue({ rows: [mockParticipante] });

                await TimeParticipanteModel.insertTimeParticipante({
                    timeId: 1,
                    partidaParticipanteId: 15
                });

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('VALUES ($1, $2, NULL, NULL, NULL, NULL, NULL, NULL)'),
                    [1, 15]
                );
            });
        });

        describe('findTimeParticipanteById', () => {
            it('deve encontrar time participante por id', async () => {
                const mockParticipante = {
                    id: 1,
                    partida_jogo_time_id: 1,
                    jogador_id: 123,
                    posicao_id: 1,
                    gol: 2,
                    assistencia: 1,
                    defesa: 0,
                    cartao_amarelo: 0,
                    cartao_vermelho: 0
                };

                db.query.mockResolvedValue({ rows: [mockParticipante] });

                const resultado = await TimeParticipanteModel.findTimeParticipanteById(1);

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('FROM partida_jogo_time_participante'),
                    [1]
                );
                expect(resultado).toEqual(mockParticipante);
            });

            it('deve retornar null quando não encontrado', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await TimeParticipanteModel.findTimeParticipanteById(999);

                expect(resultado).toBeNull();
            });
        });

        describe('updateTimeParticipante', () => {
            it('deve atualizar estatísticas do participante', async () => {
                const mockAtualizado = {
                    id: 1,
                    timeId: 1,
                    jogadorId: 123,
                    posicaoId: 1,
                    gol: 2,
                    assistencia: 1,
                    defesa: 0,
                    cartaoAmarelo: 1,
                    cartaoVermelho: 0
                };

                db.query.mockResolvedValue({ rows: [mockAtualizado] });

                const resultado = await TimeParticipanteModel.updateTimeParticipante(1, {
                    gol: 2,
                    assistencia: 1,
                    cartao_amarelo: 1
                });

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('UPDATE partida_jogo_time_participante'),
                    [2, 1, 1, 1]
                );
                expect(resultado).toEqual(mockAtualizado);
            });

            it('deve retornar null quando não há campos para atualizar', async () => {
                const resultado = await TimeParticipanteModel.updateTimeParticipante(1, {});

                expect(resultado).toBeNull();
                expect(db.query).not.toHaveBeenCalled();
            });

            it('deve filtrar apenas campos permitidos', async () => {
                const mockAtualizado = { id: 1, gol: 1 };
                db.query.mockResolvedValue({ rows: [mockAtualizado] });

                await TimeParticipanteModel.updateTimeParticipante(1, {
                    gol: 1,
                    campo_nao_permitido: 'valor',
                    id: 999
                });

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('gol = $1'),
                    [1, 1]
                );
            });

            it('deve retornar null quando registro não encontrado', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await TimeParticipanteModel.updateTimeParticipante(999, {
                    gol: 1
                });

                expect(resultado).toBeNull();
            });
        });
    });

    describe('TimeParticipanteService', () => {
        describe('adicionarJogadorAoTime', () => {
            it('deve adicionar jogador ao time com sucesso', async () => {
                const mockPartidaInfo = { partida_id: 1, usuario_criador_id: 123 };
                const mockPartidaParticipanteId = 10;
                const mockParticipante = {
                    id: 1,
                    timeId: 1,
                    jogadorId: 456
                };

                vi.spyOn(TimeParticipanteModel, 'getPartidaInfoByTimeId').mockResolvedValue(mockPartidaInfo);
                vi.spyOn(TimeParticipanteModel, 'jogadorEstaNaPartida').mockResolvedValue(true);
                vi.spyOn(TimeParticipanteModel, 'existsInTime').mockResolvedValue(false);
                vi.spyOn(TimeParticipanteModel, 'getPartidaParticipanteId').mockResolvedValue(mockPartidaParticipanteId);
                vi.spyOn(TimeParticipanteModel, 'insertTimeParticipante').mockResolvedValue(mockParticipante);

                const resultado = await TimeParticipanteService.adicionarJogadorAoTime({
                    timeId: 1,
                    jogadorId: 456,
                    solicitanteId: 123
                });

                expect(TimeParticipanteModel.insertTimeParticipante).toHaveBeenCalledWith({
                    timeId: 1,
                    partidaParticipanteId: 10
                });
                expect(resultado).toEqual(mockParticipante);
            });

            it('deve retornar bad_request quando faltam parâmetros', async () => {
                const resultado = await TimeParticipanteService.adicionarJogadorAoTime({
                    timeId: null,
                    jogadorId: 456,
                    solicitanteId: 123
                });

                expect(resultado).toBe('bad_request');
            });

            it('deve retornar not_found_time quando time não existe', async () => {
                vi.spyOn(TimeParticipanteModel, 'getPartidaInfoByTimeId').mockResolvedValue(null);

                const resultado = await TimeParticipanteService.adicionarJogadorAoTime({
                    timeId: 999,
                    jogadorId: 456,
                    solicitanteId: 123
                });

                expect(resultado).toBe('not_found_time');
            });

            it('deve retornar forbidden quando usuário não é organizador', async () => {
                const mockPartidaInfo = { partida_id: 1, usuario_criador_id: 999 };
                vi.spyOn(TimeParticipanteModel, 'getPartidaInfoByTimeId').mockResolvedValue(mockPartidaInfo);

                const resultado = await TimeParticipanteService.adicionarJogadorAoTime({
                    timeId: 1,
                    jogadorId: 456,
                    solicitanteId: 123
                });

                expect(resultado).toBe('forbidden');
            });

            it('deve retornar not_participante quando jogador não está na partida', async () => {
                const mockPartidaInfo = { partida_id: 1, usuario_criador_id: 123 };
                vi.spyOn(TimeParticipanteModel, 'getPartidaInfoByTimeId').mockResolvedValue(mockPartidaInfo);
                vi.spyOn(TimeParticipanteModel, 'jogadorEstaNaPartida').mockResolvedValue(false);

                const resultado = await TimeParticipanteService.adicionarJogadorAoTime({
                    timeId: 1,
                    jogadorId: 456,
                    solicitanteId: 123
                });

                expect(resultado).toBe('not_participante');
            });

            it('deve retornar conflict quando jogador já está no time', async () => {
                const mockPartidaInfo = { partida_id: 1, usuario_criador_id: 123 };
                vi.spyOn(TimeParticipanteModel, 'getPartidaInfoByTimeId').mockResolvedValue(mockPartidaInfo);
                vi.spyOn(TimeParticipanteModel, 'jogadorEstaNaPartida').mockResolvedValue(true);
                vi.spyOn(TimeParticipanteModel, 'existsInTime').mockResolvedValue(true);

                const resultado = await TimeParticipanteService.adicionarJogadorAoTime({
                    timeId: 1,
                    jogadorId: 456,
                    solicitanteId: 123
                });

                expect(resultado).toBe('conflict');
            });
        });

        describe('atualizarEstatisticas', () => {
            it('deve atualizar estatísticas com sucesso', async () => {
                const mockParticipante = { id: 1, partida_jogo_time_id: 1 };
                const mockPartidaInfo = { partida_id: 1, usuario_criador_id: 123 };
                const mockAtualizado = {
                    id: 1,
                    gol: 2,
                    assistencia: 1,
                    cartaoAmarelo: 1
                };

                vi.spyOn(TimeParticipanteModel, 'findTimeParticipanteById').mockResolvedValue(mockParticipante);
                vi.spyOn(TimeParticipanteModel, 'getPartidaInfoByTimeParticipanteId').mockResolvedValue(mockPartidaInfo);
                vi.spyOn(TimeParticipanteModel, 'updateTimeParticipante').mockResolvedValue(mockAtualizado);

                const resultado = await TimeParticipanteService.atualizarEstatisticas({
                    timeParticipanteId: 1,
                    solicitanteId: 123,
                    payload: {
                        gol: 2,
                        assistencia: 1,
                        cartaoAmarelo: 1
                    }
                });

                expect(TimeParticipanteModel.updateTimeParticipante).toHaveBeenCalledWith(1, {
                    gol: 2,
                    assistencia: 1,
                    cartao_amarelo: 1
                });
                expect(resultado).toEqual(mockAtualizado);
            });

            it('deve retornar not_found_tp quando participante não encontrado', async () => {
                vi.spyOn(TimeParticipanteModel, 'findTimeParticipanteById').mockResolvedValue(null);

                const resultado = await TimeParticipanteService.atualizarEstatisticas({
                    timeParticipanteId: 999,
                    solicitanteId: 123,
                    payload: { gol: 1 }
                });

                expect(resultado).toBe('not_found_tp');
            });

            it('deve retornar forbidden quando usuário não é organizador', async () => {
                const mockParticipante = { id: 1, partida_jogo_time_id: 1 };
                const mockPartidaInfo = { partida_id: 1, usuario_criador_id: 999 };

                vi.spyOn(TimeParticipanteModel, 'findTimeParticipanteById').mockResolvedValue(mockParticipante);
                vi.spyOn(TimeParticipanteModel, 'getPartidaInfoByTimeParticipanteId').mockResolvedValue(mockPartidaInfo);

                const resultado = await TimeParticipanteService.atualizarEstatisticas({
                    timeParticipanteId: 1,
                    solicitanteId: 123,
                    payload: { gol: 1 }
                });

                expect(resultado).toBe('forbidden');
            });

            it('deve retornar no_fields quando não há campos para atualizar', async () => {
                const mockParticipante = { id: 1, partida_jogo_time_id: 1 };
                const mockPartidaInfo = { partida_id: 1, usuario_criador_id: 123 };

                vi.spyOn(TimeParticipanteModel, 'findTimeParticipanteById').mockResolvedValue(mockParticipante);
                vi.spyOn(TimeParticipanteModel, 'getPartidaInfoByTimeParticipanteId').mockResolvedValue(mockPartidaInfo);

                const resultado = await TimeParticipanteService.atualizarEstatisticas({
                    timeParticipanteId: 1,
                    solicitanteId: 123,
                    payload: {}
                });

                expect(resultado).toBe('no_fields');
            });

            it('deve mapear corretamente campos do payload', async () => {
                const mockParticipante = { id: 1, partida_jogo_time_id: 1 };
                const mockPartidaInfo = { partida_id: 1, usuario_criador_id: 123 };
                const mockAtualizado = { id: 1 };

                vi.spyOn(TimeParticipanteModel, 'findTimeParticipanteById').mockResolvedValue(mockParticipante);
                vi.spyOn(TimeParticipanteModel, 'getPartidaInfoByTimeParticipanteId').mockResolvedValue(mockPartidaInfo);
                vi.spyOn(TimeParticipanteModel, 'updateTimeParticipante').mockResolvedValue(mockAtualizado);

                await TimeParticipanteService.atualizarEstatisticas({
                    timeParticipanteId: 1,
                    solicitanteId: 123,
                    payload: {
                        cartaoAmarelo: 1,
                        cartaoVermelho: 0,
                        posicaoId: 2
                    }
                });

                expect(TimeParticipanteModel.updateTimeParticipante).toHaveBeenCalledWith(1, {
                    cartao_amarelo: 1,
                    cartao_vermelho: 0,
                    posicao_id: 2
                });
            });
        });
    });

    describe('TimeParticipanteController', () => {
        let req, res;

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
        });

        describe('adicionarJogadorAoTime', () => {
            it('deve adicionar jogador ao time com sucesso', async () => {
                const mockParticipante = {
                    id: 1,
                    timeId: 1,
                    jogadorId: 456
                };

                req.body = {
                    timeId: 1,
                    jogadorId: 456
                };

                vi.spyOn(TimeParticipanteService, 'adicionarJogadorAoTime').mockResolvedValue(mockParticipante);

                await TimeParticipanteController.adicionarJogadorAoTime(req, res);

                expect(TimeParticipanteService.adicionarJogadorAoTime).toHaveBeenCalledWith({
                    timeId: 1,
                    jogadorId: 456,
                    solicitanteId: 123
                });
                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.json).toHaveBeenCalledWith(mockParticipante);
            });

            it('deve retornar 400 quando parâmetros obrigatórios ausentes', async () => {
                req.body = { timeId: 1 };
                vi.spyOn(TimeParticipanteService, 'adicionarJogadorAoTime').mockResolvedValue('bad_request');

                await TimeParticipanteController.adicionarJogadorAoTime(req, res);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'timeId e jogadorId são obrigatórios.'
                });
            });

            it('deve retornar 404 quando time não encontrado', async () => {
                req.body = { timeId: 999, jogadorId: 456, posicaoId: 1 };
                vi.spyOn(TimeParticipanteService, 'adicionarJogadorAoTime').mockResolvedValue('not_found_time');

                await TimeParticipanteController.adicionarJogadorAoTime(req, res);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Time do jogo não encontrado.'
                });
            });

            it('deve retornar 403 quando usuário não é organizador', async () => {
                req.body = { timeId: 1, jogadorId: 456, posicaoId: 1 };
                vi.spyOn(TimeParticipanteService, 'adicionarJogadorAoTime').mockResolvedValue('forbidden');

                await TimeParticipanteController.adicionarJogadorAoTime(req, res);

                expect(res.status).toHaveBeenCalledWith(403);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Apenas o organizador pode adicionar.'
                });
            });

            it('deve retornar 409 quando jogador não está na partida', async () => {
                req.body = { timeId: 1, jogadorId: 456, posicaoId: 1 };
                vi.spyOn(TimeParticipanteService, 'adicionarJogadorAoTime').mockResolvedValue('not_participante');

                await TimeParticipanteController.adicionarJogadorAoTime(req, res);

                expect(res.status).toHaveBeenCalledWith(409);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Jogador não está cadastrado na partida.'
                });
            });

            it('deve retornar 409 quando jogador já está no time', async () => {
                req.body = { timeId: 1, jogadorId: 456, posicaoId: 1 };
                vi.spyOn(TimeParticipanteService, 'adicionarJogadorAoTime').mockResolvedValue('conflict');

                await TimeParticipanteController.adicionarJogadorAoTime(req, res);

                expect(res.status).toHaveBeenCalledWith(409);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Jogador já está neste time.'
                });
            });
        });

        describe('atualizarEstatisticas', () => {
            it('deve atualizar estatísticas com sucesso', async () => {
                const mockAtualizado = {
                    id: 1,
                    gol: 2,
                    assistencia: 1
                };

                req.params.timeParticipanteId = '1';
                req.body = {
                    gol: 2,
                    assistencia: 1
                };

                vi.spyOn(TimeParticipanteService, 'atualizarEstatisticas').mockResolvedValue(mockAtualizado);

                await TimeParticipanteController.atualizarEstatisticas(req, res);

                expect(TimeParticipanteService.atualizarEstatisticas).toHaveBeenCalledWith({
                    timeParticipanteId: 1,
                    solicitanteId: 123,
                    payload: {
                        gol: 2,
                        assistencia: 1
                    }
                });
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith(mockAtualizado);
            });

            it('deve retornar 404 quando participante não encontrado', async () => {
                req.params.timeParticipanteId = '999';
                req.body = { gol: 1 };
                vi.spyOn(TimeParticipanteService, 'atualizarEstatisticas').mockResolvedValue('not_found_tp');

                await TimeParticipanteController.atualizarEstatisticas(req, res);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Registro de jogador no time não encontrado.'
                });
            });

            it('deve retornar 403 quando usuário não é organizador', async () => {
                req.params.timeParticipanteId = '1';
                req.body = { gol: 1 };
                vi.spyOn(TimeParticipanteService, 'atualizarEstatisticas').mockResolvedValue('forbidden');

                await TimeParticipanteController.atualizarEstatisticas(req, res);

                expect(res.status).toHaveBeenCalledWith(403);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Apenas o organizador pode atualizar estatísticas.'
                });
            });

            it('deve retornar 400 quando não há campos válidos', async () => {
                req.params.timeParticipanteId = '1';
                req.body = {};
                vi.spyOn(TimeParticipanteService, 'atualizarEstatisticas').mockResolvedValue('no_fields');

                await TimeParticipanteController.atualizarEstatisticas(req, res);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    message: 'Nenhum campo válido para atualizar.'
                });
            });
        });
    });
});