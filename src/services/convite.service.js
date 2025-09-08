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

  async aceitar({ partida_id, usuario_id }) {
    const pending = await ConviteModel.findPending(partida_id, usuario_id);
    if (!pending) return 'not_found';

    const updated = await ConviteModel.updateStatus(pending.id, 'aceito');

    const jogador = await JogadorModel.createUsuarioJogador({ usuario_id, nome: null });
    await ConviteModel.ensureParticipante({
      partida_id,
      jogador_id: jogador.id,
      confirmado: false,
      participou: false,
      nota: null,
    });

    return { convite: updated };
  },

  async recusar({ partida_id, usuario_id }) {
    const pending = await ConviteModel.findPending(partida_id, usuario_id);
    if (!pending) return 'not_found';

    const updated = await ConviteModel.updateStatus(pending.id, 'recusado');
    return { convite: updated };
  },

  async cancelar({ partida_id, usuario_id, solicitante_id }) {
    const partida = await ConviteModel.getPartidaById(partida_id);
    if (!partida) return 'not_found_partida';
    if (partida.usuario_criador_id !== solicitante_id) return 'forbidden';

    const pending = await ConviteModel.findPending(partida_id, usuario_id);
    if (!pending) return 'not_found';

    const updated = await ConviteModel.updateStatus(pending.id, 'cancelado');
    return { convite: updated };
  },

   async listarPorPartida({ partida_id }) {
    return await ConviteModel.listByPartida(partida_id);
  },
};
