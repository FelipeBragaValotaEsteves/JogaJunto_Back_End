import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CidadeModel } from '../src/models/cidade.model.js';
import { CidadeService } from '../src/services/cidade.service.js';
import { CidadeController } from '../src/controllers/cidade.controller.js';

vi.mock('../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

import { db } from '../src/config/database.js';

describe('Testes do Módulo Cidade', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('CidadeModel', () => {
        describe('findByStateId', () => {
            it('deve retornar cidades para um dado ID de estado', async () => {
                const mockCities = [
                    { id: 1, nome: 'São Paulo', estado_id: 1 },
                    { id: 2, nome: 'Santos', estado_id: 1 },
                    { id: 3, nome: 'Campinas', estado_id: 1 }
                ];

                db.query.mockResolvedValue({ rows: mockCities });

                const result = await CidadeModel.findByStateId(1);

                expect(db.query).toHaveBeenCalledWith(
                    `SELECT * FROM cidade WHERE estado_id = $1
            ORDER BY nome`,
                    [1]
                );
                expect(result).toEqual(mockCities);
            });

            it('deve retornar array vazio quando nenhuma cidade for encontrada', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const result = await CidadeModel.findByStateId(999);

                expect(db.query).toHaveBeenCalledWith(
                    `SELECT * FROM cidade WHERE estado_id = $1
            ORDER BY nome`,
                    [999]
                );
                expect(result).toEqual([]);
            });
        });
    });

    describe('CidadeService', () => {
        describe('findByStateId', () => {
            it('deve chamar CidadeModel.findByStateId com os parâmetros corretos', async () => {
                const mockCities = [
                    { id: 1, nome: 'Rio de Janeiro', estado_id: 2 }
                ];

                vi.spyOn(CidadeModel, 'findByStateId').mockResolvedValue(mockCities);

                const result = await CidadeService.findByStateId(2);

                expect(CidadeModel.findByStateId).toHaveBeenCalledWith(2);
                expect(result).toEqual(mockCities);
            });
        });
    });

    describe('CidadeController', () => {
        let req, res, next;

        beforeEach(() => {
            req = {
                params: {}
            };
            res = {
                json: vi.fn(),
                status: vi.fn().mockReturnThis()
            };
            next = vi.fn();
        });

        describe('findByStateId', () => {
            it('deve retornar cidades quando um ID de estado válido for fornecido', async () => {
                const mockCities = [
                    { id: 1, nome: 'Belo Horizonte', estado_id: 3 },
                    { id: 2, nome: 'Uberlândia', estado_id: 3 }
                ];

                req.params.stateId = '3';
                vi.spyOn(CidadeService, 'findByStateId').mockResolvedValue(mockCities);

                await CidadeController.findByStateId(req, res, next);

                expect(CidadeService.findByStateId).toHaveBeenCalledWith(3);
                expect(res.json).toHaveBeenCalledWith(mockCities);
                expect(next).not.toHaveBeenCalled();
            });

            it('deve retornar array vazio quando nenhuma cidade for encontrada', async () => {
                req.params.stateId = '999';
                vi.spyOn(CidadeService, 'findByStateId').mockResolvedValue([]);

                await CidadeController.findByStateId(req, res, next);

                expect(CidadeService.findByStateId).toHaveBeenCalledWith(999);
                expect(res.json).toHaveBeenCalledWith([]);
                expect(next).not.toHaveBeenCalled();
            });
        });
    });
});