import { Router } from 'express'
import { JogadorController } from '../controllers/jogador.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/externo', requireAuth, JogadorController.criarExterno);
router.post('/externo/adicionar', requireAuth, JogadorController.adicionarExternoAPartida);

export default router;
