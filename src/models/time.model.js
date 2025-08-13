import { db } from '../config/database.js';

export const TimeModel = {
  async setBulk(partida_id, entries) {
    const client = await db.query('BEGIN').then(() => db).catch(() => null);
    try {
      await db.query('DELETE FROM formacoes_times WHERE partida_id = $1', [partida_id]);

      for (const e of entries) {
        await db.query(
          `INSERT INTO formacoes_times (partida_id, jogador_id, time_label)
           VALUES ($1, $2, $3)
           ON CONFLICT (partida_id, jogador_id)
           DO UPDATE SET time_label = EXCLUDED.time_label`,
          [partida_id, e.jogador_id, e.time_label]
        );
      }

      await db.query('COMMIT');
      return this.getByPartida(partida_id);
    } catch (err) {
      await db.query('ROLLBACK');
      throw err;
    }
  },

  async clear(partida_id) {
    await db.query('DELETE FROM formacoes_times WHERE partida_id = $1', [partida_id]);
    return { ok: true };
  },

  async getByPartida(partida_id) {
    const { rows } = await db.query(
      `SELECT f.*, u.nome, u.email
       FROM formacoes_times f
       JOIN usuarios u ON u.id = f.jogador_id
       WHERE f.partida_id = $1
       ORDER BY time_label, u.nome`,
      [partida_id]
    );
    return rows;
  },
};
