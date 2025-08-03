const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  imageUrl: String,
});

const Produto = mongoose.model('Produto', produtoSchema);

module.exports = Produto;