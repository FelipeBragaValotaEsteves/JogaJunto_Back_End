import { db } from '../config/database.js';

export const ConviteModel = {
  async create({ partida_id, convidado_id }) {
    const { rows } = await db.query(
      `INSERT INTO convites (partida_id, convidado_id)
       VALUES ($1, $2)
       RETURNING id, partida_id, convidado_id, status, criado_em`,
      [partida_id, convidado_id]
    );
    return rows[0];
  },

  async setStatus(id, status) {
    const { rows } = await db.query(
      `UPDATE convites SET status = $1 WHERE id = $2
       RETURNING id, partida_id, convidado_id, status, criado_em`,
      [status, id]
    );
    return rows[0] ?? null;
  },

  async listByPartida(partida_id) {
    const { rows } = await db.query(
      `SELECT c.*, u.nome, u.email
       FROM convites c
       JOIN usuarios u ON u.id = c.convidado_id
       WHERE c.partida_id = $1`,
      [partida_id]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await db.query(`SELECT * FROM convites WHERE id = $1`, [id]);
    return rows[0] ?? null;
  },

  async listByPartidaAndStatus(partida_id, status) {
    const { rows } = await db.query(
      `SELECT c.*, u.nome, u.email
       FROM convites c
       JOIN usuarios u ON u.id = c.convidado_id
       WHERE c.partida_id = $1 AND c.status = $2`,
      [partida_id, status]
    );
    return rows;
  },
};
