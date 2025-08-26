import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { EstadoController } from '../controllers/estado.controller.js';

const router = Router();

router.get('/', requireAuth, EstadoController.find);

export default router;