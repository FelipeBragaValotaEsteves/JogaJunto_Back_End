import { db } from '../config/database.js';

export const JogoModel = {

    async getPartidaById(id) {
        const q = 'SELECT id, usuario_criador_id FROM public.partida WHERE id = $1';
        const { rows } = await db.query(q, [id]);
        return rows[0] || null;
    },

    async createJogo(partida_id) {
        const q = `
            INSERT INTO public.partida_jogo (partida_id)
            VALUES ($1)
            RETURNING id, partida_id
        `;
        const { rows } = await db.query(q, [partida_id]);
        return rows[0];
    },

    async findJogoById(id) {
        const q = `
            SELECT id, partida_id
            FROM public.partida_jogo
            WHERE id = $1
            LIMIT 1
        `;
        const { rows } = await db.query(q, [id]);
        return rows[0] || null;
    },

    async updateJogo(id, nome) {
        const q = `
            UPDATE public.partida_jogo
            SET nome = $2
            WHERE id = $1
            RETURNING id, nome
        `;
        const { rows } = await db.query(q, [id, nome]);
        return rows[0] || null;
    },

    async deleteTimesByJogoId(jogo_id) {
        await db.query(`DELETE FROM public.partida_jogo_time WHERE partida_jogo_id = $1`, [jogo_id]);
    },

    async deleteJogo(id) {
        await db.query(`DELETE FROM public.partida_jogo WHERE id = $1`, [id]);
    }
}