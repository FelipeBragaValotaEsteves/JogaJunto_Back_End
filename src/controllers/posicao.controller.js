import { PosicaoModel } from '../models/posicao.model.js';

export const PosicaoController = {
  async list(req, res, next) {
    try {
      const rows = await PosicaoModel.listAll();
      res.json(rows); 
    } catch (err) { next(err); }
  },
};
