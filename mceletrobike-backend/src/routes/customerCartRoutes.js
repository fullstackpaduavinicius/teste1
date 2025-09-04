const express = require('express');
const Customer = require('../models/Customer');
const { authCustomer } = require('../middlewares/authCustomer');

const router = express.Router();

/** GET /customers/cart */
router.get('/cart', authCustomer, async (req, res) => {
  const c = await Customer.findById(req.customerId).lean();
  res.json({ cart: c?.cart || [] });
});

/** PUT /customers/cart */
router.put('/cart', authCustomer, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items inválido' });
  const c = await Customer.findById(req.customerId);
  c.cart = items.map(i => ({
    productId: String(i.productId),
    title: i.title,
    price: Number(i.price || 0),
    quantity: Number(i.quantity || 1),
  }));
  await c.save();
  res.json({ ok: true });
});

module.exports = router;
