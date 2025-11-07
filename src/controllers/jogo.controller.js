import { JogoService } from '../services/jogo.service.js';
import { TimeService } from '../services/time.service.js';

export const JogoController = {
  async criarJogo(req, res) {
    try {
      const solicitanteId = req.user?.id;
      const time1 = req.body.time1;
      const time2 = req.body.time2;
      const { partidaId } = req.body;
      const data = await JogoService.criarJogo({ partidaId, solicitanteId });
      if (data === 'not_found_partida') return res.status(404).json({ message: 'Partida não encontrada.' });
      if (data === 'forbidden') return res.status(403).json({ message: 'Apenas o organizador pode criar jogos.' });

      const time1Data = await TimeService.criarTime({ jogoId: data.id, nome: time1, solicitanteId });
      if (time1Data === 'forbidden') return res.status(403).json({ message: 'Apenas o organizador pode criar o time 1.' });
      if (time1Data === 'invalid_data') return res.status(400).json({ message: 'Dados inválidos para o time 1.' });

      const time2Data = await TimeService.criarTime({ jogoId: data.id, nome: time2, solicitanteId });
      if (time2Data === 'forbidden') return res.status(403).json({ message: 'Apenas o organizador pode criar o time 2.' });
      if (time2Data === 'invalid_data') return res.status(400).json({ message: 'Dados inválidos para o time 2.' });

      return res.status(201).json({ jogo: data, time1: time1Data, time2: time2Data });
    } catch {
      return res.status(500).json({ message: 'Erro ao criar jogo.' });
    }
  },

  async excluirJogo(req, res) {
    try {
      const solicitanteId = req.user?.id;
      const { jogoId } = req.params;
      const data = await JogoService.excluirJogo({ jogoId: Number(jogoId), solicitanteId });
      if (data === 'not_found_jogo') return res.status(404).json({ message: 'Jogo não encontrado.' });
      if (data === 'forbidden') return res.status(403).json({ message: 'Apenas o organizador pode excluir.' });
      return res.status(200).json({ message: 'Jogo excluído com sucesso.' });
    } catch {
      return res.status(500).json({ message: 'Erro ao excluir jogo.' });
    }
  },
  async obterJogo(req, res) {
    try {
      const solicitanteId = req.user?.id;
      const { jogoId } = req.params;
      const data = await JogoService.obterJogo({ jogoId: Number(jogoId), solicitanteId });
      if (data === 'not_found_jogo') return res.status(404).json({ message: 'Jogo não encontrado.' });
      return res.status(200).json(data);
    } catch {
      return res.status(500).json({ message: 'Erro ao obter jogo.' });
    }
  },
};
