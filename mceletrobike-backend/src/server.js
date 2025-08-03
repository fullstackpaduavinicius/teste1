require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Segurança com Helmet + Content Security Policy (CSP)
const connectSrcList = [
  "'self'",
  process.env.BACKEND_URL || 'https://mceletrobike-backend.onrender.com',
  'https://api.mercadopago.com'
].filter(Boolean);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.mercadopago.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https://*.mercadopago.com'],
      connectSrc: connectSrcList
    }
  }
}));
app.disable('x-powered-by');

// Configurar CORS
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    'https://teste1-nine-tawny.vercel.app',
    'http://localhost:5173',
    'https://www.mercadopago.com',
    'https://api.mercadopago.com'
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID',
    'x-idempotency-key', 'Accept'
  ],
  exposedHeaders: ['Content-Length', 'X-Request-ID'],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Limite de requisições para evitar abuso
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many requests, please try again later.'
    });
  }
});
app.use('/api/', apiLimiter);

// Parsers para JSON e URL-encoded
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ** IMPORTANTISSIMO: use rotas SOMENTE com caminhos relativos **
app.use('/api/produtos', productRoutes);
app.use('/api/pagamento', paymentRoutes);

// Health check simples
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// Tratador global de erros
app.use((err, req, res, next) => {
  console.error('Server Error:', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Conexão com MongoDB Atlas com retry automático
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    w: 'majority'
  })
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    setTimeout(connectWithRetry, 5000);
  });
};
connectWithRetry();

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown para SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
