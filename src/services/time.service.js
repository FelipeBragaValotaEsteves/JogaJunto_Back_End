import { TimeModel } from '../models/time.model.js';
import { ConviteModel } from '../models/convite.model.js';
import { PartidaModel } from '../models/partida.model.js';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const TimeService = {
  async validarPartida(partida_id) {
    const partida = await PartidaModel.findById(partida_id);
    if (!partida) {
      const err = new Error('Partida não encontrada');
      err.status = 404; throw err;
    }
    if (partida.status === 'cancelada') {
      const err = new Error('Partida cancelada');
      err.status = 400; throw err;
    }
    return partida;
  },

  /**
   * RF009 - Formação manual
   * payload: { A: string[], B: string[] }  (ids de usuários)
   * Regras: só permite ids que estejam "confirmado" nos convites
   */
  async formarManual({ partida_id, A = [], B = [] }) {
    await this.validarPartida(partida_id);
    const confirmados = await ConviteModel.listByPartidaAndStatus(partida_id, 'confirmado');
    const setConfirmados = new Set(confirmados.map(c => c.convidado_id));

    const all = [...A.map(id => ({ jogador_id: id, time_label: 'A' })), ...B.map(id => ({ jogador_id: id, time_label: 'B' }))];

    for (const e of all) {
      if (!setConfirmados.has(e.jogador_id)) {
        const err = new Error('Todos os jogadores devem estar confirmados');
        err.status = 400; throw err;
      }
    }

    return TimeModel.setBulk(partida_id, all);
  },

  /**
   * RF010 - Formação automática
   * Estratégia simples: embaralha confirmados e divide em 2 times o mais balanceado possível (A e B).
   * (Futuro: usar rating, posição, etc.)
   */
  async formarAutomatico({ partida_id }) {
    await this.validarPartida(partida_id);
    const confirmados = await ConviteModel.listByPartidaAndStatus(partida_id, 'confirmado');
    const ids = shuffle(confirmados.map(c => c.convidado_id));

    const A = [], B = [];
    ids.forEach((id, idx) => (idx % 2 === 0 ? A : B).push(id));

    const entries = [
      ...A.map(id => ({ jogador_id: id, time_label: 'A' })),
      ...B.map(id => ({ jogador_id: id, time_label: 'B' })),
    ];
    return TimeModel.setBulk(partida_id, entries);
  },

  getFormacao(partida_id) {
    return TimeModel.getByPartida(partida_id);
  },

  limpar(partida_id) {
    return TimeModel.clear(partida_id);
  },
};
