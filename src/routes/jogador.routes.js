import { Router } from 'express'
import { JogadorController } from '../controllers/jogador.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/externo', requireAuth, JogadorController.criarExterno);
router.post('/externo/adicionar', requireAuth, JogadorController.adicionarExternoAPartida);

router.get('/disponiveis/partida/:partidaId', requireAuth, JogadorController.listarJogadoresDisponiveis);
router.get('/partida/:partidaId', requireAuth, JogadorController.listarPorPartida);

export default router;
