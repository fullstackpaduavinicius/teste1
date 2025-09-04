require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');            // admin/auth existente
const productRoutes = require('./routes/productRoutes');      // produtos existente
const paymentRoutes = require('./routes/paymentRoutes');      // pagamento existente

const customerAuthRoutes = require('./routes/customerAuthRoutes'); // novo
const customerCartRoutes = require('./routes/customerCartRoutes'); // novo

const app = express();

// Render/Vercel atrás de proxy
app.set('trust proxy', 1);

// Middlewares base
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS com credentials
const allowedOrigins = [
  process.env.FRONTEND_URL,           // ex: https://teste1-nine-tawny.vercel.app
  'http://localhost:5173',            // Vite
];

app.use(cors({
  origin(origin, callback) {
    // permite tools/healthchecks sem origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // opcional: liberar todos subdomínios vercel.app do seu projeto
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Healthcheck simples
app.get('/', (_, res) => res.send('API OK'));

// Status detalhado
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

// Rotas EXISTENTES (mantidas p/ compatibilidade)
app.use('/api/auth', authRoutes);
app.use('/api/produtos', productRoutes);
app.use('/api/pagamento', paymentRoutes);

// NOVAS rotas de cliente
app.use('/api/customers', customerAuthRoutes);
app.use('/api/customers', customerCartRoutes);

// Handler de erro
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

// MongoDB + start
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB conectado');
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`🚀 API na porta ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Mongo error:', err.message);
    process.exit(1);
  });
