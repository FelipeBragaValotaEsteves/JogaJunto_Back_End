import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TipoModel } from '../src/models/tipo.model.js';
import { TipoService } from '../src/services/tipo.service.js';
import { TipoController } from '../src/controllers/tipo.controller.js';

vi.mock('../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

import { db } from '../src/config/database.js';

describe('Testes do Módulo Tipo', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('TipoModel', () => {
        describe('find', () => {
            it('deve retornar tipos ordenados por nome', async () => {
                const mockTipos = [
                    { id: 1, nome: 'Futebol 11' },
                    { id: 2, nome: 'Futebol 7' },
                    { id: 3, nome: 'Futsal' },
                    { id: 4, nome: 'Society' }
                ];

                db.query.mockResolvedValue({ rows: mockTipos });

                const resultado = await TipoModel.find();

                expect(db.query).toHaveBeenCalledWith(
                    'SELECT * FROM tipo_partida\n            ORDER BY nome'
                );
                expect(resultado).toEqual(mockTipos);
            });

            it('deve retornar array vazio quando não há tipos', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await TipoModel.find();

                expect(resultado).toEqual([]);
            });

            it('deve ordenar tipos alfabeticamente por nome', async () => {
                const mockTipos = [
                    { id: 3, nome: 'Futsal' },
                    { id: 1, nome: 'Futebol 11' },
                    { id: 2, nome: 'Society' }
                ];

                db.query.mockResolvedValue({ rows: mockTipos });

                const resultado = await TipoModel.find();

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('ORDER BY nome')
                );
                expect(resultado).toEqual(mockTipos);
            });

            it('deve retornar todos os campos da tabela tipo_partida', async () => {
                const mockTipos = [
                    { 
                        id: 1, 
                        nome: 'Futebol 11',
                        descricao: 'Futebol tradicional com 11 jogadores',
                        max_jogadores: 22,
                        min_jogadores: 22
                    }
                ];

                db.query.mockResolvedValue({ rows: mockTipos });

                const resultado = await TipoModel.find();

                expect(db.query).toHaveBeenCalledWith(
                    expect.stringContaining('SELECT *')
                );
                expect(resultado).toEqual(mockTipos);
            });
        });
    });

    describe('TipoService', () => {
        describe('find', () => {
            it('deve chamar TipoModel.find e retornar resultado', async () => {
                const mockTipos = [
                    { id: 1, nome: 'Futebol 11' },
                    { id: 2, nome: 'Futsal' }
                ];

                vi.spyOn(TipoModel, 'find').mockResolvedValue(mockTipos);

                const resultado = await TipoService.find();

                expect(TipoModel.find).toHaveBeenCalled();
                expect(resultado).toEqual(mockTipos);
            });

            it('deve retornar array vazio quando não há tipos', async () => {
                vi.spyOn(TipoModel, 'find').mockResolvedValue([]);

                const resultado = await TipoService.find();

                expect(resultado).toEqual([]);
            });
        });
    });

    describe('TipoController', () => {
        let req, res, next;

        beforeEach(() => {
            req = {};
            res = {
                json: vi.fn(),
                status: vi.fn().mockReturnThis()
            };
            next = vi.fn();
        });

        describe('find', () => {
            it('deve retornar tipos com sucesso', async () => {
                const mockTipos = [
                    { id: 1, nome: 'Futebol 11' },
                    { id: 2, nome: 'Futsal' },
                    { id: 3, nome: 'Society' }
                ];

                vi.spyOn(TipoService, 'find').mockResolvedValue(mockTipos);

                await TipoController.find(req, res, next);

                expect(TipoService.find).toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith(mockTipos);
                expect(next).not.toHaveBeenCalled();
            });

            it('deve retornar array vazio quando não há tipos', async () => {
                vi.spyOn(TipoService, 'find').mockResolvedValue([]);

                await TipoController.find(req, res, next);

                expect(res.json).toHaveBeenCalledWith([]);
            });

            it('deve funcionar sem parâmetros de requisição', async () => {
                const mockTipos = [{ id: 1, nome: 'Futebol 11' }];
                vi.spyOn(TipoService, 'find').mockResolvedValue(mockTipos);

                await TipoController.find(req, res, next);

                expect(TipoService.find).toHaveBeenCalledWith();
                expect(res.json).toHaveBeenCalledWith(mockTipos);
            });
        });
    });
});