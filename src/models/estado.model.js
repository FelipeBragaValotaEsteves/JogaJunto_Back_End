import { db } from '../config/database.js';

export const EstadoModel = {
    async find() {
        const { rows } = await db.query(
            `SELECT * FROM estado
            ORDER BY nome`,
        );
        return rows;
    },
};
