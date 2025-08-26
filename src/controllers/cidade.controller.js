import { CidadeService } from '../services/cidade.service.js';

export const CidadeController = {
    async findByStateId(req, res, next) {
        try {
            const found = await CidadeService.findByStateId(Number(req.params.stateId));
            res.json(found);
        } catch (err) { next(err); }
    },
};
