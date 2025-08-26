import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { ConviteController } from '../controllers/convite.controller.js';

const router = Router();

router.post('/', requireAuth, ConviteController.create);
router.post('/:id/cancelar', requireAuth, ConviteController.cancel);
router.post('/:id/aceitar', requireAuth, ConviteController.accept);
router.post('/:id/recusar', requireAuth, ConviteController.decline);

export default router;
