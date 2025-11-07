# 🚲 MC Electrobike – E-commerce de Bikes Elétricas

MC Electrobike é um sistema completo de **e-commerce moderno** para venda de bicicletas elétricas, desenvolvido para oferecer **alta performance**, **checkout rápido** e **análise avançada de métricas** para compreender o comportamento do público-alvo.

> Desenvolvido integralmente por **Ivan Vinícius de Pádua**, Full Stack Developer.

---

## 🧭 Sumário

1. [Visão Geral](#visão-geral)
2. [Principais Funcionalidades](#principais-funcionalidades)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Tecnologias Utilizadas](#tecnologias-utilizadas)
5. [Estrutura de Pastas (Backend)](#estrutura-de-pastas-backend)
6. [Banco de Dados (MongoDB Atlas)](#banco-de-dados-mongodb-atlas)
7. [Autenticação e Segurança](#autenticação-e-segurança)
8. [Checkout e Pagamentos](#checkout-e-pagamentos)
9. [Logs e Auditoria](#logs-e-auditoria)
10. [Variáveis de Ambiente (.env)](#variáveis-de-ambiente-env)
11. [Deploy e Hospedagem](#deploy-e-hospedagem)
12. [Roadmap e Escalabilidade](#roadmap-e-escalabilidade)
13. [Responsável Técnico](#responsável-técnico)

---

## 🌍 Visão Geral

O projeto **MC Electrobike** tem como propósito **vender bicicletas elétricas** e, ao mesmo tempo, coletar **métricas de comportamento de compra** para análise de performance e direcionamento de campanhas futuras.

- **Público-alvo:** consumidores finais  
- **Modelo de operação:** e-commerce direto (B2C)  
- **Objetivo secundário:** integração com ferramentas analíticas (GA4 e logs internos) para coleta de métricas.

---

## ⚙️ Principais Funcionalidades

| Categoria | Funcionalidade |
|------------|----------------|
| 🛒 Cliente | Busca, filtros inteligentes, favoritos, histórico de carrinho |
| 💳 Pagamento | Pix, cartão, boleto via Mercado Pago com webhook |
| 🧾 Cupom | Sistema de cupons promocionais e descontos progressivos |
| 📦 Pedido | Histórico persistente, status de entrega e rastreamento |
| 💬 Atendimento | Chat direto via site para contato rápido com suporte |
| 🧑‍💼 Admin | CRUD de produtos, relatórios, controle de pedidos, edição/exclusão |
| 🔒 Segurança | Autenticação JWT com confirmação por e-mail (Nodemailer + Gmail API) |

---

                 ┌──────────────────────────────┐
                 │          Frontend            │
                 │  React + Vite + Tailwind     │
                 │  Zustand + React Query       │
                 │  Integração GA4 (futura)     │
                 └──────────────┬───────────────┘
                                │
                          Axios API
                                │
                                ▼
                 ┌──────────────────────────────┐
                 │           Backend            │
                 │  Node.js + Express + MongoDB │
                 │  Auth (JWT) + Nodemailer     │
                 │  Mercado Pago SDK + Webhook  │
                 │  Winston + Helmet + CORS     │
                 └──────────────┬───────────────┘
                                │
                          Mongoose ODM
                                │
                                ▼
                 ┌──────────────────────────────┐
                 │        MongoDB Atlas         │
                 │  (Users, Products, Orders)   │
                 └──────────────┬───────────────┘
                                │
                                ▼
                 ┌──────────────────────────────┐
                 │       Mercado Pago API       │
                 │    (Pix, Cartão, Boleto)     │
                 └──────────────────────────────┘




---

## 🧠 Tecnologias Utilizadas

### Frontend
- React 19 + Vite 7
- TailwindCSS + Radix UI + Framer Motion
- React Router DOM + React Query + Zustand
- Axios + React Hook Form + Zod
- Lucide Icons + Sonner (toasts)
- ESLint + Prettier + Tailwind Merge

### Backend
- Node.js + Express
- Mongoose (MongoDB Atlas)
- JWT + Bcrypt
- Nodemailer (Gmail API)
- Mercado Pago SDK v2
- Helmet + CORS + Morgan + Winston
- Node-cron (tarefas agendadas)
- Express Rate Limit (segurança)

---

## 🗃️ Banco de Dados (MongoDB Atlas)

Coleções principais:

| Coleção | Campos Principais | Descrição |
|----------|------------------|------------|
| `users` | name, email, passwordHash, role | Controle de acesso administrativo |
| `customers` | name, email, address, orders[] | Perfis de clientes e histórico |
| `products` | name, price, category, stock, images[], description | Catálogo de produtos |
| `orders` | customerId, items[], total, paymentStatus, createdAt | Registros de compra |
| `categories` | name, slug, description | Organização de produtos |
| `payments` | orderId, status, transactionId, method | Controle de transações |

---

## 🔐 Autenticação e Segurança

- Autenticação via **JWT** (`accessToken` e `refreshToken`)
- Confirmação de conta via **link enviado por e-mail**
- Hash de senhas com **Bcrypt**
- Middlewares de segurança:
  - `helmet` → proteção contra cabeçalhos inseguros
  - `express-rate-limit` → limite de requisições
  - `cors` → acesso controlado
- Sessões admin e cliente isoladas (`auth.js` e `authCustomer.js`)

---

## 💳 Checkout e Pagamentos

Fluxo de pagamento:

Cliente → Carrinho → Resumo do Pedido → Pagamento (Mercado Pago)
→ Webhook (Render) → Atualização de Status → E-mail de Confirmação



- Métodos disponíveis: **Pix**, **Boleto**, **Cartão**
- Retorno automático via **Webhook** Mercado Pago
- O Mercado Pago envia **nota fiscal e e-mail de confirmação**
- Alternativa planejada (não implementada): **Pagar.me**, com total personalização das telas de pagamento e pós-compra.

---

## 🧾 Logs e Auditoria

- Implementação via **Winston**
- Armazena logs:
  - Em **arquivo** (logs persistentes)
  - Em **console** (durante o desenvolvimento)
- Registra:
  - Login / Logout
  - Ações CRUD
  - Webhooks e transações
  - Erros internos e requisições 4xx / 5xx

---

## ⚙️ Variáveis de Ambiente (.env)

| Variável | Descrição |
|-----------|------------|
| `PORT` | Porta do servidor Express |
| `MONGO_URI` | URL de conexão MongoDB Atlas |
| `JWT_SECRET` | Chave secreta para tokens JWT |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de acesso à API do Mercado Pago |
| `EMAIL_USER` | E-mail usado no Nodemailer (Gmail API) |
| `EMAIL_PASS` | Senha ou App Password para autenticação |
| `AWS_BUCKET_URL` | URL do bucket de storage AWS |
| `CORS_ORIGIN` | Domínio autorizado (ex: https://mceletrobike.vercel.app) |

---

## ☁️ Deploy e Hospedagem

| Camada | Serviço | Descrição |
|--------|----------|-----------|
| Frontend | **Vercel** | Build com Vite + React |
| Backend | **Render** | API Node.js + Express |
| Banco de Dados | **MongoDB Atlas** | Nuvem gerenciada |
| Storage | **AWS S3** | Armazenamento de imagens |
| Monitoramento | **Winston Logs + GA4 (planejado)** | Auditoria e análise de uso |

### Comandos de Deploy

#### Frontend (Vercel)
```bash
npm run build
vercel --prod
Backend (Render)

git push render main
# Ambiente configurado automaticamente via render.yaml ou painel
🚀 Roadmap e Escalabilidade
 MVP funcional com checkout e autenticação

 Integração completa com Mercado Pago

 Implementar Google Analytics 4 (eventos: view_item, add_to_cart, purchase)

 Implementar dashboard analítico com métricas em tempo real

 Adicionar PWA e modo offline

 Chatbot inteligente (suporte automatizado via IA)

👨‍💻 Responsável Técnico
Ivan Vinícius de Pádua Barreto Costa
Full Stack Developer
Aracaju – SE, Brasil
📧 ivanpaduadev@gmail.com
💼 Desenvolvimento: 100% autoral, do início ao fim.

