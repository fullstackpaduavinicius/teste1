const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASS },
});

async function sendMail({ to, subject, html }) {
  await transporter.sendMail({
    from: `"MC Electrobike" <${process.env.EMAIL_FROM}>`,
    to, subject, html,
  });
}

module.exports = { sendMail };
