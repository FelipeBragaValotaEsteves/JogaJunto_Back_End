import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PosicaoModel } from '../src/models/posicao.model.js';
import { PosicaoController } from '../src/controllers/posicao.controller.js';

vi.mock('../src/config/database.js', () => ({
    db: {
        query: vi.fn()
    }
}));

import { db } from '../src/config/database.js';

describe('Testes do Módulo Posição', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('PosicaoModel', () => {
        describe('listAll', () => {
            it('deve listar todas as posições ordenadas por id', async () => {
                const mockPosicoes = [
                    { id: 1, nome: 'Goleiro' },
                    { id: 2, nome: 'Zagueiro' },
                    { id: 3, nome: 'Lateral' },
                    { id: 4, nome: 'Meio-campo' },
                    { id: 5, nome: 'Atacante' }
                ];

                db.query.mockResolvedValue({ rows: mockPosicoes });

                const resultado = await PosicaoModel.listAll();

                expect(db.query).toHaveBeenCalledWith(
                    'SELECT id, nome FROM posicao ORDER BY id ASC'
                );
                expect(resultado).toEqual(mockPosicoes);
            });

            it('deve retornar array vazio quando não há posições', async () => {
                db.query.mockResolvedValue({ rows: [] });

                const resultado = await PosicaoModel.listAll();

                expect(resultado).toEqual([]);
            });
        });
    });

    describe('PosicaoController', () => {
        let req, res, next;

        beforeEach(() => {
            req = {};
            res = {
                json: vi.fn(),
                status: vi.fn().mockReturnThis()
            };
            next = vi.fn();
        });

        describe('list', () => {
            it('deve retornar lista de posições com sucesso', async () => {
                const mockPosicoes = [
                    { id: 1, nome: 'Goleiro' },
                    { id: 2, nome: 'Zagueiro' }
                ];

                vi.spyOn(PosicaoModel, 'listAll').mockResolvedValue(mockPosicoes);

                await PosicaoController.list(req, res, next);

                expect(PosicaoModel.listAll).toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith(mockPosicoes);
                expect(next).not.toHaveBeenCalled();
            });

            it('deve retornar array vazio quando não há posições', async () => {
                vi.spyOn(PosicaoModel, 'listAll').mockResolvedValue([]);

                await PosicaoController.list(req, res, next);

                expect(res.json).toHaveBeenCalledWith([]);
            });
        });
    });
});