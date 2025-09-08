import { JogoModel } from '../models/jogo.model.js';

export const JogoService = {
    
    async criarJogo({ partidaId, solicitanteId }) {
        const partida = await JogoModel.getPartidaById(partidaId);
        if (!partida) return 'not_found_partida';
        if (partida.usuario_criador_id !== solicitanteId) return 'forbidden';

        const jogo = await JogoModel.createJogo(partidaId);
        return jogo;
    },

    async editarJogo({ jogoId, nome, solicitanteId }) {
        const jogo = await JogoModel.findJogoById(jogoId);
        if (!jogo) return 'not_found_jogo';

        const partidaAtual = await JogoModel.getPartidaById(jogo.partida_id);
        if (!partidaAtual || partidaAtual.usuario_criador_id !== solicitanteId) return 'forbidden';

        const partida = await JogoModel.getPartidaById(jogo.partida_id);
        if (!partida || partida.usuario_criador_id !== solicitanteId) return 'forbidden';

        const updated = await JogoModel.updateJogo(jogoId, nome);
        return updated;
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
};
