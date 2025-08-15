import { db } from '../config/database.js';

export const UsuarioPosicaoModel = {
    async getByUsuarioId(userId) {
        const { rows } = await db.query(
            'SELECT posicao_id FROM usuario_posicao WHERE usuario_id = $1',
            [userId]
        );
        return rows;
    },

    async addMany(userId, posicoesIds) {
        for (const pid of posicoesIds) {
            await db.query(
                'INSERT INTO usuario_posicao (usuario_id, posicao_id) VALUES ($1, $2)',
                [userId, pid]
            );
        }
    },

    async removeMany(userId, posicoesIds) {
        await db.query(
            `DELETE FROM usuario_posicao 
       WHERE usuario_id = $1 AND posicao_id = ANY($2::int[])`,
            [userId, posicoesIds]
        );
    }
};
