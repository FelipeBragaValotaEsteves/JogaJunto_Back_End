import { z } from 'zod';
import { ConviteService } from '../services/convite.service.js';

const Status = z.enum(['pendente', 'aceito', 'recusado', 'cancelado']);

const createSchema = z.object({
  partida_id: z.number().int(),
  usuario_id: z.number().int(),
  status: Status.optional()
});

export const ConviteController = {
  async create(req, res, next) {
    try {
      const data = createSchema.parse(req.body);

      const created = await ConviteService.create(
        {
          partida_id: data.partida_id,
          usuario_id: data.usuario_id,
          status: data.status
        },
        req.user.id 
      );

      if (created === 'conflict') {
        return res.status(409).json({ message: 'Já existe um convite pendente para este usuário nesta partida.' });
      }
      if (!created) {
        return res.status(404).json({ message: 'Partida não encontrada ou você não é o criador.' });
      }
      res.status(201).json(created);
    } catch (err) { next(err); }
  },

  async cancel(req, res, next) {
    try {
      const updated = await ConviteService.cancel(Number(req.params.id), req.user.id);
      if (!updated) {
        return res.status(404).json({ message: 'Convite não encontrado, não está pendente, ou você não é o criador da partida.' });
      }
      res.json(updated);
    } catch (err) { next(err); }
  },

  async accept(req, res, next) {
    try {
      const updated = await ConviteService.accept(Number(req.params.id), req.user.id);
      if (!updated) {
        return res.status(404).json({ message: 'Convite não encontrado, não está pendente, ou você não é o convidado.' });
      }
      res.json(updated);
    } catch (err) { next(err); }
  },

  async decline(req, res, next) {
    try {
      const updated = await ConviteService.decline(Number(req.params.id), req.user.id);
      if (!updated) {
        return res.status(404).json({ message: 'Convite não encontrado, não está pendente, ou você não é o convidado.' });
      }
      res.json(updated);
    } catch (err) { next(err); }
  }
};
