# 🏗️ **JogaJunto_Back_End**

## 📌 Descrição

Backend da aplicação **JogaJunto**, responsável por autenticação, gerenciamento de usuários, partidas e comunicação com o banco de dados PostgreSQL.
Desenvolvido em **Node.js** com organização modular e suporte a variáveis de ambiente.

---

## 🚀 Tecnologias Utilizadas

* Node.js
* Express
* PostgreSQL
* JWT (Autenticação)
* Nodemailer (Envio de e-mails)
* Dotenv
* NPM Scripts

---

## 📥 Instalação

### 1. Clonar o repositório

```sh
git clone https://github.com/FelipeBragaValotaEsteves/JogaJunto_Back_End.git
cd JogaJunto_Back_End
```

### 2. Instalar dependências

```sh
npm install
```

---

## ⚙️ Configuração do Ambiente (.env)

Crie um arquivo chamado **.env** na raiz do projeto e adicione:

```
NODE_ENV=development
PORT=3000

# Postgres
DATABASE_URL=postgresql://postgres:password.example@localhost:5432/db.example

# Auth
JWT_SECRET=key.example
JWT_EXPIRES_IN=7d

# Base URL 
BASE_URL=http://ip.example:3000/

# SMTP
SMTP_HOST=host.example
SMTP_PORT=587
SMTP_USER=email.example@gmail.com
SMTP_PASS=password.example
```

### 🔍 Explicação das variáveis

**NODE_ENV**
Define o ambiente (development, production).

**PORT**
Porta em que o servidor será iniciado.

**DATABASE_URL**
String de conexão do PostgreSQL.

**JWT_SECRET**
Chave secreta utilizada para assinar tokens de autenticação.

**JWT_EXPIRES_IN**
Tempo de expiração do token JWT.

**BASE_URL**
URL base do backend que será utilizada pelo app mobile.

**SMTP_HOST / PORT / USER / PASS**
Credenciais do provedor de e-mail para envio de notificações.

---

## ▶️ Rodando o Servidor

```sh
npm start
```

Ou, se houver modo de desenvolvimento:

```sh
npm run dev
```

O servidor iniciará em:

```
http://localhost:3000
```

