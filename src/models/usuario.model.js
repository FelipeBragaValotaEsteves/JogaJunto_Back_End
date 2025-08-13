import { db } from '../config/database.js';

export const UsuarioModel = {
    async create({ name, email, password_hash }) {
        const { rows } = await db.query(
            `INSERT INTO usuario (nome, email, senha_hash)
       VALUES ($1, $2, $3) RETURNING id, nome, email, criado_em`,
            [name, email, password_hash]
        );
        return rows[0];
    },

    async findByEmail(email) {
        const { rows } = await db.query(`SELECT * FROM usuario WHERE email = $1`, [email]);
        return rows[0] ?? null;
    },

    async findById(id) {
        const { rows } = await db.query(
            `SELECT id, nome, email, criado_em FROM usuario WHERE id = $1`,
            [id]
        );
        return rows[0] ?? null;
    },

    async findWithHashById(id) {
        const { rows } = await db.query(`SELECT * FROM usuario WHERE id = $1`, [id]);
        return rows[0] ?? null;
    },

    async update(id, { name, email, img }) {
        const fields = [];
        const params = [];
        if (name !== undefined) { fields.push(`nome = $${fields.length + 1}`); params.push(name); }
        if (email !== undefined) { fields.push(`email = $${fields.length + 1}`); params.push(email); }
        if (img !== undefined) { fields.push(`img = $${fields.length + 1}`); params.push(img); }

        if (!fields.length) return this.findById(id);

        params.push(id);
        const { rows } = await db.query(
            `UPDATE usuario SET ${fields.join(', ')} WHERE id = $${params.length}
       RETURNING id, nome, email, criado_em`,
            params
        );
        return rows[0] ?? null;
    },

    async updatePassword(id, password_hash) {
        const { rows } = await db.query(
            `UPDATE usuario SET senha_hash = $1 WHERE id = $2
       RETURNING id`,
            [password_hash, id]
        );
        return rows[0] ?? null;
    },

    async delete(id) {
        await db.query(`DELETE FROM usuario WHERE id = $1`, [id]);
        return { ok: true };
    }
};
