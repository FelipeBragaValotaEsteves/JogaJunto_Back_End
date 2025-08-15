import { z } from 'zod';
import { AuthService } from '../services/auth.service.js';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const AuthController = {
  async register(req, res, next) {
    try {
      const data = registerSchema.parse(req.body);
      console.log(data)
      const result = await AuthService.register(data);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async login(req, res, next) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await AuthService.login(data);
      res.json(result);
    } catch (err) { next(err); }
  },

  async forgotPassword(req, res, next) {
    try {
      const schema = z.object({
        email: z.string().email()
      });
      const { email } = schema.parse(req.body);

      const out = await AuthService.requestPasswordReset(email);
      res.json(out);
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const schema = z.object({
        email: z.string().email(),
        code: z.string().min(4).max(10),
        newPassword: z.string().min(6)
      });
      const { email, code, newPassword } = schema.parse(req.body);

      const out = await AuthService.resetPassword(email, code, newPassword);
      res.json(out);
    } catch (err) {
      next(err);
    }
  }
};
