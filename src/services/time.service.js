import { TimeModel } from '../models/time.model.js';
import { JogoModel } from '../models/jogo.model.js';

export const TimeService = {
  async criarTime({ jogoId, nome, solicitanteId }) {
    const jogo = await JogoModel.findJogoById(jogoId);
    if (!jogo) return 'not_found_jogo';

    const partida = await JogoModel.getPartidaById(jogo.partida_id);
    if (!partida || partida.usuario_criador_id !== solicitanteId) return 'forbidden';

    const time = await TimeModel.createTime(jogoId, nome);
    return time;
  },

  async editarTime({ timeId, nome, solicitanteId }) {
    const time = await TimeModel.findTimeById(timeId);
    if (!time) return 'not_found_time';

    const jogo = await JogoModel.findJogoById(time.partida_jogo_id);
    const partida = await JogoModel.getPartidaById(jogo.partida_id);
    if (!partida || partida.usuario_criador_id !== solicitanteId) return 'forbidden';

    const updated = await TimeModel.updateTime(timeId, { nome });
    return updated;
  },

  async excluirTime({ timeId, solicitanteId }) {
    const time = await TimeModel.findTimeById(timeId);
    if (!time) return 'not_found_time';

    const jogo = await JogoModel.findJogoById(time.partida_jogo_id);
    const partida = await JogoModel.getPartidaById(jogo.partida_id);
    if (!partida || partida.usuario_criador_id !== solicitanteId) return 'forbidden';

    await TimeModel.deleteTime(timeId);
    return 'ok';
  },
};
