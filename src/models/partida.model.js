import { db } from '../config/database.js';

const ALLOWED_UPDATE_FIELDS = [
  'local', 'rua', 'bairro', 'numero', 'cidade_id',
  'aberto', 'datahora_inicio', 'datahora_fim', 'tipo_partida_id', 'status', 'valor'
];

export const PartidaModel = {
  async create({
    local, rua = null, bairro = null, numero = null, cidade_id = null,
    usuario_criador_id, aberto = false, datahora_inicio, datahora_fim = null,
    tipo_partida_id, status, valor = null
  }) {
    const { rows } = await db.query(
      `INSERT INTO partida (
         local, rua, bairro, numero, cidade_id,
         usuario_criador_id, aberto, datahora_inicio, datahora_fim,
         tipo_partida_id, status, valor
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        local, rua, bairro, numero, cidade_id,
        usuario_criador_id, aberto, datahora_inicio, datahora_fim,
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
        ORDER BY datahora_inicio DESC`,
      [userId]
    );
    return rows;
  },

  async findPlayedByUserId(userId) {
    const { rows } = await db.query(
      `SELECT * FROM partida p 
       INNER JOIN partida_participante pp ON pp.partida_id = p.id 
       WHERE pp.usuario_id = $1 and participou = true 
      ORDER BY datahora_inicio DESC`,
      [userId]
    );
    return rows;
  }
};
