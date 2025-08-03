require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Configurações de Segurança
app.use(helmet());
app.disable('x-powered-by');

// CORS Configurado para Produção
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate Limiting (100 requests/15min)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  message: {
    status: 429,
    error: "Limite de requisições excedido",
    message: "Por favor, tente novamente mais tarde."
  }
}));

// Middlewares
app.use(express.json({ limit: '10kb' }));

// Rotas
app.use("/api/produtos", productRoutes);
app.use("/api/pagamentos", paymentRoutes);

// Health Check
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    ambiente: process.env.NODE_ENV,
    versao: '1.0.0'
  });
});

// Tratamento de Erros
app.use((err, req, res, next) => {
  console.error('Erro:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Erro interno no servidor'
  });
});

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(() => {
  console.log('✅ Conectado ao MongoDB Atlas');
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em ${process.env.BACKEND_URL}`);
  });
})
.catch(err => {
  console.error('❌ Falha na conexão com MongoDB:', err.message);
  process.exit(1);
});