import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JogadorModel } from '../src/models/jogador.model.js';
import { JogadorService } from '../src/services/jogador.service.js';
import { JogadorController } from '../src/controllers/jogador.controller.js';

vi.mock('../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

vi.mock('../src/models/convite.model.js', () => ({
    ConviteModel: {
        getPartidaById: vi.fn()
    }
}));

import { db } from '../src/config/database.js';
import { ConviteModel } from '../src/models/convite.model.js';

describe('Testes do Módulo Jogador', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('JogadorModel', () => {
        describe('createUsuarioJogador', () => {
            it('deve criar jogador usuário com sucesso', async () => {
                const mockJogador = { 
                    id: 1, 
                    tipo: 'usuario', 
                    usuario_id: 123, 
                    nome: 'João Silva', 
                    posicao: null 
                };
                db.query.mockResolvedValue({ rows: [mockJogador] });

                const resultado = await JogadorModel.createUsuarioJogador({ 
                    usuario_id: 123, 
                    nome: 'João Silva' 
                });

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    [123, 'João Silva']
                );
                expect(resultado).toEqual(mockJogador);
            });

            it('deve atualizar nome em caso de conflito', async () => {
                const mockJogador = { 
                    id: 1, 
                    tipo: 'usuario', 
                    usuario_id: 123, 
                    nome: 'João Silva Atualizado', 
                    posicao: null 
                };
                db.query.mockResolvedValue({ rows: [mockJogador] });

                const resultado = await JogadorModel.createUsuarioJogador({ 
                    usuario_id: 123, 
                    nome: 'João Silva Atualizado' 
                });

                expect(resultado).toEqual(mockJogador);
            });
        });

        describe('createExterno', () => {
            it('deve criar jogador externo com sucesso', async () => {
                const mockJogador = { 
                    id: 2, 
                    tipo: 'externo', 
                    usuario_id: null, 
                    nome: 'Maria Santos', 
                    posicao: 'Atacante' 
                };
                db.query.mockResolvedValue({ rows: [mockJogador] });

                const resultado = await JogadorModel.createExterno({ 
                    nome: 'Maria Santos', 
                    posicao: 'Atacante', 
                    criado_por: 123 
                });

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    ['Maria Santos', 'Atacante', 123]
                );
                expect(resultado).toEqual(mockJogador);
            });

            it('deve criar jogador externo sem posição', async () => {
                const mockJogador = { 
                    id: 3, 
                    tipo: 'externo', 
                    usuario_id: null, 
                    nome: 'Pedro Costa', 
                    posicao: null 
                };
                db.query.mockResolvedValue({ rows: [mockJogador] });

                const resultado = await JogadorModel.createExterno({ 
                    nome: 'Pedro Costa', 
                    criado_por: 123 
                });

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    ['Pedro Costa', null, 123]
                );
                expect(resultado).toEqual(mockJogador);
            });
        });

        describe('ensureParticipante', () => {
            it('deve retornar participante existente', async () => {
                const mockParticipante = { id: 1 };
                db.query.mockResolvedValue({ rows: [mockParticipante] });

                const resultado = await JogadorModel.ensureParticipante({
                    partida_id: 1,
                    jogador_id: 123,
                    nota: null
                });

                expect(resultado).toEqual(mockParticipante);
            });

            it('deve criar novo participante quando não existir', async () => {
                const mockNovoParticipante = { id: 2 };
                db.query
                    .mockResolvedValueOnce({ rows: [] })
                    .mockResolvedValueOnce({ rows: [mockNovoParticipante] });

                const resultado = await JogadorModel.ensureParticipante({
                    partida_id: 1,
                    jogador_id: 123,
                    nota: null
                });

                expect(resultado).toEqual(mockNovoParticipante);
            });
        });

        describe('findAllDisponiveisByPartida', () => {
            it('deve retornar jogadores disponíveis para partida', async () => {
                const mockJogadores = [
                    { 
                        id: 123, 
                        id_jogador: 1, 
                        nome: 'João Silva', 
                        foto: 'foto1.jpg', 
                        posicoes: ['Atacante', 'Meio-Campo'] 
                    },
                    { 
                        id: 456, 
                        id_jogador: 2, 
                        nome: 'Maria Santos', 
                        foto: 'foto2.jpg', 
                        posicoes: ['Zagueiro'] 
                    }
                ];
                db.query.mockResolvedValue({ rows: mockJogadores });

                const resultado = await JogadorModel.findAllDisponiveisByPartida(1);

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    [1]
                );
                expect(resultado).toEqual(mockJogadores);
            });

            it('deve filtrar jogadores por nome quando fornecido', async () => {
                const mockJogadores = [
                    { 
                        id: 123, 
                        id_jogador: 1, 
                        nome: 'João Silva', 
                        foto: 'foto1.jpg', 
                        posicoes: ['Atacante'] 
                    }
                ];
                db.query.mockResolvedValue({ rows: mockJogadores });

                const resultado = await JogadorModel.findAllDisponiveisByPartida(1, 'João');

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    [1, '%João%']
                );
                expect(resultado).toEqual(mockJogadores);
            });

            it('deve retornar array vazio quando não há jogadores disponíveis', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await JogadorModel.findAllDisponiveisByPartida(999);

                expect(resultado).toEqual([]);
            });
        });

        describe('findAllByPartida', () => {
            it('deve retornar todos jogadores da partida', async () => {
                const mockJogadores = [
                    { 
                        id: 1, 
                        nome: 'João Silva', 
                        foto: 'foto1.jpg', 
                        status: 'aceito', 
                        posicoes: ['Atacante'] 
                    },
                    { 
                        id: 2, 
                        nome: 'Maria Santos', 
                        foto: 'foto2.jpg', 
                        status: 'Inserido Manualmente', 
                        posicoes: ['Zagueiro'] 
                    }
                ];
                db.query.mockResolvedValue({ rows: mockJogadores });

                const resultado = await JogadorModel.findAllByPartida(1);

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    [1]
                );
                expect(resultado).toEqual(mockJogadores);
            });
        });
    });

    describe('JogadorService', () => {
        describe('criarExterno', () => {
            it('deve criar jogador externo com sucesso', async () => {
                const mockJogador = { 
                    id: 1, 
                    tipo: 'externo', 
                    nome: 'João Silva', 
                    posicao: 'Atacante' 
                };
                vi.spyOn(JogadorModel, 'createExterno').mockResolvedValue(mockJogador);

                const resultado = await JogadorService.criarExterno({ 
                    nome: 'João Silva', 
                    posicao: 'Atacante', 
                    criado_por: 123 
                });

                expect(JogadorModel.createExterno).toHaveBeenCalledWith({ 
                    nome: 'João Silva', 
                    posicao: 'Atacante', 
                    criado_por: 123 
                });
                expect(resultado).toEqual(mockJogador);
            });

            it('deve lançar erro quando nome não fornecido', async () => {
                await expect(JogadorService.criarExterno({ posicao: 'Atacante' }))
                    .rejects.toThrow('Nome é obrigatório');
            });

            it('deve criar jogador externo sem posição', async () => {
                const mockJogador = { 
                    id: 2, 
                    tipo: 'externo', 
                    nome: 'Maria Santos', 
                    posicao: null 
                };
                vi.spyOn(JogadorModel, 'createExterno').mockResolvedValue(mockJogador);

                const resultado = await JogadorService.criarExterno({ 
                    nome: 'Maria Santos', 
                    criado_por: 123 
                });

                expect(resultado).toEqual(mockJogador);
            });
        });

        describe('adicionarExternoAPartida', () => {
            it('deve adicionar jogador externo existente à partida', async () => {
                const mockPartida = { id: 1, usuario_criador_id: 123 };
                const mockParticipante = { id: 1 };

                ConviteModel.getPartidaById.mockResolvedValue(mockPartida);
                vi.spyOn(JogadorModel, 'ensureParticipante').mockResolvedValue(mockParticipante);

                const resultado = await JogadorService.adicionarExternoAPartida({
                    partida_id: 1,
                    jogador_id: 456
                });

                expect(ConviteModel.getPartidaById).toHaveBeenCalledWith(1);
                expect(JogadorModel.ensureParticipante).toHaveBeenCalledWith({
                    partida_id: 1,
                    jogador_id: 456,
                    nota: null
                });
                expect(resultado).toEqual({ participante_id: 1, jogador_id: 456 });
            });

            it('deve criar e adicionar novo jogador externo à partida', async () => {
                const mockPartida = { id: 1, usuario_criador_id: 123 };
                const mockJogador = { id: 789 };
                const mockParticipante = { id: 2 };

                ConviteModel.getPartidaById.mockResolvedValue(mockPartida);
                vi.spyOn(JogadorModel, 'createExterno').mockResolvedValue(mockJogador);
                vi.spyOn(JogadorModel, 'ensureParticipante').mockResolvedValue(mockParticipante);

                const resultado = await JogadorService.adicionarExternoAPartida({
                    partida_id: 1,
                    nome: 'Pedro Costa',
                    posicao: 'Goleiro',
                    criado_por: 123
                });

                expect(JogadorModel.createExterno).toHaveBeenCalledWith({
                    nome: 'Pedro Costa',
                    posicao: 'Goleiro',
                    criado_por: 123
                });
                expect(resultado).toEqual({ participante_id: 2, jogador_id: 789 });
            });

            it('deve lançar erro quando partida não encontrada', async () => {
                ConviteModel.getPartidaById.mockResolvedValue(null);

                await expect(JogadorService.adicionarExternoAPartida({
                    partida_id: 999,
                    jogador_id: 456
                })).rejects.toThrow('Partida não encontrada');
            });
        });

        describe('listarJogadoresDisponiveis', () => {
            it('deve retornar jogadores disponíveis', async () => {
                const mockJogadores = [
                    { id: 123, nome: 'João Silva', posicoes: ['Atacante'] }
                ];
                vi.spyOn(JogadorModel, 'findAllDisponiveisByPartida').mockResolvedValue(mockJogadores);

                const resultado = await JogadorService.listarJogadoresDisponiveis(1, 'João');

                expect(JogadorModel.findAllDisponiveisByPartida).toHaveBeenCalledWith(1, 'João');
                expect(resultado).toEqual(mockJogadores);
            });
        });

        describe('listarPorPartida', () => {
            it('deve retornar jogadores da partida', async () => {
                const mockJogadores = [
                    { id: 1, nome: 'João Silva', status: 'aceito' }
                ];
                vi.spyOn(JogadorModel, 'findAllByPartida').mockResolvedValue(mockJogadores);

                const resultado = await JogadorService.listarPorPartida(1);

                expect(JogadorModel.findAllByPartida).toHaveBeenCalledWith(1);
                expect(resultado).toEqual(mockJogadores);
            });
        });
    });

    describe('JogadorController', () => {
        let req, res;

        beforeEach(() => {
            req = {
                user: { id: 123 },
                body: {},
                params: {},
                query: {}
            };
            res = {
                json: vi.fn(),
                status: vi.fn().mockReturnThis()
            };
        });

        describe('criarExterno', () => {
            it('deve criar jogador externo com sucesso', async () => {
                const mockJogador = { 
                    id: 1, 
                    tipo: 'externo', 
                    nome: 'João Silva', 
                    posicao: 'Atacante' 
                };
                req.body = { nome: 'João Silva', posicao: 'Atacante' };

                vi.spyOn(JogadorService, 'criarExterno').mockResolvedValue(mockJogador);

                await JogadorController.criarExterno(req, res);

                expect(JogadorService.criarExterno).toHaveBeenCalledWith({
                    nome: 'João Silva',
                    posicao: 'Atacante',
                    criado_por: 123
                });
                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.json).toHaveBeenCalledWith(mockJogador);
            });

            it('deve retornar erro 400 quando nome não fornecido', async () => {
                req.body = { posicao: 'Atacante' };
                const error = new Error('Nome é obrigatório');
                error.status = 400;

                vi.spyOn(JogadorService, 'criarExterno').mockRejectedValue(error);

                await JogadorController.criarExterno(req, res);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({ message: 'Nome é obrigatório' });
            });
        });

        describe('adicionarExternoAPartida', () => {
            it('deve adicionar jogador externo à partida com sucesso', async () => {
                const mockResult = { participante_id: 1, jogador_id: 456 };
                req.body = { partida_id: 1, jogador_id: 456 };

                vi.spyOn(JogadorService, 'adicionarExternoAPartida').mockResolvedValue(mockResult);

                await JogadorController.adicionarExternoAPartida(req, res);

                expect(JogadorService.adicionarExternoAPartida).toHaveBeenCalledWith({
                    partida_id: 1,
                    jogador_id: 456,
                    nome: undefined,
                    posicao: undefined,
                    criado_por: 123
                });
                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.json).toHaveBeenCalledWith(mockResult);
            });

            it('deve criar e adicionar novo jogador', async () => {
                const mockResult = { participante_id: 2, jogador_id: 789 };
                req.body = { 
                    partida_id: 1, 
                    nome: 'Pedro Costa', 
                    posicao: 'Goleiro' 
                };

                vi.spyOn(JogadorService, 'adicionarExternoAPartida').mockResolvedValue(mockResult);

                await JogadorController.adicionarExternoAPartida(req, res);

                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.json).toHaveBeenCalledWith(mockResult);
            });

            it('deve tratar erro quando partida não encontrada', async () => {
                req.body = { partida_id: 999, jogador_id: 456 };
                const error = new Error('Partida não encontrada');
                error.status = 404;

                vi.spyOn(JogadorService, 'adicionarExternoAPartida').mockRejectedValue(error);

                await JogadorController.adicionarExternoAPartida(req, res);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({ message: 'Partida não encontrada' });
            });
        });

        describe('listarJogadoresDisponiveis', () => {
            it('deve listar jogadores disponíveis com sucesso', async () => {
                const mockJogadores = [
                    { id: 123, nome: 'João Silva', posicoes: ['Atacante'] }
                ];
                req.params.partidaId = '1';
                req.query.nome = 'João';

                vi.spyOn(JogadorService, 'listarJogadoresDisponiveis').mockResolvedValue(mockJogadores);

                await JogadorController.listarJogadoresDisponiveis(req, res);

                expect(JogadorService.listarJogadoresDisponiveis).toHaveBeenCalledWith('1', 'João');
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith(mockJogadores);
            });

            it('deve listar todos jogadores quando nome não fornecido', async () => {
                const mockJogadores = [
                    { id: 123, nome: 'João Silva' },
                    { id: 456, nome: 'Maria Santos' }
                ];
                req.params.partidaId = '1';

                vi.spyOn(JogadorService, 'listarJogadoresDisponiveis').mockResolvedValue(mockJogadores);

                await JogadorController.listarJogadoresDisponiveis(req, res);

                expect(JogadorService.listarJogadoresDisponiveis).toHaveBeenCalledWith('1', undefined);
                expect(res.json).toHaveBeenCalledWith(mockJogadores);
            });
        });

        describe('listarPorPartida', () => {
            it('deve listar jogadores da partida com sucesso', async () => {
                const mockJogadores = [
                    { id: 1, nome: 'João Silva', status: 'aceito' }
                ];
                req.params.partidaId = '1';

                vi.spyOn(JogadorService, 'listarPorPartida').mockResolvedValue(mockJogadores);

                await JogadorController.listarPorPartida(req, res);

                expect(JogadorService.listarPorPartida).toHaveBeenCalledWith('1');
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith(mockJogadores);
            });
        });
    });
});