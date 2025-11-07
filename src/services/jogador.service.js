import { JogadorModel } from '../models/jogador.model.js';
import { ConviteModel } from '../models/convite.model.js';
import { JogoModel } from '../models/jogo.model.js';

export const JogadorService = {
    async criarExterno({ nome, criado_por }) {
        if (!nome) { const err = new Error('Nome é obrigatório'); err.status = 400; throw err; }
        const jogador = await JogadorModel.createExterno({ nome, criado_por });
        return jogador;
    },

    async adicionarExternoAPartida({ partida_id, jogador_id, nome, criado_por }) {
        const partida = await ConviteModel.getPartidaById(partida_id);
        if (!partida) { const err = new Error('Partida não encontrada'); err.status = 404; throw err; }

        let jId = jogador_id;
        if (!jId) {
            const j = await JogadorModel.createExterno({ nome, criado_por });
            jId = j.id;
        }

        const participante = await JogadorModel.ensureParticipante({
            partida_id,
            jogador_id: jId,
            nota: null,
        });

        return { participante_id: participante.id, jogador_id: jId };
    },

    async listarJogadoresDisponiveis(partidaId, nome) {

        const jogadores = await JogadorModel.findAllDisponiveisByPartida(partidaId, nome);
        return jogadores;
    },

    async listarJogadoresDisponiveisPorJogo(jogoId) {

        const jogo = await JogoModel.findJogoById(jogoId);
        if (!jogo) { const err = new Error('Jogo não encontrado'); err.status = 404; throw err; }

        const jogadores = await JogadorModel.findAllDisponiveisByJogo(jogo.partida_id, jogoId);
        return jogadores;
    },

    async listarPorPartida(partidaId) {
        const jogadores = await JogadorModel.findAllByPartida(partidaId);
        return jogadores;
    }
}


