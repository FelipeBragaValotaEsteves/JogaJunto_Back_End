import { Router } from 'express';
import { JogoController } from '../controllers/jogo.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', requireAuth, JogoController.criarJogo);            
router.put('/:jogoId', requireAuth, JogoController.editarJogo);      
router.delete('/:jogoId', requireAuth, JogoController.excluirJogo);
router.get('/:jogoId', requireAuth, JogoController.obterJogo);

export default router;
