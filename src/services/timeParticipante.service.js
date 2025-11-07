import { TimeParticipanteModel } from '../models/timeParticipante.model.js';

export const TimeParticipanteService = {
  async adicionarJogadorAoTime({ timeId, jogadorId, solicitanteId }) {
    
    if (!timeId || !jogadorId) return 'bad_request';

    const partidaInfo = await TimeParticipanteModel.getPartidaInfoByTimeId(timeId);
    if (!partidaInfo) return 'not_found_time';
    if (partidaInfo.usuario_criador_id !== solicitanteId) return 'forbidden';
    const isParticipante = await TimeParticipanteModel.jogadorEstaNaPartida(partidaInfo.partida_id, jogadorId);
    if (!isParticipante) return 'not_participante';

    const exists = await TimeParticipanteModel.existsInTime(timeId, jogadorId);
    if (exists) return 'conflict';

    const partidaParticipanteId = await TimeParticipanteModel.getPartidaParticipanteId(partidaInfo.partida_id, jogadorId);

    const created = await TimeParticipanteModel.insertTimeParticipante({
      timeId,
      partidaParticipanteId
    });

    return created;
  },

  async atualizarEstatisticas({ timeParticipanteId, solicitanteId, payload }) {
    const tp = await TimeParticipanteModel.findTimeParticipanteById(timeParticipanteId);
    if (!tp) return 'not_found_tp';

    const partidaInfo = await TimeParticipanteModel.getPartidaInfoByTimeParticipanteId(timeParticipanteId);
    console.log(partidaInfo, solicitanteId);
    
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
  },

  async removerJogadorDoTime({ timeParticipanteId, solicitanteId }) {

    const tp = await TimeParticipanteModel.findTimeParticipanteById(timeParticipanteId);
    if (!tp) return 'not_found_tp';

    const partidaInfo = await TimeParticipanteModel.getPartidaInfoByTimeParticipanteId(timeParticipanteId);
    if (!partidaInfo || partidaInfo.usuario_criador_id !== solicitanteId) return 'forbidden';

    await TimeParticipanteModel.deleteTimeParticipante(timeParticipanteId);
    return 'ok';
  }
};
