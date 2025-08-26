import { ConviteModel } from '../models/convite.model.js';

export const ConviteService = {
  async create({ partida_id, usuario_id, status }, actorUserId) {
    const created = await ConviteModel.createByCreator({
      partida_id,
      usuario_id,
      status,
      criador_id: actorUserId 
    });

    if (created) return created;

    const existsPending = await ConviteModel.existsPending(partida_id, usuario_id);
    if (existsPending) return 'conflict';

    return null;
  },

  cancel(id, solicitante_id) {
    return ConviteModel.cancelByCreator(id, solicitante_id);
  },

  accept(id, userId) {
    return ConviteModel.acceptByUser(id, userId);
  },

  decline(id, userId) {
    return ConviteModel.declineByUser(id, userId);
  }
};
