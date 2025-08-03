const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const crypto = require('crypto');
require('dotenv').config();

const router = express.Router();

// Configuração robusta do cliente MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { 
    timeout: 10000, // Timeout aumentado
    idempotencyKey: `mp-${crypto.randomUUID()}` // ID único mais seguro
  }
});

// Middleware de validação aprimorado
const validarDadosPagamento = (req, res, next) => {
  const { produtos } = req.body;
  
  if (!produtos || !Array.isArray(produtos)) {
    return res.status(400).json({ 
      status: "400",
      error: "requisicao_invalida",
      message: "Lista de produtos inválida",
      causa: [{ 
        codigo: "400001", 
        descricao: "O campo 'produtos' deve ser um array válido",
        recuperavel: true
      }]
    });
  }

  if (produtos.length === 0) {
    return res.status(400).json({
      status: "400",
      error: "carrinho_vazio",
      message: "O carrinho não pode estar vazio",
      causa: [{
        codigo: "400002",
        descricao: "Adicione itens ao carrinho antes de prosseguir",
        recuperavel: true
      }]
    });
  }

  // Validação detalhada de cada produto
  const errosProdutos = produtos.map((produto, index) => {
    const erros = [];
    
    if (!produto.id || typeof produto.id !== 'string') {
      erros.push({
        campo: "id",
        problema: "ID do produto ausente ou inválido",
        codigo: "400010"
      });
    }

    if (!produto.nome || typeof produto.nome !== 'string') {
      erros.push({
        campo: "nome",
        problema: "Nome do produto ausente ou inválido",
        codigo: "400011"
      });
    }

    if (!produto.preco || isNaN(produto.preco)) {
      erros.push({
        campo: "preco",
        problema: "Preço do produto ausente ou inválido",
        codigo: "400012"
      });
    } else if (produto.preco <= 0) {
      erros.push({
        campo: "preco",
        problema: "Preço deve ser maior que zero",
        codigo: "400013"
      });
    }

    return erros.length > 0 ? { item: index, erros } : null;
  }).filter(Boolean);

  if (errosProdutos.length > 0) {
    return res.status(400).json({
      status: "400",
      error: "dados_produto_invalidos",
      message: "Dados de produtos inválidos",
      causa: errosProdutos
    });
  }

  next();
};

// Rota para criar preferência de pagamento
router.post('/criar_preferencia', validarDadosPagamento, async (req, res) => {
  try {
    const { produtos, comprador } = req.body;

    // Preparar itens no formato esperado pelo MercadoPago
    const itens = produtos.map(produto => ({
      id: produto.id,
      title: produto.nome.substring(0, 250), // Limita tamanho do título
      unit_price: parseFloat(produto.preco),
      quantity: parseInt(produto.quantidade) || 1,
      currency_id: 'BRL',
      description: produto.descricao?.substring(0, 250) || '',
      picture_url: produto.imagemUrl || '',
      category_id: produto.categoria || 'eletronics'
    }));

    // Configuração das URLs de retorno
    const urlBase = process.env.FRONTEND_URL;
    const urlsRetorno = {
      success: `${urlBase}/pagamento/sucesso`,
      failure: `${urlBase}/pagamento/erro`,
      pending: `${urlBase}/pagamento/pendente`
    };

    // Configuração completa da preferência
    const preferencia = {
      items: itens,
      back_urls: urlsRetorno,
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [{ id: 'atm' }], // Exclui caixas eletrônicos
        excluded_payment_methods: [],
        installments: 12, // Número máximo de parcelas
        default_installments: 1
      },
      notification_url: `${process.env.BACKEND_URL}/api/pagamento/webhook`,
      external_reference: `pedido_${Date.now()}`,
      statement_descriptor: 'ELETROBIKE',
      date_of_expiration: new Date(Date.now() + 3600000 * 24).toISOString(), // Expira em 24h
      metadata: {
        cliente: comprador?.email || 'anonimo',
        origem: 'site_eletrobike'
      }
    };

    // Criar preferência no MercadoPago
    const resposta = await new Preference(client).create({ body: preferencia });

    // Resposta padronizada
    res.json({
      status: "200",
      sucesso: true,
      id: resposta.id,
      url_pagamento: process.env.NODE_ENV === 'development' 
        ? resposta.sandbox_init_point 
        : resposta.init_point,
      data_criacao: new Date().toISOString(),
      expira_em: preferencia.date_of_expiration
    });

  } catch (erro) {
    console.error('Erro no Mercado Pago:', {
      mensagem: erro.message,
      stack: erro.stack,
      dados: erro.response?.data,
      timestamp: new Date().toISOString()
    });

    // Tratamento detalhado de erros
    const status = erro.status || 500;
    const codigoErro = erro.cause?.[0]?.code || '500000';
    
    res.status(status).json({ 
      status: status.toString(),
      sucesso: false,
      error: "erro_processamento_pagamento",
      message: "Falha ao criar pagamento",
      causa: [{
        codigo: codigoErro,
        descricao: erro.message || "Erro desconhecido",
        ...(erro.response?.data && { detalhes: erro.response.data })
      }],
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;