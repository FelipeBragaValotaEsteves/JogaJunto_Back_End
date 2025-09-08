import { TimeParticipanteModel } from '../models/timeParticipante.model.js';

export const TimeParticipanteService = {
  async adicionarJogadorAoTime({ timeId, jogadorId, posicaoId, solicitanteId }) {
    if (!timeId || !jogadorId || !posicaoId) return 'bad_request';

    const partidaInfo = await TimeParticipanteModel.getPartidaInfoByTimeId(timeId);
    if (!partidaInfo) return 'not_found_time';
    if (partidaInfo.usuario_criador_id !== solicitanteId) return 'forbidden';

    const isParticipante = await TimeParticipanteModel.jogadorEstaNaPartida(partidaInfo.partida_id, jogadorId);
    if (!isParticipante) return 'not_participante';

    const exists = await TimeParticipanteModel.existsInTime(timeId, jogadorId);
    if (exists) return 'conflict';

    const created = await TimeParticipanteModel.insertTimeParticipante({
      timeId,
      jogadorId,
      posicaoId,
    });

    return created;
  },

  async atualizarEstatisticas({ timeParticipanteId, solicitanteId, payload }) {
    const tp = await TimeParticipanteModel.findTimeParticipanteById(timeParticipanteId);
    if (!tp) return 'not_found_tp';

    const partidaInfo = await TimeParticipanteModel.getPartidaInfoByTimeParticipanteId(timeParticipanteId);
    if (!partidaInfo || partidaInfo.usuario_criador_id !== solicitanteId) return 'forbidden';

    const fields = {};
    if ('gol' in payload) fields.gol = payload.gol;
    if ('assistencia' in payload) fields.assistencia = payload.assistencia;
    if ('defesa' in payload) fields.defesa = payload.defesa;
    if ('cartaoAmarelo' in payload) fields.cartao_amarelo = payload.cartaoAmarelo;
    if ('cartaoVermelho' in payload) fields.cartao_vermelho = payload.cartaoVermelho;
    if ('posicaoId' in payload) fields.posicao_id = payload.posicaoId;

    if (Object.keys(fields).length === 0) return 'no_fields';

    const updated = await TimeParticipanteModel.updateTimeParticipante(timeParticipanteId, fields);
    return updated;
  }
};
