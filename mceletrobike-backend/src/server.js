require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const produtosRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const logger = require('./middlewares/logger');

const app = express();

// Configurações de Segurança
app.use(helmet()); // Protege cabeçalhos HTTP
app.disable('x-powered-by'); // Remove informação do servidor

// Configuração do Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Muitas requisições",
    message: "Por favor, tente novamente mais tarde."
  }
});

// Configuração do CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(limiter); // Aplica rate limiting a todas as rotas

// Middlewares
app.use(express.json({ limit: '10kb' })); // Limita tamanho do payload
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(logger); // Middleware de log personalizado

// Rotas
app.use("/api/produtos", produtosRoutes);
app.use("/api/pagamento", paymentRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Servidor operacional',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint não encontrado'
  });
});

// Middleware de erros
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Erro interno no servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Conexão com MongoDB
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Variável MONGODB_URI não definida');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(() => {
  console.log("✅ MongoDB conectado com sucesso");
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🔗 URL do Frontend: ${process.env.FRONTEND_URL}`);
    console.log(`⚙️  Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });

  // Tratamento de erros não capturados
  process.on('unhandledRejection', (err) => {
    console.error('Erro não tratado:', err);
    server.close(() => process.exit(1));
  });
})
.catch(err => {
  console.error("❌ Erro ao conectar no MongoDB:", err.message);
  process.exit(1);
});