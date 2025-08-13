export const EmailService = {
    async sendInviteEmail({ to, partida }) {
      return { ok: true, to, assunto: `Convite para ${partida.titulo}` };
    }
  };
  