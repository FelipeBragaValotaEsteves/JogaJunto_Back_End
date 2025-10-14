import { db } from '../config/database.js';

export const ConviteModel = {
  async getPartidaById(id) {
    const q = 'SELECT id, usuario_criador_id FROM public.partida WHERE id = $1';
    const { rows } = await db.query(q, [id]);
    return rows[0] || null;
  },

  async existsAny(partida_id, usuario_id) {
    const q = `
    SELECT 1
    FROM public.convite
    WHERE partida_id = $1 AND usuario_id = $2
    LIMIT 1
  `;
    const { rows } = await db.query(q, [partida_id, usuario_id]);
    return !!rows[0];
  },

  async create({ partida_id, usuario_id, status }) {
    const q = `
    INSERT INTO public.convite (usuario_id, partida_id, status)
    VALUES ($1, $2, $3)
    RETURNING id, usuario_id, partida_id, status
  `;
    const { rows } = await db.query(q, [usuario_id, partida_id, status]);
    return rows[0];
  },

  async findPending(partida_id, usuario_id) {
    const q = `
    SELECT id, usuario_id, partida_id, status
    FROM public.convite
    WHERE partida_id = $1 AND usuario_id = $2 AND status = 'pendente'
    LIMIT 1
  `;
    const { rows } = await db.query(q, [partida_id, usuario_id]);
    return rows[0] || null;
  },

  async findPendingById(id) {
    const q = `
    SELECT c.id, c.usuario_id, c.partida_id, c.status, p.usuario_criador_id
    FROM public.convite c
    INNER JOIN public.partida p ON p.id = c.partida_id
    WHERE c.id = $1 AND c.status = 'pendente'
    LIMIT 1
  `;
    const { rows } = await db.query(q, [id]);
    return rows[0] || null;
  },

  async updateStatus(id, status) {
    const q = `
    UPDATE public.convite
    SET status = $2
    WHERE id = $1
    RETURNING id, usuario_id, partida_id, status
  `;
    const { rows } = await db.query(q, [id, status]);
    return rows[0] || null;
  },

  async ensureParticipante({ partida_id, jogador_id, confirmado, participou, nota }) {
    const checkQ = `
    SELECT id FROM public.partida_participante
    WHERE partida_id = $1 AND jogador_id = $2
    LIMIT 1
  `;
    const exists = await db.query(checkQ, [partida_id, jogador_id]);
    if (exists.rows[0]) return exists.rows[0];

    const insertQ = `
    INSERT INTO public.partida_participante (partida_id, jogador_id, confirmado, participou, nota)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, partida_id, jogador_id, confirmado, participou, nota
  `;
    const { rows } = await db.query(insertQ, [partida_id, jogador_id, confirmado, participou, nota]);
    return rows[0];
  },

  async listByPartida(partida_id) {
    const q = `
    SELECT
      c.id                AS convite_id,
      c.partida_id,
      c.usuario_id,
      COALESCE(u.nome, '') AS nome,
      COALESCE(u.foto_url, u.imagem_url, u.avatar_url, u.foto, u.imagem) AS imagem_url,
      c.status
    FROM public.convite c
    JOIN public.usuario u ON u.id = c.usuario_id
    WHERE c.partida_id = $1
    ORDER BY c.id DESC
  `;
    const { rows } = await db.query(q, [partida_id]);
    return rows;
  },

  async listByUsuario(usuario_id) {
    const q = `
    SELECT
      c.id AS convite_id,
      c.partida_id,
      c.status
    FROM public.convite c
    WHERE c.usuario_id = $1
    ORDER BY c.id DESC
  `;
    const { rows } = await db.query(q, [usuario_id]);
    return rows;
  }
};
