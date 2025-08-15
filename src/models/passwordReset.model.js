import { db } from '../config/database.js';

export const PasswordResetModel = {
  async create(email, code) {
    await db.query(
      `INSERT INTO recupa_senha (email, codigo, datahora_expira) VALUES ($1, $2, NOW() + interval '15 minutes')`,
      [email, code]
    );
  },

  async findByEmailAndCode(email, code) {
    const { rows } = await db.query(
      `SELECT * FROM recupa_senha WHERE email = $1 AND codigo = $2 AND datahora_expira > NOW()`,
      [email, code]
    );
    return rows[0];
  },

  async deleteByEmail(email) {
    await db.query(`DELETE FROM recupa_senha WHERE email = $1`, [email]);
  }
};
