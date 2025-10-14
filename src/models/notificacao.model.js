import { db } from '../config/database.js';

export const NotificacaoModel = {
  async listByUsuario(usuario_id) {
    const q = `
    SELECT
      n.id,
      n.usuario_id,
      n.mensagem,
      n.vista,
      n.datahora_envio
    FROM public.notificacao n
    WHERE n.usuario_id = $1
    ORDER BY n.datahora_envio DESC
  `;
    const { rows } = await db.query(q, [usuario_id]);
    return rows;
  }
};
