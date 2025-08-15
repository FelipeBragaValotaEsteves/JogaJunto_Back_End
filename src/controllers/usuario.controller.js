import { z } from 'zod';
import { UsuarioModel } from '../models/usuario.model.js';
import { UsuarioService } from '../services/usuario.service.js';
import { AuthService } from '../services/auth.service.js';

export const UsuarioController = {
  async me(req, res, next) {
    try {
      const user = await UsuarioModel.findById(req.user.id);

      if (user?.img) {
        user.imgUrl = `${process.env.BASE_URL}/uploads/${user.img}`;
      } else {
        user.imgUrl = null;
      }

      res.json(user);
    } catch (err) { next(err); }
  },

  async updateMe(req, res, next) {
    try {
      const { name, email, positions } = req.body;

      let positionsArray = [];
      if (positions) {
        try {
          positionsArray = JSON.parse(positions);
          if (!Array.isArray(positionsArray)) positionsArray = [];
        } catch {
          positionsArray = [];
        }
      }

      const imgFile = req.file ? req.file.filename : null;

      const updatedUser = await UsuarioService.updateProfile(req.user.id, {
        name,
        email,
        img: imgFile,
        positions: positionsArray
      });

      res.json(updatedUser);
    } catch (err) {
      next(err);
    }
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
