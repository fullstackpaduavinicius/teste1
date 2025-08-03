const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const router = express.Router();

// Configuração robusta do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: {
    timeout: 15000, // Aumentado para 15 segundos
    idempotencyKey: `mp-${Date.now()}` // Chave única baseada no timestamp
  }
});

// Validação dos itens do carrinho
const validateItems = (items) => {
  if (!Array.isArray(items)) return false;
  return items.every(item => (
    item.id &&
    item.title &&
    !isNaN(item.unit_price) && item.unit_price > 0 &&
    !isNaN(item.quantity) && item.quantity > 0
  ));
};

router.post('/create_preference', async (req, res) => {
  try {
    const { items } = req.body;

    // Validação rigorosa
    if (!validateItems(items)) {
      return res.status(400).json({
        status: "error",
        message: "Dados dos itens inválidos"
      });
    }

    // Preparar preferência
    const preference = {
      items: items.map(item => ({
        id: item.id,
        title: item.title.substring(0, 250),
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
        currency_id: 'BRL',
        description: item.description?.substring(0, 250) || '',
        picture_url: item.picture_url || '',
        category_id: item.category_id || 'others'
      })),
      back_urls: {
        success: `${process.env.FRONTEND_URL}/pagamento/sucesso`,
        failure: `${process.env.FRONTEND_URL}/pagamento/erro`,
        pending: `${process.env.FRONTEND_URL}/pagamento/pendente`
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL}/api/pagamento/webhook`,
      statement_descriptor: 'MCELETROBIKE',
      binary_mode: true // Evita pagamentos pendentes
    };

    // Criar preferência
    const response = await new Preference(client).create({ body: preference });
    
    // Log simplificado (evitar logs sensíveis)
    console.log(`Preference created for ${items.length} items`);

    res.status(200).json({
      status: "success",
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point
    });

  } catch (error) {
    console.error('Erro no Mercado Pago:', {
      message: error.message,
      stack: error.stack,
      ...(error.response && { apiError: error.response.data }),
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      status: "error",
      message: "Erro ao criar pagamento",
      ...(process.env.NODE_ENV === 'development' && {
        detail: error.message
      })
    });
  }
});

module.exports = router;