import pdfEditor, { createPdfFromText } from '../server/utils/pdfEditor.js';
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
    const type = parts.find(p => p.name === 'type')?.data?.toString();
    const content = parts.find(p => p.name === 'content')?.data?.toString();
    const title = parts.find(p => p.name === 'title')?.data?.toString();
    const pageSize = parts.find(p => p.name === 'pageSize')?.data?.toString();
    const fontSize = parts.find(p => p.name === 'fontSize')?.data?.toString();
    const tableDataPart = parts.find(p => p.name === 'tableData')?.data?.toString();
    const tableHeadersPart = parts.find(p => p.name === 'tableHeaders')?.data?.toString();
    const imagePart = parts.find(p => p.name === 'image');

    let pdfBuffer;
    switch ((type || '').toLowerCase()) {
      case 'text':
        if (!content) return sendJson(res, 400, { success: false, error: 'Conteúdo de texto é obrigatório' });
        pdfBuffer = await createPdfFromText(content, { title, pageSize, fontSize });
        break;
      case 'image':
        if (!imagePart) return sendJson(res, 400, { success: false, error: 'Imagem é obrigatória' });
        pdfBuffer = await pdfEditor.createPdfFromImages([imagePart.data], { pageSize });
        break;
      case 'table':
        if (!tableDataPart) return sendJson(res, 400, { success: false, error: 'Dados da tabela são obrigatórios' });
        pdfBuffer = await pdfEditor.createPdfFromTable(JSON.parse(tableDataPart), tableHeadersPart ? JSON.parse(tableHeadersPart) : [], { title, pageSize });
        break;
      default:
        return sendJson(res, 400, { success: false, error: `Tipo não suportado: ${type}` });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="documento.pdf"');
    res.end(pdfBuffer);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return sendJson(res, 500, { success: false, error: 'Erro interno ao gerar PDF', details: error.message });
  }
}


