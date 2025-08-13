import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usuarioRoutes from './usuario.routes.js';
import partidaRoutes from './partida.routes.js';
import posicaoRoutes from './posicao.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/partidas', partidaRoutes);
router.use('/posicao', posicaoRoutes);

export default router;
