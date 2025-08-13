import { z } from 'zod';
import { ConviteService } from '../services/convite.service.js';

export const ConviteController = {
  async enviar(req, res, next) {
    try {
      const paramsSchema = z.object({ id: z.string().uuid() });
      const bodySchema = z.object({ convidado_ids: z.array(z.string().uuid()).min(1) });
      const { id: partida_id } = paramsSchema.parse(req.params);
      const { convidado_ids } = bodySchema.parse(req.body);

      const results = await ConviteService.enviar({ partida_id, convidado_ids });
      res.status(201).json({ results });
    } catch (err) { next(err); }
  },

  async confirmar(req, res, next) {
    try {
      const schema = z.object({ id: z.string().uuid() });
      const { id } = schema.parse(req.params);
      const updated = await ConviteService.confirmar({ convite_id: id });
      res.json(updated);
    } catch (err) { next(err); }
  },

  async listar(req, res, next) {
    try {
      const paramsSchema = z.object({ id: z.string().uuid() });
      const querySchema = z.object({ status: z.enum(['pendente', 'confirmado', 'recusado']).optional() });
      const { id: partida_id } = paramsSchema.parse(req.params);
      const { status } = querySchema.parse(req.query);

      const list = await ConviteService.listar({ partida_id, status });
      res.json(list);
    } catch (err) { next(err); }
  },
};
