import { db } from '../config/database.js';

export const TimeParticipanteModel = {

  async getPartidaParticipanteId(partida_id, jogador_id) {
    const q = `
    SELECT id FROM partida_participante
    WHERE partida_id = $1 AND jogador_id = $2
    LIMIT 1
  `;
    const { rows } = await db.query(q, [partida_id, jogador_id]);
    return rows[0] ? rows[0].id : null;
  },

  async getPartidaInfoByTimeId(timeId) {
    const q = `
    SELECT p.id AS partida_id, p.usuario_criador_id
    FROM partida_jogo_time t
    JOIN partida_jogo j ON j.id = t.partida_jogo_id
    JOIN partida p ON p.id = j.partida_id
    WHERE t.id = $1
    LIMIT 1
  `;
    const { rows } = await db.query(q, [timeId]);
    return rows[0] || null;
  },

  async getPartidaInfoByTimeParticipanteId(tpId) {
    const q = `
    SELECT p.id AS partida_id, p.usuario_criador_id
    FROM partida_jogo_time_participante tp
    JOIN partida_jogo_time t ON t.id = tp.partida_jogo_time_id
    JOIN partida_jogo j ON j.id = t.partida_jogo_id
    JOIN partida p ON p.id = j.partida_id
    WHERE tp.id = $1
    LIMIT 1
  `;
    const { rows } = await db.query(q, [tpId]);
    return rows[0] || null;
  },

  async jogadorEstaNaPartida(partida_id, jogador_id) {
  
    const q = `
    SELECT 1
    FROM partida_participante 
    WHERE partida_id = $1 AND jogador_id = $2
    LIMIT 1
  `;
    const { rows } = await db.query(q, [partida_id, jogador_id]);
    return !!rows[0];
  },

  async existsInTime(timeId, jogadorId) {
    const q = `
    SELECT 1
    FROM partida_jogo_time_participante pjtp
    INNER JOIN partida_participante pp ON pp.id = pjtp.partida_participante_id 
    WHERE partida_jogo_time_id = $1 AND pp.jogador_id = $2
    LIMIT 1
  `;
    const { rows } = await db.query(q, [timeId, jogadorId]);
    return !!rows[0];
  },

  async insertTimeParticipante({ timeId, partidaParticipanteId }) {
    const q = `
    INSERT INTO partida_jogo_time_participante
      (partida_jogo_time_id, partida_participante_id, posicao_id, gol, assistencia, defesa, cartao_amarelo, cartao_vermelho)
    VALUES ($1, $2, NULL, NULL, NULL, NULL, NULL, NULL)
    RETURNING id, partida_jogo_time_id AS "timeId", partida_participante_id AS "partidaParticipanteId", posicao_id AS "posicaoId",
              gol, assistencia, defesa, cartao_amarelo AS "cartaoAmarelo", cartao_vermelho AS "cartaoVermelho"
  `;
    const { rows } = await db.query(q, [timeId, partidaParticipanteId]);
    return rows[0];
  },

  async findTimeParticipanteById(id) {
    const q = `
    SELECT pjtp.id, pjtp.partida_jogo_time_id, pp.jogador_id, pjtp.posicao_id,
           pjtp.gol, pjtp.assistencia, pjtp.defesa, pjtp.cartao_amarelo, pjtp.cartao_vermelho
    FROM partida_jogo_time_participante pjtp
    INNER JOIN partida_participante pp ON pp.id = pjtp.partida_participante_id 
    WHERE pjtp.id = $1
    LIMIT 1
  `;
    const { rows } = await db.query(q, [id]);
    return rows[0] || null;
  },

  async updateTimeParticipante(id, fields) {
    const allowed = ['gol', 'assistencia', 'defesa', 'cartao_amarelo', 'cartao_vermelho', 'posicao_id', 'nota'];
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
    UPDATE partida_jogo_time_participante
    SET ${sets.join(', ')}
    WHERE id = $${i}
    RETURNING id, partida_jogo_time_id AS "timeId", posicao_id AS "posicaoId",
              gol, assistencia, defesa, cartao_amarelo AS "cartaoAmarelo", cartao_vermelho AS "cartaoVermelho"
  `;
    values.push(id);
    const { rows } = await db.query(q, values);
    return rows[0] || null;
  },

  async deleteTimeParticipante(id) {
    const q = `
    DELETE FROM partida_jogo_time_participante
    WHERE id = $1
  `;
    await db.query(q, [id]);
  }
};
