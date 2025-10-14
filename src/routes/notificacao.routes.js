import { Router } from 'express';
import { NotificacaoController } from '../controllers/notificacao.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/usuario/:usuarioId', requireAuth, NotificacaoController.listarPorUsuario);

export default router;
