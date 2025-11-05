import { db } from '../config/database.js';

export const TimeParticipanteModel = {

  async getPartidaInfoByTimeId(timeId) {
    const q = `
    SELECT p.id AS partida_id, p.usuario_criador_id
    FROM public.partida_jogo_time t
    JOIN public.partida_jogo j ON j.id = t.partida_jogo_id
    JOIN public.partida p ON p.id = j.partida_id
    WHERE t.id = $1
    LIMIT 1
  `;
    const { rows } = await db.query(q, [timeId]);
    return rows[0] || null;
  },

  async getPartidaInfoByTimeParticipanteId(tpId) {
    const q = `
    SELECT p.id AS partida_id, p.usuario_criador_id
    FROM public.partida_jogo_time_participante tp
    JOIN public.partida_jogo_time t ON t.id = tp.partida_jogo_time_id
    JOIN public.partida_jogo j ON j.id = t.partida_jogo_id
    JOIN public.partida p ON p.id = j.partida_id
    WHERE tp.id = $1
    LIMIT 1
  `;
    const { rows } = await db.query(q, [tpId]);
    return rows[0] || null;
  },

  async jogadorEstaNaPartida(partida_id, jogador_id) {
    const q = `
    SELECT 1
    FROM public.partida_participante
    WHERE partida_id = $1 AND jogador_id = $2
    LIMIT 1
  `;
    const { rows } = await db.query(q, [partida_id, jogador_id]);
    return !!rows[0];
  },

  async existsInTime(timeId, jogadorId) {
    const q = `
    SELECT 1
    FROM public.partida_jogo_time_participante
    WHERE partida_jogo_time_id = $1 AND jogador_id = $2
    LIMIT 1
  `;
    const { rows } = await db.query(q, [timeId, jogadorId]);
    return !!rows[0];
  },

  async insertTimeParticipante({ timeId, jogadorId, posicaoId }) {
    const q = `
    INSERT INTO public.partida_jogo_time_participante
      (partida_jogo_time_id, jogador_id, posicao_id, gol, assistencia, defesa, cartao_amarelo, cartao_vermelho)
    VALUES ($1, $2, NULL, NULL, NULL, NULL, NULL, NULL)
    RETURNING id, partida_jogo_time_id AS "timeId", jogador_id AS "jogadorId", posicao_id AS "posicaoId",
              gol, assistencia, defesa, cartao_amarelo AS "cartaoAmarelo", cartao_vermelho AS "cartaoVermelho"
  `;
    const { rows } = await db.query(q, [timeId, jogadorId]);
    return rows[0];
  },

  async findTimeParticipanteById(id) {
    const q = `
    SELECT id, partida_jogo_time_id, jogador_id, posicao_id,
           gol, assistencia, defesa, cartao_amarelo, cartao_vermelho
    FROM public.partida_jogo_time_participante
    WHERE id = $1
    LIMIT 1
  `;
    const { rows } = await db.query(q, [id]);
    return rows[0] || null;
  },

  async updateTimeParticipante(id, fields) {
    const allowed = ['gol', 'assistencia', 'defesa', 'cartao_amarelo', 'cartao_vermelho', 'posicao_id'];
    const sets = [];
    const values = [];
    let i = 1;

    for (const key of allowed) {
      if (key in fields) {
        sets.push(`${key} = $${i++}`);
        values.push(fields[key]);
      }
    }
    if (sets.length === 0) return null;

    const q = `
    UPDATE public.partida_jogo_time_participante
    SET ${sets.join(', ')}
    WHERE id = $${i}
    RETURNING id, partida_jogo_time_id AS "timeId", jogador_id AS "jogadorId", posicao_id AS "posicaoId",
              gol, assistencia, defesa, cartao_amarelo AS "cartaoAmarelo", cartao_vermelho AS "cartaoVermelho"
  `;
    values.push(id);
    const { rows } = await db.query(q, values);
    return rows[0] || null;
  }
};
