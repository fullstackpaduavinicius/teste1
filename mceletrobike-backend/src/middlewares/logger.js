const fs = require('fs');
const path = require('path');

// Cria a pasta 'logs' se não existir
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Configura o arquivo de log
const logStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'), 
  { flags: 'a' } // 'a' = append (adiciona novas linhas)
);

module.exports = (req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };
  
  logStream.write(JSON.stringify(logData) + '\n');
  next();
};