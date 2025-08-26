import { TipoModel } from '../models/tipo.model.js';

export const TipoService = {
  find() {
    return TipoModel.find();
  },

};