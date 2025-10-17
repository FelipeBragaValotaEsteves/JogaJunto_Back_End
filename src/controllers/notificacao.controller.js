import { NotificacaoService } from '../services/notificacao.service.js';

export const NotificacaoController = {
  async listarPorUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      const data = await NotificacaoService.listarPorUsuario(Number(usuarioId));
      return res.status(200).json(data);
    } catch {
      return res.status(500).json({ message: 'Erro ao listar notificações.' });
    }
  },
};
