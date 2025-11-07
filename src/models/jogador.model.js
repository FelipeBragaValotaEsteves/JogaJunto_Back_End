import { db } from '../config/database.js';

export const JogadorModel = {

    async findByUsuarioId(usuario_id) {

        const q = `
            SELECT id, tipo, usuario_id, nome 
            FROM public.jogador
            WHERE usuario_id = $1
        `;
        const { rows } = await db.query(q, [usuario_id]);
        return rows[0] || null;
    },

    async createUsuarioJogador({ usuario_id, nome }) {
        const checkQ = `
            SELECT id, tipo, usuario_id, nome 
            FROM public.jogador 
            WHERE usuario_id = $1
        `;
        const existing = await db.query(checkQ, [usuario_id]);

        if (existing.rows[0]) {
            const updateQ = `
                UPDATE public.jogador 
                SET nome = COALESCE($2, nome)
                WHERE usuario_id = $1
                RETURNING id, tipo, usuario_id, nome
            `;
            const { rows } = await db.query(updateQ, [usuario_id, nome]);
            return rows[0];
        }

        const insertQ = `
            INSERT INTO public.jogador (tipo, usuario_id, nome)
            VALUES ('usuario', $1, $2)
            RETURNING id, tipo, usuario_id, nome
        `;
        const { rows } = await db.query(insertQ, [usuario_id, nome]);
        return rows[0];
    },

    async createExterno({ nome, criado_por }) {
        const q = `
            INSERT INTO public.jogador (tipo, nome, criado_por)
            VALUES ('externo', $1, $2)
            RETURNING id, tipo, usuario_id, nome
        `;
        const { rows } = await db.query(q, [nome, criado_por]);
        return rows[0];
    },

    async ensureParticipante({ partida_id, jogador_id, nota }) {
        const checkQ = `
            SELECT id FROM public.partida_participante
            WHERE partida_id = $1 AND jogador_id = $2
            LIMIT 1
        `;
        const exists = await db.query(checkQ, [partida_id, jogador_id]);
        if (exists.rows[0]) return exists.rows[0];

        const insertQ = `
            INSERT INTO public.partida_participante (partida_id, jogador_id, nota)
            VALUES ($1, $2, $3)
            RETURNING id
        `;
        const { rows } = await db.query(insertQ, [partida_id, jogador_id, nota]);
        return rows[0];
    },

    async findAllDisponiveisByPartida(partida_id, nome) {
        const q = `
            SELECT
                j.usuario_id AS id,
                j.id AS id_jogador,
                j.nome,
                u.img AS foto,
                COALESCE(
                  ARRAY_AGG(DISTINCT p.nome) FILTER (WHERE p.nome IS NOT NULL), 
                  '{}'
                ) AS posicoes
            FROM public.jogador j
            LEFT JOIN public.partida_participante pp 
                ON j.id = pp.jogador_id 
                AND pp.partida_id = $1
            LEFT JOIN public.convite c 
                ON j.usuario_id = c.usuario_id 
                AND c.partida_id = $1
            LEFT JOIN public.usuario u 
                ON j.usuario_id = u.id
            LEFT JOIN public.usuario_posicao up 
                ON u.id = up.usuario_id
            LEFT JOIN public.posicao p 
                ON p.id = up.posicao_id
            JOIN public.partida pa 
                ON pa.id = $1
            WHERE 
                pp.id IS NULL 
                AND (c.id IS NULL OR c.status NOT IN ('aceito', 'pendente'))
                AND j.usuario_id <> pa.usuario_criador_id
            GROUP BY 
                j.usuario_id, j.id, j.nome, u.img 
            ORDER BY 
                j.nome ASC;
        `;
        const params = nome ? [partida_id, `%${nome}%`] : [partida_id];
        const { rows } = await db.query(q, params);
        return rows;
    },

    async findAllDisponiveisByJogo(partidaId, jogoId, nome) {
        const q = `
            SELECT
                j.usuario_id AS id,
                j.id AS id_jogador,
                j.nome,
                u.img AS foto,
                COALESCE(
                  ARRAY_AGG(DISTINCT p.nome) FILTER (WHERE p.nome IS NOT NULL), 
                  '{}'
                ) AS posicoes
            FROM public.jogador j
            INNER JOIN public.partida_participante pp 
                ON j.id = pp.jogador_id 
                AND pp.partida_id = $1
            LEFT JOIN public.partida_jogo_time_participante pjtp
                ON pp.id = pjtp.partida_participante_id
            LEFT JOIN public.partida_jogo_time pjt
                ON pjtp.partida_jogo_time_id = pjt.id
                AND pjt.partida_jogo_id = $2
            LEFT JOIN public.usuario u
                ON j.usuario_id = u.id
            LEFT JOIN public.usuario_posicao up
                ON u.id = up.usuario_id
            LEFT JOIN public.posicao p 
                ON p.id = up.posicao_id
            WHERE 
                pjt.id IS NULL 
            GROUP BY 
                j.usuario_id, j.id, j.nome, u.img 
            ORDER BY 
                j.nome ASC;
        `;
        const params = nome ? [partida_id, `%${nome}%`] : [partida_id];
        const { rows } = await db.query(q, params);
        return rows;
    },

    async findAllByPartida(partida_id) {
        const q = `
            SELECT 
                j.id,
                j.nome,
                u.img as foto,
                COALESCE(lc.status, 'Inserido Manualmente') as status,
                array_agg(DISTINCT p.nome) AS posicoes
            FROM public.jogador j
            LEFT JOIN LATERAL (
                SELECT c.status
                FROM public.convite c
                WHERE c.usuario_id = j.usuario_id AND c.partida_id = $1
                ORDER BY c.id DESC
                LIMIT 1
            ) lc ON true
            LEFT JOIN public.partida_participante pp ON j.id = pp.jogador_id AND pp.partida_id = $1
            LEFT JOIN public.usuario u ON j.usuario_id = u.id 
            LEFT JOIN public.usuario_posicao up ON u.id = up.usuario_id 
            LEFT JOIN public.posicao p ON p.id = up.posicao_id 
            WHERE pp.id IS NOT NULL OR lc.status IS NOT NULL
            GROUP BY j.id, j.nome, u.img, lc.status
            ORDER BY j.nome ASC;
        `;
        const { rows } = await db.query(q, [partida_id]);
        return rows;
    },
}


