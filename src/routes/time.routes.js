import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { TimeController } from '../controllers/time.controller.js';

const router = Router();

router.post('/partidas/:id/times/manual', requireAuth, TimeController.manual);

router.post('/partidas/:id/times/auto', requireAuth, TimeController.automatico);

router.get('/partidas/:id/times', requireAuth, TimeController.get);

router.delete('/partidas/:id/times', requireAuth, TimeController.clear);

export default router;
