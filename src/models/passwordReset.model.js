import { db } from '../config/database.js';

export const PasswordResetModel = {
  async create(email, code) {
    await db.query(
      `INSERT INTO recupera_senha (email, codigo, datahora_expira) VALUES ($1, $2, NOW() + interval '15 minutes')`,
      [email, code]
    );
  },

  async findByEmailAndCode(email, code) {
    const { rows } = await db.query(
      `SELECT * FROM recupera_senha WHERE email = $1 AND codigo = $2 AND datahora_expira > NOW()`,
      [email, code]
    );
    return rows[0];
  },

  async deleteByEmail(email) {
    await db.query(`DELETE FROM recupera_senha WHERE email = $1`, [email]);
  }
};
