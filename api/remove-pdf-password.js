const { PDFDocument } = require('pdf-lib');
const { setupCORS, handlePreflight, parseRequestBody, parseMultipart, sendJson } = require('./utils/multipart.js');

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
    
    // Parse multipart boundary
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) {
      return sendJson(res, 400, { success: false, error: 'Content-Type boundary not found' });
    }
    
    // Parse multipart data
    const parts = parseMultipart(buffer, boundary);
    const pdfPart = parts.find(part => part.name === 'pdf');
    const passwordPart = parts.find(part => part.name === 'password');
    
    if (!pdfPart) {
      return sendJson(res, 400, { success: false, error: 'Arquivo PDF não enviado' });
    }
    
    if (!passwordPart) {
      return sendJson(res, 400, { success: false, error: 'Senha não fornecida' });
    }
    
    const password = passwordPart.data.toString();
    
    try {
      const pdfDoc = await PDFDocument.load(pdfPart.data, { password, ignoreEncryption: true });
      const unprotectedBuffer = await pdfDoc.save();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="pdf-sem-senha.pdf"');
      res.end(Buffer.from(unprotectedBuffer));
    } catch (e) {
      return sendJson(res, 400, { success: false, error: 'Senha incorreta ou PDF não pode ser descriptografado' });
    }
    
  } catch (error) {
    console.error('Erro ao remover senha do PDF:', error);
    return sendJson(res, 500, { success: false, error: 'Erro interno ao remover senha do PDF', details: error.message });
  }
}


