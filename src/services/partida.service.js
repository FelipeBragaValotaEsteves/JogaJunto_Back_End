import { PartidaModel } from '../models/partida.model.js';

const DEFAULT_STATUS = 'aguardando';

export const PartidaService = {
  create(data) {
    const payload = {
      ...data,
      status: DEFAULT_STATUS
    };
    return PartidaModel.create(payload);
  },

  update(id, usuarioId, fields) {
    return PartidaModel.updateByCreator(id, usuarioId, fields);
  },

  cancel(id, usuarioId) {
    return PartidaModel.cancelByCreator(id, usuarioId);
  },

  findByIdDetailed(id) {
    return PartidaModel.findByIdDetailed(id);
  },

  findByUserId(userId) {
    return PartidaModel.findByUserId(userId);
  },

  findPlayedByUserId(userId) {
    return PartidaModel.findPlayedByUserId(userId);
  },

  findByCity(city) {
    return PartidaModel.findByCity(city);
  },

  async listarResumoPorPartida({ partidaId }) {
    const rows = await PartidaModel.aggregateResumoPorPartida(partidaId);

    const byJogo = new Map();
    const byTime = new Map();

    for (const r of rows) {
      const jogoId = r.jogo_id;
      const timeId = r.time_id;
      const timeKey = `${jogoId}-${timeId}`;

      if (!byJogo.has(jogoId)) byJogo.set(jogoId, { jogoId, times: [] });
      if (!byTime.has(timeKey)) {
        const timeObj = {
          timeId,
          nome: r.time_nome,
          totais: {
            gols: Number(r.time_gols) || 0,
            assistencias: Number(r.time_assistencias) || 0,
            cartoesAmarelos: Number(r.time_cartoes_amarelos) || 0,
            cartoesVermelhos: Number(r.time_cartoes_vermelhos) || 0,
          },
          jogadores: [],
        };
        byTime.set(timeKey, timeObj);
        byJogo.get(jogoId).times.push(timeObj);
      }

      if (r.time_participante_id) {
        byTime.get(timeKey).jogadores.push({
          timeParticipanteId: r.time_participante_id,
          jogadorId: r.jogador_id,
          nome: r.jogador_nome || '',
          posicaoId: r.posicao_id,
          eventos: {
            gol: Number(r.gol) || 0,
            assistencia: Number(r.assistencia) || 0,
            defesa: Number(r.defesa) || 0,
            cartaoAmarelo: Number(r.cartao_amarelo) || 0,
            cartaoVermelho: Number(r.cartao_vermelho) || 0,
          }
        });
      }
    }

    return JSON.parse(JSON.stringify(Array.from(byJogo.values())));
  },
};
