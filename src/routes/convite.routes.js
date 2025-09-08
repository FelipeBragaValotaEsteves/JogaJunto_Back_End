import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { ConviteController } from '../controllers/convite.controller.js';

const router = Router();

router.post('/', requireAuth, ConviteController.criar);
router.post('/:id/cancelar', requireAuth, ConviteController.cancelar);
router.post('/:id/aceitar', requireAuth, ConviteController.aceitar);
router.post('/:id/recusar', requireAuth, ConviteController.recusar);
router.get('/partida/:partidaId', requireAuth, ConviteController.listarPorPartida);

export default router;
