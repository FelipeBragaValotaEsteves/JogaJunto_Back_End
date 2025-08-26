import { CidadeModel } from '../models/cidade.model.js';

export const CidadeService = {
  findByStateId(stateId) {
    return CidadeModel.findByStateId(stateId);
  },

};
