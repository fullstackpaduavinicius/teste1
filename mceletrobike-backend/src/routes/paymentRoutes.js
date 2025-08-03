const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const crypto = require('crypto');
const router = express.Router();

// Configuração do Cliente Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: {
    timeout: 10000,
    idempotencyKey: `mp-${crypto.randomUUID()}`
  }
});

// Validação de Dados
const validateItems = (items) => {
  return items.every(item => 
    item.id && 
    item.nome && 
    item.preco > 0 && 
    item.quantidade > 0
  );
};

// Rota de Criação de Pagamento
router.post('/criar', async (req, res) => {
  try {
    const { itens, comprador } = req.body;

    if (!validateItems(itens)) {
      return res.status(400).json({
        status: "erro",
        mensagem: "Dados dos itens inválidos"
      });
    }

    const preference = {
      items: itens.map(item => ({
        title: item.nome.substring(0, 250),
        unit_price: parseFloat(item.preco),
        quantity: parseInt(item.quantidade),
        currency_id: 'BRL'
      })),
      payer: {
        email: comprador?.email || '',
        name: comprador?.nome || ''
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/pagamento/sucesso`,
        failure: `${process.env.FRONTEND_URL}/pagamento/erro`,
        pending: `${process.env.FRONTEND_URL}/pagamento/pendente`
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL}/api/pagamentos/notificacao`
    };

    const response = await new Preference(client).create({ body: preference });

    res.json({
      status: "sucesso",
      id: response.id,
      url_pagamento: response.init_point
    });

  } catch (error) {
    console.error('Erro no Mercado Pago:', error);
    res.status(500).json({
      status: "erro",
      mensagem: "Falha ao processar pagamento"
    });
  }
});

module.exports = router;