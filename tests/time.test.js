import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimeModel } from '../src/models/time.model.js';
import { TimeService } from '../src/services/time.service.js';
import { TimeController } from '../src/controllers/time.controller.js';
import { JogoModel } from '../src/models/jogo.model.js';

vi.mock('../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

vi.mock('../src/models/jogo.model.js');

import { db } from '../src/config/database.js';

describe('Testes do Módulo Time', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('TimeModel', () => {
        describe('createTime', () => {
            it('deve criar time com sucesso', async () => {
                const mockTime = {
                    id: 1,
                    partida_jogo_id: 1,
                    nome: 'Time A'
                };

                db.query.mockResolvedValue({ rows: [mockTime] });

                const resultado = await TimeModel.createTime(1, 'Time A');

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('INSERT INTO public.partida_jogo_time'),
                    [1, 'Time A']
                );
                expect(resultado).toEqual(mockTime);
            });

            it('deve retornar time criado com todos os campos', async () => {
                const mockTime = {
                    id: 2,
                    partida_jogo_id: 5,
                    nome: 'Time Azul'
                };

                db.query.mockResolvedValue({ rows: [mockTime] });

                const resultado = await TimeModel.createTime(5, 'Time Azul');

                expect(resultado).toHaveProperty('id');
                expect(resultado).toHaveProperty('partida_jogo_id');
                expect(resultado).toHaveProperty('nome');
                expect(resultado.nome).toBe('Time Azul');
            });
        });

        describe('findTimeById', () => {
            it('deve encontrar time por id', async () => {
                const mockTime = {
                    id: 1,
                    partida_jogo_id: 1,
                    nome: 'Time A'
                };

                db.query.mockResolvedValue({ rows: [mockTime] });

                const resultado = await TimeModel.findTimeById(1);

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('SELECT id, partida_jogo_id, nome'),
                    [1]
                );
                expect(resultado).toEqual(mockTime);
            });

            it('deve retornar null quando time não encontrado', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await TimeModel.findTimeById(999);

                expect(resultado).toBeNull();
            });

            it('deve usar LIMIT 1 na consulta', async () => {
                db.query.mockResolvedValue({ rows: [] });

                await TimeModel.findTimeById(1);

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('LIMIT 1'),
                    [1]
                );
            });
        });

        describe('updateTime', () => {
            it('deve atualizar nome do time', async () => {
                const mockTimeAtualizado = {
                    id: 1,
                    partida_jogo_id: 1,
                    nome: 'Time Atualizado'
                };

                db.query.mockResolvedValue({ rows: [mockTimeAtualizado] });

                const resultado = await TimeModel.updateTime(1, { nome: 'Time Atualizado' });

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('UPDATE public.partida_jogo_time'),
                    [1, 'Time Atualizado']
                );
                expect(resultado).toEqual(mockTimeAtualizado);
            });

            it('deve retornar null quando time não encontrado', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await TimeModel.updateTime(999, { nome: 'Novo Nome' });

                expect(resultado).toBeNull();
            });

            it('deve usar COALESCE para nome', async () => {
                db.query.mockResolvedValue({ rows: [{ id: 1, nome: 'Time A' }] });

                await TimeModel.updateTime(1, { nome: undefined });

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('COALESCE($2, nome)'),
                    [1, null]
                );
            });
        });

        describe('deleteTime', () => {
            it('deve excluir time por id', async () => {
                db.query.mockResolvedValue({ rows: [] });

                await TimeModel.deleteTime(1);

                expect(db.query).toHaveBeenCalledWith(
                    'DELETE FROM public.partida_jogo_time WHERE id = $1',
                    [1]
                );
            });

            it('deve executar delete mesmo se time não existir', async () => {
                db.query.mockResolvedValue({ rows: [] });

                await TimeModel.deleteTime(999);

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('DELETE FROM'),
                    [999]
                );
            });
        });
    });

    describe('TimeService', () => {
        describe('criarTime', () => {
            it('deve criar time quando usuário é organizador', async () => {
                const mockJogo = { id: 1, partida_id: 1 };
                const mockPartida = { id: 1, usuario_criador_id: 123 };
                const mockTime = { id: 1, partida_jogo_id: 1, nome: 'Time A' };

                vi.mocked(JogoModel.findJogoById).mockResolvedValue(mockJogo);
                vi.mocked(JogoModel.getPartidaById).mockResolvedValue(mockPartida);
                vi.spyOn(TimeModel, 'createTime').mockResolvedValue(mockTime);

                const resultado = await TimeService.criarTime({
                    jogoId: 1,
                    nome: 'Time A',
                    solicitanteId: 123
                });

                expect(JogoModel.findJogoById).toHaveBeenCalledWith(1);
                expect(JogoModel.getPartidaById).toHaveBeenCalledWith(1);
                expect(TimeModel.createTime).toHaveBeenCalledWith(1, 'Time A');
                expect(resultado).toEqual(mockTime);
            });

            it('deve retornar not_found_jogo quando jogo não existe', async () => {
                vi.mocked(JogoModel.findJogoById).mockResolvedValue(null);

                const resultado = await TimeService.criarTime({
                    jogoId: 999,
                    nome: 'Time A',
                    solicitanteId: 123
                });

                expect(resultado).toBe('not_found_jogo');
            });

            it('deve retornar forbidden quando usuário não é organizador', async () => {
                const mockJogo = { id: 1, partida_id: 1 };
                const mockPartida = { id: 1, usuario_criador_id: 456 };

                vi.mocked(JogoModel.findJogoById).mockResolvedValue(mockJogo);
                vi.mocked(JogoModel.getPartidaById).mockResolvedValue(mockPartida);

                const resultado = await TimeService.criarTime({
                    jogoId: 1,
                    nome: 'Time A',
                    solicitanteId: 123
                });

                expect(resultado).toBe('forbidden');
            });

            it('deve retornar forbidden quando partida não existe', async () => {
                const mockJogo = { id: 1, partida_id: 1 };

                vi.mocked(JogoModel.findJogoById).mockResolvedValue(mockJogo);
                vi.mocked(JogoModel.getPartidaById).mockResolvedValue(null);

                const resultado = await TimeService.criarTime({
                    jogoId: 1,
                    nome: 'Time A',
                    solicitanteId: 123
                });

                expect(resultado).toBe('forbidden');
            });
        });

        describe('editarTime', () => {
            it('deve editar time quando usuário é organizador', async () => {
                const mockTime = { id: 1, partida_jogo_id: 1, nome: 'Time A' };
                const mockJogo = { id: 1, partida_id: 1 };
                const mockPartida = { id: 1, usuario_criador_id: 123 };
                const mockTimeAtualizado = { id: 1, partida_jogo_id: 1, nome: 'Time Editado' };

                vi.spyOn(TimeModel, 'findTimeById').mockResolvedValue(mockTime);
                vi.mocked(JogoModel.findJogoById).mockResolvedValue(mockJogo);
                vi.mocked(JogoModel.getPartidaById).mockResolvedValue(mockPartida);
                vi.spyOn(TimeModel, 'updateTime').mockResolvedValue(mockTimeAtualizado);

                const resultado = await TimeService.editarTime({
                    timeId: 1,
                    nome: 'Time Editado',
                    solicitanteId: 123
                });

                expect(TimeModel.updateTime).toHaveBeenCalledWith(1, { nome: 'Time Editado' });
                expect(resultado).toEqual(mockTimeAtualizado);
            });

            it('deve retornar not_found_time quando time não existe', async () => {
                vi.spyOn(TimeModel, 'findTimeById').mockResolvedValue(null);

                const resultado = await TimeService.editarTime({
                    timeId: 999,
                    nome: 'Novo Nome',
                    solicitanteId: 123
                });

                expect(resultado).toBe('not_found_time');
            });

            it('deve retornar forbidden quando usuário não é organizador', async () => {
                const mockTime = { id: 1, partida_jogo_id: 1, nome: 'Time A' };
                const mockJogo = { id: 1, partida_id: 1 };
                const mockPartida = { id: 1, usuario_criador_id: 456 };

                vi.spyOn(TimeModel, 'findTimeById').mockResolvedValue(mockTime);
                vi.mocked(JogoModel.findJogoById).mockResolvedValue(mockJogo);
                vi.mocked(JogoModel.getPartidaById).mockResolvedValue(mockPartida);

                const resultado = await TimeService.editarTime({
                    timeId: 1,
                    nome: 'Novo Nome',
                    solicitanteId: 123
                });

                expect(resultado).toBe('forbidden');
            });
        });

        describe('excluirTime', () => {
            it('deve excluir time quando usuário é organizador', async () => {
                const mockTime = { id: 1, partida_jogo_id: 1, nome: 'Time A' };
                const mockJogo = { id: 1, partida_id: 1 };
                const mockPartida = { id: 1, usuario_criador_id: 123 };

                vi.spyOn(TimeModel, 'findTimeById').mockResolvedValue(mockTime);
                vi.mocked(JogoModel.findJogoById).mockResolvedValue(mockJogo);
                vi.mocked(JogoModel.getPartidaById).mockResolvedValue(mockPartida);
                vi.spyOn(TimeModel, 'deleteTime').mockResolvedValue();

                const resultado = await TimeService.excluirTime({
                    timeId: 1,
                    solicitanteId: 123
                });

                expect(TimeModel.deleteTime).toHaveBeenCalledWith(1);
                expect(resultado).toBe('ok');
            });

            it('deve retornar not_found_time quando time não existe', async () => {
                vi.spyOn(TimeModel, 'findTimeById').mockResolvedValue(null);

                const resultado = await TimeService.excluirTime({
                    timeId: 999,
                    solicitanteId: 123
                });

                expect(resultado).toBe('not_found_time');
            });

            it('deve retornar forbidden quando usuário não é organizador', async () => {
                const mockTime = { id: 1, partida_jogo_id: 1, nome: 'Time A' };
                const mockJogo = { id: 1, partida_id: 1 };
                const mockPartida = { id: 1, usuario_criador_id: 456 };

                vi.spyOn(TimeModel, 'findTimeById').mockResolvedValue(mockTime);
                vi.mocked(JogoModel.findJogoById).mockResolvedValue(mockJogo);
                vi.mocked(JogoModel.getPartidaById).mockResolvedValue(mockPartida);

                const resultado = await TimeService.excluirTime({
                    timeId: 1,
                    solicitanteId: 123
                });

                expect(resultado).toBe('forbidden');
            });
        });
    });

    describe('TimeController', () => {
        let req, res;

        beforeEach(() => {
            req = {
                user: { id: 123 },
                params: {},
                body: {}
            };
            res = {
                json: vi.fn(),
                status: vi.fn().mockReturnThis()
            };
        });

        describe('criarTime', () => {
            it('deve criar time com sucesso', async () => {
                const mockTime = { id: 1, partida_jogo_id: 1, nome: 'Time A' };
                req.params.jogoId = '1';
                req.body.nome = 'Time A';

                vi.spyOn(TimeService, 'criarTime').mockResolvedValue(mockTime);

                await TimeController.criarTime(req, res);

                expect(TimeService.criarTime).toHaveBeenCalledWith({
                    jogoId: 1,
                    nome: 'Time A',
                    solicitanteId: 123
                });
                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.json).toHaveBeenCalledWith(mockTime);
            });

            it('deve retornar 404 quando jogo não encontrado', async () => {
                req.params.jogoId = '999';
                req.body.nome = 'Time A';

                vi.spyOn(TimeService, 'criarTime').mockResolvedValue('not_found_jogo');

                await TimeController.criarTime(req, res);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({ message: 'Jogo não encontrado.' });
            });

            it('deve retornar 403 quando usuário não é organizador', async () => {
                req.params.jogoId = '1';
                req.body.nome = 'Time A';

                vi.spyOn(TimeService, 'criarTime').mockResolvedValue('forbidden');

                await TimeController.criarTime(req, res);

                expect(res.status).toHaveBeenCalledWith(403);
                expect(res.json).toHaveBeenCalledWith({ message: 'Apenas o organizador pode criar times.' });
            });
        });

        describe('editarTime', () => {
            it('deve editar time com sucesso', async () => {
                const mockTimeAtualizado = { id: 1, partida_jogo_id: 1, nome: 'Time Editado' };
                req.params.timeId = '1';
                req.body.nome = 'Time Editado';

                vi.spyOn(TimeService, 'editarTime').mockResolvedValue(mockTimeAtualizado);

                await TimeController.editarTime(req, res);

                expect(TimeService.editarTime).toHaveBeenCalledWith({
                    timeId: 1,
                    nome: 'Time Editado',
                    solicitanteId: 123
                });
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith(mockTimeAtualizado);
            });

            it('deve retornar 404 quando time não encontrado', async () => {
                req.params.timeId = '999';
                req.body.nome = 'Novo Nome';

                vi.spyOn(TimeService, 'editarTime').mockResolvedValue('not_found_time');

                await TimeController.editarTime(req, res);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({ message: 'Time não encontrado.' });
            });

            it('deve retornar 403 quando usuário não é organizador', async () => {
                req.params.timeId = '1';
                req.body.nome = 'Novo Nome';

                vi.spyOn(TimeService, 'editarTime').mockResolvedValue('forbidden');

                await TimeController.editarTime(req, res);

                expect(res.status).toHaveBeenCalledWith(403);
                expect(res.json).toHaveBeenCalledWith({ message: 'Apenas o organizador pode editar.' });
            });
        });

        describe('excluirTime', () => {
            it('deve excluir time com sucesso', async () => {
                req.params.timeId = '1';

                vi.spyOn(TimeService, 'excluirTime').mockResolvedValue('ok');

                await TimeController.excluirTime(req, res);

                expect(TimeService.excluirTime).toHaveBeenCalledWith({
                    timeId: 1,
                    solicitanteId: 123
                });
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith({ message: 'Time excluído com sucesso.' });
            });

            it('deve retornar 404 quando time não encontrado', async () => {
                req.params.timeId = '999';

                vi.spyOn(TimeService, 'excluirTime').mockResolvedValue('not_found_time');

                await TimeController.excluirTime(req, res);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({ message: 'Time não encontrado.' });
            });

            it('deve retornar 403 quando usuário não é organizador', async () => {
                req.params.timeId = '1';

                vi.spyOn(TimeService, 'excluirTime').mockResolvedValue('forbidden');

                await TimeController.excluirTime(req, res);

                expect(res.status).toHaveBeenCalledWith(403);
                expect(res.json).toHaveBeenCalledWith({ message: 'Apenas o organizador pode excluir.' });
            });
        });
    });
});