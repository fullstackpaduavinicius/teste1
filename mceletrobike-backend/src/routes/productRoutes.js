const express = require('express');
const Produto = require('../models/Product');

const router = express.Router();

router.get("/", async (req, res) => {
  const produtos = await Produto.find();
  res.json(produtos);
});

router.post("/", async (req, res) => {
  try {
    const novoProduto = new Produto(req.body);
    await novoProduto.save();
    res.status(201).json(novoProduto);
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar produto" });
  }
});

module.exports = router;