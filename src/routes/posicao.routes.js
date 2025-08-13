import { Router } from 'express';
import { PosicaoController } from '../controllers/posicao.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/list', requireAuth, PosicaoController.list);

export default router;
