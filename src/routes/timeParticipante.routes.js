import { Router } from 'express';
import { TimeParticipanteController } from '../controllers/timeParticipante.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', requireAuth, TimeParticipanteController.adicionarJogadorAoTime);
router.put('/:timeParticipanteId', requireAuth, TimeParticipanteController.atualizarEstatisticas);

export default router;
