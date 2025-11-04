import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { PartidaController } from '../controllers/partida.controller.js';

const router = Router();

router.post('/', requireAuth, PartidaController.create);
router.put('/:id', requireAuth, PartidaController.update);
router.post('/cancelar/:id', requireAuth, PartidaController.cancel);

router.get('/criada/:userId', requireAuth, PartidaController.getByUserId);
router.get('/jogada/:userId', requireAuth, PartidaController.getPlayedByUserId);
router.get('/:id', requireAuth, PartidaController.getById);
router.get('/proximas/:city', requireAuth, PartidaController.getByCityName);
router.get('/resumo/:partidaId', requireAuth, PartidaController.listarResumoPorPartida);

export default router;
