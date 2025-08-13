import { db } from '../config/database.js';

export const PartidaModel = {
  async create({ titulo, data_hora, local, organizador_id }) {
    const { rows } = await db.query(
      `INSERT INTO partidas (titulo, data_hora, local, organizador_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, titulo, data_hora, local, status, organizador_id, criado_em`,
      [titulo, data_hora, local, organizador_id]
    );
    return rows[0];
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    if (!keys.length) return this.findById(id);
    const setSql = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const params = [...Object.values(fields), id];
    const { rows } = await db.query(
      `UPDATE partidas SET ${setSql} WHERE id = $${keys.length + 1}
       RETURNING id, titulo, data_hora, local, status, organizador_id, criado_em`,
      params
    );
    return rows[0] ?? null;
  },

  async cancel(id) {
    const { rows } = await db.query(
      `UPDATE partidas SET status = 'cancelada' WHERE id = $1
       RETURNING id, status`,
      [id]
    );
    return rows[0] ?? null;
  },

  async findById(id) {
    const { rows } = await db.query(
      `SELECT * FROM partidas WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },
};
