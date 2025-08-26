import { db } from '../config/database.js';

const STATUS = {
  PENDENTE: 'pendente',
  ACEITO: 'aceito',
  RECUSADO: 'recusado',
  CANCELADO: 'cancelado'
};

export const ConviteModel = {
  async createByCreator({ partida_id, usuario_id, status = STATUS.PENDENTE, criador_id }) {

    const { rows } = await db.query(
      `INSERT INTO convite (usuario_id, partida_id, status)
       SELECT $2, $1, $3
       FROM partida p
       WHERE p.id = $1
         AND p.usuario_criador_id = $4
         AND NOT EXISTS (
           SELECT 1 FROM convite c
            WHERE c.partida_id = $1
              AND c.usuario_id = $2
              AND c.status = 'pendente'
         )
       RETURNING *`,
      [partida_id, usuario_id, status, criador_id]
    );
    return rows[0] ?? null;
  },

  async existsPending(partida_id, usuario_id) {
    const { rows } = await db.query(
      `SELECT 1
         FROM convite
        WHERE partida_id = $1
          AND usuario_id = $2
          AND status = 'pendente'
        LIMIT 1`,
      [partida_id, usuario_id]
    );
    return rows.length > 0;
  },

  async cancelByCreator(convite_id, criador_id) {
    const { rows } = await db.query(
      `UPDATE convite c
          SET status = 'cancelado'
        FROM partida p
       WHERE c.id = $1
         AND p.id = c.partida_id
         AND p.usuario_criador_id = $2
         AND c.status = 'pendente'
       RETURNING c.*`,
      [convite_id, criador_id]
    );
    return rows[0] ?? null;
  },

  async acceptByUser(convite_id, usuario_id) {
    const { rows } = await db.query(
      `UPDATE convite
          SET status = 'aceito'
        WHERE id = $1
          AND usuario_id = $2
          AND status = 'pendente'
        RETURNING *`,
      [convite_id, usuario_id]
    );
    return rows[0] ?? null;
  },

  async declineByUser(convite_id, usuario_id) {
    const { rows } = await db.query(
      `UPDATE convite
          SET status = 'recusado'
        WHERE id = $1
          AND usuario_id = $2
          AND status = 'pendente'
        RETURNING *`,
      [convite_id, usuario_id]
    );
    return rows[0] ?? null;
  }
};
