const jwt = require('jsonwebtoken');

function authCustomer(req, res, next) {
  const token = req.cookies?.cust_token;
  if (!token) return res.status(401).json({ error: 'Não autenticado' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.customerId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Sessão inválida/expirada' });
  }
}

module.exports = { authCustomer };
