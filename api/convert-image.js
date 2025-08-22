const imageConverter = require('../server/utils/imageConverter.js');
const { setupCORS, handlePreflight, parseRequestBody, parseMultipart, sendJson } = require('./utils/multipart.js');

module.exports = async function handler(req, res) {
  setupCORS(req, res, process.env.CORS_ORIGIN?.split(',') || '*');
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
    const imagePart = parts.find(p => p.name === 'image');
    if (!imagePart) return sendJson(res, 400, { error: 'Nenhum arquivo enviado' });

    const format = parts.find(p => p.name === 'format')?.data?.toString() || 'jpeg';
    const quality = parseInt(parts.find(p => p.name === 'quality')?.data?.toString() || '80', 10);

    const supported = ['jpeg', 'jpg', 'png', 'webp', 'tiff'];
    if (!supported.includes(format.toLowerCase())) {
      return sendJson(res, 400, { success: false, error: `Formato não suportado: ${format}` });
    }

    const converted = await imageConverter(imagePart.data, format, { quality });

    const ct = format.toLowerCase() === 'png' ? 'image/png'
      : format.toLowerCase() === 'webp' ? 'image/webp'
      : format.toLowerCase() === 'tiff' ? 'image/tiff'
      : 'image/jpeg';

    res.setHeader('Content-Type', ct);
    res.end(converted);
  } catch (error) {
    console.error('Erro ao converter imagem:', error);
    return sendJson(res, 500, { success: false, error: 'Erro interno ao converter imagem', details: error.message });
  }
}


