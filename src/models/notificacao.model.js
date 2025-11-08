import { db } from "../config/database.js";

export const NotificacaoModel = {
  async create({ usuario_id, mensagem }) {
    const q = `
      INSERT INTO notificacao (usuario_id, mensagem, vista, datahora_envio)
      VALUES ($1, $2, $3, NOW())
      RETURNING *;
    `;
    const { rows } = await db.query(q, [usuario_id, mensagem, false]);
    return rows[0];
  },

  async listByUsuario(usuario_id) {
    const q = `
      SELECT
        n.id,
        n.usuario_id,
        n.mensagem,
        n.vista,
        n.datahora_envio
      FROM notificacao n
      WHERE n.usuario_id = $1
      ORDER BY n.datahora_envio DESC;
    `;
    const { rows } = await db.query(q, [usuario_id]);
    return rows;
  },
};
