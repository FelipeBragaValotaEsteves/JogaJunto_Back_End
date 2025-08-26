import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { TipoController } from '../controllers/tipo.controller.js';

const router = Router();

router.get('/', requireAuth, TipoController.find);

export default router;