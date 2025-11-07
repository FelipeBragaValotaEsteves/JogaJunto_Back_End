import { db } from '../config/database.js';

export const PartidaParticipanteModel = {

  async findById(partida_participante_id) {
    const q = `
    SELECT id FROM partida_participante
    WHERE id = $1 
  `;
    const { rows } = await db.query(q, [partida_participante_id]);
    return rows[0] ? rows[0].id : null;
  },

  async getUsuarioCriadorIdByPartidaParticipanteId(partida_id) {
    const q = `
    SELECT p.usuario_criador_id
    FROM public.partida_participante pp
    INNER JOIN public.partida p ON pp.partida_id = p.id
    WHERE pp.id = $1
  `;
    const { rows } = await db.query(q, [partida_id]);
    return rows[0] ? rows[0].usuario_criador_id : null;
  },

  async deletePartidaParticipante(id) {
    const q = `
    DELETE FROM public.partida_participante
    WHERE id = $1
  `;
    await db.query(q, [id]);
  }
};
