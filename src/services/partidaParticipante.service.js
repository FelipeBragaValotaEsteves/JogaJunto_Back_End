import { PartidaParticipanteModel } from '../models/partidaParticipante.model.js';

export const PartidaParticipanteService = {

  async remover({ partidaParticipanteId, solicitanteId }) {

    if (!partidaParticipanteId) return 'bad_request';

    const partidaParticipante = await PartidaParticipanteModel.findById(partidaParticipanteId);
    if (!partidaParticipante) return 'not_found_partida_participante';

    const usuarioCriadorId = await PartidaParticipanteModel.getUsuarioCriadorIdByPartidaParticipanteId(partidaParticipanteId);

    if (usuarioCriadorId !== solicitanteId) return 'forbidden';

    await PartidaParticipanteModel.deletePartidaParticipante(partidaParticipanteId);
    return 'ok';
  },
};
