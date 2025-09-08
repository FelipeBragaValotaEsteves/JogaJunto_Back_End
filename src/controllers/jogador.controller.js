import { JogadorService } from '../services/jogador.service.js';

export const JogadorController = {
    async criarExterno(req, res) {
        try {
            const criado_por = req.user?.id;
            const { nome, posicao } = req.body;
            const jogador = await JogadorService.criarExterno({ nome, posicao, criado_por });
            return res.status(201).json(jogador);
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Erro ao criar jogador externo.' });
        }
    },

    async adicionarExternoAPartida(req, res) {
        try {
            const criado_por = req.user?.id;
            const { partida_id, jogador_id, nome, posicao } = req.body;
            const result = await JogadorService.adicionarExternoAPartida({ partida_id, jogador_id, nome, posicao, criado_por });
            return res.status(201).json(result);
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Erro ao adicionar jogador à partida.' });
        }
    }
}

