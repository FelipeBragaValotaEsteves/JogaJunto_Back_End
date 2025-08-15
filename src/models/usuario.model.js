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
        const userResult = await db.query(
            `SELECT id, nome, email, img, criado_em
       FROM usuario
       WHERE id = $1`,
            [id]
        );

        if (userResult.rows.length === 0) return null;
        const user = userResult.rows[0];

        // busca posições favoritas
        const posicoesResult = await db.query(
            `SELECT p.id, p.nome
       FROM usuario_posicao up
       JOIN posicao p ON p.id = up.posicao_id
       WHERE up.usuario_id = $1`,
            [id]
        );

        return {
            ...user,
            posicoes: posicoesResult.rows
        };
    },

    async findWithHashById(id) {
        const { rows } = await db.query(`SELECT * FROM usuario WHERE id = $1`, [id]);
        return rows[0] ?? null;
    },

    async update(id, { name, email, img }) {
        const fields = [];
        const values = [];
        let idx = 1;

        if (name) {
            fields.push(`nome = $${idx++}`);
            values.push(name);
        }
        if (email) {
            fields.push(`email = $${idx++}`);
            values.push(email);
        }
        if (img) {
            fields.push(`img = $${idx++}`);
            values.push(img);
        }

        if (!fields.length) return;

        values.push(id);

        await db.query(
            `UPDATE usuario SET ${fields.join(', ')} WHERE id = $${idx}`,
            values
        );
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
