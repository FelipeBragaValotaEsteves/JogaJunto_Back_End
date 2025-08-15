import { UsuarioModel } from '../models/usuario.model.js';
import { UsuarioPosicaoModel } from '../models/usuarioPosicao.model.js';

export const UsuarioService = {
 async updateProfile(userId, { name, email, img, positions }) {
    if (name || email || img) {
      await UsuarioModel.update(userId, { name, email, img });
    }

    if (Array.isArray(positions)) {
      const atuais = await UsuarioPosicaoModel.getByUsuarioId(userId);

      const atuaisIds = atuais.map(p => p.posicao_id);
      const inserir = positions.filter(id => !atuaisIds.includes(id));
      const remover = atuaisIds.filter(id => !positions.includes(id));

      if (inserir.length) {
        await UsuarioPosicaoModel.addMany(userId, inserir);
      }
      if (remover.length) {
        await UsuarioPosicaoModel.removeMany(userId, remover);
      }
    }

    return UsuarioModel.findById(userId);
  },

  async deleteOwn(id) {
    return UsuarioModel.delete(id);
  },
};
