const express = require('express');
const { MercadoPagoConfig, Preference, Webhook } = require('mercadopago');
const router = express.Router();

// Production-Ready Mercado Pago Configuration
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: {
    timeout: 20000,
    idempotencyKey: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    trackingId: 'mc-eletrobike'
  }
});

// Strict Item Validation
const validateItems = (items) => {
  if (!Array.isArray(items)) return false;
  if (items.length === 0 || items.length > 100) return false;
  
  return items.every(item => (
    typeof item.id === 'string' && item.id.length <= 50 &&
    typeof item.title === 'string' && item.title.length <= 100 &&
    typeof item.unit_price === 'number' && item.unit_price >= 0.5 && item.unit_price <= 100000 &&
    Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 999 &&
    (!item.description || typeof item.description === 'string') &&
    (!item.picture_url || typeof item.picture_url === 'string')
  ));
};

// Create Payment Preference
router.post('/create_preference', async (req, res) => {
  // Set CORS headers explicitly
  res.header('Access-Control-Allow-Origin', req.headers.origin || process.env.FRONTEND_URL);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-Request-ID, Content-Type, Authorization');

  // Production Credentials Check
  if (process.env.NODE_ENV === 'production' && process.env.MP_ACCESS_TOKEN.includes('TEST-')) {
    return res.status(500).json({
      status: "error",
      message: "Invalid payment configuration"
    });
  }

  try {
    const { items, payer } = req.body;

    // Enhanced Validation
    if (!validateItems(items)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid items format",
        details: {
          requirements: {
            id: "string (max 50 chars)",
            title: "string (max 100 chars)",
            unit_price: "number (0.5-100000)",
            quantity: "integer (1-999)"
          }
        }
      });
    }

    // Production Preference Configuration
    const preferenceConfig = {
      items: items.map(item => ({
        id: item.id.substring(0, 50),
        title: item.title.substring(0, 100),
        unit_price: parseFloat(item.unit_price.toFixed(2)),
        quantity: parseInt(item.quantity),
        currency_id: 'BRL',
        description: item.description ? item.description.substring(0, 250) : undefined,
        picture_url: item.picture_url || undefined,
        category_id: 'bikes'
      })),
      payer: payer ? {
        name: payer.name?.substring(0, 50),
        surname: payer.surname?.substring(0, 50),
        email: payer.email,
        phone: payer.phone ? {
          area_code: payer.phone.area_code?.toString().substring(0, 5),
          number: payer.phone.number?.toString().substring(0, 15)
        } : undefined,
        address: payer.address ? {
          zip_code: payer.address.zip_code?.toString().substring(0, 10),
          street_name: payer.address.street_name?.substring(0, 100),
          street_number: payer.address.street_number?.toString().substring(0, 10)
        } : undefined
      } : undefined,
      payment_methods: {
        excluded_payment_types: [{ id: 'atm' }],
        installments: 12,
        default_installments: 1
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/payment/success`,
        failure: `${process.env.FRONTEND_URL}/payment/failure`,
        pending: `${process.env.FRONTEND_URL}/payment/pending`
      },
      auto_return: 'all',
      notification_url: `${process.env.BACKEND_URL}/api/pagamento/webhook`,
      statement_descriptor: 'MCELETROBIKE',
      binary_mode: true,
      expires: false,
      external_reference: `order-${Date.now()}`,
      metadata: {
        app: 'mc-eletrobike',
        version: '1.0.0'
      }
    };

    const preference = await new Preference(client).create({ body: preferenceConfig });

    // Secure Logging
    console.log(`Payment preference created`, {
      reference: preferenceConfig.external_reference,
      items_count: items.length,
      amount: preferenceConfig.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0),
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      status: "success",
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: process.env.NODE_ENV === 'development' ? preference.sandbox_init_point : undefined
    });

  } catch (error) {
    console.error('Payment Error:', {
      timestamp: new Date().toISOString(),
      errorType: 'MercadoPagoAPI',
      statusCode: error.response?.status,
      requestData: {
        items: req.body.items?.map(i => ({ id: i.id, title: i.title })),
        payer: req.body.payer ? { email: req.body.payer.email } : null
      },
      errorDetails: {
        message: error.message,
        ...(error.response?.data && { apiError: error.response.data })
      }
    });

    res.status(error.response?.status || 500).json({
      status: "error",
      message: "Payment processing failed",
      ...(process.env.NODE_ENV === 'development' && {
        detail: error.message,
        ...(error.response?.data && { apiError: error.response.data })
      })
    });
  }
});

// Webhook Handler (Production)
router.post('/webhook', async (req, res) => {
  try {
    const webhook = new Webhook(process.env.MP_WEBHOOK_SECRET);
    const paymentData = webhook.parse(req);

    console.log('Received payment notification:', {
      paymentId: paymentData.id,
      status: paymentData.status,
      amount: paymentData.transaction_amount,
      timestamp: new Date().toISOString()
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      headers: req.headers,
      body: req.body
    });

    res.status(400).send('Invalid webhook');
  }
});

module.exports = router;