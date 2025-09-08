import { TimeService } from '../services/time.service.js';

export const TimeController = {
  async criarTime(req, res) {
    try {
      const solicitanteId = req.user?.id;
      const { jogoId } = req.params;
      const { nome } = req.body;
      const data = await TimeService.criarTime({ jogoId: Number(jogoId), nome, solicitanteId });
      if (data === 'not_found_jogo') return res.status(404).json({ message: 'Jogo não encontrado.' });
      if (data === 'forbidden') return res.status(403).json({ message: 'Apenas o organizador pode criar times.' });
      return res.status(201).json(data);
    } catch {
      return res.status(500).json({ message: 'Erro ao criar time.' });
    }
  },

  async editarTime(req, res) {
    try {
      const solicitanteId = req.user?.id;
      const { timeId } = req.params;
      const { nome } = req.body;
      const data = await TimeService.editarTime({ timeId: Number(timeId), nome, solicitanteId });
      if (data === 'not_found_time') return res.status(404).json({ message: 'Time não encontrado.' });
      if (data === 'forbidden') return res.status(403).json({ message: 'Apenas o organizador pode editar.' });
      return res.status(200).json(data);
    } catch {
      return res.status(500).json({ message: 'Erro ao editar time.' });
    }
  },

  async excluirTime(req, res) {
    try {
      const solicitanteId = req.user?.id;
      const { timeId } = req.params;
      const data = await TimeService.excluirTime({ timeId: Number(timeId), solicitanteId });
      if (data === 'not_found_time') return res.status(404).json({ message: 'Time não encontrado.' });
      if (data === 'forbidden') return res.status(403).json({ message: 'Apenas o organizador pode excluir.' });
      return res.status(200).json({ message: 'Time excluído com sucesso.' });
    } catch {
      return res.status(500).json({ message: 'Erro ao excluir time.' });
    }
  },
};
