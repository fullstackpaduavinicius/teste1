const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
require('dotenv').config();

const router = express.Router();

// Configuração robusta do cliente MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { 
    timeout: 5000,
    idempotencyKey: `mp-${Date.now()}` // Evita requisições duplicadas
  }
});

// Middleware de validação
const validatePaymentData = (req, res, next) => {
  const { produtos } = req.body;
  
  if (!produtos || !Array.isArray(produtos)) {
    return res.status(400).json({ 
      status: "400",
      error: "bad_request",
      message: "Lista de produtos inválida",
      cause: [{ code: "400001", message: "Produtos não fornecidos" }]
    });
  }

  // Validação adicional dos produtos
  for (const produto of produtos) {
    if (!produto.preco || isNaN(produto.preco)) {
      return res.status(400).json({
        status: "400",
        error: "bad_request",
        message: "Preço inválido para o produto",
        cause: [{ code: "400002", message: "Preço deve ser um número válido" }]
      });
    }
  }

  next();
};

router.post('/create_preference', validatePaymentData, async (req, res) => {
  try {
    const { produtos } = req.body;

    // Preparar itens para o pagamento (formato específico do MP)
    const items = produtos.map(produto => ({
      title: produto.nome?.substring(0, 256) || 'Produto sem nome',
      unit_price: parseFloat(produto.preco),
      quantity: parseInt(produto.quantidade) || 1,
      currency_id: 'BRL',
      description: produto.descricao?.substring(0, 256) || '',
      picture_url: produto.imageUrl || ''
    }));

    // Configuração absoluta das URLs
    const baseUrl = process.env.FRONTEND_URL;
    const backUrls = {
      success: `${baseUrl}/pagamento/sucesso`,
      failure: `${baseUrl}/pagamento/falha`,
      pending: `${baseUrl}/pagamento/pendente`
    };

    // Configuração da preferência (sem splitter)
    const preference = {
      items,
      back_urls: backUrls,
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [{ id: 'atm' }],
        installments: 12
      },
      notification_url: `${process.env.BACKEND_URL}/api/pagamento/webhook`
    };

    const response = await new Preference(client).create({ body: preference });

    // Resposta padronizada
    res.json({
      status: "200",
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point
    });

  } catch (error) {
    console.error('Erro no Mercado Pago:', {
      message: error.message,
      status: error.status,
      cause: error.cause,
      stack: error.stack,
      response: error.response?.data
    });

    res.status(500).json({ 
      status: "500",
      error: "internal_server_error",
      message: "Erro ao criar preferência de pagamento",
      cause: [{
        code: error.status?.toString() || "500000",
        message: error.message,
        data: error.response?.data || null
      }]
    });
  }
});

module.exports = router;