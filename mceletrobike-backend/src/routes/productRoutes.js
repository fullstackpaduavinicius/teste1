// routes/productRoutes.js (CommonJS)
const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const router = express.Router();

const toNumber = (v, def) => (Number.isFinite(Number(v)) ? Number(v) : def);
const isId = (id) => mongoose.Types.ObjectId.isValid(id);

// LISTAR (mantém)
router.get('/', async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sort = 'newest', limit } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const min = toNumber(minPrice);
    const max = toNumber(maxPrice);
    if (min != null || max != null) {
      filter.price = {};
      if (min != null) filter.price.$gte = min;
      if (max != null) filter.price.$lte = max;
    }
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    const sortMap = {
      newest: { _id: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name_az: { name: 1 },
      name_za: { name: -1 },
    };
    const lim = Math.min(1000, Math.max(1, toNumber(limit, 1000)));
    const produtos = await Product.find(filter).sort(sortMap[sort] || sortMap.newest).limit(lim);
    res.json(produtos);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ status: 'erro', mensagem: 'Falha ao buscar produtos' });
  }
});

// DETALHE (mantém)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ status: 'erro', mensagem: 'ID do produto inválido' });
    const produto = await Product.findById(id);
    if (!produto) return res.status(404).json({ status: 'erro', mensagem: 'Produto não encontrado' });
    res.json(produto);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ status: 'erro', mensagem: 'Erro no servidor ao buscar produto' });
  }
});

// CRIAR (mantém)
router.post('/', async (req, res) => {
  try {
    const payload = {
      name: String(req.body.name ?? '').slice(0, 250),
      description: String(req.body.description ?? '').slice(0, 5000),
      price: toNumber(req.body.price, 0),
      stock: toNumber(req.body.stock, 0),
      category: String(req.body.category ?? ''),
      imageUrl: String(req.body.imageUrl ?? ''),
    };
    const produto = new Product(payload);
    await produto.save();
    res.status(201).json(produto);
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    res.status(400).json({ status: 'erro', mensagem: 'Dados do produto inválidos' });
  }
});

// EDITAR (NOVO)
async function updateHandler(req, res) {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ status: 'erro', mensagem: 'ID do produto inválido' });

    const b = req.body || {};
    const payload = {
      ...(b.name != null && { name: String(b.name).slice(0, 250) }),
      ...(b.description != null && { description: String(b.description).slice(0, 5000) }),
      ...(b.price != null && { price: toNumber(b.price, 0) }),
      ...(b.stock != null && { stock: toNumber(b.stock, 0) }),
      ...(b.category != null && { category: String(b.category) }),
      ...(b.imageUrl != null && { imageUrl: String(b.imageUrl) }),
    };

    const updated = await Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ status: 'erro', mensagem: 'Produto não encontrado' });
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(400).json({ status: 'erro', mensagem: 'Erro ao atualizar produto' });
  }
}
router.put('/:id', updateHandler);
router.patch('/:id', updateHandler);

// DELETAR (mantém)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ status: 'erro', mensagem: 'ID do produto inválido' });
    const produto = await Product.findByIdAndDelete(id);
    if (!produto) return res.status(404).json({ status: 'erro', mensagem: 'Produto não encontrado' });
    res.status(200).json({ status: 'sucesso', mensagem: 'Produto deletado com sucesso', data: null });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ status: 'erro', mensagem: 'Erro no servidor ao deletar produto' });
  }
});

module.exports = router;
