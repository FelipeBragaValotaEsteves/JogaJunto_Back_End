import { JogadorService } from '../services/jogador.service.js';

export const JogadorController = {

    async criarExterno(req, res) {
        try {
            const criado_por = req.user?.id;
            const { nome } = req.body;
            const jogador = await JogadorService.criarExterno({ nome, criado_por });
            return res.status(201).json(jogador);
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Erro ao criar jogador externo.' });
        }
    },

    async adicionarExternoAPartida(req, res) {
        try {
            const criado_por = req.user?.id;
            const { partida_id, jogador_id, nome } = req.body;
            const result = await JogadorService.adicionarExternoAPartida({ partida_id, jogador_id, nome, criado_por });
            return res.status(201).json(result);
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Erro ao adicionar jogador à partida.' });
        }
    },

    async listarJogadoresDisponiveis(req, res) {
        try {
            const { partidaId } = req.params;
            const { nome } = req.query;
            const jogadores = await JogadorService.listarJogadoresDisponiveis(partidaId, nome);
            return res.status(200).json(jogadores);
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Erro ao listar jogadores disponíveis.' });
        }
    },

    async listarJogadoresDisponiveisPorJogo(req, res) {
        try {
            const { jogoId } = req.params;

            const jogadores = await JogadorService.listarJogadoresDisponiveisPorJogo(jogoId);
            return res.status(200).json(jogadores);
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Erro ao listar jogadores disponíveis no jogo.' });
        }
    },

    async listarPorPartida(req, res) {
        try {
            const { partidaId } = req.params;
            const jogadores = await JogadorService.listarPorPartida(partidaId);
            return res.status(200).json(jogadores);
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Erro ao listar jogadores disponíveis.' });
        }
    },
}
