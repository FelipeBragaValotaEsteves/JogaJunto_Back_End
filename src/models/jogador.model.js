import { db } from '../config/database.js';

export const JogadorModel = {
    async createUsuarioJogador({ usuario_id, nome }) {
        const q = `
            INSERT INTO public.jogador (tipo, usuario_id, nome)
            VALUES ('usuario', $1, $2)
            ON CONFLICT (usuario_id)
            DO UPDATE SET nome = COALESCE(EXCLUDED.nome, public.jogador.nome)
            RETURNING id, tipo, usuario_id, nome, posicao
        `;
        const { rows } = await db.query(q, [usuario_id, nome]);
        return rows[0];
    },

    async createExterno({ nome, posicao, criado_por }) {
        const q = `
            INSERT INTO public.jogador (tipo, nome, posicao, criado_por)
            VALUES ('externo', $1, $2, $3)
            RETURNING id, tipo, usuario_id, nome, posicao
        `;
        const { rows } = await db.query(q, [nome, posicao || null, criado_por || null]);
        return rows[0];
    },

    async ensureParticipante({ partida_id, jogador_id, confirmado, participou, nota }) {
        const checkQ = `
            SELECT id FROM public.partida_participante
            WHERE partida_id = $1 AND jogador_id = $2
            LIMIT 1
        `;
        const exists = await db.query(checkQ, [partida_id, jogador_id]);
        if (exists.rows[0]) return exists.rows[0];

        const insertQ = `
            INSERT INTO public.partida_participante (partida_id, jogador_id, confirmado, participou, nota)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `;
        const { rows } = await db.query(insertQ, [partida_id, jogador_id, confirmado, participou, nota]);
        return rows[0];
    },

    async findAll() {
        const q = `
            SELECT id, tipo, usuario_id, nome, posicao, criado_por
            FROM public.jogador
            ORDER BY nome ASC
        `;
        const { rows } = await db.query(q);
        return rows;
    },
    async findAllByPartida(partida_id) {
        const q = `
            SELECT j.id, j.tipo, j.usuario_id, j.nome, j.posicao, j.criado_por
            FROM public.jogador j
            JOIN public.partida_participante pp ON j.id = pp.jogador_id
            WHERE pp.partida_id = $1
            ORDER BY j.nome ASC
        `;
        const { rows } = await db.query(q, [partida_id]);
        return rows;
    },
}


