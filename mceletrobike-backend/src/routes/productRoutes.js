const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const produtos = await Product.find();
    res.json(produtos);
  } catch (error) {
    res.status(500).json({
      status: "erro",
      mensagem: "Falha ao buscar produtos"
    });
  }
});

// Adicionar novo produto
router.post('/', async (req, res) => {
  try {
    const produto = new Product(req.body);
    await produto.save();
    res.status(201).json(produto);
  } catch (error) {
    res.status(400).json({
      status: "erro",
      mensagem: "Dados do produto inválidos"
    });
  }
});

module.exports = router;