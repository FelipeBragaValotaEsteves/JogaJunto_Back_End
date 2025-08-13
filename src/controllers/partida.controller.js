import { z } from 'zod';
import { PartidaService } from '../services/partida.service.js';

const createSchema = z.object({
  titulo: z.string().min(2),
  data_hora: z.string(), 
  local: z.string().optional()
});

const updateSchema = z.object({
  titulo: z.string().min(2).optional(),
  data_hora: z.string().optional(),
  local: z.string().optional()
});

export const PartidaController = {
  async create(req, res, next) {
    try {
      const data = createSchema.parse(req.body);
      const created = await PartidaService.create({
        ...data,
        data_hora: new Date(data.data_hora),
        organizador_id: req.user.id
      });
      res.status(201).json(created);
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const data = updateSchema.parse(req.body);
      const updated = await PartidaService.update(req.params.id, data);
      res.json(updated);
    } catch (err) { next(err); }
  },

  async cancel(req, res, next) {
    try {
      const result = await PartidaService.cancel(req.params.id);
      res.json(result);
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const found = await PartidaService.findById(req.params.id);
      res.json(found);
    } catch (err) { next(err); }
  }
};
