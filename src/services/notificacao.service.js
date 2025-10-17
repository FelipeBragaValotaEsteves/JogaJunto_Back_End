import { NotificacaoModel } from "../models/notificacao.model.js";
import { UsuarioModel } from "../models/usuario.model.js";

export const NotificacaoService = {
  async sendNotification({ usuario_id, title, body, data }) {
    try {
      const deviceToken = await UsuarioModel.getDeviceToken(usuario_id);
      
      if (!deviceToken) {
        throw new Error("Device token não encontrado para o usuário");
      }

      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: deviceToken,
          sound: "default",
          title,
          body,
          data,
          icon: process.env.BASE_URL + "/assets/logo.png",
        }),
      });

      const result = await response.json();

      await NotificacaoModel.create({
        usuario_id,
        mensagem: body,
      });

      return result;
    } catch (err) {
      console.error("Erro ao enviar notificação:", err);
      throw new Error("Falha ao enviar notificação");
    }
  },

  async listarPorUsuario(usuario_id) {
    try {
      const notificacoes = await NotificacaoModel.listByUsuario(usuario_id);
      return notificacoes;
    } catch (err) {
      console.error("Erro ao listar notificações:", err);
      throw new Error("Falha ao listar notificações do usuário");
    }
  },
};
