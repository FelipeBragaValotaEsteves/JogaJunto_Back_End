import { TipoService } from '../services/tipo.service.js';

export const TipoController = {
    async find(req, res, next) {
        try {
            const found = await TipoService.find();
            res.json(found);
        } catch (err) { next(err); }
    },
};
