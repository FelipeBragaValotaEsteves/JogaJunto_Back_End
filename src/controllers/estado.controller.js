import { EstadoService } from '../services/estado.service.js';

export const EstadoController = {
    async find(req, res, next) {
        try {
            const found = await EstadoService.find();
            res.json(found);
        } catch (err) { next(err); }
    },
};
