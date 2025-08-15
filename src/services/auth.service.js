import { UsuarioModel } from '../models/usuario.model.js';
import { hashPassword, comparePassword } from '../utils/hash.util.js';
import { signToken } from '../utils/token.util.js';
import { PasswordResetModel } from '../models/passwordReset.model.js';
import { sendRecoveryEmail } from '../services/email.service.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const AuthService = {
    async requestPasswordReset(email) {
        const user = await UsuarioModel.findByEmail(email);
        if (!user) throw new Error('User not found');

        const code = crypto.randomInt(100000, 999999).toString();
        await PasswordResetModel.deleteByEmail(email);
        await PasswordResetModel.create(email, code);

        await sendRecoveryEmail(email, code);

        return { message: 'Código enviado para o e-mail informado' };
    },

    async resetPassword(email, code, newPassword) {
        const resetEntry = await PasswordResetModel.findByEmailAndCode(email, code);
        if (!resetEntry) throw new Error('Invalid or expired code');

        const user = await UsuarioModel.findByEmail(email);
        if (!user) { const err = new Error('Credenciais inválidas'); err.status = 401; throw err; }

        const hash = await bcrypt.hash(newPassword, 10);
        await UsuarioModel.updatePassword(user.id, hash);

        await PasswordResetModel.deleteByEmail(email);

        return { message: 'Senha resetada com sucesso!' };
    },

    async register({ name, email, password }) {
        const exists = await UsuarioModel.findByEmail(email);
        if (exists) { const err = new Error('E-mail já cadastrado'); err.status = 400; throw err; }
        const password_hash = await hashPassword(password);
        const user = await UsuarioModel.create({ name, email, password_hash });
        const token = signToken({ sub: user.id, email: user.email });
        return { user, token };
    },

    async login({ email, password }) {
        const user = await UsuarioModel.findByEmail(email);
        if (!user) { const err = new Error('Credenciais inválidas'); err.status = 401; throw err; }
        console.log(email, password)
        const ok = await comparePassword(password, user.senha_hash);
        if (!ok) { const err = new Error('Credenciais inválidas'); err.status = 401; throw err; }
        const token = signToken({ sub: user.id, email: user.email });
        return { user: { id: user.id, name: user.nome, email: user.email, created_at: user.criado_em }, token };
    },

    async changePassword({ userId, senha_atual, nova_senha }) {
        const user = await UsuarioModel.findWithHashById(userId);
        if (!user) { const err = new Error('Usuário não encontrado'); err.status = 404; throw err; }
        const ok = await comparePassword(senha_atual, user.password_hash);
        if (!ok) { const err = new Error('Senha atual incorreta'); err.status = 400; throw err; }
        const hash = await hashPassword(nova_senha);
        await UsuarioModel.updatePassword(userId, hash);
        return { ok: true };
    }
};
