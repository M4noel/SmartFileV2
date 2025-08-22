const imageResizer = require('../server/utils/imageResizer.js');
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
    if (!imagePart) return sendJson(res, 400, { success: false, error: 'Nenhuma imagem enviada' });

    const width = parseInt(parts.find(p => p.name === 'width')?.data?.toString() || '0', 10);
    const height = parseInt(parts.find(p => p.name === 'height')?.data?.toString() || '0', 10);
    const fit = parts.find(p => p.name === 'fit')?.data?.toString() || 'inside';
    const position = parts.find(p => p.name === 'position')?.data?.toString() || 'center';
    const withoutEnlargement = (parts.find(p => p.name === 'withoutEnlargement')?.data?.toString() || 'false') === 'true';

    if ((!width || width <= 0) && (!height || height <= 0)) {
      return sendJson(res, 400, { success: false, error: 'Dimensões inválidas. Pelo menos uma dimensão deve ser um número positivo.' });
    }

    const resizedImage = await imageResizer(imagePart.data, width || null, height || null, { fit, position, withoutEnlargement });
    res.setHeader('Content-Type', 'image/jpeg');
    res.end(resizedImage);
  } catch (error) {
    console.error('Erro ao redimensionar imagem:', error);
    return sendJson(res, 500, { success: false, error: 'Erro interno ao redimensionar imagem', details: error.message });
  }
}


