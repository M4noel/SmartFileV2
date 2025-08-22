const ocrProcessor = require('../server/utils/ocrProcessor.js');
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
    const filePart = parts.find(p => p.filename);
    if (!filePart) return sendJson(res, 400, { success: false, error: 'Nenhum arquivo enviado' });

    const language = parts.find(p => p.name === 'language')?.data?.toString() || 'por';
    const outputFormat = parts.find(p => p.name === 'outputFormat')?.data?.toString();

    const ocrResult = await ocrProcessor(filePart.data, language);
    if (outputFormat === 'json') {
      return sendJson(res, 200, ocrResult);
    } else {
      res.setHeader('Content-Type', 'text/plain');
      res.end(ocrResult.text);
    }
  } catch (error) {
    console.error('Erro ao processar OCR:', error);
    return sendJson(res, 500, { success: false, error: 'Erro interno ao processar OCR', details: error.message });
  }
}


