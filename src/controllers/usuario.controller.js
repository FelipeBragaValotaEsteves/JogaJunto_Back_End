import { z } from 'zod';
import { UsuarioModel } from '../models/usuario.model.js';
import { UsuarioService } from '../services/usuario.service.js';
import { AuthService } from '../services/auth.service.js';

export const UsuarioController = {
  async me(req, res, next) {
    try {
      const user = await UsuarioModel.findById(req.user.id);
      res.json(user);
    } catch (err) { next(err); }
  },

  async updateMe(req, res, next) {
    try {

      const schema = z.object({
        name: z.preprocess(v => (v === '' ? undefined : v), z.string().min(2)).optional(),
        email: z.preprocess(v => (v === '' ? undefined : v), z.string().email()).optional(),

        img: z.string().max(255).nullable().optional(),
      });

      const raw = {
        name: req.body?.name,
        email: req.body?.email,
       
        img: req.file ? req.file.filename : (req.body?.img ?? undefined),
      };

      if (raw.img === '') raw.img = null;

      const data = schema.parse(raw);

      const updated = await UsuarioService.updateProfile(req.user.id, data);
      res.json(updated);
    } catch (err) { next(err); }
  },

  async changePassword(req, res, next) {
    try {
      const schema = z.object({
        senha_atual: z.string().min(6),
        nova_senha: z.string().min(6),
      });
      const data = schema.parse(req.body);
      const out = await AuthService.changePassword({ userId: req.user.id, ...data });
      res.json(out);
    } catch (err) { next(err); }
  },

  async deleteMe(req, res, next) {
    try {
      const out = await UsuarioService.deleteOwn(req.user.id);
      res.json(out);
    } catch (err) { next(err); }
  },
};
