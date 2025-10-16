import { ConviteService } from '../services/convite.service.js';

export const ConviteController = {
  async criar(req, res) {
    try {
      const solicitante_id = req.user?.id;
      const { partida_id, usuario_id } = req.body;

      const result = await ConviteService.criar({ partida_id, usuario_id, solicitante_id });

      if (result === 'forbidden') return res.status(403).json({ message: 'Apenas o organizador pode convidar.' });
      if (result === 'conflict') return res.status(409).json({ message: 'Já existe convite para este usuário.' });
      if (result === 'not_found') return res.status(404).json({ message: 'Partida não encontrada.' });

      return res.status(201).json(result);
    } catch {
      return res.status(500).json({ message: 'Erro ao criar convite.' });
    }
  },

  async aceitar(req, res) {
    try {
      const authUserId = req.user?.id;
      const { id } = req.params;

      const result = await ConviteService.aceitar({id, authUserId});
      if (result === 'not_found') return res.status(404).json({ message: 'Convite pendente não encontrado.' });

      return res.status(200).json(result);
    } catch {
      return res.status(500).json({ message: 'Erro ao aceitar convite.' });
    }
  },

  async recusar(req, res) {
    try {
      const authUserId = req.user?.id;
      const { id } = req.params;

      const result = await ConviteService.recusar({id, authUserId});
      if (result === 'not_found') return res.status(404).json({ message: 'Convite pendente não encontrado.' });

      return res.status(200).json(result);
    } catch {
      return res.status(500).json({ message: 'Erro ao recusar convite.' });
    }
  },

  async cancelar(req, res) {
    try {
      const solicitante_id = req.user?.id;
      const { id } = req.params;

      const result = await ConviteService.cancelar({id, solicitante_id});

      if (result === 'forbidden') return res.status(403).json({ message: 'Apenas o organizador pode cancelar.' });
      if (result === 'not_found_partida') return res.status(404).json({ message: 'Partida não encontrada.' });
      if (result === 'not_found') return res.status(404).json({ message: 'Convite pendente não encontrado.' });

      return res.status(200).json(result);
    } catch {
      return res.status(500).json({ message: 'Erro ao cancelar convite.' });
    }
  },

  async listarPorPartida(req, res) {
    try {
      const { partidaId } = req.params;
      const data = await ConviteService.listarPorPartida(Number(partidaId));
      return res.status(200).json(data);
    } catch {
      return res.status(500).json({ message: 'Erro ao listar convites.' });
    }
  },

  async listarPorUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      
      const data = await ConviteService.listarPorUsuario(Number(usuarioId));
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao listar convites.' + error });
    }
  },
};
