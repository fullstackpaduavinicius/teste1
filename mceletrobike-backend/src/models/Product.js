const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 250 },
    description: { type: String, default: '', maxlength: 5000 },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    category: { type: String, default: '', index: true },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

// permite busca por nome/descrição com `q`
produtoSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.models.Produto || mongoose.model('Produto', produtoSchema);
