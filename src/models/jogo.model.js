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

    async deleteTimesByJogoId(jogo_id) {
        await db.query(`DELETE FROM public.partida_jogo_time WHERE partida_jogo_id = $1`, [jogo_id]);
    },

    async deleteJogo(id) {
        await db.query(`DELETE FROM public.partida_jogo WHERE id = $1`, [id]);
    },

    async aggregateResumoPorJogo(jogoId) {
        const q = `
        WITH time_totais AS (
          SELECT
            t.id AS time_id,
            t.nome AS time_nome,
            j.id AS jogo_id,
            COALESCE(SUM(COALESCE(tp.gol, 0)), 0)             AS time_gols,
            COALESCE(SUM(COALESCE(tp.assistencia, 0)), 0)     AS time_assistencias,
            COALESCE(SUM(COALESCE(tp.cartao_amarelo, 0)), 0)  AS time_cartoes_amarelos,
            COALESCE(SUM(COALESCE(tp.cartao_vermelho, 0)), 0) AS time_cartoes_vermelhos
          FROM public.partida_jogo j
          JOIN public.partida_jogo_time t ON t.partida_jogo_id = j.id
          LEFT JOIN public.partida_jogo_time_participante tp ON tp.partida_jogo_time_id = t.id
          LEFT JOIN public.partida_participante pp ON pp.id = tp.partida_participante_id 
          WHERE j.id = $1
          GROUP BY j.id, t.id
        )
        SELECT
          j.id AS jogo_id,
          t.id AS time_id,
          t.nome AS time_nome,
          tt.time_gols,
          tt.time_assistencias,
          tt.time_cartoes_amarelos,
          tt.time_cartoes_vermelhos,

          tp.id AS time_participante_id,
          pp.jogador_id,
          COALESCE(tp.gol, 0) AS gol,
          COALESCE(tp.assistencia, 0) AS assistencia,
          COALESCE(tp.defesa, 0) AS defesa,
          COALESCE(tp.cartao_amarelo, 0) AS cartao_amarelo,
          COALESCE(tp.cartao_vermelho, 0) AS cartao_vermelho,

          jg.nome AS jogador_nome,
          u.img as foto

        FROM public.partida_jogo j
        JOIN public.partida_jogo_time t ON t.partida_jogo_id = j.id
        LEFT JOIN public.partida_jogo_time_participante tp ON tp.partida_jogo_time_id = t.id
        LEFT JOIN public.partida_participante pp ON pp.id = tp.partida_participante_id
        LEFT JOIN public.jogador jg ON jg.id = pp.jogador_id 
        LEFT JOIN public.usuario u ON u.id = jg.usuario_id 
        JOIN time_totais tt ON tt.time_id = t.id AND tt.jogo_id = j.id
        WHERE j.id = $1 
        ORDER BY t.id, tp.id NULLS LAST
      `;
        const { rows } = await db.query(q, [jogoId]);

        const result = {
            jogoId,
            times: []
        };

        const timesMap = new Map();

        for (const row of rows) {
            if (!timesMap.has(row.time_id)) {
                const time = {
                    timeId: row.time_id,
                    nome: row.time_nome,
                    totais: {
                        gols: row.time_gols,
                        assistencias: row.time_assistencias,
                        cartoesAmarelos: row.time_cartoes_amarelos,
                        cartoesVermelhos: row.time_cartoes_vermelhos
                    },
                    jogadores: []
                };
                timesMap.set(row.time_id, time);
                result.times.push(time);
            }

            if (row.time_participante_id !== null) {
                const jogador = {
                    timeParticipanteId: row.time_participante_id,
                    jogadorId: row.jogador_id,
                    nome: row.jogador_nome,
                    foto: row.foto,
                    eventos: {
                        gol: row.gol,
                        assistencia: row.assistencia,
                        defesa: row.defesa,
                        cartaoAmarelo: row.cartao_amarelo,
                        cartaoVermelho: row.cartao_vermelho
                    }
                };
                timesMap.get(row.time_id).jogadores.push(jogador);
            }
        }

        return result;
    }
}