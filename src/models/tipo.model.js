import { db } from '../config/database.js';

export const TipoModel = {
    async find() {
        const { rows } = await db.query(
            `SELECT * FROM tipo_partida
            ORDER BY nome`,
        );
        return rows;
    },
};
