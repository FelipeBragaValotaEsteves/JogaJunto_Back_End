import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PartidaModel } from '../src/models/partida.model.js';
import { PartidaService } from '../src/services/partida.service.js';
import { PartidaController } from '../src/controllers/partida.controller.js';

vi.mock('../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

import { db } from '../src/config/database.js';

describe('Testes do Módulo Partida', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('PartidaModel', () => {
        describe('create', () => {
            it('deve criar partida com sucesso', async () => {
                const mockPartida = {
                    id: 1,
                    local: 'Campo Central',
                    rua: 'Rua das Flores',
                    bairro: 'Centro',
                    numero: 123,
                    cidade_id: 1,
                    usuario_criador_id: 123,
                    aberto: false,
                    data: '2024-12-01T00:00:00.000Z',
                    hora_inicio: '10:00',
                    hora_fim: '12:00',
                    tipo_partida_id: 1,
                    status: 'aguardando',
                    valor: 25.50
                };

                db.query.mockResolvedValue({ rows: [mockPartida] });

                const resultado = await PartidaModel.create({
                    local: 'Campo Central',
                    rua: 'Rua das Flores',
                    bairro: 'Centro',
                    numero: 123,
                    cidade_id: 1,
                    usuario_criador_id: 123,
                    aberto: false,
                    data: '2024-12-01',
                    hora_inicio: '10:00',
                    hora_fim: '12:00',
                    tipo_partida_id: 1,
                    status: 'aguardando',
                    valor: 25.50
                });

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('INSERT INTO partida'),
                    [
                        'Campo Central', 'Rua das Flores', 'Centro', 123, 1,
                        123, false, '2024-12-01', '10:00', '12:00',
                        1, 'aguardando', 25.50
                    ]
                );
                expect(resultado).toEqual(mockPartida);
            });

            it('deve criar partida com valores opcionais nulos', async () => {
                const mockPartida = {
                    id: 1,
                    local: 'Campo A',
                    rua: null,
                    bairro: null,
                    numero: null,
                    cidade_id: null,
                    usuario_criador_id: 123,
                    aberto: false,
                    data: '2024-12-01',
                    hora_inicio: '10:00',
                    hora_fim: null,
                    tipo_partida_id: 1,
                    status: 'aguardando',
                    valor: null
                };

                db.query.mockResolvedValue({ rows: [mockPartida] });

                await PartidaModel.create({
                    local: 'Campo A',
                    usuario_criador_id: 123,
                    data: '2024-12-01',
                    hora_inicio: '10:00',
                    tipo_partida_id: 1,
                    status: 'aguardando'
                });

                expect(db.query).toHaveBeenCalledWith(
                    expect.any(String),
                    [
                        'Campo A', null, null, null, null,
                        123, false, '2024-12-01', '10:00', null,
                        1, 'aguardando', null
                    ]
                );
            });
        });

        describe('updateByCreator', () => {
            it('deve atualizar partida quando usuário é criador', async () => {
                const mockPartida = {
                    id: 1,
                    local: 'Campo Atualizado',
                    usuario_criador_id: 123
                };

                db.query.mockResolvedValue({ rows: [mockPartida] });

                const resultado = await PartidaModel.updateByCreator(1, 123, {
                    local: 'Campo Atualizado',
                    valor: 30.00
                });

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('UPDATE partida'),
                    ['Campo Atualizado', 30.00, 1, 123]
                );
                expect(resultado).toEqual(mockPartida);
            });

            it('deve retornar partida quando não há campos para atualizar', async () => {
                const mockPartida = { id: 1, local: 'Campo A', usuario_criador_id: 123 };
                db.query.mockResolvedValue({ rows: [mockPartida] });

                const resultado = await PartidaModel.updateByCreator(1, 123, {});

                expect(db.query).toHaveBeenCalledWith(
                    'SELECT * FROM partida WHERE id = $1 AND usuario_criador_id = $2',
                    [1, 123]
                );
                expect(resultado).toEqual(mockPartida);
            });

            it('deve retornar null quando usuário não é criador', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await PartidaModel.updateByCreator(1, 999, {
                    local: 'Campo Atualizado'
                });

                expect(resultado).toBeNull();
            });

            it('deve filtrar apenas campos permitidos', async () => {
                const mockPartida = { id: 1, local: 'Campo B' };
                db.query.mockResolvedValue({ rows: [mockPartida] });

                await PartidaModel.updateByCreator(1, 123, {
                    local: 'Campo B',
                    campo_nao_permitido: 'valor',
                    id: 999 
                });

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('local = $1'),
                    ['Campo B', 1, 123]
                );
            });
        });

        describe('cancelByCreator', () => {
            it('deve cancelar partida quando usuário é criador', async () => {
                const mockPartida = { id: 1, status: 'cancelada' };
                db.query.mockResolvedValue({ rows: [mockPartida] });

                const resultado = await PartidaModel.cancelByCreator(1, 123);

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining("SET status = 'cancelada'"),
                    [1, 123]
                );
                expect(resultado).toEqual(mockPartida);
            });

            it('deve retornar null quando usuário não é criador', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await PartidaModel.cancelByCreator(1, 999);

                expect(resultado).toBeNull();
            });
        });

        describe('findByIdDetailed', () => {
            it('deve retornar partida com detalhes completos', async () => {
                const mockPartida = {
                    id: 1,
                    local: 'Campo A',
                    cidade_nome: 'São Paulo',
                    estado_id: 1,
                    tipo_partida_nome: 'Futebol'
                };

                db.query.mockResolvedValue({ rows: [mockPartida] });

                const resultado = await PartidaModel.findByIdDetailed(1);

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('LEFT JOIN cidade c'),
                    [1]
                );
                expect(resultado).toEqual(mockPartida);
            });

            it('deve retornar null quando partida não encontrada', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await PartidaModel.findByIdDetailed(999);

                expect(resultado).toBeNull();
            });
        });

        describe('findByUserId', () => {
            it('deve retornar partidas criadas pelo usuário ordenadas por data', async () => {
                const mockPartidas = [
                    { id: 2, usuario_criador_id: 123, data: '2024-12-02' },
                    { id: 1, usuario_criador_id: 123, data: '2024-12-01' }
                ];

                db.query.mockResolvedValue({ rows: mockPartidas });

                const resultado = await PartidaModel.findByUserId(123);

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('ORDER BY data DESC, hora_inicio DESC'),
                    [123]
                );
                expect(resultado).toEqual(mockPartidas);
            });

            it('deve retornar array vazio quando usuário não tem partidas', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await PartidaModel.findByUserId(999);

                expect(resultado).toEqual([]);
            });
        });

        describe('findPlayedByUserId', () => {
            it('deve retornar partidas onde usuário participou', async () => {
                const mockPartidas = [
                    { id: 1, participou: true, data: '2024-12-01' }
                ];

                db.query.mockResolvedValue({ rows: mockPartidas });

                const resultado = await PartidaModel.findPlayedByUserId(123);

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('participou = true'),
                    [123]
                );
                expect(resultado).toEqual(mockPartidas);
            });
        });

        describe('findByCity', () => {
            it('deve retornar partidas da cidade especificada', async () => {
                const mockPartidas = [
                    { id: 1, local: 'Campo A' },
                    { id: 2, local: 'Campo B' }
                ];

                db.query.mockResolvedValue({ rows: mockPartidas });

                const resultado = await PartidaModel.findByCity('São Paulo');

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('ILIKE'),
                    ['São Paulo']
                );
                expect(resultado).toEqual(mockPartidas);
            });

            it('deve fazer busca case-insensitive', async () => {
                db.query.mockResolvedValue({ rows: [] });

                await PartidaModel.findByCity('são paulo');

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining("ILIKE '%' || $1 || '%'"),
                    ['são paulo']
                );
            });
        });

        describe('aggregateResumoPorPartida', () => {
            it('deve retornar dados agregados da partida', async () => {
                const mockRows = [
                    {
                        jogo_id: 1,
                        time_id: 1,
                        time_nome: 'Time A',
                        time_gols: 2,
                        time_assistencias: 1,
                        time_cartoes_amarelos: 1,
                        time_cartoes_vermelhos: 0,
                        time_participante_id: 1,
                        jogador_id: 1,
                        gol: 1,
                        assistencia: 0,
                        defesa: 0,
                        cartao_amarelo: 0,
                        cartao_vermelho: 0,
                        jogador_nome: 'João Silva'
                    }
                ];

                db.query.mockResolvedValue({ rows: mockRows });

                const resultado = await PartidaModel.aggregateResumoPorPartida(1);

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('WITH time_totais AS'),
                    [1]
                );
                expect(resultado).toEqual(mockRows);
            });

            it('deve retornar array vazio quando não há dados', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await PartidaModel.aggregateResumoPorPartida(999);

                expect(resultado).toEqual([]);
            });
        });
    });

    describe('PartidaService', () => {
        describe('create', () => {
            it('deve criar partida com status padrão aguardando', async () => {
                const mockPartida = { id: 1, status: 'aguardando' };
                vi.spyOn(PartidaModel, 'create').mockResolvedValue(mockPartida);

                const resultado = await PartidaService.create({
                    local: 'Campo A',
                    usuario_criador_id: 123
                });

                expect(PartidaModel.create).toHaveBeenCalledWith({
                    local: 'Campo A',
                    usuario_criador_id: 123,
                    status: 'aguardando'
                });
                expect(resultado).toEqual(mockPartida);
            });
        });

        describe('update', () => {
            it('deve chamar PartidaModel.updateByCreator com parâmetros corretos', async () => {
                const mockPartida = { id: 1, local: 'Campo Atualizado' };
                vi.spyOn(PartidaModel, 'updateByCreator').mockResolvedValue(mockPartida);

                const resultado = await PartidaService.update(1, 123, { local: 'Campo Atualizado' });

                expect(PartidaModel.updateByCreator).toHaveBeenCalledWith(1, 123, { local: 'Campo Atualizado' });
                expect(resultado).toEqual(mockPartida);
            });
        });

        describe('cancel', () => {
            it('deve chamar PartidaModel.cancelByCreator com parâmetros corretos', async () => {
                const mockPartida = { id: 1, status: 'cancelada' };
                vi.spyOn(PartidaModel, 'cancelByCreator').mockResolvedValue(mockPartida);

                const resultado = await PartidaService.cancel(1, 123);

                expect(PartidaModel.cancelByCreator).toHaveBeenCalledWith(1, 123);
                expect(resultado).toEqual(mockPartida);
            });
        });

        describe('findByIdDetailed', () => {
            it('deve chamar PartidaModel.findByIdDetailed', async () => {
                const mockPartida = { id: 1, local: 'Campo A' };
                vi.spyOn(PartidaModel, 'findByIdDetailed').mockResolvedValue(mockPartida);

                const resultado = await PartidaService.findByIdDetailed(1);

                expect(PartidaModel.findByIdDetailed).toHaveBeenCalledWith(1);
                expect(resultado).toEqual(mockPartida);
            });
        });

        describe('listarResumoPorPartida', () => {
            it('deve processar e estruturar dados corretamente', async () => {
                const mockRows = [
                    {
                        jogo_id: 1,
                        time_id: 1,
                        time_nome: 'Time A',
                        time_gols: 2,
                        time_assistencias: 1,
                        time_cartoes_amarelos: 0,
                        time_cartoes_vermelhos: 0,
                        time_participante_id: 1,
                        jogador_id: 1,
                        gol: 1,
                        assistencia: 0,
                        defesa: 0,
                        cartao_amarelo: 0,
                        cartao_vermelho: 0,
                        jogador_nome: 'João Silva'
                    }
                ];

                vi.spyOn(PartidaModel, 'aggregateResumoPorPartida').mockResolvedValue(mockRows);

                const resultado = await PartidaService.listarResumoPorPartida({ partidaId: 1 });

                expect(resultado).toHaveLength(1);
                expect(resultado[0]).toHaveProperty('jogoId', 1);
                expect(resultado[0]).toHaveProperty('times');
                expect(resultado[0].times[0]).toHaveProperty('timeId', 1);
                expect(resultado[0].times[0]).toHaveProperty('nome', 'Time A');
                expect(resultado[0].times[0].totais).toEqual({
                    gols: 2,
                    assistencias: 1,
                    cartoesAmarelos: 0,
                    cartoesVermelhos: 0
                });
                expect(resultado[0].times[0].jogadores[0]).toHaveProperty('nome', 'João Silva');
            });

            it('deve retornar array vazio quando não há dados', async () => {
                vi.spyOn(PartidaModel, 'aggregateResumoPorPartida').mockResolvedValue([]);

                const resultado = await PartidaService.listarResumoPorPartida({ partidaId: 999 });

                expect(resultado).toEqual([]);
            });

            it('deve agrupar corretamente múltiplos jogos e times', async () => {
                const mockRows = [
                    {
                        jogo_id: 1,
                        time_id: 1,
                        time_nome: 'Time A',
                        time_gols: 2,
                        time_assistencias: 1,
                        time_cartoes_amarelos: 0,
                        time_cartoes_vermelhos: 0,
                        time_participante_id: 1,
                        jogador_id: 1,
                        gol: 1,
                        assistencia: 0,
                        defesa: 0,
                        cartao_amarelo: 0,
                        cartao_vermelho: 0,
                        jogador_nome: 'João Silva'
                    },
                    {
                        jogo_id: 1,
                        time_id: 2,
                        time_nome: 'Time B',
                        time_gols: 1,
                        time_assistencias: 0,
                        time_cartoes_amarelos: 1,
                        time_cartoes_vermelhos: 0,
                        time_participante_id: 2,
                        jogador_id: 2,
                        gol: 1,
                        assistencia: 0,
                        defesa: 0,
                        cartao_amarelo: 1,
                        cartao_vermelho: 0,
                        jogador_nome: 'Maria Santos'
                    }
                ];

                vi.spyOn(PartidaModel, 'aggregateResumoPorPartida').mockResolvedValue(mockRows);

                const resultado = await PartidaService.listarResumoPorPartida({ partidaId: 1 });

                expect(resultado).toHaveLength(1);
                expect(resultado[0].times).toHaveLength(2);
                expect(resultado[0].times[0].nome).toBe('Time A');
                expect(resultado[0].times[1].nome).toBe('Time B');
            });
        });
    });

    describe('PartidaController', () => {
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

        describe('create', () => {
            it('deve criar partida com sucesso', async () => {
                const mockPartida = { id: 1, local: 'Campo A' };
                req.body = {
                    local: 'Campo A',
                    data: '2024-12-01',
                    hora_inicio: '10:00',
                    tipo_partida_id: 1,
                    valor: 25.50
                };

                vi.spyOn(PartidaService, 'create').mockResolvedValue(mockPartida);

                await PartidaController.create(req, res, next);

                expect(PartidaService.create).toHaveBeenCalledWith({
                    local: 'Campo A',
                    data: new Date('2024-12-01'),
                    hora_inicio: '10:00',
                    tipo_partida_id: 1,
                    valor: 25.50,
                    usuario_criador_id: 123
                });
                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.json).toHaveBeenCalledWith(mockPartida);
                expect(next).not.toHaveBeenCalled();
            });

            it('deve validar campos obrigatórios', async () => {
                req.body = {};

                await PartidaController.create(req, res, next);

                expect(next).toHaveBeenCalled();
            });
        });

        describe('update', () => {
            it('deve atualizar partida com sucesso', async () => {
                const mockPartida = { id: 1, local: 'Campo Atualizado' };
                req.params.id = '1';
                req.body = { local: 'Campo Atualizado' };

                vi.spyOn(PartidaService, 'update').mockResolvedValue(mockPartida);

                await PartidaController.update(req, res, next);

                expect(PartidaService.update).toHaveBeenCalledWith(1, 123, { 
                    local: 'Campo Atualizado',
                    data: null
                });
                expect(res.json).toHaveBeenCalledWith(mockPartida);
            });

            it('deve retornar 404 quando partida não encontrada ou usuário não é criador', async () => {
                req.params.id = '1';
                req.body = { local: 'Campo Atualizado' };

                vi.spyOn(PartidaService, 'update').mockResolvedValue(null);

                await PartidaController.update(req, res, next);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({ 
                    message: 'Horário não encontrado ou você não é o criador.' 
                });
            });
        });

        describe('cancel', () => {
            it('deve cancelar partida com sucesso', async () => {
                const mockResult = { id: 1, status: 'cancelada' };
                req.params.id = '1';

                vi.spyOn(PartidaService, 'cancel').mockResolvedValue(mockResult);

                await PartidaController.cancel(req, res, next);

                expect(PartidaService.cancel).toHaveBeenCalledWith(1, 123);
                expect(res.json).toHaveBeenCalledWith(mockResult);
            });

            it('deve retornar 404 quando partida não encontrada', async () => {
                req.params.id = '999';
                vi.spyOn(PartidaService, 'cancel').mockResolvedValue(null);

                await PartidaController.cancel(req, res, next);

                expect(res.status).toHaveBeenCalledWith(404);
            });
        });

        describe('getById', () => {
            it('deve retornar partida com detalhes', async () => {
                const mockPartida = { id: 1, local: 'Campo A', cidade_nome: 'São Paulo' };
                req.params.id = '1';

                vi.spyOn(PartidaService, 'findByIdDetailed').mockResolvedValue(mockPartida);

                await PartidaController.getById(req, res, next);

                expect(PartidaService.findByIdDetailed).toHaveBeenCalledWith(1);
                expect(res.json).toHaveBeenCalledWith(mockPartida);
            });

            it('deve retornar 404 quando partida não encontrada', async () => {
                req.params.id = '999';
                vi.spyOn(PartidaService, 'findByIdDetailed').mockResolvedValue(null);

                await PartidaController.getById(req, res, next);

                expect(res.status).toHaveBeenCalledWith(404);
            });
        });

        describe('getByUserId', () => {
            it('deve retornar partidas do usuário', async () => {
                const mockPartidas = [{ id: 1 }, { id: 2 }];
                req.params.userId = '123';

                vi.spyOn(PartidaService, 'findByUserId').mockResolvedValue(mockPartidas);

                await PartidaController.getByUserId(req, res, next);

                expect(PartidaService.findByUserId).toHaveBeenCalledWith(123);
                expect(res.json).toHaveBeenCalledWith(mockPartidas);
            });
        });

        describe('getByCityName', () => {
            it('deve retornar partidas da cidade', async () => {
                const mockPartidas = [{ id: 1, local: 'Campo A' }];
                req.params.city = 'São Paulo';

                vi.spyOn(PartidaService, 'findByCity').mockResolvedValue(mockPartidas);

                await PartidaController.getByCityName(req, res, next);

                expect(PartidaService.findByCity).toHaveBeenCalledWith('São Paulo');
                expect(res.json).toHaveBeenCalledWith(mockPartidas);
            });

            it('deve retornar 400 quando cidade não fornecida', async () => {
                req.params.city = '';

                await PartidaController.getByCityName(req, res, next);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({ message: 'Cidade inválida' });
            });
        });

        describe('listarResumoPorPartida', () => {
            it('deve retornar resumo da partida', async () => {
                const mockResumo = [{ jogoId: 1, times: [] }];
                req.params.partidaId = '1';

                vi.spyOn(PartidaService, 'listarResumoPorPartida').mockResolvedValue(mockResumo);

                await PartidaController.listarResumoPorPartida(req, res);

                expect(PartidaService.listarResumoPorPartida).toHaveBeenCalledWith({ partidaId: 1 });
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith(mockResumo);
            });
        });
    });
});