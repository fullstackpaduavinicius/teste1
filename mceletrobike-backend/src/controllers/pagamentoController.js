// backend/controllers/pagamentoController.js
import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export const createPreference = async (req, res) => {
  try {
    const { itens, nome, telefone, endereco } = req.body;

    const itemsMP = itens.map(item => ({
      title: item.nome,
      quantity: item.quantidade,
      currency_id: 'BRL',
      unit_price: Number(item.preco),
    }));

    const preference = {
      items: itemsMP,
      payer: {
        name: nome,
        phone: {
          number: telefone,
        },
        address: {
          street_name: endereco,
        },
      },
      back_urls: {
        success: 'http://localhost:5173/sucesso',
        failure: 'http://localhost:5173/erro',
        pending: 'http://localhost:5173/pendente',
      },
      auto_return: 'approved',
    };

    const response = await mercadopago.preferences.create(preference);
    res.status(200).json({ id: response.body.id });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento', detalhe: error });
  }
};
