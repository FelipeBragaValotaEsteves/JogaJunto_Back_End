import { db } from '../config/database.js';

export const CidadeModel = {
    async findByStateId(stateId) {
        const { rows } = await db.query(
            `SELECT * FROM cidade WHERE estado_id = $1
            ORDER BY nome`,
            [stateId]
        );
        return rows;
    },
};
