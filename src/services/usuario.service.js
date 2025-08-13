import { UsuarioModel } from '../models/usuario.model.js';

export const UsuarioService = {
  async updateProfile(id, { name, email, img }) {
    if (email) {
      const exists = await UsuarioModel.findByEmail(email);
      if (exists && exists.id !== id) {
        const err = new Error('E-mail já cadastrado');
        err.status = 400; throw err;
      }
    }
    return UsuarioModel.update(id, { name, email, img });
  },

  async deleteOwn(id) {
    return UsuarioModel.delete(id);
  },
};
