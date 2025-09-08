import { Router } from 'express';
import { TimeController } from '../controllers/time.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/jogo/:jogoId', requireAuth, TimeController.criarTime);    
router.put('/:timeId', requireAuth, TimeController.editarTime);       
router.delete('/:timeId', requireAuth, TimeController.excluirTime);

export default router;
