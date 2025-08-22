const pdfEditor = require('../server/utils/pdfEditor.js');
const { setupCORS, handlePreflight, parseRequestBody, parseMultipart, sendJson } = require('./utils/multipart.js');

module.exports = async function handler(req, res) {
  setupCORS(res, process.env.CORS_ORIGIN?.split(',') || '*');
  if (handlePreflight(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }
  try {
    const bodyBuffer = await parseRequestBody(req);
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) return sendJson(res, 400, { error: 'Content-Type boundary not found' });

    const parts = parseMultipart(bodyBuffer, boundary);
    const imageParts = parts.filter(p => p.filename);
    if (imageParts.length === 0) return sendJson(res, 400, { success: false, error: 'Nenhuma imagem enviada' });

    const imageBuffers = imageParts.map(p => p.data);
    const pdfBuffer = await pdfEditor.createPdfFromImages(imageBuffers);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="imagens-convertidas.pdf"');
    res.end(pdfBuffer);
  } catch (error) {
    console.error('Erro ao criar PDF a partir de imagens:', error);
    return sendJson(res, 500, { success: false, error: 'Erro interno ao criar PDF a partir de imagens', details: error.message });
  }
}


