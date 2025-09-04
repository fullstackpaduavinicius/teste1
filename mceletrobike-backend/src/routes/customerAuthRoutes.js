const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Customer = require('../models/Customer');
const { sendMail } = require('../utils/email');

const router = express.Router();

/** Cookie cross-site (Render <-> Vercel) */
function setSessionCookie(res, sub) {
  const token = jwt.sign({ sub }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('cust_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

/** POST /customers/register */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, marketingOptIn } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Dados obrigatórios' });

    const exists = await Customer.findOne({ email });
    if (exists) return res.status(409).json({ error: 'E-mail já cadastrado' });

    const passwordHash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const unsubscribeToken = crypto.randomBytes(24).toString('hex');

    const c = await Customer.create({
      name, email, phone, passwordHash,
      marketingOptIn: !!marketingOptIn,
      verifyToken,
      verifyTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      unsubscribeToken,
    });

    const link = `${process.env.BACKEND_URL}/customers/verify-email?token=${verifyToken}`;
    await sendMail({
      to: email,
      subject: 'Confirme seu e-mail',
      html: `
        <h2>Confirme seu e-mail</h2>
        <p>Olá, ${name}! Clique para confirmar:</p>
        <p><a href="${link}">${link}</a></p>
        <p>Se não foi você, ignore.</p>
      `,
    });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Falha ao registrar' });
  }
});

/** GET /customers/verify-email?token=... */
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  const c = await Customer.findOne({ verifyToken: token, verifyTokenExpires: { $gt: new Date() } });
  if (!c) return res.status(400).send('Token inválido ou expirado');
  c.emailVerified = true;
  c.verifyToken = undefined;
  c.verifyTokenExpires = undefined;
  await c.save();

  setSessionCookie(res, c._id.toString());
  return res.redirect(`${process.env.FRONTEND_URL}/conta?verificado=1`);
});

/** POST /customers/login */
router.post('/login', async (req, res) => {
  const { email, password, guestCart } = req.body;
  const c = await Customer.findOne({ email });
  if (!c) return res.status(401).json({ error: 'Credenciais inválidas' });

  const ok = await bcrypt.compare(password, c.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

  // Mesclar carrinho visitante → perfil
  if (Array.isArray(guestCart) && guestCart.length) {
    const map = new Map();
    [...c.cart, ...guestCart].forEach(it => {
      const k = String(it.productId);
      const exist = map.get(k);
      if (exist) exist.quantity += Number(it.quantity || 1);
      else map.set(k, { productId: k, title: it.title, price: Number(it.price || 0), quantity: Number(it.quantity || 1) });
    });
    c.cart = Array.from(map.values());
    await c.save();
  }

  setSessionCookie(res, c._id.toString());
  res.json({ ok: true, user: { name: c.name, email: c.email, marketingOptIn: c.marketingOptIn } });
});

/** POST /customers/logout */
router.post('/logout', (req, res) => {
  res.clearCookie('cust_token', { httpOnly: true, sameSite: 'none', secure: true, path: '/' });
  res.json({ ok: true });
});

/** GET /customers/me */
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.cust_token;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const c = await Customer.findById(payload.sub).lean();
    if (!c) return res.status(401).json({ error: 'Inválido' });
    res.json({ user: { name: c.name, email: c.email, marketingOptIn: c.marketingOptIn, emailVerified: c.emailVerified }, cart: c.cart });
  } catch {
    res.status(401).json({ error: 'Inválido' });
  }
});

/** GET /customers/unsubscribe?token=... */
router.get('/unsubscribe', async (req, res) => {
  const c = await Customer.findOne({ unsubscribeToken: req.query.token });
  if (!c) return res.status(400).send('Token inválido');
  c.marketingOptIn = false;
  await c.save();
  res.send('Descadastrado com sucesso.');
});

module.exports = router;
