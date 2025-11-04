import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EstadoModel } from '../src/models/estado.model.js';
import { EstadoService } from '../src/services/estado.service.js';
import { EstadoController } from '../src/controllers/estado.controller.js';

vi.mock('../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

import { db } from '../src/config/database.js';

describe('Testes do Módulo Estado', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('EstadoModel', () => {
        describe('find', () => {
            it('deve retornar lista de estados ordenados por nome', async () => {
                const mockEstados = [
                    { id: 1, nome: 'Acre', sigla: 'AC' },
                    { id: 2, nome: 'Alagoas', sigla: 'AL' },
                    { id: 3, nome: 'Bahia', sigla: 'BA' }
                ];

                db.query.mockResolvedValue({ rows: mockEstados });

                const resultado = await EstadoModel.find();

                expect(db.query).toHaveBeenCalledWith(
                    `SELECT * FROM estado
            ORDER BY nome`
                );
                expect(resultado).toEqual(mockEstados);
            });

            it('deve retornar array vazio quando não há estados', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await EstadoModel.find();

                expect(resultado).toEqual([]);
            });
        });
    });

    describe('EstadoService', () => {
        describe('find', () => {
            it('deve chamar EstadoModel.find e retornar resultado', async () => {
                const mockEstados = [
                    { id: 1, nome: 'São Paulo', sigla: 'SP' },
                    { id: 2, nome: 'Rio de Janeiro', sigla: 'RJ' }
                ];

                vi.spyOn(EstadoModel, 'find').mockResolvedValue(mockEstados);

                const resultado = await EstadoService.find();

                expect(EstadoModel.find).toHaveBeenCalledWith();
                expect(resultado).toEqual(mockEstados);
            });
        });
    });

    describe('EstadoController', () => {
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
            it('deve retornar estados com sucesso', async () => {
                const mockEstados = [
                    { id: 1, nome: 'Minas Gerais', sigla: 'MG' },
                    { id: 2, nome: 'Goiás', sigla: 'GO' }
                ];

                vi.spyOn(EstadoService, 'find').mockResolvedValue(mockEstados);

                await EstadoController.find(req, res, next);

                expect(EstadoService.find).toHaveBeenCalledWith();
                expect(res.json).toHaveBeenCalledWith(mockEstados);
                expect(next).not.toHaveBeenCalled();
            });

            it('deve retornar array vazio quando não há estados', async () => {
                vi.spyOn(EstadoService, 'find').mockResolvedValue([]);

                await EstadoController.find(req, res, next);

                expect(res.json).toHaveBeenCalledWith([]);
                expect(next).not.toHaveBeenCalled();
            });
        });
    });
});