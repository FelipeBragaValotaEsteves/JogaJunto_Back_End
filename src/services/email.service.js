import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperação de Senha - JogaJunto</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f7fa;
                line-height: 1.6;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                border-radius: 12px;
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                padding: 30px 20px;
                text-align: center;
                color: white;
            }
            
            .logo {
                max-width: 40px;
                height: auto;
                margin-bottom: 10px;
                filter: brightness(0) invert(1);
            }
            
            .header h1 {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
            }
            
            .header p {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            
            .greeting {
                font-size: 18px;
                color: #374151;
                margin-bottom: 25px;
            }
            
            .message {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 30px;
                line-height: 1.7;
            }
            
            .code-container {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border: 2px solid #2563eb;
                border-radius: 12px;
                padding: 25px;
                margin: 30px 0;
                position: relative;
            }
            
            .code-label {
                font-size: 14px;
                color: #1f2937;
                font-weight: 600;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .code {
                font-size: 32px;
                font-weight: 800;
                color: #2563eb;
                font-family: 'Courier New', monospace;
                letter-spacing: 8px;
                margin: 10px 0;
                text-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
            }
            
            .code-info {
                font-size: 14px;
                color: #6b7280;
                margin-top: 15px;
            }
            
            .warning {
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px 20px;
                margin: 25px 0;
                border-radius: 0 8px 8px 0;
            }
            
            .warning-icon {
                color: #d97706;
                font-size: 18px;
                margin-right: 8px;
            }
            
            .warning-text {
                color: #92400e;
                font-size: 14px;
                font-weight: 500;
            }
            
            .footer {
                background-color: #f8fafc;
                padding: 25px 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }
            
            .footer p {
                color: #6b7280;
                font-size: 14px;
                margin-bottom: 8px;
            }
            
            .social-links {
                margin-top: 15px;
            }
            
            .social-links a {
                color: #2563eb;
                text-decoration: none;
                margin: 0 10px;
                font-weight: 500;
            }
            
            .divider {
                height: 1px;
                background: linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%);
                margin: 20px 0;
            }
            
            @media only screen and (max-width: 600px) {
                .container {
                    margin: 10px;
                    border-radius: 8px;
                }
                
                .content {
                    padding: 30px 20px;
                }
                
                .code {
                    font-size: 28px;
                    letter-spacing: 6px;
                }
                
                .header h1 {
                    font-size: 24px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="cid:logo" alt="JogaJunto Logo" class="logo" />
                <h1>JogaJunto</h1>
                <p>Recuperação de Senha</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Olá! 👋
                </div>
                
                <div class="message">
                    Recebemos uma solicitação para redefinir a senha da sua conta no <strong>JogaJunto</strong>. 
                    Use o código abaixo para prosseguir com a recuperação:
                </div>
                
                <div class="code-container">
                    <div class="code-label">Seu Código de Recuperação</div>
                    <div class="code">${code}</div>
                    <div class="code-info">
                        ⏱️ Este código expira em 15 minutos
                    </div>
                </div>
                
                <div class="warning">
                    <span class="warning-icon">⚠️</span>
                    <span class="warning-text">
                        Se você não solicitou esta recuperação, ignore este email. 
                        Sua senha permanecerá inalterada.
                    </span>
                </div>
                
                <div class="divider"></div>
                
                <div class="message">
                    Precisa de ajuda? Nossa equipe de suporte está sempre pronta para ajudar!
                </div>
            </div>
            
            <div class="footer">
                <p><strong>JogaJunto</strong> - Conectando jogadores, criando momentos!</p>
                <p>Este é um email automático, não responda a esta mensagem.</p>
                
                <div class="social-links">
                    <a href="#">Suporte</a> •
                    <a href="#">Política de Privacidade</a> •
                    <a href="#">Termos de Uso</a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  const logoPath = path.join(__dirname, '../../assets/logo.png');

  const info = await transporter.sendMail({
    from: `"JogaJunto - Suporte" <${env.smtpUser}>`,
    to,
    subject: '🔐 Código de Recuperação de Senha - JogaJunto',
    text: `
JogaJunto - Recuperação de Senha

Olá!

Recebemos uma solicitação para redefinir a senha da sua conta.

Seu código de recuperação é: ${code}

Este código expira em 15 minutos.

Se você não solicitou esta recuperação, ignore este email.

--
Equipe JogaJunto
    `,
    html: htmlTemplate,
    attachments: [
      {
        filename: 'logo.png',
        path: logoPath,
        cid: 'logo'
      }
    ]
  });

  return info;
}
