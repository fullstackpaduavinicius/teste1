const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail', // ou outro provedor
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS
  }
});

// POST /register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email já cadastrado' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    email,
    password: hashedPassword,
    confirmed: false
  });
  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const confirmLink = `${process.env.FRONTEND_URL}/confirmar/${token}`;

  await transporter.sendMail({
    from: `"MC ELECTROBIKE" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Confirmação de Conta",
    html: `<p>Confirme sua conta clicando no link: <a href="${confirmLink}">${confirmLink}</a></p>`
  });

  res.status(201).json({ message: 'Usuário criado. Confirme sua conta por e-mail.' });
});

// GET /confirm/:token
router.get('/confirm/:token', async (req, res) => {
  try {
    const { userId } = jwt.verify(req.params.token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(userId, { confirmed: true });
    res.redirect(`${process.env.FRONTEND_URL}/login?confirmado=1`);
  } catch (err) {
    res.status(400).json({ message: 'Token inválido ou expirado' });
  }
});

// POST /login (com confirmação)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Usuário não encontrado' });
  if (!user.confirmed) return res.status(403).json({ message: 'Confirme seu e-mail antes de entrar.' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Senha inválida' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

module.exports = router;
