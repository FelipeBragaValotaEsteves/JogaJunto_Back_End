import { PartidaParticipanteService } from '../services/partidaParticipante.service.js';

export const PartidaParticipanteController = {

  async removerJogadorDaPartida(req, res) {
    try {
      const solicitanteId = req.user?.id;
      const { partidaParticipanteId } = req.params;

      const out = await PartidaParticipanteService.remover({
        partidaParticipanteId: Number(partidaParticipanteId),
        solicitanteId,
      });

      if (out === 'bad_request') return res.status(400).json({ message: 'partidaParticipanteId é obrigatório.' });
      if (out === 'not_found_partida_participante') return res.status(404).json({ message: 'Participante da partida não encontrado.' });
      if (out === 'forbidden') return res.status(403).json({ message: 'Apenas o organizador pode remover.' });

      return res.status(200).json({ message: 'Participante removido com sucesso.' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao remover participante da partida. ' + error.message });
    }
  },
};
