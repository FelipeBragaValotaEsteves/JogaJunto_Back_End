import { JogadorModel } from '../models/jogador.model.js';
import { ConviteModel } from '../models/convite.model.js';

export const JogadorService = {
    async criarExterno({ nome, posicao, criado_por }) {
        if (!nome) { const err = new Error('Nome é obrigatório'); err.status = 400; throw err; }
        const jogador = await JogadorModel.createExterno({ nome, posicao, criado_por });
        return jogador;
    },

    async adicionarExternoAPartida({ partida_id, jogador_id, nome, posicao, criado_por }) {
        const partida = await ConviteModel.getPartidaById(partida_id);
        if (!partida) { const err = new Error('Partida não encontrada'); err.status = 404; throw err; }

        let jId = jogador_id;
        if (!jId) {
            const j = await JogadorModel.createExterno({ nome, posicao, criado_por });
            jId = j.id;
        }

        const participante = await JogadorModel.ensureParticipante({
            partida_id,
            jogador_id: jId,
            confirmado: false,
            participou: false,
            nota: null,
        });

        return { participante_id: participante.id, jogador_id: jId };
    },

    async listarJogadoresDisponiveis() {
        const jogadores = await JogadorModel.findAll();
        return jogadores;
    },
    
    async listarJogadoresDisponiveisPorPartida(partida_id) {
        const jogadores = await JogadorModel.findAll();
        return jogadores.filter(jogador => jogador.partida_id === partida_id);
    
    }
}


