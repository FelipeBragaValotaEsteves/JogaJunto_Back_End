import { db } from '../config/database.js';

export const TimeModel = {
  async createTime(partida_jogo_id, nome) {
    const q = `
      INSERT INTO public.partida_jogo_time (partida_jogo_id, nome)
      VALUES ($1, $2)
      RETURNING id, partida_jogo_id, nome
    `;
    const { rows } = await db.query(q, [partida_jogo_id, nome]);
    return rows[0];
  },

  async findTimeById(id) {
    const q = `
      SELECT id, partida_jogo_id, nome
      FROM public.partida_jogo_time
      WHERE id = $1
      LIMIT 1
    `;
    const { rows } = await db.query(q, [id]);
    return rows[0] || null;
  },

  async updateTime(id, { nome }) {
    const q = `
      UPDATE public.partida_jogo_time
      SET nome = COALESCE($2, nome)
      WHERE id = $1
      RETURNING id, partida_jogo_id, nome
    `;
    const { rows } = await db.query(q, [id, nome ?? null]);
    return rows[0] || null;
  },

  async deleteTime(id) {
    await db.query(`DELETE FROM public.partida_jogo_time WHERE id = $1`, [id]);
  }
};
