const express = require('express');
const Product = require('../models/Product');
const mongoose = require('mongoose');
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

// Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        status: "erro", 
        mensagem: "ID do produto inválido" 
      });
    }

    const produto = await Product.findById(req.params.id);
    if (!produto) {
      return res.status(404).json({ 
        status: "erro", 
        mensagem: "Produto não encontrado" 
      });
    }
    res.json(produto);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ 
      status: "erro", 
      mensagem: "Erro no servidor ao buscar produto" 
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