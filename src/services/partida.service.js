import { PartidaModel } from '../models/partida.model.js';

export const PartidaService = {
  create(data) {
    return PartidaModel.create(data);
  },
  update(id, fields) {
    return PartidaModel.update(id, fields);
  },
  cancel(id) {
    return PartidaModel.cancel(id);
  },
  findById(id) {
    return PartidaModel.findById(id);
  },
  findByUserId(userId) {
    return PartidaModel.findByUserId(id);
  }
};
