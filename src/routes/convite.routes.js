import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { ConviteController } from '../controllers/convite.controller.js';

const router = Router();

router.post('/', requireAuth, ConviteController.criar);
router.delete('/remover/:id', requireAuth, ConviteController.remover);
router.put('/aceitar/:id', requireAuth, ConviteController.aceitar);
router.put('/recusar/:id', requireAuth, ConviteController.recusar);
router.get('/partida/:partidaId', requireAuth, ConviteController.listarPorPartida);
router.get('/usuario/:usuarioId', requireAuth, ConviteController.listarPorUsuario);

export default router;
