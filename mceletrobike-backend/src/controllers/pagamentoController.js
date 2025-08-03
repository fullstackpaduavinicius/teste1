import mercadopago from 'mercadopago';
import { v4 as uuidv4 } from 'uuid';

// Configuração robusta do Mercado Pago
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
  options: {
    timeout: 10000, // Timeout de 10 segundos
    idempotencyKey: uuidv4() // Chave de idempotência única
  }
});

// Validação dos dados do pagamento
const validarDadosPagamento = (dados) => {
  const erros = [];
  
  if (!dados.itens || !Array.isArray(dados.itens) {
    erros.push('Lista de itens inválida ou vazia');
  } else {
    dados.itens.forEach((item, index) => {
      if (!item.nome || typeof item.nome !== 'string') {
        erros.push(`Item ${index + 1}: Nome inválido`);
      }
      if (!item.preco || isNaN(item.preco) || Number(item.preco) <= 0) {
        erros.push(`Item ${index + 1}: Preço inválido`);
      }
      if (!item.quantidade || !Number.isInteger(item.quantidade) || item.quantidade <= 0) {
        erros.push(`Item ${index + 1}: Quantidade inválida`);
      }
    });
  }

  if (!dados.nome || typeof dados.nome !== 'string' || dados.nome.trim().length < 3) {
    erros.push('Nome do comprador inválido');
  }

  return erros;
};

export const createPreference = async (req, res) => {
  try {
    // Validação dos dados de entrada
    const errosValidacao = validarDadosPagamento(req.body);
    if (errosValidacao.length > 0) {
      return res.status(400).json({
        status: 'erro',
        mensagem: 'Dados inválidos',
        erros: errosValidacao
      });
    }

    const { itens, nome, telefone, endereco } = req.body;
    const referenceId = `PED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Preparar itens para o Mercado Pago
    const itemsMP = itens.map(item => ({
      id: item.id || uuidv4(),
      title: item.nome.substring(0, 250), // Limita tamanho do título
      quantity: Number(item.quantidade),
      currency_id: 'BRL',
      unit_price: Number(item.preco),
      description: item.descricao?.substring(0, 250) || '',
      picture_url: item.imagemUrl || '',
      category_id: item.categoria || 'others'
    }));

    // Configuração da preferência
    const preference = {
      items: itemsMP,
      payer: {
        name: nome.trim(),
        ...(telefone && {
          phone: {
            area_code: telefone.replace(/\D/g, '').substring(0, 2),
            number: telefone.replace(/\D/g, '').substring(2, 11)
          }
        }),
        ...(endereco && {
          address: {
            street_name: endereco.substring(0, 250),
            zip_code: '00000000' // Necessário mas pode ser genérico
          }
        })
      },
      payment_methods: {
        excluded_payment_types: [{ id: 'atm' }], // Exclui pagamento em caixas
        installments: 12 // Número máximo de parcelas
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/pagamento/sucesso`,
        failure: `${process.env.FRONTEND_URL}/pagamento/erro`,
        pending: `${process.env.FRONTEND_URL}/pagamento/pendente`
      },
      auto_return: 'approved',
      external_reference: referenceId,
      notification_url: `${process.env.BACKEND_URL}/api/pagamento/webhook`,
      statement_descriptor: 'LOJA_ELETROBIKE',
      expires: true,
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Expira em 24h
    };

    // Criar preferência no Mercado Pago
    const response = await mercadopago.preferences.create(preference);

    // Log do pagamento criado (sem dados sensíveis)
    console.log(`Preferência criada: ${referenceId} | Status: ${response.status}`);

    // Resposta padronizada
    res.status(200).json({
      status: 'sucesso',
      id: response.body.id,
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point,
      reference_id: referenceId,
      expiracao: preference.expiration_date_to
    });

  } catch (error) {
    // Log detalhado do erro
    console.error('Erro no processamento do pagamento:', {
      mensagem: error.message,
      stack: error.stack,
      ...(error.response && { dados_erro: error.response.data }),
      timestamp: new Date().toISOString()
    });

    // Resposta de erro padronizada
    res.status(error.status || 500).json({
      status: 'erro',
      mensagem: 'Falha ao processar pagamento',
      ...(process.env.NODE_ENV === 'development' && {
        detalhes: error.message,
        ...(error.response && { resposta_api: error.response.data })
      }),
      codigo_erro: uuidv4() // ID único para rastreamento
    });
  }
};