import { EstadoModel } from '../models/estado.model.js';

export const EstadoService = {
  find() {
    return EstadoModel.find();
  },

};