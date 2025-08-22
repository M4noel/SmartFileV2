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
    const pdfPart = parts.find(p => p.name === 'pdf');
    if (!pdfPart) return sendJson(res, 400, { success: false, error: 'Arquivo PDF não enviado' });

    const operation = parts.find(p => p.name === 'operation')?.data?.toString();
    const optionsStr = parts.find(p => p.name === 'options')?.data?.toString() || '{}';
    const options = JSON.parse(optionsStr);

    let result;
    switch (operation) {
      case 'rotate':
        result = await pdfEditor.rotatePages(pdfPart.data, Array.isArray(options.rotations) ? options.rotations : [{ page: 1, degrees: parseInt(options.angle) || 90 }]);
        break;
      case 'split':
        result = await (async () => {
          const partsBuffers = await pdfEditor.splitPdf(pdfPart.data, Array.isArray(options.pages) ? options.pages : []);
          const archiver = (await import('archiver')).default;
          const archive = archiver('zip', { zlib: { level: 9 } });
          res.setHeader('Content-Type', 'application/zip');
          res.setHeader('Content-Disposition', 'attachment; filename="pdf-split.zip"');
          archive.pipe(res);
          partsBuffers.forEach((buf, idx) => archive.append(buf, { name: `part-${idx + 1}.pdf` }));
          await archive.finalize();
          return null;
        })();
        if (result === null) return; // response already sent
        break;
      case 'watermark':
        result = await pdfEditor.addWatermark(pdfPart.data, options.text || 'SmartFiles', options);
        break;
      case 'removePages':
        result = await pdfEditor.removePages(pdfPart.data, Array.isArray(options.pagesToRemove) ? options.pagesToRemove : []);
        break;
      default:
        return sendJson(res, 400, { success: false, error: `Operação não suportada: ${operation}` });
    }

    if (result) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="pdf-editado.pdf"');
      res.end(Buffer.isBuffer(result) ? result : Buffer.from(result));
    }
  } catch (error) {
    console.error('Erro ao editar PDF:', error);
    return sendJson(res, 500, { success: false, error: 'Erro interno ao editar PDF', details: error.message });
  }
}


