import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { PartidaController } from '../controllers/partida.controller.js';

const router = Router();

router.post('/', requireAuth, PartidaController.create);    
router.patch('/:id', requireAuth, PartidaController.update);
router.post('/:id/cancel', requireAuth, PartidaController.cancel);
router.get('/:id', requireAuth, PartidaController.getById);
router.get('/:userId', requireAuth, PartidaController.getByUserId);

export default router;
