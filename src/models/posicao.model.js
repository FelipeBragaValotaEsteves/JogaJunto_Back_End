import { db } from '../config/database.js';

export const PosicaoModel = {
  async listAll() {
    const { rows } = await db.query(
      'SELECT id, nome FROM posicao ORDER BY id ASC'
    );
    return rows;
  },
};
