const pdfToDocumentConverter = require('../server/utils/pdfToDocumentConverter.js');
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
    const format = parts.find(p => p.name === 'format')?.data?.toString();
    if (!pdfPart) return sendJson(res, 400, { success: false, error: 'Arquivo PDF não enviado' });
    const supported = ['txt', 'docx', 'pptx', 'html'];
    if (!supported.includes((format || '').toLowerCase())) {
      return sendJson(res, 400, { success: false, error: `Formato não suportado: ${format}. Use txt, docx, pptx ou html.` });
    }
    const converted = await pdfToDocumentConverter(pdfPart.data, format.toLowerCase());
    let contentType = 'text/plain';
    let filename = 'documento.txt';
    switch (format.toLowerCase()) {
      case 'docx': contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; filename = 'documento.docx'; break;
      case 'pptx': contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'; filename = 'apresentacao.pptx'; break;
      case 'html': contentType = 'text/html'; filename = 'documento.html'; break;
    }
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.end(converted);
  } catch (error) {
    console.error('Erro ao converter PDF para documento:', error);
    return sendJson(res, 500, { success: false, error: 'Erro interno ao converter PDF para documento', details: error.message });
  }
}


