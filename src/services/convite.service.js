import { ConviteModel } from '../models/convite.model.js';
import { PartidaModel } from '../models/partida.model.js';
import { UsuarioModel } from '../models/usuario.model.js';

export const ConviteService = {
  async enviar({ partida_id, convidado_ids }) {
    const partida = await PartidaModel.findById(partida_id);
    if (!partida) {
      const err = new Error('Partida não encontrada');
      err.status = 404; throw err;
    }
    const results = [];
    for (const uid of convidado_ids) {
      const user = await UsuarioModel.findById(uid);
      if (!user) continue; 
      try {
        const created = await ConviteModel.create({ partida_id, convidado_id: uid });
        results.push({ ok: true, convite: created });
      } catch (e) {
        results.push({ ok: false, error: 'Já convidado', convidado_id: uid });
      }
    }
    return results;
  },

  async confirmar({ convite_id }) {
    const convite = await ConviteModel.findById(convite_id);
    if (!convite) {
      const err = new Error('Convite não encontrado');
      err.status = 404; throw err;
    }
    if (convite.status === 'confirmado') return convite;
    return ConviteModel.setStatus(convite_id, 'confirmado');
  },

  async listar({ partida_id, status }) {
    if (status) {
      return ConviteModel.listByPartidaAndStatus(partida_id, status);
    }
    return ConviteModel.listByPartida(partida_id);
  },
};
