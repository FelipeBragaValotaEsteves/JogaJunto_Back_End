import { db } from '../config/database.js';

const ALLOWED_UPDATE_FIELDS = [
  'local', 'rua', 'bairro', 'numero', 'cidade_id',
  'aberto', 'data', 'hora_inicio', 'hora_fim', 'tipo_partida_id', 'status', 'valor'
];

export const PartidaModel = {
  async create({
    local, rua = null, bairro = null, numero = null, cidade_id = null,
    usuario_criador_id, aberto = false, data, hora_inicio, hora_fim = null,
    tipo_partida_id, status, valor = null
  }) {
    const { rows } = await db.query(
      `INSERT INTO partida (
         local, rua, bairro, numero, cidade_id,
         usuario_criador_id, aberto, data, hora_inicio, hora_fim,
         tipo_partida_id, status, valor
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, $13)
       RETURNING *`,
      [
        local, rua, bairro, numero, cidade_id,
        usuario_criador_id, aberto, data, hora_inicio, hora_fim,
        tipo_partida_id, status, valor
      ]
    );
    return rows[0];
  },

  async updateByCreator(id, usuarioId, fields) {
    const entries = Object.entries(fields).filter(([k]) => ALLOWED_UPDATE_FIELDS.includes(k));
    if (entries.length === 0) {
      const { rows } = await db.query(`SELECT * FROM partida WHERE id = $1 AND usuario_criador_id = $2`, [id, usuarioId]);
      return rows[0] ?? null;
    }

    const setSql = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
    const params = [...entries.map(([, v]) => v), id, usuarioId];

    const { rows } = await db.query(
      `UPDATE partida
         SET ${setSql}
       WHERE id = $${entries.length + 1} AND usuario_criador_id = $${entries.length + 2}
       RETURNING *`,
      params
    );
    return rows[0] ?? null;
  },

  async cancelByCreator(id, usuarioId) {
    const { rows } = await db.query(
      `UPDATE partida
          SET status = 'cancelada'
        WHERE id = $1 AND usuario_criador_id = $2
        RETURNING id, status`,
      [id, usuarioId]
    );
    return rows[0] ?? null;
  },

  async findByIdDetailed(id) {
    const { rows } = await db.query(
      `SELECT
         p.*,
         c.nome  AS cidade_nome,
         e.id AS estado_id,
         t.nome  AS tipo_partida_nome
       FROM partida p
       LEFT JOIN cidade c ON c.id = p.cidade_id
       LEFT JOIN estado e ON e.id = c.estado_id 
       LEFT JOIN tipo_partida t ON t.id = p.tipo_partida_id
       WHERE p.id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async findByUserId(userId) {
    const { rows } = await db.query(
      `SELECT * FROM partida
        WHERE usuario_criador_id = $1
        ORDER BY data DESC, hora_inicio DESC`,
      [userId]
    );
    return rows;
  },

  async findPlayedByUserId(userId) {
    const { rows } = await db.query(
      `SELECT * FROM partida p 
       INNER JOIN partida_participante pp ON pp.partida_id = p.id 
       WHERE pp.usuario_id = $1 and participou = true 
      ORDER BY data DESC, hora_inicio DESC`,
      [userId]
    );
    return rows;
  },

  async findByCity(city) {
    const { rows } = await db.query(
      `SELECT
          p.*
        FROM partida p
        INNER JOIN cidade c ON c.id = p.cidade_id
        WHERE c.nome ILIKE '%' || $1 || '%'`,
      [city]
    );
    return rows;
  },

  // async aggregateResumoPorPartida(partidaId) {
  //   const q = `
  //   SELECT
  //     j.id  AS jogo_id,
  //     t.id  AS time_id,
  //     t.nome AS time_nome,
  //     COALESCE(SUM(COALESCE(tp.gol, 0)), 0)               AS gols,
  //     COALESCE(SUM(COALESCE(tp.assistencia, 0)), 0)       AS assistencias,
  //     COALESCE(SUM(COALESCE(tp.cartao_amarelo, 0)), 0)    AS cartoes_amarelos,
  //     COALESCE(SUM(COALESCE(tp.cartao_vermelho, 0)), 0)   AS cartoes_vermelhos
  //   FROM public.partida_jogo j
  //   JOIN public.partida_jogo_time t ON t.partida_jogo_id = j.id
  //   LEFT JOIN public.partida_jogo_time_participante tp ON tp.partida_jogo_time_id = t.id
  //   WHERE j.partida_id = $1
  //   GROUP BY j.id, t.id, t.nome
  //   ORDER BY j.id, t.id
  // `;
  //   const { rows } = await db.query(q, [partidaId]);
  //   return rows;
  // },

  async aggregateResumoPorPartida(partidaId) {
    const q = `
    WITH time_totais AS (
      SELECT
        t.id AS time_id,
        j.id AS jogo_id,
        COALESCE(SUM(COALESCE(tp.gol, 0)), 0)             AS time_gols,
        COALESCE(SUM(COALESCE(tp.assistencia, 0)), 0)     AS time_assistencias,
        COALESCE(SUM(COALESCE(tp.cartao_amarelo, 0)), 0)  AS time_cartoes_amarelos,
        COALESCE(SUM(COALESCE(tp.cartao_vermelho, 0)), 0) AS time_cartoes_vermelhos
      FROM public.partida_jogo j
      JOIN public.partida_jogo_time t ON t.partida_jogo_id = j.id
      LEFT JOIN public.partida_jogo_time_participante tp ON tp.partida_jogo_time_id = t.id
      WHERE j.partida_id = $1
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
      tp.jogador_id,
      COALESCE(tp.gol, 0) AS gol,
      COALESCE(tp.assistencia, 0) AS assistencia,
      COALESCE(tp.defesa, 0) AS defesa,
      COALESCE(tp.cartao_amarelo, 0) AS cartao_amarelo,
      COALESCE(tp.cartao_vermelho, 0) AS cartao_vermelho,

      jg.nome AS jogador_nome
    FROM public.partida_jogo j
    JOIN public.partida_jogo_time t ON t.partida_jogo_id = j.id
    LEFT JOIN public.partida_jogo_time_participante tp ON tp.partida_jogo_time_id = t.id
    LEFT JOIN public.jogador jg ON jg.id = tp.jogador_id
    JOIN time_totais tt ON tt.time_id = t.id AND tt.jogo_id = j.id
    WHERE j.partida_id = $1 
    ORDER BY j.id, t.id, tp.id NULLS LAST
  `;
    const { rows } = await db.query(q, [partidaId]);
    return rows;
  }
};
