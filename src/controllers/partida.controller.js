import { z } from 'zod';
import { PartidaService } from '../services/partida.service.js';

const toDate = (v) => (v instanceof Date ? v : new Date(v));

const createSchema = z.object({
  local: z.string().min(1).max(200),
  rua: z.string().max(150).optional(),
  bairro: z.string().max(150).optional(),
  numero: z.number().int().optional(),
  cidade_id: z.number().int().optional(),
  aberto: z.boolean().optional(),
  datahora_inicio: z.preprocess(
    (v) => v === null || v === undefined ? null : toDate(v),
    z.date().optional().nullable()
  ),
  datahora_fim: z.preprocess(
    (v) => v === null || v === undefined ? null : toDate(v),
    z.date().optional().nullable()
  ),
  tipo_partida_id: z.number().int(),
  status: z.string().max(15).optional(),
  valor: z.coerce.number()
    .min(0)
    .refine(v => Math.round(v * 100) === v * 100, { message: 'Valor inválido' })
    .optional(),
});

const updateSchema = z.object({
  local: z.string().min(1).max(200).optional(),
  rua: z.string().max(150).optional(),
  bairro: z.string().max(150).optional(),
  numero: z.number().int().optional(),
  cidade_id: z.number().int().optional(),
  aberto: z.boolean().optional(),
  datahora_inicio: z.preprocess((v) => (v ? toDate(v) : v), z.date().optional()),
  datahora_fim: z.preprocess((v) => (v ? toDate(v) : v), z.date().optional()),
  tipo_partida_id: z.number().int().optional(),
  status: z.string().max(15).optional(),
  valor: z.coerce.number()
    .min(0)
    .refine(v => Math.round(v * 100) === v * 100, { message: 'Valor inválido' })
    .optional(),
}).refine((data) => Object.keys(data).length > 0, { message: 'Nada para atualizar' });

export const PartidaController = {
  async create(req, res, next) {
    try {
      const data = createSchema.parse(req.body);
      const created = await PartidaService.create({
        ...data,
        usuario_criador_id: req.user.id
      });
      res.status(201).json(created);
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const data = updateSchema.parse(req.body);
      const updated = await PartidaService.update(Number(req.params.id), req.user.id, data);
      if (!updated) return res.status(404).json({ message: 'Partida não encontrada ou você não é o criador.' });
      res.json(updated);
    } catch (err) { next(err); }
  },

  async cancel(req, res, next) {
    try {
      const result = await PartidaService.cancel(Number(req.params.id), req.user.id);
      if (!result) return res.status(404).json({ message: 'Partida não encontrada ou você não é o criador.' });
      res.json(result);
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const found = await PartidaService.findByIdDetailed(Number(req.params.id));
      if (!found) return res.status(404).json({ message: 'Partida não encontrada.' });
      res.json(found);
    } catch (err) { next(err); }
  },

  async getByUserId(req, res, next) {
    try {
      const found = await PartidaService.findByUserId(Number(req.params.userId));
      res.json(found);
    } catch (err) { next(err); }
  },

  async getPlayedByUserId(req, res, next) {
    try {
      const found = await PartidaService.findPlayedByUserId(Number(req.params.userId));
      res.json(found);
    } catch (err) { next(err); }
  }
};
