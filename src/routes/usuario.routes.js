import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { UsuarioController } from '../controllers/usuario.controller.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.resolve('uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `user_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

const router = Router();

router.get('/me', requireAuth, UsuarioController.me);
router.patch('/me', requireAuth, upload.single('img'), UsuarioController.updateMe);
router.patch('/me/password', requireAuth, UsuarioController.changePassword);
router.delete('/me', requireAuth, UsuarioController.deleteMe);

export default router;
