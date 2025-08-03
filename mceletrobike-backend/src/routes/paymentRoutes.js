const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const router = express.Router();

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: {
    timeout: 10000,
    idempotencyKey: `mp-${Date.now()}`
  }
});

router.post('/create_preference', async (req, res) => {
  try {
    const { items } = req.body;

    const preference = {
      items: items.map(item => ({
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
      notification_url: `${process.env.BACKEND_URL}/api/pagamento/notificacao`
    };

    const response = await new Preference(client).create({ body: preference });

    res.json({
      status: "success",
      id: response.id,
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point
    });

  } catch (error) {
    console.error('Mercado Pago Error:', error);
    res.status(500).json({
      status: "error",
      message: "Payment processing failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;