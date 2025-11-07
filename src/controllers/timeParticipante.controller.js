import { TimeParticipanteService } from '../services/timeParticipante.service.js';

export const TimeParticipanteController = {
  async adicionarJogadorAoTime(req, res) {
    try {
      const solicitanteId = req.user?.id;
      const { timeId, jogadorId } = req.body;

      const out = await TimeParticipanteService.adicionarJogadorAoTime({
        timeId: Number(timeId),
        jogadorId: Number(jogadorId),
        solicitanteId,
      });

      if (out === 'bad_request') return res.status(400).json({ message: 'timeId e jogadorId são obrigatórios.' });
      if (out === 'not_found_time') return res.status(404).json({ message: 'Time do jogo não encontrado.' });
      if (out === 'forbidden') return res.status(403).json({ message: 'Apenas o organizador pode adicionar.' });
      if (out === 'not_participante') return res.status(409).json({ message: 'Jogador não está cadastrado na partida.' });
      if (out === 'conflict') return res.status(409).json({ message: 'Jogador já está neste time.' });

      return res.status(201).json(out); 
    } catch (error){
      return res.status(500).json({ message: 'Erro ao adicionar jogador ao time.' + error.message });
    }
  },

  async atualizarEstatisticas(req, res) {
    try {
      const solicitanteId = req.user?.id;
      
      const { timeParticipanteId } = req.params;
      const payload = req.body;

      const out = await TimeParticipanteService.atualizarEstatisticas({
        timeParticipanteId: Number(timeParticipanteId),
        solicitanteId,
        payload,
      });

      if (out === 'not_found_tp') return res.status(404).json({ message: 'Registro de jogador no time não encontrado.' });
      if (out === 'forbidden') return res.status(403).json({ message: 'Apenas o organizador pode atualizar estatísticas.' });
      if (out === 'no_fields') return res.status(400).json({ message: 'Nenhum campo válido para atualizar.' });

      return res.status(200).json(out);
    } catch {
      return res.status(500).json({ message: 'Erro ao atualizar estatísticas.' });
    }
  },

  async removerJogadorDoTime(req, res) {
    try {
      const solicitanteId = req.user?.id;
      const { timeParticipanteId } = req.params;  

      const out = await TimeParticipanteService.removerJogadorDoTime({
        timeParticipanteId: Number(timeParticipanteId),
        solicitanteId,
      });

      if (out === 'not_found_tp') return res.status(404).json({ message: 'Registro de jogador no time não encontrado.' });
      if (out === 'forbidden') return res.status(403).json({ message: 'Apenas o organizador pode remover jogadores.' });

      return res.status(204).send(out);
    } catch {
      return res.status(500).json({ message: 'Erro ao remover jogador do time.' });
    }
  }
};
