const { convertDocument, detectFormat, SUPPORTED_INPUT_FORMATS, SUPPORTED_OUTPUT_FORMATS } = require('../server/utils/documentConverter.js');
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

    const inputFormat = parts.find(p => p.name === 'inputFormat')?.data?.toString();
    const outputFormat = parts.find(p => p.name === 'outputFormat')?.data?.toString();
    const quality = parseInt(parts.find(p => p.name === 'quality')?.data?.toString() || '80', 10);

    const detectedInputFormat = inputFormat || await detectFormat(filePart.data, filePart.filename || 'arquivo');

    if (!SUPPORTED_INPUT_FORMATS.includes(detectedInputFormat?.toLowerCase())) {
      return sendJson(res, 400, { success: false, error: `Formato de entrada não suportado: ${detectedInputFormat}` });
    }
    if (!SUPPORTED_OUTPUT_FORMATS.includes((outputFormat || '').toLowerCase())) {
      return sendJson(res, 400, { success: false, error: `Formato de saída não suportado: ${outputFormat}` });
    }

    const convertedBuffer = await convertDocument(
      filePart.data,
      detectedInputFormat.toLowerCase(),
      outputFormat.toLowerCase(),
      { quality }
    );

    let contentType = 'application/octet-stream';
    let outputFilename = `documento-convertido.${outputFormat.toLowerCase()}`;
    switch (outputFormat.toLowerCase()) {
      case 'pdf': contentType = 'application/pdf'; outputFilename = 'documento.pdf'; break;
      case 'docx': contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; outputFilename = 'documento.docx'; break;
      case 'xlsx': contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; outputFilename = 'planilha.xlsx'; break;
      case 'pptx': contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'; outputFilename = 'apresentacao.pptx'; break;
      case 'txt': contentType = 'text/plain'; outputFilename = 'documento.txt'; break;
      case 'csv': contentType = 'text/csv'; outputFilename = 'dados.csv'; break;
      case 'json': contentType = 'application/json'; outputFilename = 'dados.json'; break;
      case 'xml': contentType = 'application/xml'; outputFilename = 'documento.xml'; break;
      case 'html': contentType = 'text/html'; outputFilename = 'documento.html'; break;
      case 'md': contentType = 'text/markdown'; outputFilename = 'documento.md'; break;
      case 'jpg':
      case 'jpeg': contentType = 'image/jpeg'; outputFilename = 'imagem.jpg'; break;
      case 'png': contentType = 'image/png'; outputFilename = 'imagem.png'; break;
      case 'webp': contentType = 'image/webp'; outputFilename = 'imagem.webp'; break;
      case 'tiff': contentType = 'image/tiff'; outputFilename = 'imagem.tiff'; break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
    res.end(convertedBuffer);
  } catch (error) {
    console.error('Erro ao converter documento:', error);
    return sendJson(res, 500, { success: false, error: 'Erro interno ao converter documento', details: error.message });
  }
}


