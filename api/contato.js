const nodemailer = require('nodemailer');
const { setupCORS, handlePreflight, parseRequestBody, sendJson } = require('./utils/multipart.js');

function criarTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  } else if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
    });
  }
  return null;
}

module.exports = async function handler(req, res) {
  // Configurar CORS
  setupCORS(req, res, process.env.CORS_ORIGIN?.split(',') || '*');
  
  // Handle preflight request
  if (handlePreflight(req, res)) return;
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }
  
  try {
    const buffer = await parseRequestBody(req);
    const body = buffer.toString();
    
    // Parse form data (simple key=value format)
    const formData = {};
    body.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key && value !== undefined) {
        formData[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, ' '));
      }
    });
    
    const { nome, email, assunto, mensagem } = formData;
    
    if (!nome || !email || !assunto || !mensagem) {
      return sendJson(res, 400, { success: false, error: 'Todos os campos são obrigatórios' });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return sendJson(res, 400, { success: false, error: 'Email inválido' });
    }
    
    const adminRecipient = process.env.ADMIN_EMAIL || 'murilomanoel221@gmail.com';
    const subject = `Nova mensagem de contato: ${assunto}`;
    const text = `Mensagem recebida do formulário de contato do SmartFiles:\n\n` +
                 `Nome: ${nome}\n` +
                 `Email: ${email}\n` +
                 `Assunto: ${assunto}\n` +
                 `Mensagem:\n${mensagem}\n\n` +
                 `Data: ${new Date().toISOString()}`;
    
    const transporter = criarTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"SmartFiles - Contato" <${process.env.SMTP_FROM || process.env.GMAIL_USER || 'no-reply@smartfiles.local'}>`,
          to: adminRecipient,
          subject,
          text
        });
      } catch (e) {
        console.error('Erro ao enviar email:', e);
      }
    }
    
    return sendJson(res, 200, { success: true });
    
  } catch (error) {
    console.error('Erro ao processar contato:', error);
    return sendJson(res, 500, { success: false, error: 'Erro interno ao processar mensagem' });
  }
}


