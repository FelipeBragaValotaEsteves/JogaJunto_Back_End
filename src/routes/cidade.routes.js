import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { CidadeController } from '../controllers/cidade.controller.js';

const router = Router();

router.get('/:stateId', requireAuth, CidadeController.findByStateId);

export default router;