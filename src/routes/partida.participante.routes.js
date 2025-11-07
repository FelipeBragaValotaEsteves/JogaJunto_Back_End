import { Router } from 'express';
import { PartidaParticipanteController } from '../controllers/partidaParticipante.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.delete('/:partidaParticipanteId', requireAuth, PartidaParticipanteController.removerJogadorDaPartida);

export default router;
