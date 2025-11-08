import { db } from '../config/database.js';

export const JogadorModel = {

    async findByUsuarioId(usuario_id) {

        const q = `
            SELECT id, tipo, usuario_id, nome 
            FROM jogador
            WHERE usuario_id = $1
        `;
        const { rows } = await db.query(q, [usuario_id]);
        return rows[0] || null;
    },

    async createUsuarioJogador({ usuario_id, nome }) {
        const checkQ = `
            SELECT id, tipo, usuario_id, nome 
            FROM jogador 
            WHERE usuario_id = $1
        `;
        const existing = await db.query(checkQ, [usuario_id]);

        if (existing.rows[0]) {
            const updateQ = `
                UPDATE jogador 
                SET nome = COALESCE($2, nome)
                WHERE usuario_id = $1
                RETURNING id, tipo, usuario_id, nome
            `;
            const { rows } = await db.query(updateQ, [usuario_id, nome]);
            return rows[0];
        }

        const insertQ = `
            INSERT INTO jogador (tipo, usuario_id, nome)
            VALUES ('usuario', $1, $2)
            RETURNING id, tipo, usuario_id, nome
        `;
        const { rows } = await db.query(insertQ, [usuario_id, nome]);
        return rows[0];
    },

    async createExterno({ nome, criado_por }) {
        const q = `
            INSERT INTO jogador (tipo, nome, criado_por)
            VALUES ('externo', $1, $2)
            RETURNING id, tipo, usuario_id, nome
        `;
        const { rows } = await db.query(q, [nome, criado_por]);
        return rows[0];
    },

    async ensureParticipante({ partida_id, jogador_id, nota }) {
        const checkQ = `
            SELECT id FROM partida_participante
            WHERE partida_id = $1 AND jogador_id = $2
            LIMIT 1
        `;
        const exists = await db.query(checkQ, [partida_id, jogador_id]);
        if (exists.rows[0]) return exists.rows[0];

        const insertQ = `
            INSERT INTO partida_participante (partida_id, jogador_id, nota)
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
            FROM jogador j
            LEFT JOIN partida_participante pp 
                ON j.id = pp.jogador_id 
                AND pp.partida_id = $1
            LEFT JOIN convite c 
                ON j.usuario_id = c.usuario_id 
                AND c.partida_id = $1
            LEFT JOIN usuario u 
                ON j.usuario_id = u.id
            LEFT JOIN usuario_posicao up 
                ON u.id = up.usuario_id
            LEFT JOIN posicao p 
                ON p.id = up.posicao_id
            JOIN partida pa 
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

    async findAllDisponiveisByJogo(partida_id, jogo_id) {
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
            FROM jogador j
            INNER JOIN partida_participante pp 
                ON j.id = pp.jogador_id 
                AND pp.partida_id = $1
            LEFT JOIN partida_jogo_time_participante pjtp
                ON pp.id = pjtp.partida_participante_id
            LEFT JOIN partida_jogo_time pjt
                ON pjtp.partida_jogo_time_id = pjt.id
                AND pjt.partida_jogo_id = $2
            LEFT JOIN usuario u
                ON j.usuario_id = u.id
            LEFT JOIN usuario_posicao up
                ON u.id = up.usuario_id
            LEFT JOIN posicao p 
                ON p.id = up.posicao_id
            WHERE 
                pjt.id IS NULL 
            GROUP BY 
                j.usuario_id, j.id, j.nome, u.img 
            ORDER BY 
                j.nome ASC;
        `;

        const { rows } = await db.query(q, [partida_id, jogo_id]);
        return rows;
    },

    async findAllByPartida(partida_id) {
        const q = `
            SELECT 
                j.id,
                j.nome,
                u.img as foto,
                pp.id as partida_participante_id,
                lc.id as convite_id,
                COALESCE(lc.status, 'manual') as status,
                array_agg(DISTINCT p.nome) AS posicoes
            FROM jogador j
            LEFT JOIN LATERAL (
                SELECT c.status, c.id 
                FROM convite c
                WHERE c.usuario_id = j.usuario_id AND c.partida_id = $1
                ORDER BY c.id DESC
                LIMIT 1
            ) lc ON true
            LEFT JOIN partida_participante pp ON j.id = pp.jogador_id AND pp.partida_id = $1
            LEFT JOIN usuario u ON j.usuario_id = u.id 
            LEFT JOIN usuario_posicao up ON u.id = up.usuario_id 
            LEFT JOIN posicao p ON p.id = up.posicao_id 
            WHERE pp.id IS NOT NULL OR lc.status IS NOT NULL
            GROUP BY j.id, j.nome, u.img, lc.id, lc.status, pp.id 
            ORDER BY j.nome ASC;
        `;
        const { rows } = await db.query(q, [partida_id]);
        return rows;
    },

    async updateNomeByUsuarioId(usuario_id, nome) {
        const q = `
            UPDATE jogador 
            SET nome = $2
            WHERE usuario_id = $1
            RETURNING id, tipo, usuario_id, nome
        `;
        const { rows } = await db.query(q, [usuario_id, nome]);
        return rows[0] || null;
    },
}


