import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usuarioRoutes from './usuario.routes.js';
import partidaRoutes from './partida.routes.js';
import posicaoRoutes from './posicao.routes.js';
import conviteRoutes from './convite.routes.js';
import estadoRoutes from './estado.routes.js';
import cidadeRoutes from './cidade.routes.js';
import tipoRoutes from './tipo.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/partidas', partidaRoutes);
router.use('/posicao', posicaoRoutes);
router.use('/convites', conviteRoutes);
router.use('/estados', estadoRoutes);
router.use('/cidades', cidadeRoutes);
router.use('/tipos', tipoRoutes);

export default router;
