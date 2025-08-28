import { PartidaModel } from '../models/partida.model.js';

const DEFAULT_STATUS = 'aguardando';

export const PartidaService = {
  create(data) {
    const payload = {
      ...data,
      status: DEFAULT_STATUS
    };
    return PartidaModel.create(payload);
  },

  update(id, usuarioId, fields) {
    return PartidaModel.updateByCreator(id, usuarioId, fields);
  },

  cancel(id, usuarioId) {
    return PartidaModel.cancelByCreator(id, usuarioId);
  },

  findByIdDetailed(id) {
    return PartidaModel.findByIdDetailed(id);
  },

  findByUserId(userId) {
    return PartidaModel.findByUserId(userId);
  },

  findPlayedByUserId(userId) {
    return PartidaModel.findPlayedByUserId(userId);
  }
};
