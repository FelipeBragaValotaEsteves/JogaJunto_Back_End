import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JogoModel } from '../src/models/jogo.model.js';
import { JogoService } from '../src/services/jogo.service.js';
import { JogoController } from '../src/controllers/jogo.controller.js';

vi.mock('../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

vi.mock('../src/services/time.service.js', () => ({
    TimeService: {
        criarTime: vi.fn()
    }
}));

import { db } from '../src/config/database.js';
import { TimeService } from '../src/services/time.service.js';

describe('Testes do Módulo Jogo', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('JogoModel', () => {
        describe('getPartidaById', () => {
            it('deve retornar partida quando encontrada', async () => {
                const mockPartida = { id: 1, usuario_criador_id: 123 };
                db.query.mockResolvedValue({ rows: [mockPartida] });

                const resultado = await JogoModel.getPartidaById(1);

                expect(db.query).toHaveBeenCalledWith(
                    'SELECT id, usuario_criador_id FROM public.partida WHERE id = $1',
                    [1]
                );
                expect(resultado).toEqual(mockPartida);
            });

            it('deve retornar null quando partida não encontrada', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await JogoModel.getPartidaById(999);

                expect(resultado).toBeNull();
            });
        });

        describe('createJogo', () => {
            it('deve criar jogo com sucesso', async () => {
                const mockJogo = { id: 1, partida_id: 1 };
                db.query.mockResolvedValue({ rows: [mockJogo] });

                const resultado = await JogoModel.createJogo(1);

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    [1]
                );
                expect(resultado).toEqual(mockJogo);
            });
        });

        describe('findJogoById', () => {
            it('deve retornar jogo quando encontrado', async () => {
                const mockJogo = { id: 1, partida_id: 1 };
                db.query.mockResolvedValue({ rows: [mockJogo] });

                const resultado = await JogoModel.findJogoById(1);

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    [1]
                );
                expect(resultado).toEqual(mockJogo);
            });

            it('deve retornar null quando jogo não encontrado', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await JogoModel.findJogoById(999);

                expect(resultado).toBeNull();
            });
        });

        describe('updateJogo', () => {
            it('deve atualizar jogo com sucesso', async () => {
                const mockJogo = { id: 1, nome: 'Jogo Final' };
                db.query.mockResolvedValue({ rows: [mockJogo] });

                const resultado = await JogoModel.updateJogo(1, 'Jogo Final');

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    [1, 'Jogo Final']
                );
                expect(resultado).toEqual(mockJogo);
            });

            it('deve retornar null quando jogo não encontrado para atualizar', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await JogoModel.updateJogo(999, 'Jogo Final');

                expect(resultado).toBeNull();
            });
        });

        describe('deleteTimesByJogoId', () => {
            it('deve deletar times do jogo', async () => {
                db.query.mockResolvedValue({ rows: [] });

                await JogoModel.deleteTimesByJogoId(1);

                expect(db.query).toHaveBeenCalledWith(
                    'DELETE FROM public.partida_jogo_time WHERE partida_jogo_id = $1',
                    [1]
                );
            });
        });

        describe('deleteJogo', () => {
            it('deve deletar jogo', async () => {
                db.query.mockResolvedValue({ rows: [] });

                await JogoModel.deleteJogo(1);

                expect(db.query).toHaveBeenCalledWith(
                    'DELETE FROM public.partida_jogo WHERE id = $1',
                    [1]
                );
            });
        });

        describe('aggregateResumoPorJogo', () => {
            it('deve retornar resumo completo do jogo', async () => {
                const mockRows = [
                    {
                        jogo_id: 1,
                        time_id: 1,
                        time_nome: 'Time A',
                        time_gols: 3,
                        time_assistencias: 2,
                        time_cartoes_amarelos: 1,
                        time_cartoes_vermelhos: 0,
                        time_participante_id: 1,
                        jogador_id: 1,
                        gol: 2,
                        assistencia: 1,
                        defesa: 0,
                        cartao_amarelo: 0,
                        cartao_vermelho: 0,
                        jogador_nome: 'João Silva',
                        foto: 'foto1.jpg'
                    },
                    {
                        jogo_id: 1,
                        time_id: 2,
                        time_nome: 'Time B',
                        time_gols: 1,
                        time_assistencias: 1,
                        time_cartoes_amarelos: 2,
                        time_cartoes_vermelhos: 1,
                        time_participante_id: 2,
                        jogador_id: 2,
                        gol: 1,
                        assistencia: 1,
                        defesa: 3,
                        cartao_amarelo: 1,
                        cartao_vermelho: 0,
                        jogador_nome: 'Maria Santos',
                        foto: 'foto2.jpg'
                    }
                ];

                db.query.mockResolvedValue({ rows: mockRows });

                const resultado = await JogoModel.aggregateResumoPorJogo(1);

                expect(resultado).toHaveProperty('jogoId', 1);
                expect(resultado).toHaveProperty('times');
                expect(resultado.times).toHaveLength(2);
                expect(resultado.times[0]).toHaveProperty('timeId', 1);
                expect(resultado.times[0]).toHaveProperty('nome', 'Time A');
                expect(resultado.times[0].totais).toHaveProperty('gols', 3);
                expect(resultado.times[0].jogadores).toHaveLength(1);
                expect(resultado.times[0].jogadores[0]).toHaveProperty('nome', 'João Silva');
            });

            it('deve retornar estrutura vazia quando não há dados', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await JogoModel.aggregateResumoPorJogo(999);

                expect(resultado).toEqual({
                    jogoId: 999,
                    times: []
                });
            });
        });
    });

    describe('JogoService', () => {
        describe('criarJogo', () => {
            it('deve criar jogo quando dados válidos', async () => {
                const mockPartida = { id: 1, usuario_criador_id: 123 };
                const mockJogo = { id: 1, partida_id: 1 };

                vi.spyOn(JogoModel, 'getPartidaById').mockResolvedValue(mockPartida);
                vi.spyOn(JogoModel, 'createJogo').mockResolvedValue(mockJogo);

                const resultado = await JogoService.criarJogo({
                    partidaId: 1,
                    solicitanteId: 123
                });

                expect(JogoModel.getPartidaById).toHaveBeenCalledWith(1);
                expect(JogoModel.createJogo).toHaveBeenCalledWith(1);
                expect(resultado).toEqual(mockJogo);
            });

            it('deve retornar not_found_partida quando partida não existe', async () => {
                vi.spyOn(JogoModel, 'getPartidaById').mockResolvedValue(null);

                const resultado = await JogoService.criarJogo({
                    partidaId: 999,
                    solicitanteId: 123
                });

                expect(resultado).toBe('not_found_partida');
            });

            it('deve retornar forbidden quando usuário não é criador', async () => {
                const mockPartida = { id: 1, usuario_criador_id: 456 };
                vi.spyOn(JogoModel, 'getPartidaById').mockResolvedValue(mockPartida);

                const resultado = await JogoService.criarJogo({
                    partidaId: 1,
                    solicitanteId: 123
                });

                expect(resultado).toBe('forbidden');
            });
        });

        describe('excluirJogo', () => {
            it('deve excluir jogo com sucesso', async () => {
                const mockJogo = { id: 1, partida_id: 1 };
                const mockPartida = { id: 1, usuario_criador_id: 123 };

                vi.spyOn(JogoModel, 'findJogoById').mockResolvedValue(mockJogo);
                vi.spyOn(JogoModel, 'getPartidaById').mockResolvedValue(mockPartida);
                vi.spyOn(JogoModel, 'deleteTimesByJogoId').mockResolvedValue(undefined);
                vi.spyOn(JogoModel, 'deleteJogo').mockResolvedValue(undefined);

                const resultado = await JogoService.excluirJogo({
                    jogoId: 1,
                    solicitanteId: 123
                });

                expect(JogoModel.deleteTimesByJogoId).toHaveBeenCalledWith(1);
                expect(JogoModel.deleteJogo).toHaveBeenCalledWith(1);
                expect(resultado).toBe('ok');
            });

            it('deve retornar not_found_jogo quando jogo não existe', async () => {
                vi.spyOn(JogoModel, 'findJogoById').mockResolvedValue(null);

                const resultado = await JogoService.excluirJogo({
                    jogoId: 999,
                    solicitanteId: 123
                });

                expect(resultado).toBe('not_found_jogo');
            });

            it('deve retornar forbidden quando usuário não é criador', async () => {
                const mockJogo = { id: 1, partida_id: 1 };
                const mockPartida = { id: 1, usuario_criador_id: 456 };

                vi.spyOn(JogoModel, 'findJogoById').mockResolvedValue(mockJogo);
                vi.spyOn(JogoModel, 'getPartidaById').mockResolvedValue(mockPartida);

                const resultado = await JogoService.excluirJogo({
                    jogoId: 1,
                    solicitanteId: 123
                });

                expect(resultado).toBe('forbidden');
            });
        });

        describe('obterJogo', () => {
            it('deve obter resumo do jogo', async () => {
                const mockResumo = {
                    jogoId: 1,
                    times: [
                        {
                            timeId: 1,
                            nome: 'Time A',
                            totais: { gols: 3, assistencias: 2 },
                            jogadores: []
                        }
                    ]
                };

                vi.spyOn(JogoModel, 'aggregateResumoPorJogo').mockResolvedValue(mockResumo);

                const resultado = await JogoService.obterJogo({
                    jogoId: 1,
                    solicitanteId: 123
                });

                expect(resultado).toEqual(mockResumo);
            });
        });
    });

    describe('JogoController', () => {
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

        describe('criarJogo', () => {
            it('deve criar jogo com dois times com sucesso', async () => {
                const mockJogo = { id: 1, partida_id: 1 };
                const mockTime1 = { id: 1, nome: 'Time A' };
                const mockTime2 = { id: 2, nome: 'Time B' };

                req.body = {
                    partidaId: 1,
                    time1: 'Time A',
                    time2: 'Time B'
                };

                vi.spyOn(JogoService, 'criarJogo').mockResolvedValue(mockJogo);
                TimeService.criarTime
                    .mockResolvedValueOnce(mockTime1)
                    .mockResolvedValueOnce(mockTime2);

                await JogoController.criarJogo(req, res);

                expect(JogoService.criarJogo).toHaveBeenCalledWith({
                    partidaId: 1,
                    solicitanteId: 123
                });
                expect(TimeService.criarTime).toHaveBeenCalledTimes(2);
                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.json).toHaveBeenCalledWith({
                    jogo: mockJogo,
                    time1: mockTime1,
                    time2: mockTime2
                });
            });

            it('deve retornar 404 quando partida não encontrada', async () => {
                req.body = { partidaId: 999, time1: 'Time A', time2: 'Time B' };
                vi.spyOn(JogoService, 'criarJogo').mockResolvedValue('not_found_partida');

                await JogoController.criarJogo(req, res);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({ message: 'Partida não encontrada.' });
            });

            it('deve retornar 403 quando usuário não autorizado', async () => {
                req.body = { partidaId: 1, time1: 'Time A', time2: 'Time B' };
                vi.spyOn(JogoService, 'criarJogo').mockResolvedValue('forbidden');

                await JogoController.criarJogo(req, res);

                expect(res.status).toHaveBeenCalledWith(403);
                expect(res.json).toHaveBeenCalledWith({ message: 'Apenas o organizador pode criar jogos.' });
            });

            it('deve retornar 403 quando falha ao criar time1', async () => {
                const mockJogo = { id: 1, partida_id: 1 };
                req.body = { partidaId: 1, time1: 'Time A', time2: 'Time B' };

                vi.spyOn(JogoService, 'criarJogo').mockResolvedValue(mockJogo);
                TimeService.criarTime.mockResolvedValueOnce('forbidden');

                await JogoController.criarJogo(req, res);

                expect(res.status).toHaveBeenCalledWith(403);
                expect(res.json).toHaveBeenCalledWith({ message: 'Apenas o organizador pode criar o time 1.' });
            });

            it('deve retornar 400 quando dados inválidos para time1', async () => {
                const mockJogo = { id: 1, partida_id: 1 };
                req.body = { partidaId: 1, time1: 'Time A', time2: 'Time B' };

                vi.spyOn(JogoService, 'criarJogo').mockResolvedValue(mockJogo);
                TimeService.criarTime.mockResolvedValueOnce('invalid_data');

                await JogoController.criarJogo(req, res);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({ message: 'Dados inválidos para o time 1.' });
            });
        });

        describe('excluirJogo', () => {
            it('deve excluir jogo com sucesso', async () => {
                req.params.jogoId = '1';
                vi.spyOn(JogoService, 'excluirJogo').mockResolvedValue('ok');

                await JogoController.excluirJogo(req, res);

                expect(JogoService.excluirJogo).toHaveBeenCalledWith({
                    jogoId: 1,
                    solicitanteId: 123
                });
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith({ message: 'Jogo excluído com sucesso.' });
            });

            it('deve retornar 404 quando jogo não encontrado', async () => {
                req.params.jogoId = '999';
                vi.spyOn(JogoService, 'excluirJogo').mockResolvedValue('not_found_jogo');

                await JogoController.excluirJogo(req, res);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({ message: 'Jogo não encontrado.' });
            });

            it('deve retornar 403 quando usuário não autorizado', async () => {
                req.params.jogoId = '1';
                vi.spyOn(JogoService, 'excluirJogo').mockResolvedValue('forbidden');

                await JogoController.excluirJogo(req, res);

                expect(res.status).toHaveBeenCalledWith(403);
                expect(res.json).toHaveBeenCalledWith({ message: 'Apenas o organizador pode excluir.' });
            });
        });

        describe('obterJogo', () => {
            it('deve obter jogo com sucesso', async () => {
                const mockResumo = {
                    jogoId: 1,
                    times: [
                        { timeId: 1, nome: 'Time A', totais: { gols: 3 }, jogadores: [] }
                    ]
                };
                req.params.jogoId = '1';

                vi.spyOn(JogoService, 'obterJogo').mockResolvedValue(mockResumo);

                await JogoController.obterJogo(req, res);

                expect(JogoService.obterJogo).toHaveBeenCalledWith({
                    jogoId: 1,
                    solicitanteId: 123
                });
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith(mockResumo);
            });

            it('deve retornar 404 quando jogo não encontrado', async () => {
                req.params.jogoId = '999';
                vi.spyOn(JogoService, 'obterJogo').mockResolvedValue('not_found_jogo');

                await JogoController.obterJogo(req, res);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({ message: 'Jogo não encontrado.' });
            });
        });
    });
});