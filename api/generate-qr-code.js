const QRCode = require('qrcode');
const { setupCORS, handlePreflight, parseRequestBody, sendJson } = require('./utils/multipart.js');

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
      if (key && value) {
        formData[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });
    
    const { text, format } = formData;
    
    if (!text) {
      return sendJson(res, 400, { success: false, error: 'Texto ou URL é obrigatório' });
    }
    
    const supported = ['png', 'svg'];
    if (!format || !supported.includes(format.toLowerCase())) {
      return sendJson(res, 400, { success: false, error: `Formato não suportado: ${format}. Use png ou svg.` });
    }
    
    if (format.toLowerCase() === 'svg') {
      const svg = await QRCode.toString(text, { type: 'svg' });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.end(svg);
    } else {
      const img = await QRCode.toBuffer(text, { type: 'png' });
      res.setHeader('Content-Type', 'image/png');
      res.end(img);
    }
    
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    return sendJson(res, 500, { success: false, error: 'Erro interno ao gerar QR Code', details: error.message });
  }
}


