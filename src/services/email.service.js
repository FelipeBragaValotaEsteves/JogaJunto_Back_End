import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: false,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

export async function sendRecoveryEmail(to, code) {
  const info = await transporter.sendMail({
    from: `"Suporte" <${env.smtpUser}>`,
    to,
    subject: 'Código de Recuperação de Senha',
    text: `Seu código de recuperação é: ${code}`,
    html: `<p>Seu código de recuperação é: <strong>${code}</strong></p>`,
  });
}
