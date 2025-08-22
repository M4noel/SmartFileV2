const pdfToImageConverter = require('../server/utils/pdfToImageConverter.js');
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
    const pdfPart = parts.find(p => p.name === 'pdf');
    const format = parts.find(p => p.name === 'format')?.data?.toString() || 'jpeg';

    if (!pdfPart) return sendJson(res, 400, { success: false, error: 'Arquivo PDF não enviado' });

    const supported = ['jpeg', 'png', 'webp'];
    if (!supported.includes(format.toLowerCase())) {
      return sendJson(res, 400, { success: false, error: `Formato não suportado: ${format}. Use jpeg, png ou webp.` });
    }

    const images = await pdfToImageConverter(pdfPart.data, 'pdf', format.toLowerCase());
    const archiver = (await import('archiver')).default;
    const archive = archiver('zip', { zlib: { level: 9 } });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="pdf-imagens.zip"');
    archive.pipe(res);

    for (const image of images) {
      archive.append(image.buffer, { name: `page-${image.pageNumber}.${format.toLowerCase()}` });
    }

    await archive.finalize();
  } catch (error) {
    console.error('Erro ao converter PDF para imagens:', error);
    return sendJson(res, 500, { success: false, error: 'Erro interno ao converter PDF para imagens', details: error.message });
  }
}


