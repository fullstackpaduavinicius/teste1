require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const produtosRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Configuração do CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rotas
app.use("/api/produtos", produtosRoutes);
app.use("/api/pagamento", paymentRoutes);

// Conexão com MongoDB
const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB conectado");
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("Erro ao conectar no MongoDB:", err);
  });