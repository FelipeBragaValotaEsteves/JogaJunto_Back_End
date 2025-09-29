import { Router } from 'express'
import { JogadorController } from '../controllers/jogador.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/externo', requireAuth, JogadorController.criarExterno);
router.post('/externo/adicionar', requireAuth, JogadorController.adicionarExternoAPartida);

router.get('/jogadoresDisponiveis', requireAuth, JogadorController.listarJogadoresDisponiveis);
router.get('/jogadoresDisponiveis/:id', requireAuth, JogadorController.listarJogadoresDisponiveisPorPartida);

export default router;
