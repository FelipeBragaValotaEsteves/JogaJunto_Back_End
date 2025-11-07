import { JogoModel } from '../models/jogo.model.js';

export const JogoService = {

    async criarJogo({ partidaId, solicitanteId }) {
        const partida = await JogoModel.getPartidaById(partidaId);
        if (!partida) return 'not_found_partida';
        if (partida.usuario_criador_id !== solicitanteId) return 'forbidden';

        const jogo = await JogoModel.createJogo(partidaId);
        return jogo;
    },

    async excluirJogo({ jogoId, solicitanteId }) {
        const jogo = await JogoModel.findJogoById(jogoId);
        if (!jogo) return 'not_found_jogo';

        const partida = await JogoModel.getPartidaById(jogo.partida_id);
        if (!partida || partida.usuario_criador_id !== solicitanteId) return 'forbidden';

        await JogoModel.deleteTimesByJogoId(jogoId);
        await JogoModel.deleteJogo(jogoId);
        return 'ok';
    },

    async getById(jogoId) {

        const jogo = await JogoModel.findJogoById(jogoId);
        if (!jogo) return 'not_found_jogo';

        return jogo;
    },

    async obterJogo({ jogoId, solicitanteId }) {
        const jogo = await JogoModel.aggregateResumoPorJogo(jogoId);
        if (!jogo) return 'not_found_jogo';

        return jogo;
    },
};
