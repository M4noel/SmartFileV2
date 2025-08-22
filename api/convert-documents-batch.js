const path = require('path');
const { convertDocument, detectFormat, SUPPORTED_OUTPUT_FORMATS } = require('../server/utils/documentConverter.js');
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
    const fileParts = parts.filter(p => p.filename);
    const outputFormat = parts.find(p => p.name === 'outputFormat')?.data?.toString() || '';
    const quality = parseInt(parts.find(p => p.name === 'quality')?.data?.toString() || '80', 10);

    if (!SUPPORTED_OUTPUT_FORMATS.includes(outputFormat.toLowerCase())) {
      return sendJson(res, 400, { success: false, error: `Formato de saída não suportado: ${outputFormat}` });
    }

    const archiver = (await import('archiver')).default;
    const archive = archiver('zip', { zlib: { level: 9 } });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="documentos-convertidos.zip"');
    archive.pipe(res);

    for (const file of fileParts) {
      try {
        const detectedInputFormat = await detectFormat(file.data, file.filename || 'arquivo');
        const convertedBuffer = await convertDocument(
          file.data,
          detectedInputFormat.toLowerCase(),
          outputFormat.toLowerCase(),
          { quality }
        );
        const nameWithoutExt = path.basename(file.filename, path.extname(file.filename));
        archive.append(convertedBuffer, { name: `${nameWithoutExt}.${outputFormat.toLowerCase()}` });
      } catch (fileError) {
        console.error(`Erro ao converter arquivo ${file.filename}:`, fileError);
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error('Erro ao converter documentos em lote:', error);
    return sendJson(res, 500, { success: false, error: 'Erro interno ao converter documentos em lote', details: error.message });
  }
}


