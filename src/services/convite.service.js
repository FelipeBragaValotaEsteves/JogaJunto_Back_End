import { ConviteModel } from '../models/convite.model.js';
import { JogadorModel } from '../models/jogador.model.js';

export const ConviteService = {
  async criar({ partida_id, usuario_id, solicitante_id }) {
    const partida = await ConviteModel.getPartidaById(partida_id);
    if (!partida) return 'not_found';
    if (partida.usuario_criador_id !== solicitante_id) return 'forbidden';

    const existsAny = await ConviteModel.existsAny(partida_id, usuario_id);
    if (existsAny) return 'conflict';

    const created = await ConviteModel.create({ partida_id, usuario_id, status: 'pendente' });
    return created;
  },

  async aceitar({id, authUserId}) {
    const pending = await ConviteModel.findPendingById(id);
    if (!pending) return 'not_found';

    if (pending.usuario_id !== authUserId) {
      return 'forbidden';
    }

    const updated = await ConviteModel.updateStatus(pending.id, 'aceito');

    const jogador = await JogadorModel.findByUsuarioId(authUserId);

    if(!jogador) return 'not_found';

    await JogadorModel.ensureParticipante({
      partida_id: pending.partida_id,
      jogador_id: jogador.id,
      nota: null,
    });

    return { convite: updated };
  },

  async recusar({id, authUserId}) {
    const pending = await ConviteModel.findPendingById(id);
    if (!pending) return 'not_found';

    if (pending.usuario_id !== authUserId) {
      return 'forbidden';
    }

    const updated = await ConviteModel.updateStatus(pending.id, 'recusado');
    return { convite: updated };
  },

  async cancelar({id, solicitanteId}) {
    
    const pending = await ConviteModel.findPendingById(id);
    if (!pending) return 'not_found';

    if (pending.usuario_criador_id !== solicitanteId) {
      return 'forbidden';
    }

    const updated = await ConviteModel.updateStatus(pending.id, 'cancelado');
    return { convite: updated };
  },

   async listarPorPartida({partidaId}) {
    return await ConviteModel.listByPartida(partidaId);
  },

  async listarPorUsuario(usuarioId) {
    return await ConviteModel.listByUsuario(usuarioId);
  }
};
