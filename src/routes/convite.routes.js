import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { ConviteController } from '../controllers/convite.controller.js';

const router = Router();

router.post('/partidas/:id/convites', requireAuth, ConviteController.enviar);

router.post('/convites/:id/confirmar', requireAuth, ConviteController.confirmar);

router.get('/partidas/:id/convites', requireAuth, ConviteController.listar);

export default router;
