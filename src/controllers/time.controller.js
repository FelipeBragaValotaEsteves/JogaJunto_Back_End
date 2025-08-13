import { z } from 'zod';
import { TimeService } from '../services/time.service.js';

export const TimeController = {
  async manual(req, res, next) {
    try {
      const params = z.object({ id: z.string().uuid() }).parse(req.params);
      const body = z.object({
        A: z.array(z.string().uuid()).default([]),
        B: z.array(z.string().uuid()).default([]),
      }).parse(req.body);

      const formacao = await TimeService.formarManual({ partida_id: params.id, ...body });
      res.status(201).json(formacao);
    } catch (err) { next(err); }
  },

  async automatico(req, res, next) {
    try {
      const params = z.object({ id: z.string().uuid() }).parse(req.params);
      const formacao = await TimeService.formarAutomatico({ partida_id: params.id });
      res.status(201).json(formacao);
    } catch (err) { next(err); }
  },

  async get(req, res, next) {
    try {
      const params = z.object({ id: z.string().uuid() }).parse(req.params);
      const rows = await TimeService.getFormacao(params.id);
      res.json(rows);
    } catch (err) { next(err); }
  },

  async clear(req, res, next) {
    try {
      const params = z.object({ id: z.string().uuid() }).parse(req.params);
      const out = await TimeService.limpar(params.id);
      res.json(out);
    } catch (err) { next(err); }
  },
};
