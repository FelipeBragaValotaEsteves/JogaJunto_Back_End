import { NotificacaoModel } from '../models/notificacao.model.js';

export const NotificacaoService = {
    
  async listarPorUsuario({ usuario_id }) {
    return await NotificacaoModel.listByUsuario(usuario_id);
  }
};
